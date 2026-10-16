"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerCardData } from "./types";
import { InteractivePlayerCard } from "./InteractivePlayerCard";
import { PitchFormationVisualizer } from "./PitchFormationVisualizer";
import {
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sliders,
  DollarSign,
  Share2,
} from "lucide-react";

interface QuickViewModalProps {
  card: PlayerCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomize: (card: PlayerCardData) => void;
}

export function QuickViewModal({
  card,
  isOpen,
  onClose,
  onCustomize,
}: QuickViewModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "tactics">("card");

  if (!isOpen || !card) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Adaptive Modal Window: Bottom Sheet on Mobile, Centered Glass Dialog on Desktop */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl bg-[#090D1A]/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl overflow-hidden max-h-[88vh] sm:max-h-[90vh] flex flex-col z-10"
        >
          {/* Mobile Drag Indicator Handle */}
          <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>

          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#00F0FF] animate-pulse" />
              <div>
                <h3 className="text-base sm:text-lg font-black text-white font-display">
                  {card.gamerHandle} • {card.position}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {card.teamName} | Formation: {card.formation} ({card.playstyle})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* High Fidelity Zoom Toggle */}
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={isZoomed ? "Reset Zoom" : "High-Fidelity Zoom"}
              >
                {isZoomed ? <ZoomOut className="w-4 h-4 text-[#00F0FF]" /> : <ZoomIn className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Mobile Tab Switcher between 3D Card and Pitch Tactics */}
            <div className="flex sm:hidden rounded-2xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all min-h-[44px] ${
                  activeTab === "card" ? "bg-[#00F0FF] text-slate-950 font-black" : "text-slate-400"
                }`}
              >
                Card View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tactics")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all min-h-[44px] ${
                  activeTab === "tactics" ? "bg-[#00F0FF] text-slate-950 font-black" : "text-slate-400"
                }`}
              >
                Tactical Pitch
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Card Showcase Column */}
              <div
                className={`sm:col-span-6 flex items-center justify-center overflow-hidden py-4 ${
                  activeTab === "tactics" ? "hidden sm:flex" : "flex"
                }`}
              >
                <div
                  className={`transition-transform duration-300 ${
                    isZoomed ? "scale-125 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <InteractivePlayerCard card={card} size="md" enableTilt={!isZoomed} />
                </div>
              </div>

              {/* Tactical & Attribute Stats Column */}
              <div
                className={`sm:col-span-6 space-y-4 ${
                  activeTab === "card" ? "hidden sm:block" : "block"
                }`}
              >
                {/* Tactical Pitch Visualizer */}
                <PitchFormationVisualizer
                  formation={card.formation}
                  highlightPosition={card.position}
                  compact={true}
                />

                {/* Tactical Description */}
                {card.tacticalDescription && (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#00F0FF] tracking-wider block">
                      Tactical Calibration
                    </span>
                    <p className="leading-relaxed">{card.tacticalDescription}</p>
                  </div>
                )}

                {/* Escrow & Pricing Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>M-Pesa Escrow Price:</span>
                    <strong className="text-xl font-black text-white font-mono">
                      KES {card.priceKes.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Safaricom Till:</span>
                    <span className="text-amber-400 font-bold">1572931 Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Action Footer (Min-h 48px buttons) */}
          <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onCustomize(card);
                onClose();
              }}
              className="w-full sm:flex-1 min-h-[48px] px-6 py-3 rounded-2xl bg-[#00F0FF] hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>Clone & Customize This Card</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
