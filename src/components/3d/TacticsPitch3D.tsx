"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, Zap, Shield, Eye, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface PlayerToken {
  id: string;
  name: string;
  pos: string;
  ovr: number;
  badge: "Epic Booster" | "Showtime" | "Big Time" | "Highlight";
  stats: { speed: number; finishing: number; dribble: number; defense: number; passing: number };
  x: number; // percentage on pitch (0 to 100)
  y: number; // percentage on pitch (0 to 100)
}

const FORMATIONS: Record<string, { label: string; playstyle: string; players: PlayerToken[] }> = {
  "4-2-1-3": {
    label: "4-2-1-3 Meta Counter",
    playstyle: "Quick Counter",
    players: [
      { id: "1", name: "P. Čech", pos: "GK", ovr: 101, badge: "Epic Booster", x: 50, y: 88, stats: { speed: 65, finishing: 40, dribble: 50, defense: 99, passing: 72 } },
      { id: "2", name: "R. Carlos", pos: "LB", ovr: 102, badge: "Big Time", x: 18, y: 72, stats: { speed: 99, finishing: 88, dribble: 89, defense: 84, passing: 92 } },
      { id: "3", name: "P. Maldini", pos: "CB", ovr: 103, badge: "Epic Booster", x: 38, y: 74, stats: { speed: 86, finishing: 55, dribble: 75, defense: 101, passing: 84 } },
      { id: "4", name: "A. Nesta", pos: "CB", ovr: 102, badge: "Epic Booster", x: 62, y: 74, stats: { speed: 85, finishing: 45, dribble: 70, defense: 102, passing: 78 } },
      { id: "5", name: "Cafu", pos: "RB", ovr: 101, badge: "Epic Booster", x: 82, y: 72, stats: { speed: 94, finishing: 70, dribble: 86, defense: 88, passing: 89 } },
      { id: "6", name: "P. Vieira", pos: "DMF", ovr: 104, badge: "Epic Booster", x: 38, y: 52, stats: { speed: 90, finishing: 75, dribble: 82, defense: 101, passing: 86 } },
      { id: "7", name: "F. Rijkaard", pos: "DMF", ovr: 102, badge: "Epic Booster", x: 62, y: 52, stats: { speed: 84, finishing: 78, dribble: 85, defense: 98, passing: 91 } },
      { id: "8", name: "Kaká", pos: "AMF", ovr: 103, badge: "Big Time", x: 50, y: 35, stats: { speed: 98, finishing: 92, dribble: 96, defense: 60, passing: 94 } },
      { id: "9", name: "Neymar Jr", pos: "LWF", ovr: 103, badge: "Showtime", x: 20, y: 18, stats: { speed: 97, finishing: 94, dribble: 102, defense: 52, passing: 91 } },
      { id: "10", name: "L. Messi", pos: "RWF", ovr: 105, badge: "Epic Booster", x: 80, y: 18, stats: { speed: 96, finishing: 101, dribble: 104, defense: 55, passing: 99 } },
      { id: "11", name: "Ronaldo R9", pos: "CF", ovr: 104, badge: "Big Time", x: 50, y: 12, stats: { speed: 99, finishing: 102, dribble: 98, defense: 48, passing: 85 } },
    ],
  },
  "4-2-2-2": {
    label: "4-2-2-2 Dual AMF",
    playstyle: "Possession Game",
    players: [
      { id: "1", name: "P. Čech", pos: "GK", ovr: 101, badge: "Epic Booster", x: 50, y: 88, stats: { speed: 65, finishing: 40, dribble: 50, defense: 99, passing: 72 } },
      { id: "2", name: "D. Alaba", pos: "LB", ovr: 100, badge: "Highlight", x: 18, y: 72, stats: { speed: 88, finishing: 76, dribble: 85, defense: 90, passing: 93 } },
      { id: "3", name: "P. Maldini", pos: "CB", ovr: 103, badge: "Epic Booster", x: 38, y: 74, stats: { speed: 86, finishing: 55, dribble: 75, defense: 101, passing: 84 } },
      { id: "4", name: "V. van Dijk", pos: "CB", ovr: 102, badge: "Showtime", x: 62, y: 74, stats: { speed: 84, finishing: 50, dribble: 72, defense: 103, passing: 82 } },
      { id: "5", name: "J. Kimmich", pos: "RB", ovr: 101, badge: "Showtime", x: 82, y: 72, stats: { speed: 86, finishing: 78, dribble: 90, defense: 92, passing: 98 } },
      { id: "6", name: "P. Vieira", pos: "DMF", ovr: 104, badge: "Epic Booster", x: 38, y: 55, stats: { speed: 90, finishing: 75, dribble: 82, defense: 101, passing: 86 } },
      { id: "7", name: "A. Pirlo", pos: "DMF", ovr: 103, badge: "Epic Booster", x: 62, y: 55, stats: { speed: 80, finishing: 84, dribble: 94, defense: 86, passing: 102 } },
      { id: "8", name: "Ronaldinho", pos: "AMF", ovr: 104, badge: "Epic Booster", x: 28, y: 34, stats: { speed: 93, finishing: 92, dribble: 103, defense: 58, passing: 97 } },
      { id: "9", name: "L. Messi", pos: "AMF", ovr: 105, badge: "Epic Booster", x: 72, y: 34, stats: { speed: 96, finishing: 101, dribble: 104, defense: 55, passing: 99 } },
      { id: "10", name: "K. Mbappé", pos: "CF", ovr: 103, badge: "Showtime", x: 38, y: 14, stats: { speed: 101, finishing: 98, dribble: 96, defense: 45, passing: 84 } },
      { id: "11", name: "E. Haaland", pos: "CF", ovr: 102, badge: "Highlight", x: 62, y: 14, stats: { speed: 98, finishing: 101, dribble: 85, defense: 52, passing: 78 } },
    ],
  },
  "3-2-3-2": {
    label: "3-2-3-2 Midfield Overload",
    playstyle: "Long Ball Counter",
    players: [
      { id: "1", name: "P. Čech", pos: "GK", ovr: 101, badge: "Epic Booster", x: 50, y: 88, stats: { speed: 65, finishing: 40, dribble: 50, defense: 99, passing: 72 } },
      { id: "2", name: "P. Maldini", pos: "CB", ovr: 103, badge: "Epic Booster", x: 26, y: 74, stats: { speed: 86, finishing: 55, dribble: 75, defense: 101, passing: 84 } },
      { id: "3", name: "F. Beckenbauer", pos: "CB", ovr: 104, badge: "Epic Booster", x: 50, y: 76, stats: { speed: 88, finishing: 78, dribble: 88, defense: 102, passing: 96 } },
      { id: "4", name: "A. Nesta", pos: "CB", ovr: 102, badge: "Epic Booster", x: 74, y: 74, stats: { speed: 85, finishing: 45, dribble: 70, defense: 102, passing: 78 } },
      { id: "5", name: "P. Vieira", pos: "DMF", ovr: 104, badge: "Epic Booster", x: 38, y: 55, stats: { speed: 90, finishing: 75, dribble: 82, defense: 101, passing: 86 } },
      { id: "6", name: "Casemiro", pos: "DMF", ovr: 101, badge: "Highlight", x: 62, y: 55, stats: { speed: 80, finishing: 72, dribble: 80, defense: 100, passing: 88 } },
      { id: "7", name: "R. Carlos", pos: "LMF", ovr: 102, badge: "Big Time", x: 18, y: 35, stats: { speed: 99, finishing: 88, dribble: 89, defense: 84, passing: 92 } },
      { id: "8", name: "Kaká", pos: "AMF", ovr: 103, badge: "Big Time", x: 50, y: 32, stats: { speed: 98, finishing: 92, dribble: 96, defense: 60, passing: 94 } },
      { id: "9", name: "D. Beckham", pos: "RMF", ovr: 102, badge: "Epic Booster", x: 82, y: 35, stats: { speed: 85, finishing: 88, dribble: 88, defense: 75, passing: 102 } },
      { id: "10", name: "Ronaldo R9", pos: "CF", ovr: 104, badge: "Big Time", x: 38, y: 14, stats: { speed: 99, finishing: 102, dribble: 98, defense: 48, passing: 85 } },
      { id: "11", name: "L. Messi", pos: "SS", ovr: 105, badge: "Epic Booster", x: 62, y: 16, stats: { speed: 96, finishing: 101, dribble: 104, defense: 55, passing: 99 } },
    ],
  },
};

