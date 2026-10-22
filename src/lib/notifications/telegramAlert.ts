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
 * Acknowledges a Telegram callback query (button tap) and shows toast/alert.
 */
export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert = false,
  customToken?: string
): Promise<boolean> {
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  if (!token) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
    const data = await res.json();
    return Boolean(res.ok && data?.ok);
  } catch (err: any) {
    console.warn("[Telegram:Callback] answerCallbackQuery error:", err.message);
    return false;
  }
}

/**
 * Edits the text and buttons of an existing message in Telegram.
 */
export async function editTelegramMessageText(
  chatId: string | number,
  messageId: number,
  textHtml: string,
  inlineButtons?: Array<Array<{ text: string; url?: string; callback_data?: string }>>,
  customToken?: string
): Promise<boolean> {
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  if (!token) return false;

  try {
    const payload: any = {
      chat_id: String(chatId).trim(),
      message_id: messageId,
      text: textHtml,
      parse_mode: "HTML",
    };

    if (inlineButtons) {
      payload.reply_markup = { inline_keyboard: inlineButtons };
    }

    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return Boolean(res.ok && data?.ok);
  } catch (err: any) {
    console.warn("[Telegram:Edit] editMessageText error:", err.message);
    return false;
  }
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Extracts a valid public image URL for a squad listing.
 */
export function extractListingImageUrl(listing: any): string | null {
  if (!listing) return null;
  // Check array of images (can be strings or objects)
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    for (const img of listing.images) {
      if (typeof img === "string" && img.startsWith("http")) return img;
      if (img && typeof img === "object" && typeof img.image_url === "string" && img.image_url.startsWith("http")) {
        return img.image_url;
      }
    }
  }
  // Check common single-image fields
  for (const field of ["primary_image_url", "image_url", "cover_image_url", "thumbnail_url"]) {
    if (listing[field] && typeof listing[field] === "string" && listing[field].startsWith("http")) {
      return listing[field];
    }
  }
  return null;
}

/**
 * Broadcasts a verified listing deal to the official Telegram Group/Channel (@efootballmarket254).
 */
export async function broadcastListingToTelegramChannel(
  listing: any,
  customChannel?: string
): Promise<{ success: boolean; messageId?: number; channelUsed?: string; error?: string }> {
  const channel =
    customChannel ||
    process.env.TELEGRAM_CHANNEL_ID ||
    process.env.TELEGRAM_DEALS_CHANNEL ||
    "@efootballmarket254";

  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;
  if (!token || !channel) {
    return { success: false, error: "Telegram Bot Token or Channel is not configured." };
  }

  const priceKes = listing.price ? `KES ${Number(listing.price).toLocaleString()}` : "Price on Inquiry";
  const ovr = listing.overall_team_strength || listing.collective_strength || listing.squad_rating || "Top Tier";
  const platform = listing.platform ? String(listing.platform).toUpperCase().replace("_", " ") : "MOBILE";
  const title = listing.title || "eFootball Squad";
  const listingUrl = `${APP_URL}/listings/${listing.id}`;

  const coinLine = listing.coin_balance ? `🪙 <b>Coins:</b> <code>${Number(listing.coin_balance).toLocaleString()}</code>\n` : "";
  const gpLine = listing.gp_balance ? `💵 <b>GP:</b> <code>${Number(listing.gp_balance).toLocaleString()}</code>\n` : "";
  const epicsCount = (listing.epic_players_count || 0) + (listing.big_time_players_count || 0) + (listing.legend_players_count || 0);
  const epicsLine = epicsCount > 0 ? `🌟 <b>Epic / Big Time / Legends:</b> <code>${epicsCount} Players</code>\n` : "";
  const divisionLine = listing.highest_division ? `🏆 <b>Peak Division:</b> <code>Division ${listing.highest_division}</code>\n` : "";

  const captionHtml =
    `🔥 <b>NEW VERIFIED SQUAD ON EFOOTBALLMARKET</b> ⚽\n\n` +
    `🎮 <b>Account:</b> <b>${escapeHtml(title)}</b>\n` +
    `⭐ <b>Squad Strength:</b> <code>${ovr} OVR</code>\n` +
    `💰 <b>Price:</b> <b>${priceKes}</b>\n` +
    `📱 <b>Platform:</b> <code>${platform}</code>\n` +
    coinLine +
    gpLine +
    epicsLine +
    divisionLine +
    `🛡️ <b>Escrow Protected:</b> Safaricom Till <code>1572931</code>\n` +
    `🔐 <b>Konami ID:</b> Transferable &amp; Email Bindable\n\n` +
    `⚡ <i>Funds held in secure escrow until buyer confirms squad access &amp; players!</i>\n\n` +
    `#eFootball #eFootballKenya #eFootballMarket #GamingKE`;

  const waInquiryUrl = `https://wa.me/254794400365?text=${encodeURIComponent(
    `Hello Brian, I want to purchase squad "${title}" (${priceKes}) on eFootballMarket: ${listingUrl}`
  )}`;

  const buttons = [
    [{ text: `🛒 Buy Safely (${priceKes})`, url: listingUrl }],
    [
      { text: "💬 Deal Inquiry / WhatsApp", url: waInquiryUrl },
      { text: "⚽ Browse All Squads", url: `${APP_URL}/marketplace` },
    ],
  ];

  // Try sending high-impact squad screenshot first if available
  const photoUrl = extractListingImageUrl(listing);

  if (photoUrl) {
    try {
      const photoEndpoint = `https://api.telegram.org/bot${token.trim()}/sendPhoto`;
      const photoRes = await fetch(photoEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channel.trim(),
          photo: photoUrl,
          caption: captionHtml,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: buttons,
          },
        }),
      });

      const photoData = await photoRes.json();
      if (photoRes.ok && photoData?.ok) {
        console.log(`[Telegram:Broadcast] Squad photo sent to ${channel}: msg_id=${photoData.result?.message_id}`);
        return {
          success: true,
          messageId: photoData.result?.message_id,
          channelUsed: channel,
        };
      }
      console.warn("[Telegram:Broadcast] sendPhoto error, falling back to text:", photoData);
    } catch (err: any) {
      console.warn("[Telegram:Broadcast] sendPhoto failed, falling back to text:", err.message);
    }
  }

  // Graceful fallback to text message with buttons
  const textRes = await sendTelegramMessage(captionHtml, {
    chatId: channel,
    token,
    parseMode: "HTML",
    inlineButtons: buttons,
  });

  return {
    ...textRes,
    channelUsed: channel,
  };
}

