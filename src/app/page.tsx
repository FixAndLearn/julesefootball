import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AnalyticsService } from "@/services/analyticsService";
import { ListingService } from "@/services/listingService";
import { NewsService } from "@/services/newsService";
import { TournamentService } from "@/services/tournamentService";
import { Listing, NewsArticle, Tournament } from "@/types/database";
import { AdBanner } from "@/components/common/AdBanner";
import { HomeFaqAccordion } from "@/components/home/HomeFaqAccordion";
import { ListingCard3D } from "@/components/marketplace/ListingCard3D";
import { EscrowStepsVisualizer } from "@/components/home/EscrowStepsVisualizer";
import {
  ArrowRight,
  Handshake,
  MessageCircle,
  Newspaper,
  Phone,
  Search,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Dynamic server-rendered for real database metrics and live marketplace listings

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const listingService = new ListingService(supabase);
  const analyticsService = new AnalyticsService(supabase);
  const newsService = new NewsService(supabase);

  // Parallel database queries (strictly real data, zero demo data)
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
  } catch (err) {
    console.error("HomePage query error:", err);
  }

  return (
    <div className="relative min-h-screen bg-[#0B1220] text-[#F8FAFC]">
      {/* 1. HERO SECTION (Cyber-Pitch Stadium Atmosphere & High-Conversion CTAs) */}
      <section className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-24 border-b border-emerald-500/20 bg-gradient-to-b from-[#060B14] via-[#0A162B] to-[#060B14]">
        {/* Stadium Ambient Floodlights */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-amber-500/12 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Authority Copy & Search */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black font-display tracking-tight leading-[1.14]">
                <span className="text-white">The Secure Marketplace for </span>
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
                  Verified eFootball Accounts
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans font-medium">
                Kenya&apos;s trusted gaming escrow platform. Buy and sell verified squads with automated Safaricom M-Pesa custody and a mandatory 24-hour inspection window before payment release.
              </p>

              {/* Instant Search Bar */}
              <div className="max-w-2xl mx-auto lg:mx-0 pt-1">
                <form action="/browse" method="GET" className="relative flex items-center shadow-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search meta players (e.g. Blitz Curler Son, Bully Messi, Gullit, Vieira)..."
                    className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-[#0A1426]/90 border border-emerald-500/35 text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-sm shadow-inner min-h-[48px]"
                  />
                  <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs px-5 rounded-xl min-h-[40px] shadow-md shadow-emerald-500/20"
                    >
                      Search
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Live Market Authority Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-gradient-to-br from-[#0D1B34]/95 via-[#0A1426]/95 to-[#0D1B34]/95 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl shadow-emerald-950/40 space-y-6 relative overflow-hidden backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs uppercase font-mono font-bold text-emerald-300 tracking-wider">
                      Live Escrow Metrics
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-400/40 px-2.5 py-0.5 rounded-full shadow-sm">
                    Safaricom Daraja v2
                  </span>
                </div>

                {/* Real Database Metrics Grid (Zero demo data) */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F2242] to-[#0A1426] border border-amber-500/35 shadow-md shadow-amber-500/10">
                    <span className="block text-2xl sm:text-3xl font-black text-amber-300 font-display">
                      {metrics.activeListingsCount}
                    </span>
                    <span className="text-[11px] text-amber-200/80 uppercase font-bold tracking-wider">
                      Verified Squads
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B2A3B] to-[#0A1426] border border-emerald-500/45 shadow-md shadow-emerald-500/10">
                    <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-display">
                      {formatCurrency(metrics.totalVolumeKes)}
                    </span>
                    <span className="text-[11px] text-emerald-200/80 uppercase font-bold tracking-wider">
                      Volume Processed
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131F45] to-[#0A1426] border border-sky-500/35 shadow-md shadow-sky-500/10">
                    <span className="block text-2xl sm:text-3xl font-black text-sky-300 font-display">
                      {metrics.completedOrdersCount}
                    </span>
                    <span className="text-[11px] text-sky-200/80 uppercase font-bold tracking-wider">
                      Completed Orders
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1742] to-[#0A1426] border border-purple-500/35 shadow-md shadow-purple-500/10">
                    <span className="block text-2xl sm:text-3xl font-black text-purple-300 font-display">
                      {metrics.verifiedSellersCount}
                    </span>
                    <span className="text-[11px] text-purple-200/80 uppercase font-bold tracking-wider">
                      Vetted Sellers
                    </span>
                  </div>
                </div>

                {/* Verified Standards Checklist */}
                <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Safaricom Till 1572931 escrow with zero seller prepayment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>24-hour mandatory inspection window before funds release</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AES-256 encrypted credential transfer protocol</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Executive dispute resolution hotline: 0794400365</span>
                  </div>
                </div>

                {/* Reviewer signature badge */}
                <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Lead Officer: Brian Okibo</span>
                  </div>
                  <Link href="/escrow-guarantee" className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold">
                    Read Policy &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CURATED MARKETPLACE DIRECTORY (100% Real Supabase Data, Zero Demo Data) */}
      <section className="py-14 md:py-20 border-b border-emerald-500/20 bg-[#060B14]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
              Featured Verified Squads
            </h2>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline shrink-0"
            >
              <span>View All Listings ({metrics.activeListingsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>



          {listings.length === 0 ? (
            /* Clean Authentic Empty State (Zero fabricated data) */
            <div className="rounded-3xl bg-[#0D192E] border border-emerald-500/30 p-10 text-center space-y-4 max-w-xl mx-auto shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No active listings available right now</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All previous squads have been purchased or are currently in 24-hour buyer inspection. Be the first verified seller to list your squad!
              </p>
              <Link href="/seller/create-listing">
                <Button variant="primary" size="md" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20">
                  + Create First Listing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((item) => (
                <ListingCard3D key={item.id} listing={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. 5-STEP ESCROW VISUALIZER & CALLOUT BOX */}
      <EscrowStepsVisualizer />

      {/* 5. GOOGLE-COMPLIANT ADVERTISEMENT BANNER */}
      <section className="py-6 bg-[#060B14] border-b border-emerald-500/15">
        <div className="max-w-5xl mx-auto px-4">
          <AdBanner slot="home-featured-middle" />
        </div>
      </section>

      {/* 6. BRING-YOUR-OWN-DEAL MIDDLEMAN FEATURE (Healthline-style solution panel) */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-[#060B14] via-[#091526] to-[#060B14] border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#0B172E] via-[#0E2242] to-[#0B172E] border border-emerald-500/35 p-8 sm:p-12 shadow-2xl shadow-emerald-950/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  <Handshake className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Bring-Your-Own-Deal Middleman</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                  Trading outside on WhatsApp or Facebook? Don&apos;t get scammed.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  If you found a seller or buyer on external social media, protect yourselves by routing the deal through our automated Lipa Na M-Pesa Middleman Escrow. The buyer locks funds to Till 1572931, the seller delivers credentials, and payout is released only after the squad is verified on the buyer&apos;s phone.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#091222]/90 border border-emerald-500/25 shadow-sm">
                    <span className="block font-bold text-white mb-0.5">1. Deposit</span>
                    <span className="text-[11px] text-slate-400">Buyer deposits to Till 1572931</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#091222]/90 border border-emerald-500/25 shadow-sm">
                    <span className="block font-bold text-white mb-0.5">2. Inspect</span>
                    <span className="text-[11px] text-slate-400">24h verification countdown</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#091222]/90 border border-emerald-500/25 shadow-sm">
                    <span className="block font-bold text-emerald-400 mb-0.5">3. Disburse</span>
                    <span className="text-[11px] text-slate-400">Instant M-Pesa seller payout</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
                <Link href="/middleman" className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs py-3.5 rounded-2xl min-h-[48px] shadow-lg shadow-emerald-500/25 border border-emerald-400/40"
                  >
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
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full bg-[#091222] border border-emerald-500/30 text-white hover:border-emerald-400 text-xs py-3.5 rounded-2xl min-h-[48px] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2 text-emerald-400" />
                    WhatsApp Admin: 0794400365
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMPETITIVE TOURNAMENTS & KNOCKOUT CUPS (Rendered only when active cups exist) */}
      {tournaments.length > 0 && (
        <section className="py-14 md:py-20 border-b border-amber-500/20 bg-gradient-to-b from-[#060B14] via-[#0D1528] to-[#060B14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>eFootball Kenya Cups</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                  Competitive Knockout Tournaments
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Compete 1v1 with real match bracket tracking and verified Safaricom M-Pesa prize payouts.
                </p>
              </div>
              <Link
                href="/tournaments"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline shrink-0"
              >
                <span>View All Tournaments & Brackets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  className="rounded-3xl bg-gradient-to-br from-[#0F1E38] to-[#0A1426] border border-amber-500/35 p-6 flex flex-col justify-between shadow-xl shadow-amber-950/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-400/40 text-amber-300">
                        {t.status?.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {t.registered_count || 0} / {t.max_players} Gamers
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{t.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{t.subtitle}</p>

                    <div className="p-3 rounded-2xl bg-[#081224] border border-emerald-500/30 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Prize Pool:</span>
                      <strong className="text-emerald-400 font-mono font-bold">
                        {formatCurrency(t.prize_pool_kes, "KES")}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80">
                    <Link href="/tournaments">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl min-h-[44px] shadow-md shadow-amber-500/20 border border-amber-300/40"
                      >
                        Enter Tournament
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. EDITORIAL BULLETINS & SCAMMER ALERTS (Rendered only when articles exist) */}
      {articles.length > 0 && (
        <section className="py-14 md:py-20 border-b border-emerald-500/20 bg-gradient-to-b from-[#060B14] via-[#091526] to-[#060B14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Verified Alerts</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                  News & Scammer Warnings
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Official game updates, fraud advisories, and Kenyan community notices.
                </p>
              </div>
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline shrink-0"
              >
                <span>Read All Bulletins</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((article) => {
                const isAlert = article.category === "scammer_alert";
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="rounded-3xl bg-gradient-to-br from-[#0D1A30] to-[#070D18] border border-emerald-500/25 hover:border-emerald-400/60 p-6 flex flex-col justify-between shadow-xl shadow-emerald-950/20 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isAlert
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/80"
                              : "bg-emerald-950/60 text-emerald-300 border border-emerald-700/60"
                          }`}
                        >
                          {isAlert ? "🚨 Scammer Alert" : article.category?.replace("_", " ") || "Update"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Read bulletin</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 9. INTERACTIVE FAQ ACCORDION (Matches Schema.org FAQPage for Google Search) */}
      <section className="py-14 md:py-20 border-b border-emerald-500/20 bg-gradient-to-b from-[#060B14] to-[#04070D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Authority Knowledge Base</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
              Clear, transparent answers on Safaricom M-Pesa escrow protection, dispute timing, and account safety.
            </p>
          </div>

          <HomeFaqAccordion />
        </div>
      </section>
    </div>
  );
}
