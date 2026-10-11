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

const TOURNAMENTS_STORE: Tournament[] = [
  {
    id: "tourney_sun_supercup",
    title: "Nairobi Sunday Super Cup 🏆",
    subtitle: "Mobile 1v1 Knockout • All Kenyan Gamers Welcome",
    platform: "crossplay",
    prize_pool_kes: 5000,
    first_place_kes: 3500,
    second_place_kes: 1500,
    entry_fee_kes: 150,
    format: "16-Player Single Elimination Knockout",
    registered_count: 12,
    max_players: 16,
    start_date: "This Sunday, 8:00 PM EAT",
    status: "registration_open",
    matches: [
      {
        id: "m1",
        round: "Quarter-Finals",
        player1: "Otieno_Striker (3120 OVR)",
        player2: "Kev_Nairobi (3115 OVR)",
        score1: 3,
        score2: 1,
        winner: "Otieno_Striker (3120 OVR)",
        isCompleted: true,
      },
      {
        id: "m2",
        round: "Quarter-Finals",
        player1: "Maina_Blitz (3105 OVR)",
        player2: "Dennis_LBC (3125 OVR)",
        score1: 2,
        score2: 2,
        winner: "Dennis_LBC (Pen 5-4)",
        isCompleted: true,
      },
      {
        id: "m3",
        round: "Quarter-Finals",
        player1: "Mwangi_QC (3110 OVR)",
        player2: "Baraza_Pass (3130 OVR)",
        score1: 0,
        score2: 2,
        winner: "Baraza_Pass (3130 OVR)",
        isCompleted: true,
      },
      {
        id: "m4",
        round: "Quarter-Finals",
        player1: "Gikuyu_Legend (3095 OVR)",
        player2: "Juma_Skills (3118 OVR)",
        score1: 1,
        score2: 3,
        winner: "Juma_Skills (3118 OVR)",
        isCompleted: true,
      },
      {
        id: "m5",
        round: "Semi-Finals",
        player1: "Otieno_Striker",
        player2: "Dennis_LBC",
        isCompleted: false,
      },
      {
        id: "m6",
        round: "Semi-Finals",
        player1: "Baraza_Pass",
        player2: "Juma_Skills",
        isCompleted: false,
      },
      {
        id: "m7",
        round: "Grand Final",
        player1: "Winner Semi 1",
        player2: "Winner Semi 2",
        isCompleted: false,
      },
    ],
  },
  {
    id: "tourney_div1_kings",
    title: "Division 1 Kings Championship ⚡",
    subtitle: "High-Roller Elite Cup • 3110+ OVR Squads",
    platform: "crossplay",
    prize_pool_kes: 8000,
    first_place_kes: 5500,
    second_place_kes: 2500,
    entry_fee_kes: 300,
    format: "8-Player Invitational Bracket",
    registered_count: 6,
    max_players: 8,
    start_date: "Next Saturday, 7:00 PM EAT",
    status: "registration_open",
    matches: [],
  },
  {
    id: "tourney_free_roll",
    title: "Friday Free-Roll Community Cup 🎉",
    subtitle: "Free Entry Sponsored by EFootballMarket Kenya",
    platform: "crossplay",
    prize_pool_kes: 2000,
    first_place_kes: 1500,
    second_place_kes: 500,
    entry_fee_kes: 0,
    format: "32-Player Open Cup",
    registered_count: 32,
    max_players: 32,
    start_date: "Past Friday",
    status: "completed",
    winner_name: "Eric_Kip (Won KES 1,500 via M-Pesa)",
    matches: [],
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

    tourney.registered_count += 1;

    return NextResponse.json({
      success: true,
      message: `Successfully registered for "${tourney.title}"!`,
      entryFee: tourney.entry_fee_kes,
      tillNumber: "1572931",
      player: {
        gamer_tag,
        friend_id,
        phone_number,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}
