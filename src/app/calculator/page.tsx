import { Metadata } from "next";
import { SquadValuationCalculator } from "@/components/calculator/SquadValuationCalculator";
import { ShieldCheck, Trophy, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "eFootball Account Value Calculator | Kenya Market Price Estimator",
  description:
    "Calculate the real market value of your eFootball PES mobile account in Kenya Shillings (KES). Estimate fair price based on OVR, Epic Boosters, Division rank, and coin balance.",
};

export default function CalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Main Calculator */}
      <SquadValuationCalculator />

      {/* Valuation FAQ & Advice */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-pitch-surface/70 border border-pitch-border/80">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">What Drives the Highest Price?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Meta Epics (e.g. 104+ Messi, Vieira, Gullit, Maldini) and Division 1 badges command high premiums among competitive Kenyan mobile gamers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-pitch-surface/70 border border-pitch-border/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Guaranteed M-Pesa Escrow</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you list at your recommended valuation, buyers pay into platform escrow via M-Pesa STK push. You deliver safely and withdraw instantly.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-pitch-surface/70 border border-pitch-border/80">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Unlink Linked Stores</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Accounts with fully unlinked Google Play or Game Center stores sell up to 40% faster and receive higher buyer trust ratings.
          </p>
        </div>
      </div>
    </div>
  );
}
