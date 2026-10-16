"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { VerifiedSellerBadge } from "@/components/marketplace/VerifiedSellerBadge";
import { SquadInspectorModal } from "@/components/marketplace/SquadInspectorModal";
import { formatCompactNumber, formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { isListingOnFlashSale } from "@/lib/utils/flashSale";
import {
  ShieldCheck,
  Star,
  Trophy,
  Users,
  Zap,
  MessageCircle,
  Eye,
  CheckCircle2,
  Lock,
  Flame,
  Diamond,
} from "lucide-react";

export interface ListingCard3DProps {
  listing: Listing;
  featured?: boolean;
}

export function ListingCard3D({ listing, featured = false }: ListingCard3DProps) {
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const primaryImage =
    listing.images?.find((img) => img.is_primary)?.image_url || listing.images?.[0]?.image_url;

  const isEliteStrength = (listing.overall_team_strength || 0) >= 3150;
  const isCompetitiveStrength = (listing.overall_team_strength || 0) >= 3100 && !isEliteStrength;
  const isFlashDrop = isListingOnFlashSale(listing);
  const isAvailable = listing.status === "published";

  const epics = listing.epic_players_count || 0;
  const bigTime = listing.big_time_players_count || 0;
  const showTime = listing.featured_players_count || 0;
  const highlights = listing.highlight_players_count || 0;

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div
          className={`group bg-pitch-surface/90 border rounded-2xl overflow-hidden relative flex flex-col h-full justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
            isFlashDrop
              ? "border-amber-500/80 shadow-2xl shadow-amber-500/15 hover:border-amber-400"
              : featured
              ? "border-amber-500/70 shadow-2xl shadow-amber-500/10 hover:border-amber-400"
              : isEliteStrength
              ? "border-amber-500/50 shadow-xl shadow-amber-500/10 hover:border-amber-400 hover:shadow-amber-500/20"
              : "border-pitch-border hover:border-emerald-500/60 shadow-xl shadow-black/40 hover:shadow-emerald-500/10"
          }`}
        >
          {/* Subtle CSS hover edge gradient sheen */}
          <div
            className={`absolute -inset-px rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 ${
              isFlashDrop
                ? "bg-gradient-to-r from-amber-500/30 via-rose-500/20 to-amber-500/30"
                : isEliteStrength
                ? "bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-emerald-500/20"
                : "bg-gradient-to-r from-emerald-500/20 via-amber-400/15 to-sky-400/15"
            }`}
          />

          {/* Media Header / Image */}
          <Link href={`/listings/${listing.id}`} className="block relative aspect-[16/10] w-full bg-slate-900 overflow-hidden cursor-pointer">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={true}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-600">
                <Trophy className="w-12 h-12 stroke-[1.5] mb-1" />
                <span className="text-xs uppercase tracking-wider font-semibold">Account Preview</span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-pitch-card via-transparent to-black/60 pointer-events-none" />

            {/* Escrow Lock / Sold Overlay if not published */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-30 flex items-center justify-center pointer-events-none p-3">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/95 border border-amber-500/60 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xl">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{listing.status === "sold" ? "Sold & Delivered" : "Under Escrow Lock"}</span>
                </span>
              </div>
            )}

            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-20">
              <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-bold text-slate-200 shadow-md truncate shrink-0">
                  {getPlatformLabel(listing.platform)}
                </span>
                {/* Swap is withdrawn if on flash sale or not published */}
                {listing.allows_swap && !isFlashDrop && isAvailable && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-[10px] font-bold text-emerald-300 shadow-md shrink-0">
                    🔁 Swap
                  </span>
                )}
                {isFlashDrop && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600/90 border border-rose-400 text-[10px] font-extrabold text-white shadow-md shrink-0 animate-pulse flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>Flash Drop</span>
                  </span>
                )}
              </div>

              {/* Collective Strength High-Contrast Badge */}
              <div className="shrink-0">
                <div
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full backdrop-blur-md text-[11px] font-mono font-black shadow-lg ${
                    isEliteStrength
                      ? "bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-600/40 border border-amber-400 text-amber-200 ring-1 ring-amber-400/50"
                      : "bg-black/90 border border-emerald-500/70 text-emerald-300"
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
                  <span>{listing.overall_team_strength} CS</span>
                </div>
              </div>
            </div>

            {/* Bottom Overlay Info & Inspect Action */}
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 z-20">
              <span className="text-[10px] font-semibold text-slate-200 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700/80 shadow-md truncate max-w-[140px]">
                {getPlaystyleLabel(listing.primary_playstyle)}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setInspectorOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] shadow-lg flex items-center gap-1 transition-all active:scale-95 shrink-0"
                title="Open Squad Inspector"
              >
                <Eye className="w-3 h-3 stroke-[3]" />
                <span>Inspect Squad</span>
              </button>
            </div>
          </Link>

          {/* Card Body */}
          <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <Link href={`/listings/${listing.id}`}>
                <h3 className="font-bold text-slate-100 text-sm line-clamp-1 group-hover:text-emerald-300 transition-colors">
                  {listing.title}
                </h3>
              </Link>

              {/* Meta Card Tiers Badges [🔥 Epics], [⭐ Big Time], [💎 Show Time], [⚡ Highlights] */}
              <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mt-2.5 text-center">
                <div className="p-1 rounded-lg bg-amber-950/30 border border-amber-500/40 overflow-hidden">
                  <span className="block text-[8px] uppercase font-black text-amber-400 truncate">🔥 Epics</span>
                  <span className="text-xs font-black text-amber-200 font-mono block">{epics}</span>
                </div>
                <div className="p-1 rounded-lg bg-purple-950/30 border border-purple-500/40 overflow-hidden">
                  <span className="block text-[8px] uppercase font-black text-purple-400 truncate">⭐ BigTime</span>
                  <span className="text-xs font-black text-purple-200 font-mono block">{bigTime}</span>
                </div>
                <div className="p-1 rounded-lg bg-sky-950/30 border border-sky-500/40 overflow-hidden">
                  <span className="block text-[8px] uppercase font-black text-sky-400 truncate">💎 ShowTime</span>
                  <span className="text-xs font-black text-sky-200 font-mono block">{showTime}</span>
                </div>
                <div className="p-1 rounded-lg bg-emerald-950/30 border border-emerald-500/40 overflow-hidden">
                  <span className="block text-[8px] uppercase font-black text-emerald-400 truncate">⚡ Highl.</span>
                  <span className="text-xs font-black text-emerald-200 font-mono block">{highlights}</span>
                </div>
              </div>

              {/* Account Binding & Security Status Box (Critical for Buyer Trust) */}
              <div className="mt-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] space-y-1">
                <div className="flex items-center justify-between gap-1.5 text-slate-300">
                  <span className="flex items-center gap-1 shrink-0 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-[#22C55E] shrink-0" />
                    <span>Konami ID:</span>
                  </span>
                  <span className="font-semibold text-emerald-400 truncate text-right">
                    Ready (Changeable)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1.5 text-slate-300">
                  <span className="flex items-center gap-1 shrink-0 font-medium">
                    <Lock className="w-3 h-3 text-[#22C55E] shrink-0" />
                    <span>Google Play:</span>
                  </span>
                  <span className="font-semibold text-emerald-400 truncate text-right">
                    100% Unlinked (Clean)
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Reputation & Price Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  {listing.seller?.username ? listing.seller.username.slice(0, 2).toUpperCase() : "EF"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {listing.seller?.username || "Platform Seller"}
                    </span>
                    <VerifiedSellerBadge seller={listing.seller} size="sm" showPopover={false} />
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {(listing.seller?.completed_sales_count || 0) > 0
                      ? `${listing.seller?.completed_sales_count} sales`
                      : "Verified Trader"}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end text-[10px] text-emerald-400 font-bold uppercase">
                  {isFlashDrop ? (
                    <>
                      <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      <span className="text-amber-300 font-bold">Flash Price</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-[#22C55E] shrink-0" />
                      <span>Escrow</span>
                    </>
                  )}
                </div>
                <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block">
                  {formatCurrency(listing.price, listing.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Inspector Modal */}
      <SquadInspectorModal
        listing={listing}
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />
    </>
  );
}
