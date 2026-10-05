// ==============================================================================
// Safaricom Daraja API v2 Types
// ==============================================================================

export interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
}

export interface StkPushParams {
  phoneNumber: string; // Format: 2547XXXXXXXX or 2541XXXXXXXX
  amount: number;
  orderNumber: string;
  description?: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface StkCallbackItem {
  Name: string;
  Value?: string | number;
}

export interface StkCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: StkCallbackItem[];
      };
    };
  };
}

export interface ParsedMpesaCallback {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  receiptNumber?: string;
  amount?: number;
  phoneNumber?: string;
  transactionDate?: string;
  isSuccess: boolean;
}

export interface B2CPayoutParams {
  phoneNumber: string;
  amount: number;
  remarks: string;
  occasion?: string;
}

export interface B2CPayoutResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}
