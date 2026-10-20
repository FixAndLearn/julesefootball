import { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { FridayDropsSection } from "@/components/home/FridayDropsSection";
import { Listing } from "@/types/database";
import { ShieldCheck, Flame, Clock, Zap, ArrowLeft, ArrowRight, HelpCircle, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Friday Drops - Weekly 8-Hour Flash Sales | eFootballMarket Kenya",
  description:
    "Curated high-OVR eFootball squad drops every Friday from 2:00 PM to 10:00 PM EAT. Exclusive flash discounts with Safaricom M-Pesa Till 1572931 escrow custody.",
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
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col">
      {/* Top Breadcrumb & Banner Header */}
      <div className="border-b border-slate-800 bg-[#0B1220]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Squads</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-amber-300 font-mono font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Weekly 8-Hour Window (14:00 – 22:00 EAT)</span>
          </div>
        </div>
      </div>

      {/* Main Friday Drops Section with dynamic 8-Hour countdown and locked vault state */}
      <main className="flex-1">
        <FridayDropsSection listings={listings} />

        {/* Informational Guide & Rules: How Friday Drops Work */}
        <section className="py-14 md:py-20 border-t border-slate-800/80 bg-[#090E1A]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                How Friday Flash Drops Work
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                Learn why Friday squad drops are strictly time-locked and how Safaricom M-Pesa Till 1572931 protects your payment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white">Strict 8-Hour Window</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Drops unlock strictly at <span className="text-amber-300 font-semibold">2:00 PM (14:00 EAT)</span> every Friday and close at <span className="text-amber-300 font-semibold">10:00 PM (22:00 EAT)</span>. When the 8 hours expire, the squads vanish until the following Friday.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-white">Locked Flash Discounts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Featured squads carry exclusive up to 35% promotional discounts. Because the price is deeply reduced for flash purchase, bargaining and counteroffers are withdrawn during the 8-hour window.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white">Safaricom Till 1572931 Escrow</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your funds are locked in official Safaricom custody. You receive a mandatory 24-hour inspection period to verify player ratings, GP, and Konami ID binding before the seller receives a shilling.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-base font-bold text-white">Seller Drop Submissions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Verified sellers with clean Konami accounts and high OVR squads can submit their rosters during the week for admin curation in the next upcoming Friday Drop.
                </p>
              </div>
            </div>

            {/* Bottom Navigation CTA */}
            <div className="text-center pt-4">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95"
              >
                <span>Browse All Marketplace Squads</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
