import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PaymentService } from "@/services/paymentService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const stkPushSchema = z.object({
  orderId: z.string().uuid(),
  phoneNumber: z.string().min(9, "Valid M-Pesa phone number required"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = stkPushSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment request", details: parsed.error.format() }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;
    const paymentService = new PaymentService(primaryClient);
    const result = await paymentService.initiateOrderPayment(
      parsed.data.orderId,
      parsed.data.phoneNumber
    );

    return NextResponse.json({
      success: true,
      checkoutRequestId: result.checkoutRequestId,
      message: result.customerMessage,
    });
  } catch (error: any) {
    console.error("STK Push error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
