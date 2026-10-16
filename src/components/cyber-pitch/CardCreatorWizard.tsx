"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import {
  PlayerCardData,
  CardPosition,
  CardTheme,
  CardFinish,
  TacticalFormation,
  Playstyle,
} from "./types";
import { InteractivePlayerCard } from "./InteractivePlayerCard";
import { PitchFormationVisualizer } from "./PitchFormationVisualizer";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Shield,
  Layers,
  Flame,
  Crown,
  ChevronRight,
  Eye,
  Sliders,
  DollarSign,
  Lock,
} from "lucide-react";

interface CardCreatorWizardProps {
  onCardMinted?: (card: PlayerCardData) => void;
}

const POSITIONS: CardPosition[] = [
  "CF",
  "SS",
  "RWF",
  "LWF",
  "AMF",
  "CMF",
  "DMF",
  "CB",
  "LB",
  "RB",
  "GK",
];

const THEMES: { id: CardTheme; name: string; color: string; desc: string }[] = [
  { id: "cyber_neon", name: "Cyber Neon", color: "#00F0FF", desc: "Electric cyan with dark energy field" },
  { id: "void_onyx", name: "Void Onyx", color: "#64748B", desc: "Stealth carbon weave with slate trim" },
  { id: "golden_legend", name: "Golden Legend", color: "#FBBF24", desc: "Molten 24K gold elite champion" },
  { id: "electric_pitch", name: "Electric Pitch", color: "#22C55E", desc: "Luminescent stadium turf grid" },
  { id: "crimson_velocity", name: "Crimson Velocity", color: "#F43F5E", desc: "High-octane striker ember" },
];

const FINISHES: { id: CardFinish; name: string; badge: string }[] = [
  { id: "holographic", name: "Holographic Foil", badge: "Rainbow Sheen" },
  { id: "carbon", name: "Carbon Weave", badge: "Matte Armor" },
  { id: "prismatic", name: "Prismatic Shimmer", badge: "Multi-Angle" },
  { id: "gold_foil", name: "Brushed Gold", badge: "Prestige Tier" },
];

const FORMATIONS: { id: TacticalFormation; name: string; style: Playstyle }[] = [
  { id: "4-2-1-3", name: "4-2-1-3 (Quick Counter Meta)", style: "Quick Counter" },
  { id: "3-2-2-3", name: "3-2-2-3 (Possession Overload)", style: "Possession Game" },
  { id: "4-1-2-3", name: "4-1-2-3 (Out Wide Blitz)", style: "Out Wide" },
  { id: "5-2-1-2", name: "5-2-1-2 (Fortress Defense)", style: "Long Ball Counter" },
  { id: "4-2-2-2", name: "4-2-2-2 (Dual Shadow Box)", style: "Quick Counter" },
  { id: "4-3-1-2", name: "4-3-1-2 (Narrow Diamond)", style: "Possession Game" },
];

