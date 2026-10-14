import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface TournamentMatch {
  id: string;
  round: "Quarter-Finals" | "Semi-Finals" | "Grand Final";
  player1: string;
  player2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  isCompleted: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  subtitle: string;
  platform: "android" | "ios" | "crossplay";
  prize_pool_kes: number;
  first_place_kes: number;
  second_place_kes: number;
  entry_fee_kes: number;
  format: string;
  registered_count: number;
  max_players: number;
  start_date: string;
  status: "registration_open" | "in_progress" | "completed";
  winner_name?: string;
  matches: TournamentMatch[];
}

const TOURNAMENTS_STORE: Tournament[] = [];

export async function GET() {
  return NextResponse.json({ tournaments: TOURNAMENTS_STORE });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournament_id, gamer_tag, friend_id, phone_number } = body;

    if (!tournament_id || !gamer_tag || !friend_id || !phone_number) {
      return NextResponse.json(
        { error: "Gamer tag, eFootball Friend ID, and Safaricom phone number are required." },
        { status: 400 }
      );
    }

    const tourney = TOURNAMENTS_STORE.find((t) => t.id === tournament_id);
    if (!tourney) {
      return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
    }

    if (tourney.registered_count >= tourney.max_players) {
      return NextResponse.json({ error: "This tournament is already full." }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone_number).international;
    tourney.registered_count += 1;

    // Dispatch automated WhatsApp alert to CEO Brian Okibo (0794400365)
    dispatchAdminWhatsAppAlert({
      eventType: "MIDDLEMAN_DEAL_CREATED", // reuse or details
      listingTitle: `Tournament: ${tourney.title}`,
      amount: tourney.entry_fee_kes,
      currency: "KES",
      buyerPhone: normalizedPhone,
      details: `Player: ${gamer_tag} (Friend ID: ${friend_id})`,
    }).catch((err) => console.error("Admin tournament alert error:", err));

    return NextResponse.json({
      success: true,
      message: `Successfully registered for "${tourney.title}"!`,
      entryFee: tourney.entry_fee_kes,
      tillNumber: "1572931",
      player: {
        gamer_tag,
        friend_id,
        phone_number: normalizedPhone,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}
