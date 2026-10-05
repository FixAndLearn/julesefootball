import { Scale, ShieldAlert, Building2, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service & Escrow Agreement | eFootballMarket",
  description: "Official legal terms, user warranties, non-circumvention rules, and liability limitations of eFootballMarket Inc.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800/80 text-brand-300 text-xs font-semibold">
          <Scale className="w-4 h-4 text-brand-400" />
          <span>Institutional Escrow & Legal Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Terms of Service & Escrow Agreement
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Effective Date: October 2026. Legally binding agreement between Users and eFootballMarket Inc.
        </p>
      </div>

      {/* Corporate Governance Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Corporate Governance & Executive Administration
            </h2>
            <p className="text-xs text-brand-300 font-medium">
              Executive Office of Brian Okibo, Chief Executive Officer (CEO)
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>eFootballMarket Inc.</strong> (&quot;the Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;the Platform&quot;) operates under the executive leadership of <strong>Brian Okibo, Chief Executive Officer (CEO)</strong>. All proprietary escrow algorithms, state machines, automated M-Pesa verification engines, and cryptographic vaults are the sole intellectual and operational property of the organization.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">1.</span> Nature of the Platform & Complete Game Publisher Disclaimer
          </h2>
          <p>
            eFootballMarket operates strictly as a neutral technology service provider and non-custodial software escrow intermediary. The Platform does not create, own, sell, purchase, or take physical custody of digital game accounts. All transactions are bilateral contracts entered into directly between independent Buyers and Sellers.
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2">
            <strong className="text-amber-400 block font-semibold uppercase tracking-wider">
              Total Third-Party Publisher Disclaimers:
            </strong>
            <p>
              • <strong>Konami Digital Entertainment:</strong> eFootball™, Pro Evolution Soccer, and PES are registered trademarks of Konami Digital Entertainment Inc. eFootballMarket Inc., Brian Okibo (CEO), its directors, and officers are completely independent entities and maintain NO affiliation, sponsorship, endorsement, authorization, or commercial relationship with Konami Digital Entertainment Inc.
            </p>
            <p>
              • <strong>Console & Mobile Platform Providers:</strong> Google Play, Apple App Store, Sony PlayStation Network, Microsoft Xbox Live, and Valve Steam are trademarks of their respective owners. Neither eFootballMarket Inc. nor its CEO claims any association therewith.
            </p>
            <p>
              • <strong>Publisher Sanctions & Terms of Service:</strong> Users acknowledge that trading game credentials may conflict with third-party game publisher End User License Agreements (EULAs). The Company and its CEO bear absolute zero liability for any account bans, game suspensions, card rollbacks, or service interruptions initiated by third-party game publishers.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">2.</span> User Representations, Warranties & Legal Eligibility
          </h2>
          <p>
            By accessing or transacting on the Platform, you warrant and represent under penalty of law that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>You have reached the legal age of majority in your jurisdiction and possess full legal capacity to enter into binding agreements.</li>
            <li>If acting as a Seller, you are the sole, lawful, and original creator or unencumbered owner of the listed account, and have the unreserved legal right to transfer all associated access credentials.</li>
            <li>The account was not obtained through unauthorized access, phishing, exploitation, credential stuffing, fraud, or theft.</li>
            <li>All listing data, overall team strength (OVR) ratings, coin balances, and screenshots provided are accurate, current, and non-deceptive.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">3.</span> Absolute Hold Harmless & Indemnification Covenant
          </h2>
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs sm:text-sm text-amber-200 space-y-2">
            <strong className="block text-amber-100 font-bold uppercase tracking-wider">
              Comprehensive Defense and Hold-Harmless Obligation:
            </strong>
            <p>
              You irrevocably agree to indemnify, defend, and hold completely harmless <strong>eFootballMarket Inc., Brian Okibo (Chief Executive Officer)</strong>, and all directors, shareholders, employees, agents, and infrastructure service providers from and against ANY AND ALL claims, demands, liabilities, suits, legal proceedings, judgments, regulatory fines, losses, penalties, damages, costs, and expenses (including attorney fees and forensic costs) arising directly or indirectly from:
            </p>
            <p>
              (a) Your breach of any provision of these Terms;<br />
              (b) Your violation of any third-party right, publisher EULA, or intellectual property;<br />
              (c) Any dispute between you and any counterparty (Buyer or Seller);<br />
              (d) Any unauthorized account recovery, credential misuse, or fraud committed by you;<br />
              (e) Your tax liabilities or failure to report earnings to fiscal authorities.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">4.</span> Comprehensive Limitation of Liability & Liability Cap
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>
              <strong>Exclusion of Consequential Damages:</strong> In no event shall eFootballMarket Inc., its CEO Brian Okibo, officers, or affiliates be liable for any indirect, special, incidental, consequential, punitive, or exemplary damages, including lost gaming assets, lost profits, reputational harm, account bans, or device inaccessibility, even if advised of the possibility of such damages.
            </li>
            <li>
              <strong>Absolute Financial Liability Cap:</strong> Under all circumstances and regardless of the legal theory invoked (contract, tort, negligence, strict liability, or breach of statutory duty), the total collective liability of eFootballMarket Inc. and Brian Okibo, CEO, shall be strictly capped at and shall not exceed the lesser of: (i) the exact technology service fee retained by the Platform on the specific disputed transaction, or (ii) KES 1,000 (One Thousand Kenyan Shillings).
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">5.</span> Strict Non-Circumvention Policy & Liquidated Damages
          </h2>
          <p>
            Users are strictly prohibited from soliciting, negotiating, or executing transactions outside of the official eFootballMarket platform (including via WhatsApp, Telegram, Discord, social media, or direct peer-to-peer bank/M-Pesa transfers).
          </p>
          <p className="text-xs text-slate-400">
            Any attempt to circumvent the Platform voids all escrow protections, forfeits dispute eligibility, incurs immediate account termination, and subjects the violator to liquidated contractual damages of KES 50,000 per violation to cover investigative and enforcement costs.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">6.</span> Criminality of Post-Settlement Account Retrieval
          </h2>
          <p>
            Any Seller who attempts to reclaim, recover, reset passwords on, or report as stolen an account after escrow funds have been disbursed commits <strong>criminal theft, unlawful computer access, and fraudulent conversion</strong> under applicable cybercrime legislation.
          </p>
          <p className="text-xs text-rose-300 font-medium">
            eFootballMarket Inc. maintains an automated protocol to immediately forward the offender&apos;s full KYC identity, IP access records, M-Pesa transaction identifiers, and chat logs to national cybercrime investigation bureaus and mobile network fraud divisions for prosecution.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">7.</span> Mandatory Binding Arbitration & Class Action Waiver
          </h2>
          <p>
            All claims, disputes, or controversies arising out of or relating to these Terms or your use of the Platform shall be resolved exclusively through final and binding confidential arbitration.
          </p>
          <p className="text-xs text-slate-400">
            <strong>Class Action Waiver:</strong> YOU AND THE COMPANY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">8.</span> Severability, Governing Law & Executive Authority
          </h2>
          <p>
            These Terms constitute the entire and sole agreement between the parties regarding the subject matter herein. If any provision is deemed unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
          </p>
          <p className="text-xs text-slate-400">
            For official executive or legal correspondence, contact the Executive Office of the CEO at legal@efootballmarket.com.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/browse" className="text-xs text-brand-400 hover:text-brand-300 font-semibold underline">
          Return to Marketplace Listings →
        </Link>
      </div>
    </div>
  );
}
