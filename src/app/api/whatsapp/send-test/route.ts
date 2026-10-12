import { NextRequest, NextResponse } from "next/server";
import { getActiveWhatsAppProvider, isWhatsAppConfigured, sendWhatsAppMessage } from "@/lib/whatsapp/cloudApi";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { toPhone, message } = await req.json();

    const target = toPhone || "254794400365";
    const content =
      message ||
      `🔔 *eFootballMarket WhatsApp Test*\n\n` +
      `Your automated WhatsApp integration is WORKING!\n` +
      `Active Provider: ${getActiveWhatsAppProvider()}\n` +
      `Time: ${new Date().toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi" })} EAT\n\n` +
      `🛡️ Escrow Till: 1572931 (EFootballMarket)`;

    const result = await sendWhatsAppMessage({
      toPhone: target,
      message: content,
    });

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      recipient: result.recipient,
      messageId: result.messageId,
      error: result.error,
      configuredProvider: getActiveWhatsAppProvider(),
      isConfigured: isWhatsAppConfigured(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    isConfigured: isWhatsAppConfigured(),
    activeProvider: getActiveWhatsAppProvider(),
    metaCloudConfigured: Boolean(
      (process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.META_WHATSAPP_TOKEN) &&
      process.env.WHATSAPP_PHONE_NUMBER_ID
    ),
    ultramsgConfigured: Boolean(
      (process.env.ULTRAMSG_INSTANCE_ID || process.env.ULTRAMSG_INSTANCE) &&
      process.env.ULTRAMSG_TOKEN
    ),
    wassengerConfigured: Boolean(process.env.WASSENGER_TOKEN || process.env.WASSENGER_API_KEY),
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  });
}
