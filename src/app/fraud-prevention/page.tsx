import { AlertCircle, Ban, Lock, ShieldAlert, ShieldCheck, Building2, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Anti-Fraud & Cyber Security Governance | eFootballMarket",
  description: "Enterprise security architecture, cybercrime mitigation, and fraud enforcement standards of eFootballMarket Inc.",
};

export default function FraudPreventionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-400 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Institutional Fraud Mitigation Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Anti-Fraud & Cyber Security Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          How eFootballMarket Inc. eradicates fraudulent payments, phishing, and post-settlement account recoveries.
        </p>
      </div>

      {/* Corporate Governance Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Anti-Fraud Infrastructure Directed by Brian Okibo, CEO
            </h2>
            <p className="text-xs text-rose-400 font-medium">
              Enterprise Risk Governance & Mobile Banking Integrity
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The fraud prevention framework of <strong>eFootballMarket Inc.</strong> was architected under the direction of <strong>Brian Okibo, Chief Executive Officer (CEO)</strong>. The system eliminates common gaming marketplace fraud by cryptographically verifying Safaricom Daraja M-Pesa callbacks and enforcing strict legal consequences for post-sale account retrieval.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-rose-400">1.</span> Eradication of Spoofed Payment Scams
          </h2>
          <p>
            In unmonitored gaming communities, fraudsters frequently fabricate fake M-Pesa SMS texts or alter screenshot receipts.
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2">
            <strong className="text-emerald-400 block font-semibold">Our Cryptographic Defense:</strong>
            <p>
              eFootballMarket never validates payments through human inspection of customer screenshots. Transactions are verified exclusively through authenticated server-to-server HTTPS webhooks originating directly from Safaricom PLC infrastructure. Escrow state locks only after validation of exact shilling amounts and merchant reference IDs.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-rose-400">2.</span> Post-Delivery Recovery Defined as Cybercrime
          </h2>
          <p>
            Reclaiming a gaming account after receiving escrow payout constitutes unlawful computer interference and criminal fraud:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Mandatory Cooperation with Law Enforcement:</strong> eFootballMarket Inc. cooperates proactively with national cybercrime investigators, providing verified KYC identities, IP access histories, and telecommunication records of rogue sellers.</li>
            <li><strong>Permanent Blacklist & Forfeiture:</strong> Fraudulent actors face permanent banning across all company platforms, and any undistributed balance is seized as restitution for affected parties.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-rose-400">3.</span> Automated Telemetry & Anomaly Filtering
          </h2>
          <p>
            The Platform continuously monitors for suspicious account activity:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
              <span className="text-slate-100 font-semibold block mb-0.5">Velocity Monitoring</span>
              <span className="text-slate-400">Automated restrictions on rapid batch purchases or suspicious spikes in account listings.</span>
            </div>
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
              <span className="text-slate-100 font-semibold block mb-0.5">Scam URL & Keyword Scrubbing</span>
              <span className="text-slate-400">Real-time filtering of off-platform contact attempts and phishing links.</span>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-rose-400">4.</span> Reporting Suspicious Activity
          </h2>
          <p>
            To report suspected fraud or intellectual property infringement, contact the Fraud Investigation Bureau supervised by <strong>Brian Okibo, CEO</strong> at security@efootballmarket.com.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/terms" className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline">
          Read Terms of Service & Escrow Agreement →
        </Link>
      </div>
    </div>
  );
}
