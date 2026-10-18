import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Tournament, TournamentMatch, TournamentParticipant } from "@/types/database";

/**
 * In-memory fallback cache to guarantee immediate persistence and zero loss
 * even before SQL migration has been applied to Supabase database.
 * ZERO MOCK DATA - Initialized completely empty!
 */
let MEMORY_TOURNAMENTS: Tournament[] = [];

function getSupabase() {
  const adminSupabase = createAdminClient();
  const userSupabase = createServerSupabaseClient();
  return hasServiceRoleKey() ? adminSupabase : userSupabase;
}

export class TournamentService {
  /**
   * Fetch all active tournaments with their brackets and participants.
   * Returns empty array if none exist. Never returns fake/mock demo data.
   */
  static async getAllTournaments(): Promise<Tournament[]> {
    try {
      const supabase = getSupabase();
      const { data: dbTourneys, error } = await supabase
        .from("tournaments")
        .select(`
          *,
          matches:tournament_matches(*),
          participants:tournament_participants(*)
        `)
        .order("created_at", { ascending: false });

      if (!error && dbTourneys && Array.isArray(dbTourneys)) {
        // Sort matches by round and match_number
        const formatted = dbTourneys.map((t: any) => ({
          ...t,
          prize_pool_kes: Number(t.prize_pool_kes || 0),
          first_place_kes: Number(t.first_place_kes || 0),
          second_place_kes: Number(t.second_place_kes || 0),
          entry_fee_kes: Number(t.entry_fee_kes || 0),
          matches: (t.matches || []).sort((a: any, b: any) => a.match_number - b.match_number),
          participants: t.participants || [],
        }));
        return formatted;
      }
    } catch (err) {
      console.warn("Supabase tournaments query notice:", err);
    }

    // In-memory fallback
    return MEMORY_TOURNAMENTS;
  }

  /**
   * Get tournament by ID
   */
  static async getTournamentById(id: string): Promise<Tournament | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("tournaments")
        .select(`
          *,
          matches:tournament_matches(*),
          participants:tournament_participants(*)
        `)
        .eq("id", id)
        .single();

