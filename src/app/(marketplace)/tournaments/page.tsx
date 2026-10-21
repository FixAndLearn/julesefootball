"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  Lock,
  UserPlus,
  LogIn,
  Share2,
  Copy,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { calculateTournamentFee } from "@/lib/utils/tournamentFee";

export default function TournamentsPage() {
  const { user, profile, displayName } = useAuth();
  const isAdmin = isSuperAdminEmail(user?.email) || isUserAdmin(user?.email, profile?.role);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAuthRequiredOpen, setIsAuthRequiredOpen] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  // Registration Form State
  const [gamerTag, setGamerTag] = useState("");
  const [friendId, setFriendId] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "mpesa_till">("wallet");
  const [regResult, setRegResult] = useState<{ remaining_balance?: number; paid_via_wallet?: boolean } | null>(null);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");
  const [copiedTourneyId, setCopiedTourneyId] = useState<string | null>(null);

  // Handle URL join parameter (e.g. ?join=tourney-id)
  useEffect(() => {
    if (typeof window !== "undefined" && tournaments.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const joinId = urlParams.get("join");
      if (joinId) {
        const found = tournaments.find((t) => t.id === joinId);
        if (found) {
          setSelectedTourney(found);
        }
      }
    }
  }, [tournaments]);

  const handleCopyInvite = async (t: Tournament) => {
    try {
      const inviteUrl = `${window.location.origin}/tournaments?join=${t.id}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedTourneyId(t.id);
      setTimeout(() => setCopiedTourneyId(null), 2000);
    } catch {
      // quiet fallback
    }
  };

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

    if (!user) {
      setIsRegisterOpen(false);
      setIsAuthRequiredOpen(true);
      return;
    }

    setRegError("");
    setSubmittingReg(true);
    try {
      const isPaid = (selectedTourney.entry_fee_kes || 0) > 0;
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
          payment_method: isPaid ? paymentMethod : "free",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setRegResult(data);
      setRegSuccess(true);
      await fetchTourneys();
    } catch (err: any) {
      setRegError(err.message || "Failed to register.");
    } finally {
      setSubmittingReg(false);
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

          {/* Host Actions: 1v1 Wager Duel & Multi-Player Tournament */}
          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href="/tournaments/host?type=1v1"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Create 1v1 Wager Duel</span>
            </Link>

            <Link
              href="/tournaments/host?type=tournament"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Host 4-16 Player Cup</span>
            </Link>

            <span className="text-[11px] text-slate-400 font-medium text-center">
              Fair Fee (KES 10-20 to ~5%) • 12-Min Matches
            </span>
          </div>
        </div>
      </div>

      {/* Community Membership Required Notice Banner for Guests */}
      {!loading && !user && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-pitch-card to-emerald-500/10 border border-amber-500/30 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Community Rule
                </span>
                <span className="text-[10px] bg-amber-400/15 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/20">
                  Members Only
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                You Must Register an Account to Join Tournaments
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Tournaments feature real M-Pesa prize money via Till <strong>1572931</strong>. To prevent smurfing, maintain fair brackets, and guarantee instant payouts, you must be a registered member of our eFootballMarket community.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 md:pt-0">
            <Link
              href="/register?redirect=/tournaments"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all text-center"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register to Compete</span>
            </Link>
            <Link
              href="/login?redirect=/tournaments"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pitch-card hover:bg-slate-800 text-slate-200 border border-pitch-border font-bold text-xs transition-all text-center"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      )}

      {/* Tournaments Grid Header - Mobile Collision Fixed */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 items-start pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              Community &amp; Official Tournaments
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Weekly Knockouts • Kenya Time (EAT)</span>
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
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tournaments/host?type=1v1"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg transition-all"
              >
                <Swords className="w-4 h-4" />
                <span>Create 1v1 Wager Duel</span>
              </Link>
              <Link
                href="/tournaments/host?type=tournament"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-white font-bold text-xs transition-all"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Host Knockout Tournament</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.map((t) => {
              const isFull = t.registered_count >= t.max_players;
              const progressPercent = Math.min(100, Math.round((t.registered_count / t.max_players) * 100));
              const isSelected = selectedTourney?.id === t.id;
              const isModerator = (user && t.created_by === user.id) || isAdmin;
              const isMyTournament = user && t.created_by === user.id;

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
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {t.tournament_type === "1v1" || t.max_players <= 2 ? (
                          <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                            <Swords className="w-3 h-3 text-amber-400" />
                            <span>1v1 WAGER DUEL</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-indigo-400" />
                            <span>{t.max_players}-PLAYER CUP</span>
                          </span>
                        )}
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
                        {isMyTournament ? (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                            👑 You are Moderator
                          </span>
                        ) : t.created_by ? (
                          <span className="text-[10px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            Community Hosted
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                            Official Cup
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-emerald-400 font-mono">
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
                        <span className="text-xs text-slate-400 font-semibold">
                          {t.tournament_type === "1v1" || t.max_players <= 2 ? "Winner Takes All (Net Pool)" : "Total Prize Pool"}
                        </span>
                        <span className="text-lg font-extrabold text-amber-300 font-display">
                          {formatCurrency(t.prize_pool_kes, "KES")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-pitch-border/60 text-[11px] text-slate-300">
                        {t.tournament_type === "1v1" || t.max_players <= 2 || t.payout_split === "winner_takes_all" ? (
                          <div className="col-span-2 text-emerald-400 font-bold">
                            👑 Champion Takes 100%: <strong>{formatCurrency(t.prize_pool_kes, "KES")}</strong>
                          </div>
                        ) : (
                          <>
                            <div>🥇 1st: <strong>{formatCurrency(t.first_place_kes, "KES")}</strong></div>
                            <div>🥈 2nd: <strong>{formatCurrency(t.second_place_kes, "KES")}</strong></div>
                          </>
                        )}
                      </div>
                      {t.entry_fee_kes > 0 && (
                        <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between border-t border-pitch-border/40">
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Escrow Protected</span>
                          </span>
                          <span className="text-amber-400/90 font-mono">
                            Platform Deal: KES {t.admin_fee_kes ?? calculateTournamentFee(t.entry_fee_kes * t.max_players)}
                          </span>
                        </div>
                      )}
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

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>{t.start_date}</span>
                      </div>
                      <span className="uppercase text-[10px] font-bold text-slate-400">
                        {t.platform}
                      </span>
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
                        <Link
                          href={isFull ? "#" : `/tournaments/register?id=${t.id}`}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                            isFull
                              ? "bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none"
                              : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/10 cursor-pointer"
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{isFull ? "Tournament Full" : "Register Slot"}</span>
                        </Link>
                      )}

                      <Button
                        variant={isSelected ? "gold" : "secondary"}
                        size="md"
                        className="flex-1 text-xs font-semibold cursor-pointer"
                        onClick={() => setSelectedTourney(t)}
                      >
                        {isSelected ? "Viewing Bracket" : "View Bracket"}
                      </Button>
                    </div>

                    {/* Invite Players Trigger */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `🎮 Join my eFootball tournament "${t.title}"!\n🏆 Prize Pool: KES ${t.prize_pool_kes.toLocaleString()}\n🎟️ Entry Fee: ${
                            t.entry_fee_kes > 0 ? `KES ${t.entry_fee_kes}` : "FREE"
                          }\n⚡ Format: ${t.format}\n\n👉 Register now: https://efootballmarket.co.ke/tournaments?join=${t.id}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 text-emerald-300 font-bold text-[11px] transition-all shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        <span>Invite on WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyInvite(t)}
                        className="p-2 rounded-xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-slate-300 hover:text-white transition-all text-xs cursor-pointer"
                        title="Copy Tournament Link"
                      >
                        {copiedTourneyId === t.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Moderator / Admin Management Buttons */}
                    {isModerator && (
                      <div className="flex items-center gap-2 pt-1 border-t border-pitch-border/40">
                        {t.status === "registration_open" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTourney(t);
                              handleGenerateBrackets(false);
                            }}
                            disabled={generatingBrackets}
                            className="flex-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3" />
                            <span>Form Brackets</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteTournament(t.id)}
                          className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-800/50 transition-all cursor-pointer"
                          title="Delete / cancel tournament"
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

              {((user && selectedTourney.created_by === user.id) || isAdmin) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="gold"
                    size="sm"
                    className="text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
                              const isModerator = (user && selectedTourney?.created_by === user.id) || isAdmin;
                              const canPostScore = !m.is_completed || isModerator;

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
                                        <span>{m.is_completed ? "Update Score (Moderator)" : "Post Match Result"}</span>
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
            <strong className="text-amber-400 block font-bold">1. Match Settings (12-Minute Game)</strong>
            Standard 12-minute match length, Extra Time enabled, PK shootout enabled. Both players set match duration to 12 mins in eFootball Friend Match settings.
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

      {/* MODAL 0: Community Membership Required Guard Modal */}
      {isAuthRequiredOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-pitch-surface border border-pitch-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-pitch-border bg-gradient-to-r from-amber-950/60 via-pitch-card to-pitch-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Community Registration Required</h3>
                  <p className="text-xs text-amber-400/90 font-medium">Official Tournament Entry Protocol</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthRequiredOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white font-display">
                  Only Registered Members Can Join Tournaments
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To ensure competitive integrity, prevent bracket abandonment, and guarantee secure M-Pesa prize payouts, all players must be registered members of our eFootball Kenya community.
                </p>
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-pitch-card border border-pitch-border/70 text-xs">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Fair Play & No Multiple Slots:</strong> One slot per verified community member account.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Instant M-Pesa Payout:</strong> Winnings sent via Safaricom Till 1572931 directly to your phone.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <Swords className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Live Match Rooms:</strong> Direct access to opponents, bracket updates, and score submission.
                  </div>
                </div>
              </div>

              {selectedTourney && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]">
                    Target: <strong className="text-white">{selectedTourney.title}</strong>
                  </span>
                  <span className="text-amber-400 font-bold shrink-0">
                    Prize: {formatCurrency(selectedTourney.prize_pool_kes, "KES")}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <Link
                  href="/register?redirect=/tournaments"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all text-center"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account & Join Tournament</span>
                </Link>

                <Link
                  href="/login?redirect=/tournaments"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-white font-bold text-xs transition-all text-center"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Already Have an Account? Log In</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsAuthRequiredOpen(false)}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 text-center transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <h3 className="text-base font-bold text-white">
                    {selectedTourney.tournament_type === "1v1" ? "Join 1v1 Wager Duel" : "Join Tournament"}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedTourney.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 overflow-y-auto space-y-4">
              {regSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                  <h4 className="text-base font-bold text-white">Registration Confirmed!</h4>
                  {regResult?.paid_via_wallet ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 text-xs text-slate-200 space-y-1.5 text-left">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold">
                        <Wallet className="w-4 h-4" />
                        <span>Paid with Account Balance!</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Entry fee of <strong>KES {selectedTourney.entry_fee_kes.toLocaleString()}</strong> has been deducted directly from your account balance. Your slot is guaranteed immediately!
                      </p>
                      {regResult.remaining_balance !== undefined && (
                        <div className="pt-1 border-t border-emerald-500/30 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Remaining Balance:</span>
                          <strong className="text-emerald-300 font-mono">
                            KES {regResult.remaining_balance.toLocaleString()}
                          </strong>
                        </div>
                      )}
                    </div>
                  ) : selectedTourney.entry_fee_kes > 0 ? (
                    <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-slate-200 space-y-1.5 text-left">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <Smartphone className="w-4 h-4" />
                        <span>Slot Reserved — Pay via Till 1572931</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Please send <strong>KES {selectedTourney.entry_fee_kes.toLocaleString()}</strong> to Safaricom Buy Goods Till <strong className="text-amber-300 font-mono">1572931</strong> (EFootballMarket). Moderator Brian Okibo will verify and approve your slot.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-200">
                      Free slot locked in! Get your eFootball squad ready.
                    </p>
                  )}

                  <a
                    href={`https://wa.me/254794400365?text=${encodeURIComponent(
                      `Hello Brian Okibo, I registered for "${selectedTourney.title}"! Gamer Tag: ${gamerTag}, Friend ID: ${friendId}. Phone: ${phone}. Payment: ${
                        regResult?.paid_via_wallet
                          ? `Paid via Account Balance (KES ${selectedTourney.entry_fee_kes})`
                          : selectedTourney.entry_fee_kes > 0
                          ? `Paying KES ${selectedTourney.entry_fee_kes} via Till 1572931`
                          : "Free Entry"
                      }. Ready for match room!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Join Tournament WhatsApp Room</span>
                  </a>
                </div>
              ) : (
                <>
                  {/* Verified Member Badge */}
                  {user && (
                    <div className="p-3 rounded-2xl bg-pitch-card border border-pitch-border/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-white block">
                            Community Member Verified
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {displayName || profile?.username || user?.email}
                          </span>
                        </div>
                      </div>
                      <Badge variant="brand" size="sm">Eligible</Badge>
                    </div>
                  )}

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

                  {/* Payment Method Selector if Entry Fee > 0 */}
                  {selectedTourney.entry_fee_kes > 0 ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-300">
                          Payment Method
                        </label>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          Entry: KES {selectedTourney.entry_fee_kes.toLocaleString()}
                        </span>
                      </div>

                      {/* Option 1: Account Wallet Balance */}
                      {(() => {
                        const balance = profile?.available_balance || 0;
                        const hasEnough = balance >= selectedTourney.entry_fee_kes;

                        return (
                          <div
                            onClick={() => {
                              if (hasEnough) setPaymentMethod("wallet");
                            }}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              !hasEnough
                                ? "bg-slate-900/50 border-slate-800/80 opacity-60 cursor-not-allowed"
                                : paymentMethod === "wallet"
                                ? "bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40 cursor-pointer shadow-md"
                                : "bg-pitch-card border-pitch-border hover:border-slate-700 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                                  paymentMethod === "wallet" && hasEnough
                                    ? "border-emerald-400 bg-emerald-500"
                                    : "border-slate-600"
                                }`}
                              >
                                {paymentMethod === "wallet" && hasEnough && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Pay with Account Balance</span>
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                      hasEnough
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    }`}
                                  >
                                    KES {balance.toLocaleString()} Available
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                  {hasEnough
                                    ? `Instant deduction of KES ${selectedTourney.entry_fee_kes.toLocaleString()} from your wallet. Zero SMS waiting.`
                                    : `Insufficient wallet balance (KES ${balance.toLocaleString()} available / KES ${selectedTourney.entry_fee_kes.toLocaleString()} required). Top up or choose Till payment below.`}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Option 2: Safaricom Till 1572931 */}
                      <div
                        onClick={() => setPaymentMethod("mpesa_till")}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          paymentMethod === "mpesa_till"
                            ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/40 shadow-md"
                            : "bg-pitch-card border-pitch-border hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                              paymentMethod === "mpesa_till"
                                ? "border-amber-400 bg-amber-500"
                                : "border-slate-600"
                            }`}
                          >
                            {paymentMethod === "mpesa_till" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-black" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pay via Safaricom Till</span>
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                Till 1572931
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              Send KES {selectedTourney.entry_fee_kes.toLocaleString()} to Buy Goods Till{" "}
                              <strong className="text-amber-300 font-mono">1572931</strong> (EFootballMarket). Moderator verifies M-Pesa ref.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                      <span>Entry Fee:</span>
                      <strong className="font-bold">FREE ENTRY</strong>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full font-bold cursor-pointer"
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
