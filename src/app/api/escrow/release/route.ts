import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EscrowService } from "@/services/escrowService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const releaseSchema = z.object({
  orderId: z.string().uuid(),
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
    const parsed = releaseSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const escrowService = new EscrowService(supabase);
    await escrowService.confirmAndRelease(parsed.data.orderId, user.id);

    return NextResponse.json({ success: true, message: "Escrow funds released to seller successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
