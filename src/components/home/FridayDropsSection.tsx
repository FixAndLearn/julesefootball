"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/database";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import {
  getFridayDropCountdown,
  FridayDropCountdown,
} from "@/lib/utils/flashSale";
import { Button } from "@/components/ui/Button";
import {
  Flame,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock,
  Trophy,
} from "lucide-react";

interface FridayDropsProps {
  listings: Listing[];
}

export function FridayDropsSection({ listings }: FridayDropsProps) {
  const [countdown, setCountdown] = useState<FridayDropCountdown>({
    isActive: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    targetDateUtc: new Date(),
  });
  const [mounted, setMounted] = useState(false);

  // Dynamic countdown to Friday 14:00 EAT (or remaining time until 22:00 EAT during active drop)
  useEffect(() => {
    setMounted(true);
    const updateCountdown = () => {
      setCountdown(getFridayDropCountdown());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDropActive = mounted && countdown.isActive;

  // Filter top curated/featured squads for the drops during active window
  const featuredDrops = listings.filter((item) => item.is_featured || (item as any).is_flash_sale);
  const dropItems = (featuredDrops.length > 0 ? featuredDrops : listings).slice(0, 3);

  return (
    <section id="friday-drops" className="py-12 md:py-16 bg-pitch-dark border-b border-pitch-border relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Module Header Container with uniform pitch design system */}
        <div className="rounded-3xl p-6 sm:p-8 md:p-10 bg-pitch-surface border border-pitch-border shadow-2xl relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-pitch-border">
            {/* Title & Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Weekly Curated Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display tracking-tight">
                Curated Squad Drops
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                {isDropActive
                  ? "Hand-curated, verified high-OVR accounts unlocked exclusively for 8 hours (2:00 PM – 10:00 PM EAT). Full Safaricom M-Pesa Till 1572931 escrow custody applies."
                  : "Exclusive high-OVR accounts unlock every Friday for 8 hours only (2:00 PM – 10:00 PM EAT). Curated by Brian Okibo and secured in Till 1572931 escrow."}
              </p>
            </div>

            {/* Dynamic Countdown Timer */}
            <div className="p-4 sm:p-5 rounded-2xl bg-pitch-card border border-pitch-border shadow-inner shrink-0">
              <div className="flex items-center gap-2 mb-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  {isDropActive ? "⚡ VAULT CLOSES IN:" : "NEXT VAULT UNLOCKS IN:"}
                </span>
                {isDropActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] animate-pulse">
                    LIVE
                  </span>
                )}
              </div>

              {/* Digits Grid */}
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 sm:p-2.5 rounded-xl bg-pitch-surface border border-pitch-border">
                  <span className="block text-xl sm:text-2xl font-black text-white">
                    {String(countdown.days).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Days</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-pitch-surface border border-pitch-border">
                  <span className="block text-xl sm:text-2xl font-black text-amber-400">
                    {String(countdown.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Hours</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-pitch-surface border border-pitch-border">
                  <span className="block text-xl sm:text-2xl font-black text-amber-400">
                    {String(countdown.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Mins</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-pitch-surface border border-pitch-border">
                  <span className="block text-xl sm:text-2xl font-black text-emerald-400">
                    {String(countdown.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Secs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Cards Showcase OR Locked Vault State */}
          <div className="pt-8">
            {!isDropActive ? (
              /* Outside the 8-Hour Window: Vault Locked State - Uniform, Realistic & Clean */
              <div className="rounded-3xl bg-pitch-card border border-amber-500/30 p-6 sm:p-10 md:p-12 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                  {/* Vault Lock Emblem */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
                    <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                  </div>

                  {/* Heading & Notice */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold font-mono uppercase tracking-wider">
                      <span>Time-Locked Weekly Vault</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display">
                      Friday Drop Vault is Locked
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                      Curated high-OVR squad drops unlock exclusively on{" "}
                      <span className="text-amber-300 font-bold">Fridays from 2:00 PM to 10:00 PM EAT</span>{" "}
                      (strictly 8 hours). Squads vanish the moment the window closes until the following Friday.
                    </p>
                  </div>

                  {/* Value Highlights Grid - 100% Realistic Data & Uniform Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 max-w-xl mx-auto text-left pt-2">
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-pitch-surface border border-pitch-border">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block text-xs">Strict 8-Hour Window</span>
                        <span className="text-[11px] text-slate-400">Fridays 14:00 – 22:00 EAT</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-pitch-surface border border-pitch-border">
                      <Trophy className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block text-xs">Hand-Curated 3100+ OVR</span>
                        <span className="text-[11px] text-slate-400">Epic, Big Time & Showtime rosters</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-pitch-surface border border-pitch-border">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block text-xs">Till 1572931 Escrow</span>
                        <span className="text-[11px] text-slate-400">Official Safaricom M-Pesa custody</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-pitch-surface border border-pitch-border">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block text-xs">24h Inspection Period</span>
                        <span className="text-[11px] text-slate-400">Inspect Konami ID before release</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons using Uniform System */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <Link href="/browse" className="w-full sm:w-auto">
                      <Button
                        variant="gold"
                        size="lg"
                        className="w-full sm:w-auto font-bold inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                      >
                        <span>Explore Active Marketplace</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/seller/create-listing" className="w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-auto font-bold inline-flex items-center justify-center gap-2 border-pitch-border"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Submit Squad for Friday Curation</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : dropItems.length === 0 ? (
              <div className="text-center py-12 space-y-4 rounded-3xl bg-pitch-card border border-pitch-border p-8">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-lg font-bold text-white font-display">Next Friday Squad Drops Loading</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  New verified squads are being curated for this 8-hour drop window. Verified sellers with clean Konami accounts can submit rosters for admin curation now!
                </p>
                <div className="pt-2">
                  <Link href="/seller/create-listing">
                    <Button variant="gold" size="md" className="font-bold inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Submit Squad for Friday Curation</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Live 8-Hour Drop Squad Cards - Realistic Data, Zero Fake Discounts */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dropItems.map((item) => {
                  const primaryImage =
                    item.images?.find((img) => img.is_primary)?.image_url ||
                    item.images?.[0]?.image_url;

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl bg-pitch-card border border-amber-500/40 hover:border-amber-400/80 p-4 sm:p-5 flex flex-col justify-between shadow-xl relative group transition-all"
                    >
                      {/* Top ribbon: Status badge & Admin Curated Seal */}
                      <div className="flex items-center justify-between gap-2 mb-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs">
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>Friday Drop</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Admin Curated</span>
                        </span>
                      </div>

                      {/* Image / Thumbnail */}
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 mb-3 border border-pitch-border">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            unoptimized={true}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                            <Zap className="w-8 h-8 text-amber-500 mb-1" />
                            <span className="text-[10px] uppercase font-bold">Curated Squad Preview</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                        {/* OVR Pill */}
                        <div className="absolute bottom-2.5 left-2.5 z-10">
                          <span className="px-2.5 py-1 rounded-xl bg-black/90 border border-amber-400/80 text-amber-300 font-mono font-black text-xs shadow-md">
                            ⚡ {item.overall_team_strength} OVR
                          </span>
                        </div>
                      </div>

                      {/* Title & Key Highlights */}
                      <div className="space-y-2 mb-4">
                        <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors font-display">
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-300">
                          <span className="px-2 py-0.5 rounded-lg bg-pitch-surface border border-pitch-border text-slate-300">
                            {getPlatformLabel(item.platform)}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                            ★ {item.epic_players_count} Epics
                          </span>
                          {item.big_time_players_count > 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold">
                              {item.big_time_players_count} Big Time
                            </span>
                          )}
                        </div>

                        {/* Realistic Price - No fake markups or crossed-out schemas */}
                        <div className="pt-2.5 border-t border-pitch-border flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Direct Price
                            </span>
                            <span className="text-lg font-black text-emerald-400 font-mono">
                              {formatCurrency(item.price, item.currency)}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 font-semibold px-2 py-1 rounded-lg bg-pitch-surface border border-pitch-border shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Till 1572931</span>
                          </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link href={`/listings/${item.id}`} className="w-full">
                        <Button
                          variant="primary"
                          size="md"
                          className="w-full font-bold inline-flex items-center justify-center gap-1.5"
                        >
                          <Flame className="w-4 h-4 shrink-0" />
                          <span>Claim Squad in Escrow</span>
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}