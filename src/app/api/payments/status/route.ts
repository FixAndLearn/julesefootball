import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PaymentService } from "@/services/paymentService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const paymentService = new PaymentService(supabase);
    const payment = await paymentService.getPaymentStatus(checkoutRequestId);

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
