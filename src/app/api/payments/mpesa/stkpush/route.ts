import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PaymentService } from "@/services/paymentService";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getIdempotencyResult, setIdempotencyResult } from "@/lib/security/rateLimiter";
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

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const rateCheck = checkRateLimit(`stkpush:${user.id}:${ip}`, 6, 60000);

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many payment requests. Please wait a moment before retrying." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = stkPushSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment request", details: parsed.error.format() }, { status: 400 });
    }

    const idempotencyKey =
      req.headers.get("x-idempotency-key") ||
      `stkpush:${parsed.data.orderId}:${parsed.data.phoneNumber}`;
    const cached = getIdempotencyResult(idempotencyKey, 30000);
    if (cached) {
      return NextResponse.json({ ...cached, idempotent: true });
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;
    const paymentService = new PaymentService(primaryClient);
    const result = await paymentService.initiateOrderPayment(
      parsed.data.orderId,
      parsed.data.phoneNumber
    );

    const payload = {
      success: true,
      checkoutRequestId: result.checkoutRequestId,
      message: result.customerMessage,
    };
    setIdempotencyResult(idempotencyKey, payload);

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("STK Push error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
