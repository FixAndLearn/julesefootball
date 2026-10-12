import { ListingCard } from "@/components/marketplace/ListingCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AnalyticsService } from "@/services/analyticsService";
import { ListingService } from "@/services/listingService";
import { ArrowRight, Search, ShieldCheck, Trophy, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { Listing } from "@/types/database";

import { HeroDesktopSpotlight } from "@/components/marketplace/HeroDesktopSpotlight";
import { EscrowSteps3D } from "@/components/3d/EscrowSteps3D";
import { KonamiTransferChecklistTrigger } from "@/components/escrow/KonamiTransferChecklistModal";

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
      listingService.getListings({ limit: 8, sortBy: "newest" }),
      analyticsService.getPlatformOverview(),
    ]);
    listings = listingsResult.listings;
    metrics = metricsResult;
  } catch (error) {
    console.error("Home page database fetch error:", error);
  }

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 3D Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-pitch-border/60 bg-gradient-to-b from-pitch via-pitch/95 to-[#090d16]">
        {/* Subtle Background 3D Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-brand-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[350px] bg-konami-blue/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Hero Left Column (Copy & Search) */}
            <div className="lg:col-span-6 xl:col-span-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-800/80 text-brand-300 text-xs font-semibold mb-6 shadow-inner backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Safe M-Pesa Escrow (Till 1572931) & Instant Delivery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.12]">
                Buy & Sell Verified <span className="bg-gradient-to-r from-amber-400 via-sky-300 to-brand-400 bg-clip-text text-transparent">eFootball Accounts</span> Safely.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Zero scams. Your payment stays locked in M-Pesa escrow until you log into the Konami ID and verify the squad on your phone.
              </p>

              {/* Quick Search Bar */}
              <div className="mt-8 max-w-2xl mx-auto lg:mx-0">
                <form action="/browse" method="GET" className="relative flex items-center shadow-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search by epic player, formation, division (e.g. Messi, 3100 OVR, 4-2-2-2)..."
                    className="w-full pl-11 pr-32 py-3.5 rounded-xl bg-pitch-surface/90 border border-pitch-border text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 text-sm backdrop-blur-md shadow-inner"
                  />
                  <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                    <Button type="submit" variant="primary" size="md" className="btn-3d-brand font-bold">
                      Search
                    </Button>
                  </div>
                </form>

                {/* Quick Filter Tags */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4 text-xs">
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

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link href="/browse">
                  <Button variant="gold" size="lg" className="btn-3d-gold font-bold px-6">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Browse Accounts
                  </Button>
                </Link>
                <Link href="/seller/create-listing">
                  <Button variant="secondary" size="lg" className="border border-pitch-border hover:border-slate-400 font-semibold px-6">
                    Sell Account with Escrow
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Right Column (Live Desktop Deck or 3D Ball) */}
            <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center w-full">
              <HeroDesktopSpotlight listings={listings} />
            </div>
          </div>
        </div>
      </section>

      {/* Real Live Database Metrics Bar */}
      <section className="border-b border-pitch-border/60 bg-pitch-surface/60 py-6 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-pitch-card/50 border border-pitch-border/60 hover:border-slate-500/80 transition-all shadow-md">
              <span className="block text-2xl sm:text-3xl font-extrabold font-display text-slate-100">
                {metrics.activeListingsCount}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Active Listings
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-pitch-card/50 border border-pitch-border/60 hover:border-emerald-500/50 transition-all shadow-md">
              <span className="block text-2xl sm:text-3xl font-extrabold font-display text-emerald-400">
                {formatCurrency(metrics.totalVolumeKes)}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Escrow Volume Handled
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-pitch-card/50 border border-pitch-border/60 hover:border-indigo-500/50 transition-all shadow-md">
              <span className="block text-2xl sm:text-3xl font-extrabold font-display text-indigo-400">
                {metrics.completedOrdersCount}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Completed Deliveries
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-pitch-card/50 border border-pitch-border/60 hover:border-amber-500/50 transition-all shadow-md">
              <span className="block text-2xl sm:text-3xl font-extrabold font-display text-amber-400">
                {metrics.verifiedSellersCount}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Verified Sellers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Fresh Published Listings */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-amber-400 mb-1">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              Verified Listings
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
              Latest eFootball Accounts
            </h2>
            <p className="text-xs text-slate-400 mt-1">Click any card to inspect player stats, squad strength, and buy with instant M-Pesa escrow.</p>
          </div>
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            <span>Explore All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Database Listings or Real Empty State */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {/* 3D Escrow Protection Stepper & Interactive Transfer Checklist */}
      <section className="relative">
        <EscrowSteps3D />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-pitch-border/60 bg-[#070b12] text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-white">Need step-by-step transfer guidance?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Review our 6-step interactive Konami ID transfer checklist with 2FA and store-unlinking instructions.
            </p>
          </div>
          <KonamiTransferChecklistTrigger />
        </div>
      </section>
    </div>
  );
}
