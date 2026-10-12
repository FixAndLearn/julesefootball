/**
 * Multi-Provider WhatsApp Business & Real-Time Alert Engine
 * 
 * Supports:
 * 1. Meta WhatsApp Business Cloud API (Official Graph API v21.0 - Free 1,000 monthly conversations)
 * 2. UltraMsg (Scan QR Code from phone - Easiest 60-second setup, no Meta approval required)
 * 3. Wassenger (Scan QR Code from phone)
 * 4. Twilio WhatsApp (Production scale, Sandbox or approved sender)
 * 5. Telegram Bot (100% Free instant backup alert to your smartphone)
 * 6. Generic Webhook / Gateway (Zapier, Make, custom WhatsApp proxy)
 */

import { formatWhatsAppPhone } from "@/lib/utils/phone";

export interface SendWhatsAppMessageOptions {
  toPhone: string;
  message: string;
  previewUrl?: boolean;
}

export interface SendInteractiveButtonsOptions {
  toPhone: string;
  bodyText: string;
  buttons: Array<{ id: string; title: string }>;
  headerText?: string;
  footerText?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  provider:
    | "meta_cloud_api"
    | "ultramsg"
    | "wassenger"
    | "twilio"
    | "telegram_fallback"
    | "whatsapp_gateway"
    | "callmebot"
    | "simulated_local"
    | "error";
  messageId?: string;
  recipient: string;
  error?: string;
}

/**
 * Checks if official Meta WhatsApp Business Cloud API credentials are configured.
 */
