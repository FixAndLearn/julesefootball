import { AlertTriangle, CheckCircle2, FileCheck, Scale, ShieldAlert, Building2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dispute Resolution & Arbitration Policy | eFootballMarket",
  description: "Official arbitration protocol, evidentiary standards, and dispute mechanics of eFootballMarket Inc.",
};

export default function DisputePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-400 text-xs font-semibold">
          <Scale className="w-4 h-4" />
          <span>Judicial Arbitration & Escrow Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Dispute Resolution & Arbitration Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Standardized investigation rules and binding determinations governing eFootballMarket transactions.
        </p>
      </div>

      {/* Corporate Governance Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Arbitration Framework Established by Brian Okibo, CEO
            </h2>
            <p className="text-xs text-amber-400 font-medium">
              Objective, Forensically Audited Evidence Examination
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The dispute mediation and arbitration protocols of <strong>eFootballMarket Inc.</strong> were established under the executive leadership of <strong>Brian Okibo, Chief Executive Officer (CEO)</strong>. The system provides an impartial judicial mechanism to shield legitimate parties against fraud, rogue account retrievals, and bad-faith refund demands.
        </p>
      </div>

      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-xl space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-amber-400">1.</span> Exclusive Grounds for Filing a Dispute
          </h2>
          <p>
            A formal escrow dispute may ONLY be submitted during the active <strong>24-hour inspection window</strong> following credential delivery for one of the following documented reasons:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs">
              <strong className="text-slate-100 block mb-1">Invalid / Inaccessible Credentials</strong>
              <p className="text-slate-400">The provided Konami ID credentials fail login authentication and prevent game entry.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs">
              <strong className="text-slate-100 block mb-1">Material Squad Disparity</strong>
              <p className="text-slate-400">Account overall team strength (OVR) is significantly lower than advertised or key Epic/Big Time players are missing.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs">
              <strong className="text-slate-100 block mb-1">Account Recovered by Seller</strong>
              <p className="text-slate-400">The seller alters access credentials or initiates an account recovery link during the transaction.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs">
              <strong className="text-slate-100 block mb-1">Seller Delivery Default</strong>
              <p className="text-slate-400">The seller failed to deliver credentials within the mandatory 12-hour SLA.</p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-amber-400">2.</span> Evidentiary Standards & Strict Burden of Proof
          </h2>
          <p>
            The burden of proof rests entirely upon the claimant. Claims without verifiable, continuous digital proof are dismissed automatically:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Continuous, Uncut Screen Recording:</strong> A full video demonstrating the login attempt on the official Konami ID portal or eFootball application.</li>
            <li><strong>Squad Overview Proof:</strong> High-resolution screen captures showing the discrepancy in overall team strength or coin balances.</li>
            <li><strong>Order Chat Audit:</strong> Communications must occur within the order chat. External communications (WhatsApp/Telegram) are categorically inadmissible.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="text-amber-400">3.</span> Finality of Rulings & Immunity of the Arbitrator
          </h2>
          <p>
            Decisions issued by the eFootballMarket Inc. dispute panel are final, conclusive, and non-appealable:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Immunity of Arbitrators:</strong> Users agree that eFootballMarket Inc., Brian Okibo (CEO), and appointed moderators act solely as neutral third-party arbiters and shall have absolute immunity from civil claims or financial liability regarding dispute determinations.</li>
            <li><strong>Dispute Abuse Penalties:</strong> Submitting fraudulent evidence or opening frivolous disputes results in permanent profile ban, forfeiture of account balance, and referral to mobile money fraud systems.</li>
          </ul>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/terms" className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline">
          Review Terms of Service & Escrow Agreement →
        </Link>
      </div>
    </div>
  );
}
