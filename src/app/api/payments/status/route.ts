import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PaymentService } from "@/services/paymentService";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");
    const orderId = searchParams.get("orderId");

    if (!checkoutRequestId && !orderId) {
      return NextResponse.json(
        { error: "Missing checkoutRequestId or orderId" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : createServerSupabaseClient();
    const paymentService = new PaymentService(primaryClient);
    const payment = await paymentService.getPaymentStatus(
      checkoutRequestId || undefined,
      orderId || undefined
    );

    if (!payment) {
      if (orderId) {
        const { data: order } = await primaryClient
          .from("orders")
          .select("id, status")
          .eq("id", orderId)
          .single();

        if (order && order.status !== "payment_pending") {
          return NextResponse.json({
            status: "completed",
            receiptNumber: "CONFIRMED",
            resultCode: 0,
            resultDesc: "Payment verified in escrow",
          });
        }
      }

      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const orderObj = (payment as any).order;
    const isCompleted =
      payment.status === "completed" ||
      (orderObj && orderObj.status !== "payment_pending");

    return NextResponse.json({
      status: isCompleted ? "completed" : payment.status,
      receiptNumber: payment.mpesa_receipt_number || (isCompleted ? "CONFIRMED" : null),
      resultCode: isCompleted ? 0 : payment.result_code,
      resultDesc: isCompleted ? "Payment completed successfully" : payment.result_desc,
    });
  } catch (error: any) {
    console.error("Status check route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
