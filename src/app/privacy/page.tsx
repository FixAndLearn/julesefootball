import { Lock, ShieldCheck, Database, KeyRound, Building2, EyeOff } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy & Data Protection Policy | eFootballMarket",
  description: "Enterprise Data Handling Standards, Cryptographic Vault Protocol, and Governance of eFootballMarket Inc.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
          <Lock className="w-4 h-4" />
          <span>Institutional Privacy & Cryptographic Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Effective Date: October 2026. How eFootballMarket Inc. processes, protects, and encrypts enterprise user data.
        </p>
      </div>

      {/* Corporate Controller Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Data Controller Governance & Leadership
            </h2>
            <p className="text-xs text-emerald-400 font-medium">
              Executive Administration under Brian Okibo, Chief Executive Officer (CEO)
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>eFootballMarket Inc.</strong>, under the executive oversight of <strong>Brian Okibo, Chief Executive Officer (CEO)</strong>, maintains a zero-trust cryptographic data protection posture. All sensitive gaming credentials (Konami ID emails, passwords, and 2FA backup codes) are encrypted on the server before storage, ensuring zero plaintext exposure across our entire infrastructure.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">1.</span> Lawful Scope of Data Collection
          </h2>
          <p>
            In compliance with statutory anti-money laundering and data protection mandates, we collect only data essential to fulfill escrow contracts:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Account Identity:</strong> Legal names, usernames, and verified email addresses.</li>
            <li><strong>Financial Mobile Records:</strong> Safaricom M-Pesa phone numbers required to initiate automated STK push billing and execute seller B2C withdrawals via Daraja API v2.</li>
            <li><strong>Identity Verification Documents (KYC):</strong> Government-issued identity credentials submitted voluntarily by sellers to obtain commercial merchant badges.</li>
            <li><strong>Audit & Security Telemetry:</strong> Immutable audit logs including IP addresses, browser headers, order milestones, and financial transaction references.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">2.</span> Authenticated Cryptographic Vault Protocol
          </h2>
          <p>
            The Platform implements end-to-end authenticated credential protection:
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2">
            <p>
              • <strong>AES-256-GCM Encryption:</strong> Sensitive credentials provided during account delivery undergo symmetric Galois/Counter Mode authenticated encryption utilizing dynamic 16-byte initialization vectors (IVs) and cryptographic authentication tags.
            </p>
            <p>
              • <strong>Strict Authorization Gating:</strong> Only the authenticated buyer of a paid order possesses cryptographic authorization to trigger server-side credential decipherment.
            </p>
            <p>
              • <strong>Archival and Scrubbing:</strong> Once the 24-hour inspection period concludes, sensitive credentials are removed from client-accessible query buffers.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">3.</span> Sub-Processors & Infrastructure Governance
          </h2>
          <p>
            Data is stored and transmitted exclusively through certified institutional cloud vendors:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Safaricom PLC:</strong> Telecommunications gateway for Daraja API v2 financial settlement.</li>
            <li><strong>Supabase / PostgreSQL:</strong> SOC 2 Type II compliant cloud database provider enforcing Row Level Security (RLS) on all database tables.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">4.</span> Permanent Financial Ledger Retention
          </h2>
          <p>
            In accordance with legal and financial regulatory standards, immutable transaction records, checkout request IDs, and M-Pesa receipt numbers are permanently retained to defend the Company and legitimate users against chargeback attempts, fraud, and legal claims.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">5.</span> Data Subject Rights & Privacy Inquiries
          </h2>
          <p>
            Users maintain the right to inspect personal profile data and request account deactivation. To submit formal data protection inquiries, contact the Data Governance Office overseen by <strong>Brian Okibo, Chief Executive Officer</strong> at privacy@efootballmarket.com.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/terms" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline">
          Read Terms of Service & Escrow Agreement →
        </Link>
      </div>
    </div>
  );
}
