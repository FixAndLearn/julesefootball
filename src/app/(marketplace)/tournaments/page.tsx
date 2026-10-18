"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AdBanner } from "@/components/common/AdBanner";
import { useAuth } from "@/hooks/useAuth";
import { isSuperAdminEmail, isUserAdmin } from "@/lib/security/adminAuth";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { Tournament, TournamentMatch, TournamentParticipant } from "@/types/database";
import {
  Trophy,
  Zap,
  Users,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  X,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Clock,
  Swords,
  Award,
  Sparkles,
  PlusCircle,
  Shuffle,
  Trash2,
  Medal,
  Check,
  Crown,
  Play,
  RotateCw,
} from "lucide-react";

export default function TournamentsPage() {
  const { user, profile } = useAuth();
  const isAdmin = isSuperAdminEmail(user?.email) || isUserAdmin(user?.email, profile?.role);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isHostOpen, setIsHostOpen] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  // Registration Form State
  const [gamerTag, setGamerTag] = useState("");
  const [friendId, setFriendId] = useState("");
  const [phone, setPhone] = useState("");
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");

  // Host Tournament Form State
  const [hostTitle, setHostTitle] = useState("");
  const [hostSubtitle, setHostSubtitle] = useState("");
  const [hostPlatform, setHostPlatform] = useState<"all" | "android" | "ios" | "crossplay" | "console_pc">("crossplay");
  const [hostPrizePool, setHostPrizePool] = useState("");
  const [hostFirstPlace, setHostFirstPlace] = useState("");
  const [hostSecondPlace, setHostSecondPlace] = useState("");
  const [hostEntryFee, setHostEntryFee] = useState("");
  const [hostFormat, setHostFormat] = useState("Single Knockout 1v1 (10-Minute Extra Time & PKs)");
  const [hostMaxPlayers, setHostMaxPlayers] = useState("8");
  const [hostStartDate, setHostStartDate] = useState("");
  const [submittingHost, setSubmittingHost] = useState(false);
  const [hostError, setHostError] = useState("");

  // Score Post Form State
  const [score1, setScore1] = useState("0");
  const [score2, setScore2] = useState("0");
  const [matchCode, setMatchCode] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreError, setScoreError] = useState("");

  // Bracket Generation State
  const [generatingBrackets, setGeneratingBrackets] = useState(false);

  const fetchTourneys = useCallback(async () => {
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      if (data.tournaments) {
        setTournaments(data.tournaments);
        if (data.tournaments.length > 0) {
          // If we currently have a selected tourney, keep it updated
          setSelectedTourney((prev) => {
            if (!prev) return data.tournaments[0];
            const updated = data.tournaments.find((t: Tournament) => t.id === prev.id);
            return updated || data.tournaments[0];
          });
        } else {
          setSelectedTourney(null);
        }
      }
    } catch (err) {
      console.warn("Failed to load tournaments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTourneys();

    // Set up Realtime listener for tournaments and brackets
    const supabase = createClient();
    const channel = supabase
      .channel("tournaments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournaments" },
        () => fetchTourneys()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournament_matches" },
        () => fetchTourneys()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournament_participants" },
        () => fetchTourneys()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTourneys]);

  // Handle Player Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney) return;
    setRegError("");

    setSubmittingReg(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          tournament_id: selectedTourney.id,
          gamer_tag: gamerTag,
          friend_id: friendId,
          phone_number: normalizePhoneNumber(phone).international,
          user_id: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setRegSuccess(true);
      await fetchTourneys();
    } catch (err: any) {
      setRegError(err.message || "Failed to register.");
    } finally {
      setSubmittingReg(false);
    }
  };

  // Handle Admin Hosting a Tournament
  const handleHostTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setHostError("");
    setSubmittingHost(true);

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: hostTitle,
          subtitle: hostSubtitle,
          platform: hostPlatform,
          prize_pool_kes: Number(hostPrizePool),
          first_place_kes: Number(hostFirstPlace),
          second_place_kes: Number(hostSecondPlace),
          entry_fee_kes: Number(hostEntryFee),
          format: hostFormat,
          max_players: Number(hostMaxPlayers),
          start_date: hostStartDate,
          admin_email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to host tournament.");
      }

      setIsHostOpen(false);
      setHostTitle("");
      setHostSubtitle("");
      await fetchTourneys();
      if (data.tournament) {
        setSelectedTourney(data.tournament);
      }
    } catch (err: any) {
      setHostError(err.message || "Failed to host tournament.");
    } finally {
      setSubmittingHost(false);
    }
  };

  // Handle Bracket Generation
  const handleGenerateBrackets = async (shuffle: boolean = false) => {
    if (!selectedTourney) return;
    setGeneratingBrackets(true);
    try {
      const res = await fetch("/api/tournaments/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: selectedTourney.id,
          shuffle,
          admin_email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to form brackets.");
        return;
      }

      await fetchTourneys();
    } catch (err: any) {
      alert(err.message || "Error generating brackets.");
    } finally {
      setGeneratingBrackets(false);
    }
  };

  // Handle Match Score Submission & Progression
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney || !selectedMatch) return;
    setScoreError("");
    setSubmittingScore(true);

    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);

    if (isNaN(s1) || isNaN(s2)) {
      setScoreError("Please enter valid numerical scores.");
      setSubmittingScore(false);
      return;
    }

    if (s1 === s2) {
      setScoreError("Knockout matches cannot end in a draw! Extra Time or Penalties must decide the winner.");
      setSubmittingScore(false);
      return;
    }

    const winnerName = s1 > s2 ? selectedMatch.player1_name : selectedMatch.player2_name;

    try {
      const res = await fetch("/api/tournaments/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: selectedTourney.id,
          match_id: selectedMatch.id,
          score1: s1,
          score2: s2,
          winner_name: winnerName,
          match_code: matchCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit match score.");
      }

      setIsScoreOpen(false);
      setSelectedMatch(null);
      await fetchTourneys();

      if (data.isChampionCrowned) {
        alert(`🏆 CHAMPION CROWNED! ${data.championName} has won the tournament! Prize money dispatched via Till 1572931.`);
      }
    } catch (err: any) {
      setScoreError(err.message || "Failed to post score.");
    } finally {
      setSubmittingScore(false);
    }
  };

  // Handle Tournament Deletion (Admin)
  const handleDeleteTournament = async (tourneyId: string) => {
    if (!confirm("Are you sure you want to delete this tournament? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/tournaments?id=${tourneyId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchTourneys();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete tournament.");
      }
    } catch (e: any) {
      alert(e.message || "Error deleting tournament.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/70 via-pitch-card to-slate-900 border border-amber-500/40 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>eFootball Kenya Competitive League & Real Cups</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Host & Play 1v1 Tournaments for Real M-Pesa Cash Prizes
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Real brackets, genuine competitive players, and verified Konami Match Rooms. Register with your in-game Friend ID, play knockout matches, submit your scores, and crowned champions receive M-Pesa payouts via Safaricom Till <strong>1572931</strong> escrow!
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified M-Pesa Payouts
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Swords className="w-4 h-4 text-amber-400" /> Live Dynamic Knockout Brackets
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
                <Award className="w-4 h-4 text-indigo-400" /> Admin Officer: Brian Okibo (0794400365)
              </span>
            </div>
          </div>

          {/* Admin Host Button */}
          {isAdmin && (
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                variant="gold"
                size="lg"
                onClick={() => setIsHostOpen(true)}
                className="font-bold flex items-center gap-2 shadow-lg"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Host Tournament</span>
              </Button>
              <span className="text-[11px] text-amber-400/80 font-medium text-center">
                👑 Super Admin Privileges Active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tournaments Grid Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white font-display">
              Official Tournaments & Cups
            </h2>
          </div>
          <span className="text-xs text-slate-400">Weekly Knockouts | Kenya Time (EAT)</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-sm">Loading active tournaments...</span>
          </div>
        ) : tournaments.length === 0 ? (
          /* Uniform Clean Empty State - Zero Demo Data */
          <div className="text-center py-16 bg-pitch-surface border border-pitch-border rounded-3xl p-8 space-y-4 shadow-xl">
            <Trophy className="w-14 h-14 text-slate-600 mx-auto stroke-[1.5]" />
            <h3 className="text-lg font-bold text-white">No Active Tournaments Scheduled</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no scheduled tournaments. When Brian Okibo or tournament organizers host a new cup, it will appear here with live brackets and player registration.
            </p>
            {isAdmin ? (
              <div className="pt-2">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setIsHostOpen(true)}
                  className="font-bold inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Host the First Tournament</span>
                </Button>
              </div>
            ) : (
              <a
                href="https://wa.me/254794400365?text=Hello%20Brian%20Okibo%2C%20I%20am%20interested%20in%20participating%20in%20an%20eFootball%20tournament!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Request a Tournament on WhatsApp</span>
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.map((t) => {
              const isFull = t.registered_count >= t.max_players;
              const progressPercent = Math.min(100, Math.round((t.registered_count / t.max_players) * 100));
              const isSelected = selectedTourney?.id === t.id;

              return (
                <div
                  key={t.id}
                  className={`bg-pitch-surface border rounded-3xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 ${
                    isSelected
                      ? "border-amber-500 shadow-amber-500/10 ring-1 ring-amber-500/50"
                      : "border-pitch-border hover:border-slate-600"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          t.status === "completed"
                            ? "default"
                            : t.status === "in_progress"
                            ? "brand"
                            : "gold"
                        }
                        size="sm"
                      >
                        {t.status === "registration_open"
                          ? "REGISTRATION OPEN"
                          : t.status === "in_progress"
                          ? "BRACKETS LIVE"
                          : "COMPLETED"}
                      </Badge>
                      <span className="text-xs font-bold text-emerald-400">
                        {t.entry_fee_kes === 0 ? "FREE ENTRY" : `Entry: KES ${t.entry_fee_kes}`}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white font-display">{t.title}</h3>
                      {t.subtitle && <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>}
                    </div>

                    {/* Prize Pool Breakdown */}
                    <div className="p-4 rounded-2xl bg-pitch-card border border-pitch-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold">Total Prize Pool</span>
                        <span className="text-lg font-extrabold text-amber-300 font-display">
                          {formatCurrency(t.prize_pool_kes, "KES")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-pitch-border/60 text-[11px] text-slate-300">
                        <div>🥇 1st: <strong>{formatCurrency(t.first_place_kes, "KES")}</strong></div>
                        <div>🥈 2nd: <strong>{formatCurrency(t.second_place_kes, "KES")}</strong></div>
                      </div>
                    </div>

                    {/* Registered Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                        <span>Slots Filled:</span>
                        <strong>{t.registered_count} / {t.max_players} Gamers</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{t.start_date}</span>
                    </div>

                    {/* Winner Banner if Completed */}
                    {t.status === "completed" && t.winner_name && (
                      <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>Champion:</strong> {t.winner_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-6 pt-4 border-t border-pitch-border/60 space-y-2">
                    <div className="flex items-center gap-2">
                      {t.status === "registration_open" && (
                        <Button
                          variant="gold"
                          size="md"
                          className="flex-1 font-bold text-xs"
                          disabled={isFull}
                          onClick={() => {
                            setSelectedTourney(t);
                            setIsRegisterOpen(true);
                            setRegSuccess(false);
                            setRegError("");
                          }}
                        >
                          {isFull ? "Tournament Full" : "Register Slot"}
                        </Button>
                      )}

                      <Button
                        variant={isSelected ? "gold" : "secondary"}
                        size="md"
                        className="flex-1 text-xs font-semibold"
                        onClick={() => setSelectedTourney(t)}
                      >
                        {isSelected ? "Viewing Bracket" : "View Bracket"}
                      </Button>
                    </div>

                    {/* Admin management buttons */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTourney(t);
                            handleGenerateBrackets(false);
                          }}
                          disabled={generatingBrackets}
                          className="flex-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-center flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Form Brackets</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTournament(t.id)}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all"
                          title="Delete tournament"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Tournament Live Bracket & Match Room Center */}
      {selectedTourney && (
        <div className="bg-pitch-surface border border-pitch-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pitch-border pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Live Knockout Bracket & Score Center
                </span>
                <Badge
                  variant={selectedTourney.status === "completed" ? "default" : "brand"}
                  size="sm"
                >
                  {selectedTourney.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-white font-display mt-1">
                {selectedTourney.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-300 font-semibold bg-pitch-card px-3 py-1.5 rounded-xl border border-pitch-border">
                Prize Pool: <strong className="text-emerald-400">{formatCurrency(selectedTourney.prize_pool_kes, "KES")}</strong>
              </span>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="gold"
                    size="sm"
                    className="text-xs font-bold flex items-center gap-1.5"
                    disabled={generatingBrackets}
                    onClick={() => handleGenerateBrackets(false)}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>{selectedTourney.matches && selectedTourney.matches.length > 0 ? "Re-form Brackets" : "Form Brackets"}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Champion Crowned Celebration Banner */}
          {selectedTourney.status === "completed" && selectedTourney.winner_name && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 p-6 sm:p-8 text-black shadow-2xl border border-amber-300">
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Crown className="w-10 h-10 text-white fill-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-black/70">
                      Official Tournament Champion Crowned
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-black text-black">
                      {selectedTourney.winner_name}
                    </h4>
                    <p className="text-xs font-bold text-black/80 mt-1">
                      Awarded 1st Place Cash Prize of {formatCurrency(selectedTourney.first_place_kes, "KES")} via M-Pesa Escrow Till 1572931!
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/254794400365?text=${encodeURIComponent(
                    `Congratulations to Champion ${selectedTourney.winner_name} for winning "${selectedTourney.title}"! Prize of KES ${selectedTourney.first_place_kes} confirmed.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-black text-white hover:bg-slate-900 font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Verify Payout Receipt</span>
                </a>
              </div>
            </div>
          )}

          {/* Bracket Tree Display */}
          {selectedTourney.matches && selectedTourney.matches.length > 0 ? (
            <div className="space-y-6">
              {/* Filter rounds */}
              {(() => {
                const rounds = Array.from(new Set(selectedTourney.matches!.map((m) => m.round)));

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {rounds.map((roundName) => {
                      const roundMatches = selectedTourney.matches!.filter((m) => m.round === roundName);

                      return (
                        <div key={roundName} className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider text-center py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-1.5">
                            <Swords className="w-3.5 h-3.5 text-amber-400" />
                            <span>{roundName}</span>
                          </h4>

                          <div className="space-y-3">
                            {roundMatches.map((m) => {
                              const canPostScore = !m.is_completed || isAdmin;

                              return (
                                <div
                                  key={m.id}
                                  className={`p-4 rounded-2xl bg-pitch-card border space-y-2 text-xs shadow-md transition-all ${
                                    m.is_completed
                                      ? "border-emerald-500/40 ring-1 ring-emerald-500/20"
                                      : "border-pitch-border hover:border-slate-600"
                                  }`}
                                >
                                  {/* Match Number & Status */}
                                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                                    <span>Match #{m.match_number}</span>
                                    {m.is_completed ? (
                                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Completed
                                      </span>
                                    ) : (
                                      <span className="text-amber-400 font-semibold">Active Match</span>
                                    )}
                                  </div>

                                  {/* Player 1 Row */}
                                  <div className="flex items-center justify-between py-1">
                                    <span
                                      className={`font-semibold ${
                                        m.winner_name === m.player1_name
                                          ? "text-emerald-400 font-bold"
                                          : "text-slate-200"
                                      }`}
                                    >
                                      {m.player1_name}
                                    </span>
                                    <strong className="text-slate-100 px-2 py-0.5 bg-slate-800 rounded font-mono">
                                      {m.score1 !== undefined && m.score1 !== null ? m.score1 : "-"}
                                    </strong>
                                  </div>

                                  {/* Player 2 Row */}
                                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5 pb-1">
                                    <span
                                      className={`font-semibold ${
                                        m.winner_name === m.player2_name
                                          ? "text-emerald-400 font-bold"
                                          : "text-slate-200"
                                      }`}
                                    >
                                      {m.player2_name}
                                    </span>
                                    <strong className="text-slate-100 px-2 py-0.5 bg-slate-800 rounded font-mono">
                                      {m.score2 !== undefined && m.score2 !== null ? m.score2 : "-"}
                                    </strong>
                                  </div>

                                  {/* Winner Notification / Advance Note */}
                                  {m.winner_name && (
                                    <div className="text-[10px] text-emerald-400 font-semibold text-right pt-1">
                                      ✓ Winner: {m.winner_name}
                                    </div>
                                  )}

                                  {/* Score Submission Button */}
                                  {canPostScore && (
                                    <div className="pt-2 border-t border-slate-800">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedMatch(m);
                                          setScore1(String(m.score1 || 0));
                                          setScore2(String(m.score2 || 0));
                                          setMatchCode(m.match_code || "");
                                          setIsScoreOpen(true);
                                          setScoreError("");
                                        }}
                                        className="w-full py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5"
                                      >
                                        <Award className="w-3.5 h-3.5" />
                                        <span>{m.is_completed ? "Update Score (Admin)" : "Post Match Result"}</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Brackets not generated yet */
            <div className="p-8 rounded-2xl bg-pitch-card border border-pitch-border text-center space-y-4">
              <Swords className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">Knockout Brackets Pending Formation</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Players are currently registering for this tournament. Once slots are filled or registration ends, the administrator will form the official pairings!
              </p>
              {isAdmin && (
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => handleGenerateBrackets(false)}
                  disabled={generatingBrackets}
                  className="font-bold inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Form / Generate Brackets Now</span>
                </Button>
              )}
            </div>
          )}

          {/* Registered Participants Roster */}
          <div className="border-t border-pitch-border pt-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Registered Gamers ({selectedTourney.participants?.length || 0} / {selectedTourney.max_players})</span>
            </h4>

            {(!selectedTourney.participants || selectedTourney.participants.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No players have registered for this tournament yet. Be the first!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {selectedTourney.participants.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-2.5 rounded-xl bg-pitch-card border border-pitch-border text-xs flex items-center justify-between"
                  >
                    <div className="truncate">
                      <strong className="text-white block truncate">{p.gamer_tag}</strong>
                      <span className="text-[10px] text-slate-400">ID: {p.friend_id}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold ml-1">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Fair Play Rules */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>eFootball Kenya Fair Play Protocol & Rules</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <strong className="text-amber-400 block font-bold">1. Match Settings</strong>
            Standard 10-minute match length, Extra Time enabled, PK shootout enabled. No network tampering.
          </div>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <strong className="text-amber-400 block font-bold">2. Score Verification</strong>
            Both players post final match screenshot in the Match Room or submit scores directly on this page.
          </div>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <strong className="text-amber-400 block font-bold">3. Verified Payouts</strong>
            Winnings sent to Safaricom M-Pesa within 15 minutes of final whistle by Officer Brian Okibo (0794400365).
          </div>
        </div>
      </div>

      {/* Certified Partner Ad Slot */}
      <AdBanner slot="tournaments_bottom" format="horizontal" />

      {/* MODAL 1: Registration Modal */}
      {isRegisterOpen && selectedTourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-pitch-surface border border-pitch-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-pitch-border bg-pitch-card/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Join Tournament</h3>
                  <p className="text-xs text-slate-400">{selectedTourney.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 overflow-y-auto space-y-4">
              {regSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                  <h4 className="text-base font-bold text-white">Registration Confirmed!</h4>
                  <p className="text-xs text-slate-200">
                    Your slot is locked in. If an entry fee of{" "}
                    <strong>KES {selectedTourney.entry_fee_kes}</strong> applies, verify via Till{" "}
                    <strong>1572931</strong>.
                  </p>
                  <a
                    href={`https://wa.me/254794400365?text=${encodeURIComponent(
                      `Hello Brian Okibo, I registered for "${selectedTourney.title}"! Gamer Tag: ${gamerTag}, Friend ID: ${friendId}. Phone: ${phone}. Ready for the match room!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Join Tournament WhatsApp Room</span>
                  </a>
                </div>
              ) : (
                <>
                  {regError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                      {regError}
                    </div>
                  )}

                  <Input
                    label="Gamer Tag / In-game Name"
                    placeholder="e.g. Otieno_Striker"
                    value={gamerTag}
                    onChange={(e) => setGamerTag(e.target.value)}
                    required
                  />

                  <Input
                    label="eFootball Mobile Friend ID"
                    placeholder="e.g. 123-456-789 (Find in Extras -> User Details)"
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                    required
                  />

                  <Input
                    label="Safaricom Phone Number (For M-Pesa Payout)"
                    placeholder="e.g. +254 712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Entry Fee:</span>
                      <strong className="text-emerald-400">
                        {selectedTourney.entry_fee_kes === 0 ? "FREE" : `KES ${selectedTourney.entry_fee_kes}`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Safaricom Till Number:</span>
                      <strong className="text-amber-400">1572931 (EFootballMarket)</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full font-bold"
                      isLoading={submittingReg}
                    >
                      Confirm Registration
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Admin Host Tournament Modal */}
      {isHostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-pitch-surface border border-pitch-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-pitch-border bg-pitch-card/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Host New Tournament</h3>
                  <p className="text-xs text-slate-400">Brian Okibo Administrator Console</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHostOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHostTournament} className="p-6 overflow-y-auto space-y-4">
              {hostError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {hostError}
                </div>
              )}

              <Input
                label="Tournament Title"
                placeholder="e.g. Nairobi Weekend Clash Cup #1"
                value={hostTitle}
                onChange={(e) => setHostTitle(e.target.value)}
                required
              />

              <Input
                label="Subtitle / Short Description"
                placeholder="e.g. 8-Player Single Knockout | 10-Minute Extra Time & Penalties"
                value={hostSubtitle}
                onChange={(e) => setHostSubtitle(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Platform
                  </label>
                  <select
                    className="w-full px-3.5 py-2 rounded-xl bg-pitch-card border border-pitch-border text-white text-xs focus:outline-none focus:border-amber-500"
                    value={hostPlatform}
                    onChange={(e: any) => setHostPlatform(e.target.value)}
                  >
                    <option value="crossplay">Crossplay (Mobile / All)</option>
                    <option value="android">Android Mobile</option>
                    <option value="ios">iOS Mobile</option>
                    <option value="console_pc">Console / PC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Players
                  </label>
                  <select
                    className="w-full px-3.5 py-2 rounded-xl bg-pitch-card border border-pitch-border text-white text-xs focus:outline-none focus:border-amber-500"
                    value={hostMaxPlayers}
                    onChange={(e) => setHostMaxPlayers(e.target.value)}
                  >
                    <option value="4">4 Players (Semi-Finals & Final)</option>
                    <option value="8">8 Players (Quarter-Finals & Final)</option>
                    <option value="16">16 Players (Full Knockout)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Total Prize (KES)"
                  type="number"
                  value={hostPrizePool}
                  onChange={(e) => setHostPrizePool(e.target.value)}
                  required
                />
                <Input
                  label="1st Place (KES)"
                  type="number"
                  value={hostFirstPlace}
                  onChange={(e) => setHostFirstPlace(e.target.value)}
                  required
                />
                <Input
                  label="2nd Place (KES)"
                  type="number"
                  value={hostSecondPlace}
                  onChange={(e) => setHostSecondPlace(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Entry Fee (KES)"
                  type="number"
                  placeholder="0 for Free"
                  value={hostEntryFee}
                  onChange={(e) => setHostEntryFee(e.target.value)}
                  required
                />
                <Input
                  label="Start Date / Time"
                  placeholder="e.g. This Saturday, 8:00 PM EAT"
                  value={hostStartDate}
                  onChange={(e) => setHostStartDate(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Match Format Details"
                placeholder="e.g. Single Knockout 1v1 (10-Minute Extra Time & PKs)"
                value={hostFormat}
                onChange={(e) => setHostFormat(e.target.value)}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full font-bold"
                  isLoading={submittingHost}
                >
                  Publish Tournament
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit / Post Match Score */}
      {isScoreOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-pitch-surface border border-pitch-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-pitch-border bg-pitch-card/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Post Match Score</h3>
                  <p className="text-xs text-slate-400">{selectedMatch.round} | Match #{selectedMatch.match_number}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScoreOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitScore} className="p-6 overflow-y-auto space-y-4">
              {scoreError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {scoreError}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-pitch-card border border-pitch-border space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-white flex-1 truncate">
                    {selectedMatch.player1_name}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    className="w-16 px-3 py-2 text-center text-lg font-bold font-mono rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-3">
                  <span className="text-xs font-bold text-white flex-1 truncate">
                    {selectedMatch.player2_name}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    className="w-16 px-3 py-2 text-center text-lg font-bold font-mono rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <Input
                label="Konami In-game Match Room Code (Optional)"
                placeholder="e.g. 9812-4512"
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value)}
              />

              <div className="text-[11px] text-slate-400">
                Note: Submitting this score will automatically advance the winner into the next bracket match. If this is the Grand Final, the winner will be crowned Tournament Champion!
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full font-bold"
                  isLoading={submittingScore}
                >
                  Confirm & Advance Winner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
