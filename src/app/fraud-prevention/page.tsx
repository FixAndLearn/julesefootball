import { AlertCircle, Ban, Lock, ShieldAlert, ShieldCheck, UserCheck, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Anti-Fraud & Platform Security | eFootballMarket",
  description: "Comprehensive fraud prevention standards, scam mitigation, and security architecture of eFootballMarket.",
};

export default function FraudPreventionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-400 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Zero-Tolerance Anti-Fraud Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Anti-Fraud & Cyber Security Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          How eFootballMarket eliminates gaming scams, fake payments, and post-sale account recoveries.
        </p>
      </div>

      {/* Creator & Security Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Anti-Fraud System Designed by Brian (FixAndLearn / Jules)
            </h2>
            <p className="text-xs text-slate-400">
              Institutional Risk Mitigation & Mobile Money Protection
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Engineered by <strong>Brian (FixAndLearn / Jules)</strong>, our platform incorporates multi-layer fraud detection designed to counter common gaming marketplace scams: fraudulent M-Pesa SMS messages, phantom chargebacks, and post-delivery Konami ID account retrieval. Every sensitive state transition is cryptographically verified on the backend.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Pillar 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-rose-400">1.</span> Elimination of Fake Payment Scams
          </h2>
          <p>
            In traditional peer-to-peer gaming groups, fraudsters commonly spoof M-Pesa confirmation SMS messages or send forged payment receipts.
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-1.5">
            <strong className="text-emerald-400 block">How eFootballMarket Solves This:</strong>
            <p>
              We NEVER rely on customer screenshots or manual text entry. Payment verification occurs solely via direct HTTPS webhooks originating from Safaricom&apos;s authenticated Daraja IP addresses. Orders only transition to <code>escrow_locked</code> when the official banking API confirms the receipt and exact shilling amount.
            </p>
          </div>
        </section>

        {/* Pillar 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-rose-400">2.</span> Post-Sale Account Recovery as Criminal Fraud
          </h2>
          <p>
            The greatest threat to account trading is when an unethical seller uses recovery email or linked Sony/Google credentials to reclaim an account weeks after sale.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Mandatory Transfer Verification:</strong> Sellers are audited on whether the Konami ID email was permanently unbound or surrendered to the buyer.</li>
            <li><strong>KYC Traceability:</strong> Verified sellers provide government identification. In proven recovery fraud cases, offender identity and transaction logs are submitted to mobile network fraud departments and legal authorities.</li>
            <li><strong>Asset Forfeiture:</strong> Any pending balances or future earnings in an offender&apos;s account are permanently frozen to reimburse affected buyers.</li>
          </ul>
        </section>

        {/* Pillar 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-rose-400">3.</span> Automated Anomaly & Abuse Detection
          </h2>
          <p>
            Our backend surveillance engine constantly monitors:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
              <span className="text-slate-100 font-semibold block mb-0.5">Velocity Checks</span>
              <span className="text-slate-400">Detection of abnormal listing spikes or rapid purchases across newly registered profiles.</span>
            </div>
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
              <span className="text-slate-100 font-semibold block mb-0.5">Off-Platform Redirection</span>
              <span className="text-slate-400">Automated filtering of phone numbers, external scam URLs, and off-site messaging solicitations.</span>
            </div>
          </div>
        </section>

        {/* Pillar 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-rose-400">4.</span> Report Suspicious Activity
          </h2>
          <p>
            If you suspect a listing contains stolen screenshots, deceptive squad strength, or an account recovery attempt, submit an instant report via the listing page or email security@efootballmarket.com.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/terms" className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline">
          Read Terms of Service →
        </Link>
      </div>
    </div>
  );
}
