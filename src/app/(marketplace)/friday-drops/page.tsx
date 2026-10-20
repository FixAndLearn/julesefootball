import { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { FridayDropsSection } from "@/components/home/FridayDropsSection";
import { Listing } from "@/types/database";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Flame,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Friday Drops - Weekly 8-Hour Curated Squads | eFootballMarket Kenya",
  description:
    "Curated high-OVR eFootball squad drops every Friday from 2:00 PM to 10:00 PM EAT. Hand-curated accounts with Safaricom M-Pesa Till 1572931 escrow custody.",
  alternates: {
    canonical: "https://www.efootballmarket.co.ke/friday-drops",
  },
};

export default async function FridayDropsPage() {
  const supabase = createServerSupabaseClient();
  const listingService = new ListingService(supabase);

  let listings: Listing[] = [];
  try {
    const result = await listingService.getListings({
      limit: 12,
    });
    listings = result.listings || [];
  } catch (err) {
    console.error("FridayDropsPage listings error:", err);
  }

  return (
    <div className="min-h-screen bg-pitch-dark text-slate-100 flex flex-col">
      {/* Top Modern Breadcrumb & Live Vault Status Header */}
      <div className="border-b border-pitch-border bg-pitch-surface/90 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Left: Sleek Button-styled Breadcrumb Pill */}
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pitch-card hover:bg-slate-800/80 border border-pitch-border text-xs font-semibold text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0 group shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>All Squads</span>
          </Link>

          {/* Right: Dynamic Modern Live Vault Status Badge (replacing traditional boring label) */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold whitespace-nowrap shadow-sm">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="tracking-tight text-[11px] sm:text-xs font-bold font-mono">
              Fridays 14:00 – 22:00 EAT
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
              8h Vault
            </span>
          </div>
        </div>
      </div>

      {/* Main Friday Drops Section with dynamic 8-Hour countdown and locked vault state */}
      <main className="flex-1">
        <FridayDropsSection listings={listings} />

        {/* Informational Guide & Rules: How Friday Drops Work (100% Realistic Data) */}
        <section className="py-14 md:py-20 border-t border-pitch-border bg-pitch-surface/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Vault Operation Rules</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                How Friday Drops Work
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                Learn how Friday squad drops operate under strict time windows and how Safaricom M-Pesa Till 1572931 protects your payment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-pitch-card border border-pitch-border space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Strict 8-Hour Window</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Drops unlock strictly at <span className="text-amber-300 font-semibold">2:00 PM (14:00 EAT)</span> every Friday and close at <span className="text-amber-300 font-semibold">10:00 PM (22:00 EAT)</span>. When the 8 hours expire, the squads vanish until the following Friday.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-pitch-card border border-pitch-border space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Hand-Curated Rosters</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every squad featured in Friday Drops is personally verified by Brian Okibo for clean Konami ID linkability, genuine Epic/Big Time cards, and verified strength ratings. Zero fake listings or inflated markups.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-pitch-card border border-pitch-border space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Safaricom Till 1572931 Escrow</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your funds are locked in official Safaricom custody. You receive a mandatory 24-hour inspection period to verify player ratings, GP, and Konami ID binding before the seller receives a single shilling.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-pitch-card border border-pitch-border space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Seller Drop Submissions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Verified sellers with clean Konami accounts and high OVR squads can submit their rosters during the week for admin curation in the next upcoming Friday Drop.
                </p>
              </div>
            </div>

            {/* Bottom Navigation CTA */}
            <div className="text-center pt-4">
              <Link href="/browse">
                <Button variant="gold" size="lg" className="font-bold inline-flex items-center gap-2 shadow-lg shadow-amber-500/10">
                  <span>Browse All Marketplace Squads</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}