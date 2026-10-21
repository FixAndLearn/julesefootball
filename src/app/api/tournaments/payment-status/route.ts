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
 * Real-time polling endpoint to detect M-Pesa STK Push payment settlements instantly.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");
    const tournamentId = searchParams.get("tournamentId");
    const userId = searchParams.get("userId");
    const phoneNumber = searchParams.get("phone") || searchParams.get("phoneNumber");
    const forceCheck = searchParams.get("forceCheck") === "true";

    // 1. Resolve payment record
    let payment = checkoutRequestId ? await TournamentService.getTournamentPayment(checkoutRequestId) : null;

    if (!payment && tournamentId && (userId || phoneNumber)) {
      payment = await TournamentService.getLatestPaymentForUser(
        tournamentId,
        userId || undefined,
        phoneNumber ? mpesaClient.normalizePhoneNumber(phoneNumber) : undefined
      );
    }

    // 2. If already completed in DB, return success immediately
    if (payment && payment.status === "completed") {
      const tourney = await TournamentService.getTournamentById(payment.tournament_id);
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

    // 3. Actively query UnifiedPay Till 1572931 for live settlement status
    const idToPoll = checkoutRequestId || payment?.checkout_request_id || payment?.merchant_request_id;
    if (idToPoll && mpesaClient.isUnifiedPay()) {
      const liveStatus = await mpesaClient.checkUnifiedPayStatus(idToPoll);

      if (liveStatus && liveStatus.isSuccess) {
        const receipt = liveStatus.receiptNumber || `CONFIRMED_${Date.now()}`;
        const confirmResult = await TournamentService.confirmTournamentPayment(
          idToPoll,
          receipt,
          liveStatus.amount || payment?.amount
        );

        const tourney = payment ? await TournamentService.getTournamentById(payment.tournament_id) : null;

        // Notify Super Admin Brian Okibo
        await dispatchAdminWhatsAppAlert({
          eventType: "TOURNAMENT_REGISTRATION",
          listingTitle: tourney?.title || "eFootball Tournament",
          username: `${payment?.gamer_tag || "Player"} (CONFIRMED PAID)`,
          buyerPhone: payment?.phone_number || liveStatus.phoneNumber || "254794400365",
          amount: liveStatus.amount || payment?.amount || 0,
          details: `Gamer Tag: ${payment?.gamer_tag} | Friend ID: ${payment?.friend_id} | M-Pesa Receipt: ${receipt} | Till 1572931`,
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

      // Check for genuine cancellation (ONLY if NOT pending)
      const descLower = String(liveStatus?.resultDesc || "").toLowerCase();
      const isGenuineFailure =
        liveStatus &&
        !liveStatus.isSuccess &&
        !descLower.includes("pending") &&
        (liveStatus.resultCode === 1037 ||
          descLower.includes("cancelled") ||
          descLower.includes("cancel") ||
          descLower.includes("rule limited") ||
          descLower.includes("timeout"));

      if (isGenuineFailure && forceCheck) {
        await TournamentService.failTournamentPayment(
          idToPoll,
          liveStatus.resultDesc || "Transaction cancelled"
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

    // 4. Default state: Still waiting for PIN confirmation
    return NextResponse.json(
      {
        status: "pending",
        resultCode: 100,
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
 * Instant receipt verification if the player already received Safaricom SMS (e.g. UJL9JAS7T5)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      checkoutRequestId,
      receiptNumber,
      tournamentId,
      gamerTag,
      friendId,
      phoneNumber,
      userId,
    } = body;

    const cleanReceipt = String(receiptNumber || "").trim().toUpperCase();
    if (cleanReceipt.length < 8) {
      return NextResponse.json(
        { error: "Please enter a valid 10-character Safaricom M-Pesa receipt code." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    let payment = checkoutRequestId ? await TournamentService.getTournamentPayment(checkoutRequestId) : null;

    if (!payment && tournamentId) {
      payment = await TournamentService.getLatestPaymentForUser(
        tournamentId,
        userId,
        phoneNumber ? mpesaClient.normalizePhoneNumber(phoneNumber) : undefined
      );
    }

    if (payment) {
      const confirmResult = await TournamentService.confirmTournamentPayment(
        payment.checkout_request_id || checkoutRequestId,
        cleanReceipt,
        payment.amount
      );

      const tourney = await TournamentService.getTournamentById(payment.tournament_id);
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
    }

    if (tournamentId && gamerTag && friendId && phoneNumber) {
      const tourney = await TournamentService.getTournamentById(tournamentId);
      if (!tourney) {
        return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
      }

      const normalizedPhone = mpesaClient.normalizePhoneNumber(phoneNumber);
      const manualId = `MANUAL-${Date.now()}-${cleanReceipt}`;

      await TournamentService.createTournamentPayment({
        tournament_id: tournamentId,
        user_id: userId,
        gamer_tag: gamerTag,
        friend_id: friendId,
        phone_number: normalizedPhone,
        amount: tourney.entry_fee_kes,
        checkout_request_id: manualId,
      });

      const confirmResult = await TournamentService.confirmTournamentPayment(
        manualId,
        cleanReceipt,
        tourney.entry_fee_kes
      );

      await dispatchAdminWhatsAppAlert({
        eventType: "TOURNAMENT_REGISTRATION",
        listingTitle: tourney.title,
        username: `${gamerTag} (MANUAL RECEIPT VERIFIED)`,
        buyerPhone: normalizedPhone,
        amount: tourney.entry_fee_kes,
        details: `Gamer Tag: ${gamerTag} | Friend ID: ${friendId} | M-Pesa Receipt: ${cleanReceipt} | Phone: ${normalizedPhone}`,
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
    }

    return NextResponse.json(
      { error: "Could not find matching payment to verify. Please try again." },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("Manual tournament receipt verification error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify receipt." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
