/**
 * Official Telegram Bot Alert & Real-Time Notification Dispatcher
 * Directly delivers instant, zero-cost push notifications to Brian Okibo's smartphone.
 */

import { formatDisplayPhone } from "@/lib/utils/phone";
import { AdminAlertPayload } from "./adminAlert";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";

export interface TelegramSendOptions {
  chatId?: string;
  token?: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  disableNotification?: boolean;
  inlineButtons?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
}

export interface TelegramSendResult {
  success: boolean;
  messageId?: number;
  chatId?: string;
  error?: string;
}

/**
 * Checks if Telegram Bot is configured with bot token and chat ID.
 */
export function isTelegramConfigured(): boolean {
  return Boolean(
    (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN) &&
    (process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID)
  );
}

/**
 * Sends a direct message via Telegram Bot API.
 */
export async function sendTelegramMessage(
  messageHtml: string,
  options: TelegramSendOptions = {}
): Promise<TelegramSendResult> {
  const token = options.token || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  const chatId = options.chatId || process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    return {
      success: false,
      error: "Telegram Bot Token or Chat ID is not configured.",
    };
  }

  try {
    const endpoint = `https://api.telegram.org/bot${token.trim()}/sendMessage`;

    const payload: any = {
      chat_id: chatId.trim(),
      text: messageHtml,
      parse_mode: options.parseMode || "HTML",
      disable_web_page_preview: false,
      disable_notification: options.disableNotification || false,
    };

    if (options.inlineButtons && options.inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: options.inlineButtons,
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data?.ok) {
      console.log(`[Telegram:Bot] Alert delivered to chat ${chatId}: msg_id=${data.result?.message_id}`);
      return {
        success: true,
        messageId: data.result?.message_id,
        chatId: String(chatId),
      };
    }

    console.warn("[Telegram:Bot] Telegram API returned error:", data);
    return {
      success: false,
      error: data?.description || "Unknown Telegram API error",
    };
  } catch (err: any) {
    console.error("[Telegram:Bot] Network dispatch error:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Fetches information about the bot (username, bot id, name) using getMe.
 */
export async function getTelegramBotInfo(customToken?: string): Promise<{ success: boolean; bot?: any; error?: string }> {
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  if (!token) return { success: false, error: "Telegram Bot Token is not configured." };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
    const data = await res.json();
    if (res.ok && data?.ok) {
      return { success: true, bot: data.result };
    }
    return { success: false, error: data?.description || "Failed to fetch bot details" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Registers webhook URL with Telegram so incoming messages to the bot trigger 2-way replies.
 */
export async function setTelegramWebhook(
  webhookUrl: string,
  customToken?: string
): Promise<{ success: boolean; description?: string; error?: string }> {
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  if (!token) return { success: false, error: "Telegram Bot Token is not configured." };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: true,
      }),
    });
    const data = await res.json();
    if (res.ok && data?.ok) {
      return { success: true, description: data.description };
    }
    return { success: false, error: data?.description || "Failed to register webhook" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Gets current webhook status from Telegram API.
 */
export async function getTelegramWebhookInfo(
  customToken?: string
): Promise<{ success: boolean; info?: any; error?: string }> {
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  if (!token) return { success: false, error: "Telegram Bot Token is not configured." };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/getWebhookInfo`);
    const data = await res.json();
    if (res.ok && data?.ok) {
      return { success: true, info: data.result };
    }
    return { success: false, error: data?.description || "Failed to fetch webhook info" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Formats a clean, high-priority HTML Telegram notification for Brian Okibo (CEO).
 */
export function formatTelegramAlertHtml(payload: AdminAlertPayload): { text: string; buttons: any[] } {
  const currency = payload.currency || "KES";
  const formattedAmount =
    payload.amount !== undefined ? `${currency} ${Number(payload.amount).toLocaleString()}` : "";
  const time = new Date().toLocaleTimeString("en-KE", {
    timeZone: "Africa/Nairobi",
    hour: "2-digit",
    minute: "2-digit",
  });

  let header = "🔔 <b>eFootballMarket Alert</b>";
  let bodyLines: string[] = [];
  let inlineButtons: any[] = [];

  switch (payload.eventType) {
    case "PAYMENT_RECEIVED":
      header = "💰 <b>M-PESA PAYMENT SECURED (TILL 1572931)</b>";
      bodyLines = [
        `📦 <b>Order:</b> <code>${payload.orderNumber || "Direct"}</code>`,
        `🎮 <b>Squad:</b> ${payload.listingTitle || "eFootball Account"}`,
        `💵 <b>Amount:</b> <b>${formattedAmount}</b>`,
        payload.receiptNumber ? `🧾 <b>M-Pesa Receipt:</b> <code>${payload.receiptNumber}</code>` : "",
        payload.buyerPhone ? `📱 <b>Buyer:</b> <code>${formatDisplayPhone(payload.buyerPhone)}</code>` : "",
        `🛡️ <b>Status:</b> Locked in Escrow. Seller notified to deliver credentials.`,
        `⏰ <b>Time:</b> ${time} EAT`,
      ];
      if (payload.orderId) {
        inlineButtons = [
          [{ text: "📦 Open Order Portal", url: `${APP_URL}/orders/${payload.orderId}` }],
          [{ text: "🛡️ Admin Executive Panel", url: `${APP_URL}/admin?tab=withdrawals` }],
        ];
      }
      break;

    case "NEW_USER_REGISTERED":
      header = "👤 <b>NEW USER REGISTRATION</b>";
      bodyLines = [
        `🎮 <b>Trader:</b> @${payload.username || "Gamer"}`,
        payload.userEmail ? `📧 <b>Email:</b> ${payload.userEmail}` : "",
        payload.buyerPhone ? `📱 <b>Phone:</b> <code>${formatDisplayPhone(payload.buyerPhone)}</code>` : "",
        `⏰ <b>Joined:</b> ${time} EAT`,
      ];
      inlineButtons = [
        [{ text: "👥 View Users in Admin", url: `${APP_URL}/admin?tab=users` }],
      ];
      break;

    case "NEW_LISTING_CREATED":
      header = "⚽ <b>NEW ACCOUNT LISTED FOR SALE</b>";
      bodyLines = [
        `🎮 <b>Squad:</b> ${payload.listingTitle || "Account"}`,
        `💰 <b>Price:</b> <b>${formattedAmount}</b>`,
        payload.username ? `👤 <b>Seller:</b> @${payload.username}` : "",
        payload.sellerPhone ? `📱 <b>Phone:</b> <code>${formatDisplayPhone(payload.sellerPhone)}</code>` : "",
        `⏰ <b>Listed:</b> ${time} EAT`,
      ];
      inlineButtons = [
        [{ text: "⚽ Review Marketplace Listings", url: `${APP_URL}/admin?tab=listings` }],
      ];
      break;

    case "CREDENTIALS_DELIVERED":
      header = "🔑 <b>SELLER DELIVERED KONAMI ID</b>";
      bodyLines = [
        `📦 <b>Order:</b> <code>${payload.orderNumber}</code>`,
        `🎮 <b>Squad:</b> ${payload.listingTitle}`,
        `⏳ <b>Buyer Window:</b> 24-hr inspection timer running.`,
      ];
      if (payload.orderId) {
        inlineButtons = [
          [{ text: "🔑 Inspect Order Vault", url: `${APP_URL}/orders/${payload.orderId}` }],
        ];
      }
      break;

    case "ESCROW_RELEASED":
      header = "✅ <b>ESCROW COMPLETED &amp; RELEASED</b>";
      bodyLines = [
        `📦 <b>Order:</b> <code>${payload.orderNumber}</code>`,
        `🎮 <b>Squad:</b> ${payload.listingTitle}`,
        `💵 <b>Net to Seller:</b> <b>${formattedAmount}</b>`,
        `🎉 <b>Status:</b> Deal completed safely with 0 disputes!`,
      ];
      break;

    case "DISPUTE_OPENED":
      header = "🚨 <b>ESCROW DISPUTE OPENED (ACTION REQUIRED)</b>";
      bodyLines = [
        `📦 <b>Order:</b> <code>${payload.orderNumber}</code>`,
        `🎮 <b>Squad:</b> ${payload.listingTitle}`,
        payload.details ? `⚠️ <b>Conflict:</b> ${payload.details}` : "",
        `🛡️ <b>Status:</b> Escrow funds frozen until mediator review.`,
      ];
      if (payload.orderId) {
        inlineButtons = [
          [{ text: "🚨 Resolve Dispute in Portal", url: `${APP_URL}/orders/${payload.orderId}` }],
        ];
      }
      break;

    case "NEW_OFFER_SUBMITTED":
      header = "🤝 <b>NEW BUYER COUNTER-OFFER</b>";
      bodyLines = [
        `🎮 <b>Squad:</b> ${payload.listingTitle}`,
        `💰 <b>Offered:</b> <b>${formattedAmount}</b>`,
        payload.buyerPhone ? `📱 <b>Buyer Phone:</b> <code>${formatDisplayPhone(payload.buyerPhone)}</code>` : "",
        payload.details ? `💬 <b>Details:</b> <i>"${payload.details}"</i>` : "",
      ];
      break;

    case "MIDDLEMAN_DEAL_CREATED":
      header = "🤝 <b>NEW BYOD MIDDLEMAN CONTRACT</b>";
      bodyLines = [
        `🏷️ <b>Deal Code:</b> <code>${payload.orderNumber}</code>`,
        `🎮 <b>Item:</b> ${payload.listingTitle}`,
        `💰 <b>Amount:</b> <b>${formattedAmount}</b>`,
        payload.buyerPhone ? `📱 <b>Buyer:</b> <code>${formatDisplayPhone(payload.buyerPhone)}</code>` : "",
        payload.sellerPhone ? `📱 <b>Seller:</b> <code>${formatDisplayPhone(payload.sellerPhone)}</code>` : "",
      ];
      inlineButtons = [
        [{ text: "🤝 Open Middleman Room", url: `${APP_URL}/middleman` }],
      ];
      break;

    case "WANTED_REQUEST_POSTED":
      header = "🎯 <b>NEW WANTED SQUAD REQUEST</b>";
      bodyLines = [
        `🎮 <b>Squad Request:</b> ${payload.listingTitle}`,
        `💵 <b>Budget:</b> <b>${formattedAmount}</b>`,
        payload.buyerPhone ? `📱 <b>Buyer Phone:</b> <code>${formatDisplayPhone(payload.buyerPhone)}</code>` : "",
      ];
      inlineButtons = [
        [{ text: "🎯 View Wanted Board", url: `${APP_URL}/wanted` }],
      ];
      break;

    case "WITHDRAWAL_REQUESTED":
      header = "🏦 <b>SELLER M-PESA WITHDRAWAL REQUEST</b>";
      bodyLines = [
        payload.username ? `👤 <b>Seller:</b> @${payload.username}` : "",
        `💵 <b>Amount:</b> <b>${formattedAmount}</b>`,
        payload.sellerPhone ? `📱 <b>M-Pesa Line:</b> <code>${formatDisplayPhone(payload.sellerPhone)}</code>` : "",
        `⚡ <b>Action:</b> Disburse via M-Pesa B2C or Till payout.`,
      ];
      inlineButtons = [
        [{ text: "🏦 Approve Payout in Admin", url: `${APP_URL}/admin?tab=withdrawals` }],
      ];
      break;

    default:
      header = "🔔 <b>eFootballMarket Update</b>";
      bodyLines = [payload.details || payload.listingTitle || "Platform activity recorded."];
      break;
  }

  const cleanBody = bodyLines.filter(Boolean).join("\n");
  const fullText = `${header}\n\n${cleanBody}\n\n🏛️ <b>eFootballMarket Executive System</b>`;

  return { text: fullText, buttons: inlineButtons };
}

/**
 * High-level dispatcher: sends automated Telegram alert to Brian Okibo's personal chat.
 */
export async function dispatchAdminTelegramAlert(payload: AdminAlertPayload): Promise<TelegramSendResult> {
  const { text, buttons } = formatTelegramAlertHtml(payload);
  console.log(`[TELEGRAM ALERT -> ADMIN]`, text.replace(/<[^>]*>/g, ""));

  return sendTelegramMessage(text, {
    inlineButtons: buttons,
    parseMode: "HTML",
    disableNotification: false,
  });
}
