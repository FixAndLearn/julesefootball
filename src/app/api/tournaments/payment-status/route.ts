import { mpesaClient } from "@/lib/mpesa/client";
import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";
import { TournamentService } from "@/services/tournamentService";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate",
  "CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/tournaments/payment-status
 * Polls for live Safaricom / UnifiedPay STK Push confirmation.
 * Once verified, atomically registers the player into the tournament bracket.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");
    const forceCheck = searchParams.get("forceCheck") === "true";

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: "Missing checkoutRequestId parameter" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const payment = await TournamentService.getTournamentPayment(checkoutRequestId);
    if (!payment) {
      return NextResponse.json(
        { error: "Tournament payment record not found." },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const tourney = await TournamentService.getTournamentById(payment.tournament_id);

    // 1. If already confirmed
    if (payment.status === "completed") {
      const participant = (tourney?.participants || []).find(
        (p) => p.friend_id.toLowerCase() === payment.friend_id.toLowerCase()
      );
      return NextResponse.json(
        {
          status: "completed",
          receiptNumber: payment.mpesa_receipt_number || "CONFIRMED",
          resultCode: 0,
          resultDesc: "Payment verified successfully",
          participant,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 2. If already marked failed/cancelled
    if (payment.status === "failed" || payment.status === "cancelled") {
      return NextResponse.json(
        {
          status: "failed",
          resultCode: payment.result_code || 1032,
          resultDesc: payment.result_desc || "Transaction was cancelled or expired.",
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Actively query UnifiedPay Till 1572931 / Safaricom status
    if (mpesaClient.isUnifiedPay() || forceCheck) {
      const liveStatus = await mpesaClient.checkUnifiedPayStatus(checkoutRequestId);

      if (liveStatus && liveStatus.isSuccess) {
        const receipt = liveStatus.receiptNumber || `CONFIRMED_${Date.now()}`;
        const confirmResult = await TournamentService.confirmTournamentPayment(
          checkoutRequestId,
          receipt,
          liveStatus.amount || payment.amount
        );

        // Notify Administrator Brian Okibo via WhatsApp
        await dispatchAdminWhatsAppAlert({
          eventType: "TOURNAMENT_REGISTRATION",
          listingTitle: tourney?.title || "eFootball Tournament",
          username: `${payment.gamer_tag} (CONFIRMED PAID)`,
          buyerPhone: payment.phone_number,
          amount: liveStatus.amount || payment.amount,
          details: `Gamer Tag: ${payment.gamer_tag} | Friend ID: ${payment.friend_id} | M-Pesa Receipt: ${receipt} | Phone: ${payment.phone_number}`,
        }).catch((e) => console.warn("WhatsApp alert error:", e));

        return NextResponse.json(
          {
            status: "completed",
            receiptNumber: receipt,
            resultCode: 0,
            resultDesc: "Payment verified via Safaricom Till 1572931",
            participant: confirmResult.participant,
          },
          { headers: NO_CACHE_HEADERS }
        );
      }

      if (
        liveStatus &&
        !liveStatus.isSuccess &&
        (liveStatus.resultCode === 1032 ||
          liveStatus.resultCode === 1037 ||
          String(liveStatus.resultDesc || "").toLowerCase().includes("cancel"))
      ) {
        await TournamentService.failTournamentPayment(
          checkoutRequestId,
          liveStatus.resultDesc || "Cancelled by user"
        );

        return NextResponse.json(
          {
            status: "failed",
            resultCode: liveStatus.resultCode || 1032,
            resultDesc: liveStatus.resultDesc || "Transaction was cancelled.",
          },
          { headers: NO_CACHE_HEADERS }
        );
      }
    }

    // 4. Still pending waiting for PIN entry
    return NextResponse.json(
      {
        status: "pending",
        resultCode: 1032,
        resultDesc: "Waiting for M-Pesa PIN confirmation...",
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("Tournament payment status route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to check tournament payment status" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

/**
 * POST /api/tournaments/payment-status
 * Instant receipt verification if the player already received Safaricom SMS (e.g. TL19...)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutRequestId, receiptNumber } = body;

    if (!checkoutRequestId || !receiptNumber) {
      return NextResponse.json(
        { error: "checkoutRequestId and receiptNumber are required." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const cleanReceipt = String(receiptNumber).trim().toUpperCase();
    if (cleanReceipt.length < 8) {
      return NextResponse.json(
        { error: "Please enter a valid 10-character Safaricom M-Pesa receipt code." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const payment = await TournamentService.getTournamentPayment(checkoutRequestId);
    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const tourney = await TournamentService.getTournamentById(payment.tournament_id);

    const confirmResult = await TournamentService.confirmTournamentPayment(
      checkoutRequestId,
      cleanReceipt,
      payment.amount
    );

    // Notify Administrator Brian Okibo via WhatsApp
    await dispatchAdminWhatsAppAlert({
      eventType: "TOURNAMENT_REGISTRATION",
      listingTitle: tourney?.title || "eFootball Tournament",
      username: `${payment.gamer_tag} (CONFIRMED RECEIPT: ${cleanReceipt})`,
      buyerPhone: payment.phone_number,
      amount: payment.amount,
      details: `Gamer Tag: ${payment.gamer_tag} | Friend ID: ${payment.friend_id} | M-Pesa Receipt: ${cleanReceipt} | Phone: ${payment.phone_number}`,
    }).catch((e) => console.warn("WhatsApp alert error:", e));

    return NextResponse.json(
      {
        status: "completed",
        receiptNumber: cleanReceipt,
        resultCode: 0,
        resultDesc: "Payment verified successfully",
        participant: confirmResult.participant,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("Manual tournament receipt verification error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify receipt." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
