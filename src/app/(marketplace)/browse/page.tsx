import { ListingFilters } from "@/components/marketplace/ListingFilters";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { Listing, Platform, Playstyle } from "@/types/database";
import { ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

interface BrowsePageProps {
  searchParams: {
    search?: string;
    platform?: Platform | "all";
    playstyle?: Playstyle | "all";
    minStrength?: string;
    minCoins?: string;
    minEpics?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: "newest" | "price_asc" | "price_desc" | "strength_desc" | "views";
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
    playstyle: searchParams.playstyle,
    minStrength: searchParams.minStrength ? Number(searchParams.minStrength) : undefined,
    minCoins: searchParams.minCoins ? Number(searchParams.minCoins) : undefined,
    minEpics: searchParams.minEpics ? Number(searchParams.minEpics) : undefined,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sortBy: searchParams.sortBy,
    limit: 24,
  };

  let listings: Listing[] = [];
  let totalCount = 0;

  try {
    const result = await listingService.getListings(filters);
    listings = result.listings;
    totalCount = result.totalCount;
  } catch (error) {
    console.error("Browse page search error:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Browse eFootball Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Showing <span className="text-slate-200 font-semibold">{totalCount}</span> verified live listings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 sticky top-20">
          <ListingFilters />
        </div>

        {/* Listings Grid with Active Filter Badges */}
        <div className="lg:col-span-3">
          {(searchParams.search || (searchParams.platform && searchParams.platform !== "all") || (searchParams.playstyle && searchParams.playstyle !== "all") || searchParams.minStrength) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 rounded-xl bg-pitch-card/60 border border-pitch-border/60">
              <span className="text-xs text-slate-400 font-semibold">Active:</span>
              {searchParams.search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pitch-surface border border-pitch-border text-xs text-slate-200">
                  Keyword: "{searchParams.search}"
                </span>
              )}
              {searchParams.platform && searchParams.platform !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pitch-surface border border-pitch-border text-xs text-slate-200 capitalize">
                  {searchParams.platform}
                </span>
              )}
              {searchParams.minStrength && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pitch-surface border border-amber-500/40 text-xs text-amber-300 font-bold">
                  {searchParams.minStrength}+ OVR
                </span>
              )}
              {searchParams.playstyle && searchParams.playstyle !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pitch-surface border border-pitch-border text-xs text-slate-200 capitalize">
                  {searchParams.playstyle.replace("_", " ")}
                </span>
              )}
              <Link
                href="/browse"
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline ml-auto"
              >
                Reset Filters
              </Link>
            </div>
          )}
          <ListingGrid listings={listings} />
        </div>
      </div>
    </div>
  );
}