export function isMetaCloudApiConfigured(): boolean {
  return Boolean(
    (process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.META_WHATSAPP_TOKEN) &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

/**
 * Checks if UltraMsg QR-Code Gateway credentials are configured.
 */
export function isUltraMsgConfigured(): boolean {
  return Boolean(
    (process.env.ULTRAMSG_INSTANCE_ID || process.env.ULTRAMSG_INSTANCE) &&
    process.env.ULTRAMSG_TOKEN
  );
}

/**
 * Checks if Wassenger QR-Code Gateway credentials are configured.
 */
export function isWassengerConfigured(): boolean {
  return Boolean(process.env.WASSENGER_TOKEN || process.env.WASSENGER_API_KEY);
}

/**
 * Checks if Twilio WhatsApp credentials are configured.
 */
export function isTwilioWhatsAppConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Checks if Telegram Bot alerts are configured.
 */
export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Checks if any automated WhatsApp or real-time alert service is configured.
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(
    isMetaCloudApiConfigured() ||
    isUltraMsgConfigured() ||
    isWassengerConfigured() ||
    isTwilioWhatsAppConfigured() ||
    process.env.WHATSAPP_GATEWAY_URL ||
    process.env.ADMIN_ALERT_WEBHOOK_URL ||
    isTelegramConfigured() ||
    process.env.CALLMEBOT_API_KEY
  );
}

/**
 * Returns the currently active WhatsApp integration provider name.
 */
export function getActiveWhatsAppProvider(): string {
  if (isMetaCloudApiConfigured()) return "Meta WhatsApp Business Cloud API (Official)";
  if (isUltraMsgConfigured()) return "UltraMsg (QR Code WhatsApp)";
  if (isWassengerConfigured()) return "Wassenger (QR Code WhatsApp)";
  if (isTwilioWhatsAppConfigured()) return "Twilio WhatsApp API";
  if (process.env.WHATSAPP_GATEWAY_URL) return "Custom WhatsApp Gateway";
  if (isTelegramConfigured()) return "Telegram Bot Alert (Backup)";
  if (process.env.ADMIN_ALERT_WEBHOOK_URL) return "Webhook Hub";
  if (process.env.CALLMEBOT_API_KEY) return "CallMeBot Gateway";
  return "Simulated Local (Development)";
}

/**
 * Primary dispatch function: delivers message via the best active WhatsApp provider.
 */
export async function sendWhatsAppMessage({
  toPhone,
  message,
  previewUrl = true,
}: SendWhatsAppMessageOptions): Promise<WhatsAppSendResult> {
  const cleanPhone = formatWhatsAppPhone(toPhone);

  if (!cleanPhone || cleanPhone.length < 10) {
    return {
      success: false,
      provider: "error",
      recipient: toPhone,
      error: `Invalid recipient phone format: "${toPhone}". Must format to international digits (e.g. 254794400365).`,
    };
  }

  // ---------------------------------------------------------------------------
  // 1. UltraMsg (QR-Code WhatsApp - Zero verification, connects phone in 60s)
  // ---------------------------------------------------------------------------
  const ultramsgInstance = process.env.ULTRAMSG_INSTANCE_ID || process.env.ULTRAMSG_INSTANCE;
  const ultramsgToken = process.env.ULTRAMSG_TOKEN;

  if (ultramsgInstance && ultramsgToken) {
    try {
      const url = `https://api.ultramsg.com/${ultramsgInstance.trim()}/messages/chat`;
      const params = new URLSearchParams();
      params.append("token", ultramsgToken.trim());
      params.append("to", cleanPhone);
      params.append("body", message);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await res.json();
      if (res.ok && (data.sent === "true" || data.id)) {
        console.log(`[WhatsApp:UltraMsg] Delivered to ${cleanPhone}: ${data.id}`);
        return {
          success: true,
          provider: "ultramsg",
          messageId: String(data.id || ""),
          recipient: cleanPhone,
        };
      }
      console.warn("[WhatsApp:UltraMsg] Notice:", data);
    } catch (err: any) {
      console.warn("[WhatsApp:UltraMsg] Error:", err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Official Meta WhatsApp Business Cloud API (Official Graph API v21.0)
  // ---------------------------------------------------------------------------
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneNumberId) {
    try {
      const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId.trim()}/messages`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: {
            preview_url: previewUrl,
            body: message,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data?.messages?.[0]?.id) {
        console.log(`[WhatsApp:MetaCloud] Message sent to ${cleanPhone}: ${data.messages[0].id}`);
        return {
          success: true,
          provider: "meta_cloud_api",
          messageId: data.messages[0].id,
          recipient: cleanPhone,
        };
      }

      console.warn("[WhatsApp:MetaCloud] API returned error, checking fallbacks:", data?.error?.message || data);
    } catch (err: any) {
      console.warn("[WhatsApp:MetaCloud] Network error, falling back:", err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Wassenger (QR-Code WhatsApp)
  // ---------------------------------------------------------------------------
  const wassengerKey = process.env.WASSENGER_TOKEN || process.env.WASSENGER_API_KEY;
  if (wassengerKey) {
    try {
      const res = await fetch("https://api.wassenger.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: wassengerKey.trim(),
        },
        body: JSON.stringify({
          phone: `+${cleanPhone}`,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        console.log(`[WhatsApp:Wassenger] Delivered to ${cleanPhone}: ${data.id}`);
        return {
          success: true,
          provider: "wassenger",
          messageId: data.id,
          recipient: cleanPhone,
        };
      }
    } catch (err: any) {
      console.warn("[WhatsApp:Wassenger] Error:", err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Twilio WhatsApp API
  // ---------------------------------------------------------------------------
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (twilioSid && twilioAuth) {
    try {
      const authHeader = Buffer.from(`${twilioSid.trim()}:${twilioAuth.trim()}`).toString("base64");
      const fromFormatted = twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`;

      const params = new URLSearchParams();
      params.append("From", fromFormatted);
      params.append("To", `whatsapp:+${cleanPhone}`);
      params.append("Body", message);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid.trim()}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      const data = await res.json();
      if (res.ok && data.sid) {
        console.log(`[WhatsApp:Twilio] Delivered to ${cleanPhone}: ${data.sid}`);
        return {
          success: true,
          provider: "twilio",
          messageId: data.sid,
          recipient: cleanPhone,
        };
      }
    } catch (err: any) {
      console.warn("[WhatsApp:Twilio] Error:", err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Telegram Bot Backup Alert (Free instant smartphone push notifications)
  // ---------------------------------------------------------------------------
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (telegramToken && telegramChatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramToken.trim()}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId.trim(),
          text: message,
        }),
      });

      if (res.ok) {
        console.log(`[Telegram:Bot] Alert pushed to admin chat ${telegramChatId}`);
        return {
          success: true,
          provider: "telegram_fallback",
          recipient: cleanPhone,
        };
      }
    } catch (err: any) {
      console.warn("[Telegram:Bot] Error:", err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Generic WhatsApp Gateway / Webhook
  // ---------------------------------------------------------------------------
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
  const gatewayApiKey = process.env.WHATSAPP_GATEWAY_KEY || process.env.WHATSAPP_BOT_API_KEY;

  if (gatewayUrl) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (gatewayApiKey) headers["Authorization"] = `Bearer ${gatewayApiKey.trim()}`;

      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone: cleanPhone,
          message,
          previewUrl,
        }),
      });

      if (res.ok) {
        console.log(`[WhatsApp:Gateway] Dispatched to ${cleanPhone}`);
        return {
          success: true,
          provider: "whatsapp_gateway",
          recipient: cleanPhone,
        };
      }
    } catch (err: any) {
      console.warn("[WhatsApp:Gateway] Dispatch failed:", err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. CallMeBot Gateway (if available)
  // ---------------------------------------------------------------------------
  const callmebotKey = process.env.CALLMEBOT_API_KEY;
  if (callmebotKey && cleanPhone === "254794400365") {
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(
        message
      )}&apikey=${callmebotKey.trim()}`;
      await fetch(url, { method: "GET" });
      console.log(`[WhatsApp:CallMeBot] Dispatched to ${cleanPhone}`);
      return {
        success: true,
        provider: "callmebot",
        recipient: cleanPhone,
      };
    } catch (err: any) {
      console.warn("[WhatsApp:CallMeBot] Failed:", err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 8. Simulated Local / Console Logger
  // ---------------------------------------------------------------------------
  const simulatedId = `wa_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  console.log(`=======================================================`);
  console.log(`[WHATSAPP BUSINESS DISPATCH LOG] -> ${cleanPhone}`);
  console.log(message);
  console.log(`=======================================================`);

  return {
    success: true,
    provider: "simulated_local",
    messageId: simulatedId,
    recipient: cleanPhone,
  };
}

/**
 * Sends an interactive button menu via Meta Cloud API (with text fallback).
 */
export async function sendWhatsAppButtons({
  toPhone,
  bodyText,
  buttons,
  headerText,
  footerText,
}: SendInteractiveButtonsOptions): Promise<WhatsAppSendResult> {
  const cleanPhone = formatWhatsAppPhone(toPhone);
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneNumberId && buttons.length <= 3) {
    try {
      const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId.trim()}/messages`;
      const actionButtons = buttons.slice(0, 3).map((b) => ({
        type: "reply",
        reply: {
          id: b.id.slice(0, 256),
          title: b.title.slice(0, 20),
        },
      }));

      const interactivePayload: any = {
        type: "button",
        body: { text: bodyText },
        action: { buttons: actionButtons },
      };

      if (headerText) {
        interactivePayload.header = { type: "text", text: headerText };
      }
      if (footerText) {
        interactivePayload.footer = { text: footerText };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "interactive",
          interactive: interactivePayload,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.messages?.[0]?.id) {
        return {
          success: true,
          provider: "meta_cloud_api",
          messageId: data.messages[0].id,
          recipient: cleanPhone,
        };
      }
    } catch {
      // Fallback to text representation
    }
  }

  // Fallback: format buttons as numbered textual reply options
  const buttonLines = buttons.map((b, idx) => `👉 *${idx + 1}.* ${b.title}`).join("\n");
  const fallbackMessage = `${bodyText}\n\n${buttonLines}${footerText ? `\n\n_${footerText}_` : ""}`;

  return sendWhatsAppMessage({ toPhone: cleanPhone, message: fallbackMessage });
}
