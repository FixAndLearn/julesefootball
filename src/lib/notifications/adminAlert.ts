/**
 * Admin Notification & WhatsApp Automated Dispatcher
 * Directly routes all high-priority platform events to Brian Okibo (CEO) at +254 794 400 365.
 */

import { formatDisplayPhone, formatInternationalPhone } from "@/lib/utils/phone";
import { isMetaCloudApiConfigured, sendWhatsAppMessage } from "@/lib/whatsapp/cloudApi";
import { sendSmsAlert } from "./smsAlert";
import { dispatchAdminTelegramAlert, isTelegramConfigured } from "./telegramAlert";

export const ADMIN_PHONE_NUMBER = "0794400365";
export const ADMIN_WHATSAPP_NUMBER = "254794400365";
export const ADMIN_INTERNATIONAL_PHONE = "+254794400365";
export const ADMIN_EMAIL = "brianokibo@gmail.com";

export type AdminEventType =
  | "PAYMENT_RECEIVED"
  | "NEW_ORDER_CREATED"
  | "NEW_USER_REGISTERED"
  | "NEW_LISTING_CREATED"
  | "CREDENTIALS_DELIVERED"
  | "ESCROW_RELEASED"
  | "DISPUTE_OPENED"
  | "POST_RELEASE_DISPUTE_OPENED"
  | "NEW_OFFER_SUBMITTED"
  | "MIDDLEMAN_DEAL_CREATED"
  | "WANTED_REQUEST_POSTED"
  | "WITHDRAWAL_REQUESTED";

export interface AdminAlertPayload {
  eventType: AdminEventType;
  orderId?: string;
  orderNumber?: string;
  listingTitle?: string;
  amount?: number;
  currency?: string;
  buyerPhone?: string;
  sellerPhone?: string;
  receiptNumber?: string;
  username?: string;
  userEmail?: string;
  details?: string;
}

// Backward compatibility alias
export type OrderAlertPayload = AdminAlertPayload;

/**
 * Formats a clean, high-priority WhatsApp notification for Brian Okibo (CEO).
 */
