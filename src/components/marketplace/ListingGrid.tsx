"use client";

import React from "react";
import Link from "next/link";
import { Listing } from "@/types/database";
import { SearchX, Zap, Sparkles, ArrowRight, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "./ListingCard";
import { AdBanner } from "@/components/common/AdBanner";
import { useRealtimeListings } from "@/hooks/useRealtimeListings";
import { formatCurrency } from "@/lib/utils";

export interface ListingGridProps {
  listings: Listing[];
  filters?: {
    search?: string;
    platform?: string;
    playstyle?: string;
    minStrength?: number;
    minCoins?: number;
    minEpics?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  };
  isLoading?: boolean;
}

export function ListingGrid({ listings: initialListings, filters, isLoading = false }: ListingGridProps) {
  const { listings, newListingAlert, dismissAlert, isLiveConnected } = useRealtimeListings({
    initialListings,
    filters,
    limit: 24,
    autoRefreshIntervalMs: 6000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-pitch-surface/60 border border-pitch-border rounded-2xl p-4 animate-pulse space-y-4"
          >
            <div className="aspect-[16/10] bg-slate-800 rounded-xl" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-10 bg-slate-800/60 rounded-xl" />
            <div className="h-6 bg-slate-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Realtime Live Pulse & Count Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-medium text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Feed | Realtime Updates</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-slate-200">{listings.length}</strong> active squad{listings.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Realtime New Listing Pop-in Alert */}
      {newListingAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-pitch-card to-amber-950/80 border border-amber-500/50 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                  New Listing Just Published
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Just now</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                {newListingAlert.title}
              </p>
              <p className="text-xs font-semibold text-emerald-400">
                {formatCurrency(newListingAlert.price)} | {newListingAlert.overall_team_strength} OVR
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

      {/* Main Empty State Box */}
      {listings.length === 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-pitch-border/60 bg-pitch-surface/40 backdrop-blur-sm shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
              <SearchX className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-100 mb-2 font-display">
              No Squads Match Your Exact Filters
            </h3>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              No accounts currently meet all selected parameters. Try widening your filters or jump straight to popular live squads:
            </p>

            {/* Quick-Preset Recovery Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mb-4">
              <Link
                href="/browse?minStrength=3150"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pitch-card hover:bg-pitch-surface border border-amber-500/40 text-xs font-semibold text-amber-300 hover:border-amber-400 transition-all shadow-sm active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>3150+ OVR (Elite)</span>
              </Link>

              <Link
                href="/browse?minEpics=5"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pitch-card hover:bg-pitch-surface border border-yellow-500/40 text-xs font-semibold text-yellow-300 hover:border-yellow-400 transition-all shadow-sm active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>5+ Epics Loaded</span>
              </Link>

              <Link
                href="/browse?maxPrice=2500"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pitch-card hover:bg-pitch-surface border border-emerald-500/40 text-xs font-semibold text-emerald-300 hover:border-emerald-400 transition-all shadow-sm active:scale-95"
              >
                <span>Under KES 2,500</span>
              </Link>

              <Link
                href="/browse?platform=android"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pitch-card hover:bg-pitch-surface border border-pitch-border text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <span>Android Mobile</span>
              </Link>

              <Link
                href="/browse?platform=ios"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pitch-card hover:bg-pitch-surface border border-pitch-border text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <span>iOS Mobile</span>
              </Link>

              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white transition-all shadow-md active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </Link>
            </div>
          </div>

          {/* Wanted Board Recovery Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-pitch-surface to-slate-900 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 text-left">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Custom Squad Finder
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                Can't find your specific dream squad?
              </h4>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Post the key players you want (e.g. Rummenigge, Vieira, 2015 Messi, Gullit) on the Wanted Board. Verified sellers will be alerted to fulfill your request under M-Pesa Till Escrow.
              </p>
            </div>
            <Link href="/wanted" className="shrink-0 w-full sm:w-auto">
              <Button variant="gold" size="md" className="w-full sm:w-auto shadow-lg shadow-amber-500/10">
                Post Wanted Request
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {listings.map((listing, index) => (
            <React.Fragment key={listing.id}>
              <div className="transition-all duration-300 animate-in fade-in zoom-in-95">
                <ListingCard listing={listing} />
              </div>
              {/* Native In-Feed Ad Unit at 6th card */}
              {index === 5 && listings.length > 6 && (
                <div className="col-span-full my-2">
                  <AdBanner slot="browse_in_feed_grid" format="in-feed" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
