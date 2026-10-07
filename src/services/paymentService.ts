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
   * Checks the real-time status of a payment by its CheckoutRequestID.
   */
  async getPaymentStatus(checkoutRequestId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from("payments")
      .select("*")
      .eq("checkout_request_id", checkoutRequestId)
      .single();

    if (error || !data) {
      return null;
    }

    // If still pending and UnifiedPay is enabled, actively verify status
    if (data.status === "pending" && mpesaClient.isUnifiedPay()) {
      const liveStatus = await mpesaClient.checkUnifiedPayStatus(checkoutRequestId);
      if (liveStatus && liveStatus.isSuccess && liveStatus.receiptNumber) {
        await this.supabase.rpc("handle_mpesa_payment_success", {
          p_checkout_request_id: checkoutRequestId,
          p_receipt_number: liveStatus.receiptNumber,
          p_amount: liveStatus.amount || data.amount,
          p_raw_callback: liveStatus as unknown as Record<string, unknown>,
        });

        // Fetch refreshed record
        const { data: updated } = await this.supabase
          .from("payments")
          .select("*")
          .eq("checkout_request_id", checkoutRequestId)
          .single();

        return (updated as Payment) || (data as Payment);
      } else if (liveStatus && liveStatus.resultCode !== 0 && liveStatus.resultCode !== 1032) {
        // Failed
        await this.supabase
          .from("payments")
          .update({
            status: "failed",
            result_code: liveStatus.resultCode,
            result_desc: liveStatus.resultDesc,
          })
          .eq("checkout_request_id", checkoutRequestId);
      }
    }

    return data as Payment;
  }

  /**
   * Processes the official Daraja or UnifiedPay callback webhook.
   */
  async processCallback(body: AnyCallbackBody): Promise<void> {
    const parsed = mpesaClient.parseCallback(body);

    if (parsed.isSuccess && parsed.receiptNumber) {
      // Execute security definer atomic function
      const { error } = await this.supabase.rpc("handle_mpesa_payment_success", {
        p_checkout_request_id: parsed.checkoutRequestId,
        p_receipt_number: parsed.receiptNumber,
        p_amount: parsed.amount || 0,
        p_raw_callback: body as unknown as Record<string, unknown>,
      });

      if (error) {
        console.error("handle_mpesa_payment_success RPC error:", error);
        throw error;
      }
    } else {
      // Update payment record as failed
      await this.supabase
        .from("payments")
        .update({
          status: "failed",
          result_code: parsed.resultCode,
          result_desc: parsed.resultDesc,
          raw_callback: body as unknown as Record<string, unknown>,
        })
        .eq("checkout_request_id", parsed.checkoutRequestId);
    }
  }
}
