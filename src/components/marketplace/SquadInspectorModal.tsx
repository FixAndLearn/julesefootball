"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/types/database";
import { formatCompactNumber, formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import {
  X,
  ShieldCheck,
  Zap,
  Star,
  Users,
  Coins,
  Trophy,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Smartphone,
  ZoomIn,
} from "lucide-react";

interface SquadInspectorModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export function SquadInspectorModal({ listing, isOpen, onClose }: SquadInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<"startingXI" | "bench" | "resources">("startingXI");
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen) return null;

  const images = listing.images || [];
  const primaryImage = images.find((img) => img.is_primary)?.image_url || images[0]?.image_url;
  const secondaryImage = images[1]?.image_url || primaryImage;
  const thirdImage = images[2]?.image_url || primaryImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#111827] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-black text-sm shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-bold text-emerald-300">
                  {getPlatformLabel(listing.platform)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/70 border border-amber-500/40 text-[10px] font-mono font-black text-amber-300">
                  ⚡ {listing.overall_team_strength} OVR
                </span>
                <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 truncate hidden sm:inline">
                  {getPlaystyleLabel(listing.primary_playstyle)}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                {listing.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-[#0B1220] px-4 gap-2 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("startingXI")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "startingXI"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Tab 1: Starting XI & Manager Boost</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bench")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "bench"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Tab 2: Reserves & Bench</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "resources"
                ? "border-indigo-400 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coins className="w-4 h-4 text-indigo-400" />
            <span>Tab 3: Account Resources & Tiers</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === "startingXI" && (
            <div className="space-y-4">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={`${listing.title} Starting XI`}
                    fill
                    unoptimized={true}
                    className={`object-cover transition-transform duration-300 cursor-zoom-in ${
                      isZoomed ? "scale-150" : "scale-100"
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <Trophy className="w-12 h-12 mb-2 opacity-50" />
                    <span>No image uploaded for Starting XI</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isZoomed ? "Zoom Out" : "Hover / Click to Zoom"}</span>
                </button>
              </div>

              {/* Manager & Tactical Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#111827] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Formation</span>
                  <span className="font-bold text-white text-sm">{listing.formation || "4-3-3 / 4-2-1-3"}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Manager</span>
                  <span className="font-bold text-white text-sm">{listing.manager_name || "Luis A. Roman / Pep"}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Playstyle</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {getPlaystyleLabel(listing.primary_playstyle)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Division</span>
                  <span className="font-bold text-amber-400 text-sm">Division {listing.current_division || 1}</span>
                </div>
              </div>

              {/* Key Players Tag Pills */}
              {listing.key_players_list && listing.key_players_list.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                    Featured Meta Players in Starting Squad:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.key_players_list.map((player, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-bold"
                      >
                        ★ {player}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "bench" && (
            <div className="space-y-4">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                {secondaryImage ? (
                  <Image
                    src={secondaryImage}
                    alt={`${listing.title} Bench & Reserves`}
                    fill
                    unoptimized={true}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <Users className="w-12 h-12 mb-2 opacity-50" />
                    <span>Single screenshot squad</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block">Reserve & Tactical Substitutions</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  All substitute players, supersubs, and position boosters shown in the bench screenshot are included with this account transfer. Full Konami ID handover includes unlinked player inventory.
                </p>
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-4">
              {/* Account Card Tiers Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow-inner">
                  <span className="block text-[10px] uppercase font-black text-amber-400">🔥 Epics Count</span>
                  <span className="text-2xl font-black text-amber-200 font-mono mt-1 block">
                    {listing.epic_players_count || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 shadow-inner">
                  <span className="block text-[10px] uppercase font-black text-purple-400">⭐ Big Time Cards</span>
                  <span className="text-2xl font-black text-purple-200 font-mono mt-1 block">
                    {listing.big_time_players_count || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 shadow-inner">
                  <span className="block text-[10px] uppercase font-black text-sky-400">💎 Show Time Cards</span>
                  <span className="text-2xl font-black text-sky-200 font-mono mt-1 block">
                    {listing.featured_players_count || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-inner">
                  <span className="block text-[10px] uppercase font-black text-emerald-400">⚡ Highlights</span>
                  <span className="text-2xl font-black text-emerald-200 font-mono mt-1 block">
                    {listing.highlight_players_count || 0}
                  </span>
                </div>
              </div>

              {/* In-Game Resource Balances */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
                  <span className="block text-[10px] text-amber-400 uppercase font-bold">eFootball Coins</span>
                  <span className="text-lg font-black text-white font-mono mt-1 block">
                    {formatCompactNumber(listing.coin_balance)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
                  <span className="block text-[10px] text-emerald-400 uppercase font-bold">GP Balance</span>
                  <span className="text-lg font-black text-white font-mono mt-1 block">
                    {formatCompactNumber(listing.gp_balance)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
                  <span className="block text-[10px] text-indigo-400 uppercase font-bold">ePoints</span>
                  <span className="text-lg font-black text-white font-mono mt-1 block">
                    {formatCompactNumber(listing.efootball_points)}
                  </span>
                </div>
              </div>

              {/* Binding & Security Status Checklist */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block text-[11px] uppercase tracking-wider">
                  Account Binding & Security Handshake
                </span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>Konami ID: Ready (Email & Password Changeable by Buyer)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>Google Play / Game Center: 100% Unlinked (Clean transfer)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>Platform: {getPlatformLabel(listing.platform)} / Cross-Save Ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar inside Modal */}
        <div className="p-4 sm:p-5 bg-[#111827] border-t border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Escrow Price (Till 1572931)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#22C55E] font-mono">
                {formatCurrency(listing.price, listing.currency)}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                • 24h Buyer Inspection
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href={`/listings/${listing.id}`}>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors min-h-[44px]"
              >
                View Full Listing
              </button>
            </Link>
            <Link href={`/pay/${listing.id}`}>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-emerald-400 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all active:scale-95 min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Buy Safely with M-Pesa Escrow</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
