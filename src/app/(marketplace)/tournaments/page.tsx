"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { Tournament, TournamentMatch } from "@/app/api/tournaments/route";
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
} from "lucide-react";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form State
  const [gamerTag, setGamerTag] = useState("");
  const [friendId, setFriendId] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");

  const fetchTourneys = async () => {
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      if (data.tournaments) {
        setTournaments(data.tournaments);
        if (!selectedTourney) {
          setSelectedTourney(data.tournaments[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to load tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourneys();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney) return;
    setRegError("");

    setSubmitting(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: selectedTourney.id,
          gamer_tag: gamerTag,
          friend_id: friendId,
          phone_number: normalizePhoneNumber(phone).international,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setRegSuccess(true);
      fetchTourneys();
    } catch (err: any) {
      setRegError(err.message || "Failed to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/60 via-pitch-card to-slate-900 border border-amber-500/40 p-6 sm:p-10 mb-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>eFootball Kenya Competitive League & Weekend Cups</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Play 1v1 Tournaments & Win Real M-Pesa Cash Prizes
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Test your eFootball mobile skills against Kenya’s best Division 1 tacticians. Register with your in-game Friend ID, play knockout match rooms, and get prize winnings sent directly to your M-Pesa via Safaricom Till <strong>1572931</strong> escrow!
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Guaranteed M-Pesa Payouts
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Swords className="w-4 h-4 text-amber-400" /> Verified Match Room Brackets
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
              <Award className="w-4 h-4 text-indigo-400" /> Admin Officer: Brian Okibo (0794400365)
            </span>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Current Tournaments & Cups</span>
          </h2>
          <span className="text-xs text-slate-400">Weekly Knockouts (Kenya Time EAT)</span>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-16 bg-pitch-surface border border-pitch-border rounded-3xl p-8 space-y-4">
            <Trophy className="w-12 h-12 text-slate-500 mx-auto stroke-[1.5]" />
            <h3 className="text-lg font-bold text-white">No Active Tournaments Scheduled</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upcoming weekly knockout cups will be posted here. Join our community alerts to register as soon as brackets open!
            </p>
            <a
              href="https://wa.me/254794400365?text=Hello%20Brian%2C%20I%20want%20to%20be%20notified%20about%20the%20next%20eFootball%20tournament"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Join Tournament WhatsApp Alerts</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.map((t) => {
              const isFull = t.registered_count >= t.max_players;
              const progressPercent = Math.round((t.registered_count / t.max_players) * 100);

            return (
              <div
                key={t.id}
                className={`bg-pitch-surface border rounded-3xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 ${
                  selectedTourney?.id === t.id
                    ? "border-amber-500 shadow-amber-500/10 ring-1 ring-amber-500/50"
                    : "border-pitch-border hover:border-slate-600"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={t.status === "completed" ? "default" : "brand"} size="sm">
                      {t.status === "registration_open" ? "REGISTRATION OPEN" : t.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <span className="text-xs font-bold text-emerald-400">
                      {t.entry_fee_kes === 0 ? "FREE ENTRY" : `Entry: KES ${t.entry_fee_kes}`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white font-display">{t.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
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
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-pitch-border/60 space-y-2">
                  {t.status === "completed" ? (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-center text-amber-300 font-semibold">
                      🏆 Champion: {t.winner_name}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="gold"
                        size="md"
                        className="flex-1 font-bold text-xs"
                        disabled={isFull}
                        onClick={() => {
                          setSelectedTourney(t);
                          setIsRegisterOpen(true);
                          setRegSuccess(false);
                        }}
                      >
                        {isFull ? "Tournament Full" : "Register Now"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        className="text-xs"
                        onClick={() => setSelectedTourney(t)}
                      >
                        Brackets
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Interactive Bracket Viewer */}
      {selectedTourney && selectedTourney.matches && selectedTourney.matches.length > 0 && (
        <div className="bg-pitch-surface border border-pitch-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pitch-border pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Live Knockout Bracket
              </span>
              <h3 className="text-2xl font-bold text-white font-display mt-0.5">
                {selectedTourney.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">
                Prize Pool: <strong className="text-emerald-400">{formatCurrency(selectedTourney.prize_pool_kes, "KES")}</strong>
              </span>
            </div>
          </div>

          {/* Bracket Tree */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Quarter Finals */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center py-1 rounded-lg bg-slate-900 border border-slate-800">
                Quarter-Finals (1v1)
              </h4>
              {selectedTourney.matches
                .filter((m) => m.round === "Quarter-Finals")
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-pitch-card border border-pitch-border space-y-2 text-xs shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${m.winner?.includes(m.player1) ? "text-emerald-400" : "text-slate-200"}`}>
                        {m.player1}
                      </span>
                      <strong className="text-slate-100 px-2 py-0.5 bg-slate-800 rounded font-mono">
                        {m.score1 !== undefined ? m.score1 : "-"}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                      <span className={`font-semibold ${m.winner?.includes(m.player2) ? "text-emerald-400" : "text-slate-200"}`}>
                        {m.player2}
                      </span>
                      <strong className="text-slate-100 px-2 py-0.5 bg-slate-800 rounded font-mono">
                        {m.score2 !== undefined ? m.score2 : "-"}
                      </strong>
                    </div>
                    {m.winner && (
                      <div className="text-[10px] text-emerald-400 font-semibold text-right pt-0.5">
                        ✓ Advances: {m.winner}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Semi Finals */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center py-1 rounded-lg bg-slate-900 border border-slate-800">
                Semi-Finals
              </h4>
              {selectedTourney.matches
                .filter((m) => m.round === "Semi-Finals")
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-pitch-card border border-pitch-border space-y-2 text-xs shadow-md my-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{m.player1}</span>
                      <span className="text-slate-500 font-mono">-</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                      <span className="font-semibold text-slate-200">{m.player2}</span>
                      <span className="text-slate-500 font-mono">-</span>
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold text-center pt-0.5">
                      ⚡ Match scheduled for Sunday 9:00 PM
                    </div>
                  </div>
                ))}
            </div>

            {/* Grand Final */}
            <div className="space-y-4 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center py-1 rounded-lg bg-amber-950/40 border border-amber-500/40">
                🏆 Grand Final (KES 3,500 1st Prize)
              </h4>
              <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 via-pitch-card to-slate-900 border border-amber-500/50 space-y-3 text-xs shadow-xl text-center">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                <h5 className="font-bold text-sm text-white">Championship Clash</h5>
                <p className="text-xs text-slate-300">
                  Semi-Final Winner 1 vs Semi-Final Winner 2
                </p>
                <div className="pt-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    Grand Prize: KES 3,500 via M-Pesa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Rules Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Tournament Rules & Fair Play Protocol</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <strong className="text-amber-400 block font-bold">1. Match Settings</strong>
            10-minute match length, Extra Time enabled, PK shootout enabled, standard condition.
          </div>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <strong className="text-amber-400 block font-bold">2. Score Verification</strong>
            Both players must take a screenshot of the final match results and submit to the tournament WhatsApp group.
          </div>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <strong className="text-amber-400 block font-bold">3. Guaranteed Payouts</strong>
            Winnings sent to Safaricom M-Pesa within 15 minutes of final whistle by Officer Brian Okibo (0794400365).
          </div>
        </div>
      </div>

      {/* Registration Modal */}
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
                    Your slot is reserved. If applicable, entry fee of{" "}
                    <strong>KES {selectedTourney.entry_fee_kes}</strong> is locked in Escrow Till{" "}
                    <strong>1572931</strong>.
                  </p>
                  <a
                    href={`https://wa.me/254794400365?text=${encodeURIComponent(
                      `Hello Brian Okibo, I registered for "${selectedTourney.title}"! Gamer Tag: ${gamerTag}, Friend ID: ${friendId}. Phone: ${phone}. Ready for the tournament match room!`
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
                      isLoading={submitting}
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
    </div>
  );
}
