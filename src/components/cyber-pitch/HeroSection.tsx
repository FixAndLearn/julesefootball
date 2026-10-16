"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import { SupportedLanguage, PlayerCardData } from "./types";
import { InteractivePlayerCard } from "./InteractivePlayerCard";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Zap,
  Globe2,
  ChevronDown,
  Layers,
  Flame,
} from "lucide-react";

interface HeroSectionProps {
  onScrollToWizard: () => void;
  onScrollToGallery: () => void;
}

const SAMPLE_HERO_CARD: PlayerCardData = {
  id: "hero-showcase-card",
  gamerHandle: "Brinaki Gamer",
  teamName: "MG FC",
  position: "CF",
  ovr: 104,
  cardTheme: "cyber_neon",
  cardFinish: "holographic",
  attributes: {
    pace: 99,
    shooting: 101,
    passing: 94,
    dribbling: 98,
    defending: 50,
    physical: 92,
  },
  formation: "4-2-1-3",
  playstyle: "Quick Counter",
  priceKes: 3500,
  category: "trending",
};

export function HeroSection({ onScrollToWizard, onScrollToGallery }: HeroSectionProps) {
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languageLabels: Record<SupportedLanguage, { label: string; flag: string }> = {
    en: { label: "English", flag: "EN" },
    sw: { label: "Kiswahili", flag: "KE" },
    kam: { label: "Kikamba", flag: "KM" },
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#050811] via-[#090D1A] to-[#070B14] text-white pt-6 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
      {/* Background Cyber Mesh & Electric Glow Highlights */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-[#FBBF24]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Floating Glass Navigation Bar with Language Toggle */}
      <div className="relative z-30 max-w-7xl mx-auto w-full flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00F0FF] to-blue-600 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider uppercase font-display bg-gradient-to-r from-white via-slate-100 to-[#00F0FF] bg-clip-text text-transparent">
              eFootballMarket
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-[#00F0FF] block -mt-1 font-bold">
              KENYA CYBER-ATHLETIC
            </span>
          </div>
        </div>

        {/* Language Switcher Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 min-h-[48px] rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-[#00F0FF]/60 backdrop-blur-xl shadow-lg transition-all text-xs font-bold text-slate-200"
            aria-label="Select Language"
          >
            <Globe2 className="w-4 h-4 text-[#00F0FF]" />
            <span className="uppercase tracking-wider">{languageLabels[language].label}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#090D1A]/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              {(["en", "sw", "kam"] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLanguage(lang);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    language === lang
                      ? "bg-[#00F0FF]/15 text-[#00F0FF] font-bold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <span>{languageLabels[lang].label}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    [{languageLabels[lang].flag}]
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Hero Showcase Grid */}
      <div className="relative z-20 max-w-7xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Copy & Interactive CTAs */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          {/* Cyber Tag Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-mono font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span>{t.heroTagline}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black font-display tracking-tight leading-[1.08] text-white">
            Dominate the Pitch. <br />
            <span className="bg-gradient-to-r from-[#00F0FF] via-cyan-200 to-[#FBBF24] bg-clip-text text-transparent">
              Claim Your Legacy.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
            {t.heroSubheadline}
          </p>

          {/* Dual Action Buttons (Min height 48px for touch friendliness) */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              type="button"
              onClick={onScrollToWizard}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.heroCtaCraft}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={onScrollToGallery}
              className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-white font-bold text-sm tracking-wide backdrop-blur-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-[#FBBF24]" />
              <span>{t.heroCtaExplore}</span>
            </button>
          </div>

          {/* Micro Stat Badges */}
          <div className="pt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 border-t border-slate-800/80">
            <div>
              <span className="block text-xl sm:text-2xl font-black text-white font-display">
                15,400+
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {t.statCardsMinted}
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#00F0FF] font-display">
                128
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {t.statTournaments}
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#FBBF24] font-display">
                4.96 ★
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {t.statRating}
              </span>
            </div>
          </div>
        </div>

        {/* Right Hero Visual Spotlight with 3D Mouse & Touch Reactivity */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative">
            {/* Ambient Pulse Glow */}
            <div className="absolute inset-0 bg-[#00F0FF]/25 blur-3xl rounded-full scale-110 pointer-events-none" />

            {/* Interactive 3D Card Showcase */}
            <InteractivePlayerCard
              card={SAMPLE_HERO_CARD}
              size="hero"
              enableTilt={true}
              className="z-10"
            />

            {/* Touch/Mouse Guidance Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono text-slate-300 tracking-wider backdrop-blur-xl shadow-xl flex items-center gap-2 whitespace-nowrap z-20 pointer-events-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
              <span>3D GYRO-TILT ACTIVE • MOVE CURSOR / FINGER</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
