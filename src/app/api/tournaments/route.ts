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

export interface TournamentPlayer {
  gamer_tag: string;
  friend_id: string;
  phone_number: string;
  registered_at: string;
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
  players?: TournamentPlayer[];
}

const TOURNAMENTS_STORE: Tournament[] = [
  {
    id: "tourney-nrb-clash-4",
    title: "Nairobi Weekend Clash - Mobile Cup #4",
    subtitle: "16-Player Single Knockout (Mobile Android/iOS) • 10-Minute Extra Time & Penalties",
    platform: "android",
    prize_pool_kes: 5000,
    first_place_kes: 3500,
    second_place_kes: 1500,
    entry_fee_kes: 150,
    format: "Single Knockout 1v1 (Golden Goal on Draw)",
    registered_count: 10,
    max_players: 16,
    start_date: "This Saturday, 7:00 PM EAT",
    status: "registration_open",
    matches: [
      {
        id: "m-1",
        round: "Quarter-Finals",
        player1: "Kip_Sniper (Nairobi)",
        player2: "Omondi_PES (Kisumu)",
        score1: 2,
        score2: 1,
        winner: "Kip_Sniper (Nairobi)",
        isCompleted: true,
      },
      {
        id: "m-2",
        round: "Quarter-Finals",
        player1: "NairobianPro",
        player2: "MombasaStriker",
        score1: 1,
        score2: 3,
        winner: "MombasaStriker",
        isCompleted: true,
      },
      {
        id: "m-3",
        round: "Semi-Finals",
        player1: "Kip_Sniper (Nairobi)",
        player2: "MombasaStriker",
        isCompleted: false,
      },
      {
        id: "m-4",
        round: "Semi-Finals",
        player1: "Quarter 3 Winner",
        player2: "Quarter 4 Winner",
        isCompleted: false,
      },
      {
        id: "m-5",
        round: "Grand Final",
        player1: "Semi 1 Winner",
        player2: "Semi 2 Winner",
        isCompleted: false,
      },
    ],
  },
  {
    id: "tourney-elite-pro-inv",
    title: "M-Pesa Elite Pro Invitational (3100+ OVR)",
    subtitle: "Elite Division 1 Matchrooms • Guaranteed KES 10,000 Cash Prize Pool",
    platform: "crossplay",
    prize_pool_kes: 10000,
    first_place_kes: 7000,
    second_place_kes: 3000,
    entry_fee_kes: 300,
    format: "Best of 3 Series Knockout",
    registered_count: 5,
    max_players: 8,
    start_date: "Sunday, 8:00 PM EAT",
    status: "registration_open",
    matches: [
      {
        id: "m-e1",
        round: "Semi-Finals",
        player1: "GullitGang_KE",
        player2: "VieiraBaller",
        isCompleted: false,
      },
      {
        id: "m-e2",
        round: "Semi-Finals",
        player1: "RummeKing",
        player2: "NairobiMaster",
        isCompleted: false,
      },
      {
        id: "m-e3",
        round: "Grand Final",
        player1: "Finalist 1",
        player2: "Finalist 2",
        isCompleted: false,
      },
    ],
  },
  {
    id: "tourney-freeroll-sun",
    title: "Sunday Community Free-Roll Cup",
    subtitle: "Free Entry Sponsored by eFootballMarket Kenya • KES 2,500 Cash Payout to M-Pesa",
    platform: "ios",
    prize_pool_kes: 2500,
    first_place_kes: 2000,
    second_place_kes: 500,
    entry_fee_kes: 0,
    format: "Fast 10-Min Matches • 16 Players Knockout",
    registered_count: 12,
    max_players: 16,
    start_date: "Sunday, 4:00 PM EAT",
    status: "registration_open",
    matches: [
      {
        id: "m-f1",
        round: "Quarter-Finals",
        player1: "Otieno_PES",
        player2: "Kamau_FC",
        score1: 3,
        score2: 2,
        winner: "Otieno_PES",
        isCompleted: true,
      },
      {
        id: "m-f2",
        round: "Quarter-Finals",
        player1: "NakuruAce",
        player2: "KisumuGoal",
        isCompleted: false,
      },
      {
        id: "m-f3",
        round: "Grand Final",
        player1: "Finalist A",
        player2: "Finalist B",
        isCompleted: false,
      },
    ],
  },
];

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

    if (!tourney.players) {
      tourney.players = [];
    }
    tourney.players.push({
      gamer_tag: gamer_tag.trim(),
      friend_id: friend_id.trim(),
      phone_number: normalizedPhone,
      registered_at: new Date().toISOString(),
    });

    // Dispatch automated WhatsApp & Telegram alerts to Brian Okibo (CEO: 0794400365)
    dispatchAdminWhatsAppAlert({
      eventType: "TOURNAMENT_REGISTRATION",
      listingTitle: tourney.title,
      amount: tourney.entry_fee_kes,
      currency: "KES",
      buyerPhone: normalizedPhone,
      details: `Gamer: ${gamer_tag.trim()} | Konami Friend ID: ${friend_id.trim()} | Platform: ${tourney.platform.toUpperCase()}`,
    }).catch((err) => console.error("Admin tournament alert error:", err));

    return NextResponse.json({
      success: true,
      message: `Successfully registered for "${tourney.title}"!`,
      entryFee: tourney.entry_fee_kes,
      tillNumber: "1572931",
      player: {
        gamer_tag: gamer_tag.trim(),
        friend_id: friend_id.trim(),
        phone_number: normalizedPhone,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}
