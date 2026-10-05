import { AlertTriangle, CheckCircle2, FileCheck, Scale, ShieldAlert, UserCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dispute Resolution Policy | eFootballMarket",
  description: "Official rules and arbitration procedures for eFootballMarket escrow disputes.",
};

export default function DisputePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-400 text-xs font-semibold">
          <Scale className="w-4 h-4" />
          <span>Fair Arbitration & Escrow Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Dispute Resolution Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          How disputes are investigated, audited, and resolved under the eFootballMarket escrow engine.
        </p>
      </div>

      {/* Creator & Arbitration Framework */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Arbitration Standards Designed by Brian (FixAndLearn / Jules)
            </h2>
            <p className="text-xs text-slate-400">
              Objective, Audit-Logged Dispute Examination
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The dispute mediation protocols were designed by <strong>Brian (FixAndLearn / Jules)</strong> to provide complete protection against both rogue sellers who attempt account recoveries and fraudulent buyers seeking false refunds. All determinations are anchored in tamper-proof cryptographic logs and uncut video proof.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-amber-400">1.</span> Valid Grounds for Opening an Escrow Dispute
          </h2>
          <p>
            A buyer may open a dispute only within the active <strong>24-hour inspection window</strong> following credential delivery for the following verified reasons:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs">
              <strong className="text-slate-100 block mb-1">Invalid Credentials</strong>
              <p className="text-slate-400">The Konami ID email or password provided fails authentication and cannot access the game.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs">
              <strong className="text-slate-100 block mb-1">Squad Disparity</strong>
              <p className="text-slate-400">Key listed Epic/Big Time players or advertised eFootball Coins are missing from the account.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs">
              <strong className="text-slate-100 block mb-1">Account Recovered by Seller</strong>
              <p className="text-slate-400">The seller changes the password or triggers a recovery link during or immediately after the transfer.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs">
              <strong className="text-slate-100 block mb-1">Seller Unresponsive</strong>
              <p className="text-slate-400">The seller failed to provide required 2-Step Verification codes within the delivery SLA.</p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-amber-400">2.</span> Required Evidence Standards
          </h2>
          <p>
            To substantiate a dispute claim, the claimant must upload clear evidence into the dispute queue:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Continuous Screen Recording:</strong> An uncut video showing the login attempt from the official eFootball app or Konami ID portal.</li>
            <li><strong>Squad Overview Screenshot:</strong> High-definition screenshot demonstrating the disparity in overall team strength or player cards.</li>
            <li><strong>Chat Logs:</strong> All communications must have taken place in the official order chatbox. External screenshots are subject to heightened scrutiny.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-amber-400">3.</span> Investigation Timeline & Outcomes
          </h2>
          <p>
            Upon dispute submission, the escrow contract is immediately locked:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Seller Response (12h):</strong> The seller is notified to provide rebuttal evidence or corrective credentials.</li>
            <li><strong>Moderator Determination (24h):</strong> An authorized platform administrator reviews all submissions.</li>
            <li><strong>Resolution - Buyer Refund:</strong> If seller fault or account invalidity is proven, 100% of funds are refunded to the buyer.</li>
            <li><strong>Resolution - Seller Payout:</strong> If the claim is verified as fraudulent buyer remorse or malicious tampering, funds are released to the seller.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-amber-400">4.</span> Finality of Decisions
          </h2>
          <p>
            Decisions rendered by the eFootballMarket dispute arbitration team are final and legally binding on all participants. Malicious dispute abuse results in permanent blacklisting and suspension of available balances.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/escrow-guarantee" className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline">
          View Escrow Guarantee Rules →
        </Link>
      </div>
    </div>
  );
}
