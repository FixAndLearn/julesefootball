import { createAdminClient } from "@/lib/supabase/admin";
import { PaymentService } from "@/services/paymentService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Use admin client for webhook processing
    const adminSupabase = createAdminClient();
    const paymentService = new PaymentService(adminSupabase);

    await paymentService.processCallback(body);

    // Safaricom expects a 200 OK with ResultCode 0 acknowledgment
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback accepted and processed successfully",
    });
  } catch (error: any) {
    console.error("M-Pesa callback processing error:", error);
    // Always return 200 OK to prevent Safaricom retry floods, but log error internally
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: "Internal callback handler error",
    });
  }
}
