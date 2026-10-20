"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/database";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import {
  getFridayDropCountdown,
  FridayDropCountdown,
  FRIDAY_DROP_START_HOUR_EAT,
  FRIDAY_DROP_END_HOUR_EAT,
} from "@/lib/utils/flashSale";
import {
  Flame,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock,
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

  // Filter top curated/featured squads for the flash sale drops during active window
  const featuredDrops = listings.filter((item) => item.is_featured || (item as any).is_flash_sale);
  const dropItems = (featuredDrops.length > 0 ? featuredDrops : listings).slice(0, 3);

  return (
    <section id="friday-drops" className="py-14 md:py-20 bg-[#0A0F1D] border-b border-slate-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Module Header Container with clean gold/slate styling */}
        <div className="rounded-2xl p-6 sm:p-8 md:p-10 bg-[#0F172A] border border-slate-800 shadow-xl relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            {/* Title & Badge */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight">
                Curated Squad Drops
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                {isDropActive
                  ? "Hand-curated, verified high-OVR accounts discounted exclusively for 8 hours (2:00 PM – 10:00 PM EAT). Full Safaricom M-Pesa Till 1572931 escrow guarantee applies."
                  : "Exclusive high-OVR accounts drop every Friday for 8 hours only (2:00 PM – 10:00 PM EAT) at locked flash prices. Squads vanish when the countdown hits zero."}
              </p>
            </div>

            {/* Dynamic Countdown Timer */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#090D16] border border-amber-500/40 shadow-inner shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  {isDropActive ? "⚡ FLASH SALE ENDS IN:" : "NEXT DROP UNLOCKS IN:"}
                </span>
                {isDropActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] animate-pulse">
                    LIVE
                  </span>
                )}
              </div>

              {/* Digits Grid */}
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-xl sm:text-2xl font-black text-white">
                    {String(countdown.days).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Days</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-xl sm:text-2xl font-black text-amber-400">
                    {String(countdown.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Hours</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-xl sm:text-2xl font-black text-amber-400">
                    {String(countdown.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Mins</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
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
              /* Outside the 8-Hour Window: Squads Disappear Completely & Show Locked Vault */
              <div className="rounded-2xl bg-[#090D16] border border-amber-500/20 p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                  {/* Vault Lock Icon */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
                    <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                  </div>

                  {/* Heading & Notice */}
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                      Friday Drop Vault is Locked
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Curated high-OVR squad drops unlock exclusively on{" "}
                      <span className="text-amber-300 font-semibold">Fridays from 2:00 PM to 10:00 PM EAT</span>{" "}
                      (strictly 8 hours). Squads vanish the moment the window closes until the following Friday.
                    </p>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-300 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Strict 8-Hour Window (14:00 – 22:00 EAT)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Up to 35% Flash Discounts</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Till 1572931 Escrow Guarantee</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link href="/browse" className="w-full sm:w-auto">
                      <button
                        type="button"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        <span>Explore Active Marketplace</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link href="/seller/create-listing" className="w-full sm:w-auto">
                      <button
                        type="button"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Submit Squad for Next Friday Drop</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : dropItems.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Next Friday Squad Drops Loading</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  New verified squads are being curated for this 8-hour drop window. Verified sellers can submit squads for admin curation now!
                </p>
                <Link
                  href="/seller/create-listing"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                >
                  <span>Submit Squad for Friday Drop &rarr;</span>
                </Link>
              </div>
            ) : (
              /* Live 8-Hour Drop Squad Cards */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dropItems.map((item) => {
                  const originalPrice = Math.round(item.price * 1.35); // 26% discount representation
                  const discountPercent = Math.round(((originalPrice - item.price) / originalPrice) * 100);
                  const primaryImage =
                    item.images?.find((img) => img.is_primary)?.image_url ||
                    item.images?.[0]?.image_url;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-[#090D16] border border-amber-500/40 hover:border-amber-400 p-4 flex flex-col justify-between shadow-xl relative group transition-all"
                    >
                      {/* Top ribbon: Discount badge & Admin Curated Seal */}
                      <div className="flex items-center justify-between gap-2 mb-3 z-10">
                        <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs shadow-md">
                          -{discountPercent}% OFF
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Admin Curated</span>
                        </span>
                      </div>

                      {/* Image / Thumbnail */}
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 mb-3">
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
                            <span className="text-[10px] uppercase font-bold">Drop Preview</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent pointer-events-none" />

                        {/* OVR Pill */}
                        <div className="absolute bottom-2 left-2 z-10">
                          <span className="px-2.5 py-0.5 rounded-lg bg-black/90 border border-amber-400/80 text-amber-300 font-mono font-black text-xs shadow-md">
                            ⚡ {item.overall_team_strength} OVR
                          </span>
                        </div>
                      </div>

                      {/* Title & Key Highlights */}
                      <div className="space-y-2 mb-4">
                        <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {getPlatformLabel(item.platform)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 font-bold">
                            ★ {item.epic_players_count} Epics
                          </span>
                        </div>

                        {/* Pricing: Crossed out original + Flash price */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[11px] text-slate-500 line-through">
                              {formatCurrency(originalPrice, item.currency)}
                            </span>
                            <span className="text-lg font-black text-emerald-400 font-mono">
                              {formatCurrency(item.price, item.currency)}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">
                            Till 1572931
                          </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link href={`/listings/${item.id}`} className="w-full">
                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <Flame className="w-3.5 h-3.5 shrink-0" />
                          <span>Claim Flash Drop</span>
                        </button>
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
