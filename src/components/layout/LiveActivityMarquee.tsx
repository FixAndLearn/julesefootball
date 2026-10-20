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
    badge: "SELL SQUAD",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    text: "List your high-OVR squad with low escrow fees (KES 50 - 500) & automated Safaricom M-Pesa payouts",
    link: "/seller/create-listing",
  },
  {
    id: "promo-escrow",
    badge: "ESCROW PROTOCOL",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    text: "Funds remain safely locked in Safaricom Till 1572931 until you inspect and bind your Konami ID",
    link: "/escrow-guarantee",
  },
  {
    id: "promo-scammer",
    badge: "FRAUD ADVISORY",
    badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    text: "Verify trader phone numbers and WhatsApp contacts against Kenya's official community blacklist",
    link: "/scammer-check",
  },
  {
    id: "promo-friday",
    badge: "FRIDAY DROPS",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    text: "Curated high-OVR squad drops unlock every Friday (2:00 PM – 10:00 PM EAT) via Till 1572931 escrow",
    link: "/friday-drops",
  },
  {
    id: "promo-wanted",
    badge: "WANTED BOARD",
    badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    text: "Looking for specific meta cards like Blitz Curler Son or Vieira? Post a request on the Wanted Board",
    link: "/wanted",
  },
  {
    id: "promo-safety",
    badge: "SECURITY NOTICE",
    badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    text: "Mandatory check: Ensure Google Play & Game Center are unlinked before confirming email transfers",
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
    <div className="hidden sm:block w-full bg-[#060B14] border-b border-pitch-border overflow-hidden py-1.5 text-[11px] relative select-none">
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
