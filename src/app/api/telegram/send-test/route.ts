import { NextRequest, NextResponse } from "next/server";
import {
  isTelegramConfigured,
  sendTelegramMessage,
  dispatchAdminTelegramAlert,
  getTelegramBotInfo,
  getTelegramWebhookInfo,
  setTelegramWebhook,
  broadcastListingToTelegramChannel,
} from "@/lib/notifications/telegramAlert";
import { isUserAdmin } from "@/lib/security/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: callerProfile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isUserAdmin(user.email, callerProfile?.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
    const channelId = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_DEALS_CHANNEL;

    const maskedToken = token ? `${token.substring(0, 6)}...${token.slice(-4)}` : null;
    const maskedChatId = chatId ? `${chatId.substring(0, 3)}***${chatId.slice(-2)}` : null;
    const maskedChannel = channelId
      ? channelId.startsWith("@")
        ? channelId
        : `${channelId.substring(0, 5)}***${channelId.slice(-3)}`
      : null;

  let botData = null;
  let webhookData = null;

  if (token) {
    try {
      const [bRes, wRes] = await Promise.all([
        getTelegramBotInfo(token),
        getTelegramWebhookInfo(token),
      ]);
      botData = bRes.bot || null;
      webhookData = wRes.info || null;
    } catch {
      // Non-blocking
    }
  }

    return NextResponse.json({
      isConfigured: isTelegramConfigured(),
      botTokenConfigured: Boolean(token),
      chatIdConfigured: Boolean(chatId),
      channelConfigured: Boolean(channelId),
      maskedToken,
      maskedChatId,
      maskedChannel,
      bot: botData,
      webhook: webhookData,
      webhookUrl: `${APP_URL}/api/telegram/webhook`,
      setupGuide: {
        botFather: "1. Message @BotFather on Telegram -> Send /newbot -> Copy API Token",
        userInfoBot: "2. Message @userinfobot on Telegram -> Copy your numeric Id",
        dealsChannel: "3. Add @efootballmaket_bot as Admin to your Telegram Deals Channel",
        envLocal: "4. Set TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID & TELEGRAM_CHANNEL_ID in .env.local",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: callerProfile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isUserAdmin(user.email, callerProfile?.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { token, chatId, message, testType, action } = body;

    const activeToken = token || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;

    // Action: Register Webhook to enable 2-way bot replies
    if (action === "register_webhook") {
      if (!activeToken) {
        return NextResponse.json({
          success: false,
          error: "Telegram Bot Token is required to activate webhook.",
        });
      }

      const webhookUrl = `${APP_URL}/api/telegram/webhook`;
      const reg = await setTelegramWebhook(webhookUrl, activeToken);
      const bot = await getTelegramBotInfo(activeToken);

      return NextResponse.json({
        success: reg.success,
        webhookUrl,
        bot: bot.bot,
        message: reg.success
          ? "Webhook registered successfully! The bot will now auto-reply to messages in Telegram."
          : reg.error || "Failed to register webhook with Telegram.",
      });
    }

    // Action: Broadcast listing to Telegram Deals Channel
    if (action === "broadcast_listing") {
      const listingId = body.listingId;
      const targetChannel = body.channel || body.customChannel;
      if (!listingId) {
        return NextResponse.json({ success: false, error: "listingId is required to broadcast." });
      }

      const adminSupabase = createAdminClient();
      const { data: listing, error: fetchErr } = await adminSupabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (fetchErr || !listing) {
        return NextResponse.json({ success: false, error: "Listing not found in database." });
      }

      const bResult = await broadcastListingToTelegramChannel(listing, targetChannel);
      return NextResponse.json(bResult);
    }

    // Action: Test broadcast a sample squad deal card to public channel
    if (action === "test_deals_channel") {
      const targetChannel = body.channel || body.customChannel;
      const sampleListing = {
        id: "sample-preview",
        title: "🔥 Epic Booster Messi (106) + Cruyff (105) 3150 OVR",
        collective_strength: "3150",
        price: 3500,
        platform: "Android / iOS",
        images: ["https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop"],
      };

      const bResult = await broadcastListingToTelegramChannel(sampleListing, targetChannel);
      return NextResponse.json(bResult);
    }

    const time = new Date().toLocaleTimeString("en-KE", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (testType === "simulated_payment") {
      // Send realistic simulated M-Pesa Till 1572931 payment alert
      const result = await dispatchAdminTelegramAlert({
        eventType: "PAYMENT_RECEIVED",
        orderNumber: "EF-TEST-" + Math.floor(1000 + Math.random() * 9000),
        listingTitle: "Epic 3150 Team (Test Alert)",
        amount: 2500,
        currency: "KES",
        buyerPhone: "+254794400365",
        receiptNumber: "SLK" + Math.floor(10000000 + Math.random() * 90000000),
        details: "Telegram connection test initiated from Admin Executive Panel.",
      });

      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        chatId: result.chatId,
        error: result.error,
        testType: "simulated_payment",
      });
    }

    // Default test notification
    const testContent =
      message ||
      `🔔 <b>eFootballMarket Telegram Alert Test</b>\n\n` +
      `✅ <b>Status:</b> Telegram bot is CONNECTED &amp; ACTIVE!\n` +
      `📱 <b>Admin Recipient:</b> Brian Okibo (+254 794 400 365)\n` +
      `🛡️ <b>M-Pesa Escrow Till:</b> <code>1572931</code>\n` +
      `⏰ <b>EAT Time:</b> ${time} EAT\n\n` +
      `All 11 marketplace events (payments, listings, disputes, credentials) will now buzz directly to this chat in real time.`;

    const result = await sendTelegramMessage(testContent, {
      token,
      chatId,
      parseMode: "HTML",
      inlineButtons: [
        [{ text: "🛡️ Open Admin Hub", url: `${APP_URL}/admin` }],
        [{ text: "⚽ Browse Marketplace", url: `${APP_URL}/marketplace` }],
      ],
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      chatId: result.chatId,
      error: result.error,
      isConfigured: isTelegramConfigured(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch Telegram test message" },
      { status: 500 }
    );
  }
}
