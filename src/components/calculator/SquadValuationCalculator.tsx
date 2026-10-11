"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, Sparkles, Trophy, Zap, Coins, ShieldCheck, ArrowRight, TrendingUp, Layers } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ValuationBreakdown {
  minPrice: number;
  maxPrice: number;
  recommendedPrice: number;
  ovrContribution: number;
  epicsContribution: number;
  currencyContribution: number;
  divisionContribution: number;
  liquidity: "Ultra Fast (<2h)" | "Fast (<6h)" | "Normal (1-2 days)";
}

export function SquadValuationCalculator() {
  const [ovr, setOvr] = useState<number>(3110);
  const [epicCount, setEpicCount] = useState<number>(5);
  const [division, setDivision] = useState<number>(1);
  const [coins, setCoins] = useState<number>(1200);
  const [gp, setGp] = useState<number>(1500000);
  const [platform, setPlatform] = useState<"android" | "ios" | "pc_steam">("android");

  // Real Market Pricing Calculation Engine (calibrated for Kenyan M-Pesa gaming market)
  const valuation: ValuationBreakdown = useMemo(() => {
    // 1. OVR baseline value
    let baseOvr = 0;
    if (ovr < 2900) baseOvr = 400;
    else if (ovr < 3000) baseOvr = 800 + (ovr - 2900) * 8;
    else if (ovr < 3080) baseOvr = 1600 + (ovr - 3000) * 15;
    else if (ovr < 3140) baseOvr = 2800 + (ovr - 3080) * 35;
    else baseOvr = 4900 + (ovr - 3140) * 65;

    // 2. Epics & Boosters value (each high-tier Epic adds substantial value)
    const epicsVal = epicCount * 550;

    // 3. Currency balance value (100 coins ~ KES 110, GP adds minor value)
    const coinsVal = Math.floor((coins / 100) * 110);
    const gpVal = Math.min(Math.floor((gp / 500000) * 150), 1200);
    const currencyVal = coinsVal + gpVal;

    // 4. Division prestige bonus
    let divBonus = 0;
    if (division === 1) divBonus = 700;
    else if (division === 2) divBonus = 350;
    else if (division === 3) divBonus = 150;

    // 5. Platform modifier
    const platformMultiplier = platform === "ios" ? 1.05 : platform === "pc_steam" ? 0.95 : 1.0;

    const rawTotal = (baseOvr + epicsVal + currencyVal + divBonus) * platformMultiplier;
    const roundedRecommended = Math.round(rawTotal / 100) * 100;
    const minPrice = Math.round((roundedRecommended * 0.88) / 50) * 50;
    const maxPrice = Math.round((roundedRecommended * 1.15) / 50) * 50;

    let liquidity: "Ultra Fast (<2h)" | "Fast (<6h)" | "Normal (1-2 days)" = "Fast (<6h)";
    if (ovr >= 3120 || epicCount >= 6) liquidity = "Ultra Fast (<2h)";
    else if (ovr < 3000) liquidity = "Normal (1-2 days)";

    return {
      minPrice,
      maxPrice,
      recommendedPrice: roundedRecommended,
      ovrContribution: Math.round(baseOvr),
      epicsContribution: Math.round(epicsVal),
      currencyContribution: Math.round(currencyVal),
      divisionContribution: Math.round(divBonus),
      liquidity,
    };
  }, [ovr, epicCount, division, coins, gp, platform]);

  return (
    <div className="w-full rounded-3xl bg-pitch-surface/90 border border-pitch-border shadow-2xl overflow-hidden backdrop-blur-xl relative">
      {/* Background Atmosphere Sheen */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 border-b border-pitch-border/60 bg-pitch-card/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Real-Time Market Valuation Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            How Much is Your eFootball Account Worth?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Calculate fair market value based on Team OVR, Epic Boosters, Division rank, and coin balance in Kenya Shillings (KES).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>M-Pesa Escrow Calibrated</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Valuation Card on Right */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Platform
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(["android", "ios", "pc_steam"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    platform === p
                      ? "bg-brand-600 text-white border-brand-400 shadow-lg shadow-brand-600/30"
                      : "bg-pitch-card text-slate-300 border-pitch-border hover:border-slate-500 hover:text-white"
                  }`}
                >
                  {p === "android" ? "📱 Android" : p === "ios" ? "🍏 iOS" : "💻 PC / Steam"}
                </button>
              ))}
            </div>
          </div>

          {/* OVR Team Strength Slider */}
          <div className="p-4 rounded-2xl bg-pitch-card/60 border border-pitch-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Team Collective Strength (OVR)
              </span>
              <span className="text-sm font-black text-amber-300 font-mono px-2 py-0.5 rounded bg-black/60 border border-amber-500/40">
                {ovr} OVR
              </span>
            </div>
            <input
              type="range"
              min="2700"
              max="3220"
              step="5"
              value={ovr}
              onChange={(e) => setOvr(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>2700 Starter</span>
              <span>3050 Meta</span>
              <span>3150+ Top Global Tier</span>
            </div>
          </div>

          {/* Epic Boosters & Big Time Cards Counter */}
          <div className="p-4 rounded-2xl bg-pitch-card/60 border border-pitch-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Epic / Showtime / Big Time Cards
              </span>
              <span className="text-sm font-black text-amber-300 font-mono px-2 py-0.5 rounded bg-black/60 border border-amber-500/40">
                {epicCount} Epics
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={epicCount}
              onChange={(e) => setEpicCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>0 (Standard GP Squad)</span>
              <span>10 (Full Epic XI)</span>
              <span>25+ (Whale Account)</span>
            </div>
          </div>

          {/* Division Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Highest Current Division
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => setDivision(div)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                    division === div
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20"
                      : "bg-pitch-card text-slate-300 border-pitch-border hover:border-slate-500 hover:text-white"
                  }`}
                >
                  Div {div}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Balances (Coins & GP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-pitch-card/60 border border-pitch-border/80">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                eFootball Coins
              </label>
              <input
                type="number"
                min="0"
                max="50000"
                step="100"
                value={coins}
                onChange={(e) => setCoins(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-pitch-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-pitch-card/60 border border-pitch-border/80">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-400" />
                GP Balance
              </label>
              <input
                type="number"
                min="0"
                max="20000000"
                step="100000"
                value={gp}
                onChange={(e) => setGp(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-pitch-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Real-time Valuation Output Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-pitch-card/90 border border-amber-500/60 shadow-2xl relative preserve-3d overflow-hidden">
          {/* Holographic foil gloss */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-brand-500/15 pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Market Value</span>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-bold text-emerald-300">
              <TrendingUp className="w-3 h-3" />
              <span>{valuation.liquidity}</span>
            </div>
          </div>

          {/* Big Price Display */}
          <div className="my-3 text-center sm:text-left">
            <span className="text-4xl sm:text-5xl font-black text-amber-300 font-display tracking-tight drop-shadow-md">
              {formatCurrency(valuation.recommendedPrice)}
            </span>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <span>Fair Range:</span>
              <span className="font-semibold text-slate-200">
                {formatCurrency(valuation.minPrice)} – {formatCurrency(valuation.maxPrice)}
              </span>
            </div>
          </div>

          {/* Value Component Breakdown */}
          <div className="my-6 space-y-2.5 pt-4 border-t border-pitch-border/60 text-xs">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Value Breakdown
            </span>

            <div className="flex justify-between items-center py-1 border-b border-pitch-border/40">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Team OVR ({ovr}) Base
              </span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(valuation.ovrContribution)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-pitch-border/40">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {epicCount} Epic Booster Cards
              </span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(valuation.epicsContribution)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-pitch-border/40">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Coins & GP Balances
              </span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(valuation.currencyContribution)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Division {division} Prestige
              </span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(valuation.divisionContribution)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Link
              href={`/seller/create-listing?strength=${ovr}&epics=${epicCount}&price=${valuation.recommendedPrice}&platform=${platform}`}
            >
              <Button variant="gold" size="md" className="w-full font-bold btn-3d-gold flex items-center justify-center gap-2">
                <span>List Account for {formatCurrency(valuation.recommendedPrice)}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href={`/browse?minStrength=${Math.max(2800, ovr - 50)}&platform=${platform}`}>
              <Button variant="secondary" size="md" className="w-full text-xs font-semibold">
                Browse Similar Accounts on Market
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
