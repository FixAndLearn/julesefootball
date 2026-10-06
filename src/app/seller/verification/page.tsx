"use client";

import { SellerVerificationFormPreserved } from "@/components/kyc/SellerVerificationFormPreserved";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Lock,
  PlusCircle,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SellerVerificationPage() {
  const searchParams = useSearchParams();
  const [showPreview, setShowPreview] = useState(searchParams.get("preview") === "true");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Back Link */}
      <Link
        href="/dashboard/seller"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Seller Dashboard</span>
      </Link>

      {/* Hero Badge & Heading */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>Regulatory Licensing in Progress</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
          Seller Identity Verification (KYC)
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Official Government ID verification is coming soon as we finalize formal accreditation and compliance certifications.
        </p>
      </div>

      {/* Coming Soon Announcement Card */}
      <div className="bg-gradient-to-b from-pitch-surface to-pitch-card border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-pitch-border/80 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Why is KYC Scheduled for Coming Soon?</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict adherence to Kenyan data protection laws and gaming regulations.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            To protect user privacy and uphold institutional compliance, government identity card uploads are queued until our formal regulatory framework certification is fully authorized. We prioritize safeguarding our community’s personal identifiable information (PII).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-pitch-surface/90 border border-pitch-border space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero Blockers for Sellers</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                You can create listings, publish your squads, and sell immediately. No waiting for KYC approval.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-pitch-surface/90 border border-pitch-border space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Lock className="w-4 h-4 shrink-0" />
                <span>100% Escrow Protected</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All transactions are enforced by automated Safaricom M-Pesa escrow. Payouts are locked until the buyer inspects credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-4 border-t border-pitch-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ready to trade? Start listing today without KYC delays.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href="/seller/create-listing" className="w-full sm:w-auto">
              <Button variant="gold" size="sm" className="w-full font-bold shadow-md">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                List Your Squad Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin / Preview Gating */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-[11px] text-slate-500 hover:text-slate-300 underline transition-colors"
        >
          {showPreview ? "Hide Preserved KYC Module" : "Technical Inspection: Preview Preserved KYC Module"}
        </button>
      </div>

      {/* Preserved Form Preview when toggled */}
      {showPreview && (
        <div className="space-y-4 pt-4 border-t border-pitch-border animate-in fade-in">
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 text-xs flex items-center justify-between">
            <span>🛡️ Preserved KYC System Preview (Code is safe and intact)</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-900">Developer Mode</span>
          </div>
          <SellerVerificationFormPreserved />
        </div>
      )}
    </div>
  );
}
