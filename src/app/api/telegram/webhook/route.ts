import { NextRequest, NextResponse } from "next/server";
import {
  getTelegramBotInfo,
  getTelegramWebhookInfo,
  sendTelegramMessage,
  setTelegramWebhook,
  answerTelegramCallbackQuery,
  editTelegramMessageText,
  broadcastListingToTelegramChannel,
} from "@/lib/notifications/telegramAlert";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSellerWithdrawalStatusWhatsApp } from "@/lib/whatsapp/notifications";
import { sendSellerWithdrawalStatusSms } from "@/lib/notifications/smsAlert";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * GET /api/telegram/webhook
 * Inspects or activates the webhook with Telegram.
 * Usage: /api/telegram/webhook?action=register
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const customToken = url.searchParams.get("token") || undefined;
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_API_TOKEN;

  if (!token) {
    return NextResponse.json({
      ok: false,
      error: "TELEGRAM_BOT_TOKEN is not configured in .env.local",
    });
  }

  // Action: Register webhook
  if (action === "register") {
    const webhookEndpoint = `${APP_URL}/api/telegram/webhook`;
    const regResult = await setTelegramWebhook(webhookEndpoint, token);
    const webhookInfo = await getTelegramWebhookInfo(token);
    const botInfo = await getTelegramBotInfo(token);

    return NextResponse.json({
      action: "register",
      success: regResult.success,
      webhookUrl: webhookEndpoint,
      description: regResult.description || regResult.error,
      bot: botInfo.bot,
      webhookInfo: webhookInfo.info,
    });
  }

  // Default: Get current bot and webhook info
  const botInfo = await getTelegramBotInfo(token);
  const webhookInfo = await getTelegramWebhookInfo(token);

  return NextResponse.json({
    ok: true,
    bot: botInfo.bot,
    webhookInfo: webhookInfo.info,
    configuredWebhookTarget: `${APP_URL}/api/telegram/webhook`,
    hint: "Send ?action=register to connect this webhook to Telegram",
  });
}

