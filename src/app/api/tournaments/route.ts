import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";
import { isSuperAdminEmail, isUserAdmin } from "@/lib/security/adminAuth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { TournamentService } from "@/services/tournamentService";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tournaments = await TournamentService.getAllTournaments();
    return NextResponse.json({ tournaments });
  } catch (err: any) {
    console.error("GET /api/tournaments error:", err);
    return NextResponse.json({ tournaments: [], error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    // 1. ACTION: Host / Create New Tournament (Admin Action)
    if (action === "create" || body.prize_pool_kes !== undefined) {
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userEmail = user?.email || body.admin_email;
      let userRole = null;
      if (user) {
        const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        userRole = p?.role;
      }

      const isAuthorized = isSuperAdminEmail(userEmail) || isUserAdmin(userEmail, userRole);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Forbidden: Only authorized administrators (Brian Okibo) can host tournaments." },
          { status: 403 }
        );
      }

      const {
        title,
        subtitle,
        description,
        platform = "all",
        prize_pool_kes = 0,
        first_place_kes = 0,
        second_place_kes = 0,
        entry_fee_kes = 0,
        format = "Single Knockout 1v1",
        max_players = 8,
        start_date,
      } = body;

      if (!title || !start_date) {
        return NextResponse.json(
          { error: "Tournament title and match start date/time are required." },
          { status: 400 }
        );
      }

      const createdTournament = await TournamentService.createTournament({
        title,
        subtitle,
        description,
        platform,
        prize_pool_kes: Number(prize_pool_kes),
        first_place_kes: Number(first_place_kes),
        second_place_kes: Number(second_place_kes),
        entry_fee_kes: Number(entry_fee_kes),
        format,
        max_players: Number(max_players),
        start_date,
        created_by: user?.id,
      });

      // Dispatch alert to Brian Okibo
      await dispatchAdminWhatsAppAlert({
        eventType: "TOURNAMENT_REGISTRATION",
        listingTitle: createdTournament.title,
        username: "Host: Brian Okibo",
        buyerPhone: "254794400365",
        amount: createdTournament.entry_fee_kes,
        details: `Tournament hosted: ${createdTournament.title} (${createdTournament.max_players} players, Prize KES ${createdTournament.prize_pool_kes})`,
      }).catch((e) => console.warn("WhatsApp alert error:", e));

      return NextResponse.json({ success: true, tournament: createdTournament });
    }

    // 2. ACTION: Register Participant for a Tournament
    const { tournament_id, gamer_tag, friend_id, phone_number, user_id } = body;

    if (!tournament_id || !gamer_tag || !friend_id || !phone_number) {
      return NextResponse.json(
        { error: "Gamer tag, eFootball Friend ID, and Safaricom phone number are required." },
        { status: 400 }
      );
    }

    // Community Membership Check: Require active session or registered profile
    const supabase = createServerSupabaseClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const verifiedUserId = authUser?.id || (user_id ? String(user_id).trim() : null);

    if (!verifiedUserId) {
      return NextResponse.json(
        {
          error:
            "Community Membership Required: Only registered members of our eFootballMarket community can join tournaments. Please sign up or log in first.",
        },
        { status: 401 }
      );
    }

    // Verify account exists in public.profiles table
    const { data: memberProfile } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", verifiedUserId)
      .maybeSingle();

    if (!memberProfile && !authUser) {
      return NextResponse.json(
        {
          error:
            "Community Membership Required: No registered account found for this user ID. Please register to enter tournaments.",
        },
        { status: 401 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone_number).international;

    const result = await TournamentService.registerParticipant({
      tournament_id,
      gamer_tag,
      friend_id,
      phone_number: normalizedPhone,
      user_id: verifiedUserId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const tourney = await TournamentService.getTournamentById(tournament_id);

    // Alert Super Admin Brian Okibo of registration
    await dispatchAdminWhatsAppAlert({
      eventType: "TOURNAMENT_REGISTRATION",
      listingTitle: tourney?.title || "eFootball Tournament",
      username: gamer_tag,
      buyerPhone: normalizedPhone,
      amount: tourney?.entry_fee_kes || 0,
      details: `Gamer Tag: ${gamer_tag} | Friend ID: ${friend_id}`,
    }).catch((e) => console.warn("WhatsApp alert error:", e));

    return NextResponse.json({
      success: true,
      participant: result.participant,
      message: "Successfully registered for tournament!",
    });
  } catch (err: any) {
    console.error("POST /api/tournaments error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tournament ID required." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthorized = isSuperAdminEmail(user?.email);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Super admin privilege required." }, { status: 403 });
    }

    await TournamentService.deleteTournament(id);
    return NextResponse.json({ success: true, message: "Tournament removed." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
