"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { VerifiedSellerBadge } from "@/components/marketplace/VerifiedSellerBadge";
import { formatCompactNumber, formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { ShieldCheck, Star, Trophy, Users, Zap, MessageCircle } from "lucide-react";

export interface ListingCard3DProps {
  listing: Listing;
  featured?: boolean;
}

export function ListingCard3D({ listing, featured = false }: ListingCard3DProps) {
  const primaryImage =
    listing.images?.find((img) => img.is_primary)?.image_url || listing.images?.[0]?.image_url;

  const isEliteStrength = (listing.overall_team_strength || 0) >= 3150;
  const isCompetitiveStrength = (listing.overall_team_strength || 0) >= 3100 && !isEliteStrength;
  const isDivisionOne = Number(listing.current_division) === 1;
  const hasBigTime = (listing.big_time_players_count || 0) > 0;

  return (
    <div className="w-full h-full">
      <Link
        href={`/listings/${listing.id}`}
        className={`group block bg-pitch-surface/90 border rounded-2xl overflow-hidden relative flex flex-col h-full justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
          featured
            ? "border-amber-500/70 shadow-2xl shadow-amber-500/10 hover:border-amber-400"
            : isEliteStrength
            ? "border-amber-500/50 shadow-xl shadow-amber-500/10 hover:border-amber-400 hover:shadow-amber-500/20"
            : "border-pitch-border hover:border-brand-500/80 shadow-xl shadow-black/40 hover:shadow-brand-500/10"
        }`}
      >
        {/* Subtle CSS hover edge gradient sheen */}
        <div
          className={`absolute -inset-px rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 ${
            isEliteStrength
              ? "bg-gradient-to-r from-amber-500/25 via-yellow-400/30 to-brand-500/20"
              : "bg-gradient-to-r from-brand-500/15 via-amber-400/20 to-sky-400/15"
          }`}
        />

        {/* Media Header / Image */}
        <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
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

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-20">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="brand" size="sm" className="font-semibold shadow-xl backdrop-blur-md">
                {getPlatformLabel(listing.platform)}
              </Badge>
              {listing.allows_swap && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-[10px] font-bold text-emerald-300 shadow-md">
                  🔁 Swap Welcome
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {isEliteStrength ? (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/35 via-yellow-400/30 to-amber-600/35 backdrop-blur-md border border-amber-400 text-[11px] font-black text-amber-200 shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/50">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
                  <span>{listing.overall_team_strength} OVR</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/30 text-amber-100 font-black uppercase tracking-wider">
                    Elite
                  </span>
                </div>
              ) : isCompetitiveStrength ? (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/90 backdrop-blur-md border border-emerald-500/70 text-[11px] font-black text-emerald-300 shadow-md shadow-emerald-500/20">
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>{listing.overall_team_strength} OVR</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-bold text-slate-200 shadow-md">
                  <Zap className="w-3 h-3 text-slate-400" />
                  <span>{listing.overall_team_strength} OVR</span>
                </div>
              )}

              {isDivisionOne ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-950/90 to-yellow-950/80 backdrop-blur-md border border-amber-500/70 text-[11px] font-black text-amber-300 shadow-md shadow-amber-500/20">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>Div 1</span>
                </div>
              ) : (
                <div className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-slate-200 shadow-md">
                  Div {listing.current_division || 1}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Playstyle Chip & WhatsApp Share */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between z-20">
            <span className="text-[11px] font-medium text-slate-200 bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-slate-700/80 shadow-md pointer-events-none">
              {getPlaystyleLabel(listing.primary_playstyle)}
            </span>
            <div className="flex items-center gap-1.5">
              {listing.images && listing.images.length > 1 && (
                <span className="text-[10px] font-semibold text-slate-200 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1 pointer-events-none">
                  📷 {listing.images.length} photos
                </span>
              )}
              <button
                type="button"
                title="Share to WhatsApp Group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const origin =
                    typeof window !== "undefined"
                      ? window.location.origin
                      : "https://www.efootballmarket.co.ke";
                  const text = `⚽ *[OVR ${listing.overall_team_strength}]* ${listing.title} for ${formatCurrency(
                    listing.price,
                    listing.currency
                  )} on eFootballMarket.\n🛡️ Escrow Protected via M-Pesa: ${origin}/listings/${listing.id}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="p-1 rounded-md bg-emerald-950/90 hover:bg-emerald-700 text-emerald-300 hover:text-white border border-emerald-500/60 shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-base line-clamp-1 group-hover:text-brand-300 transition-colors">
              {listing.title}
            </h3>

            {/* Key Players Spotlight Pills */}
            {listing.key_players_list && listing.key_players_list.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {listing.key_players_list.slice(0, 3).map((player, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200 truncate max-w-[110px]"
                  >
                    ★ {player}
                  </span>
                ))}
                {listing.key_players_list.length > 3 && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    +{listing.key_players_list.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Special Cards Highlights */}
            {hasBigTime ? (
              <div className="grid grid-cols-4 gap-1.5 mt-3 p-1.5 rounded-xl bg-pitch-card/90 border border-pitch-border/60 text-center shadow-inner">
                <div className="p-1 rounded-lg bg-amber-950/30 border border-amber-500/40">
                  <span className="block text-[9px] uppercase font-black bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                    Epics
                  </span>
                  <span className="text-xs font-black text-amber-200">{listing.epic_players_count}</span>
                </div>
                <div className="p-1 rounded-lg bg-purple-950/30 border border-purple-500/40">
                  <span className="block text-[9px] uppercase font-black bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                    Big Time
                  </span>
                  <span className="text-xs font-black text-purple-200">{listing.big_time_players_count}</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-900/60 border border-slate-700/50">
                  <span className="block text-[9px] uppercase font-bold text-sky-400">Coins</span>
                  <span className="text-xs font-bold text-slate-100">
                    {formatCompactNumber(listing.coin_balance)}
                  </span>
                </div>
                <div className="p-1 rounded-lg bg-slate-900/60 border border-slate-700/50">
                  <span className="block text-[9px] uppercase font-bold text-emerald-400">GP</span>
                  <span className="text-xs font-bold text-slate-100">
                    {formatCompactNumber(listing.gp_balance)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-pitch-card/90 border border-pitch-border/60 text-center shadow-inner">
                <div className="p-1 rounded-lg bg-amber-950/30 border border-amber-500/40">
                  <span className="block text-[10px] uppercase font-black bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                    Epics
                  </span>
                  <span className="text-xs font-black text-amber-200">{listing.epic_players_count}</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-900/60 border border-slate-700/50">
                  <span className="block text-[10px] uppercase font-bold text-sky-400">Coins</span>
                  <span className="text-xs font-semibold text-slate-100">
                    {formatCompactNumber(listing.coin_balance)}
                  </span>
                </div>
                <div className="p-1 rounded-lg bg-slate-900/60 border border-slate-700/50">
                  <span className="block text-[10px] uppercase font-bold text-emerald-400">GP</span>
                  <span className="text-xs font-semibold text-slate-100">
                    {formatCompactNumber(listing.gp_balance)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Seller Info & Price Footer */}
          <div className="mt-4 pt-3 border-t border-pitch-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-sm">
                {listing.seller?.username ? (
                  listing.seller.username.slice(0, 2).toUpperCase()
                ) : (
                  <Users className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium text-slate-300">
                    {listing.seller?.username || "Verified Seller"}
                  </span>
                  <VerifiedSellerBadge seller={listing.seller} size="sm" showPopover={true} />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  {(listing.seller?.completed_sales_count || 0) > 0 && listing.seller?.seller_rating ? (
                    <>
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span>{Number(listing.seller.seller_rating).toFixed(1)}</span>
                      <span>({listing.seller.completed_sales_count} sales)</span>
                    </>
                  ) : (
                    <span>New Seller (0 sales)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">M-Pesa Escrow</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">
                {formatCurrency(listing.price, listing.currency)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
