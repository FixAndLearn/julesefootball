import { createAdminClient } from "@/lib/supabase/admin";
import { mpesaClient } from "@/lib/mpesa/client";
import { PaymentService } from "@/services/paymentService";
import { TournamentService } from "@/services/tournamentService";
import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Check if callback belongs to a tournament entry fee
    const parsed = mpesaClient.parseCallback(body);
    const checkoutId = parsed.checkoutRequestId || parsed.merchantRequestId;

    if (checkoutId) {
      const tourneyPayment = await TournamentService.getTournamentPayment(checkoutId);
      if (tourneyPayment) {
        if (parsed.isSuccess) {
          const receipt = parsed.receiptNumber || `CONFIRMED_${Date.now()}`;
          await TournamentService.confirmTournamentPayment(
            checkoutId,
            receipt,
            parsed.amount || tourneyPayment.amount
          );
          const tourney = await TournamentService.getTournamentById(tourneyPayment.tournament_id);
          await dispatchAdminWhatsAppAlert({
            eventType: "TOURNAMENT_REGISTRATION",
            listingTitle: tourney?.title || "eFootball Tournament",
            username: `${tourneyPayment.gamer_tag} (CONFIRMED WEBHOOK)`,
            buyerPhone: tourneyPayment.phone_number,
            amount: parsed.amount || tourneyPayment.amount,
            details: `Gamer Tag: ${tourneyPayment.gamer_tag} | Friend ID: ${tourneyPayment.friend_id} | Receipt: ${receipt} | Phone: ${tourneyPayment.phone_number}`,
          }).catch((e) => console.warn("WhatsApp alert error:", e));
        } else {
          await TournamentService.failTournamentPayment(checkoutId, parsed.resultDesc);
        }

        return NextResponse.json({
          ResultCode: 0,
          ResultDesc: "Tournament callback processed successfully",
        });
      }
    }

    // 2. Default: Process Marketplace Order payment
    const adminSupabase = createAdminClient();
    const paymentService = new PaymentService(adminSupabase);

    await paymentService.processCallback(body);

    // Safaricom expects a 200 OK with ResultCode 0 acknowledgment
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback accepted and processed successfully",
    });
  } catch (error: any) {
    console.error("M-Pesa callback processing error:", error);
    // Always return 200 OK to prevent Safaricom retry floods, but log error internally
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: "Internal callback handler error",
    });
  }
}
