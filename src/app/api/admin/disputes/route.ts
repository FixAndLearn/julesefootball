import { isUserAdmin } from "@/lib/security/adminAuth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/notifications/telegramAlert";
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
    const client = serviceRoleConfigured ? adminSupabase : supabase;

    const { data: userRole } = await client
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .in("role_id", ["admin", "super_admin"])
      .limit(1);

    const isAdmin = Boolean((userRole && userRole.length > 0) || isUserAdmin(user.email));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { data: disputes, error } = await client
      .from("disputes")
      .select(
        "*, order:orders(id, order_number, total_amount, seller_net_amount, currency, status, created_at, listing:listings(id, title, platform, overall_team_strength), buyer:profiles!buyer_id(id, username, phone_number), seller:profiles!seller_id(id, username, phone_number, available_balance, escrow_balance))"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Parse evidence list from resolution_notes for each dispute
    const enrichedDisputes = (disputes || []).map((d: any) => {
      let evidenceList: any[] = [];
      try {
        if (d.resolution_notes && d.resolution_notes.startsWith("[")) {
          evidenceList = JSON.parse(d.resolution_notes);
        }
      } catch (e) {
        evidenceList = [];
      }

      const rawOrder = Array.isArray(d.order) ? d.order[0] : d.order;
      const order = rawOrder
        ? {
            ...rawOrder,
            listing: Array.isArray(rawOrder.listing) ? rawOrder.listing[0] : rawOrder.listing,
            buyer: Array.isArray(rawOrder.buyer) ? rawOrder.buyer[0] : rawOrder.buyer,
            seller: Array.isArray(rawOrder.seller) ? rawOrder.seller[0] : rawOrder.seller,
          }
        : null;

      return {
        ...d,
        order,
        evidenceList,
      };
    });

    return NextResponse.json({ disputes: enrichedDisputes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const resolveDisputeSchema = z.object({
  disputeId: z.string().uuid(),
  orderId: z.string().uuid(),
  action: z.enum(["release_to_seller", "refund_buyer", "dismiss"]),
  notes: z.string().min(3, "Resolution notes required"),
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
    const client = serviceRoleConfigured ? adminSupabase : supabase;

    const { data: userRole } = await client
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
    const parsed = resolveDisputeSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid resolution payload", details: parsed.error.format() }, { status: 400 });
    }

    const { disputeId, orderId, action, notes } = parsed.data;

    // Fetch order
    const { data: order, error: orderErr } = await client
      .from("orders")
      .select("*, seller:profiles!seller_id(id, available_balance, escrow_balance)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const newDisputeStatus =
      action === "release_to_seller"
        ? "resolved_seller_release"
        : action === "refund_buyer"
        ? "resolved_buyer_refund"
        : "closed_dismissed";

    const newOrderStatus = action === "release_to_seller" ? "completed" : "refunded";
    const newEscrowState = action === "release_to_seller" ? "completed" : "refunded";

    // 1. Update dispute
    await client
      .from("disputes")
      .update({
        status: newDisputeStatus,
        assigned_to: user.id,
        resolution_notes: notes,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", disputeId);

    // 2. Update order and escrow state
    await client
      .from("orders")
      .update({
        status: newOrderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await client
      .from("escrow_accounts")
      .update({
        escrow_state: newEscrowState,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    // 3. Financial settlement if releasing to seller
    if (action === "release_to_seller") {
      const netAmount = Number(order.seller_net_amount || order.total_amount);
      const sellerId = order.seller_id;

      if (sellerId) {
        const { data: sellerProf } = await client
          .from("profiles")
          .select("available_balance, completed_sales_count")
          .eq("id", sellerId)
          .single();

        const currentBal = Number(sellerProf?.available_balance || 0);
        const currentSales = Number(sellerProf?.completed_sales_count || 0);

        await client
          .from("profiles")
          .update({
            available_balance: currentBal + netAmount,
            completed_sales_count: currentSales + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sellerId);
      }
    }

    // 4. Send Telegram resolution notice
    try {
      const tgMsg =
        `⚖️ <b>DISPUTE ARBITRATION RESOLVED</b>\n\n` +
        `📦 <b>Order #${order.order_number}</b>\n` +
        `👨‍⚖️ <b>Arbitrator</b>: ${user.email} (Brian Okibo)\n` +
        `🏁 <b>Verdict</b>: <b>${action.toUpperCase().replace(/_/g, " ")}</b>\n` +
        `📝 <b>Resolution Notes</b>: ${notes}\n` +
        `💰 <b>Amount</b>: KES ${order.total_amount}`;

      await sendTelegramMessage(tgMsg);
    } catch (e) {
      // quiet fallback
    }

    return NextResponse.json({
      success: true,
      message: `Dispute resolved successfully (${action}).`,
    });
  } catch (error: any) {
    console.error("Dispute resolution error:", error);
    return NextResponse.json({ error: error.message || "Failed to resolve dispute." }, { status: 500 });
  }
}
