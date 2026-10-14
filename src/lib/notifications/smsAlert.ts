/**
 * SMS Notification Dispatcher for eFootballMarket
 * Tailored for Kenyan mobile subscribers (Safaricom, Airtel, Telkom).
 * Supports Africa's Talking, Advanta SMS, and resilient fallback delivery logging.
 */

export interface SmsDispatchPayload {
  toPhone: string;
  message: string;
  senderId?: string;
}

export interface SmsDispatchResult {
  success: boolean;
  provider: "africas_talking" | "advanta" | "simulated_local" | "error";
  messageId?: string;
  recipient: string;
  error?: string;
}

/**
 * Normalizes Kenyan phone numbers to international format +254XXXXXXXXX
 */
export function formatKenyanPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  } else if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }

  return "+" + cleaned;
}

/**
 * Primary dispatch function sending an SMS to a Kenyan phone number.
 */
export async function sendSmsAlert({
  toPhone,
  message,
  senderId = "EFOOTBALLMKT",
}: SmsDispatchPayload): Promise<SmsDispatchResult> {
  const normalizedPhone = formatKenyanPhone(toPhone);

  if (!normalizedPhone || normalizedPhone.length < 12) {
    return {
      success: false,
      provider: "error",
      recipient: toPhone,
      error: `Invalid Kenyan phone number format: "${toPhone}".`,
    };
  }

  // ---------------------------------------------------------------------------
  // 1. Check for Africa's Talking API Credentials
  // ---------------------------------------------------------------------------
  const atApiKey = process.env.AT_API_KEY || process.env.AFRICASTALKING_API_KEY;
  const atUsername = process.env.AT_USERNAME || process.env.AFRICASTALKING_USERNAME;

  if (atApiKey && atUsername) {
    try {
      const endpoint =
        atUsername === "sandbox"
          ? "https://api.sandbox.africastalking.com/version1/messaging"
          : "https://api.africastalking.com/version1/messaging";

      const formData = new URLSearchParams();
      formData.append("username", atUsername);
      formData.append("to", normalizedPhone);
      formData.append("message", message);
      if (process.env.AT_SENDER_ID) {
        formData.append("from", process.env.AT_SENDER_ID);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          apiKey: atApiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData.toString(),
      });

      const data = await res.json();
      const recipientData = data?.SMSMessageData?.Recipients?.[0];

      if (recipientData && (recipientData.status === "Success" || recipientData.statusCode === 101)) {
        console.log(`[SMS:AT] Successfully sent to ${normalizedPhone}: ${recipientData.messageId}`);
        return {
          success: true,
          provider: "africas_talking",
          messageId: recipientData.messageId,
          recipient: normalizedPhone,
        };
      }
    } catch (atErr: any) {
      console.warn("[SMS:AT] Africa's Talking dispatch failed, falling back:", atErr?.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Check for Advanta SMS API Credentials
  // ---------------------------------------------------------------------------
  const advantaApiKey = process.env.ADVANTA_API_KEY;
  const advantaPartnerId = process.env.ADVANTA_PARTNER_ID;

  if (advantaApiKey && advantaPartnerId) {
    try {
      const payload = {
        apikey: advantaApiKey,
        partnerID: advantaPartnerId,
        message,
        shortcode: process.env.ADVANTA_SENDER_ID || "ADVANTA",
        mobile: normalizedPhone.replace("+", ""),
      };

      const res = await fetch("https://quicksms.advantasms.com/api/services/sendsms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data?.responses?.[0]?.["response-code"] === 200) {
        console.log(`[SMS:ADVANTA] Successfully sent to ${normalizedPhone}`);
        return {
          success: true,
          provider: "advanta",
          messageId: data.responses[0]["messageid"],
          recipient: normalizedPhone,
        };
      }
    } catch (advErr: any) {
      console.warn("[SMS:ADVANTA] Advanta dispatch failed, falling back:", advErr?.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Fallback / Local Dev Mode (Simulated SMS Dispatch with Complete Audit Log)
  // ---------------------------------------------------------------------------
  const simulatedId = `sim_sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  console.log(`=======================================================`);
  console.log(`[KENYA SMS ALERT] Dispatched to: ${normalizedPhone}`);
  console.log(`[SENDER ID] ${senderId}`);
  console.log(`[MESSAGE CONTENT]`);
  console.log(message);
  console.log(`=======================================================`);

  return {
    success: true,
    provider: "simulated_local",
    messageId: simulatedId,
    recipient: normalizedPhone,
  };
}

/**
 * -----------------------------------------------------------------------------
 * Domain-Specific Lifecycle SMS Dispatchers
 * -----------------------------------------------------------------------------
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";

/**
 * Alert seller immediately when a buyer finishes paying Lipa Na M-Pesa.
 */
export async function sendSellerOrderReceivedSms(
  sellerPhone: string,
  orderNumber: string,
  amountKes: number,
  listingTitle: string,
  orderId: string
): Promise<SmsDispatchResult> {
  const shortTitle = listingTitle.length > 25 ? listingTitle.slice(0, 22) + "..." : listingTitle;
  const message = `EFootballMarket: Account "${shortTitle}" was bought for KES ${amountKes}! KES is secured in Escrow. Log in now to deliver credentials: ${BASE_URL}/orders/${orderId}`;
  return sendSmsAlert({ toPhone: sellerPhone, message });
}

/**
 * Alert buyer immediately that M-Pesa payment is confirmed and escrow is active.
 */
export async function sendBuyerPaymentConfirmedSms(
  buyerPhone: string,
  orderNumber: string,
  amountKes: number,
  orderId: string
): Promise<SmsDispatchResult> {
  const message = `EFootballMarket: Order #${orderNumber} confirmed! KES ${amountKes} is safely held in Escrow. The seller has 12h to deliver: ${BASE_URL}/orders/${orderId}`;
  return sendSmsAlert({ toPhone: buyerPhone, message });
}

/**
 * Alert buyer immediately when seller has delivered Konami ID credentials into the vault.
 */
export async function sendBuyerCredentialsDeliveredSms(
  buyerPhone: string,
  orderNumber: string,
  orderId: string
): Promise<SmsDispatchResult> {
  const message = `EFootballMarket: Seller has uploaded Konami ID credentials for Order #${orderNumber}! Log in to inspect the squad & bind your email: ${BASE_URL}/orders/${orderId}`;
  return sendSmsAlert({ toPhone: buyerPhone, message });
}

/**
 * Alert seller immediately when buyer completes inspection and releases escrow funds.
 */
export async function sendSellerFundsReleasedSms(
  sellerPhone: string,
  orderNumber: string,
  netAmountKes: number
): Promise<SmsDispatchResult> {
  const message = `EFootballMarket: Handover complete for Order #${orderNumber}! KES ${netAmountKes} is credited to your wallet balance. You can withdraw to M-Pesa anytime.`;
  return sendSmsAlert({ toPhone: sellerPhone, message });
}

/**
 * Alert seller immediately when an M-Pesa withdrawal is completed or rejected.
 */
export async function sendSellerWithdrawalStatusSms(
  sellerPhone: string,
  amountKes: number,
  status: "completed" | "rejected",
  failureReason?: string
): Promise<SmsDispatchResult> {
  const message =
    status === "completed"
      ? `EFootballMarket: Your M-Pesa withdrawal of KES ${amountKes.toLocaleString()} has been approved & disbursed! Check your M-Pesa for incoming funds.`
      : `EFootballMarket: Withdrawal of KES ${amountKes.toLocaleString()} could not be processed.${failureReason ? ` Reason: ${failureReason}.` : ""} Funds refunded to your balance.`;
  return sendSmsAlert({ toPhone: sellerPhone, message });
}

/**
 * Alert seller immediately when a buyer submits a price offer / bargain.
 */
export async function sendSellerOfferReceivedSms(
  sellerPhone: string,
  buyerName: string,
  offeredPrice: number,
  originalPrice: number,
  listingTitle: string,
  listingId: string
): Promise<SmsDispatchResult> {
  const shortTitle = listingTitle.length > 25 ? listingTitle.slice(0, 22) + "..." : listingTitle;
  const message = `EFootballMarket: ${buyerName} offered KES ${offeredPrice.toLocaleString()} (was KES ${originalPrice.toLocaleString()}) for "${shortTitle}". Review, accept or counter now: ${BASE_URL}/listings/${listingId}`;
  return sendSmsAlert({ toPhone: sellerPhone, message });
}

/**
 * Alert buyer immediately when seller responds to an offer (accept, counter, or decline).
 */
export async function sendBuyerOfferResponseSms(
  buyerPhone: string,
  action: "accepted" | "countered" | "declined",
  price: number,
  listingTitle: string,
  actionUrl: string
): Promise<SmsDispatchResult> {
  const shortTitle = listingTitle.length > 25 ? listingTitle.slice(0, 22) + "..." : listingTitle;
  let message = "";
  if (action === "accepted") {
    message = `EFootballMarket: Great news! The seller ACCEPTED your offer of KES ${price.toLocaleString()} for "${shortTitle}". Complete checkout via Till 1572931 within 12h: ${BASE_URL}${actionUrl}`;
  } else if (action === "countered") {
    message = `EFootballMarket: The seller countered your offer for "${shortTitle}" with KES ${price.toLocaleString()}. Review & accept here: ${BASE_URL}${actionUrl}`;
  } else {
    message = `EFootballMarket: The seller could not accept your offer for "${shortTitle}". You can submit a revised offer or buy at asking price: ${BASE_URL}${actionUrl}`;
  }
  return sendSmsAlert({ toPhone: buyerPhone, message });
}
