"use client";

import React, { useEffect, useState } from "react";

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
  slot = "",
  format = "horizontal",
  className = "",
}: AdBannerProps) {
  const [adsenseEnabled, setAdsenseEnabled] = useState(false);
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

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

  // Only render if a valid numeric Google AdSense slot ID is explicitly configured
  const isNumericSlot = Boolean(slot && /^\d+$/.test(slot));

  if (adsenseClientId && adsenseEnabled && isNumericSlot) {
    return (
      <div className={`w-full text-center overflow-hidden my-4 ${className}`}>
        <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
          Advertisement
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

  // Never render fake sponsor / partner placeholders
  return null;
}
