"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/database";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import { HeroBall3D } from "@/components/3d/HeroBall3D";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Trophy,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface HeroDesktopSpotlightProps {
  listings: Listing[];
}

export function HeroDesktopSpotlight({ listings }: HeroDesktopSpotlightProps) {
  const [activeTab, setActiveTab] = useState<"live" | "3d">("live");
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const topListings = listings.slice(0, 2);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Desktop Advantage Header & Tab Switcher */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Live Escrow Market
          </span>
          <span className="hidden sm:inline-block text-[10px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 font-medium">
            Zero-Scroll View
          </span>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex items-center p-1 rounded-xl bg-pitch-card border border-pitch-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "live"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Squads</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("3d")}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "3d"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>3D Ball</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "3d" ? (
        <div className="w-full h-[400px] sm:h-[460px] flex items-center justify-center p-2 rounded-3xl bg-pitch-surface/70 border border-pitch-border/80 shadow-2xl backdrop-blur-xl">
          <HeroBall3D />
        </div>
      ) : (
        <div className="w-full">
          {topListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topListings.map((listing, idx) => {
                const primaryImage =
                  listing.images?.find((img) => img.is_primary)?.image_url ||
                  listing.images?.[0]?.image_url ||
                  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop";

                return (
                  <div
                    key={listing.id}
                    className="group relative rounded-2xl bg-pitch-surface/90 border border-pitch-border hover:border-amber-400/80 transition-all duration-300 p-3.5 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Status Strip */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                          Ready in Escrow
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-pitch-card px-2 py-0.5 rounded-md border border-pitch-border">
                        {getPlatformLabel(listing.platform)}
                      </span>
                    </div>

                    {/* Squad Image with OVR Floating Badge */}
                    <Link href={`/listings/${listing.id}`} className="block relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900">
                      <Image
                        src={primaryImage}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Floating OVR Rating Badge */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/80 border border-amber-500/50 backdrop-blur-md">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-black text-amber-300">
                          {listing.overall_team_strength || 3100} OVR
                        </span>
                      </div>

                      {listing.epic_players_count > 0 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-[10px] font-bold text-indigo-300 backdrop-blur-md">
                          {listing.epic_players_count} Epics
                        </div>
                      )}
                    </Link>

                    {/* Listing Title & Quick Stats */}
                    <div className="space-y-1 mb-3">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-sm font-bold text-slate-100 hover:text-amber-400 transition-colors line-clamp-1 font-display"
                      >
                        {listing.title}
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Div {listing.highest_division || 1} Highest</span>
                        {listing.coin_balance > 0 && (
                          <span>• {listing.coin_balance.toLocaleString()} Coins</span>
                        )}
                      </div>
                    </div>

                    {/* Price & Instant Checkout CTA */}
                    <div className="pt-2.5 border-t border-pitch-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">M-Pesa Escrow</span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {formatCurrency(listing.price)}
                        </span>
                      </div>
                      <Link href={`/listings/${listing.id}`}>
                        <Button
                          variant="gold"
                          size="sm"
                          className="text-xs font-bold px-3 py-1.5 h-auto shadow-md"
                        >
                          <span>Buy STK</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* If only 1 listing exists, show a companion "List Squad" quick card */}
              {topListings.length === 1 && (
                <div className="rounded-2xl bg-pitch-surface/60 border border-dashed border-pitch-border p-4 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sell Your Squad Here</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      Get instant M-Pesa payouts with zero chargeback risk.
                    </p>
                  </div>
                  <Link href="/seller/create-listing">
                    <Button variant="secondary" size="sm" className="text-xs font-semibold">
                      Publish Listing
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Fallback empty showcase card */
            <div className="rounded-3xl bg-pitch-surface/80 border border-pitch-border p-6 text-center space-y-4 shadow-2xl backdrop-blur-xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Verified Account Marketplace</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  Every account is backed by Safaricom Till 1572931 escrow. Funds release only after you verify full Konami ID access.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link href="/browse">
                  <Button variant="gold" size="sm" className="font-bold text-xs">
                    Browse All Accounts
                  </Button>
                </Link>
                <Link href="/seller/create-listing">
                  <Button variant="secondary" size="sm" className="text-xs font-semibold">
                    Sell Account
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Desktop Keyboard & Live Till Info Bar */}
          <div className="mt-3 py-2 px-3.5 rounded-xl bg-pitch-card/60 border border-pitch-border/60 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Escrow Till: <strong className="text-slate-200">1572931</strong> (Brian Okibo)</span>
            </div>
            <Link href="/browse" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              <span>View All Listings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
