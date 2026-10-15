import { createAdminClient } from "@/lib/supabase/admin";
import { formatWhatsAppPhone } from "@/lib/utils/phone";
import { sendWhatsAppMessage } from "@/lib/whatsapp/cloudApi";
import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 1. Webhook Verification (GET) - Required by Meta WhatsApp Cloud API
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "efootball_market_webhook_verify";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[WhatsApp:Webhook] Meta Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden: Verification Token Mismatch", { status: 403 });
}

/**
 * 2. Inbound Message & Notification Event Handler (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle Meta Cloud API payload structure
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const messageData = change?.messages?.[0];

    // Handle generic gateway structure (UltraMsg, Wassenger)
    const sender =
      messageData?.from ||
      body?.data?.from ||
      body?.from ||
      body?.phone ||
      "";
    const text =
      messageData?.text?.body ||
      messageData?.interactive?.button_reply?.title ||
      body?.data?.body ||
      body?.message ||
      body?.body ||
      "";

    if (!sender || !text) {
      // Could be a status update (delivered, read) - acknowledge with 200
      return NextResponse.json({ status: "acknowledged" });
    }

    const cleanSender = formatWhatsAppPhone(sender);
    const trimmedText = text.trim().toUpperCase();

    console.log(`[WhatsApp:Inbound] Received message from ${cleanSender}: "${text}"`);

    // Automated 24/7 Bot Assistant responses
    if (trimmedText === "HI" || trimmedText === "HELLO" || trimmedText === "MENU" || trimmedText === "HELP" || trimmedText === "START") {
      const menu =
        `⚽ *Welcome to eFootballMarket Kenya!*\n\n` +
        `🛡️ Escrow-Protected trading for Konami IDs, Coins & Squads.\n\n` +
        `*Quick Commands (Reply with a number):*\n` +
        `*1* ➔ Verify M-Pesa Till 1572931\n` +
        `*2* ➔ How Escrow Protection Works\n` +
        `*3* ➔ Check Order Status\n` +
        `*4* ➔ Bring-Your-Own-Deal Middleman\n` +
        `*5* ➔ Speak with CEO Brian Okibo\n\n` +
        `🔗 *Browse Squads:* https://www.efootballmarket.co.ke`;

      await sendWhatsAppMessage({ toPhone: cleanSender, message: menu });
      return NextResponse.json({ status: "replied_menu" });
    }

    if (trimmedText === "1" || trimmedText.includes("TILL")) {
      const tillInfo =
        `🟢 *OFFICIAL SAFARICOM M-PESA PAYMENT DETAILS*\n\n` +
        `🏪 *Store Name:* EFootballMarket\n` +
        `🏷️ *Buy Goods Till Number:* *1572931*\n` +
        `👤 *Escrow Officer:* Brian Okibo (+254 794 400 365)\n\n` +
        `⚠️ *Safety Warning:* Never send funds directly to an individual's phone number. All protected trades must go to Till *1572931* so escrow can lock the funds safely.`;

      await sendWhatsAppMessage({ toPhone: cleanSender, message: tillInfo });
      return NextResponse.json({ status: "replied_till" });
    }

    if (trimmedText === "2" || trimmedText.includes("ESCROW")) {
      const escrowInfo =
        `🛡️ *HOW EFOOTBALLMARKET ESCROW WORKS*\n\n` +
        `1️⃣ Buyer pays via Till *1572931*.\n` +
        `2️⃣ Funds are locked in our escrow vault — the seller is NOT paid yet.\n` +
        `3️⃣ Seller delivers the Konami ID & password into our encrypted portal.\n` +
        `4️⃣ Buyer verifies players, coins, and changes the email/password.\n` +
        `5️⃣ Only when the buyer confirms satisfaction are funds released to the seller.\n\n` +
        `_Verified trades. 24-hour buyer inspection protection._`;

      await sendWhatsAppMessage({ toPhone: cleanSender, message: escrowInfo });
      return NextResponse.json({ status: "replied_escrow" });
    }

    if (trimmedText === "3" || trimmedText.startsWith("STATUS") || trimmedText.startsWith("EFM-") || trimmedText.startsWith("ORD-")) {
      // Try extracting order reference
      const orderRef = text.trim().replace(/^STATUS\s*/i, "");
      const supabase = createAdminClient();

      const { data: order } = await supabase
        .from("orders")
        .select("order_number, status, total_amount, listing:listings(title)")
        .or(`order_number.ilike.%${orderRef}%,id.eq.${orderRef}`)
        .limit(1)
        .maybeSingle();

      if (order) {
        const orderReply =
          `📦 *ORDER #${order.order_number} STATUS*\n\n` +
          `🎮 *Squad:* ${(order.listing as any)?.title || "Account"}\n` +
          `💵 *Amount:* KES ${Number(order.total_amount).toLocaleString()}\n` +
          `🛡️ *Status:* *${order.status.toUpperCase().replace(/_/g, " ")}*\n\n` +
          `👉 *View Order Portal:* https://www.efootballmarket.co.ke/orders/${order.order_number}`;

        await sendWhatsAppMessage({ toPhone: cleanSender, message: orderReply });
      } else {
        const notFoundReply =
          `🔍 Order *"${orderRef}"* not found.\n\n` +
          `Please provide your full order number (e.g. *EFM-XXXX-123*). You can find this on your email receipt or order page.`;

        await sendWhatsAppMessage({ toPhone: cleanSender, message: notFoundReply });
      }
      return NextResponse.json({ status: "replied_order" });
    }

    if (trimmedText === "4" || trimmedText.includes("MIDDLEMAN")) {
      const middlemanInfo =
        `🤝 *BRING-YOUR-OWN-DEAL (BYOD) MIDDLEMAN*\n\n` +
        `Found a trader on Facebook or WhatsApp? Stop arguing about who sends first!\n\n` +
        `1. Create a safe escrow contract in 30 seconds at:\n` +
        `https://www.efootballmarket.co.ke/middleman\n` +
        `2. Buyer locks M-Pesa to Till 1572931.\n` +
        `3. Seller delivers Konami ID.\n` +
        `4. Both parties are protected under our escrow protocol. Escrow fee is only 5%.`;

      await sendWhatsAppMessage({ toPhone: cleanSender, message: middlemanInfo });
      return NextResponse.json({ status: "replied_middleman" });
    }

    if (trimmedText === "5" || trimmedText.includes("AGENT") || trimmedText.includes("BRIAN")) {
      const agentReply =
        `👤 *CONNECTING TO BRIAN OKIBO (CEO)*\n\n` +
        `Your message has been escalated to Brian Okibo (+254 794 400 365).\n` +
        `You can also reach him directly on WhatsApp: https://wa.me/254794400365\n\n` +
        `An officer will get back to you shortly. Thank you!`;

      await sendWhatsAppMessage({ toPhone: cleanSender, message: agentReply });

      // Notify Brian Okibo of customer escalation
      dispatchAdminWhatsAppAlert({
        eventType: "NEW_ORDER_CREATED", // reuse payload
        listingTitle: "Customer requested live WhatsApp support",
        buyerPhone: cleanSender,
        details: `Message: "${text}"`,
      }).catch(() => {});

      return NextResponse.json({ status: "escalated_agent" });
    }

    // Default friendly fallback
    const fallback =
      `👋 Thank you for contacting *eFootballMarket*!\n\n` +
      `We received your message: _"${text}"_\n\n` +
      `Reply with *MENU* to see options or *5* to chat with CEO Brian Okibo (+254 794 400 365).\n\n` +
      `Official Website: https://www.efootballmarket.co.ke`;

    await sendWhatsAppMessage({ toPhone: cleanSender, message: fallback });
    return NextResponse.json({ status: "replied_default" });
  } catch (error: any) {
    console.error("[WhatsApp:Webhook] Inbound error:", error);
    return NextResponse.json({ error: error.message }, { status: 200 }); // Always 200 for Meta
  }
}
