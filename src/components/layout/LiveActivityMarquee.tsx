"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export interface TickerItem {
  id: string;
  badge: string;
  badgeColor: string;
  text: string;
  link?: string;
}

// Authentic marketplace announcements & high-converting platform advertisements
// (Zero fake orders, zero mock data — pure real platform promotions & safety rules)
const PROMOTIONAL_TICKER_ITEMS: TickerItem[] = [
  {
    id: "promo-sell",
    badge: "📢 SELL ACCOUNT",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    text: "Got a high-OVR squad? List for free on Kenya's #1 eFootball hub & get instant M-Pesa payouts",
    link: "/seller/create-listing",
  },
  {
    id: "promo-escrow",
    badge: "🛡️ TILL 1572931 ESCROW",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    text: "Never send money directly on WhatsApp | Funds stay locked in Till 1572931 until you test the Konami login",
    link: "/escrow-guarantee",
  },
  {
    id: "promo-scammer",
    badge: "🚨 SCAMMER CHECK",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    text: "Verify trader phone numbers & WhatsApp handles against Kenya's Official Scammer Blacklist",
    link: "/scammer-check",
  },
  {
    id: "promo-friday",
    badge: "🔥 FRIDAY FLASH DROPS",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    text: "Curated high-OVR squads up to 50% OFF every Friday (12:00 AM – 11:59 PM EAT)",
    link: "/#friday-drops",
  },
  {
    id: "promo-wanted",
    badge: "⚡ WANTED BOARD",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    text: "Looking for Blitz Curler Son, Vieira or Bully Messi? Post your request on our Wanted Board",
    link: "/wanted",
  },
  {
    id: "promo-safety",
    badge: "🔒 2FA SAFETY RULE",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    text: "Safety protocol: Always verify Google Play / Apple ID is unlinked before changing Konami ID email",
    link: "/escrow-guarantee",
  },
];

export function LiveActivityMarquee() {
  const [items, setItems] = useState<TickerItem[]>(PROMOTIONAL_TICKER_ITEMS);

  // Fetch real published listings and platform announcements from API
  useEffect(() => {
    let isMounted = true;

    async function loadActivity() {
      try {
        const res = await fetch("/api/activity", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      } catch (err) {
        // Fall back gracefully to promotional items
        console.warn("Live activity feed note:", err);
      }
    }

    loadActivity();

    // Listen to real-time listing inserts via Supabase WebSocket
    const supabase = createClient();
    const channel = supabase
      .channel("public-activity-ticker")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "listings",
        },
        (payload: any) => {
          if (!payload.new || payload.new.status !== "published") return;
          const newListing = payload.new;
          const newItem: TickerItem = {
            id: `real-${newListing.id}`,
            badge: "⚡ NEW SQUAD DROPPED",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
            text: `${newListing.title} (${newListing.overall_team_strength} OVR) listed for KSh ${Number(newListing.price).toLocaleString()} | Till 1572931 Protected`,
            link: `/listings/${newListing.id}`,
          };
          setItems((prev) => [newItem, ...prev.slice(0, 10)]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Double the list so CSS marquee flows smoothly without jumping
  const marqueeList = items.concat(items);

  return (
    <div className="w-full bg-[#070B14] border-b border-slate-800/80 overflow-hidden py-1.5 text-[11px] relative select-none">
      <div className="flex items-center">
        {/* Static Prefix pill on larger screens */}
        <div className="hidden md:flex items-center gap-1.5 pl-4 pr-3 py-0.5 border-r border-slate-800 bg-[#070B14] shrink-0 z-10 text-slate-400 font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] uppercase tracking-wider text-emerald-400">
            LIVE MARKET FEED
          </span>
        </div>

        {/* Marquee Scroller */}
        <div className="flex overflow-x-hidden whitespace-nowrap group">
          <div className="inline-flex items-center gap-8 animate-marquee group-hover:[animation-play-state:paused]">
            {marqueeList.map((item, idx) => (
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
                <span className="text-slate-800 mx-2">|</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
