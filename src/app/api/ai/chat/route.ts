import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_INSTRUCTIONS = `You are the official 24/7 AI Support & Escrow Coach for eFootballMarket (efootballmarket.co.ke), Kenya's number one verified eFootball mobile and console account trading platform.

CEO & Administrator: Brian Okibo (Phone / WhatsApp: +254 794 400 365, Till Number: 1572931).

YOUR CORE RESPONSIBILITIES:
1. Explain the Safaricom M-Pesa Escrow process clearly:
   - Stage 1: Buyer pays via Lipa Na M-Pesa STK Push directly to Till 1572931.
   - Stage 2: Funds are locked safely in escrow custody. The seller cannot touch or withdraw the money.
   - Stage 3: Seller delivers credentials via encrypted vault or in the Order Chat.
   - Stage 4: Buyer logs in, tests the squad, changes password, updates email to their own personal email on my.konami.net, enables 2FA, and verifies zero Google Play link.
   - Stage 5: Once fully satisfied and safe, buyer releases funds to the seller.

2. Anti-Googling Rule (Crucial Safety Policy):
   - In eFootball, an account linked to Google Play Games cannot have the Google link removed or transferred.
   - If a seller has linked Google Play, they can log into the game using their Google account at any time and steal the account back.
   - Buyers MUST check in-game: Extras -> Support -> Link Data.
   - If Google Play says "Linked", the exchange must NEVER proceed. The buyer must NOT release funds and must immediately raise a dispute.

3. Konami ID Handover Checklist (5 Points):
   1. Account Inspection: Verify squad players, manager, Epics, coins match listing.
   2. Email Change: Go to my.konami.net -> Update registered email to buyer's email -> Enter confirmation OTP code.
   3. Password & Security Question: Change password to a strong new private password and update security question.
   4. Two-Step Verification (2FA): Turn on 2-Step OTP on buyer's own email to lock out any previous devices.
   5. Google Play Verification: Check Extras -> Support -> Link Data -> Confirm Google Play says "Not Linked".

4. Post-Release Dispute Protection:
   - Even after funds are released, if a buyer discovers the seller reclaimed the account, an unmentioned Google link was present, or coin bans happened due to seller fraud, the buyer can click "Raise Post-Release Dispute".
   - The platform freezes the seller's wallet balance from M-Pesa withdrawal and platform administration audits Konami recovery logs.

5. Bargaining / Make an Offer:
   - Buyers can suggest a custom price (up to 50% discount).
   - Sellers receive automated alerts and can Accept, Counter-offer ("adjust this to this"), or Decline with a reason.

6. Direct Escalation:
   - For payment delays, account fraud, or executive mediation, recommend contacting CEO Brian Okibo on WhatsApp at +254 794 400 365 or calling 0794400365.

CRITICAL FORMATTING RULES:
- Never use any bullet dots or bullet symbols (no bullet characters, no asterisks as bullets). Use numbered lists (1., 2., 3.) or clean bold headings instead.
- Be concise, friendly, encouraging, and authoritative.
- You understand English, Swahili, and Kenyan Sheng (e.g., "bob", "kuibiwa", "squad", "pesa").`;

/**
 * Intelligent Fallback Knowledge Matcher when no Gemini API key is configured.
 */
