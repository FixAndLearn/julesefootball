"use client";

import React from "react";
import Link from "next/link";
import { Listing } from "@/types/database";
import { ListingCard } from "./ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRealtimeListings } from "@/hooks/useRealtimeListings";
import { formatCurrency } from "@/lib/utils";
import {
  Zap,
  ArrowRight,
  Trophy,
  Sparkles,
  X,
  Radio,
  Clock,
} from "lucide-react";

export interface RealtimeHomeListingsProps {
  initialListings: Listing[];
}

export function RealtimeHomeListings({ initialListings }: RealtimeHomeListingsProps) {
  const { listings, newListingAlert, dismissAlert, isLiveConnected } = useRealtimeListings({
    initialListings,
    limit: 8,
    sortBy: "newest",
    autoRefreshIntervalMs: 6000,
  });

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
      {/* Header with Live Synced Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              Verified Marketplace
            </div>

            {/* Realtime Live Pulse Indicator */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 shadow-sm animate-in fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Feed • Realtime Updates</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
            Latest eFootball Accounts
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            New squads appear instantly without needing to refresh the page. Click any card to inspect stats and buy safely with automated M-Pesa escrow.
          </p>
        </div>

        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors shrink-0"
        >
          <span>Explore All Listings ({listings.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Realtime New Listing Pop-in Alert */}
      {newListingAlert && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-pitch-card to-amber-950/80 border border-amber-500/50 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                  New Listing Just Published
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Just now</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                {newListingAlert.title}
              </p>
              <p className="text-xs font-semibold text-emerald-400">
                {formatCurrency(newListingAlert.price)} • {newListingAlert.overall_team_strength} OVR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/listings/${newListingAlert.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
            >
              <span>View Squad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={dismissAlert}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Realtime Listings Grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="transition-all duration-300 animate-in fade-in zoom-in-95"
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Trophy}
          title="No listings available yet"
          description="Be the first verified seller to list an eFootball account on the platform with automated M-Pesa escrow protection. New postings appear instantly!"
          actionLabel="Publish First Listing"
          actionHref="/seller/create-listing"
        />
      )}
    </section>
  );
}
