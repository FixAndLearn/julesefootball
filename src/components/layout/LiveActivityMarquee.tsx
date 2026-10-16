"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Flame, Zap, CheckCircle2 } from "lucide-react";

interface TickerItem {
  id: string;
  badge: string;
  badgeColor: string;
  text: string;
  link?: string;
  icon: "escrow" | "alert" | "drops" | "verified";
}

const TICKER_ITEMS: TickerItem[] = [
  {
    id: "1",
    badge: "ESCROW ACTIVE",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    text: "KSh 4,500 locked safely in Till 1572931 for Order #EF-809",
    link: "/escrow-guarantee",
    icon: "escrow",
  },
  {
    id: "2",
    badge: "SCAMMER ALERT",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    text: "New WhatsApp impersonator flagged • Always trade through Till 1572931",
    link: "/scammer-check",
    icon: "alert",
  },
  {
    id: "3",
    badge: "FRIDAY DROPS",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    text: "Up to 50% OFF Verified Epic Squads • Every Friday 12:00 AM – 11:59 PM EAT",
    link: "/#friday-drops",
    icon: "drops",
  },
  {
    id: "4",
    badge: "DELIVERY CONFIRMED",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    text: "3240 OVR Messi Booster squad transferred safely to Nairobi gamer",
    link: "/browse",
    icon: "verified",
  },
  {
    id: "5",
    badge: "DPA COMPLIANT",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    text: "Mandatory 24-Hour Buyer Inspection Window with AES-256 Vault transfer",
    link: "/escrow-guarantee",
    icon: "escrow",
  },
];

export function LiveActivityMarquee() {
  return (
    <div className="w-full bg-[#070B14] border-b border-slate-800/80 overflow-hidden py-1.5 text-[11px] relative select-none">
      <div className="flex items-center">
        {/* Static Prefix pill on larger screens */}
        <div className="hidden md:flex items-center gap-1.5 pl-4 pr-3 py-0.5 border-r border-slate-800 bg-[#070B14] shrink-0 z-10 text-slate-400 font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] uppercase tracking-wider text-emerald-400">LIVE TRUST FEED</span>
        </div>

        {/* Marquee Scroller */}
        <div className="flex overflow-x-hidden whitespace-nowrap group">
          <div className="inline-flex items-center gap-8 animate-marquee group-hover:[animation-play-state:paused]">
            {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={item.link || "/escrow-guarantee"}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <span
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <span className="text-slate-300 font-medium">{item.text}</span>
                <span className="text-slate-700 mx-2">•</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
