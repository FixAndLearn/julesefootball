import { Lock, ShieldCheck, Database, KeyRound, UserCheck, EyeOff } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy & Data Protection Policy | eFootballMarket",
  description: "Official Privacy Policy and Data Handling standard for eFootballMarket and cryptographic credential vaults.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
          <Lock className="w-4 h-4" />
          <span>Data Privacy & Cryptographic Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Last revised: October 2026. How eFootballMarket collects, protects, and encrypts your data.
        </p>
      </div>

      {/* Creator & Security Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Data Architecture Designed by Brian (FixAndLearn / Jules)
            </h2>
            <p className="text-xs text-slate-400">
              Zero Plaintext Credential Exposure Architecture
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The eFootballMarket security framework was engineered by <strong>Brian (FixAndLearn / Jules)</strong> with zero-trust cryptographic protections. Under our protocol, sensitive login details (Konami ID emails, passwords, and 2FA backup codes) are encrypted on the server using AES-256-GCM before database insertion. Neither database administrators nor third parties can view your credentials in plaintext.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">1.</span> Information We Collect
          </h2>
          <p>
            To deliver secure escrow services and adhere to financial anti-fraud requirements, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Account Identity:</strong> First name, last name, username, and email address.</li>
            <li><strong>Safaricom Mobile Numbers:</strong> Collected for Daraja API v2 Lipa Na M-Pesa STK push and seller B2C withdrawals.</li>
            <li><strong>KYC Verification Documents:</strong> National ID or passport scans and facial selfies submitted voluntarily by sellers to obtain verified badges.</li>
            <li><strong>Transaction & Audit Logs:</strong> Immutable records of order timestamps, payment receipts, escrow status transitions, and IP addresses.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">2.</span> Cryptographic Vault Security
          </h2>
          <p>
            When a seller delivers game credentials for an active order:
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2">
            <p>
              • The password and backup codes are passed through an <strong>AES-256-GCM cipher</strong> with dynamic initialization vectors (IVs) and authentication tags.
            </p>
            <p>
              • Only the authenticated Buyer who completed the M-Pesa payment for that specific order ID has authorization to trigger the server-side decipher function.
            </p>
            <p>
              • After escrow completion and inspection period expiration, credential payloads are systematically archived and protected from client-side queries.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">3.</span> Third-Party Service Providers
          </h2>
          <p>
            We partner exclusively with enterprise infrastructure providers:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Safaricom PLC (Daraja API v2):</strong> Processes secure mobile money push requests and B2C payouts. Financial transactions comply with Kenyan banking regulations.</li>
            <li><strong>Supabase / PostgreSQL:</strong> Provides enterprise relational database hosting, encrypted storage, and Row Level Security (RLS) enforcement.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">4.</span> Retention & Compliance
          </h2>
          <p>
            Financial records, order numbers, and M-Pesa receipt references are retained permanently in our append-only ledger to prevent fraud, assist in dispute investigations, and satisfy commercial auditing standards.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">5.</span> Contact the Privacy Officer
          </h2>
          <p>
            For data inquiries, KYC data deletion requests, or technical security reports, contact our privacy engineering team led by <strong>Brian (FixAndLearn)</strong> at privacy@efootballmarket.com.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/terms" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline">
          Read Terms of Service →
        </Link>
      </div>
    </div>
  );
}
