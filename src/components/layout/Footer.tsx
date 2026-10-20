"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site Footer"
      className="w-full border-t border-slate-800/80 bg-[#060B14] text-slate-400 text-xs mt-auto pt-8 pb-24 sm:pb-8 relative overflow-hidden"
    >
      {/* Subtle top edge glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Row: Brand Badge + Theme Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-white font-display text-base tracking-tight block">
                eFootballMarket
              </span>
              <span className="text-[10px] text-slate-400 block">
                Kenya&apos;s Escrow Squad Exchange
              </span>
            </div>
            <span className="ml-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Till 1572931</span>
            </span>
          </div>

          {/* Theme Toggle (Dark / Bright Mode) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Theme:</span>
            <ThemeToggle showLabel className="px-3 py-1.5" />
          </div>
        </div>

        {/* Middle Row: Curated Navigation Links */}
        <nav role="navigation" aria-label="Footer Navigation" className="pt-2 border-t border-slate-800/60">
          <ul className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2.5 text-xs font-medium text-slate-300">
            <li>
              <Link href="/browse" className="hover:text-emerald-400 transition-colors">
                Browse Accounts
              </Link>
            </li>
            <li>
              <Link href="/seller/create-listing" className="hover:text-emerald-400 transition-colors text-emerald-400 font-bold">
                + Sell Account
              </Link>
            </li>
            <li>
              <Link href="/escrow-guarantee" className="hover:text-emerald-400 transition-colors">
                Escrow Guarantee
              </Link>
            </li>
            <li>
              <Link href="/middleman" className="hover:text-emerald-400 transition-colors">
                Middleman Service
              </Link>
            </li>
            <li>
              <Link href="/tournaments" className="hover:text-emerald-400 transition-colors">
                Tournaments
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <a
                href="https://wa.me/254794400365"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Support: 0794400365</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Bottom Row: Copyright & Honest Non-Affiliation Disclaimer */}
        <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} eFootballMarket Inc. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-400 max-w-xl">
            Independent peer-to-peer eFootball trading platform. Not affiliated with Konami or Safaricom PLC.
          </p>
        </div>
      </div>
    </footer>
  );
}
