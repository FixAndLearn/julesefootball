import { ListingCard } from "@/components/marketplace/ListingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AnalyticsService } from "@/services/analyticsService";
import { ListingService } from "@/services/listingService";
import { ArrowRight, CheckCircle2, Lock, Search, ShieldCheck, Trophy, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";

import { Listing } from "@/types/database";

export const revalidate = 0; // Dynamic server-rendered for real DB metrics

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const listingService = new ListingService(supabase);
  const analyticsService = new AnalyticsService(supabase);

  // Parallel database queries
  let listings: Listing[] = [];
  let metrics = {
    totalListingsCount: 0,
    activeListingsCount: 0,
    completedOrdersCount: 0,
    totalVolumeKes: 0,
    verifiedSellersCount: 0,
  };

  try {
    const [listingsResult, metricsResult] = await Promise.all([
      listingService.getListings({ limit: 6, sortBy: "newest" }),
      analyticsService.getPlatformOverview(),
    ]);
    listings = listingsResult.listings;
    metrics = metricsResult;
  } catch (error) {
    console.error("Home page database fetch error:", error);
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-pitch-border/60 bg-gradient-to-b from-pitch via-pitch/95 to-[#090d16]">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-konami-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800/80 text-brand-300 text-xs font-semibold mb-6 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Non-Custodial Escrow & Instant M-Pesa Settlement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display max-w-4xl mx-auto leading-[1.15]">
            Trade High-OVR <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-konami-blue bg-clip-text text-transparent">eFootball Accounts</span> with Guaranteed Safety.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate peer-to-peer scams. Every account transfer is held in strict cryptographic escrow until you verify full Konami ID access.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form action="/browse" method="GET" className="relative flex items-center shadow-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Search by epic player, formation, division (e.g. Messi, 3100 OVR, 4-2-2-2)..."
                className="w-full pl-11 pr-32 py-3.5 rounded-xl bg-pitch-surface/90 border border-pitch-border text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 text-sm backdrop-blur-md"
              />
              <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                <Button type="submit" variant="primary" size="md">
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-400">Popular:</span>
              <Link href="/browse?platform=android" className="px-2.5 py-1 rounded-md bg-pitch-card border border-pitch-border text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
                Android
              </Link>
              <Link href="/browse?platform=ios" className="px-2.5 py-1 rounded-md bg-pitch-card border border-pitch-border text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
                iOS
              </Link>
              <Link href="/browse?minStrength=3100" className="px-2.5 py-1 rounded-md bg-pitch-card border border-pitch-border text-amber-300 hover:border-amber-500/60 transition-colors">
                3100+ OVR
              </Link>
              <Link href="/browse?playstyle=quick_counter" className="px-2.5 py-1 rounded-md bg-pitch-card border border-pitch-border text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
                Quick Counter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real Live Database Metrics Bar */}
      <section className="border-b border-pitch-border/60 bg-pitch-surface/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-bold font-display text-slate-100">
                {metrics.activeListingsCount}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                Active Listings
              </span>
            </div>
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-bold font-display text-emerald-400">
                {formatCurrency(metrics.totalVolumeKes)}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                Escrow Volume Handled
              </span>
            </div>
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-bold font-display text-indigo-400">
                {metrics.completedOrdersCount}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                Completed Deliveries
              </span>
            </div>
            <div className="p-3">
              <span className="block text-2xl sm:text-3xl font-bold font-display text-amber-400">
                {metrics.verifiedSellersCount}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                Verified KYC Sellers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Fresh Published Listings */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-brand-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              Verified Marketplace
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-display">
              Latest eFootball Accounts
            </h2>
          </div>
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            <span>Explore All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Database Listings or Real Empty State */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No listings available yet"
            description="Be the first verified seller to list an eFootball account on the platform with automated M-Pesa escrow protection."
            actionLabel="Publish First Listing"
            actionHref="/seller/create-listing"
          />
        )}
      </section>

      {/* How Escrow Works Section */}
      <section className="py-20 border-t border-pitch-border/60 bg-pitch-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-2 block">
              100% Guaranteed Protection
            </span>
            <h2 className="text-3xl font-bold text-white font-display">
              How eFootballMarket Escrow Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Money never transfers directly to the seller until you have verified full Konami ID access on your device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-pitch-surface/70 border border-pitch-border/80 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Buy Now via M-Pesa</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click Buy Now and approve the Safaricom M-Pesa STK Push directly on your phone handset.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-pitch-surface/70 border border-pitch-border/80 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Funds Locked in Escrow</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Payment is held by the platform. The seller is alerted to deliver the Konami ID credentials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-pitch-surface/70 border border-pitch-border/80 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Encrypted Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seller submits login email and password, which are encrypted via AES-256 and revealed to you.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-pitch-surface/70 border border-pitch-border/80 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Inspect & Release</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have a 24-hour window to inspect the squad and bind your own email before releasing funds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
