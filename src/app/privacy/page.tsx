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
          <span>Privacy & Data Protection Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Effective Date: October 2026. How eFootballMarket processes, protects, and stores user and transaction data.
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
              Data Controller Information
            </h2>
            <p className="text-xs text-emerald-400 font-medium">
              Administration under Brian Okibo, Platform Operator
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>eFootballMarket</strong> operates this platform under the administration of <strong>Brian Okibo</strong>. Sensitive game credentials (Konami ID emails, passwords, and 2FA backup codes) are encrypted on the server prior to database storage to protect access details during escrow delivery.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">1.</span> Scope of Data Collection
          </h2>
          <p>
            To facilitate escrow transactions and dispute resolution in line with data minimization principles under the Kenya Data Protection Act, 2019, we collect only data necessary to fulfill escrow contracts:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Account Identity:</strong> Usernames, display names, and registered email addresses.</li>
            <li><strong>Financial Mobile Records:</strong> Safaricom M-Pesa phone numbers required to initiate automated STK push billing and execute seller withdrawals via Daraja API v2.</li>
            <li><strong>Seller Information:</strong> Listing details, squad overall strength (OVR), and platform information provided by sellers. Government identity card collection is currently inactive.</li>
            <li><strong>Audit & Security Logs:</strong> System logs including IP addresses, timestamps, order milestones, and M-Pesa transaction reference codes.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">2.</span> Credential Handling & Storage Security
          </h2>
          <p>
            The platform applies technical safeguards to game credentials provided during handover:
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2">
            <p>
              <strong>1. AES-256-GCM Encryption:</strong> Sensitive credentials provided during account delivery undergo symmetric Galois/Counter Mode authenticated encryption utilizing dynamic 16-byte initialization vectors (IVs) and cryptographic authentication tags before being written to the database.
            </p>
            <p>
              <strong>2. Access Gating:</strong> Server-side credential decryption is restricted to authorized transaction parties during the active handover window, or to platform administrators during formal dispute investigations (with administrative access logged to audit tables).
            </p>
            <p>
              <strong>3. Access Lockout & Storage Limits:</strong> Client access to reveal credentials is automatically locked out upon order cancellation or refund, and seller access is terminated upon order completion. When credentials are scheduled for retention purging, database columns are nullified. Please note that database-level nullification removes application access, while residual data in database transaction logs (WAL) and cloud provider backups persists until provider backup retention windows expire.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">3.</span> Sub-Processors & Infrastructure
          </h2>
          <p>
            Platform data is processed through the following external service providers:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Safaricom PLC:</strong> Telecommunications gateway for Daraja API v2 M-Pesa payment processing.</li>
            <li><strong>Supabase / PostgreSQL:</strong> Cloud database infrastructure enforcing Row Level Security (RLS) on database tables.</li>
            <li><strong>Google LLC (Google AdSense & Google Analytics 4):</strong> Advertising delivery and telemetry operating strictly under Google Consent Mode v2 in compliance with the Kenya Data Protection Act, 2019.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">4.</span> Financial Records & Credential Retention
          </h2>
          <p>
            In accordance with statutory accounting standards and Section 39 of the Kenya Data Protection Act, 2019, transaction ledgers, checkout request IDs, and M-Pesa receipt numbers are retained to reconcile payments and resolve financial inquiries. Ephemeral game account credentials are kept separately from financial ledgers in accordance with the principle of storage limitation under Section 30(1)(e) and the Data Protection (General) Regulations, 2021 (Regulations 19 &amp; 20).
          </p>
        </section>

        {/* Section 5: Google AdSense & Third-Party Advertising Policy (Mandatory AdSense Compliance) */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">5.</span> Google AdSense, Cookies &amp; Third-Party Advertising
          </h2>
          <p>
            eFootballMarket displays advertisements served by Google AdSense (Google LLC) to support free platform operations and community trading tools. In compliance with Google Publisher Policies, we disclose the following advertising data practices:
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2.5">
            <p>
              <strong>1. Third-Party Advertising Cookies:</strong> Third-party vendors, including Google, use cookies, web beacons, and unique device identifiers to serve advertisements based on a user&apos;s prior visits to this website or other websites on the Internet.
            </p>
            <p>
              <strong>2. Personalized Advertising:</strong> Google&apos;s use of advertising cookies enables it and its certified ad partners to serve relevant advertisements to users based on their navigation history across eFootballMarket and other websites.
            </p>
            <p>
              <strong>3. How to Opt Out of Personalized Ads:</strong> Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">Google Ads Settings</a>. Alternatively, users can opt out of third-party vendors&apos; use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">www.aboutads.info/choices</a> or the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">Network Advertising Initiative Consumer Opt-Out</a>.
            </p>
            <p>
              <strong>4. Google Consent Mode v2:</strong> In adherence to Kenya Data Protection Act (2019) and global privacy directives, advertising cookies and analytics tags are governed by user consent. You can modify your consent settings anytime by tapping <strong>&quot;Cookie Preferences &amp; Consent&quot;</strong> in our website footer.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-emerald-400">6.</span> Data Subject Rights &amp; Inquiries
          </h2>
          <p>
            Under the Kenya Data Protection Act, 2019, users have rights including the right to be informed, access personal data, request rectification of false or misleading data, and request erasure of personal data that is no longer necessary, subject to statutory record-retention requirements. To submit data inquiries, contact privacy@efootballmarket.co.ke or WhatsApp +254 794 400 365.
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
