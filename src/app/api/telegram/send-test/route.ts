import { NextRequest, NextResponse } from "next/server";
import {
  isTelegramConfigured,
  sendTelegramMessage,
  dispatchAdminTelegramAlert,
  getTelegramBotInfo,
  getTelegramWebhookInfo,
  setTelegramWebhook,
} from "@/lib/notifications/telegramAlert";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;

  const maskedToken = token ? `${token.substring(0, 6)}...${token.slice(-4)}` : null;
  const maskedChatId = chatId ? `${chatId.substring(0, 3)}***${chatId.slice(-2)}` : null;

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
    maskedToken,
    maskedChatId,
    bot: botData,
    webhook: webhookData,
    webhookUrl: `${APP_URL}/api/telegram/webhook`,
    setupGuide: {
      botFather: "1. Message @BotFather on Telegram -> Send /newbot -> Copy API Token",
      userInfoBot: "2. Message @userinfobot on Telegram -> Copy your numeric Id",
      envLocal: "3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
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
