"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/database";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import { Flame, Clock, ShieldCheck, Sparkles, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface FridayDropsProps {
  listings: Listing[];
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isActive: boolean;
}

export function FridayDropsSection({ listings }: FridayDropsProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isActive: false,
  });

  // Calculate countdown to next Friday (or Friday remaining time) in EAT (UTC+3)
  useEffect(() => {
    function calculateTime() {
      const now = new Date();
      // Convert current time to UTC+3 (East Africa Time)
      const eatOffsetMs = 3 * 60 * 60 * 1000;
      const eatNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + eatOffsetMs);

      const dayOfWeek = eatNow.getDay(); // 0 is Sunday, 5 is Friday
      const currentHour = eatNow.getHours();
      const currentMin = eatNow.getMinutes();
      const currentSec = eatNow.getSeconds();

      const isFriday = dayOfWeek === 5;

      if (isFriday) {
        // Flash sale is LIVE! Calculate time until Friday 23:59:59 EAT
        const endOfDay = new Date(eatNow);
        endOfDay.setHours(23, 5, 59, 999);
        const diffMs = Math.max(0, endOfDay.getTime() - eatNow.getTime());

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setTimeLeft({ days: 0, hours, minutes, seconds, isActive: true });
      } else {
        // Calculate days until next Friday 00:00:00 EAT
        let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
        if (daysUntilFriday === 0) daysUntilFriday = 7;

        const nextFriday = new Date(eatNow);
        nextFriday.setDate(eatNow.getDate() + daysUntilFriday);
        nextFriday.setHours(0, 0, 0, 0);

        const diffMs = Math.max(0, nextFriday.getTime() - eatNow.getTime());

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isActive: false });
      }
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter or take top squads for the flash sale drops
  const dropItems = listings.slice(0, 3);

  return (
    <section id="friday-drops" className="py-14 md:py-20 bg-[#0A0F1D] border-b border-slate-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Module Header Container with neon-gold/emerald border */}
        <div className="rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#111827] border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            {/* Title & Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wide">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <span>FRIDAY DROPS FLASH SALE (UP TO 50% OFF)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display tracking-tight">
                Elite Squad Drops | Every Friday EAT
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Hand-curated, verified high-OVR accounts discounted exclusively for 24 hours. Full Safaricom M-Pesa Till 1572931 escrow guarantee applies.
              </p>
            </div>

            {/* Dynamic Countdown Timer */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#090D16] border border-amber-500/40 shadow-inner shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  {timeLeft.isActive ? "⚡ FLASH SALE ENDS IN:" : "NEXT DROP UNLOCKS IN:"}
                </span>
                {timeLeft.isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] animate-pulse">
                    LIVE
                  </span>
                )}
              </div>

              {/* Digits Grid */}
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-xl sm:text-2xl font-black text-white">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Days</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-xl sm:text-2xl font-black text-amber-400">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Hours</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-xl sm:text-2xl font-black text-amber-400">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Mins</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="block text-xl sm:text-2xl font-black text-emerald-400">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Secs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Cards Showcase */}
          <div className="pt-8">
            {dropItems.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Next Friday Squad Drops Loading</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  New verified squads will be dropped at midnight EAT this Friday. Verified sellers can submit squads for admin curation today!
                </p>
                <Link
                  href="/seller/create-listing"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                >
                  <span>Submit Squad for Friday Drop &rarr;</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dropItems.map((item, idx) => {
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
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <Flame className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                          <span className="truncate">Claim Flash Drop (M-Pesa Escrow)</span>
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
