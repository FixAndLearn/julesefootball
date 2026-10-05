import { decryptCredential, encryptCredential } from "../src/lib/encryption/crypto";
import { mpesaClient } from "../src/lib/mpesa/client";
import { StkCallbackBody } from "../src/lib/mpesa/types";
import assert from "assert";

console.log("==================================================");
console.log("eFootballMarket Production Verification Test Suite");
console.log("==================================================");

// 1. Test AES-256-GCM Authenticated Encryption & Decryption
console.log("\n[TEST 1] Testing AES-256-GCM Credential Encryption & Decryption...");
const secretKonamiEmail = "gamer_pes_2026@gmail.com";
const secretKonamiPassword = "P@ssw0rd_Super_Secure_99#";
const backupCodes = "982314, 551209, 331405";

const encryptedEmail = encryptCredential(secretKonamiEmail);
const encryptedPassword = encryptCredential(secretKonamiPassword);
const encryptedBackup = encryptCredential(backupCodes);

assert.notStrictEqual(encryptedEmail, secretKonamiEmail, "Ciphertext must not match plaintext");
assert.strictEqual(decryptCredential(encryptedEmail), secretKonamiEmail, "Decrypted email must match original");
assert.strictEqual(decryptCredential(encryptedPassword), secretKonamiPassword, "Decrypted password must match original");
assert.strictEqual(decryptCredential(encryptedBackup), backupCodes, "Decrypted backup codes must match original");

// Tamper test
let tampered = Buffer.from(encryptedEmail, "base64").toString("utf8");
tampered = tampered.replace(/[a-f0-9]/, "x");
const tamperedBase64 = Buffer.from(tampered).toString("base64");
assert.throws(() => {
  decryptCredential(tamperedBase64);
}, "Tampered ciphertext must fail authentication tag check");
console.log("✓ AES-256-GCM Encryption, Decryption, and Tamper Detection PASSED.");

// 2. Test Safaricom Phone Number Normalization
console.log("\n[TEST 2] Testing Safaricom M-Pesa Phone Number Normalization...");
assert.strictEqual(mpesaClient.normalizePhoneNumber("0712345678"), "254712345678");
assert.strictEqual(mpesaClient.normalizePhoneNumber("0112345678"), "254112345678");
assert.strictEqual(mpesaClient.normalizePhoneNumber("+254712345678"), "254712345678");
assert.strictEqual(mpesaClient.normalizePhoneNumber("254712345678"), "254712345678");
console.log("✓ Phone number normalization (07/01/+254 -> 254) PASSED.");

// 3. Test Daraja STK Push Webhook Callback Parser
console.log("\n[TEST 3] Testing Daraja STK Webhook Callback Parsing...");
const mockSuccessCallback: StkCallbackBody = {
  Body: {
    stkCallback: {
      MerchantRequestID: "29115-34620561-1",
      CheckoutRequestID: "ws_CO_191220261025539999",
      ResultCode: 0,
      ResultDesc: "The service request is processed successfully.",
      CallbackMetadata: {
        Item: [
          { Name: "Amount", Value: 4500 },
          { Name: "MpesaReceiptNumber", Value: "SKB18290AZ" },
          { Name: "TransactionDate", Value: 20261005183000 },
          { Name: "PhoneNumber", Value: 254712345678 },
        ],
      },
    },
  },
};

const parsedSuccess = mpesaClient.parseCallback(mockSuccessCallback);
assert.strictEqual(parsedSuccess.isSuccess, true);
assert.strictEqual(parsedSuccess.receiptNumber, "SKB18290AZ");
assert.strictEqual(parsedSuccess.amount, 4500);
assert.strictEqual(parsedSuccess.phoneNumber, "254712345678");
assert.strictEqual(parsedSuccess.checkoutRequestId, "ws_CO_191220261025539999");

const mockFailCallback: StkCallbackBody = {
  Body: {
    stkCallback: {
      MerchantRequestID: "29115-34620561-2",
      CheckoutRequestID: "ws_CO_191220261025540001",
      ResultCode: 1032,
      ResultDesc: "Request cancelled by user.",
    },
  },
};

const parsedFail = mpesaClient.parseCallback(mockFailCallback);
assert.strictEqual(parsedFail.isSuccess, false);
assert.strictEqual(parsedFail.resultCode, 1032);
assert.strictEqual(parsedFail.resultDesc, "Request cancelled by user.");
console.log("✓ Daraja Callback parser for Success and Cancellation PASSED.");

console.log("\n==================================================");
console.log("ALL VERIFICATION SUITE ASSERTIONS PASSED (100% OK)");
console.log("==================================================");
