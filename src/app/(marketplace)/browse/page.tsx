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
  let hasSearchError = false;

  try {
    const result = await listingService.getListings(filters);
    listings = result.listings;
    totalCount = result.totalCount;
  } catch (error) {
    console.error("Browse page search error:", error);
    hasSearchError = true;
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Verified eFootball Mobile Accounts Kenya",
    description: "Curated peer-to-peer eFootball accounts with M-Pesa escrow guarantee.",
    numberOfItems: listings.length,
    itemListElement: listings.map((l, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: l.title,
        url: `https://www.efootballmarket.co.ke/listings/${l.id}`,
        offers: {
          "@type": "Offer",
          price: l.price,
          priceCurrency: "KES",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Institutional Healthline-Style Trust Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-[11px] font-bold">
              Till 1572931 Escrow Protected
            </span>
            <span className="text-xs text-[#94A3B8]">24-Hour Inspection Guarantee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Browse eFootball Accounts
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Showing <span className="text-[#F8FAFC] font-semibold">{totalCount}</span> verified live listings | Inspected before payout
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1220] border border-[#1F2937]">
            <Lock className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Encrypted Konami 2FA</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1220] border border-[#1F2937]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FBBF24]" />
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
          {(searchParams.search || (searchParams.platform && searchParams.platform !== "all") || (searchParams.playstyle && searchParams.playstyle !== "all") || searchParams.minStrength) && (
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
              <span className="text-xs text-[#94A3B8] font-semibold">Active:</span>
              {searchParams.search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B1220] border border-[#1F2937] text-xs text-slate-200">
                  Keyword: "{searchParams.search}"
                </span>
              )}
              {searchParams.platform && searchParams.platform !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B1220] border border-[#1F2937] text-xs text-slate-200 capitalize">
                  {searchParams.platform}
                </span>
              )}
              {searchParams.minStrength && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B1220] border border-amber-500/40 text-xs text-[#FBBF24] font-bold">
                  {searchParams.minStrength}+ OVR
                </span>
              )}
              {searchParams.playstyle && searchParams.playstyle !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B1220] border border-[#1F2937] text-xs text-slate-200 capitalize">
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
