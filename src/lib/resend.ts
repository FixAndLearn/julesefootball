import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY environment variable is not defined.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const RESEND_CONFIG = {
  fromAddress: process.env.RESEND_FROM_EMAIL || "eFootball Market <notifications@efootballmarket.co.ke>",
  supportAddress: "support@efootballmarket.co.ke",
  domain: "efootballmarket.co.ke",
};

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | string[];
  idempotencyKey?: string;
}

/**
 * Sends a transactional email using the official Resend SDK.
 * Respects strict { data, error } signature and idempotency safeguards.
 */
export async function sendTransactionalEmail(options: SendEmailOptions) {
  const from = RESEND_CONFIG.fromAddress;

  const { data, error } = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo || RESEND_CONFIG.supportAddress,
    headers: {
      "X-Entity-Ref-ID": options.idempotencyKey || `tx-${Date.now()}`,
    },
  });

  if (error) {
    console.error("[Resend Delivery Error]:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
}
