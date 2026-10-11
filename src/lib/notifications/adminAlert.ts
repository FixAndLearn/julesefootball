/**
 * Admin Notification & WhatsApp Alert Dispatcher
 * Directly routes high-priority order and escrow alerts to Brian Okibo (CEO) at 0794400365.
 */

export const ADMIN_PHONE_NUMBER = "0794400365";
export const ADMIN_WHATSAPP_NUMBER = "254794400365";
export const ADMIN_EMAIL = "brianokibo@gmail.com";

export interface OrderAlertPayload {
  orderId: string;
  orderNumber: string;
  listingTitle: string;
  amount: number;
  currency?: string;
  buyerPhone?: string;
  receiptNumber?: string;
  eventType:
    | "PAYMENT_RECEIVED"
    | "CREDENTIALS_DELIVERED"
    | "ESCROW_RELEASED"
    | "DISPUTE_OPENED";
}

/**
 * Formats a clean WhatsApp alert message for the administrator.
 */
export function formatAdminOrderAlertMessage(payload: OrderAlertPayload): string {
  const currency = payload.currency || "KES";
  const formattedAmount = `${currency} ${Number(payload.amount).toLocaleString()}`;

  let eventHeader = "🔔 *NEW ORDER PAYMENT RECEIVED*";
  let statusDetail = "Funds safely locked in escrow. Seller alerted to deliver Konami ID.";

  if (payload.eventType === "CREDENTIALS_DELIVERED") {
    eventHeader = "🔑 *CREDENTIALS DELIVERED BY SELLER*";
    statusDetail = "Konami ID email & password encrypted and revealed. Buyer 24-hr inspection timer active.";
  } else if (payload.eventType === "ESCROW_RELEASED") {
    eventHeader = "✅ *ESCROW RELEASED & SETTLED*";
    statusDetail = "Buyer approved inspection. Funds successfully transferred to seller wallet.";
  } else if (payload.eventType === "DISPUTE_OPENED") {
    eventHeader = "🚨 *ESCROW DISPUTE OPENED (ACTION REQUIRED)*";
    statusDetail = "Buyer or seller raised a conflict. Admin investigation and mediation needed.";
  }

  return (
    `${eventHeader}\n\n` +
    `📦 *Order Number:* ${payload.orderNumber}\n` +
    `🎮 *Squad:* ${payload.listingTitle}\n` +
    `💰 *Escrow Volume:* ${formattedAmount}\n` +
    `${payload.receiptNumber ? `🧾 *M-Pesa Receipt:* ${payload.receiptNumber}\n` : ""}` +
    `${payload.buyerPhone ? `📱 *Buyer Phone:* ${payload.buyerPhone}\n` : ""}` +
    `🛡️ *Status:* ${statusDetail}\n\n` +
    `🔗 *Admin Control Center:* https://www.efootballmarket.co.ke/admin`
  );
}

/**
 * Generates direct WhatsApp deep link to message the Admin (0794400365).
 */
export function getAdminWhatsAppAlertUrl(payload: OrderAlertPayload): string {
  const text = formatAdminOrderAlertMessage(payload);
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Dispatches an automated server-side alert log and webhook (if configured).
 */
export async function dispatchAdminOrderAlert(payload: OrderAlertPayload): Promise<void> {
  const alertText = formatAdminOrderAlertMessage(payload);
  console.log(`[ADMIN NOTIFICATION -> ${ADMIN_PHONE_NUMBER}]`, alertText);

  // Optional SMS or Webhook dispatch
  const webhookUrl = process.env.ADMIN_ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: ADMIN_WHATSAPP_NUMBER,
          message: alertText,
          payload,
        }),
      });
    } catch (err) {
      console.error("Failed to forward admin webhook alert:", err);
    }
  }
}
