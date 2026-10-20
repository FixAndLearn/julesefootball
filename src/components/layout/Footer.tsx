"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  Trophy,
  Swords,
  Sparkles,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site Footer"
      className="w-full border-t border-slate-800/80 bg-[#040812] text-slate-400 text-xs mt-auto pt-14 pb-28 sm:pb-14 relative overflow-hidden"
    >
      {/* Stadium ambient light effect */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Grid: 4 Organized Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & Market Identity (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-white font-display text-lg tracking-tight block leading-tight">
                  eFootballMarket
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-semibold">
                  Kenya&apos;s Escrow-Secured Squad Exchange
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Kenya&apos;s authentic peer-to-peer marketplace for inspected eFootball squads, competitive knockout tournaments, and scam-free escrow handovers with a mandatory 24-hour buyer inspection window.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Escrow Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                <span>Till 1572931</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                <span>Nairobi, KE</span>
              </span>
            </div>
          </div>

          {/* Column 2: Marketplace Navigation (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li>
                <Link
                  href="/browse"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Browse Squads
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/create-listing"
                  className="hover:text-emerald-400 transition-colors inline-block text-emerald-400 font-bold"
                >
                  + Sell Your Account
                </Link>
              </li>
              <li>
                <Link
                  href="/friday-drops"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Friday Drops
                </Link>
              </li>
              <li>
                <Link
                  href="/wanted"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Squad Requests
                </Link>
              </li>
              <li>
                <Link
                  href="/tournaments"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Tournaments &amp; Cups
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust, Rules & Protection (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Security &amp; Trust
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li>
                <Link
                  href="/escrow-guarantee"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Escrow Guarantee
                </Link>
              </li>
              <li>
                <Link
                  href="/middleman"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Middleman Service
                </Link>
              </li>
              <li>
                <Link
                  href="/scammer-check"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Scammer Blacklist
                </Link>
              </li>
              <li>
                <Link
                  href="/seller/guidelines"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Seller Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/dispute-policy"
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  Dispute Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Desk & Support (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Direct Desk &amp; Help
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fast administrative assistance for payment confirmation, escrow inquiries, and Konami ID verification.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="https://wa.me/254794400365"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800 transition-all text-xs font-semibold text-white group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[11px] text-slate-400 font-normal">WhatsApp Officer</span>
                  <span className="block text-xs font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                    0794400365 (Brian Okibo)
                  </span>
                </div>
              </a>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
                <span className="block font-medium text-slate-300">Payment Holding Till:</span>
                <span className="font-mono text-emerald-400 font-bold">Lipa Na M-Pesa 1572931</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal Links & Honest Disclaimers */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-slate-300">
              &copy; {new Date().getFullYear()} <strong>eFootballMarket Inc.</strong> All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400 max-w-2xl leading-relaxed">
              eFootball is a registered trademark of Konami Digital Entertainment. eFootballMarket is an independent peer-to-peer trading community. Safaricom PLC provides the M-Pesa payment processing rail and is not a corporate sponsor, partner, or arbitrator.
            </p>
          </div>

          <nav role="navigation" aria-label="Legal Navigation" className="shrink-0">
            <ul className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-medium text-slate-400">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/dispute-policy" className="hover:text-white transition-colors">
                  Dispute Policy
                </Link>
              </li>
              <li>
                <Link href="/escrow-guarantee" className="hover:text-white transition-colors">
                  Escrow Guarantee
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