export function formatAdminWhatsAppMessage(payload: AdminAlertPayload): string {
  const currency = payload.currency || "KES";
  const formattedAmount = payload.amount !== undefined ? `${currency} ${Number(payload.amount).toLocaleString()}` : "";
  const time = new Date().toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit" });

  let header = "🔔 *eFootballMarket Alert*";
  let lines: string[] = [];

  switch (payload.eventType) {
    case "PAYMENT_RECEIVED":
      header = "💰 *M-PESA PAYMENT SECURED (TILL 1572931)*";
      lines = [
        `📦 *Order:* ${payload.orderNumber || "Direct"}`,
        `🎮 *Squad:* ${payload.listingTitle || "eFootball Account"}`,
        `💵 *Amount:* ${formattedAmount}`,
        payload.receiptNumber ? `🧾 *Receipt:* ${payload.receiptNumber}` : "",
        payload.buyerPhone ? `📱 *Buyer:* ${formatDisplayPhone(payload.buyerPhone)}` : "",
        `🛡️ *Status:* Funds in Escrow. Seller notified to deliver Konami ID.`,
      ];
      break;

    case "NEW_USER_REGISTERED":
      header = "👤 *NEW USER REGISTRATION*";
      lines = [
        `🎮 *Username:* @${payload.username || "Trader"}`,
        payload.userEmail ? `📧 *Email:* ${payload.userEmail}` : "",
        payload.buyerPhone ? `📱 *Phone:* ${formatDisplayPhone(payload.buyerPhone)}` : "",
        `⏰ *Time:* ${time} EAT`,
      ];
      break;

    case "NEW_LISTING_CREATED":
      header = "⚽ *NEW ACCOUNT LISTED FOR SALE*";
      lines = [
        `🎮 *Squad:* ${payload.listingTitle || "Account"}`,
        `💰 *Price:* ${formattedAmount}`,
        payload.username ? `👤 *Seller:* @${payload.username}` : "",
        payload.sellerPhone ? `📱 *Seller Phone:* ${formatDisplayPhone(payload.sellerPhone)}` : "",
        `⏰ *Time:* ${time} EAT`,
      ];
      break;

    case "CREDENTIALS_DELIVERED":
      header = "🔑 *SELLER DELIVERED KONAMI ID*";
      lines = [
        `📦 *Order:* ${payload.orderNumber}`,
        `🎮 *Squad:* ${payload.listingTitle}`,
        `⏳ *Buyer Window:* 24-hr inspection timer running.`,
      ];
      break;

    case "ESCROW_RELEASED":
      header = "✅ *ESCROW COMPLETED & RELEASED*";
      lines = [
        `📦 *Order:* ${payload.orderNumber}`,
        `🎮 *Squad:* ${payload.listingTitle}`,
        `💵 *Net to Seller:* ${formattedAmount}`,
        `🎉 *Result:* Deal complete without disputes!`,
      ];
      break;

    case "DISPUTE_OPENED":
      header = "🚨 *ESCROW DISPUTE OPENED (ACTION REQUIRED)*";
      lines = [
        `📦 *Order:* ${payload.orderNumber}`,
        `🎮 *Squad:* ${payload.listingTitle}`,
        `⚠️ *Conflict:* Buyer or seller opened dispute. Mediation needed.`,
      ];
      break;

    case "POST_RELEASE_DISPUTE_OPENED":
      header = "🚨 *POST-RELEASE DISPUTE OPENED (FUNDS FROZEN)*";
      lines = [
        `📦 *Order:* ${payload.orderNumber}`,
        `🎮 *Squad:* ${payload.listingTitle}`,
        payload.amount !== undefined ? `💵 *Disputed Amount:* ${formattedAmount}` : "",
        `⚠️ *Conflict:* Post-handover dispute raised by buyer after fund release.`,
        `🔒 *Action Taken:* Seller wallet balance frozen. Immediate Konami account audit required.`,
        payload.details ? `📝 *Details:* ${payload.details}` : "",
      ];
      break;

    case "NEW_OFFER_SUBMITTED":
      header = "🤝 *NEW BUYER COUNTER-OFFER*";
      lines = [
        `🎮 *Squad:* ${payload.listingTitle}`,
        `💰 *Offered Price:* ${formattedAmount}`,
        payload.buyerPhone ? `📱 *Buyer Phone:* ${formatDisplayPhone(payload.buyerPhone)}` : "",
        payload.details ? `💬 *Note:* "${payload.details}"` : "",
      ];
      break;

    case "MIDDLEMAN_DEAL_CREATED":
      header = "🤝 *NEW BYOD MIDDLEMAN DEAL*";
      lines = [
        `🏷️ *Deal Code:* ${payload.orderNumber}`,
        `🎮 *Item:* ${payload.listingTitle}`,
        `💰 *Volume:* ${formattedAmount}`,
        payload.buyerPhone ? `📱 *Buyer:* ${formatDisplayPhone(payload.buyerPhone)}` : "",
        payload.sellerPhone ? `📱 *Seller:* ${formatDisplayPhone(payload.sellerPhone)}` : "",
      ];
      break;

    case "WANTED_REQUEST_POSTED":
      header = "🎯 *NEW WANTED SQUAD REQUEST*";
      lines = [
        `🎮 *Request:* ${payload.listingTitle}`,
        `💵 *Budget:* ${formattedAmount}`,
        payload.buyerPhone ? `📱 *Buyer:* ${formatDisplayPhone(payload.buyerPhone)}` : "",
      ];
      break;

    case "WITHDRAWAL_REQUESTED":
      header = "🏦 *SELLER M-PESA WITHDRAWAL REQUEST*";
      lines = [
        payload.username ? `👤 *Seller:* @${payload.username}` : "",
        `💵 *Amount:* ${formattedAmount}`,
        payload.sellerPhone ? `📱 *M-Pesa:* ${formatDisplayPhone(payload.sellerPhone)}` : "",
      ];
      break;

    default:
      header = "🔔 *eFootballMarket Update*";
      lines = [payload.details || payload.listingTitle || "Activity recorded."];
      break;
  }

  const cleanLines = lines.filter(Boolean).join("\n");
  return (
    `${header}\n\n` +
    `${cleanLines}\n\n` +
    `🔗 *Admin Panel:* https://www.efootballmarket.co.ke/admin`
  );
}

/**
 * Backward compatibility function for order alert formatting.
 */
export function formatAdminOrderAlertMessage(payload: AdminAlertPayload): string {
  return formatAdminWhatsAppMessage(payload);
}

/**
 * Generates direct WhatsApp click-to-chat URL to message Brian Okibo at +254 794 400 365.
 */
