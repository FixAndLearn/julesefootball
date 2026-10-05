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

      {/* Contextual Auth Guidance for Unauthenticated Visitors */}
      {!user && (
        <div className="mb-6 p-4 rounded-2xl bg-pitch-surface border border-pitch-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Trading on eFootballMarket?
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Create a free account or log in to secure your purchases in automated M-Pesa escrow, chat with sellers, or publish your own squad.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login?redirect=/browse"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-pitch-card border border-pitch-border text-slate-200 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register?redirect=/browse"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-500 text-slate-950 hover:bg-brand-400 transition-colors shadow-md"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 sticky top-20">
          <ListingFilters />
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          <ListingGrid listings={listings} />
        </div>
      </div>
    </div>
  );
}
