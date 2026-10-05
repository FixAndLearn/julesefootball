import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EscrowService } from "@/services/escrowService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deliverSchema = z.object({
  orderId: z.string().uuid(),
  konamiEmail: z.string().email("Valid Konami ID email required"),
  konamiPassword: z.string().min(6, "Password must be at least 6 characters"),
  backupCodes: z.string().optional(),
  transferInstructions: z.string().optional(),
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
    const parsed = deliverSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid delivery data", details: parsed.error.format() }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.ip || undefined;
    const escrowService = new EscrowService(supabase);

    await escrowService.submitDelivery({
      ...parsed.data,
      sellerId: user.id,
      sellerIp: ip,
    });

    return NextResponse.json({ success: true, message: "Credentials encrypted and delivered successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
