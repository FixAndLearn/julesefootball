import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/notifications/telegramAlert";

export const dynamic = "force-dynamic";

const evidenceSchema = z.object({
  orderId: z.string().uuid(),
  evidenceUrl: z.string().url(),
  title: z.string().optional().default("Dispute Evidence Screenshot"),
  description: z.string().optional().default("Uploaded evidence for order dispute"),
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
    const parsed = evidenceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid evidence payload", details: parsed.error.format() }, { status: 400 });
    }

    const { orderId, evidenceUrl, title, description } = parsed.data;

    const adminSupabase = createAdminClient();
    const serviceRoleConfigured = hasServiceRoleKey();
    const client = serviceRoleConfigured ? adminSupabase : supabase;

    // Fetch order to verify permission
    const { data: order, error: orderError } = await client
      .from("orders")
      .select("id, order_number, buyer_id, seller_id, status, total_amount, listing:listings(title)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "Unauthorized to submit evidence for this order." }, { status: 403 });
    }

    const uploaderRole = isBuyer ? "Buyer" : "Seller";

    // Fetch active dispute
    const { data: dispute } = await client
      .from("disputes")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Append evidence into dispute description or resolution_notes as structured JSON log
    const evidenceItem = {
      url: evidenceUrl,
      title,
      description,
      uploaderId: user.id,
      uploaderRole,
      uploadedAt: new Date().toISOString(),
    };

    if (dispute) {
      let currentEvidence: any[] = [];
      try {
        if (dispute.resolution_notes && dispute.resolution_notes.startsWith("[")) {
          currentEvidence = JSON.parse(dispute.resolution_notes);
        }
      } catch (e) {
        currentEvidence = [];
      }

      currentEvidence.push(evidenceItem);

      await client
        .from("disputes")
        .update({
          resolution_notes: JSON.stringify(currentEvidence),
          updated_at: new Date().toISOString(),
        })
        .eq("id", dispute.id);
    }

    // Also record a system message in the order chat so both parties and admin see it
    try {
      const { data: conv } = await client
        .from("conversations")
        .select("id")
        .eq("order_id", orderId)
        .single();

      if (conv) {
        await client.from("messages").insert({
          conversation_id: conv.id,
          sender_id: user.id,
          message_text: `📷 [Dispute Evidence Uploaded by ${uploaderRole}]: ${title} - ${evidenceUrl}`,
          message_type: "system",
        });
      }
    } catch (e) {
      // quiet fallback
    }

    // Alert admin via Telegram
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";
      const rawListing = (order as any)?.listing;
      const listingTitle = Array.isArray(rawListing)
        ? rawListing[0]?.title
        : rawListing?.title;

      const tgMsg =
        `🚨 <b>NEW EVIDENCE UPLOADED FOR DISPUTE</b>\n\n` +
        `📦 <b>Order #${order.order_number}</b>: ${listingTitle || "eFootball Squad"}\n` +
        `👤 <b>Uploader</b>: ${uploaderRole} (${user.id.slice(0, 8)})\n` +
        `📝 <b>Title</b>: ${title}\n` +
        `🔗 <b>Evidence URL</b>: ${evidenceUrl}\n\n` +
        `👉 <a href="${appUrl}/admin?tab=disputes">Open Admin Dispute Locker</a>`;

      await sendTelegramMessage(tgMsg);
    } catch (e) {
      // quiet fallback
    }

    return NextResponse.json({
      success: true,
      message: "Evidence registered successfully.",
      evidence: evidenceItem,
    });
  } catch (err: any) {
    console.error("Dispute evidence upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit evidence." }, { status: 500 });
  }
}
