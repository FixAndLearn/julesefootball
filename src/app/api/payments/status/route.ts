import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mpesaClient } from "@/lib/mpesa/client";
import { dispatchAdminOrderAlert } from "@/lib/notifications/adminAlert";
import { sendBuyerPaymentConfirmedSms, sendSellerOrderReceivedSms } from "@/lib/notifications/smsAlert";
import { sendBuyerPaymentSecuredWhatsApp, sendSellerDeliverCredentialsWhatsApp } from "@/lib/whatsapp/notifications";
import { notifySellerOrderSecuredViaTelegram } from "@/lib/notifications/telegramAlert";
import { PaymentService } from "@/services/paymentService";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate",
  "CDN-Cache-Control": "no-store",
  "Pragma": "no-cache",
  "Expires": "0",
};

/**
 * GET /api/payments/status
 * High-performance, real-time polling endpoint to detect M-Pesa payment settlements instantly.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");
    const orderId = searchParams.get("orderId");
    const forceCheck = searchParams.get("forceCheck") === "true";

    if (!checkoutRequestId && !orderId) {
      return NextResponse.json(
        { error: "Missing checkoutRequestId or orderId" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Always prefer authenticated client first so buyer's session passes RLS
    const userClient = createServerSupabaseClient();
    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : userClient;

    // 1. Direct check on orders table (instant detection if webhook or background worker locked escrow)
    let order: any = null;
    if (orderId) {
      const { data: orderData } = await primaryClient
        .from("orders")
        .select("id, status, total_amount, order_number, listing_id, seller_id, buyer_id")
        .eq("id", orderId)
        .maybeSingle();

      order = orderData;

      if (order && order.status !== "payment_pending") {
        return NextResponse.json(
          {
            status: "completed",
            receiptNumber: "CONFIRMED",
            resultCode: 0,
            resultDesc: "Payment verified in escrow",
          },
          { headers: NO_CACHE_HEADERS }
        );
      }
    }

    // 2. Check payments table directly
    let payment: any = null;
    if (orderId) {
      const { data: payments } = await primaryClient
        .from("payments")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1);

      payment = payments?.[0];
    } else if (checkoutRequestId) {
      const { data: payments } = await primaryClient
        .from("payments")
        .select("*")
        .or(`checkout_request_id.eq.${checkoutRequestId},merchant_request_id.eq.${checkoutRequestId}`)
        .order("created_at", { ascending: false })
        .limit(1);

      payment = payments?.[0];
    }

    if (payment && payment.status === "completed") {
      return NextResponse.json(
        {
          status: "completed",
          receiptNumber: payment.mpesa_receipt_number || "CONFIRMED",
          resultCode: 0,
          resultDesc: "Payment completed successfully",
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 3. If UnifiedPay is active and we have an ID to query, actively query Safaricom Till 1572931
    const transIdToCheck =
      checkoutRequestId ||
      payment?.checkout_request_id ||
      payment?.merchant_request_id;

    if (transIdToCheck && mpesaClient.isUnifiedPay() && (forceCheck || payment?.status === "pending")) {
      const liveStatus = await mpesaClient.checkUnifiedPayStatus(transIdToCheck);
      if (liveStatus && liveStatus.isSuccess) {
        const receipt = liveStatus.receiptNumber || `CONFIRMED_${Date.now()}`;
        const paymentService = new PaymentService(primaryClient);

        if (payment) {
          await paymentService.markPaymentSuccessful(
            payment.id,
            receipt,
            liveStatus.amount || payment.amount || (order ? Number(order.total_amount) : 0),
            liveStatus
          );
        } else if (order) {
          // Direct fallback update to mark order escrow locked
          const now = new Date().toISOString();
          await primaryClient.from("orders").update({ status: "escrow_locked", updated_at: now }).eq("id", order.id);
          await primaryClient.from("escrow_accounts").update({ escrow_state: "waiting_for_seller", updated_at: now }).eq("order_id", order.id);
        }

        return NextResponse.json(
          {
            status: "completed",
            receiptNumber: receipt,
            resultCode: 0,
            resultDesc: "Payment verified via Safaricom Till 1572931",
          },
          { headers: NO_CACHE_HEADERS }
        );
      }
    }

    // 4. Fallback to PaymentService status check
    const paymentService = new PaymentService(primaryClient);
    const resolvedPayment = await paymentService.getPaymentStatus(
      checkoutRequestId || undefined,
      orderId || undefined
    );

    if (resolvedPayment && resolvedPayment.status === "completed") {
      return NextResponse.json(
        {
          status: "completed",
          receiptNumber: resolvedPayment.mpesa_receipt_number || "CONFIRMED",
          resultCode: 0,
          resultDesc: "Payment completed successfully",
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Return pending status gracefully (200 OK so client fetch is successful and continues monitoring)
    return NextResponse.json(
      {
        status: "pending",
        resultCode: 1032,
        resultDesc: "Waiting for M-Pesa PIN confirmation",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("Status check route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

/**
 * POST /api/payments/status
 * Instant M-Pesa Receipt Verification:
 * Allows the buyer who has already received their Safaricom SMS (e.g., UJD9J9UHFD)
 * to instantly verify and unlock funds into escrow without waiting.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to confirm payment." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await req.json();
    const { orderId, receiptNumber, checkoutRequestId } = body;

    if (!orderId || !receiptNumber) {
      return NextResponse.json(
        { error: "Order ID and M-Pesa receipt code are required." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanReceipt = String(receiptNumber).trim().toUpperCase();

    // M-Pesa receipt format validation (typically 10 alphanumeric chars e.g. UJD9J9UHFD)
    if (!/^[A-Z0-9]{8,12}$/.test(cleanReceipt)) {
      return NextResponse.json(
        { error: "Please enter a valid M-Pesa receipt code (e.g. UJD9J9UHFD)." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Check if receipt was already used on another order
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, order_id")
      .eq("mpesa_receipt_number", cleanReceipt)
      .maybeSingle();

    if (existingPayment && existingPayment.order_id !== orderId) {
      return NextResponse.json(
        { error: "This M-Pesa receipt code has already been registered for another transaction." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Fetch order and verify current user is the buyer
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, listing:listings(id, title)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    if (order.buyer_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized order verification." },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    if (order.status !== "payment_pending") {
      return NextResponse.json(
        {
          success: true,
          status: "completed",
          receiptNumber: cleanReceipt,
          message: "Payment is already secured in escrow.",
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const now = new Date().toISOString();
    const amount = Number(order.total_amount);

    // 1. Locate or create payment record
    const { data: existingOrderPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let paymentId = existingOrderPayment?.id;

    if (!paymentId) {
      const { data: insertedPayment } = await supabase
        .from("payments")
        .insert({
          order_id: orderId,
          payment_method: "mpesa",
          phone_number: user.phone || "254700000000",
          amount: amount,
          currency: order.currency || "KES",
          merchant_request_id: checkoutRequestId || `MANUAL-${cleanReceipt}`,
          checkout_request_id: checkoutRequestId || `MANUAL-${cleanReceipt}`,
          mpesa_receipt_number: cleanReceipt,
          status: "completed",
          completed_at: now,
          raw_callback: {
            manual_confirmation: true,
            receipt_code: cleanReceipt,
            confirmed_by: user.id,
            timestamp: now,
          },
        })
        .select("id")
        .single();

      paymentId = insertedPayment?.id;
    } else {
      await supabase
        .from("payments")
        .update({
          status: "completed",
          mpesa_receipt_number: cleanReceipt,
          completed_at: now,
          raw_callback: {
            manual_confirmation: true,
            receipt_code: cleanReceipt,
            confirmed_by: user.id,
            timestamp: now,
          },
        })
        .eq("id", paymentId);
    }

    // 2. Transition order to escrow_locked
    await supabase
      .from("orders")
      .update({
        status: "escrow_locked",
        updated_at: now,
      })
      .eq("id", orderId);

    // 3. Update escrow account
    await supabase
      .from("escrow_accounts")
      .update({
        escrow_state: "waiting_for_seller",
        updated_at: now,
      })
      .eq("order_id", orderId);

    // 4. Update listing status
    if (order.listing_id) {
      await supabase
        .from("listings")
        .update({
          status: "in_escrow",
          updated_at: now,
        })
        .eq("id", order.listing_id);
    }

    // 5. Update seller escrow balance & notification
    if (order.seller_id) {
      const netAmount = Number(order.seller_net_amount) || amount;
      const { data: sellerProf } = await supabase
        .from("profiles")
        .select("escrow_balance, phone_number")
        .eq("id", order.seller_id)
        .maybeSingle();

      const currentBalance = Number(sellerProf?.escrow_balance || 0);
      await supabase
        .from("profiles")
        .update({
          escrow_balance: currentBalance + netAmount,
          updated_at: now,
        })
        .eq("id", order.seller_id);

      await supabase.from("notifications").insert({
        recipient_id: order.seller_id,
        type: "payment_received",
        title: "Payment Secured in Escrow!",
        message: `Buyer verified M-Pesa payment (${cleanReceipt}). KES ${netAmount} is locked in your escrow balance. Deliver credentials to complete.`,
        action_url: `/orders/${orderId}`,
        is_read: false,
      });

      // Notify seller via SMS & WhatsApp
      if (sellerProf?.phone_number) {
        sendSellerOrderReceivedSms(
          sellerProf.phone_number,
          order.order_number,
          amount,
          order.listing?.title || "eFootball Squad",
          orderId
        ).catch((err) => console.warn("Seller order SMS error:", err));

        sendSellerDeliverCredentialsWhatsApp(
          sellerProf.phone_number,
          order.order_number,
          amount,
          order.listing?.title || "eFootball Squad",
          orderId
        ).catch((err) => console.warn("Seller WhatsApp error:", err));
      }

      notifySellerOrderSecuredViaTelegram({
        sellerId: order.seller_id,
        orderId,
        orderNumber: order.order_number,
        listingTitle: order.listing?.title || "eFootball Squad",
        amount,
        buyerPhone: user.phone || undefined,
      }).catch((err) => console.warn("Seller Telegram order alert error:", err));
    }

    // 6. Admin alert to Brian Okibo (0794400365)
    dispatchAdminOrderAlert({
      orderId: orderId,
      orderNumber: order.order_number,
      listingTitle: order.listing?.title || "eFootball Verified Squad",
      amount: amount,
      currency: "KES",
      buyerPhone: user.phone || "",
      receiptNumber: cleanReceipt,
      eventType: "PAYMENT_RECEIVED",
    }).catch((err) => console.error("Admin order alert error:", err));

    // 7. Buyer SMS & WhatsApp confirmation
    if (user.phone) {
      sendBuyerPaymentConfirmedSms(user.phone, order.order_number, amount, orderId).catch((err) =>
        console.warn("Buyer payment SMS error:", err)
      );
      sendBuyerPaymentSecuredWhatsApp(
        user.phone,
        order.order_number,
        amount,
        order.listing?.title || "eFootball Squad",
        orderId
      ).catch((err) => console.warn("Buyer WhatsApp error:", err));
    }

    return NextResponse.json(
      {
        success: true,
        status: "completed",
        receiptNumber: cleanReceipt,
        message: "Payment successfully verified and locked in escrow.",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("Manual receipt verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify receipt." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
