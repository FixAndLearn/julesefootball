"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  calculateTournamentFee,
  calculateNetPrizePool,
} from "@/lib/utils/tournamentFee";
import {
  Trophy,
  Swords,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Crown,
  Zap,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Lock,
  UserPlus,
  LogIn,
  Check,
  Share2,
} from "lucide-react";

export default function HostTournamentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();

  // Arena Mode: 1v1 Wager Match (2 Players) vs Knockout Cup (4, 8, 16 Players)
  const [arenaType, setArenaType] = useState<"1v1" | "tournament">("1v1");
  const [hostType, setHostType] = useState<"paid" | "free">("paid");

  // Form Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [platform, setPlatform] = useState<"all" | "android" | "ios" | "crossplay" | "console_pc">("crossplay");
  const [entryFee, setEntryFee] = useState("100");
  const [maxPlayers, setMaxPlayers] = useState("2");
  const [payoutSplit, setPayoutSplit] = useState<"winner_takes_all" | "80_20" | "70_30">("winner_takes_all");
  const [format, setFormat] = useState("Best of 3 Series (12-Minute Matches)");
  const [startDate, setStartDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync mode from URL query ?type=1v1 or ?type=tournament
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "tournament") {
      setArenaType("tournament");
      setMaxPlayers("8");
      setPayoutSplit("winner_takes_all");
      setFormat("Single Knockout 1v1 (12-Minute Game + Extra Time & PKs)");
    } else if (typeParam === "1v1") {
      setArenaType("1v1");
      setMaxPlayers("2");
      setPayoutSplit("winner_takes_all");
      setFormat("Best of 3 Series (12-Minute Matches)");
    }
  }, [searchParams]);

  // When switching arena mode
  const handleSwitchArenaType = (type: "1v1" | "tournament") => {
    setArenaType(type);
    if (type === "1v1") {
      setMaxPlayers("2");
      setPayoutSplit("winner_takes_all");
      setFormat("Best of 3 Series (12-Minute Matches)");
      if (!title || title.includes("Cup") || title.includes("Tournament")) {
        setTitle("1v1 Wager Duel");
      }
    } else {
      setMaxPlayers("8");
      setFormat("Single Knockout 1v1 (12-Minute Game + Extra Time & PKs)");
      if (!title || title.includes("Duel") || title.includes("1v1")) {
        setTitle("Weekend Knockout Championship");
      }
    }
  };

  // Calculation breakdown
  const numPlayers = Number(maxPlayers || (arenaType === "1v1" ? 2 : 8));
  const rawFee = hostType === "paid" ? Math.max(0, Number(entryFee || 0)) : 0;
  const totalPot = numPlayers * rawFee;
  const { adminFee, netPrizePool, firstPlace, secondPlace } = calculateNetPrizePool(
    totalPot,
    numPlayers,
    payoutSplit
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please sign in or register to host a tournament.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for the match or tournament.");
      return;
    }

    if (!startDate.trim()) {
      setError("Please enter the match date/time (e.g. Today 8:00 PM EAT).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        action: "create",
        title: title.trim(),
        subtitle:
          subtitle.trim() ||
          (arenaType === "1v1"
            ? `1v1 Head-to-Head Wager Duel | KES ${netPrizePool.toLocaleString()} Winner Prize`
            : `${numPlayers}-Player Knockout Tournament | KES ${netPrizePool.toLocaleString()} Prize Pool`),
        platform,
        tournament_type: arenaType,
        admin_fee_kes: adminFee,
        payout_split: arenaType === "1v1" ? "winner_takes_all" : payoutSplit,
        prize_pool_kes: netPrizePool,
        first_place_kes: firstPlace,
        second_place_kes: secondPlace,
        entry_fee_kes: rawFee,
        format,
        max_players: numPlayers,
        start_date: startDate.trim(),
      };

      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create tournament.");
      }

      // Success: redirect back to tournaments with the new tournament highlighted
      if (data.tournament?.id) {
        router.push(`/tournaments?join=${data.tournament.id}&created=true`);
      } else {
        router.push("/tournaments");
      }
    } catch (err: any) {
      setError(err.message || "Failed to host tournament.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-dark text-slate-100 flex flex-col">
      {/* Top Navigation Bar: Seamless Back to Tournaments & Marketplace */}
      <div className="border-b border-pitch-border bg-pitch-surface/90 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-xs font-semibold text-slate-300 hover:text-white transition-all whitespace-nowrap group shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Tournaments Arena</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
              Till 1572931 Escrow
            </span>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <span>Marketplace</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full-page Scrollable (Zero Modal Obstruction) */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 pb-36 sm:pb-24">
        {/* Page Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-950/60 via-pitch-card to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>You Become Tournament Moderator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              Host a Tournament or 1v1 Wager Duel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Create your match, invite friends via WhatsApp, and manage brackets. All entry funds are protected by Safaricom Till <strong>1572931</strong> escrow with instant M-Pesa winner payout!
            </p>
          </div>
        </div>

        {/* Guest Auth Notice if not logged in */}
        {!authLoading && !user && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-sm text-white block">Community Account Required</strong>
                <span className="text-xs text-slate-300">Sign in or register to host and moderate your tournament.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/register?redirect=/tournaments/host" className="flex-1 sm:flex-initial">
                <Button variant="gold" size="sm" className="w-full font-bold">
                  Register Free
                </Button>
              </Link>
              <Link href="/login?redirect=/tournaments/host" className="flex-1 sm:flex-initial">
                <Button variant="secondary" size="sm" className="w-full font-bold">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Choose Arena Type (1v1 Wager vs Knockout Tournament) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Select Arena Match Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1v1 Wager Duel Option */}
              <button
                type="button"
                onClick={() => handleSwitchArenaType("1v1")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  arenaType === "1v1"
                    ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "bg-pitch-card border-pitch-border hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Swords className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    2 Players • Winner Takes All
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-display">
                  ⚔️ 1v1 Head-to-Head Duel
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Direct match between 2 players. Standard Best of 3 (or 12-min game). The winner takes 100% of the prize pot!
                </p>
              </button>

              {/* Tournament Cup Option */}
              <button
                type="button"
                onClick={() => handleSwitchArenaType("tournament")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  arenaType === "tournament"
                    ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "bg-pitch-card border-pitch-border hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    4, 8, or 16 Players
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-display">
                  🏆 Knockout Tournament Cup
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Multi-player knockout bracket. Semi-Finals and Grand Final with agreed 1st/2nd place prize split.
                </p>
              </button>
            </div>
          </div>

          {/* STEP 2: Free vs Paid Prize Pool */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Entry &amp; Prize Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHostType("paid")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  hostType === "paid"
                    ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/30"
                    : "bg-pitch-card border-pitch-border text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-xs font-bold block text-white">💰 Paid Prize Pool</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">
                  Till 1572931 or Wallet • Fair platform fee
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHostType("free")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  hostType === "free"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30"
                    : "bg-pitch-card border-pitch-border text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-xs font-bold block text-white">🎮 Free Community Match</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">
                  Free to enter • Community ranking
                </span>
              </button>
            </div>
          </div>

          {/* STEP 3: Basic Info (Title, Platform, Slots) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-pitch-surface border border-pitch-border space-y-4 shadow-xl">
            <Input
              label="Match / Tournament Title"
              placeholder={
                arenaType === "1v1"
                  ? "e.g. Nairobi eFootball 1v1 Wager Duel #1"
                  : "e.g. Weekend Champions Knockout Cup"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Platform
                </label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-white text-xs focus:outline-none focus:border-amber-500"
                  value={platform}
                  onChange={(e: any) => setPlatform(e.target.value)}
                >
                  <option value="crossplay">Crossplay (Mobile / All)</option>
                  <option value="android">Android Mobile</option>
                  <option value="ios">iOS Mobile</option>
                  <option value="console_pc">Console / PC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Player Slots
                </label>
                {arenaType === "1v1" ? (
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-amber-300 font-bold text-xs">
                    2 Players (1v1 Head-to-Head)
                  </div>
                ) : (
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-white text-xs focus:outline-none focus:border-amber-500"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                  >
                    <option value="4">4 Players (Semi-Finals &amp; Final)</option>
                    <option value="8">8 Players (Quarter-Finals &amp; Final)</option>
                    <option value="16">16 Players (Full Knockout)</option>
                  </select>
                )}
              </div>
            </div>

            <Input
              label="Match Date &amp; Start Time"
              placeholder="e.g. Today 8:00 PM EAT (or This Saturday, 8:00 PM)"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* STEP 4: Financial Calculation Card (Fair Tiered Admin Deal) */}
          {hostType === "paid" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-pitch-surface border border-amber-500/40 space-y-4 shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    Entry Fee per Player (KES)
                  </label>
                  <span className="text-[11px] text-amber-400 font-mono font-semibold">
                    Pay via Till 1572931 or Wallet
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {["20", "50", "100", "200", "500", "1000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEntryFee(preset)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        entryFee === preset
                          ? "bg-amber-500 text-black border-amber-400 shadow-md"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:text-white"
                      }`}
                    >
                      KES {preset}
                    </button>
                  ))}
                </div>

                <Input
                  type="number"
                  placeholder="Enter custom entry fee"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  required
                />
              </div>

              {/* Payout Distribution Option (Only for Multi-Player Tournaments) */}
              {arenaType === "tournament" && (
                <div className="space-y-1.5 pt-1 border-t border-pitch-border/60">
                  <label className="block text-xs font-semibold text-slate-300">
                    Agreed Winner Prize Distribution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutSplit("winner_takes_all")}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                        payoutSplit === "winner_takes_all"
                          ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className="block text-[11px] font-bold">Winner 100%</span>
                      <span className="block text-[9px] opacity-80">Winner takes all</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutSplit("80_20")}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                        payoutSplit === "80_20"
                          ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className="block text-[11px] font-bold">80% / 20%</span>
                      <span className="block text-[9px] opacity-80">1st &amp; 2nd Split</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutSplit("70_30")}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                        payoutSplit === "70_30"
                          ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className="block text-[11px] font-bold">70% / 30%</span>
                      <span className="block text-[9px] opacity-80">1st &amp; 2nd Split</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Real-Time Fair Fee & Net Prize Card */}
              <div className="p-4 rounded-2xl bg-pitch-card border border-amber-500/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Total Collected Pot ({numPlayers} players × KES {rawFee}):</span>
                  <strong className="text-white font-mono text-sm">KES {totalPot.toLocaleString()}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Fair Platform Admin Deal:</span>
                  </span>
                  <div className="text-right">
                    <strong className="text-amber-400 font-mono font-bold">
                      KES {adminFee.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-400 block">
                      ({totalPot > 0 ? Math.round((adminFee / totalPot) * 100) : 0}% fair deal)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-pitch-border flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Net Prize Pool in Escrow:</span>
                    <span className="text-[10px] text-slate-400">Guaranteed in Safaricom Till 1572931</span>
                  </div>
                  <span className="text-lg font-black text-emerald-400 font-mono font-display">
                    KES {netPrizePool.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-pitch-border/60 text-[11px] text-slate-300">
                  <div>
                    🥇 Winner / 1st:{" "}
                    <strong className="text-amber-300 font-mono font-bold">
                      KES {firstPlace.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    🥈 2nd Place:{" "}
                    <strong className="text-slate-200 font-mono">
                      {secondPlace > 0 ? `KES ${secondPlace.toLocaleString()}` : "Honor / Trophy"}
                    </strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 pt-1 leading-relaxed border-t border-pitch-border/60">
                  Players can pay their entry via <strong>Safaricom Till 1572931</strong> or directly from their <strong>eFootballMarket Account Balance</strong>. Prize funds remain safely locked until you approve the match result!
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Match Duration & Rules (12-Minute Game Standard) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-pitch-surface border border-pitch-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                3. Match Duration &amp; Rules
              </label>
              <span className="text-[10px] text-amber-400 font-bold font-mono">
                ⏱️ 12-Minute Match Standard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("Best of 3 Series (12-Minute Matches)")}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                  format.includes("Best of 3")
                    ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/30 font-bold"
                    : "bg-pitch-card border-pitch-border text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="font-bold text-white block text-xs">⭐ 12-Min Best of 3</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Standard for 1v1 wagers (first to 2 wins)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("Single Knockout 1v1 (12-Minute Game + Extra Time & PKs)")}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                  format.includes("Single Knockout")
                    ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/30 font-bold"
                    : "bg-pitch-card border-pitch-border text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="font-bold text-white block text-xs">⏱️ 12-Min Knockout</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Extra Time &amp; PK shootout enabled
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("Home & Away 1v1 (12-Minute Two-Leg Aggregate)")}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                  format.includes("Two-Leg")
                    ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/30 font-bold"
                    : "bg-pitch-card border-pitch-border text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="font-bold text-white block text-xs">🔁 12-Min Two-Leg</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Aggregate score over two 12-min games
                </span>
              </button>
            </div>

            <Input
              label="Format &amp; Match Room Details"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              helperText="All participants must set their match duration to 12 minutes in the eFootball Friend Match room."
              required
            />
          </div>

          {/* Submit Action (Prominent, Full-Width, Never Squeezed) */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full font-black text-sm py-4 rounded-2xl shadow-xl shadow-amber-500/10 cursor-pointer min-h-[52px]"
              isLoading={submitting}
              disabled={submitting}
            >
              <span>
                {arenaType === "1v1"
                  ? "Publish 1v1 Duel & Become Moderator"
                  : "Publish Tournament & Become Moderator"}
              </span>
            </Button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              You will be redirected to your live bracket center to share the WhatsApp invite link with opponents!
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
