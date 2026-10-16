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
      {/* 1. HERO SECTION (Authoritative, clean, high-converting split layout) */}
      <section className="relative overflow-hidden pt-8 pb-14 md:pt-12 md:pb-20 border-b border-slate-800 bg-gradient-to-b from-[#0B1220] via-[#0D1527] to-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Authority Copy, Search & Primary Actions */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-slate-700/80 text-xs font-semibold shadow-inner">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span className="text-slate-300">Certified Escrow Protection Standard</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black font-display tracking-tight text-[#F8FAFC] leading-[1.12]">
                Trade Verified eFootball Accounts with{" "}
                <span className="text-[#22C55E]">Certified Escrow.</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Kenya&apos;s verified peer-to-peer marketplace for mobile football gamers. Every squad purchase is locked in Safaricom Lipa Na M-Pesa Till 1572931 and protected by a mandatory 24-hour buyer inspection period before funds release.
              </p>

              {/* Instant Search Bar */}
              <div className="max-w-2xl mx-auto lg:mx-0">
                <form action="/browse" method="GET" className="relative flex items-center shadow-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search epic player, playstyle, OVR (e.g. Messi, 3200, Quick Counter)..."
                    className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-[#111827] border border-slate-700 text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-[#22C55E] text-sm shadow-inner min-h-[48px]"
                  />
                  <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="bg-[#22C55E] text-[#0B1220] hover:bg-[#16a34a] font-bold text-xs px-5 rounded-xl min-h-[40px]"
                    >
                      Search
                    </Button>
                  </div>
                </form>

                {/* Instant Filter Pills */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3.5 text-xs">
                  <span className="text-slate-400 font-medium">Popular:</span>
                  <Link
                    href="/browse?platform=android"
                    className="px-3 py-1 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                  >
                    Android
                  </Link>
                  <Link
                    href="/browse?platform=ios"
                    className="px-3 py-1 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                  >
                    iOS Mobile
                  </Link>
                  <Link
                    href="/browse?minStrength=3200"
                    className="px-3 py-1 rounded-lg bg-[#111827] border border-amber-500/30 text-amber-400 hover:border-amber-400 transition-colors font-semibold"
                  >
                    3200+ OVR
                  </Link>
                  <Link
                    href="/browse?playstyle=quick_counter"
                    className="px-3 py-1 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                  >
                    Quick Counter
                  </Link>
                  <Link
                    href="/middleman"
                    className="px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:text-white hover:border-emerald-500 transition-colors font-semibold"
                  >
                    Middleman Deal
                  </Link>
                </div>
              </div>

              {/* Action Buttons (48px+ Touch Ergonomics) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link href="/browse">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-black text-sm px-6 rounded-2xl min-h-[48px] shadow-lg shadow-emerald-950/40"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Browse Verified Squads
                  </Button>
                </Link>
                <Link href="/seller/create-listing">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-[#111827] border border-slate-700 hover:border-slate-500 text-white font-bold text-sm px-6 rounded-2xl min-h-[48px]"
                  >
                    + Sell Account
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-[#111827] border border-slate-700 hover:border-slate-500 text-amber-400 font-bold text-sm px-5 rounded-2xl min-h-[48px]"
                  >
                    <Trophy className="w-4 h-4 mr-2 text-amber-400" />
                    Tournaments
                  </Button>
                </Link>
              </div>

              {/* Editorial stamp */}
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Audited by Brian Okibo, Lead Escrow Officer • Real-time database metrics</span>
              </div>
            </div>

            {/* Right Column: Live Market Authority Panel (Healthline Institution Card) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#111827] border border-slate-700/80 p-6 sm:p-7 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="text-xs uppercase font-mono font-bold text-slate-300 tracking-wider">
                      Live Escrow Metrics
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                    Safaricom Daraja v2
                  </span>
                </div>

                {/* Real Database Metrics Grid (Zero demo data) */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-slate-800">
                    <span className="block text-2xl sm:text-3xl font-black text-white font-display">
                      {metrics.activeListingsCount}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                      Verified Squads
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-slate-800">
                    <span className="block text-2xl sm:text-3xl font-black text-[#22C55E] font-display">
                      {formatCurrency(metrics.totalVolumeKes)}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                      Escrow Volume Handled
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-slate-800">
                    <span className="block text-2xl sm:text-3xl font-black text-indigo-400 font-display">
                      {metrics.completedOrdersCount}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                      Completed Deliveries
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-slate-800">
                    <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-display">
                      {metrics.verifiedSellersCount}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                      Vetted Sellers
                    </span>
                  </div>
                </div>

                {/* Verified Standards Checklist */}
                <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>Lipa Na M-Pesa Till 1572931 lock with zero seller prepayment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>24-hour mandatory inspection window before funds release</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>AES-256 encrypted credential transfer protocol</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>Executive dispute resolution hotline: 0794400365</span>
                  </div>
                </div>

                {/* Reviewer signature badge */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Lead Officer: Brian Okibo</span>
                  </div>
                  <Link href="/escrow-guarantee" className="text-[#22C55E] hover:underline font-semibold">
                    Read Policy &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME ESCROW TELEMETRY MARQUEE */}
      <div className="bg-[#090D16] border-b border-slate-800 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
            <div className="flex items-center gap-2 text-slate-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
              <span className="font-mono font-bold text-[#22C55E]">LIPA NA M-PESA TILL 1572931</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Escrow Vault Active</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="font-semibold text-white">24H Mandatory Buyer Inspection</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Zero Prepayment Risk</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 shrink-0">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">AES-256 Vault Transfer</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Instant Konami 2FA Link</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 shrink-0">
              <BadgeCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="font-semibold text-white">Kenya DPA (2019) Compliant</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Gov. Regulated Standard</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE INSTITUTIONAL TRUST PILLARS (Healthline-style clean 4-card ribbon) */}
      <section className="py-10 bg-[#0F172A] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Safaricom Till 1572931</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct integration with Safaricom Daraja API v2. Payouts disbursed only after buyer approves.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">24-Hour Inspection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log into eFootball on your phone, test the squad, and link your credentials before money moves.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">AES-256 Encrypted Transfer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Konami ID passwords and backup codes are stored with authenticated encryption and purged post-sale.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Nairobi Helpline Desk</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct assistance from administrator Brian Okibo on WhatsApp (+254 794 400 365) with 5-minute response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED MARKETPLACE DIRECTORY (100% Real Supabase Data, Zero Demo Data) */}
      <section className="py-14 md:py-20 border-b border-slate-800 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Inventory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                Featured Verified Squads
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Accounts inspected for Konami ID cleanliness, OVR veracity, and unlinked email status.
              </p>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] hover:underline shrink-0"
            >
              <span>View All Listings ({metrics.activeListingsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {listings.length === 0 ? (
            /* Clean Authentic Empty State (Zero fabricated data) */
            <div className="rounded-3xl bg-[#111827] border border-slate-800 p-10 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No active listings available right now</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All previous squads have been purchased or are currently in 24-hour buyer inspection. Be the first verified seller to list your squad!
              </p>
              <Link href="/seller/create-listing">
                <Button variant="primary" size="md" className="bg-[#22C55E] text-[#0B1220] font-bold text-xs">
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

      {/* 5. GOOGLE-COMPLIANT ADVERTISEMENT BANNER */}
      <section className="py-6 bg-[#090D16] border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4">
          <AdBanner slot="home-featured-middle" />
        </div>
      </section>

      {/* 6. BRING-YOUR-OWN-DEAL MIDDLEMAN FEATURE (Healthline-style solution panel) */}
      <section className="py-14 md:py-20 bg-[#0F172A] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#111827] via-[#162138] to-[#111827] border border-slate-700/80 p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
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
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="block font-bold text-white mb-0.5">1. Deposit</span>
                    <span className="text-[11px] text-slate-400">Buyer deposits to Till 1572931</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="block font-bold text-white mb-0.5">2. Inspect</span>
                    <span className="text-[11px] text-slate-400">24h verification countdown</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="block font-bold text-[#22C55E] mb-0.5">3. Disburse</span>
                    <span className="text-[11px] text-slate-400">Instant M-Pesa seller payout</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
                <Link href="/middleman" className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-[#22C55E] text-[#0B1220] hover:bg-[#16a34a] font-black text-xs py-3.5 rounded-2xl min-h-[48px]"
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
                    className="w-full bg-[#111827] border border-slate-700 text-white hover:border-slate-500 text-xs py-3.5 rounded-2xl min-h-[48px]"
                  >
                    <MessageCircle className="w-4 h-4 mr-2 text-[#22C55E]" />
                    WhatsApp Admin: 0794400365
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMPETITIVE TOURNAMENTS & KNOCKOUT CUPS (Real Supabase Data) */}
      <section className="py-14 md:py-20 border-b border-slate-800 bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Trophy className="w-3.5 h-3.5" />
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline shrink-0"
            >
              <span>View All Tournaments & Brackets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <div className="rounded-3xl bg-[#111827] border border-slate-800 p-8 text-center max-w-lg mx-auto">
              <Trophy className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-60" />
              <h3 className="text-base font-bold text-white">No tournaments currently registering</h3>
              <p className="text-xs text-slate-400 mt-1">
                New knockout cups are published weekly. Check back or speak to our desk lead on WhatsApp!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  className="rounded-3xl bg-[#111827] border border-slate-800 p-6 flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        {t.status?.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {t.registered_count || 0} / {t.max_players} Gamers
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{t.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{t.subtitle}</p>

                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Prize Pool:</span>
                      <strong className="text-emerald-400 font-mono font-bold">
                        {formatCurrency(t.prize_pool_kes, "KES")}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800">
                    <Link href="/tournaments">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs rounded-xl min-h-[44px]"
                      >
                        Enter Tournament
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. EDITORIAL BULLETINS & SCAMMER ALERTS (Healthline-style news & alerts) */}
      <section className="py-14 md:py-20 border-b border-slate-800 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-1">
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] hover:underline shrink-0"
            >
              <span>Read All Bulletins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-3xl bg-[#111827] border border-slate-800 p-8 text-center max-w-lg mx-auto">
              <Newspaper className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-60" />
              <h3 className="text-base font-bold text-white">No published bulletins today</h3>
              <p className="text-xs text-slate-400 mt-1">
                Verified warnings and eFootball updates will appear here when published by the administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((article) => {
                const isAlert = article.category === "scammer_alert";
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-slate-600 p-6 flex flex-col justify-between shadow-xl transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isAlert
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/80"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {isAlert ? "🚨 Scammer Alert" : article.category?.replace("_", " ") || "Update"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-[#22C55E] transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Read bulletin</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 9. INTERACTIVE FAQ ACCORDION (Matches Schema.org FAQPage for Google Search) */}
      <section className="py-14 md:py-20 border-b border-slate-800 bg-[#0B1220]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-2">
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

      {/* 10. COMPLIANCE & LEGAL NOTICE (Healthline-style medical/legal disclosure) */}
      <section className="py-8 bg-[#090D16] text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 leading-relaxed space-y-1.5">
            <p className="font-bold text-white">
              Independent Community Notice & Konami Terms Advisory:
            </p>
            <p className="text-slate-400">
              eFootballMarket is an independent Kenyan escrow intermediary and is not affiliated with, endorsed by, or sponsored by Konami Digital Entertainment. Konami’s official terms of service prohibit selling, transferring, or sharing eFootball game account credentials. Trading may result in loss of account access or support.{" "}
              <a
                href="https://www.konami.com/efootball/en-us/topic/news/5174"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#22C55E] hover:underline font-semibold inline-flex items-center gap-0.5"
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
