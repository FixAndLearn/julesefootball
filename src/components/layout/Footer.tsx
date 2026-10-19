"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070B14] text-slate-400 text-xs mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-slate-400">
          <span className="font-bold text-white font-display text-sm tracking-tight">eFootballMarket</span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="text-emerald-400 font-medium">Safaricom Till 1572931 Escrow</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
          <span className="text-slate-700">•</span>
          <Link href="/escrow-guarantee" className="hover:text-white transition-colors">Escrow Guarantee</Link>
          <span className="text-slate-700">•</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <span className="text-slate-700">•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <span className="text-slate-700">•</span>
          <a
            href="https://wa.me/254794400365"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>0794400365</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
