"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/types/database";
import { formatCompactNumber, formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { isListingOnFlashSale } from "@/lib/utils/flashSale";
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
  Flame,
  Edit3,
} from "lucide-react";

interface SquadInspectorModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export function SquadInspectorModal({ listing, isOpen, onClose }: SquadInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<"startingXI" | "bench" | "resources">("startingXI");
  const [isZoomed, setIsZoomed] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const isOwner = user?.id && user.id === listing.seller_id;
  const isFlashDrop = isListingOnFlashSale(listing);
  const isAvailable = listing.status === "published";

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
        <div className="p-4 sm:p-5 bg-[#111827] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-black text-sm shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 shrink-0">
                  {getPlatformLabel(listing.platform)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/70 border border-amber-500/40 text-[10px] font-mono font-black text-amber-300 shrink-0">
                  ⚡ {listing.overall_team_strength} CS
                </span>
                {isFlashDrop && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600/90 border border-rose-400 text-[10px] font-extrabold text-white shrink-0 animate-pulse flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>Flash Drop</span>
                  </span>
                )}
                {!isAvailable && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-[10px] font-bold text-slate-300 shrink-0">
                    {listing.status === "sold" ? "Sold" : "In Escrow"}
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white truncate mt-1">
                {listing.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
            title="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-[#0B1220] px-3 sm:px-4 gap-1.5 sm:gap-2 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("startingXI")}
            className={`py-3 px-2 sm:px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === "startingXI"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Tab 1: </span>
            <span>Starting XI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bench")}
            className={`py-3 px-2 sm:px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === "bench"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Tab 2: </span>
            <span>Reserves &amp; Bench</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={`py-3 px-2 sm:px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === "resources"
                ? "border-indigo-400 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coins className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Tab 3: </span>
            <span>Resources &amp; Tiers</span>
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
                    <span className="text-xs uppercase font-bold">Screenshot Not Provided</span>
                  </div>
                )}
                <div className="absolute bottom-2.5 right-2.5 z-10">
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700 text-white text-[10px] font-bold flex items-center gap-1"
                  >
                    <ZoomIn className="w-3 h-3" />
                    <span>{isZoomed ? "Reset Zoom" : "Click to Zoom"}</span>
                  </button>
                </div>
              </div>

              {/* Manager & Tactical Boost Info */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Manager Assigned</span>
                  <span className="font-bold text-white text-sm">{listing.manager_name || "Custom Specialist"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Playstyle</span>
                  <span className="font-bold text-emerald-400">{getPlaystyleLabel(listing.primary_playstyle)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Division Record</span>
                  <span className="font-bold text-amber-300">
                    Div {listing.current_division || "1"} (Best: Div {listing.highest_division || "1"})
                  </span>
                </div>
              </div>
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
                    <span className="text-xs uppercase font-bold">Reserves Screenshot Included in Main View</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">
                  Showcase Players &amp; Substitutes
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(listing.key_players_list && listing.key_players_list.length > 0) ? (
                    listing.key_players_list.map((player, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{player}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">
                      All key roster cards are visible in the primary squad screenshot above.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-4">
              {/* Card Tier Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                  <span className="block text-[10px] text-amber-400 uppercase font-black truncate">🔥 Epics</span>
                  <span className="text-2xl font-black text-amber-200 font-mono mt-1 block">
                    {listing.epic_players_count || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40">
                  <span className="block text-[10px] text-purple-400 uppercase font-black truncate">⭐ Big Time</span>
                  <span className="text-2xl font-black text-purple-200 font-mono mt-1 block">
                    {listing.big_time_players_count || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/40">
                  <span className="block text-[10px] text-sky-400 uppercase font-black truncate">💎 Show Time</span>
                  <span className="text-2xl font-black text-sky-200 font-mono mt-1 block">
                    {listing.featured_players_count || 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                  <span className="block text-[10px] text-emerald-400 uppercase font-black truncate">⚡ Highlights</span>
                  <span className="text-2xl font-black text-emerald-200 font-mono mt-1 block">
                    {listing.highlight_players_count || 0}
                  </span>
                </div>
              </div>

              {/* In-Game Resource Balances */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
                  <span className="block text-[10px] text-amber-400 uppercase font-bold truncate">eFootball Coins</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono mt-1 block truncate">
                    {formatCompactNumber(listing.coin_balance)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
                  <span className="block text-[10px] text-emerald-400 uppercase font-bold truncate">GP Balance</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono mt-1 block truncate">
                    {formatCompactNumber(listing.gp_balance)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
                  <span className="block text-[10px] text-indigo-400 uppercase font-bold truncate">ePoints</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono mt-1 block truncate">
                    {formatCompactNumber(listing.efootball_points)}
                  </span>
                </div>
              </div>

              {/* Binding & Security Status Checklist */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block text-[11px] uppercase tracking-wider">
                  Account Binding &amp; Security Handshake
                </span>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span className="leading-snug">Konami ID: Ready (Email &amp; Password Changeable by Buyer)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span className="leading-snug">Google Play / Game Center: 100% Unlinked (Clean transfer)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span className="leading-snug">Platform: {getPlatformLabel(listing.platform)} / Cross-Save Ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar inside Modal */}
        <div className="p-3.5 sm:p-5 bg-[#111827] border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {isFlashDrop ? "Flash Drop Price (Locked)" : "Escrow Price (Till 1572931)"}
            </span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-[#22C55E] font-mono truncate">
                {formatCurrency(listing.price, listing.currency)}
              </span>
              <span className="text-[11px] text-slate-400">
                | 24h Buyer Inspection
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link href={`/listings/${listing.id}`} className="flex-1 sm:flex-none">
              <button
                type="button"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors min-h-[44px]"
              >
                View Full Listing
              </button>
            </Link>

            {isOwner ? (
              listing.status === "sold" ? (
                <span className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] select-none">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Account Sold</span>
                </span>
              ) : listing.status === "in_escrow" ? (
                <span className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] select-none">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>In Escrow</span>
                </span>
              ) : (
                <Link href={`/seller/edit-listing/${listing.id}`} className="flex-1 sm:flex-none">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit in Seller Hub</span>
                  </button>
                </Link>
              )
            ) : !isAvailable ? (
              <button
                type="button"
                disabled
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs cursor-not-allowed min-h-[44px]"
              >
                {listing.status === "sold" ? "Account Sold" : "Under Escrow Lock"}
              </button>
            ) : (
              <Link href={`/pay/${listing.id}`} className="flex-1 sm:flex-none">
                <button
                  type="button"
                  className="w-full px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-emerald-400 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5 transition-all active:scale-95 min-h-[44px]"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Buy Safely with M-Pesa Escrow</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
