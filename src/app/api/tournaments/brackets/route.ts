import { isSuperAdminEmail, isUserAdmin } from "@/lib/security/adminAuth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TournamentService } from "@/services/tournamentService";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userRole = null;
    if (user) {
      const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      userRole = p?.role;
    }

    const body = await req.json();
    const { tournament_id, shuffle = false } = body;
    if (!tournament_id) {
      return NextResponse.json({ error: "Tournament ID is required." }, { status: 400 });
    }

    const tourney = await TournamentService.getTournamentById(tournament_id);
    if (!tourney) {
      return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
    }

    const userEmail = user?.email || body.admin_email;
    const isAdmin = isSuperAdminEmail(userEmail) || isUserAdmin(userEmail, userRole);
    const isModerator = user && tourney.created_by === user.id;

    if (!isAdmin && !isModerator) {
      return NextResponse.json(
        { error: "Forbidden: Only the tournament moderator or platform administrator can form brackets." },
        { status: 403 }
      );
    }

    const result = await TournamentService.generateBrackets(tournament_id, { shuffle });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      matches: result.matches,
      message: "Brackets successfully formed and tournament is live!",
    });
  } catch (err: any) {
    console.error("POST /api/tournaments/brackets error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
