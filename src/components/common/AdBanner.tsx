"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ArrowRight, Zap, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface AdBannerProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "badge";
  className?: string;
}

export function AdBanner({
  slot = "1572931-default",
  format = "horizontal",
  className = "",
}: AdBannerProps) {
  const [adsenseEnabled, setAdsenseEnabled] = useState(false);
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

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

  return (
    <div className={`w-full text-center ${className}`}>
      {/* Required Google Publisher Disclaimer */}
      <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
        Advertisement
      </span>

      {adsenseClientId && adsenseEnabled ? (
        <ins
          className="adsbygoogle block overflow-hidden rounded-2xl bg-slate-900 border border-slate-800"
          style={{ display: "block" }}
          data-ad-client={adsenseClientId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        /* Verified Built-In Escrow & Partner Slot */
        <div
          onClick={() => handleAdClick("mpesa_till_escrow_banner")}
          className="rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-lg hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#22C55E] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Safaricom Lipa Na M-Pesa Escrow</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#22C55E] font-bold">
                  Till 1572931
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Zero-risk trading. Funds held securely until buyer verifies Konami credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#22C55E] group-hover:translate-x-1 transition-transform shrink-0">
            <span>Learn How It Works</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
