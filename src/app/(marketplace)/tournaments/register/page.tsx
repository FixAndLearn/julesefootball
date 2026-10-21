"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { formatCurrency } from "@/lib/utils";
import { Tournament } from "@/types/database";
import {
  Trophy,
  Swords,
  ArrowLeft,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  UserPlus,
  LogIn,
  Wallet,
  Smartphone,
  MessageCircle,
  RotateCw,
  Home,
  AlertCircle,
  Check,
  X,
  Zap,
} from "lucide-react";

export default function RegisterTournamentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourneyId = searchParams.get("id");
  const { user, profile, displayName, loading: authLoading } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [gamerTag, setGamerTag] = useState("");
  const [friendId, setFriendId] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa_stk" | "wallet">("mpesa_stk");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // STK Push Waiting & Polling State
  const [isStkWaiting, setIsStkWaiting] = useState(false);
  const [stkCheckoutId, setStkCheckoutId] = useState<string | null>(null);
  const [stkMessage, setStkMessage] = useState("Waiting for M-Pesa PIN confirmation...");
  const [checkingNow, setCheckingNow] = useState(false);

  // Final Success State
  const [regSuccess, setRegSuccess] = useState(false);
  const [regResult, setRegResult] = useState<{
    remaining_balance?: number;
    paid_via_wallet?: boolean;
    paid_via_mpesa?: boolean;
    receipt_number?: string;
  } | null>(null);

  // Prefill user details
  useEffect(() => {
    if (profile) {
      if (!gamerTag && profile.username) {
        setGamerTag(profile.username);
      }
      if (!phone && profile.phone_number) {
        setPhone(profile.phone_number);
      }
    }
  }, [profile, gamerTag, phone]);

  // Fetch tournaments
  useEffect(() => {
    async function loadTournaments() {
      try {
        const res = await fetch("/api/tournaments");
        const data = await res.json();
        if (data.tournaments && data.tournaments.length > 0) {
          setTournaments(data.tournaments);
          if (tourneyId) {
            const found = data.tournaments.find((t: Tournament) => t.id === tourneyId);
            if (found) {
              setSelectedTourney(found);
            } else {
              setSelectedTourney(data.tournaments[0]);
            }
          } else {
            setSelectedTourney(data.tournaments[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load tournaments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTournaments();
  }, [tourneyId]);

  // Check if current user already has confirmed payment or registered slot
  useEffect(() => {
    if (!selectedTourney || !user) return;

    // Check participants in tournament data
    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-9) : "";
    const existing = (selectedTourney.participants || []).find(
      (p) =>
        p.user_id === user.id ||
        (cleanPhone && p.phone_number && p.phone_number.includes(cleanPhone))
    );

    if (existing) {
      setRegResult({
        paid_via_mpesa: existing.payment_method === "mpesa_stk",
        paid_via_wallet: existing.payment_method === "wallet",
        receipt_number: existing.payment_status === "paid" ? "CONFIRMED" : undefined,
      });
      setRegSuccess(true);
      return;
    }

    // Actively query backend to recover any recently settled payment (e.g. UJL9JAS7T5)
    const targetTourneyId = selectedTourney.id;
    const targetUserId = user.id;

    async function recoverRecentPayment() {
      try {
        const queryPhone = phone ? normalizePhoneNumber(phone).international : "";
        const res = await fetch(
          `/api/tournaments/payment-status?tournamentId=${encodeURIComponent(targetTourneyId)}&userId=${encodeURIComponent(targetUserId)}&phone=${encodeURIComponent(queryPhone)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === "completed") {
            setRegResult({
              paid_via_mpesa: true,
              receipt_number: data.receiptNumber || "CONFIRMED",
            });
            setRegSuccess(true);
          }
        }
      } catch (e) {
        // silent recovery fail
      }
    }

    recoverRecentPayment();
  }, [selectedTourney, user, phone]);

  // Default payment method selection
  useEffect(() => {
    if (selectedTourney) {
      const balance = profile?.available_balance || 0;
      const fee = selectedTourney.entry_fee_kes || 0;
      if (fee > 0 && balance >= fee) {
        setPaymentMethod("wallet");
      } else {
        setPaymentMethod("mpesa_stk");
      }
    }
  }, [selectedTourney, profile]);

  // Fast Polling for STK Push verification (every 1.8 seconds)
  useEffect(() => {
    if (!isStkWaiting || !stkCheckoutId) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/tournaments/payment-status?checkoutRequestId=${encodeURIComponent(stkCheckoutId)}`
        );
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted) return;

        if (data.status === "completed") {
          clearInterval(pollInterval);
          setIsStkWaiting(false);
          setRegResult({
            paid_via_mpesa: true,
            receipt_number: data.receiptNumber || "CONFIRMED",
          });
          setRegSuccess(true);
        } else if (data.status === "pending") {
          setStkMessage("STK prompt delivered. Waiting for PIN confirmation...");
        } else if (data.status === "failed") {
          // Only abort if user cancelled explicitly
          const desc = String(data.resultDesc || "").toLowerCase();
          if (desc.includes("cancelled") || desc.includes("cancel")) {
            clearInterval(pollInterval);
            setIsStkWaiting(false);
            setError(data.resultDesc || "M-Pesa payment was cancelled by user.");
          }
        }
      } catch (err) {
        console.warn("Poll status check error:", err);
      }
    }, 1800);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isStkWaiting, stkCheckoutId]);

  // On-demand manual instant check button
  const handleCheckPaymentNow = async () => {
    if (!stkCheckoutId) return;
    setCheckingNow(true);

    try {
      const res = await fetch(
        `/api/tournaments/payment-status?checkoutRequestId=${encodeURIComponent(stkCheckoutId)}&forceCheck=true`
      );
      const data = await res.json();

      if (data.status === "completed") {
        setIsStkWaiting(false);
        setRegResult({
          paid_via_mpesa: true,
          receipt_number: data.receiptNumber || "CONFIRMED",
        });
        setRegSuccess(true);
      } else if (data.status === "pending") {
        setStkMessage("Payment is processing on Safaricom Till 1572931. Waiting for Safaricom confirmation...");
      } else if (data.status === "failed") {
        setIsStkWaiting(false);
        setError(data.resultDesc || "Transaction was not completed. Please try again.");
      }
    } catch (err: any) {
      console.warn("Manual check error:", err);
    } finally {
      setCheckingNow(false);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney) return;
    setError("");

    if (!user) {
      setError("Please sign in or register to enter this tournament.");
      return;
    }

    if (!gamerTag.trim()) {
      setError("Please enter your in-game Gamer Tag.");
      return;
    }

    if (!friendId.trim()) {
      setError("Please enter your eFootball Friend ID.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your Safaricom phone number for M-Pesa payments and payouts.");
      return;
    }

    const isPaid = (selectedTourney.entry_fee_kes || 0) > 0;

    // 1. FREE TOURNAMENT FLOW
    if (!isPaid) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/tournaments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            tournament_id: selectedTourney.id,
            gamer_tag: gamerTag.trim(),
            friend_id: friendId.trim(),
            phone_number: normalizePhoneNumber(phone).international,
            user_id: user.id,
            payment_method: "free",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to register for tournament.");
        }

        setRegResult({ paid_via_wallet: false });
        setRegSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to complete free registration.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // 2. PAID TOURNAMENT VIA ACCOUNT WALLET BALANCE
    if (paymentMethod === "wallet") {
      setSubmitting(true);
      try {
        const res = await fetch("/api/tournaments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            tournament_id: selectedTourney.id,
            gamer_tag: gamerTag.trim(),
            friend_id: friendId.trim(),
            phone_number: normalizePhoneNumber(phone).international,
            user_id: user.id,
            payment_method: "wallet",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to process wallet payment.");
        }

        setRegResult({
          paid_via_wallet: true,
          remaining_balance: data.remainingBalance,
        });
        setRegSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to complete wallet payment.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // 3. PAID TOURNAMENT VIA M-PESA STK PUSH (UPFRONT CONFIRMATION)
    if (paymentMethod === "mpesa_stk") {
      setSubmitting(true);
      try {
        const res = await fetch("/api/tournaments/stkpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournament_id: selectedTourney.id,
            gamer_tag: gamerTag.trim(),
            friend_id: friendId.trim(),
            phone_number: phone.trim(),
            user_id: user.id,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to initiate M-Pesa STK Push.");
        }

        setStkCheckoutId(data.checkoutRequestId);
        setStkMessage("M-Pesa prompt sent! Check your phone now.");
        setIsStkWaiting(true);
      } catch (err: any) {
        setError(err.message || "Failed to send M-Pesa prompt. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center text-slate-400 gap-3">
        <RotateCw className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-sm">Loading tournament registration...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 pb-36">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-pitch-border bg-[#070D18]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-slate-800/60"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Tournaments Arena</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-xl border border-pitch-border bg-pitch-card hover:border-emerald-500/40"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-950/60 via-pitch-card to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  Player Registration
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  12-Minute Standard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Lock In Your Match Slot
              </h1>
              <p className="text-xs text-slate-300 max-w-xl">
                Pay your entry fee securely via M-Pesa STK Push or Account Balance. Upfront confirmation guarantees verified brackets.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/tournaments/host"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pitch-card border border-pitch-border hover:border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-md"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Host Your Own</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Guest Warning */}
        {!authLoading && !user && (
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Registration Requires Community Membership
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sign in or create an account to verify match bracket standings.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Link
                href="/register?redirect=/tournaments/register"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
              <Link
                href="/login?redirect=/tournaments/register"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-pitch-card hover:bg-slate-800 text-slate-200 border border-pitch-border text-xs font-bold"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* VIEW 1: ACTIVE STK PUSH WAITING & VERIFICATION STATE */}
        {isStkWaiting && selectedTourney ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-pitch-surface border border-amber-500/50 shadow-2xl space-y-6 text-center animate-in fade-in">
            {/* Animated Pulsing Phone Icon */}
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-500/25 animate-ping" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 z-10">
                <Smartphone className="w-7 h-7 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>STK Push Active on Your Phone</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                Enter Your M-Pesa PIN
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                A prompt for <strong className="text-amber-300 font-mono">KES {selectedTourney.entry_fee_kes.toLocaleString()}</strong> has been dispatched to{" "}
                <strong>{phone}</strong> for Safaricom Till{" "}
                <strong className="text-amber-300 font-mono">1572931</strong> (EFootballMarket).
              </p>
            </div>

            {/* Instant Detection Status Card with Clickable Check Button */}
            <div className="p-4 rounded-2xl bg-pitch-card border border-pitch-border space-y-3 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-amber-400 font-medium">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span className="text-[11px] text-slate-300">{stkMessage}</span>
                </span>
              </div>

              {/* Instant "I Have Paid" Button */}
              <Button
                type="button"
                variant="gold"
                size="md"
                className="w-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/15"
                isLoading={checkingNow}
                onClick={handleCheckPaymentNow}
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>I Have Entered PIN — Confirm Payment Now</span>
              </Button>
            </div>

            {/* Cancel and return button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsStkWaiting(false);
                  setError("");
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Modify registration details
              </button>
            </div>
          </div>
        ) : regSuccess && selectedTourney ? (
          /* VIEW 2: CONFIRMED REGISTRATION SUCCESS VIEW */
          <div className="p-8 sm:p-10 rounded-3xl bg-pitch-surface border border-emerald-500/50 shadow-2xl space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                <span>Payment Confirmed & Slot Locked In</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                Registration Confirmed!
              </h2>
              <p className="text-xs text-slate-300">
                You are officially registered for <strong>{selectedTourney.title}</strong>. Your match room slot is guaranteed!
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-pitch-card border border-emerald-500/30 text-xs text-slate-200 space-y-2 max-w-md mx-auto text-left shadow-inner">
              <div className="flex items-center justify-between border-b border-pitch-border/80 pb-2">
                <span className="text-slate-400">Gamer Tag:</span>
                <strong className="text-white font-mono">{gamerTag || profile?.username}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-pitch-border/80 pb-2">
                <span className="text-slate-400">eFootball Friend ID:</span>
                <strong className="text-white font-mono">{friendId}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-pitch-border/80 pb-2">
                <span className="text-slate-400">Entry Fee:</span>
                <strong className="text-emerald-400 font-mono">
                  {selectedTourney.entry_fee_kes === 0 ? "FREE" : `KES ${selectedTourney.entry_fee_kes.toLocaleString()}`}
                </strong>
              </div>

              {regResult?.receipt_number && (
                <div className="flex items-center justify-between border-b border-pitch-border/80 pb-2">
                  <span className="text-slate-400">M-Pesa Receipt:</span>
                  <strong className="text-emerald-300 font-mono font-bold">{regResult.receipt_number}</strong>
                </div>
              )}

              {regResult?.paid_via_wallet && (
                <div className="flex items-center justify-between border-b border-pitch-border/80 pb-2">
                  <span className="text-slate-400">Paid Via:</span>
                  <strong className="text-emerald-300 font-semibold">Account Wallet Balance</strong>
                </div>
              )}

              {regResult?.remaining_balance !== undefined && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Remaining Balance:</span>
                  <strong className="text-slate-200 font-mono">
                    KES {regResult.remaining_balance.toLocaleString()}
                  </strong>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <a
                href={`https://wa.me/254794400365?text=${encodeURIComponent(
                  `Hello Brian Okibo, I registered and confirmed payment for "${selectedTourney.title}"!\nGamer Tag: ${gamerTag || profile?.username}\nFriend ID: ${friendId}\nPhone: ${phone}\nPayment: ${
                    regResult?.receipt_number
                      ? `M-Pesa Receipt: ${regResult.receipt_number}`
                      : regResult?.paid_via_wallet
                      ? `Paid via Account Balance (KES ${selectedTourney.entry_fee_kes})`
                      : "Free Entry"
                  }\nReady for match bracket room!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Join Tournament WhatsApp Room</span>
              </a>

              <Link
                href="/tournaments"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-pitch-card hover:bg-slate-800 border border-pitch-border text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                <span>Back to Tournaments</span>
              </Link>
            </div>
          </div>
        ) : (
          /* VIEW 3: REGISTRATION FORM SCREEN */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Tournament Details Overview Card */}
            <div className="md:col-span-1 space-y-4">
              <div className="p-5 rounded-3xl bg-pitch-surface border border-pitch-border space-y-4 shadow-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedTourney?.tournament_type === "1v1" ? (
                    <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <Swords className="w-3 h-3 text-amber-400" />
                      <span>1v1 WAGER DUEL</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-indigo-400" />
                      <span>{selectedTourney?.max_players || 8}-PLAYER CUP</span>
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {selectedTourney?.entry_fee_kes === 0 ? "FREE" : `KES ${selectedTourney?.entry_fee_kes}`}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {selectedTourney?.title}
                  </h3>
                  {selectedTourney?.subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{selectedTourney.subtitle}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-pitch-card border border-pitch-border space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Prize Pool:</span>
                    <strong className="text-emerald-400 font-mono font-bold">
                      {formatCurrency(selectedTourney?.prize_pool_kes || 0, "KES")}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] border-t border-pitch-border/60 pt-1.5">
                    <span>Format:</span>
                    <strong className="text-slate-200">12-Min Matches</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Slots:</span>
                    <strong className="text-slate-200">
                      {selectedTourney?.registered_count || 0} / {selectedTourney?.max_players || 8}
                    </strong>
                  </div>
                </div>

                {tournaments.length > 1 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Switch Tournament:
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-xl bg-pitch-card border border-pitch-border text-white text-xs focus:outline-none focus:border-amber-500"
                      value={selectedTourney?.id}
                      onChange={(e) => {
                        const t = tournaments.find((item) => item.id === e.target.value);
                        if (t) setSelectedTourney(t);
                      }}
                    >
                      {tournaments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.entry_fee_kes === 0 ? "Free" : `KES ${t.entry_fee_kes}`})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="md:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 rounded-3xl bg-pitch-surface border border-pitch-border space-y-5 shadow-2xl"
              >
                <div className="border-b border-pitch-border pb-4">
                  <h3 className="text-lg font-bold text-white font-display">
                    Player Registration Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fill in your in-game details. Upfront payment confirmation is required for paid entry.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  label="eFootball Gamer Tag / In-game Name"
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
                  label="Safaricom Phone Number (For M-Pesa STK Push & Payouts)"
                  placeholder="e.g. 0712345678 or 254712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                {/* Payment Method Selector if Entry Fee > 0 */}
                {selectedTourney && selectedTourney.entry_fee_kes > 0 ? (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">
                        Choose Upfront Payment Method
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Entry Fee: KES {selectedTourney.entry_fee_kes.toLocaleString()}
                      </span>
                    </div>

                    {/* Option 1: Safaricom M-Pesa STK Push (Recommended) */}
                    <div
                      onClick={() => setPaymentMethod("mpesa_stk")}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === "mpesa_stk"
                          ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/40 shadow-md"
                          : "bg-pitch-card border-pitch-border hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "mpesa_stk"
                              ? "border-amber-400 bg-amber-500"
                              : "border-slate-600"
                          }`}
                        >
                          {paymentMethod === "mpesa_stk" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Smartphone className="w-4 h-4 text-amber-400" />
                              <span>M-Pesa STK Push Prompt (Till 1572931)</span>
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Instant PIN Prompt
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            A prompt will pop up on your phone ({phone || "Safaricom handset"}). Enter your PIN to pay KES {selectedTourney.entry_fee_kes.toLocaleString()}. Your slot locks in automatically upon backend confirmation.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Account Wallet Balance */}
                    {(() => {
                      const balance = profile?.available_balance || 0;
                      const hasEnough = balance >= selectedTourney.entry_fee_kes;

                      return (
                        <div
                          onClick={() => {
                            if (hasEnough) setPaymentMethod("wallet");
                          }}
                          className={`p-4 rounded-2xl border transition-all ${
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
                                  <Wallet className="w-4 h-4 text-emerald-400" />
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
                                  ? `Instant deduction of KES ${selectedTourney.entry_fee_kes.toLocaleString()} from your earnings balance. Zero SMS waiting.`
                                  : `Insufficient wallet balance (KES ${balance.toLocaleString()} available / KES ${selectedTourney.entry_fee_kes.toLocaleString()} required). Please choose M-Pesa STK Push above.`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                    <span>Entry Fee:</span>
                    <strong className="font-bold">FREE ENTRY (Community Cup)</strong>
                  </div>
                )}

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full font-bold cursor-pointer shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2"
                    isLoading={submitting}
                  >
                    {selectedTourney?.entry_fee_kes === 0 ? (
                      <span>Confirm Free Registration</span>
                    ) : paymentMethod === "wallet" ? (
                      <span>Pay KES {selectedTourney?.entry_fee_kes} from Balance & Join</span>
                    ) : (
                      <span>Pay KES {selectedTourney?.entry_fee_kes} via M-Pesa STK Push</span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
