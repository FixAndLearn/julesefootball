import React from "react";
import { Metadata } from "next";
import { ScammerLookupTool } from "@/components/scammer/ScammerLookupTool";
import { AdBanner } from "@/components/common/AdBanner";
import { ShieldAlert, AlertTriangle, ShieldCheck, Lock, Phone, MessageCircle, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live Scammer Blacklist & Fraud Checker | eFootballMarket Kenya",
  description:
    "Verify Kenyan phone numbers, WhatsApp accounts, and trader handles against our community scammer blacklist before buying or selling eFootball accounts.",
};

export default function ScammerCheckPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Kenyan eFootball Anti-Fraud Advisory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight">
          Scammer Blacklist Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Verify any Kenyan phone number, WhatsApp contact, or trader handle against verified escrow dispute records and community incident reports before transacting.
        </p>
      </div>

      {/* Interactive Tool Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Instant Trader Verification</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Search by 10-digit Kenyan phone number (e.g. 0712345678), international format (+254...), or username handle.
          </p>
        </div>

        <ScammerLookupTool />
      </div>

      {/* Top 3 Scams in Kenyan eFootball Trading */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Fraud Prevention Advisory</span>
          </div>
          <h2 className="text-2xl font-black text-white font-display">
            The 3 Most Common Scams in Kenya & How to Stay Safe
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-white">Direct M-Pesa Prepayment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The seller promises to send the Konami ID right after you send M-Pesa to their personal number, then blocks you immediately.
            </p>
            <div className="pt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Use Till 1572931 Escrow</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-white">Fake Middleman Profiles</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scammers clone community admins&apos; photos and numbers on WhatsApp groups to steal squads pretending to be trusted escrow brokers.
            </p>
            <div className="pt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Check 0794400365 Helpline</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-white">Post-Sale Account Recovery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The seller hands over the account, waits for payment, then resets the password via linked recovery email or unlinked Google Play ID.
            </p>
            <div className="pt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>24H Mandatory Inspection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsored Ad Unit */}
      <AdBanner slot="scammer_check_bottom" format="horizontal" />

      {/* Community Report Callout */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white">Encountered an Impersonator or Scammer?</h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Submit screenshots, M-Pesa transaction statements, or phone numbers directly to our desk. We review evidence promptly and flag bad actors to protect the community.
          </p>
        </div>

        <a
          href="https://wa.me/254794400365?text=Hello%20Brian%2C%20I%20want%20to%20report%20a%20scammer%20number"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 shrink-0 border border-slate-700 active:scale-95 transition-all"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>Report to Admin (0794400365)</span>
        </a>
      </div>
    </div>
  );
}
