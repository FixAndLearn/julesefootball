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
  evidenceUrls: z.array(z.string().url()).optional().default([]),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const serviceRoleConfigured = hasServiceRoleKey();
    const client = serviceRoleConfigured ? adminSupabase : supabase;

    const { data: dispute, error } = await client
      .from("disputes")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !dispute) {
      return NextResponse.json({ dispute: null, evidenceList: [] });
    }

    let evidenceList: any[] = [];
    try {
      if (dispute.resolution_notes && dispute.resolution_notes.startsWith("[")) {
        evidenceList = JSON.parse(dispute.resolution_notes);
      }
    } catch (e) {
      evidenceList = [];
    }

    return NextResponse.json({ dispute, evidenceList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    // If evidence URLs were provided, record them
    if (parsed.data.evidenceUrls && parsed.data.evidenceUrls.length > 0) {
      const { data: dispute } = await primaryClient
        .from("disputes")
        .select("id")
        .eq("order_id", parsed.data.orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (dispute) {
        const initialEvidence = parsed.data.evidenceUrls.map((url, i) => ({
          url,
          title: `Initial Dispute Proof #${i + 1}`,
          description: "Submitted when dispute was opened",
          uploaderId: user.id,
          uploaderRole: "Buyer",
          uploadedAt: new Date().toISOString(),
        }));

        await primaryClient
          .from("disputes")
          .update({
            resolution_notes: JSON.stringify(initialEvidence),
          })
          .eq("id", dispute.id);
      }
    }

    return NextResponse.json({ success: true, message: "Dispute opened. Funds held until resolution." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
