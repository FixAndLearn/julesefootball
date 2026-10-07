import { isUserAdmin } from "@/lib/security/adminAuth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;

    // Check admin via user_roles or email
    const { data: userRole } = await primaryClient
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .in("role_id", ["admin", "super_admin"])
      .limit(1);

    const isAdmin = Boolean((userRole && userRole.length > 0) || isUserAdmin(user.email));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { data: withdrawals, error } = await primaryClient
      .from("seller_withdrawals")
      .select("*, seller:profiles(id, username, email, phone_number, available_balance)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ withdrawals: withdrawals || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const updateWithdrawalSchema = z.object({
  withdrawalId: z.string().uuid(),
  status: z.enum(["pending", "processing", "completed", "rejected"]),
  failureReason: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;

    const { data: userRole } = await primaryClient
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .in("role_id", ["admin", "super_admin"])
      .limit(1);

    const isAdmin = Boolean((userRole && userRole.length > 0) || isUserAdmin(user.email));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const json = await req.json();
    const parsed = updateWithdrawalSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parsed.error.format() }, { status: 400 });
    }

    const { withdrawalId, status, failureReason } = parsed.data;

    // Fetch withdrawal
    const { data: withdrawal, error: fetchError } = await primaryClient
      .from("seller_withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found." }, { status: 404 });
    }

    // If rejected, refund the seller's available_balance
    if (status === "rejected" && withdrawal.status !== "rejected") {
      const { data: sellerProf } = await primaryClient
        .from("profiles")
        .select("available_balance")
        .eq("id", withdrawal.seller_id)
        .single();

      const currentBal = Number(sellerProf?.available_balance || 0);
      await primaryClient
        .from("profiles")
        .update({
          available_balance: currentBal + Number(withdrawal.amount),
          updated_at: new Date().toISOString(),
        })
        .eq("id", withdrawal.seller_id);
    }

    // Update withdrawal record
    const { error: updateError } = await primaryClient
      .from("seller_withdrawals")
      .update({
        status,
        reviewed_by: user.id,
        failure_reason: failureReason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) throw updateError;

    // Notify seller
    try {
      await primaryClient.from("notifications").insert({
        recipient_id: withdrawal.seller_id,
        type: "order_update",
        title: status === "completed" ? "M-Pesa Withdrawal Completed" : `Withdrawal ${status.toUpperCase()}`,
        message:
          status === "completed"
            ? `Your M-Pesa withdrawal of KES ${withdrawal.amount} has been processed and disbursed.`
            : `Your withdrawal request of KES ${withdrawal.amount} was ${status}.${failureReason ? ` Reason: ${failureReason}` : ""}`,
        action_url: "/seller/earnings",
        is_read: false,
      });
    } catch (e) {
      console.warn("Failed to notify seller:", e);
    }

    return NextResponse.json({ success: true, message: `Withdrawal marked as ${status}.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
