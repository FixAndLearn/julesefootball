import { ListingFilters } from "@/components/marketplace/ListingFilters";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { AdBanner } from "@/components/common/AdBanner";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { Listing, Platform, Playstyle } from "@/types/database";
import { ShieldCheck, Sparkles, CheckCircle2, Lock, Search } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Browse Verified eFootball Accounts | eFootballMarket Kenya",
  description:
    "Explore verified eFootball (PES) accounts in Kenya. Filter by OVR team strength, Epic cards, Coin balance, and division with automated M-Pesa escrow protection.",
};

interface BrowsePageProps {
  searchParams: {
    search?: string;
    platform?: Platform | "all";
    minStrength?: string;
    minCoins?: string;
    manager?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: "newest" | "price_asc" | "price_desc" | "strength_desc" | "coins_desc" | "views";
    page?: string;
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const supabase = createServerSupabaseClient();
  const listingService = new ListingService(supabase);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const filters = {
    search: searchParams.search,
    platform: searchParams.platform,
    minStrength: searchParams.minStrength ? Number(searchParams.minStrength) : undefined,
    minCoins: searchParams.minCoins ? Number(searchParams.minCoins) : undefined,
    manager: searchParams.manager,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sortBy: searchParams.sortBy,
    limit: 24,
  };

  let listings: Listing[] = [];
  let totalCount = 0;
  let hasSearchError = false;

  try {
    const result = await listingService.getListings(filters);
    listings = result.listings;
    totalCount = result.totalCount;
  } catch (error) {
    console.error("Browse page search error:", error);
    hasSearchError = true;
  }

  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      
      {/* Institutional Healthline-Style Trust Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-pitch-surface/90 border border-pitch-border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Browse eFootball Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Showing <span className="text-emerald-300 font-semibold">{totalCount}</span> verified live listings | Inspected before payout
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 relative z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pitch-card border border-pitch-border">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Konami 2FA</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pitch-card border border-pitch-border">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero Unverified Claims</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 sticky top-20">
          <ListingFilters />
        </div>

        {/* Listings Grid with Active Filter Badges */}
        <div className="lg:col-span-3 space-y-6">
          {hasSearchError && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200">
              <span>Temporary database latency. Some listings may take a moment to appear.</span>
              <Link href="/browse" className="underline font-bold text-amber-300 ml-2 shrink-0">
                Reload
              </Link>
            </div>
          )}
          {(searchParams.search ||
            (searchParams.platform && searchParams.platform !== "all") ||
            searchParams.minStrength ||
            searchParams.minCoins ||
            searchParams.manager ||
            searchParams.minPrice ||
            searchParams.maxPrice ||
            (searchParams.sortBy && searchParams.sortBy !== "newest")) && (
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-pitch-surface/90 border border-pitch-border animate-in fade-in">
              <span className="text-xs text-slate-400 font-semibold">Active Filters:</span>
              {searchParams.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-pitch-card border border-pitch-border text-xs text-slate-200">
                  Search: "{searchParams.search}"
                </span>
              )}
              {searchParams.minStrength && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-xs text-amber-300 font-bold">
                  ⚡ {searchParams.minStrength}+ OVR
                </span>
              )}
              {searchParams.platform && searchParams.platform !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-pitch-card border border-pitch-border text-xs text-slate-200 capitalize">
                  {searchParams.platform.replace(/_/g, " ")}
                </span>
              )}
              {searchParams.minCoins && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium">
                  🪙 {Number(searchParams.minCoins).toLocaleString()}+ Coins
                </span>
              )}
              {searchParams.manager && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-pitch-card border border-pitch-border text-xs text-slate-200">
                  Coach: {searchParams.manager}
                </span>
              )}
              {(searchParams.minPrice || searchParams.maxPrice) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-pitch-card border border-pitch-border text-xs text-slate-200">
                  KES {searchParams.minPrice || "0"} - {searchParams.maxPrice || "Any"}
                </span>
              )}
              {searchParams.sortBy && searchParams.sortBy !== "newest" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300">
                  Sorted: {searchParams.sortBy.replace("_", " ")}
                </span>
              )}
              <Link
                href="/browse"
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline ml-auto"
              >
                Clear All
              </Link>
            </div>
          )}

          <ListingGrid listings={listings} filters={filters} />

          {/* AdSense Certified Slot */}
          <div className="pt-6">
            <AdBanner slot="browse_bottom_feed" format="horizontal" />
          </div>
        </div>
      </div>
    </div>
  );
}
