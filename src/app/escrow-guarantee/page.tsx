import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, Lock, ShieldCheck, ShoppingCart, Building2, AlertTriangle } from "lucide-react";
import Link from "next/link";

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
              Institutional Zero-Custody Financial Ledger
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The escrow engine of <strong>eFootballMarket Inc.</strong> was engineered under the executive direction of <strong>Brian Okibo, Chief Executive Officer (CEO)</strong>. Every shilling locked in escrow is bound to an automated PostgreSQL state machine, ensuring money is never disbursed until account access is verified by the buyer.
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
            If an account is inaccurate or recovered by the seller, our moderation team freezes the payout immediately and reviews the chat audit logs to issue a 100% refund.
          </p>
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
            <Button variant="gold" size="lg">
              Explore Escrow-Secured Accounts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
