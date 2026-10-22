import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/notifications/telegramAlert";

export const dynamic = "force-dynamic";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "efootballmaket_bot";
const GROUP_URL = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || "https://t.me/efootballmarket254";

/**
 * GET /api/telegram/link
 * Returns the Telegram connection status of the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("telegram_chat_id, telegram_username, telegram_phone")
      .eq("id", user.id)
      .maybeSingle();

    const isConnected = Boolean(profile?.telegram_chat_id);
    const deepLink = `https://t.me/${BOT_USERNAME}?start=link_${user.id}`;

    return NextResponse.json({
      isConnected,
      telegramUsername: profile?.telegram_username || null,
      telegramChatId: profile?.telegram_chat_id ? `...${profile.telegram_chat_id.slice(-4)}` : null,
      deepLink,
      groupUrl: GROUP_URL,
      botUsername: `@${BOT_USERNAME}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/telegram/link
 * Disconnects Telegram or dispatches a test ping.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "test";

    const adminSupabase = createAdminClient();

    if (action === "unlink") {
      await adminSupabase
        .from("profiles")
        .update({
          telegram_chat_id: null,
          telegram_username: null,
          telegram_phone: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        message: "Telegram notifications disconnected successfully.",
      });
    }

    if (action === "test") {
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("telegram_chat_id, username")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.telegram_chat_id) {
        return NextResponse.json(
          { error: "No Telegram account connected. Tap 'Connect Telegram' first." },
          { status: 400 }
        );
      }

      const res = await sendTelegramMessage(
        `🔔 <b>eFootballMarket Test Alert</b> ⚽\n\n` +
        `Hello <b>@${profile.username || "Trader"}</b>!\n` +
        `Your Telegram notifications are active and connected with sub-second latency.\n\n` +
        `You will receive instant alerts right here whenever someone purchases your squad or sends an offer!`,
        {
          chatId: profile.telegram_chat_id,
          inlineButtons: [
            [{ text: "👥 Join Official Group (@efootballmarket254)", url: GROUP_URL }],
            [{ text: "⚽ Seller Dashboard", url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke"}/dashboard/seller` }],
          ],
        }
      );

      if (!res.success) {
        return NextResponse.json({ error: res.error || "Failed to deliver test message" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Test ping sent to your Telegram successfully! Check your Telegram app.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
