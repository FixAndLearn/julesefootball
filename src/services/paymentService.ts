import { mpesaClient } from "@/lib/mpesa/client";
import { AnyCallbackBody, StkCallbackBody } from "@/lib/mpesa/types";
import { Payment } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export class PaymentService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Initiates STK push for an order.
   */
  async initiateOrderPayment(orderId: string, rawPhoneNumber: string): Promise<{ checkoutRequestId: string; customerMessage: string }> {
    const { data: order, error: orderError } = await this.supabase
      .from("orders")
      .select("*, listing:listings(title)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found.");
    }

    if (order.status !== "payment_pending") {
      throw new Error(`Order is not in payment_pending status (current: ${order.status})`);
    }

    const normalizedPhone = mpesaClient.normalizePhoneNumber(rawPhoneNumber);

    // Call Daraja STK Push API
    const response = await mpesaClient.initiateStkPush({
      phoneNumber: normalizedPhone,
      amount: order.total_amount,
      orderNumber: order.order_number,
      description: `Payment for ${order.listing?.title || "eFootball Account"}`,
    });

    // Record pending payment entry
    const { error: insertError } = await this.supabase
      .from("payments")
      .insert({
        order_id: orderId,
        payment_method: "mpesa",
        phone_number: normalizedPhone,
        amount: order.total_amount,
        currency: order.currency || "KES",
        merchant_request_id: response.MerchantRequestID,
        checkout_request_id: response.CheckoutRequestID,
        status: "pending",
      });

    if (insertError) {
      console.error("Failed to log payment record:", insertError);
    }

    return {
      checkoutRequestId: response.CheckoutRequestID,
      customerMessage: response.CustomerMessage,
    };
  }

  /**
   * Securely marks a payment, order, escrow account, and listing as confirmed.
   */
  async markPaymentSuccessful(
    paymentId: string,
    receiptNumber: string,
    amount: number,
    rawCallback: any
  ): Promise<void> {
    const { data: payment } = await this.supabase
      .from("payments")
      .select("*, order:orders(*)")
      .eq("id", paymentId)
      .single();

    if (!payment) return;

    if (payment.status === "completed") return;

    // 1. First attempt to call the RPC handle_mpesa_payment_success
    try {
      const { error: rpcError } = await this.supabase.rpc("handle_mpesa_payment_success", {
        p_checkout_request_id: payment.checkout_request_id || payment.merchant_request_id || paymentId,
        p_receipt_number: receiptNumber,
        p_amount: amount,
        p_raw_callback: rawCallback,
      });

      if (!rpcError) {
        console.log(`Payment ${paymentId} successfully confirmed via RPC`);
        return;
      }
      console.warn("RPC returned error, applying direct database update:", rpcError);
    } catch (e) {
      console.warn("RPC invocation error, applying direct database update:", e);
    }

    // 2. Direct transactional updates using administrative client
    const now = new Date().toISOString();

    // Update payment record
    await this.supabase
      .from("payments")
      .update({
        status: "completed",
        mpesa_receipt_number: receiptNumber,
        raw_callback: rawCallback,
        completed_at: now,
      })
      .eq("id", paymentId);

    if (payment.order_id) {
      // Update order status to escrow_locked
      await this.supabase
        .from("orders")
        .update({
          status: "escrow_locked",
          updated_at: now,
        })
        .eq("id", payment.order_id);

      // Update escrow account state
      await this.supabase
        .from("escrow_accounts")
        .update({
          escrow_state: "waiting_for_seller",
          updated_at: now,
        })
        .eq("order_id", payment.order_id);

      // Update listing status to in_escrow
      if (payment.order?.listing_id) {
        await this.supabase
          .from("listings")
          .update({
            status: "in_escrow",
            updated_at: now,
          })
          .eq("id", payment.order.listing_id);
      }

      // Update seller's escrow balance and create notification
      if (payment.order?.seller_id) {
        const netAmount =
          Number(payment.order.seller_net_amount) ||
          Number(payment.order.total_amount ? Math.round(payment.order.total_amount * 0.95) : amount);

        const { data: sellerProfile } = await this.supabase
          .from("profiles")
          .select("escrow_balance")
          .eq("id", payment.order.seller_id)
          .single();

        const currentEscrow = Number(sellerProfile?.escrow_balance || 0);
        await this.supabase
          .from("profiles")
          .update({
            escrow_balance: currentEscrow + netAmount,
            updated_at: now,
          })
          .eq("id", payment.order.seller_id);

        await this.supabase.from("notifications").insert({
          recipient_id: payment.order.seller_id,
          type: "payment_received",
          title: "Payment Secured in Escrow!",
          message: `Buyer paid KES ${amount}. Net KES ${netAmount} is locked in your escrow balance. Deliver credentials to complete.`,
          action_url: `/orders/${payment.order_id}`,
          is_read: false,
        });
      }
    }
  }

  /**
   * Checks the real-time status of a payment by its CheckoutRequestID, MerchantRequestID, or OrderID.
   */
  async getPaymentStatus(identifier?: string, orderId?: string): Promise<Payment | null> {
    let query = this.supabase.from("payments").select("*, order:orders(*)");

    if (orderId) {
      query = query.eq("order_id", orderId);
    } else if (identifier) {
      query = query.or(
        `checkout_request_id.eq.${identifier},merchant_request_id.eq.${identifier},id.eq.${identifier}`
      );
    } else {
      return null;
    }

    const { data: payments, error } = await query.order("created_at", { ascending: false });

    if (error || !payments || payments.length === 0) {
      return null;
    }

    const data = payments[0] as Payment;

    if (data.status === "completed") {
      return data;
    }

    // If associated order is already escrow_locked or beyond, payment was successfully settled!
    if (
      data.order &&
      (data.order.status === "escrow_locked" ||
        data.order.status === "seller_delivered" ||
        data.order.status === "completed")
    ) {
      await this.supabase
        .from("payments")
        .update({
          status: "completed",
          mpesa_receipt_number: data.mpesa_receipt_number || "CONFIRMED",
          completed_at: new Date().toISOString(),
        })
        .eq("id", data.id);
      data.status = "completed";
      return data;
    }

    // If still pending and UnifiedPay is enabled, actively verify status
    if (data.status === "pending" && mpesaClient.isUnifiedPay()) {
      const idsToTry = Array.from(
        new Set([identifier, data.checkout_request_id, data.merchant_request_id])
      ).filter(Boolean) as string[];

      for (const transId of idsToTry) {
        const liveStatus = await mpesaClient.checkUnifiedPayStatus(transId);
        if (liveStatus && liveStatus.isSuccess) {
          const receipt = liveStatus.receiptNumber || `CONFIRMED_${Date.now()}`;
          await this.markPaymentSuccessful(
            data.id,
            receipt,
            liveStatus.amount || data.amount,
            liveStatus
          );

          // Fetch refreshed record
          const { data: updated } = await this.supabase
            .from("payments")
            .select("*, order:orders(*)")
            .eq("id", data.id)
            .single();

          return (updated as Payment) || data;
        } else if (
          liveStatus &&
          (liveStatus.resultCode === 1037 ||
            liveStatus.resultDesc?.toLowerCase().includes("cancelled") ||
            liveStatus.resultDesc?.toLowerCase().includes("failed"))
        ) {
          // Explicit failure confirmed by Safaricom / UnifiedPay
          await this.supabase
            .from("payments")
            .update({
              status: "failed",
              result_code: liveStatus.resultCode,
              result_desc: liveStatus.resultDesc,
            })
            .eq("id", data.id);

          data.status = "failed";
          data.result_desc = liveStatus.resultDesc;
        }
      }
    }

    return data;
  }

  /**
   * Processes the official Daraja or UnifiedPay callback webhook.
   */
  async processCallback(body: AnyCallbackBody | any): Promise<void> {
    console.log("Processing webhook callback:", JSON.stringify(body));
    const parsed = mpesaClient.parseCallback(body);

    const unifiedTransId =
      body.transaction_request_id ||
      body.TransactionRequestID ||
      parsed.merchantRequestId ||
      "";
    const checkoutId =
      body.CheckoutRequestID ||
      body.checkoutRequestId ||
      parsed.checkoutRequestId ||
      "";
    const orderRef =
      body.TransactionReference ||
      body.account_reference ||
      body.reference ||
      "";

    let paymentId: string | null = null;
    let fallbackAmount = parsed.amount || 0;

    // 1. Try finding payment by IDs
    const searchConditions = [];
    if (checkoutId) searchConditions.push(`checkout_request_id.eq.${checkoutId}`);
    if (unifiedTransId) {
      searchConditions.push(`merchant_request_id.eq.${unifiedTransId}`);
      searchConditions.push(`checkout_request_id.eq.${unifiedTransId}`);
    }

    if (searchConditions.length > 0) {
      const { data: found } = await this.supabase
        .from("payments")
        .select("id, amount, order_id")
        .or(searchConditions.join(","));

      if (found && found.length > 0) {
        paymentId = found[0].id;
        fallbackAmount = found[0].amount;
      }
    }

    // 2. If not found, try matching by Order Reference
    if (!paymentId && orderRef) {
      const { data: order } = await this.supabase
        .from("orders")
        .select("id, payments(id, amount)")
        .eq("order_number", orderRef)
        .single();

      if (order && order.payments && (order.payments as any).length > 0) {
        paymentId = (order.payments as any)[0].id;
        fallbackAmount = (order.payments as any)[0].amount;
      }
    }

    if (parsed.isSuccess && parsed.receiptNumber) {
      if (paymentId) {
        await this.markPaymentSuccessful(
          paymentId,
          parsed.receiptNumber,
          parsed.amount || fallbackAmount,
          body
        );
      } else {
        // Fallback to RPC
        await this.supabase.rpc("handle_mpesa_payment_success", {
          p_checkout_request_id: checkoutId || unifiedTransId,
          p_receipt_number: parsed.receiptNumber,
          p_amount: parsed.amount || fallbackAmount,
          p_raw_callback: body as unknown as Record<string, unknown>,
        });
      }
    } else if (paymentId) {
      await this.supabase
        .from("payments")
        .update({
          status: "failed",
          result_code: parsed.resultCode,
          result_desc: parsed.resultDesc,
          raw_callback: body as unknown as Record<string, unknown>,
        })
        .eq("id", paymentId);
    }
  }
}
