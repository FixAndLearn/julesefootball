import { CheckCircle2, Clock, ShieldCheck, Trophy, Building2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Seller Standards & Code of Conduct | eFootballMarket",
  description: "Merchant standards, delivery SLAs, and operational rules instituted by eFootballMarket Inc.",
};

export default function SellerGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-konami-blue/20 border border-konami-blue/40 text-sky-400 text-xs font-semibold">
          <Trophy className="w-4 h-4" />
          <span>Merchant Operational Excellence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Seller Guidelines & Merchant Standards
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Operational code of conduct governing merchant inventory, delivery SLAs, and escrow compliance.
        </p>
      </div>

      {/* Corporate Governance Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Merchant Standards Instituted by Brian Okibo, CEO
            </h2>
            <p className="text-xs text-sky-400 font-medium">
              Fair Trade Commercial Framework Protecting Legitimate Sellers
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The merchant operational guidelines of <strong>eFootballMarket Inc.</strong> were established under the executive leadership of <strong>Brian Okibo, Chief Executive Officer (CEO)</strong>. The platform rewards transparent sellers with automated M-Pesa payouts, zero chargeback exposure, and verified badges while maintaining a zero-tolerance policy against misleading listings.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Rule 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-sky-400">1.</span> Accurate Account Inventory Representation
          </h2>
          <p>
            Sellers are strictly accountable for the veracity of all account metrics published on the Platform:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Verified Overall Team Strength (OVR):</strong> The advertised rating must match actual squad strength without reliance on temporary loan items.</li>
            <li><strong>Actual Resource Balances:</strong> Coin, GP, and contract ticket counts must be accurate at the time of purchase.</li>
            <li><strong>Clean Screenshots:</strong> Clear, unaltered screenshots of the starting XI, reserves, and Konami ID connection status must be uploaded.</li>
          </ul>
        </section>

        {/* Rule 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-sky-400">2.</span> Mandatory 12-Hour Credential Delivery SLA
          </h2>
          <p>
            Upon notification that a buyer has secured payment in escrow via M-Pesa:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>Sellers must submit working credentials through the encrypted vault within <strong>twelve (12) hours</strong>.</li>
            <li>If 2-Step Verification is active, the seller must assist in the order chatbox or provide functional backup codes.</li>
            <li>Failure to comply triggers automated order cancellation and a public strike against merchant standing.</li>
          </ul>
        </section>

        {/* Rule 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-sky-400">3.</span> Disconnection of Third-Party Accounts
          </h2>
          <p>
            Prior to credential delivery, sellers must unbind Google Play, Apple Game Center, Steam, or PlayStation Network logins from the Konami ID to ensure sole unencumbered access transfers to the buyer.
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
