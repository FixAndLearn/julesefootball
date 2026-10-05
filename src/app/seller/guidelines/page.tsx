import { CheckCircle2, Clock, ShieldCheck, Trophy, UserCheck, AlertTriangle, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Seller Guidelines & Standards | eFootballMarket",
  description: "Official seller code of conduct, delivery SLAs, and account verification rules on eFootballMarket.",
};

export default function SellerGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-konami-blue/20 border border-konami-blue/40 text-sky-400 text-xs font-semibold">
          <Trophy className="w-4 h-4" />
          <span>Merchant Excellence & Trust Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Seller Guidelines & Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Requirements for listing eFootball accounts, honoring escrow delivery SLAs, and maintaining top seller ratings.
        </p>
      </div>

      {/* Creator & Framework Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Seller Protocol Established by Brian (FixAndLearn / Jules)
            </h2>
            <p className="text-xs text-slate-400">
              Fair Trade Framework Protecting Honest Merchants
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The seller standards were established by <strong>Brian (FixAndLearn / Jules)</strong> to reward transparent merchants with automated M-Pesa payouts, zero chargeback exposure, and verified trust badges while maintaining an uncompromising standard against deceptive inventory.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Rule 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-sky-400">1.</span> Accurate Account Representation
          </h2>
          <p>
            Every listing published on eFootballMarket must represent a genuine account in your immediate possession:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Actual Overall Team Strength:</strong> State the genuine OVR (e.g. 3120). Do not inflate ratings using temporary loan managers.</li>
            <li><strong>Real Coin & GP Balances:</strong> State the exact number of coins and GP available at the moment of sale.</li>
            <li><strong>Verified Screenshots:</strong> Provide clean, unaltered screenshots showing the Game Plan starting XI, substitute bench, and Konami ID status.</li>
          </ul>
        </section>

        {/* Rule 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-sky-400">2.</span> Delivery SLA & Credential Vault Requirements
          </h2>
          <p>
            When a buyer locks payment into escrow via M-Pesa:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>You must deliver working Konami ID credentials within <strong>twelve (12) hours</strong> via the order page.</li>
            <li>If two-step verification is enabled, you must provide prompt assistance in the order chatbox or supply valid backup codes.</li>
            <li>Failure to deliver credentials within the SLA window results in automated order cancellation and a penalty on your seller rating.</li>
          </ul>
        </section>

        {/* Rule 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-sky-400">3.</span> Konami ID Unlinking & Full Email Surrender
          </h2>
          <p>
            To guarantee buyer safety and protect your earnings against disputes:
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2">
            <p>
              • If the listing states <strong>&quot;Transferable Full Access&quot;</strong>, the seller must hand over the registered email account or assist the buyer in updating the registered email in My KONAMI settings.
            </p>
            <p>
              • Sellers must unlink third-party accounts (Google Play, Game Center, Apple ID, PSN, or Steam) before delivering credentials to prevent conflicting logins.
            </p>
          </div>
        </section>

        {/* Rule 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-sky-400">4.</span> Seller KYC Verification & Ratings
          </h2>
          <p>
            Sellers who complete KYC verification receive the verified seller badge, priority placement in search results, and instantaneous payout release once buyers confirm delivery.
          </p>
        </section>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Link href="/seller/create-listing">
          <button className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition-all">
            Create Account Listing
          </button>
        </Link>
        <Link href="/seller/verification">
          <button className="px-5 py-2.5 rounded-xl bg-pitch-card hover:bg-pitch-surface border border-pitch-border text-slate-200 font-semibold text-xs transition-all">
            Get Verified (KYC)
          </button>
        </Link>
      </div>
    </div>
  );
}
