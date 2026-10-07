import crypto from "crypto";
import {
  AnyCallbackBody,
  B2CPayoutParams,
  B2CPayoutResponse,
  ParsedMpesaCallback,
  StkCallbackBody,
  StkPushParams,
  StkPushResponse,
} from "./types";

class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private shortCode: string;
  private passkey: string;
  private callbackUrl: string;
  private baseUrl: string;
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  // UnifiedPay integration
  private unifiedPayKey: string;
  private unifiedPaySecret: string;
  private unifiedPayTill: string;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || "";
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || "";
    this.shortCode = process.env.MPESA_SHORTCODE || "174379";
    this.passkey = process.env.MPESA_PASSKEY || "";
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || "";
    const env = process.env.MPESA_ENV || "sandbox";
    this.baseUrl =
      env === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    // UnifiedPay credentials (can be configured explicitly or mapped from MPESA credentials)
    this.unifiedPayKey =
      process.env.UNIFIEDPAY_CONSUMER_KEY ||
      (this.consumerKey.startsWith("ck_") ? this.consumerKey : "");
    this.unifiedPaySecret =
      process.env.UNIFIEDPAY_CONSUMER_SECRET ||
      (this.consumerSecret.startsWith("cs_") ? this.consumerSecret : "");
    this.unifiedPayTill =
      process.env.UNIFIEDPAY_TILL_NUMBER ||
      process.env.MPESA_SHORTCODE ||
      "1572931";
  }

  public isUnifiedPay(): boolean {
    return Boolean(this.unifiedPayKey && this.unifiedPaySecret);
  }

  /**
   * Normalizes Kenyan phone numbers to the 254XXXXXXXXX format required by Safaricom.
   */
  public normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("07") || cleaned.startsWith("01")) {
      return `254${cleaned.slice(1)}`;
    }
    if (cleaned.startsWith("254")) {
      return cleaned;
    }
    if (cleaned.startsWith("+254")) {
      return cleaned.slice(1);
    }
    if (cleaned.length === 9) {
      return `254${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Obtains an OAuth Access Token from Safaricom with caching.
   */
  public async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiresAt > now + 60000) {
      return this.cachedToken;
    }

    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString("base64");

    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch M-Pesa access token: ${errText}`);
    }

    const data = await response.json();
    this.cachedToken = data.access_token;
    // expires_in is in seconds
    this.tokenExpiresAt = now + parseInt(data.expires_in, 10) * 1000;
    return this.cachedToken!;
  }

  /**
   * Generates formatted timestamp (YYYYMMDDHHmmss) and base64 security password.
   */
  private generatePasswordAndTimestamp(): { password: string; timestamp: string } {
    const date = new Date();
    const YYYY = date.getFullYear().toString();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const DD = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    const timestamp = `${YYYY}${MM}${DD}${hh}${mm}${ss}`;

    const raw = `${this.shortCode}${this.passkey}${timestamp}`;
    const password = Buffer.from(raw).toString("base64");
    return { password, timestamp };
  }

  /**
   * Initiates STK Push (via UnifiedPay or Safaricom Daraja) to customer's handset.
   */
  public async initiateStkPush(params: StkPushParams): Promise<StkPushResponse> {
    const phone = this.normalizePhoneNumber(params.phoneNumber);

    // 1. If configured with UnifiedPay (Till 1572931)
    if (this.isUnifiedPay()) {
      const url = `https://unifiedpay.co.ke/auth/cred/${encodeURIComponent(
        this.unifiedPayKey
      )}/${encodeURIComponent(this.unifiedPaySecret)}/sendstk`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(params.amount),
          msisdn: phone,
          reference: params.orderNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok || (data.ResponseCode && data.ResponseCode !== "0")) {
        const errorMsg =
          data.errorMessage ||
          data.message ||
          `UnifiedPay STK Push failed (HTTP ${response.status})`;
        throw new Error(errorMsg);
      }

      return {
        MerchantRequestID:
          data.MerchantRequestID || data.transaction_request_id || "",
        CheckoutRequestID:
          data.CheckoutRequestID || data.transaction_request_id || "",
        ResponseCode: data.ResponseCode || "0",
        ResponseDescription: data.message || "STK push initiated",
        CustomerMessage:
          data.message ||
          "Please check your phone and enter your M-Pesa PIN to complete payment.",
      };
    }

    // 2. Fallback to Safaricom Daraja API
    if (!this.consumerKey || this.consumerKey === "dummy_consumer_key" || !this.passkey) {
      throw new Error(
        "M-Pesa payment credentials are not configured on this server. Please add UNIFIEDPAY_CONSUMER_KEY and UNIFIEDPAY_CONSUMER_SECRET to your hosting environment variables (e.g., Vercel)."
      );
    }

    const token = await this.getAccessToken();
    const { password, timestamp } = this.generatePasswordAndTimestamp();

    const payload = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(params.amount),
      PartyA: phone,
      PartyB: this.shortCode,
      PhoneNumber: phone,
      CallBackURL: this.callbackUrl,
      AccountReference: params.orderNumber,
      TransactionDesc: params.description || `Order ${params.orderNumber}`,
    };

    const response = await fetch(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`M-Pesa STK Push error: ${err}`);
    }

    return await response.json();
  }

  /**
   * Queries UnifiedPay for real-time transaction status.
   */
  public async checkUnifiedPayStatus(
    transactionId: string
  ): Promise<ParsedMpesaCallback | null> {
    if (!this.isUnifiedPay() || !transactionId) return null;

    try {
      const url = `https://unifiedpay.co.ke/auth/cred/${encodeURIComponent(
        this.unifiedPayKey
      )}/${encodeURIComponent(this.unifiedPaySecret)}/sendstatus`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_request_id: transactionId,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const statusStr = String(data.TransactionStatus || "").toLowerCase();
      const isSuccess = statusStr === "completed" || data.TransactionCode === "0" || data.TransactionCode === 0;

      return {
        merchantRequestId:
          data.MerchantRequestID || data.transaction_request_id || transactionId,
        checkoutRequestId:
          data.CheckoutRequestID || data.transaction_request_id || transactionId,
        resultCode: isSuccess ? 0 : statusStr === "pending" ? 1032 : 1,
        resultDesc:
          data.ResultDesc ||
          (isSuccess ? "Transaction completed successfully" : data.TransactionStatus || "Failed"),
        receiptNumber: data.TransactionReceipt,
        amount: data.TransactionAmount ? Number(data.TransactionAmount) : undefined,
        phoneNumber: data.Msisdn,
        transactionDate: data.TransactionDate,
        isSuccess,
      };
    } catch (err) {
      console.error("UnifiedPay status check error:", err);
      return null;
    }
  }

  /**
   * Verifies HMAC SHA-256 signature from UnifiedPay webhooks.
   */
  public verifyUnifiedPaySignature(rawBody: string, signature?: string | null): boolean {
    if (!this.unifiedPaySecret || !signature) return true;
    try {
      const expected =
        "sha256=" +
        crypto
          .createHmac("sha256", this.unifiedPaySecret)
          .update(rawBody)
          .digest("hex");
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Parses and validates raw webhook callbacks received from UnifiedPay or Safaricom STK Push.
   */
  public parseCallback(body: AnyCallbackBody | any): ParsedMpesaCallback {
    // Check if UnifiedPay webhook format
    if (body.event || body.TransactionStatus || (body.transaction_request_id && !body.Body)) {
      const statusStr = String(body.TransactionStatus || "").toLowerCase();
      const isSuccess =
        body.event === "transaction.completed" ||
        statusStr === "completed" ||
        body.TransactionCode === "0" ||
        body.TransactionCode === 0;

      return {
        merchantRequestId:
          body.MerchantRequestID || body.transaction_request_id || "",
        checkoutRequestId:
          body.CheckoutRequestID || body.transaction_request_id || "",
        resultCode: isSuccess ? 0 : 1,
        resultDesc:
          body.ResultDesc || (isSuccess ? "Completed" : "Transaction failed"),
        receiptNumber: body.TransactionReceipt,
        amount: body.TransactionAmount ? Number(body.TransactionAmount) : undefined,
        phoneNumber: body.Msisdn,
        transactionDate: body.TransactionDate,
        isSuccess,
      };
    }

    // Safaricom Daraja format
    const callback = body?.Body?.stkCallback;
    if (!callback) {
      return {
        merchantRequestId: "",
        checkoutRequestId: "",
        resultCode: 1,
        resultDesc: "Unknown callback structure",
        isSuccess: false,
      };
    }

    const isSuccess = callback.ResultCode === 0;
    let receiptNumber: string | undefined;
    let amount: number | undefined;
    let phoneNumber: string | undefined;
    let transactionDate: string | undefined;

    if (isSuccess && callback.CallbackMetadata?.Item) {
      for (const item of callback.CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") {
          receiptNumber = String(item.Value);
        } else if (item.Name === "Amount") {
          amount = Number(item.Value);
        } else if (item.Name === "PhoneNumber") {
          phoneNumber = String(item.Value);
        } else if (item.Name === "TransactionDate") {
          transactionDate = String(item.Value);
        }
      }
    }

    return {
      merchantRequestId: callback.MerchantRequestID,
      checkoutRequestId: callback.CheckoutRequestID,
      resultCode: callback.ResultCode,
      resultDesc: callback.ResultDesc,
      receiptNumber,
      amount,
      phoneNumber,
      transactionDate,
      isSuccess,
    };
  }

  /**
   * Initiates B2C Payout to seller handset for balance withdrawals.
   */
  public async initiateB2CPayout(params: B2CPayoutParams): Promise<B2CPayoutResponse> {
    const token = await this.getAccessToken();
    const phone = this.normalizePhoneNumber(params.phoneNumber);
    const b2cShortcode = process.env.MPESA_B2C_SHORTCODE || this.shortCode;
    const initiator = process.env.MPESA_B2C_INITIATOR_NAME || "testapi";
    const securityCredential = process.env.MPESA_B2C_SECURITY_CREDENTIAL || "";

    const payload = {
      InitiatorName: initiator,
      SecurityCredential: securityCredential,
      CommandID: "BusinessPayment",
      Amount: Math.round(params.amount),
      PartyA: b2cShortcode,
      PartyB: phone,
      Remarks: params.remarks,
      QueueTimeOutURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/withdrawals/queue-timeout`,
      ResultURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/withdrawals/callback`,
      Occasion: params.occasion || "Withdrawal",
    };

    const response = await fetch(
      `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`M-Pesa B2C Payout error: ${err}`);
    }

    return await response.json();
  }
}

export const mpesaClient = new MpesaService();