/**
 * Dispatches an instant Telegram message to a user or creator if they have linked their Telegram account.
 */
export async function sendTelegramToUser(
  userId: string,
  messageHtml: string,
  inlineButtons?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
): Promise<TelegramSendResult> {
  if (!userId) return { success: false, error: "No user ID provided" };

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("telegram_chat_id, username")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.telegram_chat_id) {
      return { success: false, error: "User has not connected Telegram." };
    }

    return await sendTelegramMessage(messageHtml, {
      chatId: profile.telegram_chat_id,
      inlineButtons,
      parseMode: "HTML",
    });
  } catch (err: any) {
    console.warn(`[Telegram:UserAlert] Failed to dispatch alert to user ${userId}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Notifies a seller instantly on Telegram when a buyer submits a price offer on their listing.
 */
export async function notifySellerNewOfferViaTelegram(params: {
  sellerId: string;
  offerId: string;
  listingId: string;
  listingTitle: string;
  offerAmount: number;
  originalPrice: number;
  buyerName: string;
  note?: string | null;
}): Promise<TelegramSendResult> {
  const discount =
    params.originalPrice > 0
      ? Math.round(((params.originalPrice - params.offerAmount) / params.originalPrice) * 100)
      : 0;

  const msg =
    `🤝 <b>NEW CASH OFFER ON YOUR SQUAD!</b> ⚽\n\n` +
    `🎮 <b>Squad:</b> <b>${escapeHtml(params.listingTitle)}</b>\n` +
    `💰 <b>Offered:</b> <b>KES ${Number(params.offerAmount).toLocaleString()}</b> ` +
    (discount > 0
      ? `<i>(${discount}% off original KES ${Number(params.originalPrice).toLocaleString()})</i>\n`
      : `\n`) +
    `👤 <b>Buyer:</b> ${escapeHtml(params.buyerName)}\n` +
    (params.note ? `💬 <b>Buyer Note:</b> <i>"${escapeHtml(params.note)}"</i>\n\n` : `\n`) +
    `⚡ <i>Review quickly to accept or negotiate before the buyer finds another squad!</i>`;

  return sendTelegramToUser(params.sellerId, msg, [
    [{ text: "🤝 Review & Accept Offer", url: `${APP_URL}/dashboard/seller` }],
    [{ text: "⚽ View Squad Listing", url: `${APP_URL}/listings/${params.listingId}` }],
  ]);
}

/**
 * Notifies a seller instantly on Telegram when payment is confirmed and locked in escrow.
 */
export async function notifySellerOrderSecuredViaTelegram(params: {
  sellerId: string;
  orderId: string;
  orderNumber: string;
  listingTitle: string;
  amount: number;
  buyerPhone?: string;
}): Promise<TelegramSendResult> {
  const msg =
    `🎉 <b>SQUAD SOLD! PAYMENT SECURED IN ESCROW</b> 🛡️\n\n` +
    `📦 <b>Order:</b> <code>${escapeHtml(params.orderNumber)}</code>\n` +
    `🎮 <b>Squad:</b> <b>${escapeHtml(params.listingTitle)}</b>\n` +
    `💵 <b>Amount Locked:</b> <b>KES ${Number(params.amount).toLocaleString()}</b>\n` +
    `🛡️ <b>M-Pesa Escrow:</b> Verified safely at Till <code>1572931</code>\n\n` +
    `⚡ <b>ACTION REQUIRED:</b>\n` +
    `Please log into the Escrow Vault now to deliver the Konami ID and login details so the buyer can inspect and release your payout!`;

  return sendTelegramToUser(params.sellerId, msg, [
    [{ text: "🔑 Deliver Credentials to Buyer", url: `${APP_URL}/orders/${params.orderId}` }],
    [{ text: "📊 Open Seller Dashboard", url: `${APP_URL}/dashboard/seller` }],
  ]);
}

/**
 * Notifies a participant on Telegram when a new message is received in the escrow chat room.
 */
export async function notifyEscrowMessageViaTelegram(params: {
  recipientId: string;
  orderId?: string;
  orderNumber?: string;
  senderName: string;
  messagePreview: string;
}): Promise<TelegramSendResult> {
  const title = params.orderNumber ? `Order #${params.orderNumber}` : "Escrow Room";
  const preview = params.messagePreview.length > 120
    ? params.messagePreview.slice(0, 117) + "..."
    : params.messagePreview;

  const msg =
    `💬 <b>NEW MESSAGE IN ESCROW ROOM</b> 📨\n\n` +
    `📦 <b>Room:</b> <code>${escapeHtml(title)}</code>\n` +
    `👤 <b>From:</b> <b>${escapeHtml(params.senderName)}</b>\n` +
    `📝 <b>Message:</b> <i>"${escapeHtml(preview)}"</i>\n\n` +
    `🛡️ <i>Funds remain safely protected in Escrow Till 1572931.</i>`;

  const buttons: Array<Array<{ text: string; url?: string }>> = [];
  if (params.orderId) {
    buttons.push([{ text: "💬 Reply in Escrow Room", url: `${APP_URL}/orders/${params.orderId}` }]);
  } else {
    buttons.push([{ text: "💬 Open Portal", url: `${APP_URL}/dashboard/buyer` }]);
  }

  return sendTelegramToUser(params.recipientId, msg, buttons);
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
      if (payload.orderId) {
        inlineButtons = [
          [
            { text: "📢 Broadcast Deal", callback_data: `broadcast_listing:${payload.orderId}` },
            { text: "🚨 Take Down", callback_data: `takedown_listing:${payload.orderId}` },
          ],
          [{ text: "⚽ Review in Admin", url: `${APP_URL}/admin?tab=listings` }],
        ];
      } else {
        inlineButtons = [
          [{ text: "⚽ Review Marketplace Listings", url: `${APP_URL}/admin?tab=listings` }],
        ];
      }
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

    case "POST_RELEASE_DISPUTE_OPENED":
      header = "🚨 <b>POST-RELEASE DISPUTE OPENED (FUNDS FROZEN)</b>";
      bodyLines = [
        `📦 <b>Order:</b> <code>${payload.orderNumber}</code>`,
        `🎮 <b>Squad:</b> ${payload.listingTitle}`,
        payload.amount !== undefined ? `💵 <b>Disputed Amount:</b> <b>${formattedAmount}</b>` : "",
        `⚠️ <b>Conflict:</b> Post-handover dispute raised by buyer after fund release.`,
        `🔒 <b>Action Taken:</b> Seller available balance frozen. Immediate Konami account audit required.`,
        payload.details ? `📝 <b>Details:</b> <i>"${payload.details}"</i>` : "",
      ];
      if (payload.orderId) {
        inlineButtons = [
          [{ text: "🚨 Audit & Resolve in Portal", url: `${APP_URL}/orders/${payload.orderId}` }],
          [{ text: "🛡️ Admin Executive Panel", url: `${APP_URL}/admin?tab=withdrawals` }],
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
      if (payload.orderId) {
        inlineButtons = [
          [
            { text: "✅ Disburse & Approve", callback_data: `approve_withdrawal:${payload.orderId}` },
            { text: "❌ Reject & Refund", callback_data: `reject_withdrawal:${payload.orderId}` },
          ],
          [{ text: "🏦 Open in Admin Dashboard", url: `${APP_URL}/admin?tab=withdrawals` }],
        ];
      } else {
        inlineButtons = [
          [{ text: "🏦 Approve Payout in Admin", url: `${APP_URL}/admin?tab=withdrawals` }],
        ];
      }
      break;

    case "TOURNAMENT_REGISTRATION":
      header = "🏆 <b>NEW TOURNAMENT REGISTRATION</b>";
      bodyLines = [
        `🎮 <b>Tournament:</b> ${payload.listingTitle || "eFootball Cup"}`,
        payload.amount ? `💵 <b>Entry Fee:</b> <b>${formattedAmount}</b>` : "💵 <b>Entry Fee:</b> <b>Free Entry</b>",
        payload.buyerPhone ? `📱 <b>Player Phone:</b> <code>${formatDisplayPhone(payload.buyerPhone)}</code>` : "",
        payload.details ? `👤 <b>Player Details:</b> ${payload.details}` : "",
        `⚡ <b>Action:</b> Confirm entry fee payment to Till 1572931 & generate Match Room code.`,
      ];
      inlineButtons = [
        [{ text: "🏆 View Tournament Brackets", url: `${APP_URL}/tournaments` }],
        [{ text: "💬 Chat with Player", url: `https://wa.me/${payload.buyerPhone ? payload.buyerPhone.replace(/[^0-9]/g, "") : ""}` }],
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
