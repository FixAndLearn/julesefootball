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
    const userEmail = user?.email || body.admin_email;

    const isAuthorized = isSuperAdminEmail(userEmail) || isUserAdmin(userEmail, userRole);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Only authorized administrators (Brian Okibo) can form tournament brackets." },
        { status: 403 }
      );
    }

    const { tournament_id, shuffle = false } = body;
    if (!tournament_id) {
      return NextResponse.json({ error: "Tournament ID is required." }, { status: 400 });
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