export function getAdminWhatsAppAlertUrl(payload: AdminAlertPayload): string {
  const text = formatAdminWhatsAppMessage(payload);
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Dispatches automated real-time alerts to Brian Okibo's WhatsApp (+254794400365).
 * Automatically delivers via:
 * 1. CallMeBot WhatsApp API (Free automated WhatsApp bot to Brian's personal WhatsApp)
 * 2. WhatsApp Webhook / External Notification Hub (if configured)
 * 3. SMS Alert (Africa's Talking / Advanta SMS)
 */
export async function dispatchAdminWhatsAppAlert(payload: AdminAlertPayload): Promise<void> {
  const alertText = formatAdminWhatsAppMessage(payload);
  console.log(`[ADMIN NOTIFICATION -> ${ADMIN_INTERNATIONAL_PHONE}]`, alertText);

  // 1. Instant Push Notification via Telegram Bot (Priority #1 - 100% Free, instant smartphone banner & sound)
  if (isTelegramConfigured()) {
    try {
      const tgRes = await dispatchAdminTelegramAlert(payload);
      if (tgRes.success) {
        console.log(`[Telegram:Bot] Alert delivered successfully (msg_id=${tgRes.messageId})`);
      } else {
        console.warn(`[Telegram:Bot] Delivery note: ${tgRes.error}`);
      }
    } catch (err: any) {
      console.warn("[Telegram:Bot] Dispatch error:", err.message);
    }
  }

  // 2. Automated Meta WhatsApp Business Cloud API (Official Graph API v21.0)
  if (isMetaCloudApiConfigured()) {
    try {
      const res = await sendWhatsAppMessage({
        toPhone: ADMIN_WHATSAPP_NUMBER,
        message: alertText,
      });
      if (res.success && res.provider === "meta_cloud_api") {
        console.log(`[MetaCloud:WhatsApp] Delivered to ${ADMIN_INTERNATIONAL_PHONE}: ${res.messageId}`);
        return;
      }
    } catch (err: any) {
      console.warn("Meta Cloud API alert notice:", err.message);
    }
  }

  // 3. Automated WhatsApp Dispatch via CallMeBot API (Instant WhatsApp message to 254794400365)
  const callmebotKey = process.env.CALLMEBOT_API_KEY || process.env.WHATSAPP_BOT_API_KEY;
  if (callmebotKey) {
    try {
      const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${ADMIN_WHATSAPP_NUMBER}&text=${encodeURIComponent(
        alertText
      )}&apikey=${callmebotKey.trim()}`;
      await fetch(callmebotUrl, { method: "GET" });
      console.log(`[CallMeBot:WhatsApp] Dispatched to ${ADMIN_INTERNATIONAL_PHONE}`);
    } catch (err: any) {
      console.warn("CallMeBot WhatsApp dispatch note:", err.message);
    }
  }

  // 4. Automated Webhook (Zapier, Make, Wassenger, or custom WhatsApp gateway)
  const webhookUrl = process.env.ADMIN_ALERT_WEBHOOK_URL || process.env.WHATSAPP_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: ADMIN_WHATSAPP_NUMBER,
          recipient: ADMIN_INTERNATIONAL_PHONE,
          message: alertText,
          eventType: payload.eventType,
          payload,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log(`[Webhook:WhatsApp] Forwarded alert to ${webhookUrl}`);
    } catch (err: any) {
      console.warn("Webhook dispatch note:", err.message);
    }
  }

  // 5. Fallback High-Priority SMS to Brian Okibo for Financial Events (Payments / Disputes / Withdrawals)
  if (["PAYMENT_RECEIVED", "DISPUTE_OPENED", "POST_RELEASE_DISPUTE_OPENED", "WITHDRAWAL_REQUESTED"].includes(payload.eventType)) {
    try {
      const smsSummary = `[eFootballMarket] ${payload.eventType}: ${payload.orderNumber || payload.listingTitle || ""} KES ${payload.amount || ""}. Check WhatsApp/Telegram/Admin.`;
      await sendSmsAlert({
        toPhone: ADMIN_INTERNATIONAL_PHONE,
        message: smsSummary,
      });
    } catch {
      // Non-blocking SMS
    }
  }
}

/**
 * Unified dispatch alias: routes to Telegram + WhatsApp + SMS.
 */
export const dispatchAdminAlert = dispatchAdminWhatsAppAlert;

/**
 * Backward compatibility wrapper.
 */
export async function dispatchAdminOrderAlert(payload: AdminAlertPayload): Promise<void> {
  return dispatchAdminWhatsAppAlert(payload);
}
export { isTelegramConfigured };
