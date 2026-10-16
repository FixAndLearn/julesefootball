"use client";

import React from "react";
import { motion } from "framer-motion";
import { TacticalFormation, CardPosition } from "./types";
import { FORMATION_PRESETS } from "./data/mockCards";
import { ShieldCheck, Crosshair, Sparkles } from "lucide-react";

interface PitchFormationVisualizerProps {
  formation: TacticalFormation;
  highlightPosition?: CardPosition;
  className?: string;
  compact?: boolean;
}

export function PitchFormationVisualizer({
  formation,
  highlightPosition,
  className = "",
  compact = false,
}: PitchFormationVisualizerProps) {
  const preset = FORMATION_PRESETS[formation] || FORMATION_PRESETS["4-2-1-3"];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tactical Header */}
      {!compact && (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider block">
              {preset.name}
            </span>
            <p className="text-[11px] text-slate-400">{preset.description}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            {preset.metaTier}
          </span>
        </div>
      )}

      {/* Cyber Pitch Turf Surface */}
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#06180E] via-[#04120B] to-[#020B06] border border-emerald-500/40 shadow-[0_0_25px_rgba(34,197,94,0.15)] overflow-hidden">
        {/* Pitch Turf Grid Lines */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_bottom,transparent_49%,rgba(34,197,94,0.8)_50%,transparent_51%)] [background-size:100%_25%]" />

        {/* Pitch Boundary Markings */}
        <div className="absolute inset-2 sm:inset-3 border border-emerald-500/30 rounded-lg pointer-events-none">
          {/* Halfway Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-500/30" />
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 sm:w-20 h-14 sm:h-20 rounded-full border border-emerald-500/30" />
          {/* Center Spot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {/* Attacking Penalty Box (Top) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-10 sm:h-14 border-b border-x border-emerald-500/30" />
          {/* Defending Penalty Box (Bottom) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-10 sm:h-14 border-t border-x border-emerald-500/30" />
        </div>

        {/* 11 Player Nodes with smooth spring transitions when formation changes */}
        {preset.nodes.map((node, idx) => {
          const isHighlighted = highlightPosition && node.role === highlightPosition;
          return (
            <motion.div
              key={`${formation}-${node.label}-${idx}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                scale: 1,
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono text-[9px] sm:text-[10px] font-black transition-all ${
                  isHighlighted
                    ? "bg-[#00F0FF] text-black ring-4 ring-[#00F0FF]/40 shadow-[0_0_15px_#00F0FF]"
                    : "bg-slate-900/90 text-emerald-300 border border-emerald-400/60 hover:scale-110 hover:border-emerald-300 hover:text-white"
                }`}
              >
                {node.role}
              </div>
              {!compact && (
                <span className="text-[8px] font-bold text-slate-300 opacity-80 mt-0.5 whitespace-nowrap hidden sm:block">
                  {node.label}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tactical Strengths Tags */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {preset.strengths.map((str, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#00F0FF]" />
              <span>{str}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
