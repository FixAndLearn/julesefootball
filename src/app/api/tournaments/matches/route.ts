import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";
import { sendTelegramMessage } from "@/lib/notifications/telegramAlert";
import { formatCurrency } from "@/lib/utils";
import { TournamentService } from "@/services/tournamentService";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournament_id, match_id, score1, score2, winner_name, match_code } = body;

    if (!tournament_id || !match_id || score1 === undefined || score2 === undefined || !winner_name) {
      return NextResponse.json(
        { error: "tournament_id, match_id, score1, score2, and winner_name are required." },
        { status: 400 }
      );
    }

    const result = await TournamentService.submitMatchResult({
      tournament_id,
      match_id,
      score1: Number(score1),
      score2: Number(score2),
      winner_name: String(winner_name).trim(),
      match_code,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // If Grand Final was won and a Champion is officially crowned:
    if (result.isChampionCrowned && result.championName && result.tournament) {
      const tourney = result.tournament;
      // 1. WhatsApp alert to Brian Okibo to disburse M-Pesa prize pool
      await dispatchAdminWhatsAppAlert({
        eventType: "TOURNAMENT_WINNER_CROWNED",
        listingTitle: tourney.title,
        username: result.championName,
        amount: tourney.first_place_kes,
        details: `Grand Final Champion: ${result.championName}! Total prize pool KES ${tourney.prize_pool_kes}. Disburse KES ${tourney.first_place_kes} to champion via Till 1572931.`,
      }).catch((e) => console.warn("WhatsApp champion alert error:", e));

      // 2. Telegram Bot notification
      const tgMsg = `🏆 <b>eFootball Kenya - TOURNAMENT CHAMPION CROWNED!</b>\n\n` +
        `⚔️ <b>Tournament:</b> ${tourney.title}\n` +
        `🥇 <b>Champion:</b> <b>${result.championName}</b>\n` +
        `💰 <b>1st Place Cash Prize:</b> ${formatCurrency(tourney.first_place_kes, "KES")}\n` +
        `🥈 <b>2nd Place Cash Prize:</b> ${formatCurrency(tourney.second_place_kes, "KES")}\n\n` +
        `📲 <b>Action Required:</b> Officer Brian Okibo disburse winnings via Safaricom Till 1572931 / M-Pesa.`;

      await sendTelegramMessage(tgMsg).catch((e) => console.warn("Telegram alert error:", e));
    }

    return NextResponse.json({
      success: true,
      isChampionCrowned: result.isChampionCrowned,
      championName: result.championName,
      tournament: result.tournament,
      message: result.isChampionCrowned
        ? `🏆 Grand Final complete! ${result.championName} is crowned Tournament Champion!`
        : `Match result updated! Winner ${winner_name} advances to the next round.`,
    });
  } catch (err: any) {
    console.error("POST /api/tournaments/matches error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
