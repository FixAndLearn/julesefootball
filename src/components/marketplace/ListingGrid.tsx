import React from "react";
import Link from "next/link";
import { Listing } from "@/types/database";
import { SearchX, Zap, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "./ListingCard";

export interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
}

export function ListingGrid({ listings, isLoading = false }: ListingGridProps) {
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

  if (listings.length === 0) {
    return (
      <div className="space-y-6">
        {/* Main Empty State Box */}
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
