import { ShieldCheck, Scale, AlertTriangle, FileText, UserCheck, Lock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | eFootballMarket",
  description: "Official legal terms of service, escrow agreements, and non-circumvention policies for eFootballMarket.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800/80 text-brand-300 text-xs font-semibold">
          <Scale className="w-4 h-4 text-brand-400" />
          <span>Legal Agreement & Escrow Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Last revised: October 2026. Please read these terms carefully before utilizing the eFootballMarket platform.
        </p>
      </div>

      {/* Creator & Platform Origin Disclosure */}
      <div className="p-6 rounded-2xl bg-brand-950/40 border border-brand-800/60 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Platform Architecture & Creator Attribution
            </h2>
            <p className="text-xs text-brand-300">
              Founded & Architected by <strong className="text-white">Brian (@FixAndLearn / Jules)</strong>
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>eFootballMarket</strong> was conceived, designed, and engineered by <strong>Brian (FixAndLearn / Jules)</strong> as an institutional-grade, escrow-secured digital marketplace. All proprietary software algorithms, non-custodial escrow state engines, cryptographic credential vaults, and Daraja M-Pesa automated transaction pipelines are the exclusive intellectual property of the Creator and eFootballMarket.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">1.</span> Nature of the Platform & Disclaimer
          </h2>
          <p>
            eFootballMarket operates strictly as a neutral technology provider, escrow software engine, and marketplace intermediary. The platform facilitates peer-to-peer digital gaming account exchanges by holding funds in escrow until transaction terms are verified.
          </p>
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-400 space-y-1">
            <strong className="text-slate-200 block">Konami Digital Entertainment Trademark Disclaimer:</strong>
            <p>
              eFootball™ and PES™ are registered trademarks of Konami Digital Entertainment Inc. eFootballMarket, its founder Brian (FixAndLearn), and operating entities are independent third-party entities and are NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with Konami Digital Entertainment or any of its subsidiaries.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">2.</span> Escrow Mechanics & Settlement
          </h2>
          <p>
            By placing an order on eFootballMarket, both Buyer and Seller irrevocably agree to the following financial mechanics:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm pl-2">
            <li>
              <strong>Non-Custodial Holding:</strong> All payments completed via Safaricom Lipa Na M-Pesa STK Push are locked immediately into the automated escrow ledger. Funds are NEVER paid directly to the seller prior to verification.
            </li>
            <li>
              <strong>12-Hour Seller Delivery SLA:</strong> Sellers must submit verified Konami ID login credentials via the encrypted vault within twelve (12) hours of payment receipt. Failure to deliver allows the Buyer to initiate an automatic cancellation and refund.
            </li>
            <li>
              <strong>24-Hour Inspection Window:</strong> Once credentials are submitted, the Buyer has a maximum of twenty-four (24) hours to log into the account, verify the squad composition (overall team strength, coin balance, and Epic/Big Time players), and bind their own security credentials.
            </li>
            <li>
              <strong>Automated Final Settlement:</strong> If the Buyer verifies the account, or fails to file a formal dispute within the 24-hour inspection window, the escrow contract settles automatically, releasing the net payout to the Seller&apos;s available ledger balance.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">3.</span> Non-Circumvention Policy
          </h2>
          <p>
            Users are strictly forbidden from taking communications, account deliveries, or payment settlements off-platform (such as via WhatsApp, Telegram, Discord, or direct M-Pesa send money). Any off-platform agreement voids all escrow protections, forfeits dispute eligibility, and leads to immediate permanent account suspension.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">4.</span> Absolute Post-Sale Account Security & Fraud
          </h2>
          <p>
            Sellers legally warrant that they are the legitimate owner of the listed account with full rights to transfer all access. Recovering, resetting, or retrieving an account after funds have been released from escrow constitutes <strong>theft and fraudulent conversion</strong> under applicable cybercrimes legislation. eFootballMarket reserves the right to report offender identity and KYC documentation to relevant law enforcement and mobile money authorities.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">5.</span> Platform Fees & Withdrawal Thresholds
          </h2>
          <p>
            eFootballMarket deducts a 5% technology and escrow maintenance fee from the gross order price upon successful completion. Sellers can withdraw their available balance to their registered M-Pesa line at any time, subject to a minimum withdrawal threshold of KES 200.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">6.</span> Limitation of Liability & Creator Protection
          </h2>
          <p>
            To the maximum extent permitted by applicable law, neither eFootballMarket, its founder <strong>Brian (FixAndLearn / Jules)</strong>, officers, employees, nor agents shall be held liable for any indirect, punitive, consequential, or exemplary damages, including account bans initiated by third-party game publishers, server maintenance downtimes, or improper post-delivery password management by the buyer.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-brand-400">7.</span> Amendments & Acceptance
          </h2>
          <p>
            Continued usage of eFootballMarket constitutes unconditional acceptance of these terms. For legal inquiries or dispute arbitration, contact the platform administration at legal@efootballmarket.com.
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
