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
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: payment.status,
      receiptNumber: payment.mpesa_receipt_number,
      resultCode: payment.result_code,
      resultDesc: payment.result_desc,
    });
  } catch (error: any) {
    console.error("Status check route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