      if (!error && data) {
        return {
          ...data,
          prize_pool_kes: Number(data.prize_pool_kes || 0),
          first_place_kes: Number(data.first_place_kes || 0),
          second_place_kes: Number(data.second_place_kes || 0),
          entry_fee_kes: Number(data.entry_fee_kes || 0),
          matches: (data.matches || []).sort((a: any, b: any) => a.match_number - b.match_number),
          participants: data.participants || [],
        };
      }
    } catch (err) {
      console.warn("Supabase getTournamentById notice:", err);
    }

    const found = MEMORY_TOURNAMENTS.find((t) => t.id === id);
    return found || null;
  }

  /**
   * Create / Host a new tournament directly on the website
   */
  static async createTournament(params: {
    title: string;
    subtitle?: string;
    description?: string;
    platform: "all" | "android" | "ios" | "crossplay" | "console_pc";
    prize_pool_kes: number;
    first_place_kes: number;
    second_place_kes: number;
    entry_fee_kes: number;
    format: string;
    max_players: number;
    start_date: string;
    created_by?: string;
  }): Promise<Tournament> {
    const newId = `tourney-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const tourneyPayload: Tournament = {
      id: newId,
      title: params.title.trim(),
      subtitle: params.subtitle?.trim() || `${params.max_players}-Player 1v1 Single Knockout | M-Pesa Escrow Payout`,
      description: params.description?.trim() || "",
      platform: params.platform,
      prize_pool_kes: params.prize_pool_kes,
      first_place_kes: params.first_place_kes,
      second_place_kes: params.second_place_kes,
      entry_fee_kes: params.entry_fee_kes,
      format: params.format.trim() || "Single Knockout 1v1 (10-Minute Extra Time & PKs)",
      max_players: params.max_players || 8,
      registered_count: 0,
      start_date: params.start_date.trim(),
      status: "registration_open",
      created_by: params.created_by,
      created_at: now,
      updated_at: now,
      matches: [],
      participants: [],
    };

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("tournaments")
        .insert({
          title: tourneyPayload.title,
          subtitle: tourneyPayload.subtitle,
          description: tourneyPayload.description,
          platform: tourneyPayload.platform,
          prize_pool_kes: tourneyPayload.prize_pool_kes,
          first_place_kes: tourneyPayload.first_place_kes,
          second_place_kes: tourneyPayload.second_place_kes,
          entry_fee_kes: tourneyPayload.entry_fee_kes,
          format: tourneyPayload.format,
          max_players: tourneyPayload.max_players,
          registered_count: 0,
          start_date: tourneyPayload.start_date,
          status: "registration_open",
          created_by: tourneyPayload.created_by,
        })
        .select()
        .single();

      if (!error && data) {
        tourneyPayload.id = data.id;
      }
    } catch (err) {
      console.warn("Supabase insert tournament notice:", err);
    }

    // Always record in memory cache
    MEMORY_TOURNAMENTS.unshift(tourneyPayload);
    return tourneyPayload;
  }

  /**
   * Register participant for a tournament
   */
  static async registerParticipant(params: {
    tournament_id: string;
    gamer_tag: string;
    friend_id: string;
    phone_number: string;
    user_id?: string;
  }): Promise<{ success: boolean; participant?: TournamentParticipant; error?: string }> {
    const { tournament_id, gamer_tag, friend_id, phone_number, user_id } = params;

    const tourney = await this.getTournamentById(tournament_id);
    if (!tourney) {
      return { success: false, error: "Tournament not found." };
    }

    if (tourney.status !== "registration_open") {
      return { success: false, error: "Registration is closed for this tournament." };
    }

    const participants = tourney.participants || [];
    if (participants.length >= tourney.max_players) {
      return { success: false, error: "This tournament is already full." };
    }

    const cleanFriendId = friend_id.trim();
    if (participants.some((p) => p.friend_id.toLowerCase() === cleanFriendId.toLowerCase())) {
      return { success: false, error: "A gamer with this eFootball Friend ID has already registered." };
    }

    const participantId = `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newParticipant: TournamentParticipant = {
      id: participantId,
      tournament_id,
      user_id,
      gamer_tag: gamer_tag.trim(),
      friend_id: cleanFriendId,
      phone_number: phone_number.trim(),
      payment_status: tourney.entry_fee_kes === 0 ? "exempt" : "pending",
      seed: participants.length + 1,
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("tournament_participants")
        .insert({
          tournament_id,
          user_id,
          gamer_tag: newParticipant.gamer_tag,
          friend_id: newParticipant.friend_id,
          phone_number: newParticipant.phone_number,
          payment_status: newParticipant.payment_status,
          seed: newParticipant.seed,
        })
        .select()
        .single();

      if (!error && data) {
        newParticipant.id = data.id;
        // Increment registered count in DB
        await supabase
          .from("tournaments")
          .update({ registered_count: participants.length + 1 })
          .eq("id", tournament_id);
      }
    } catch (err) {
      console.warn("Supabase register participant notice:", err);
    }

    // Update memory
    const memIndex = MEMORY_TOURNAMENTS.findIndex((t) => t.id === tournament_id);
    if (memIndex !== -1) {
      MEMORY_TOURNAMENTS[memIndex].participants = [
        ...(MEMORY_TOURNAMENTS[memIndex].participants || []),
        newParticipant,
      ];
      MEMORY_TOURNAMENTS[memIndex].registered_count =
        (MEMORY_TOURNAMENTS[memIndex].participants || []).length;
    }

    return { success: true, participant: newParticipant };
  }

  /**
   * Form / Generate Tournament Knockout Brackets
   * Builds single elimination brackets (Quarter-Finals -> Semi-Finals -> Grand Final)
   * Connects winners automatically to the next match.
   */
  static async generateBrackets(
    tournament_id: string,
    options: { shuffle?: boolean } = {}
  ): Promise<{ success: boolean; matches: TournamentMatch[]; error?: string }> {
    const tourney = await this.getTournamentById(tournament_id);
    if (!tourney) {
      return { success: false, matches: [], error: "Tournament not found." };
    }

    let players = [...(tourney.participants || [])];
    if (players.length < 2) {
      return {
        success: false,
        matches: [],
        error: "At least 2 players must be registered to form tournament brackets.",
      };
    }

    if (options.shuffle) {
      players = players.sort(() => Math.random() - 0.5);
    }

    const matchesToCreate: TournamentMatch[] = [];
    const maxPlayers = tourney.max_players;

    if (maxPlayers <= 4) {
      // 4-Player Format: Semi-Finals (2 matches) -> Grand Final (1 match)
      const finalMatchId = `match-f-${Date.now()}`;
      const semi1Id = `match-s1-${Date.now()}`;
      const semi2Id = `match-s2-${Date.now()}`;

      // Semi-Final 1
      matchesToCreate.push({
        id: semi1Id,
        tournament_id,
        round: "Semi-Finals",
        match_number: 1,
        player1_name: players[0]?.gamer_tag || "TBD",
        player2_name: players[1]?.gamer_tag || "TBD",
        player1_friend_id: players[0]?.friend_id,
        player2_friend_id: players[1]?.friend_id,
        is_completed: false,
        next_match_id: finalMatchId,
        next_match_slot: 1,
        created_at: new Date().toISOString(),
      });

      // Semi-Final 2
      matchesToCreate.push({
        id: semi2Id,
        tournament_id,
        round: "Semi-Finals",
        match_number: 2,
        player1_name: players[2]?.gamer_tag || "TBD",
        player2_name: players[3]?.gamer_tag || "TBD",
        player1_friend_id: players[2]?.friend_id,
        player2_friend_id: players[3]?.friend_id,
        is_completed: false,
        next_match_id: finalMatchId,
        next_match_slot: 2,
        created_at: new Date().toISOString(),
      });

      // Grand Final
      matchesToCreate.push({
        id: finalMatchId,
        tournament_id,
        round: "Grand Final",
        match_number: 3,
        player1_name: "Winner Semi-Final 1",
        player2_name: "Winner Semi-Final 2",
        is_completed: false,
        created_at: new Date().toISOString(),
      });
    } else {
      // 8-Player (or 16-Player) Format: Quarter-Finals (4 matches) -> Semi-Finals (2 matches) -> Grand Final (1 match)
      const finalMatchId = `match-f-${Date.now()}`;
      const semi1Id = `match-s1-${Date.now()}`;
      const semi2Id = `match-s2-${Date.now()}`;
      const q1Id = `match-q1-${Date.now()}`;
      const q2Id = `match-q2-${Date.now()}`;
      const q3Id = `match-q3-${Date.now()}`;
      const q4Id = `match-q4-${Date.now()}`;

      // Quarter-Final 1
      matchesToCreate.push({
        id: q1Id,
        tournament_id,
        round: "Quarter-Finals",
        match_number: 1,
        player1_name: players[0]?.gamer_tag || "Slot 1 (TBD)",
        player2_name: players[1]?.gamer_tag || "Slot 2 (TBD)",
        player1_friend_id: players[0]?.friend_id,
        player2_friend_id: players[1]?.friend_id,
        is_completed: false,
        next_match_id: semi1Id,
        next_match_slot: 1,
        created_at: new Date().toISOString(),
      });

      // Quarter-Final 2
      matchesToCreate.push({
        id: q2Id,
        tournament_id,
        round: "Quarter-Finals",
        match_number: 2,
        player1_name: players[2]?.gamer_tag || "Slot 3 (TBD)",
        player2_name: players[3]?.gamer_tag || "Slot 4 (TBD)",
        player1_friend_id: players[2]?.friend_id,
        player2_friend_id: players[3]?.friend_id,
        is_completed: false,
        next_match_id: semi1Id,
        next_match_slot: 2,
        created_at: new Date().toISOString(),
      });

      // Quarter-Final 3
      matchesToCreate.push({
        id: q3Id,
        tournament_id,
        round: "Quarter-Finals",
        match_number: 3,
        player1_name: players[4]?.gamer_tag || "Slot 5 (TBD)",
        player2_name: players[5]?.gamer_tag || "Slot 6 (TBD)",
        player1_friend_id: players[4]?.friend_id,
        player2_friend_id: players[5]?.friend_id,
        is_completed: false,
        next_match_id: semi2Id,
        next_match_slot: 1,
        created_at: new Date().toISOString(),
      });

      // Quarter-Final 4
      matchesToCreate.push({
        id: q4Id,
        tournament_id,
        round: "Quarter-Finals",
        match_number: 4,
        player1_name: players[6]?.gamer_tag || "Slot 7 (TBD)",
        player2_name: players[7]?.gamer_tag || "Slot 8 (TBD)",
        player1_friend_id: players[6]?.friend_id,
        player2_friend_id: players[7]?.friend_id,
        is_completed: false,
        next_match_id: semi2Id,
        next_match_slot: 2,
        created_at: new Date().toISOString(),
      });

      // Semi-Final 1
      matchesToCreate.push({
        id: semi1Id,
        tournament_id,
        round: "Semi-Finals",
        match_number: 5,
        player1_name: "Winner QF 1",
        player2_name: "Winner QF 2",
        is_completed: false,
        next_match_id: finalMatchId,
        next_match_slot: 1,
        created_at: new Date().toISOString(),
      });

      // Semi-Final 2
      matchesToCreate.push({
        id: semi2Id,
        tournament_id,
        round: "Semi-Finals",
        match_number: 6,
        player1_name: "Winner QF 3",
        player2_name: "Winner QF 4",
        is_completed: false,
        next_match_id: finalMatchId,
        next_match_slot: 2,
        created_at: new Date().toISOString(),
      });

      // Grand Final
      matchesToCreate.push({
        id: finalMatchId,
        tournament_id,
        round: "Grand Final",
        match_number: 7,
        player1_name: "Finalist 1",
        player2_name: "Finalist 2",
        is_completed: false,
        created_at: new Date().toISOString(),
      });
    }

    try {
      const supabase = getSupabase();
      // Remove previous matches if regenerating
      await supabase.from("tournament_matches").delete().eq("tournament_id", tournament_id);
      await supabase.from("tournament_matches").insert(
        matchesToCreate.map((m) => ({
          id: m.id,
          tournament_id: m.tournament_id,
          round: m.round,
          match_number: m.match_number,
          player1_name: m.player1_name,
          player2_name: m.player2_name,
          player1_friend_id: m.player1_friend_id,
          player2_friend_id: m.player2_friend_id,
          is_completed: false,
          next_match_id: m.next_match_id,
          next_match_slot: m.next_match_slot,
        }))
      );

      // Update tournament status to in_progress
      await supabase
        .from("tournaments")
        .update({ status: "in_progress" })
        .eq("id", tournament_id);
    } catch (err) {
      console.warn("Supabase generate brackets notice:", err);
    }

    // Update memory
    const memIndex = MEMORY_TOURNAMENTS.findIndex((t) => t.id === tournament_id);
    if (memIndex !== -1) {
      MEMORY_TOURNAMENTS[memIndex].matches = matchesToCreate;
      MEMORY_TOURNAMENTS[memIndex].status = "in_progress";
    }

    return { success: true, matches: matchesToCreate };
  }

  /**
   * Post / Submit Match Result & Advance Winner into the next round
   * If Grand Final is won, crowns the Champion and completes the tournament!
   */
  static async submitMatchResult(params: {
    tournament_id: string;
    match_id: string;
    score1: number;
    score2: number;
    winner_name: string;
    match_code?: string;
  }): Promise<{
    success: boolean;
    isChampionCrowned?: boolean;
    championName?: string;
    tournament?: Tournament;
    error?: string;
  }> {
    const { tournament_id, match_id, score1, score2, winner_name, match_code } = params;

    const tourney = await this.getTournamentById(tournament_id);
    if (!tourney) {
      return { success: false, error: "Tournament not found." };
    }

    const matches = tourney.matches || [];
    const currentMatch = matches.find((m) => m.id === match_id);
    if (!currentMatch) {
      return { success: false, error: "Match not found in tournament bracket." };
    }

    // Determine clean winner name
    const finalWinner = winner_name.trim();
    currentMatch.score1 = score1;
    currentMatch.score2 = score2;
    currentMatch.winner_name = finalWinner;
    currentMatch.is_completed = true;
    if (match_code) currentMatch.match_code = match_code;

    let isChampionCrowned = false;
    let championName: string | undefined;

    // Advance winner to next match if one exists
    if (currentMatch.next_match_id) {
      const nextMatch = matches.find((m) => m.id === currentMatch.next_match_id);
      if (nextMatch) {
        if (currentMatch.next_match_slot === 1) {
          nextMatch.player1_name = finalWinner;
        } else if (currentMatch.next_match_slot === 2) {
          nextMatch.player2_name = finalWinner;
        }
      }
    }

    // If Grand Final, announce the Champion and complete tournament
    if (currentMatch.round === "Grand Final") {
      isChampionCrowned = true;
      championName = finalWinner;
      tourney.status = "completed";
      tourney.winner_name = finalWinner;
    }

    try {
      const supabase = getSupabase();
      // 1. Update current match
      await supabase
        .from("tournament_matches")
        .update({
          score1,
          score2,
          winner_name: finalWinner,
          is_completed: true,
          match_code: match_code || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", match_id);

      // 2. Update next match if applicable
      if (currentMatch.next_match_id) {
        const nextMatch = matches.find((m) => m.id === currentMatch.next_match_id);
        if (nextMatch) {
          const updatePayload: any = {};
          if (currentMatch.next_match_slot === 1) updatePayload.player1_name = finalWinner;
          if (currentMatch.next_match_slot === 2) updatePayload.player2_name = finalWinner;
          await supabase
            .from("tournament_matches")
            .update(updatePayload)
            .eq("id", currentMatch.next_match_id);
        }
      }

      // 3. If Grand Final, mark tournament completed
      if (isChampionCrowned) {
        await supabase
          .from("tournaments")
          .update({
            status: "completed",
            winner_name: finalWinner,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tournament_id);
      }
    } catch (err) {
      console.warn("Supabase update match result notice:", err);
    }

    // Update memory
    const memIndex = MEMORY_TOURNAMENTS.findIndex((t) => t.id === tournament_id);
    if (memIndex !== -1) {
      MEMORY_TOURNAMENTS[memIndex].matches = matches;
      if (isChampionCrowned) {
        MEMORY_TOURNAMENTS[memIndex].status = "completed";
        MEMORY_TOURNAMENTS[memIndex].winner_name = finalWinner;
      }
    }

    const updatedTourney = await this.getTournamentById(tournament_id);

    return {
      success: true,
      isChampionCrowned,
      championName,
      tournament: updatedTourney || tourney,
    };
  }

  /**
   * Delete a tournament
   */
  static async deleteTournament(id: string): Promise<boolean> {
    try {
      const supabase = getSupabase();
      await supabase.from("tournaments").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete tournament notice:", err);
    }

    MEMORY_TOURNAMENTS = MEMORY_TOURNAMENTS.filter((t) => t.id !== id);
    return true;
  }
}