export function TacticsPitch3D() {
  const [activeFormationKey, setActiveFormationKey] = useState<string>("4-2-1-3");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerToken | null>(FORMATIONS["4-2-1-3"].players[9]); // Messi
  const [cameraAngle, setCameraAngle] = useState<"isometric" | "topdown" | "broadcast">("isometric");

  const currentFormation = FORMATIONS[activeFormationKey];

  // Camera transforms
  const pitchTransforms = {
    isometric: "rotateX(52deg) rotateZ(-14deg) scale(0.92)",
    broadcast: "rotateX(62deg) rotateZ(0deg) scale(0.96)",
    topdown: "rotateX(0deg) rotateZ(0deg) scale(0.9)",
  }[cameraAngle];

  return (
    <section className="py-20 border-t border-pitch-border/60 bg-gradient-to-b from-[#090d16] via-pitch-card/60 to-pitch overflow-hidden relative">
      {/* 3D Atmosphere Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4 shadow-inner">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Interactive 3D Tactics Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Inspect Meta <span className="bg-gradient-to-r from-amber-400 via-sky-300 to-brand-400 bg-clip-text text-transparent">3100+ OVR Squads</span> in 3D
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Rotate the stadium camera, swap meta formations, and click any 3D player token to inspect authentic booster ratings before buying.
          </p>
        </div>

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-pitch-surface/80 border border-pitch-border backdrop-blur-xl mb-8 shadow-xl">
          {/* Formation Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Formation:</span>
            {Object.keys(FORMATIONS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveFormationKey(key);
                  setSelectedPlayer(FORMATIONS[key].players[9]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFormationKey === key
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/40 border border-brand-400 scale-105"
                    : "bg-pitch-card text-slate-300 border border-pitch-border hover:border-slate-500 hover:text-white"
                }`}
              >
                {FORMATIONS[key].label}
              </button>
            ))}
          </div>

          {/* Camera Perspective Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">3D Camera:</span>
            {(["isometric", "broadcast", "topdown"] as const).map((cam) => (
              <button
                key={cam}
                type="button"
                onClick={() => setCameraAngle(cam)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  cameraAngle === cam
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-pitch-card text-slate-300 border border-pitch-border hover:text-white"
                }`}
              >
                {cam === "isometric" ? "3D Dynamic" : cam === "broadcast" ? "Broadcast" : "2D Tactics"}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Pitch Arena & Player Card Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 3D Interactive Pitch Arena (8 Columns) */}
          <div className="lg:col-span-8 relative perspective-1500 flex items-center justify-center min-h-[500px] sm:min-h-[580px] p-4">
            {/* 3D Pitch Platform */}
            <div
              style={{
                transform: pitchTransforms,
                transformStyle: "preserve-3d",
                transition: "transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
              }}
              className="relative w-[340px] sm:w-[480px] md:w-[540px] aspect-[1/1.45] rounded-3xl bg-gradient-to-b from-emerald-950 via-[#0a3821] to-[#042414] border-4 border-emerald-500/60 shadow-[0_30px_70px_rgba(0,0,0,0.85)] p-4 select-none"
            >
              {/* 3D Pitch Thickness / Bevel Extrusion */}
              <div
                className="absolute inset-x-0 -bottom-5 h-5 bg-emerald-950 border-x-4 border-b-4 border-emerald-900 rounded-b-3xl pointer-events-none"
                style={{ transform: "rotateX(-90deg) translateZ(10px)" }}
              />

              {/* Pitch Grass Stripes Overlay */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08) 32px, transparent 32px, transparent 64px)",
                }}
              />

              {/* Pitch Tactical Markings (Center circle, penalty box, halfway line) */}
              <div className="absolute inset-4 border-2 border-emerald-300/40 rounded-xl pointer-events-none">
                {/* Halfway line */}
                <div className="absolute top-1/2 inset-x-0 h-0.5 bg-emerald-300/40" />

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-emerald-300/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-300/80" />
                </div>

                {/* Penalty Box Top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-20 border-b-2 border-x-2 border-emerald-300/40 rounded-b-lg">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-8 border-b-2 border-x-2 border-emerald-300/40" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-300/80" />
                </div>

                {/* Penalty Box Bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-20 border-t-2 border-x-2 border-emerald-300/40 rounded-t-lg">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 border-t-2 border-x-2 border-emerald-300/40" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-300/80" />
                </div>

                {/* 3D Glowing Goalposts Top & Bottom */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-3 bg-white/30 border border-white/60 rounded-t-md"
                  style={{ transform: "translateZ(14px)" }}
                />
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-3 bg-white/30 border border-white/60 rounded-b-md"
                  style={{ transform: "translateZ(14px)" }}
                />
              </div>

              {/* 3D Floating Player Tokens */}
              {currentFormation.players.map((player) => {
                const isSelected = selectedPlayer?.id === player.id;
                return (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    style={{
                      left: `${player.x}%`,
                      top: `${player.y}%`,
                      transform: isSelected
                        ? "translate(-50%, -50%) translateZ(48px) scale(1.2)"
                        : "translate(-50%, -50%) translateZ(26px) scale(1)",
                      transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    className="absolute cursor-pointer group select-none z-30"
                  >
                    {/* Floating 3D Player Puck */}
                    <div
                      className={`relative flex flex-col items-center justify-center p-1.5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "bg-gradient-to-b from-amber-400 to-amber-600 border-white shadow-[0_0_25px_rgba(245,158,11,0.9)]"
                          : "bg-slate-900/90 border-amber-400/60 hover:border-amber-300 hover:scale-110 shadow-lg shadow-black/80 backdrop-blur-md"
                      }`}
                    >
                      {/* OVR Rating Badge */}
                      <span
                        className={`text-[10px] font-black leading-none px-1 py-0.5 rounded ${
                          isSelected ? "bg-black text-amber-300 font-display" : "text-amber-400"
                        }`}
                      >
                        {player.ovr}
                      </span>

                      {/* Position Code */}
                      <span
                        className={`text-[9px] font-bold uppercase leading-tight ${
                          isSelected ? "text-slate-950" : "text-white"
                        }`}
                      >
                        {player.pos}
                      </span>

                      {/* Player Name Tag (Floats slightly) */}
                      <div className="absolute -bottom-5 inset-x-[-24px] text-center pointer-events-none">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border shadow whitespace-nowrap ${
                            isSelected
                              ? "bg-amber-400 text-slate-950 border-white font-extrabold"
                              : "bg-black/90 text-slate-200 border-slate-700/80"
                          }`}
                        >
                          {player.name}
                        </span>
                      </div>
                    </div>

                    {/* Glowing Ground Shadow Circle */}
                    <div
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full blur-[3px] pointer-events-none transition-all ${
                        isSelected ? "bg-amber-400/60 scale-125" : "bg-black/40 group-hover:bg-amber-400/30"
                      }`}
                      style={{ transform: "translateZ(-20px)" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected 3D Player Hologram Inspector (4 Columns) */}
          <div className="lg:col-span-4">
            {selectedPlayer ? (
              <div className="p-6 rounded-3xl bg-pitch-surface/90 border border-amber-500/50 shadow-2xl backdrop-blur-xl relative overflow-hidden preserve-3d">
                {/* Holographic background sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-brand-500/10 pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs font-display">
                      {selectedPlayer.ovr} OVR
                    </span>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      {selectedPlayer.badge}
                    </span>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-200">
                    {selectedPlayer.pos}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white font-display mb-1">
                  {selectedPlayer.name}
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Featured in Division 1 Top Tier Squads with full Max-Level progression.
                </p>

                {/* 3D Stat Bars */}
                <div className="space-y-3 mb-6">
                  {Object.entries(selectedPlayer.stats).map(([statName, val]) => (
                    <div key={statName}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="capitalize text-slate-300">{statName}</span>
                        <span className={`font-mono font-bold ${val >= 99 ? "text-amber-400" : "text-sky-300"}`}>
                          {val}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            val >= 99
                              ? "bg-gradient-to-r from-amber-500 to-amber-300 shadow-sm shadow-amber-400"
                              : "bg-gradient-to-r from-brand-500 to-sky-400"
                          }`}
                          style={{ width: `${Math.min(val, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Call to action */}
                <div className="pt-4 border-t border-pitch-border/60">
                  <Link href={`/browse?search=${encodeURIComponent(selectedPlayer.name)}`}>
                    <Button variant="gold" size="md" className="w-full font-bold btn-3d-gold">
                      Find Accounts with {selectedPlayer.name}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-pitch-surface/60 border border-pitch-border text-center">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-300">Select any player on the 3D pitch</p>
                <p className="text-xs text-slate-500 mt-1">Inspect their live stats and booster ratings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
