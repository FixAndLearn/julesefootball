import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { broadcastListingToTelegramChannel } from "@/lib/notifications/telegramAlert";

export const dynamic = "force-dynamic";

const TARGET_GROUP = process.env.TELEGRAM_CHANNEL_ID || "@efootballmarket254";

/**
 * GET /api/telegram/broadcast
 * Returns inventory metrics and last broadcast capabilities.
 */
export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const { count, error } = await adminSupabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null);

    return NextResponse.json({
      targetGroup: TARGET_GROUP,
      publishedListingsCount: count || 0,
      error: error?.message || null,
      instructions: "Send POST with { broadcastAll: true } or { listingId: '...' } to post to @efootballmarket254",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/telegram/broadcast
 * Broadcasts accounts with pictures, strength, price, and direct links to @efootballmarket254.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { listingId, broadcastAll, limit = 20, targetChannel = TARGET_GROUP } = body;

    const adminSupabase = createAdminClient();

    // Case 1: Broadcast single listing by ID
    if (listingId) {
      const { data: listing, error } = await adminSupabase
        .from("listings")
        .select("*, images:listing_images(*)")
        .eq("id", listingId)
        .single();

      if (error || !listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }

      const res = await broadcastListingToTelegramChannel(listing, targetChannel);
      return NextResponse.json({
        success: res.success,
        messageId: res.messageId,
        channel: res.channelUsed,
        error: res.error,
      });
    }

    // Case 2: Broadcast all or recent published listings
    const fetchLimit = Math.min(Number(limit) || 20, 50);
    const { data: listings, error: fetchErr } = await adminSupabase
      .from("listings")
      .select("*, images:listing_images(*)")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(fetchLimit);

    if (fetchErr || !listings || listings.length === 0) {
      return NextResponse.json({
        success: false,
        error: fetchErr?.message || "No active published listings found in marketplace.",
      });
    }

    const results: Array<{ id: string; title: string; success: boolean; error?: string }> = [];

    for (const item of listings) {
      try {
        const bRes = await broadcastListingToTelegramChannel(item, targetChannel);
        results.push({
          id: item.id,
          title: item.title,
          success: bRes.success,
          error: bRes.error,
        });

        // Delay 500ms between messages to comply with Telegram API rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (postErr: any) {
        results.push({
          id: item.id,
          title: item.title,
          success: false,
          error: postErr.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      totalProcessed: results.length,
      successCount,
      targetChannel,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
