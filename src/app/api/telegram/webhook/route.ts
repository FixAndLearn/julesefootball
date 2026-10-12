import { NextRequest, NextResponse } from "next/server";
import {
  getTelegramBotInfo,
  getTelegramWebhookInfo,
  sendTelegramMessage,
  setTelegramWebhook,
} from "@/lib/notifications/telegramAlert";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * GET /api/telegram/webhook
 * Inspects or activates the webhook with Telegram.
 * Usage: /api/telegram/webhook?action=register
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const customToken = url.searchParams.get("token") || undefined;
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;

  if (!token) {
    return NextResponse.json({
      ok: false,
      error: "TELEGRAM_BOT_TOKEN is not configured in .env.local",
    });
  }

  // Action: Register webhook
  if (action === "register") {
    const webhookEndpoint = `${APP_URL}/api/telegram/webhook`;
    const regResult = await setTelegramWebhook(webhookEndpoint, token);
    const webhookInfo = await getTelegramWebhookInfo(token);
    const botInfo = await getTelegramBotInfo(token);

    return NextResponse.json({
      action: "register",
      success: regResult.success,
      webhookUrl: webhookEndpoint,
      description: regResult.description || regResult.error,
      bot: botInfo.bot,
      webhookInfo: webhookInfo.info,
    });
  }

  // Default: Get current bot and webhook info
  const botInfo = await getTelegramBotInfo(token);
  const webhookInfo = await getTelegramWebhookInfo(token);

  return NextResponse.json({
    ok: true,
    bot: botInfo.bot,
    webhookInfo: webhookInfo.info,
    configuredWebhookTarget: `${APP_URL}/api/telegram/webhook`,
    hint: "Send ?action=register to connect this webhook to Telegram",
  });
}

/**
 * POST /api/telegram/webhook
 * Receives incoming messages from Telegram and replies back in real time!
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body?.message || body?.edited_message;

    if (!message || !message.chat?.id) {
      // Return 200 OK to Telegram so it does not retry unknown update types
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = (message.text || "").trim();
    const senderName = message.from?.first_name || message.from?.username || "Trader";
    const senderHandle = message.from?.username ? `@${message.from.username}` : senderName;

    const time = new Date().toLocaleTimeString("en-KE", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
    });

    console.log(`[Telegram:Incoming] Message from ${senderHandle} (${chatId}): "${text}"`);

    const lower = text.toLowerCase();

    // 1. /start or /help or greetings
    if (lower === "/start" || lower === "/help" || lower === "hi" || lower === "hello") {
      const reply =
        `👋 <b>Hello ${escapeHtml(senderName)}!</b>\n\n` +
        `Welcome to the official <b>eFootballMarket Executive &amp; Alerts Bot</b>.\n\n` +
        `🆔 <b>Your Chat ID:</b> <code>${chatId}</code>\n` +
        `🛡️ <b>M-Pesa Escrow Till:</b> <code>1572931</code> (EFootballMarket)\n` +
        `📱 <b>Admin Hotline:</b> +254 794 400 365\n\n` +
        `✅ <b>Bot Status:</b> Active &amp; Ready!\n` +
        `All platform transactions, payments, credentials, and disputes are pushed to this chat automatically.\n\n` +
        `<b>Available Commands:</b>\n` +
        `• /status — Check platform &amp; escrow health\n` +
        `• /till — Safaricom Till 1572931 instructions\n` +
        `• /admin — Open Executive Admin Panel\n` +
        `• /ping — Sub-second latency ping test`;

      await sendTelegramMessage(reply, {
        chatId,
        inlineButtons: [
          [{ text: "🛡️ Open Admin Panel", url: `${APP_URL}/admin` }],
          [{ text: "⚽ Browse Marketplace", url: `${APP_URL}/marketplace` }],
          [{ text: "💬 WhatsApp CEO Line", url: `https://wa.me/254794400365` }],
        ],
      });

      return NextResponse.json({ ok: true });
    }

    // 2. /status command
    if (lower === "/status") {
      const reply =
        `📊 <b>eFootballMarket Platform Status</b>\n\n` +
        `🟢 <b>System Health:</b> 100% Operational\n` +
        `🛡️ <b>Escrow Till:</b> <code>1572931</code> (Lipa na M-Pesa Buy Goods)\n` +
        `🔐 <b>Vault Encryption:</b> AES-256-GCM Secure\n` +
        `⏱️ <b>Nairobi Time:</b> ${time} EAT\n` +
        `🆔 <b>Your Chat ID:</b> <code>${chatId}</code>\n\n` +
        `Ready for automated notifications.`;

      await sendTelegramMessage(reply, {
        chatId,
        inlineButtons: [[{ text: "🛡️ Admin Dashboard", url: `${APP_URL}/admin` }]],
      });

      return NextResponse.json({ ok: true });
    }

    // 3. /till or /payment command
    if (lower === "/till" || lower === "/payment" || lower === "till") {
      const reply =
        `💰 <b>Official M-Pesa Till Details</b>\n\n` +
        `🏪 <b>Buy Goods Till:</b> <code>1572931</code>\n` +
        `🏷️ <b>Store Name:</b> <code>EFootballMarket</code>\n` +
        `🛡️ <b>Escrow Protection:</b> Guaranteed\n\n` +
        `<b>Payment Steps:</b>\n` +
        `1. Open M-Pesa menu ➔ Lipa na M-Pesa\n` +
        `2. Select <b>Buy Goods and Services</b>\n` +
        `3. Enter Till: <code>1572931</code>\n` +
        `4. Enter Amount &amp; PIN\n` +
        `5. Enter M-Pesa receipt on efootballmarket.co.ke to auto-release squad!`;

      await sendTelegramMessage(reply, { chatId });
      return NextResponse.json({ ok: true });
    }

    // 4. /admin command
    if (lower === "/admin") {
      const reply =
        `🏛️ <b>eFootballMarket Executive Administration</b>\n\n` +
        `Manage listings, review escrow transactions, approve payouts, and verify user accounts in the executive suite.`;

      await sendTelegramMessage(reply, {
        chatId,
        inlineButtons: [[{ text: "🛡️ Open Admin Portal", url: `${APP_URL}/admin` }]],
      });
      return NextResponse.json({ ok: true });
    }

    // 5. /ping command
    if (lower === "/ping") {
      const reply = `🏓 <b>Pong!</b> Connection verified. Your Chat ID is <code>${chatId}</code>.`;
      await sendTelegramMessage(reply, { chatId });
      return NextResponse.json({ ok: true });
    }

    // 6. Generic conversational fallback
    const reply =
      `🤖 <b>eFootballMarket Bot</b>\n\n` +
      `Received: <i>"${escapeHtml(text)}"</i>\n\n` +
      `🆔 <b>Your Telegram Chat ID:</b> <code>${chatId}</code>\n` +
      `<i>(Keep this ID in your .env.local as TELEGRAM_CHAT_ID)</i>\n\n` +
      `Send /start or /status for options, or access the admin dashboard below:`;

    await sendTelegramMessage(reply, {
      chatId,
      inlineButtons: [
        [{ text: "🛡️ Executive Panel", url: `${APP_URL}/admin` }],
        [{ text: "⚽ Marketplace", url: `${APP_URL}/marketplace` }],
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Telegram:Webhook] Error processing incoming update:", error.message);
    return NextResponse.json({ ok: true }); // Always 200 OK so Telegram doesn't storm retries
  }
}
