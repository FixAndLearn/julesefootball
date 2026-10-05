import {
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
   * Initiates STK Push (Lipa Na M-Pesa Online) to customer's handset.
   */
  public async initiateStkPush(params: StkPushParams): Promise<StkPushResponse> {
    const token = await this.getAccessToken();
    const { password, timestamp } = this.generatePasswordAndTimestamp();
    const phone = this.normalizePhoneNumber(params.phoneNumber);

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
   * Parses and validates raw webhook callbacks received from Safaricom STK Push.
   */
  public parseCallback(body: StkCallbackBody): ParsedMpesaCallback {
    const callback = body.Body.stkCallback;
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
