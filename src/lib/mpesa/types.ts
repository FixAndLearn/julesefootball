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

export interface UnifiedPayStkResponse {
  ResponseCode: string;
  success?: boolean;
  message?: string;
  transaction_request_id?: string;
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  party_b?: string;
  account_reference?: string;
  transaction_type?: string;
  errorMessage?: string;
}

export interface UnifiedPayStatusResponse {
  ResultCode?: string | number;
  transaction_request_id?: string;
  TransactionStatus?: string;
  TransactionCode?: string | number;
  ResultDesc?: string;
  TransactionReceipt?: string;
  TransactionAmount?: string | number;
  Msisdn?: string;
  TransactionDate?: string;
  TransactionReference?: string;
  CheckoutRequestID?: string;
  MerchantRequestID?: string;
  errorMessage?: string;
}

export interface UnifiedPayWebhookBody {
  event?: string;
  transaction_request_id?: string;
  TransactionStatus?: string;
  TransactionCode?: string | number;
  ResultDesc?: string;
  TransactionReceipt?: string;
  TransactionAmount?: string | number;
  Msisdn?: string;
  TransactionDate?: string;
  TransactionReference?: string;
  CheckoutRequestID?: string;
  MerchantRequestID?: string;
}

export type AnyCallbackBody = StkCallbackBody | UnifiedPayWebhookBody;