export function CardCreatorWizard({ onCardMinted }: CardCreatorWizardProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [isMintSuccessOpen, setIsMintSuccessOpen] = useState(false);

  // Live state of the card being sculpted
  const [cardData, setCardData] = useState<PlayerCardData>({
    id: "custom-minted-card",
    gamerHandle: "Brinaki Gamer",
    teamName: "MG FC",
    position: "CF",
    ovr: 102,
    cardTheme: "cyber_neon",
    cardFinish: "holographic",
    attributes: {
      pace: 99,
      shooting: 98,
      passing: 92,
      dribbling: 96,
      defending: 52,
      physical: 88,
    },
    formation: "4-2-1-3",
    playstyle: "Quick Counter",
    priceKes: 3000,
    category: "trending",
    isCustom: true,
  });

  // Calculate dynamic OVR based on attributes & position
  const updateAttribute = (attr: keyof typeof cardData.attributes, val: number) => {
    const updatedAttrs = { ...cardData.attributes, [attr]: val };
    const avg = Math.round(
      (updatedAttrs.pace * 1.2 +
        updatedAttrs.shooting * 1.2 +
        updatedAttrs.passing * 1.0 +
        updatedAttrs.dribbling * 1.1 +
        updatedAttrs.defending * 0.7 +
        updatedAttrs.physical * 0.8) /
        6
    );
    const calculatedOvr = Math.min(106, Math.max(88, avg + 6));

    setCardData({
      ...cardData,
      ovr: calculatedOvr,
      attributes: updatedAttrs,
    });
  };

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as any);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as any);
  };

  const handleMintCard = () => {
    setIsMintSuccessOpen(true);
    if (onCardMinted) onCardMinted(cardData);
  };

  return (
    <section id="card-creator" className="py-16 md:py-24 bg-[#050811] text-white relative z-10 border-b border-slate-800">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-mono font-bold mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>INTERACTIVE CARD WORKBENCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight">
            {t.wizardTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
            {t.wizardSubtitle}
          </p>

          {/* Mobile Tabs (Editor vs Live Card Preview) */}
          <div className="lg:hidden flex rounded-2xl bg-slate-900 p-1 border border-slate-800 max-w-xs mx-auto mt-6">
            <button
              type="button"
              onClick={() => setMobileTab("editor")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[48px] flex items-center justify-center gap-2 ${
                mobileTab === "editor"
                  ? "bg-[#00F0FF] text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Card Controls</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[48px] flex items-center justify-center gap-2 ${
                mobileTab === "preview"
                  ? "bg-[#00F0FF] text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Card ({cardData.ovr})</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Wizard Engine (Left) + Live 3D Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Multi-Step Wizard Engine */}
          <div className={`lg:col-span-7 space-y-6 ${mobileTab === "preview" ? "hidden lg:block" : "block"}`}>
            {/* Step Progress Tracker */}
            <div className="grid grid-cols-4 gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
              {[
                { step: 1, label: t.step1Title },
                { step: 2, label: t.step2Title },
                { step: 3, label: t.step3Title },
                { step: 4, label: t.step4Title },
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isPassed = currentStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCurrentStep(s.step as any)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all min-h-[48px] flex flex-col items-center justify-center ${
                      isActive
                        ? "bg-[#00F0FF]/15 border border-[#00F0FF]/60 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        : isPassed
                        ? "text-slate-200 hover:bg-slate-800"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span className="block text-[11px] font-mono leading-tight">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Step Content Container (Carded Glassmorphism) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-2xl">
              <AnimatePresence mode="wait">
                {/* STEP 1: IDENTITY */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold font-display text-white">Player Identity</h3>
                      <p className="text-xs text-slate-400 mt-1">Set your gamer handle, club branding, and pitch role.</p>
                    </div>

                    {/* Gamer Handle */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        {t.gamerHandleLabel}
                      </label>
                      <input
                        type="text"
                        value={cardData.gamerHandle}
                        onChange={(e) => setCardData({ ...cardData, gamerHandle: e.target.value })}
                        placeholder={t.gamerHandlePlaceholder}
                        className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] text-sm min-h-[48px]"
                      />
                    </div>

                    {/* Team Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        {t.teamNameLabel}
                      </label>
                      <input
                        type="text"
                        value={cardData.teamName}
                        onChange={(e) => setCardData({ ...cardData, teamName: e.target.value })}
                        placeholder={t.teamNamePlaceholder}
                        className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] text-sm min-h-[48px]"
                      />
                    </div>

                    {/* Position Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        {t.positionLabel}
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {POSITIONS.map((pos) => {
                          const isSelected = cardData.position === pos;
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setCardData({ ...cardData, position: pos })}
                              className={`py-3 rounded-xl font-mono text-xs font-black transition-all min-h-[48px] ${
                                isSelected
                                  ? "bg-[#00F0FF] text-slate-950 shadow-[0_0_15px_#00F0FF]"
                                  : "bg-black/30 border border-slate-800 text-slate-300 hover:border-slate-600"
                              }`}
                            >
                              {pos}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: AESTHETICS */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold font-display text-white">Visual Card Aesthetics</h3>
                      <p className="text-xs text-slate-400 mt-1">Select your card color aura and tactile finish.</p>
                    </div>

                    {/* Theme Palette */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        {t.cardThemeLabel}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {THEMES.map((thm) => {
                          const isSelected = cardData.cardTheme === thm.id;
                          return (
                            <button
                              key={thm.id}
                              type="button"
                              onClick={() => setCardData({ ...cardData, cardTheme: thm.id })}
                              className={`p-3.5 rounded-2xl border text-left transition-all min-h-[48px] flex items-center gap-3.5 ${
                                isSelected
                                  ? "bg-slate-800 border-white/60 shadow-lg ring-1 ring-white/40"
                                  : "bg-black/40 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              <span
                                className="w-5 h-5 rounded-full shrink-0 shadow-md"
                                style={{ backgroundColor: thm.color }}
                              />
                              <div className="min-w-0">
                                <span className="block text-xs font-bold text-white">{thm.name}</span>
                                <span className="block text-[11px] text-slate-400 truncate">{thm.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Surface Finish */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        {t.cardFinishLabel}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {FINISHES.map((fin) => {
                          const isSelected = cardData.cardFinish === fin.id;
                          return (
                            <button
                              key={fin.id}
                              type="button"
                              onClick={() => setCardData({ ...cardData, cardFinish: fin.id })}
                              className={`p-3.5 rounded-2xl border text-left transition-all min-h-[48px] ${
                                isSelected
                                  ? "bg-slate-800 border-[#00F0FF] text-white"
                                  : "bg-black/40 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <span className="block text-xs font-bold">{fin.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                {fin.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: ATTRIBUTES */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold font-display text-white">{t.attributesTitle}</h3>
                        <p className="text-xs text-slate-400 mt-1">Fine-tune each core metric. OVR recalculates in real-time.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall (OVR)</span>
                        <span className="text-2xl font-black font-display text-[#00F0FF]">{cardData.ovr}</span>
                      </div>
                    </div>

                    {/* Sliders Grid */}
                    <div className="space-y-4">
                      {[
                        { key: "pace" as const, label: t.paceLabel, color: "accent-[#00F0FF]" },
                        { key: "shooting" as const, label: t.shootingLabel, color: "accent-[#F43F5E]" },
                        { key: "passing" as const, label: t.passingLabel, color: "accent-[#FBBF24]" },
                        { key: "dribbling" as const, label: t.dribblingLabel, color: "accent-[#38BDF8]" },
                        { key: "defending" as const, label: t.defendingLabel, color: "accent-[#A855F7]" },
                        { key: "physical" as const, label: t.physicalLabel, color: "accent-[#22C55E]" },
                      ].map((item) => (
                        <div key={item.key} className="space-y-1.5 p-3 rounded-2xl bg-black/30 border border-slate-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-200">{item.label}</span>
                            <span className="font-mono font-black text-sm text-white">
                              {cardData.attributes[item.key]}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="104"
                            value={cardData.attributes[item.key]}
                            onChange={(e) => updateAttribute(item.key, parseInt(e.target.value, 10))}
                            className={`w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer ${item.color} min-h-[32px]`}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: TACTICS & FORMATION */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold font-display text-white">{t.tacticsTitle}</h3>
                      <p className="text-xs text-slate-400 mt-1">Assign custom tactical formation and playstyle synergy.</p>
                    </div>

                    {/* Formation Select Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        {t.formationDropdownLabel}
                      </label>
                      <select
                        value={cardData.formation}
                        onChange={(e) => {
                          const f = e.target.value as TacticalFormation;
                          const matched = FORMATIONS.find((fm) => fm.id === f);
                          setCardData({
                            ...cardData,
                            formation: f,
                            playstyle: matched?.style || cardData.playstyle,
                          });
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-[#00F0FF] text-sm min-h-[48px] font-bold"
                      >
                        {FORMATIONS.map((f) => (
                          <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Live Pitch Formation Visualizer preview */}
                    <PitchFormationVisualizer
                      formation={cardData.formation}
                      highlightPosition={cardData.position}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wizard Navigation Action Strip (Min 48px Touch Friendly) */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs min-h-[48px] flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t.prevStep}</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-7 py-3 rounded-2xl bg-[#00F0FF] hover:bg-cyan-400 text-slate-950 font-black text-xs min-h-[48px] flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all ml-auto"
                  >
                    <span>{t.nextStep}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleMintCard}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#22C55E] hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs min-h-[48px] flex items-center gap-2 shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all ml-auto"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{t.mintCard}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Real-Time 3D Card Preview */}
          <div
            className={`lg:col-span-5 flex flex-col items-center justify-center sticky top-24 ${
              mobileTab === "editor" ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.livePreviewBadge}</span>
              </div>

              {/* The Live Interactive 3D Card Reacting Real-Time to Form State */}
              <InteractivePlayerCard card={cardData} size="hero" enableTilt={true} />

              <p className="text-[11px] text-slate-500 text-center max-w-xs">
                Every attribute and visual tweak applies instantly with full gyroscope mouse & touch reaction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mint to M-Pesa Escrow Success Modal / Bottom Sheet */}
      {isMintSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#090D1A] border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white font-display">Card Configuration Locked!</h3>
              <p className="text-xs text-slate-400">
                Ready to mint <strong>{cardData.gamerHandle}</strong> ({cardData.ovr} OVR, {cardData.formation}) to the eFootball Marketplace.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Asset Fee:</span>
                <strong className="text-white font-mono">KES {cardData.priceKes.toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Escrow Till:</span>
                <strong className="text-amber-400 font-mono">1572931 (eFootballMarket)</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Protection:</span>
                <span className="text-emerald-400 font-semibold">24-hr Buyer Inspection</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMintSuccessOpen(false)}
              className="w-full min-h-[48px] py-3 rounded-2xl bg-[#00F0FF] hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg transition-all"
            >
              Confirm & Return to Workbench
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