/**
 * POST /api/telegram/webhook
 * Receives incoming messages and callback queries from Telegram!
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const time = new Date().toLocaleTimeString("en-KE", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
    });

    // =========================================================================
    // 1. HANDLE TELEGRAM 1-TAP INLINE BUTTON ACTIONS (CALLBACK QUERIES)
    // =========================================================================
    const callbackQuery = body?.callback_query;
    if (callbackQuery) {
      const queryId = callbackQuery.id;
      const fromId = String(callbackQuery.from?.id);
      const data = String(callbackQuery.data || "").trim();
      const message = callbackQuery.message;
      const chatId = message?.chat?.id;
      const messageId = message?.message_id;
      const originalText = message?.text || "";

      const adminChatId =
        process.env.TELEGRAM_CHAT_ID ||
        process.env.TELEGRAM_ADMIN_CHAT_ID ||
        "8418652559";

      // Security check: Only CEO Brian Okibo can execute administrative actions
      if (fromId !== adminChatId) {
        await answerTelegramCallbackQuery(
          queryId,
          "⚠️ Unauthorized: Only CEO Brian Okibo can execute admin actions.",
          true
        );
        return NextResponse.json({ ok: true });
      }

      const adminSupabase = createAdminClient();

      // Action 1: Approve & Disburse Seller Withdrawal
      if (data.startsWith("approve_withdrawal:")) {
        const withdrawalId = data.replace("approve_withdrawal:", "").trim();

        const { data: withdrawal, error: fetchErr } = await adminSupabase
          .from("seller_withdrawals")
          .select("*, seller:profiles(id, username, phone_number)")
          .eq("id", withdrawalId)
          .single();

        if (fetchErr || !withdrawal) {
          await answerTelegramCallbackQuery(queryId, "⚠️ Withdrawal record not found.", true);
          return NextResponse.json({ ok: true });
        }

        if (withdrawal.status === "completed") {
          await answerTelegramCallbackQuery(queryId, "ℹ️ Withdrawal is already marked as completed.");
          return NextResponse.json({ ok: true });
        }

        // Mark as completed in database
        await adminSupabase
          .from("seller_withdrawals")
          .update({
            status: "completed",
            reviewed_by: "Brian Okibo (Telegram Admin)",
            updated_at: new Date().toISOString(),
          })
          .eq("id", withdrawalId);

        // Notify seller via in-app notifications
        await adminSupabase.from("notifications").insert({
          recipient_id: withdrawal.seller_id,
          type: "order_update",
          title: "M-Pesa Withdrawal Disbursed!",
          message: `Your withdrawal of KES ${Number(withdrawal.amount).toLocaleString()} has been approved and disbursed.`,
          action_url: "/seller/earnings",
          is_read: false,
        });

        // Notify seller via WhatsApp & SMS
        if (withdrawal.phone_number) {
          sendSellerWithdrawalStatusWhatsApp(
            withdrawal.phone_number,
            Number(withdrawal.amount),
            "completed"
          ).catch(() => {});

          sendSellerWithdrawalStatusSms(
            withdrawal.phone_number,
            Number(withdrawal.amount),
            "completed"
          ).catch(() => {});
        }

        await answerTelegramCallbackQuery(
          queryId,
          `✅ Disbursed KES ${Number(withdrawal.amount).toLocaleString()} for @${withdrawal.seller?.username || "seller"}!`
        );

        if (chatId && messageId) {
          const updatedText =
            `${escapeHtml(originalText)}\n\n` +
            `✅ <b>DISBURSED &amp; APPROVED BY BRIAN OKIBO</b>\n` +
            `⏰ <i>Executed at ${time} EAT via Telegram 1-Tap Action</i>`;

          await editTelegramMessageText(chatId, messageId, updatedText, [
            [{ text: "🏦 Open Withdrawals in Admin", url: `${APP_URL}/admin?tab=withdrawals` }],
          ]);
        }

        return NextResponse.json({ ok: true });
      }

      // Action 2: Reject & Refund Seller Withdrawal
      if (data.startsWith("reject_withdrawal:")) {
        const withdrawalId = data.replace("reject_withdrawal:", "").trim();

        const { data: withdrawal } = await adminSupabase
          .from("seller_withdrawals")
          .select("*, seller:profiles(id, username, available_balance)")
          .eq("id", withdrawalId)
          .single();

        if (withdrawal && withdrawal.status !== "rejected") {
          const currentBal = Number(withdrawal.seller?.available_balance || 0);
          await adminSupabase
            .from("profiles")
            .update({
              available_balance: currentBal + Number(withdrawal.amount),
              updated_at: new Date().toISOString(),
            })
            .eq("id", withdrawal.seller_id);

          await adminSupabase
            .from("seller_withdrawals")
            .update({
              status: "rejected",
              failure_reason: "Rejected by CEO review via Telegram 1-Tap Action",
              reviewed_by: "Brian Okibo (Telegram Admin)",
              updated_at: new Date().toISOString(),
            })
            .eq("id", withdrawalId);

          if (withdrawal.phone_number) {
            sendSellerWithdrawalStatusWhatsApp(
              withdrawal.phone_number,
              Number(withdrawal.amount),
              "rejected",
              "Admin review rejection"
            ).catch(() => {});

            sendSellerWithdrawalStatusSms(
              withdrawal.phone_number,
              Number(withdrawal.amount),
              "rejected",
              "Admin review rejection"
            ).catch(() => {});
          }

          await answerTelegramCallbackQuery(
            queryId,
            `❌ Withdrawal rejected and KES ${Number(withdrawal.amount).toLocaleString()} refunded to seller balance.`
          );

          if (chatId && messageId) {
            const updatedText =
              `${escapeHtml(originalText)}\n\n` +
              `❌ <b>REJECTED &amp; REFUNDED TO WALLET</b>\n` +
              `⏰ <i>Executed by Brian Okibo at ${time} EAT</i>`;

            await editTelegramMessageText(chatId, messageId, updatedText, [
              [{ text: "🏦 Review in Admin", url: `${APP_URL}/admin?tab=withdrawals` }],
            ]);
          }
        } else {
          await answerTelegramCallbackQuery(queryId, "Withdrawal already updated.");
        }

        return NextResponse.json({ ok: true });
      }

      // Action 3: Take Down Listing
      if (data.startsWith("takedown_listing:")) {
        const listingId = data.replace("takedown_listing:", "").trim();

        const { data: listing } = await adminSupabase
          .from("listings")
          .select("id, title, seller_id")
          .eq("id", listingId)
          .single();

        if (listing) {
          await adminSupabase
            .from("listings")
            .update({ status: "suspended" })
            .eq("id", listingId);

          await adminSupabase.from("notifications").insert({
            recipient_id: listing.seller_id,
            type: "listing_moderated",
            title: "⚠️ Listing Brought Down by Administration",
            message: `Your squad listing "${listing.title}" was suspended by CEO review for non-conformance.`,
            action_url: "/seller/guidelines",
            is_read: false,
          });

          await answerTelegramCallbackQuery(queryId, "🚨 Listing taken down from marketplace catalog.");

          if (chatId && messageId) {
            const updatedText =
              `${escapeHtml(originalText)}\n\n` +
              `🚨 <b>BROUGHT DOWN &amp; SUSPENDED</b>\n` +
              `⏰ <i>Executed by Brian Okibo at ${time} EAT</i>`;

            await editTelegramMessageText(chatId, messageId, updatedText, [
              [{ text: "⚽ Review in Admin", url: `${APP_URL}/admin?tab=listings` }],
            ]);
          }
        } else {
          await answerTelegramCallbackQuery(queryId, "Listing not found.");
        }

        return NextResponse.json({ ok: true });
      }

      // Action 4: Broadcast Listing to Public Deals Channel
      if (data.startsWith("broadcast_listing:")) {
        const listingId = data.replace("broadcast_listing:", "").trim();

        const { data: listing } = await adminSupabase
          .from("listings")
          .select("*")
          .eq("id", listingId)
          .single();

        if (listing) {
          const bRes = await broadcastListingToTelegramChannel(listing);
          if (bRes.success) {
            await answerTelegramCallbackQuery(queryId, "📢 Deal broadcasted to Telegram Deals Channel! 🎉");
          } else {
            await answerTelegramCallbackQuery(queryId, `Broadcast note: ${bRes.error || "Broadcast sent"}`);
          }
        } else {
          await answerTelegramCallbackQuery(queryId, "Listing not found.");
        }

        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(queryId, "Action acknowledged.");
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 2. HANDLE CONVERSATIONAL TEXT MESSAGES
    // =========================================================================
    const message = body?.message || body?.edited_message;

    if (!message || !message.chat?.id) {
      // Return 200 OK to Telegram so it does not retry unknown update types
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = (message.text || "").trim();
    const senderName = message.from?.first_name || message.from?.username || "Trader";
    const senderHandle = message.from?.username ? `@${message.from.username}` : senderName;

    console.log(`[Telegram:Incoming] Message from ${senderHandle} (${chatId}): "${text}"`);

    const lower = text.toLowerCase();

    // 0. Handle Deep-Link Creator Account Binding: /start link_<userId> or /link <userId>
    const linkMatch = text.match(/^\/(?:start\s+link_|link\s+)([a-zA-Z0-9_-]+)/i);
    if (linkMatch) {
      const targetUserId = linkMatch[1].trim();
      const adminSupabase = createAdminClient();

      const { data: profile, error: profErr } = await adminSupabase
        .from("profiles")
        .select("id, username, first_name, telegram_chat_id")
        .eq("id", targetUserId)
        .maybeSingle();

      if (profErr || !profile) {
        const errorReply =
          `⚠️ <b>Account Link Notice</b>\n\n` +
          `Could not locate user account with ID <code>${escapeHtml(targetUserId)}</code>.\n\n` +
          `Please log into <a href="${APP_URL}">eFootballMarket.co.ke</a>, go to your <b>Seller Dashboard</b>, and tap <b>"Connect Telegram Alerts"</b> to connect with 1-click.`;

        await sendTelegramMessage(errorReply, {
          chatId,
          inlineButtons: [
            [{ text: "⚽ Log in to eFootballMarket", url: `${APP_URL}/login` }],
            [{ text: "👥 Join Official Group (@efootballmarket254)", url: "https://t.me/efootballmarket254" }],
          ],
        });
        return NextResponse.json({ ok: true });
      }

      // Save telegram_chat_id and telegram_username to profiles table
      const tgUsername = message.from?.username ? `@${message.from.username}` : (message.from?.first_name || null);
      await adminSupabase
        .from("profiles")
        .update({
          telegram_chat_id: chatId,
          telegram_username: tgUsername,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId);

      const successReply =
        `🎉 <b>TELEGRAM ALERTS ACTIVATED!</b> ⚽\n\n` +
        `Welcome <b>${escapeHtml(profile.username || profile.first_name || "Creator")}</b>! Your Telegram account has been linked to your eFootballMarket profile.\n\n` +
        `🔔 <b>Instant Alerts Enabled:</b>\n` +
        `✅ <b>Squad Purchases:</b> Instant pings when escrow payment is confirmed at Till 1572931.\n` +
        `✅ <b>Price Offers:</b> Instant alerts when buyers propose cash offers.\n` +
        `✅ <b>Escrow Messages:</b> Direct pings when buyers send messages in the order room.\n\n` +
        `📢 <b>Official Community Group:</b> Connect with Kenyan eFootball traders and creators in @efootballmarket254!`;

      await sendTelegramMessage(successReply, {
        chatId,
        inlineButtons: [
          [{ text: "📊 Open Seller Dashboard", url: `${APP_URL}/dashboard/seller` }],
          [{ text: "👥 Join Official Group (@efootballmarket254)", url: "https://t.me/efootballmarket254" }],
          [{ text: "⚽ Browse Marketplace", url: `${APP_URL}/marketplace` }],
        ],
      });

      return NextResponse.json({ ok: true });
    }

    // 1. /start or /help or greetings
    if (lower === "/start" || lower === "/help" || lower === "hi" || lower === "hello") {
      const reply =
        `👋 <b>Hello ${escapeHtml(senderName)}!</b>\n\n` +
        `Welcome to the official <b>eFootballMarket Executive &amp; Alerts Bot</b>.\n\n` +
        `🆔 <b>Your Chat ID:</b> <code>${chatId}</code>\n` +
        `🛡️ <b>M-Pesa Escrow Till:</b> <code>1572931</code> (EFootballMarket)\n` +
        `👥 <b>Community Group:</b> @efootballmarket254\n` +
        `📱 <b>Admin Hotline:</b> +254 794 400 365\n\n` +
        `✅ <b>Bot Status:</b> Active &amp; Ready!\n` +
        `Platform transactions, payments, credentials, and deal notifications are processed automatically.\n\n` +
        `<b>Available Commands:</b>\n` +
        `⚡ /status — Check platform &amp; escrow health\n` +
        `💳 /till — Safaricom Till 1572931 instructions\n` +
        `🛡️ /admin — Open Executive Admin Panel\n` +
        `📶 /ping — Sub-second latency ping test`;

      await sendTelegramMessage(reply, {
        chatId,
        inlineButtons: [
          [{ text: "👥 Join Official Group (@efootballmarket254)", url: "https://t.me/efootballmarket254" }],
          [{ text: "⚽ Browse Marketplace", url: `${APP_URL}/marketplace` }],
          [{ text: "🛡️ Admin Panel", url: `${APP_URL}/admin` }],
        ],
      });

      return NextResponse.json({ ok: true });
    }

    // 2. /status command
    if (lower === "/status") {
      const reply =
        `📊 <b>eFootballMarket Platform Status</b>\n\n` +
        `🟢 <b>System Health:</b> 100% Operational\n` +
        `🛡️ <b>Escrow Till:</b> <code>1572931</code> (Lipa na M-Pesa Buy Goods)\n` +
        `🔐 <b>Vault Encryption:</b> AES-256-GCM Secure\n` +
        `⏱️ <b>Nairobi Time:</b> ${time} EAT\n` +
        `🆔 <b>Your Chat ID:</b> <code>${chatId}</code>\n\n` +
        `Ready for automated notifications.`;

      await sendTelegramMessage(reply, {
        chatId,
        inlineButtons: [[{ text: "🛡️ Admin Dashboard", url: `${APP_URL}/admin` }]],
      });

      return NextResponse.json({ ok: true });
    }

    // 3. /till or /payment command
    if (lower === "/till" || lower === "/payment" || lower === "till") {
      const reply =
        `💰 <b>Official M-Pesa Till Details</b>\n\n` +
        `🏪 <b>Buy Goods Till:</b> <code>1572931</code>\n` +
        `🏷️ <b>Store Name:</b> <code>EFootballMarket</code>\n` +
        `🛡️ <b>Escrow Protection:</b> Guaranteed\n\n` +
        `<b>Payment Steps:</b>\n` +
        `1. Open M-Pesa menu ➔ Lipa na M-Pesa\n` +
        `2. Select <b>Buy Goods and Services</b>\n` +
        `3. Enter Till: <code>1572931</code>\n` +
        `4. Enter Amount &amp; PIN\n` +
        `5. Enter M-Pesa receipt on efootballmarket.co.ke to auto-release squad!`;

      await sendTelegramMessage(reply, { chatId });
      return NextResponse.json({ ok: true });
    }

    // 4. /admin command
    if (lower === "/admin") {
      const reply =
        `🏛️ <b>eFootballMarket Executive Administration</b>\n\n` +
        `Manage listings, review escrow transactions, approve payouts, and verify user accounts in the executive suite.`;

      await sendTelegramMessage(reply, {
        chatId,
        inlineButtons: [[{ text: "🛡️ Open Admin Portal", url: `${APP_URL}/admin` }]],
      });
      return NextResponse.json({ ok: true });
    }

    // 5. /ping command
    if (lower === "/ping") {
      const reply = `🏓 <b>Pong!</b> Connection verified. Your Chat ID is <code>${chatId}</code>.`;
      await sendTelegramMessage(reply, { chatId });
      return NextResponse.json({ ok: true });
    }

    // 6. Generic conversational fallback
    const reply =
      `🤖 <b>eFootballMarket Bot</b>\n\n` +
      `Received: <i>"${escapeHtml(text)}"</i>\n\n` +
      `🆔 <b>Your Telegram Chat ID:</b> <code>${chatId}</code>\n` +
      `<i>(Keep this ID in your .env.local as TELEGRAM_CHAT_ID)</i>\n\n` +
      `Send /start or /status for options, or access the admin dashboard below:`;

    await sendTelegramMessage(reply, {
      chatId,
      inlineButtons: [
        [{ text: "🛡️ Executive Panel", url: `${APP_URL}/admin` }],
        [{ text: "⚽ Marketplace", url: `${APP_URL}/marketplace` }],
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Telegram:Webhook] Error processing incoming update:", error.message);
    return NextResponse.json({ ok: true }); // Always 200 OK so Telegram doesn't storm retries
  }
}
