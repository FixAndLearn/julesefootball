import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AnalyticsService } from "@/services/analyticsService";
import { ListingService } from "@/services/listingService";
import { NewsService } from "@/services/newsService";
import { TournamentService } from "@/services/tournamentService";
import { Listing, NewsArticle, Tournament } from "@/types/database";
import {
  ArrowRight,
  ExternalLink,
  Handshake,
  MessageCircle,
  Newspaper,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { HeroDesktopSpotlight } from "@/components/marketplace/HeroDesktopSpotlight";
import { RealtimeHomeListings } from "@/components/marketplace/RealtimeHomeListings";
import { EscrowSteps3D } from "@/components/3d/EscrowSteps3D";

export const revalidate = 0; // Dynamic server-rendered for real DB metrics and live marketplace listings

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const listingService = new ListingService(supabase);
  const analyticsService = new AnalyticsService(supabase);
  const newsService = new NewsService(supabase);

  // Parallel database queries
  let listings: Listing[] = [];
  let metrics = {
    totalListingsCount: 0,
    activeListingsCount: 0,
    completedOrdersCount: 0,
    totalVolumeKes: 0,
    verifiedSellersCount: 0,
  };
  let tournaments: Tournament[] = [];
  let articles: NewsArticle[] = [];

  try {
    const [listingsResult, metricsResult, tourneysResult, articlesResult] = await Promise.all([
      listingService.getListings({ limit: 8, sortBy: "newest" }).catch(() => ({ listings: [], total: 0 })),
      analyticsService.getPlatformOverview().catch(() => ({
        totalListingsCount: 0,
        activeListingsCount: 0,
        completedOrdersCount: 0,
        totalVolumeKes: 0,
        verifiedSellersCount: 0,
      })),
      TournamentService.getAllTournaments().catch(() => []),
      newsService.getPublishedArticles().catch(() => []),
    ]);

    listings = listingsResult.listings || [];
    metrics = metricsResult;
    tournaments = tourneysResult || [];
    articles = (articlesResult || []).slice(0, 3);
  } catch (error) {
    console.error("Home page database fetch error:", error);
  }

  return (
    <div className="flex flex-col w-full overflow-hidden bg-[#0B1220] text-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-[#1F2937] bg-gradient-to-b from-[#0B1220] via-[#0B1220]/95 to-[#090d16]">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[350px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Hero Left Column (Copy, Search & CTAs) */}
            <div className="lg:col-span-6 xl:col-span-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-xs font-semibold mb-6 shadow-inner backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span className="text-[#94A3B8]">Safe M-Pesa Escrow (Till 1572931)</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F8FAFC] font-display leading-[1.12]">
                Buy & Sell Verified <span className="bg-gradient-to-r from-[#FBBF24] via-emerald-300 to-[#22C55E] bg-clip-text text-transparent">eFootball Accounts</span> Safely.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Kenya&apos;s #1 trusted eFootball escrow marketplace & competitive community. Every trade is protected by automated M-Pesa escrow until you verify squad credentials on your device.
              </p>

              {/* Quick Search Bar */}
              <div className="mt-8 max-w-2xl mx-auto lg:mx-0">
                <form action="/browse" method="GET" className="relative flex items-center shadow-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search epic player, playstyle, OVR (e.g. Messi, 3200)..."
                    className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-[#111827] border border-[#1F2937] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#22C55E] text-sm backdrop-blur-md shadow-inner"
                  />
                  <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                    <Button type="submit" variant="primary" size="md" className="bg-[#22C55E] text-[#0B1220] hover:bg-[#16a34a] font-bold text-xs px-4">
                      Search
                    </Button>
                  </div>
                </form>

                {/* Quick Filter Tags */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4 text-xs">
                  <span className="text-[#94A3B8]">Popular:</span>
                  <Link href="/browse?platform=android" className="px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-slate-500 transition-colors">
                    Android
                  </Link>
                  <Link href="/browse?platform=ios" className="px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-slate-500 transition-colors">
                    iOS
                  </Link>
                  <Link href="/browse?minStrength=3200" className="px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F2937] text-[#FBBF24] hover:border-[#FBBF24]/60 transition-colors font-semibold">
                    3200+ OVR
                  </Link>
                  <Link href="/browse?playstyle=quick_counter" className="px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F2937] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-slate-500 transition-colors">
                    Quick Counter
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link href="/browse">
                  <Button variant="primary" size="lg" className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold px-6 shadow-md">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Browse Accounts
                  </Button>
                </Link>
                <Link href="/seller/create-listing">
                  <Button variant="secondary" size="lg" className="bg-[#111827] border border-[#1F2937] text-[#F8FAFC] hover:bg-[#1F2937] font-semibold px-6">
                    Sell Account
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button variant="secondary" size="lg" className="bg-[#111827] border border-[#1F2937] text-[#FBBF24] hover:bg-[#1F2937] font-semibold px-5">
                    <Trophy className="w-4 h-4 mr-2 text-[#FBBF24]" />
                    Tournaments
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Right Column (Verified Escrow Listings Deck) */}
            <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center w-full">
              <HeroDesktopSpotlight listings={listings} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Real Live Database Metrics Bar */}
      <section className="border-b border-[#1F2937] bg-[#111827]/60 py-6 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-slate-500/80 transition-all shadow-md">
              <span className="block text-2xl sm:text-3xl font-extrabold font-display text-[#F8FAFC]">
                {metrics.activeListingsCount}
              </span>
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
                Active Listings
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-emerald-500/50 transition-all shadow-md">
              <span className="block text-2xl sm:text-3xl font-extrabold font-display text-[#22C55E]">
                {formatCurrency(metrics.totalVolumeKes)}
              </span>
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
                Escrow Volume Handled
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-indigo-500/50 transition-all shadow-md">
              <span className="block text-2xl sm:text-3xl font-extrabold font-display text-indigo-400">
                {metrics.completedOrdersCount}
              </span>
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
                Completed Deliveries
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-amber-500/50 transition-all shadow-md">
              <span className="block text-2xl sm:text-3xl font-extrabold font-display text-[#FBBF24]">
                {metrics.verifiedSellersCount}
              </span>
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
                Verified Sellers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Realtime Live Listings Feed */}
      <RealtimeHomeListings initialListings={listings} />

      {/* 4. Escrow Protection Stepper (3D Interactive) */}
      <EscrowSteps3D />

      {/* 5. Tournaments & Cups Section */}
      <section className="py-16 md:py-20 border-b border-[#1F2937] bg-[#0B1220] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FBBF24] uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>Competitive eFootball</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                Kenyan Tournaments & Cups
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Participate in organized 1v1 knockout cups, submit verified scores, and climb local rankings.
              </p>
            </div>
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:underline shrink-0"
            >
              <span>View All Tournaments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-8 text-center">
              <Trophy className="w-10 h-10 text-[#94A3B8] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-[#F8FAFC]">No active tournaments right now</h3>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-md mx-auto">
                Check back soon or join the WhatsApp player community to get notified when the next cup registrations open.
              </p>
              <Link
                href="/tournaments"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F2937] border border-[#374151] text-xs font-semibold text-[#F8FAFC] hover:bg-[#374151] transition-all"
              >
                <span>View Tournament Hub</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tournaments.slice(0, 3).map((tournament) => (
                <div
                  key={tournament.id}
                  className="rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#FBBF24]/60 transition-all p-5 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1F2937] text-[#FBBF24] border border-[#FBBF24]/30">
                        {tournament.status.replace("_", " ")}
                      </span>
                      <span className="text-xs font-bold text-[#22C55E]">
                        {tournament.prize_pool_kes ? formatCurrency(tournament.prize_pool_kes) : "Prize Pool"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F8FAFC] line-clamp-1 mb-1.5">
                      {tournament.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {tournament.description || "Official Kenyan eFootball knockout cup."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#1F2937] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>
                        {tournament.registered_count || 0} / {tournament.max_players || 32} Players
                      </span>
                    </div>
                    <Link
                      href={`/tournaments/${tournament.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#22C55E] hover:underline"
                    >
                      <span>Enter Cup</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Community News & Scammer Alerts Section */}
      <section className="py-16 md:py-20 border-b border-[#1F2937] bg-[#090d16] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-2">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Community Bulletin</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                News & Scammer Alerts
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Verified game notices, market guidelines, and community scammer warnings.
              </p>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:underline shrink-0"
            >
              <span>Read All News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-8 text-center">
              <Newspaper className="w-10 h-10 text-[#94A3B8] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-[#F8FAFC]">No published alerts yet</h3>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-md mx-auto">
                Articles and verified warnings will appear here when published by the administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {articles.map((article) => {
                const isAlert = article.category === "scammer_alert";
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-slate-500 p-5 flex flex-col justify-between transition-all shadow-md group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isAlert
                              ? "bg-rose-950/70 text-rose-300 border border-rose-800/60"
                              : "bg-[#1F2937] text-[#94A3B8] border border-[#374151]"
                          }`}
                        >
                          {isAlert ? "Scammer Alert" : article.category?.replace("_", " ") || "Update"}
                        </span>
                        <span className="text-[11px] text-[#94A3B8]">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#22C55E] transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs font-medium text-[#94A3B8]">
                      <span>Read article</span>
                      <ArrowRight className="w-3 h-3 text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 7. Middleman Escrow & WhatsApp Community Banner */}
      <section className="py-12 md:py-16 bg-[#111827]/60 border-b border-[#1F2937] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#111827] via-[#161F30] to-[#111827] border border-[#1F2937] p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-3">
                  <Handshake className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Bring-Your-Own-Deal Middleman</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] font-display">
                  Trading outside on WhatsApp or Facebook? Don&apos;t get scammed.
                </h3>
                <p className="text-sm text-[#94A3B8] mt-2 max-w-2xl leading-relaxed">
                  Use our automated Lipa Na M-Pesa Middleman Escrow. We lock the buyer&apos;s money in Till 1572931, verify credentials, and only disburse payout after the squad is confirmed.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <Link href="/middleman" className="w-full">
                  <Button variant="primary" size="md" className="w-full bg-[#22C55E] text-[#0B1220] hover:bg-[#16a34a] font-bold text-xs py-3">
                    <Handshake className="w-4 h-4 mr-2" />
                    Start Middleman Escrow
                  </Button>
                </Link>
                <a
                  href="https://wa.me/254794400365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="secondary" size="md" className="w-full bg-[#1F2937] border border-[#374151] hover:border-slate-400 text-[#F8FAFC] text-xs py-3 font-semibold">
                    <MessageCircle className="w-4 h-4 mr-2 text-[#22C55E]" />
                    WhatsApp: 0794400365
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Independent Platform & Konami Terms Compliance Notice */}
      <section className="py-8 bg-[#0B1220] relative z-10 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-5 leading-relaxed">
            <p className="font-semibold text-[#F8FAFC] mb-1">
              Independent Community Notice & Konami Terms Advisory:
            </p>
            <p className="text-[#94A3B8]">
              eFootballMarket is an independent community escrow intermediary and is not affiliated with, endorsed by, or sponsored by Konami Digital Entertainment. Konami’s current rules prohibit selling or transferring eFootball accounts and sharing account IDs or passwords. Trading may result in loss of account access or support.{" "}
              <a
                href="https://www.konami.com/efootball/en-us/topic/news/5174"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#22C55E] hover:underline font-medium inline-flex items-center gap-0.5"
              >
                Read Konami’s official notice <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
