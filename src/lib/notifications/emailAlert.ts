import { sendTransactionalEmail } from "@/lib/resend";

/**
 * Dispatches a 6-digit OTP verification code email with responsive dark-mode styling.
 */
export async function sendOtpVerificationEmail(params: {
  email: string;
  code: string;
  purpose?: "signup" | "login";
}) {
  const isSignup = params.purpose === "signup";
  const title = isSignup ? "Verify Your eFootball Market Account" : "Your 6-Digit Sign-In Code";
  const intro = isSignup
    ? "Welcome to eFootball Market. Please use the following 6-digit code to complete your registration:"
    : "Use this 6-digit code to securely sign in to your eFootball Market escrow dashboard:";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b1120; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #111c33; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <!-- Header -->
                <tr>
                  <td style="padding: 28px 32px; background: linear-gradient(135deg, #065f46 0%, #047857 100%); text-align: center;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">eFootball Market</h1>
                    <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">Institutional Escrow &amp; Account Exchange</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px 32px 24px;">
                    <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #f8fafc;">${title}</h2>
                    <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94a3b8;">${intro}</p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #0b1324; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #10b981; display: inline-block;">
                        ${params.code}
                      </span>
                    </div>

                    <p style="margin: 16px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                      This code is valid for <strong>10 minutes</strong>. Never share this code with anyone. eFootball Market staff will never request your code.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #0b1324; border-top: 1px solid #1e293b; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #64748b;">
                      &copy; ${new Date().getFullYear()} eFootball Market Kenya (efootballmarket.co.ke). All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendTransactionalEmail({
    to: params.email,
    subject: `${params.code} is your eFootball Market verification code`,
    html,
    text: `Your eFootball Market verification code is: ${params.code}. Valid for 10 minutes.`,
    idempotencyKey: `otp-${params.email}-${Date.now()}`,
  });
}

/**
 * Dispatches an escrow payment received notice to the seller.
 */
export async function sendEscrowPaymentReceivedEmail(params: {
  sellerEmail: string;
  sellerName: string;
  buyerName: string;
  orderId: string;
  amount: number;
  squadTitle: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin: 0; padding: 0; background-color: #0b1120; font-family: sans-serif; color: #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #111c33; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px; background-color: #047857; text-align: center; color: white;">
                    <h2 style="margin: 0;">Payment Secured in Escrow</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #cbd5e1;">Hi <strong>${params.sellerName}</strong>,</p>
                    <p style="margin: 0 0 16px; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                      Buyer <strong>${params.buyerName}</strong> has deposited <strong>KES ${params.amount.toLocaleString()}</strong> into institutional escrow for your listing:
                    </p>
                    <div style="background-color: #0b1324; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; margin: 16px 0;">
                      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #38bdf8;">${params.squadTitle}</p>
                      <p style="margin: 4px 0 0; font-size: 11px; color: #64748b;">Order Ref: #${params.orderId.slice(0, 8)}</p>
                    </div>
                    <p style="margin: 16px 0; font-size: 13px; color: #f59e0b; line-height: 1.5;">
                      Please log in to your dashboard to deliver the Konami ID credentials to the buyer. Funds will be released to your M-Pesa immediately upon buyer confirmation.
                    </p>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="https://www.efootballmarket.co.ke/orders/${params.orderId}" style="background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block;">
                        Deliver Account Credentials
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendTransactionalEmail({
    to: params.sellerEmail,
    subject: `Payment Secured: KES ${params.amount.toLocaleString()} in Escrow for Order #${params.orderId.slice(0, 8)}`,
    html,
    text: `Payment of KES ${params.amount.toLocaleString()} has been received in escrow for Order #${params.orderId.slice(0, 8)}. Please log in to deliver credentials.`,
    idempotencyKey: `escrow-pay-${params.orderId}`,
  });
}
