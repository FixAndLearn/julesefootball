import { NextRequest, NextResponse } from "next/server";
import { isTelegramConfigured, sendTelegramMessage, dispatchAdminTelegramAlert } from "@/lib/notifications/telegramAlert";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;

  const maskedToken = token ? `${token.substring(0, 6)}...${token.slice(-4)}` : null;
  const maskedChatId = chatId ? `${chatId.substring(0, 3)}***${chatId.slice(-2)}` : null;

  return NextResponse.json({
    isConfigured: isTelegramConfigured(),
    botTokenConfigured: Boolean(token),
    chatIdConfigured: Boolean(chatId),
    maskedToken,
    maskedChatId,
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
    const { token, chatId, message, testType } = body;

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
      `✅ <b>Status:</b> Telegram bot is CONNECTED & ACTIVE!\n` +
      `📱 <b>Admin Recipient:</b> Brian Okibo (+254 794 400 365)\n` +
      `🛡️ <b>M-Pesa Escrow Till:</b> <code>1572931</code>\n` +
      `⏰ <b>EAT Time:</b> ${time} EAT\n\n` +
      `All 11 marketplace events (payments, listings, disputes, credentials) will now buzz directly to this chat in real time.`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";

    const result = await sendTelegramMessage(testContent, {
      token,
      chatId,
      parseMode: "HTML",
      inlineButtons: [
        [{ text: "🛡️ Open Admin Hub", url: `${appUrl}/admin` }],
        [{ text: "⚽ Browse Marketplace", url: `${appUrl}/marketplace` }],
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
