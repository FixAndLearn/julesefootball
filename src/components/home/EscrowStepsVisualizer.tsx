"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  KeyRound,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface Step {
  num: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  icon: any;
  details: string[];
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Buyer Selects Squad",
    subtitle: "Verified specs & screenshot proof",
    tag: "Catalog Inspection",
    tagColor: "bg-slate-800 text-slate-300 border-slate-700",
    icon: Sparkles,
    details: [
      "Check team collective strength (OVR 3150+)",
      "Verify count of Epics, Big Time, and Coins",
      "Confirm Google Play & Game Center are unlinked",
    ],
  },
  {
    num: "02",
    title: "M-Pesa Escrow Deposit",
    subtitle: "Locked safely in Till 1572931",
    tag: "Safaricom STK Push",
    tagColor: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
    icon: CreditCard,
    details: [
      "Instant STK push prompt to your Safaricom phone",
      "Funds held in segregated Escrow Till 1572931",
      "Seller cannot access funds before buyer approval",
    ],
  },
  {
    num: "03",
    title: "Credentials Handshake",
    subtitle: "AES-256 encrypted vault delivery",
    tag: "Encrypted Vault",
    tagColor: "bg-indigo-950/70 text-indigo-300 border-indigo-700/60",
    icon: KeyRound,
    details: [
      "Seller enters Konami ID and login password",
      "Automated encryption with full audit trail",
      "Credentials revealed exclusively to the buyer",
    ],
  },
  {
    num: "04",
    title: "24-Hour Inspection & Bind",
    subtitle: "Test on device & secure account",
    tag: "Mandatory 24h Window",
    tagColor: "bg-amber-950/70 text-amber-300 border-amber-700/60",
    icon: Smartphone,
    details: [
      "Log into eFootball Mobile on your phone",
      "Bind your personal email to the Konami ID",
      "Enable Konami 2FA (Two-Factor Authentication)",
    ],
  },
  {
    num: "05",
    title: "Release Funds or Full Refund",
    subtitle: "Payout disbursed only when satisfied",
    tag: "Instant M-Pesa Payout",
    tagColor: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
    icon: CheckCircle2,
    details: [
      "Buyer clicks 'Release Funds' to disburse M-Pesa",
      "Seller receives payment directly via Daraja v2",
      "If credentials fail or misrepresented: 100% refund",
    ],
  },
];

export function EscrowStepsVisualizer() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-14 md:py-20 bg-[#0B1220] border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Safaricom Till 1572931 Security Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display tracking-tight">
            The 5-Step Escrow Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Every transaction is safeguarded by Kenya&apos;s verified gaming escrow pipeline. Zero prepayment risk.
          </p>
        </div>

        {/* 5-Step Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
                  isSelected
                    ? "bg-[#111827] border-emerald-500 shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                    : "bg-[#0E1626] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                        isSelected
                          ? "bg-[#22C55E] text-[#0B1220]"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {step.num}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${step.tagColor}`}
                    >
                      {step.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? "text-[#22C55E]" : "text-slate-400"
                      }`}
                    />
                    <h3 className="font-bold text-white text-sm leading-tight">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {step.subtitle}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-300">
                    {step.details.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#22C55E] shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight Callout Box: Why You Cannot Be Scammed */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#111827] to-emerald-950/60 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-[#22C55E] flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-black text-white font-display flex items-center gap-2">
                  <span>Why You Cannot Be Scammed</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E] text-[#0B1220] text-[10px] font-bold uppercase">
                    Guaranteed
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  The seller <strong>NEVER touches your money</strong> until you log into the account on your mobile device, verify that the squad matches all screenshots, change the Konami ID email and password, and explicitly click &apos;Release Funds&apos;. If credentials fail, you receive an immediate full refund.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/browse">
                <button
                  type="button"
                  className="px-5 py-3 rounded-xl bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>Browse Accounts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
              <Link href="/escrow-guarantee">
                <button
                  type="button"
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-colors"
                >
                  Read Escrow Rules
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
