import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, Lock, ShieldCheck, ShoppingCart, Building2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escrow Guarantee & Buyer Protection | eFootballMarket Kenya",
  description:
    "Learn how eFootballMarket's automated M-Pesa escrow vault protects your money and account transfers with a 24-hour buyer inspection window.",
};

export default function EscrowGuaranteePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Non-Custodial Escrow Security Model</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          eFootballMarket Escrow Guarantee
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          Our financial architecture prevents gaming account fraud by removing direct peer-to-peer payments.
        </p>
      </div>

      {/* Corporate Governance Notice */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Escrow Architecture Governed by Brian Okibo, CEO
            </h2>
            <p className="text-xs text-emerald-400 font-medium">
              Secure Automated M-Pesa Escrow (Till 1572931)
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The escrow engine of <strong>eFootballMarket Inc.</strong> was engineered under the executive direction of <strong>Brian Okibo, Chief Executive Officer (CEO)</strong>. Every shilling locked in escrow is bound to an automated transaction system, ensuring money is never disbursed to the seller until the account access is fully verified by the buyer.
        </p>
      </div>

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">1. Locked Funds Until Full Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you complete an M-Pesa STK push, your money does not enter the seller&apos;s bank or phone. It is held securely in our segregated escrow account until you log into the game and inspect the squad.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-950/60 border border-brand-800/60 flex items-center justify-center text-brand-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">2. 24-Hour Inspection Window</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Buyers receive a full 24 hours from the exact timestamp the seller delivers the credentials to log in, verify that all Epics and coins match the listing, and bind their own email.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">3. AES-256 Encrypted Credential Vault</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Konami ID passwords and backup codes are never stored in plaintext. They are encrypted using authenticated AES-256-GCM and can only be decrypted by the verified buyer.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">4. Dispute & Refund Arbitration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If an account is inaccurate or recovered by the seller, our moderation team freezes the payout immediately and reviews the chat audit logs to issue a full refund under our dispute resolution terms.
          </p>
        </div>
      </div>

      {/* 24-Hour Inspection Lifecycle Timeline */}
      <div className="p-6 sm:p-8 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Inspection Lifecycle Roadmap</span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            The 24-Hour Verification Timeline
          </h2>
          <p className="text-xs text-slate-400">
            From M-Pesa STK push to final seller payout, every minute is protected.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <span className="font-mono font-bold text-emerald-400 text-sm block">00:00</span>
            <strong className="text-white block font-semibold">Payment Locked</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Buyer completes STK push to Till 1572931. Funds are locked into neutral escrow.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <span className="font-mono font-bold text-amber-400 text-sm block">&lt; 12:00</span>
            <strong className="text-white block font-semibold">Credentials Sent</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Seller deposits login details into the AES-256 encrypted vault for buyer decryption.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <span className="font-mono font-bold text-indigo-400 text-sm block">12:00 – 24:00</span>
            <strong className="text-white block font-semibold">Account Inspection</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Buyer logs in on mobile, verifies OVR & players, changes registered email, and enables 2FA.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
            <span className="font-mono font-bold text-emerald-400 text-sm block">24:00</span>
            <strong className="text-white block font-semibold">Instant Disbursement</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Buyer confirms delivery or 24 hours elapse without dispute; funds disburse to seller M-Pesa.
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Institutional Fee Structure */}
      <div className="p-6 sm:p-8 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-display">
            Transparent Escrow Fee Schedule
          </h2>
          <p className="text-xs text-slate-400">
            No hidden surcharges. All fees are transparently displayed before transaction confirmation.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-pitch-border text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Buyer Fee</th>
                <th className="py-3 px-4">Seller Fee</th>
                <th className="py-3 px-4">Processing Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-border/60 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Marketplace Listing Purchase</td>
                <td className="py-3 px-4 text-[#22C55E] font-bold">0% (Free)</td>
                <td className="py-3 px-4">5% (Deducted from payout)</td>
                <td className="py-3 px-4 font-mono">Instant STK Push</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Bring-Your-Own-Deal Middleman</td>
                <td className="py-3 px-4 text-[#22C55E] font-bold">0% (Free)</td>
                <td className="py-3 px-4">5% (Min KES 100)</td>
                <td className="py-3 px-4 font-mono">Instant STK Push</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Dispute Investigation & Arbitration</td>
                <td className="py-3 px-4 text-[#22C55E] font-bold">0% (Free)</td>
                <td className="py-3 px-4 text-[#22C55E] font-bold">0% (Free)</td>
                <td className="py-3 px-4 font-mono">&lt; 4 Hours</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules list */}
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-100 font-display">
          Mandatory Escrow Rules for All Traders
        </h2>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Never communicate outside the eFootballMarket order chat. External WhatsApp or Telegram agreements cannot be audited during disputes.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Sellers must deliver login credentials within 12 hours of payment receipt or the order is automatically eligible for buyer cancellation.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Buyers must confirm delivery once the account is secured. If no dispute is filed within 24 hours, funds automatically release to protect the seller.</span>
          </li>
        </ul>

        <div className="pt-4 flex justify-center">
          <Link href="/browse">
            <Button variant="primary" size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl shadow-xs">
              Explore Escrow-Secured Accounts
            </Button>
          </Link>
        </div>
      </div>

      {/* Safaricom Payment Infrastructure & Neutral Role Notice */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1424] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Safaricom&apos;s Role in Payment &amp; Escrow Holding
            </h3>
            <p className="text-xs text-slate-400">
              Lipa Na M-Pesa Payment Rail &amp; Holding Till 1572931
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed pt-2">
          <div className="p-4 rounded-xl bg-[#070D18] border border-slate-800/80 space-y-1.5">
            <strong className="text-white block font-semibold">Payment Processing Gateway</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Safaricom Lipa Na M-Pesa provides the telecommunications payment rail (STK Push via Daraja API) to execute instantaneous, cashless shillings transfers directly from buyers&apos; phones.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#070D18] border border-slate-800/80 space-y-1.5">
            <strong className="text-white block font-semibold">Independent Platform Notice</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Safaricom PLC is our telecommunications payment processor and is not a corporate sponsor, partner, or arbitrator of gaming trades. All escrow dispute arbitration is conducted exclusively by eFootballMarket administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