function getSmartFallbackResponse(userQuery: string): string {
  const query = userQuery.toLowerCase();

  if (query.includes("google") || query.includes("googling") || query.includes("unlink")) {
    return `Anti-Googling Policy & Safety Protocol:

Never accept or finalize an eFootball account that has Google Play Games linked.

Why is this dangerous?
In eFootball Mobile, Google Play Games links cannot be changed to another Google account. If the seller already linked their Google account, they can log back into eFootball anytime using Google Play, even after you change the Konami ID email and password.

How to check in-game:
1. Open eFootball on your phone.
2. Tap Extras -> Support -> Link Data.
3. Check the Google Play Games section.
4. It MUST say "Not Linked".
5. If it says "Linked", stop immediately, do NOT release funds, and click "Report Problem / Dispute" on your order page.`;
  }

  if (query.includes("email") || query.includes("change email") || query.includes("konami id") || query.includes("password")) {
    return `How to Change Konami ID Email & Password Safely:

Follow these 4 steps to secure full ownership:

1. Visit the official Konami portal at my.konami.net on your browser.
2. Log in using the Konami ID email and temporary password provided in your order.
3. Tap "Security" -> Update Password to your own private password.
4. Tap "Email Address" -> Enter your personal email address -> Check your inbox for the 6-digit Konami OTP code and enter it to confirm.
5. Turn on 2-Step Verification (2FA) so any new login requires an OTP sent to your new email.

Once you confirm your new email works, return to eFootballMarket and release the funds to the seller.`;
  }

  if (query.includes("escrow") || query.includes("how it works") || query.includes("safe") || query.includes("process") || query.includes("guide")) {
    return `How eFootballMarket Escrow Works:

Our escrow system protects both buyers and sellers using Safaricom M-Pesa Till 1572931:

1. Step 1: Payment in Custody
The buyer triggers an M-Pesa STK Push. Funds are locked into platform escrow. The seller cannot withdraw the money.

2. Step 2: Credentials Delivery
The seller delivers the Konami ID credentials either through the encrypted vault or in the live Order Chat.

3. Step 3: 24-Hour Inspection Window
The buyer logs into eFootball, verifies squad Epics and coin balance, changes the email on my.konami.net, sets up 2FA, and confirms Google Play is Not Linked.

4. Step 4: Release & Payout
Once the buyer verifies everything is 100% secure, they tap "Complete Handover & Release Funds". The payout is credited to the seller's available balance.

If any problem occurs at any stage, you can raise an escrow dispute and funds remain locked.`;
  }

  if (query.includes("dispute") || query.includes("scam") || query.includes("stolen") || query.includes("recover") || query.includes("refund")) {
    return `How Escrow Disputes & Refunds Work:

You are protected before AND after funds are released.

Active Order Dispute:
If credentials do not work, squad players do not match, or the seller linked Google Play, click the red "Report Problem / Dispute" button on the order page. Escrow funds are frozen immediately.

Post-Release Dispute (After Handover):
Even if you already released funds, you can open a Post-Release Dispute if the seller attempted to reclaim the Konami ID, or if past fraudulent seller activity caused a ban.
Opening a post-release dispute immediately freezes the seller's wallet balance from M-Pesa withdrawal while CEO Brian Okibo audits Konami logs.

Urgent Assistance:
For emergency fraud reports, contact CEO Brian Okibo directly on WhatsApp at +254 794 400 365.`;
  }

  if (query.includes("mpesa") || query.includes("stk") || query.includes("till") || query.includes("payment") || query.includes("pay")) {
    return `M-Pesa Payment Guide (Till 1572931):

How to pay via M-Pesa:
1. Go to your order checkout page.
2. Enter your Safaricom mobile phone number (07... or 01...).
3. Tap "Pay via M-Pesa STK Push".
4. An automated PIN prompt will appear on your phone handset within seconds.
5. Enter your M-Pesa PIN to authorize payment to Till 1572931.

Automatic Detection:
Our system syncs in real-time with Safaricom. As soon as your PIN is accepted, the order moves to Escrow Locked status automatically without needing to refresh.

Payment stuck or didn't receive STK Push?
You can tap "I Have Paid / Enter Receipt" to enter your Safaricom M-Pesa transaction code (e.g. SLK892...), and the system will verify it instantly.`;
  }

  if (query.includes("offer") || query.includes("bargain") || query.includes("discount") || query.includes("negotiate") || query.includes("price")) {
    return `How Bargaining & Making an Offer Works:

You can suggest a custom price on any active account:

1. Open any account listing in the marketplace.
2. Tap the "Make an Offer / Bargain Price" button.
3. Select a quick preset (-10%, -15%, -20%) or type any custom price down to 50% of original price.
4. Tap "Send Offer to Seller".

What happens next?
The seller receives an immediate in-app notification and SMS alert on their phone. The seller can:
1. Accept your offer (an instant checkout link is generated for your discounted price).
2. Counter-offer with an adjusted price ("adjust this to this").
3. Decline with an explanatory note.`;
  }

  if (query.includes("sell") || query.includes("seller") || query.includes("list") || query.includes("commission") || query.includes("withdraw")) {
    return `How to Sell eFootball Accounts & Withdraw Earnings:

1. Create a Seller Account:
Go to seller dashboard and tap "Create New Listing".

2. Listing Information:
Enter your account title, price in KES, player strength (OVR), epic players count, coin balance, and upload screenshots of your squad and manager.

3. Anti-Googling Requirement:
Ensure your Konami ID is NOT linked to Google Play Games before listing. Buyers will check in-game.

4. Platform Fee & Commission:
eFootballMarket charges a transparent 10% escrow fee on completed sales.

5. M-Pesa Withdrawal:
Once the buyer releases funds, your net payout reflects in your Available Balance. You can withdraw directly to your M-Pesa line at any time from your Earnings page.`;
  }

  if (query.includes("brian") || query.includes("contact") || query.includes("call") || query.includes("whatsapp") || query.includes("support") || query.includes("human")) {
    return `Official Customer Care & Human Support:

Chief Executive Officer (CEO): Brian Okibo
Phone & WhatsApp: +254 794 400 365 / 0794400365
Safaricom Till: 1572931
Email: brianokibo@gmail.com
Location: Nairobi, Kenya

Support hours are 24/7. Tap the WhatsApp icon on the screen to chat directly with Brian Okibo or click https://wa.me/254794400365`;
  }

  // Default helpful response
  return `Welcome to eFootballMarket Support!

I can guide you through every step of trading eFootball accounts safely:

1. Safaricom M-Pesa Escrow (Till 1572931)
Learn how buyer funds are locked safely until credentials and in-game players are confirmed.

2. Anti-Googling Safety Rule
Why accounts linked to Google Play Games are prohibited and how to verify in-game.

3. Konami ID Handover Checklist
How to change registered email on my.konami.net, change passwords, and enable 2FA.

4. Bargaining & Custom Offers
How to propose a price discount and receive seller counter-offers.

5. Escrow Disputes & Post-Release Protection
How to freeze seller payouts and seek moderator review if any issue occurs.

6. Direct CEO Human Support
Chat with Brian Okibo on WhatsApp at +254 794 400 365.

What specific question or order issue can I assist you with today?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];

    if (messages.length === 0) {
      return NextResponse.json({ error: "Messages array cannot be empty." }, { status: 400 });
    }

    const latestUserMessage = messages[messages.length - 1]?.content || "";

    // 1. Check for Gemini API key
    const geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY;

    if (geminiApiKey) {
      try {
        const contents = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`;

        const res = await fetch(geminiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTIONS }],
            },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 800,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const responseText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

          if (responseText.trim()) {
            // Clean up any stray bullet characters per strict styling policy
            const cleanText = responseText.replace(/[\u2022\u00b7]/g, "-").replace(/&bull;/g, "-");
            return NextResponse.json({
              reply: cleanText,
              provider: "gemini-1.5-flash",
            });
          }
        }
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed, switching to expert rule engine:", geminiErr.message);
      }
    }

    // 2. High-precision fallback engine
    const reply = getSmartFallbackResponse(latestUserMessage);
    return NextResponse.json({
      reply,
      provider: "efootball-expert-engine",
    });
  } catch (err: any) {
    console.error("AI chat route error:", err);
    return NextResponse.json(
      {
        reply: "I am ready to help you with eFootball escrow, M-Pesa payments, Anti-Googling rules, or Konami ID transfers. How can I assist you right now?",
        provider: "fallback",
      },
      { status: 200 }
    );
  }
}
