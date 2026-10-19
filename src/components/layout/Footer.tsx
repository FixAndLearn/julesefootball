"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070B14] text-slate-400 text-xs mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Left: Brand, Copyright & Escrow Badge */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className="font-bold text-white font-display text-sm tracking-tight">
            eFootballMarket
          </span>
          <span className="text-slate-500">© {new Date().getFullYear()}</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-medium text-[11px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Till 1572931 Escrow</span>
          </span>
        </div>

        {/* Right: Terms & Links with clean modern spacing (zero dots) */}
        <nav aria-label="Footer Links" className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-400">
          <Link href="/browse" className="hover:text-white transition-colors">
            Browse
          </Link>
          <Link href="/escrow-guarantee" className="hover:text-white transition-colors">
            Escrow Guarantee
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <a
            href="https://wa.me/254794400365"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Support: 0794400365</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
