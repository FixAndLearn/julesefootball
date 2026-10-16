"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { PlayerCardData } from "./types";
import { Shield, Sparkles, Zap, Flame, Trophy } from "lucide-react";

interface InteractivePlayerCardProps {
  card: PlayerCardData;
  size?: "sm" | "md" | "lg" | "hero";
  enableTilt?: boolean;
  className?: string;
}

export function InteractivePlayerCard({
  card,
  size = "md",
  enableTilt = true,
  className = "",
}: InteractivePlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth 3D mouse & touch tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 260 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D rotation angles: range -16deg to +16deg
  const rotateY = useTransform(smoothMouseX, [0, 1], [-16, 16]);
  const rotateX = useTransform(smoothMouseY, [0, 1], [16, -16]);

  // Dynamic light reflections shifting across the surface
  const shineOpacity = useTransform(smoothMouseY, [0, 0.5, 1], [0.45, 0.2, 0.5]);
  const shineX = useTransform(smoothMouseX, [0, 1], ["0%", "100%"]);
  const shineY = useTransform(smoothMouseY, [0, 1], ["0%", "100%"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(Math.max(0, Math.min(1, x)));
    mouseY.set(Math.max(0, Math.min(1, y)));
  };

  const handlePointerLeave = () => {
    if (!enableTilt) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Dimensions based on size
  const sizeStyles = {
    sm: "w-[190px] h-[280px] p-3 text-xs",
    md: "w-[240px] h-[350px] p-4 text-xs",
    lg: "w-[290px] h-[430px] p-5 text-sm",
    hero: "w-[280px] sm:w-[320px] md:w-[350px] h-[420px] sm:h-[480px] md:h-[520px] p-5 md:p-6 text-sm",
  };

  // Theme palettes & borders
  const themeStyles = {
    cyber_neon: {
      border: "border-[#00F0FF]/60 shadow-[0_0_35px_rgba(0,240,255,0.25)]",
      bgGradient: "from-[#081226] via-[#050C1B] to-[#040813]",
      accentText: "text-[#00F0FF]",
      accentGlow: "bg-[#00F0FF]",
      badgeBg: "bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]",
    },
    void_onyx: {
      border: "border-slate-700/80 shadow-[0_0_35px_rgba(15,23,42,0.6)]",
      bgGradient: "from-[#111827] via-[#0B0F19] to-[#030712]",
      accentText: "text-slate-300",
      accentGlow: "bg-slate-400",
      badgeBg: "bg-slate-800/60 border-slate-700 text-slate-200",
    },
    golden_legend: {
      border: "border-[#FBBF24]/70 shadow-[0_0_40px_rgba(251,191,36,0.3)]",
      bgGradient: "from-[#221808] via-[#160F04] to-[#0A0702]",
      accentText: "text-[#FBBF24]",
      accentGlow: "bg-[#FBBF24]",
      badgeBg: "bg-[#FBBF24]/15 border-[#FBBF24]/40 text-[#FBBF24]",
    },
    electric_pitch: {
      border: "border-[#22C55E]/70 shadow-[0_0_35px_rgba(34,197,94,0.3)]",
      bgGradient: "from-[#062013] via-[#04150D] to-[#020B06]",
      accentText: "text-[#22C55E]",
      accentGlow: "bg-[#22C55E]",
      badgeBg: "bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]",
    },
    crimson_velocity: {
      border: "border-[#F43F5E]/70 shadow-[0_0_35px_rgba(244,63,94,0.3)]",
      bgGradient: "from-[#250810] via-[#18050A] to-[#0D0205]",
      accentText: "text-[#F43F5E]",
      accentGlow: "bg-[#F43F5E]",
      badgeBg: "bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]",
    },
  };

  const currentTheme = themeStyles[card.cardTheme] || themeStyles.cyber_neon;

  return (
    <div className={`perspective-1000 flex items-center justify-center select-none ${className}`}>
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX: enableTilt ? rotateX : 0,
          rotateY: enableTilt ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative ${sizeStyles[size]} rounded-3xl border ${currentTheme.border} bg-gradient-to-b ${currentTheme.bgGradient} backdrop-blur-2xl flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing`}
      >
        {/* Holographic Specular Highlight Layer */}
        {enableTilt && (
          <motion.div
            style={{
              opacity: shineOpacity,
              background: `radial-gradient(circle at ${shineX} ${shineY}, rgba(255,255,255,0.35) 0%, rgba(0,240,255,0.15) 30%, transparent 70%)`,
            }}
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          />
        )}

        {/* Diagonal Cyber Aesthetic Line Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
        />

        {/* Subtle Pitch Grass Overlay Lines */}
        <div className="pointer-events-none absolute inset-0 opacity-5 bg-[linear-gradient(to_bottom,transparent_49%,rgba(255,255,255,0.2)_50%,transparent_51%)] [background-size:100%_40px]" />

        {/* Card Header (OVR, Position, Finish badge) */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col">
            <span
              className={`text-4xl sm:text-5xl font-black font-display tracking-tighter leading-none ${currentTheme.accentText}`}
            >
              {card.ovr}
            </span>
            <span className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-white font-display mt-0.5">
              {card.position}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentTheme.badgeBg} flex items-center gap-1`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{card.cardFinish}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              {card.formation}
            </span>
          </div>
        </div>

        {/* Center Visual / Avatar Silhouette Area */}
        <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center text-center">
          <div className="relative">
            {/* Ambient Aura Ring */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${currentTheme.accentGlow}`}
            />
            {/* Player Crest Emblem */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
              <Shield className={`w-10 h-10 sm:w-12 sm:h-12 ${currentTheme.accentText}`} />
            </div>
          </div>

          {/* Player Gamer Handle & Team */}
          <h4 className="mt-3 text-base sm:text-lg font-black text-white tracking-wide truncate max-w-[200px] font-display">
            {card.gamerHandle || "Brinaki Gamer"}
          </h4>
          <p className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
            {card.teamName || "MG FC"}
          </p>
        </div>

        {/* Bottom Section: 6 Hexagonal Attribute Breakdown */}
        <div className="relative z-10 pt-2 border-t border-white/10">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-[9px] font-bold text-slate-400">PAC</span>
              <strong className="text-xs sm:text-sm font-extrabold text-white font-mono">
                {card.attributes.pace}
              </strong>
            </div>
            <div className="p-1 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-[9px] font-bold text-slate-400">SHO</span>
              <strong className="text-xs sm:text-sm font-extrabold text-white font-mono">
                {card.attributes.shooting}
              </strong>
            </div>
            <div className="p-1 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-[9px] font-bold text-slate-400">PAS</span>
              <strong className="text-xs sm:text-sm font-extrabold text-white font-mono">
                {card.attributes.passing}
              </strong>
            </div>
            <div className="p-1 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-[9px] font-bold text-slate-400">DRI</span>
              <strong className="text-xs sm:text-sm font-extrabold text-white font-mono">
                {card.attributes.dribbling}
              </strong>
            </div>
            <div className="p-1 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-[9px] font-bold text-slate-400">DEF</span>
              <strong className="text-xs sm:text-sm font-extrabold text-white font-mono">
                {card.attributes.defending}
              </strong>
            </div>
            <div className="p-1 rounded-lg bg-black/30 border border-white/5">
              <span className="block text-[9px] font-bold text-slate-400">PHY</span>
              <strong className="text-xs sm:text-sm font-extrabold text-white font-mono">
                {card.attributes.physical}
              </strong>
            </div>
          </div>

          {/* Bottom Card Footer Strip */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span>{card.playstyle}</span>
            </span>
            <span className="font-bold text-emerald-400">KES {card.priceKes.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
