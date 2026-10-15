"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/database";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Trophy,
  ChevronRight,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeroDesktopSpotlightProps {
  listings: Listing[];
}

export function HeroDesktopSpotlight({ listings }: HeroDesktopSpotlightProps) {
  const topListings = listings.slice(0, 2);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Uniform Live Escrow Market Header */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Escrow-Eligible Listings
          </span>
        </div>
        <Link
          href="/browse"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
        >
          <span>Browse All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {topListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topListings.map((listing) => {
              const primaryImage =
                listing.images?.find((img) => img.is_primary)?.image_url ||
                listing.images?.[0]?.image_url;

              return (
                <div
                  key={listing.id}
                  className="group relative rounded-2xl bg-pitch-surface/90 border border-pitch-border hover:border-amber-400/80 transition-all duration-300 p-3.5 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Status Strip */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                        Escrow Eligible
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 bg-pitch-card px-2 py-0.5 rounded-md border border-pitch-border">
                      {getPlatformLabel(listing.platform)}
                    </span>
                  </div>

                  {/* Squad Image with OVR Floating Badge */}
                  <Link
                    href={`/listings/${listing.id}`}
                    className="block relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900"
                  >
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                        <Trophy className="w-10 h-10 stroke-[1.5] text-amber-400/80 mb-1" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">
                          Squad Preview
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Floating OVR Rating Badge */}
                    {listing.overall_team_strength > 0 && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/80 border border-amber-500/50 backdrop-blur-md">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-black text-amber-300">
                          {listing.overall_team_strength} OVR
                        </span>
                      </div>
                    )}

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
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      {listing.highest_division ? (
                        <span>Div {listing.highest_division} Highest</span>
                      ) : (
                        <span>Division Ranked</span>
                      )}
                      {listing.coin_balance > 0 && (
                        <>
                          <span className="text-slate-600">/</span>
                          <span>{listing.coin_balance.toLocaleString()} Coins</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price & Instant Checkout CTA */}
                  <div className="pt-2.5 border-t border-pitch-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Price (Escrow Protected)</span>
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
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <PlusCircle className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sell Your Account</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    Direct Safaricom M-Pesa payouts with escrow buyer protection.
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
          /* Uniform Clean Empty State Card - Zero Fake Data */
          <div className="rounded-3xl bg-pitch-surface/80 border border-pitch-border p-6 text-center space-y-4 shadow-xl backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                M-Pesa Escrow Marketplace
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                All accounts are traded under Safaricom Till 1572931 escrow. Payment is held safely until you verify full Konami ID access.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/browse">
                <Button variant="gold" size="sm" className="font-bold text-xs">
                  Browse Accounts
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

        {/* Live Escrow Till Banner */}
        <div className="mt-3 py-2 px-3.5 rounded-xl bg-pitch-card/60 border border-pitch-border/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Escrow Till: <strong className="text-slate-200">1572931</strong> (Brian Okibo)</span>
          </div>
          <Link href="/middleman" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
            <span>Middleman Escrow</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
