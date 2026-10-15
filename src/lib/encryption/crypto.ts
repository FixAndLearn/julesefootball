import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Cryptographic Utilities for Game Account Credentials Vault
 *
 * ARCHITECTURAL CONTEXT:
 * 1. AES-256-GCM Authenticated Encryption:
 *    Encrypts sensitive game credentials before storage in `account_deliveries`.
 *    A fresh random 16-byte IV is generated for every encryption operation.
 *
 * 2. Shared Key Model & Cryptographic Erasure Limits:
 *    The 32-byte key is derived from the shared environment variable `CREDENTIAL_ENCRYPTION_KEY`.
 *    Because this key is shared across all delivery records, per-record cryptographic erasure
 *    (crypto-shredding) is NOT possible simply by destroying the key, as doing so would invalidate
 *    decryption for all other active orders.
 *
 * 3. Database Deletion Limits:
 *    Nullifying database columns or deleting rows removes active references, but under PostgreSQL MVCC,
 *    Write-Ahead Logging (WAL), and provider backup snapshots, residual data may persist until vacuumed,
 *    reused, and until historical backup retention windows naturally expire.
 */

/**
 * Derives a 32-byte key from CREDENTIAL_ENCRYPTION_KEY or a fallback for testing.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY || "efootball-market-default-encryption-secret-key-32b";
  return crypto.createHash("sha256").update(secret).digest();
}

export interface EncryptedPayload {
  iv: string;
  tag: string;
  ciphertext: string;
}

/**
 * Encrypts sensitive string using AES-256-GCM authenticated encryption.
 */
export function encryptCredential(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    ciphertext: encrypted,
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Decrypts AES-256-GCM ciphertext payload back to plaintext.
 */
export function decryptCredential(encryptedBase64: string): string {
  if (!encryptedBase64) return "";
  try {
    const raw = Buffer.from(encryptedBase64, "base64").toString("utf8");
    const payload: EncryptedPayload = JSON.parse(raw);

    const key = getEncryptionKey();
    const iv = Buffer.from(payload.iv, "hex");
    const tag = Buffer.from(payload.tag, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    // Avoid logging raw errors or input payloads to prevent secret leakage
    console.error("Failed to decrypt credential payload: authentication tag mismatch or malformed payload.");
    throw new Error("Decryption failed. Credential payload was tampered with or key is invalid.");
  }
}
