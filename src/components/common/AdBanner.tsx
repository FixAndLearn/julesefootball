"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export interface AdBannerProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "badge" | "in-feed";
  className?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function AdBanner({
  slot = "1572931-default",
  format = "horizontal",
  className = "",
  title,
  description,
  ctaText,
  ctaUrl = "/escrow-guarantee",
}: AdBannerProps) {
  const [adsenseEnabled, setAdsenseEnabled] = useState(false);
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-5924764989915276";

  useEffect(() => {
    if (adsenseClientId && typeof window !== "undefined") {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setAdsenseEnabled(true);
      } catch {
        setAdsenseEnabled(false);
      }
    }
  }, [adsenseClientId]);

  const handleAdClick = (label: string) => {
    trackEvent({
      action: "ad_impression_clicked",
      category: "advertising",
      label: label,
    });
  };

  // 1. Google AdSense Certified Unit (renders when numeric AdSense unit ID is configured)
  const isNumericSlot = Boolean(slot && /^\d+$/.test(slot));

  if (adsenseClientId && adsenseEnabled && isNumericSlot) {
    return (
      <div className={`w-full text-center overflow-hidden my-4 ${className}`}>
        <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
          Sponsored / Advertisement
        </span>
        <div className="min-h-[100px] w-full flex items-center justify-center rounded-2xl bg-[#090D16] border border-[#1F2937] p-2">
          <ins
            className="adsbygoogle block w-full overflow-hidden"
            style={{ display: "block" }}
            data-ad-client={adsenseClientId}
            data-ad-slot={slot}
            data-ad-format={format === "rectangle" ? "rectangle" : "auto"}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // 2. High-Trust In-House Sponsor Units (Zero CLS, Cyber-Athletic Theme)
  if (format === "rectangle") {
    return (
      <div className={`w-full text-center my-4 ${className}`}>
        <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
          Verified Marketplace Sponsor
        </span>
        <Link
          href={ctaUrl}
          onClick={() => handleAdClick(`rect_${slot}`)}
          className="block p-5 rounded-2xl bg-gradient-to-b from-[#111827] via-[#090D16] to-[#090D16] border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#10B981] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#10B981] font-bold">
            Safaricom Escrow
          </span>
          <h4 className="text-sm font-bold text-white mt-2 leading-snug group-hover:text-emerald-300 transition-colors">
            {title || "Trade eFootball Squads with M-Pesa Till 1572931"}
          </h4>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {description || "Zero-risk buyer protection. Money stays in escrow until you verify Konami 2FA."}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981] mt-4 pt-3 border-t border-slate-800">
            <span>{ctaText || "Learn Escrow Protection"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    );
  }

  if (format === "in-feed") {
    return (
      <div className={`w-full text-center ${className}`}>
        <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">
          Featured Community Partner
        </span>
        <Link
          href={ctaUrl}
          onClick={() => handleAdClick(`infeed_${slot}`)}
          className="block p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#111827] to-slate-900 border border-amber-500/30 hover:border-amber-400/60 shadow-lg text-left transition-all group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#F59E0B] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F59E0B] font-bold">
                  Instant Seller Payout
                </span>
                <h5 className="text-xs sm:text-sm font-bold text-white mt-0.5 group-hover:text-amber-300 transition-colors">
                  {title || "Got a High-OVR eFootball Squad to Sell?"}
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  {description || "List your squad in 60 seconds. Instant M-Pesa payout upon buyer inspection."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform shrink-0">
              <span>{ctaText || "List Squad for Free"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Default: Horizontal Leaderboard
  return (
    <div className={`w-full text-center my-4 ${className}`}>
      <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
        Sponsored / Verified Escrow Partner
      </span>
      <Link
        href={ctaUrl}
        onClick={() => handleAdClick(`horiz_${slot}`)}
        className="block min-h-[85px] rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#111827] to-[#111827] border border-emerald-500/30 hover:border-emerald-400/60 p-4 sm:p-5 text-left shadow-lg transition-all group"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#10B981] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {title || "Safaricom Lipa Na M-Pesa Escrow Vault"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#10B981] font-bold">
                  Till 1572931
                </span>
                <span className="text-[10px] text-slate-400 hidden md:inline">
                  • 24H Inspection Guarantee
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {description ||
                  "Zero-risk trading in Kenya. Funds held securely until buyer verifies Konami ID credentials."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981] group-hover:translate-x-1 transition-transform shrink-0">
            <span>{ctaText || "Learn How It Works"}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  );
}
