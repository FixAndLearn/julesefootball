import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EscrowService } from "@/services/escrowService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const disputeSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum([
    "credentials_invalid",
    "wrong_account_details",
    "account_recovered_by_seller",
    "missing_players_or_coins",
    "unauthorized_changes",
    "seller_unresponsive",
    "other",
  ]),
  description: z.string().min(10, "Please provide a detailed description of the dispute"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const json = await req.json();
    const parsed = disputeSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid dispute submission", details: parsed.error.format() }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;
    const escrowService = new EscrowService(primaryClient);
    await escrowService.openDispute(
      parsed.data.orderId,
      user.id,
      parsed.data.reason,
      parsed.data.description
    );

    return NextResponse.json({ success: true, message: "Dispute opened. Funds held until resolution." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
