"use client";

import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { CookieConsentState, DEFAULT_CONSENT, updateGoogleConsent, trackEvent } from "@/lib/analytics";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("efootball_cookie_consent");
      if (saved) {
        const parsed: CookieConsentState = JSON.parse(saved);
        setConsent(parsed);
        updateGoogleConsent(parsed);
      } else {
        // Show compact toast after brief 1.5s delay on first visit
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // storage disabled
    }
  }, []);

  const saveConsent = (newConsent: CookieConsentState) => {
    setConsent(newConsent);
    updateGoogleConsent(newConsent);
    try {
      localStorage.setItem("efootball_cookie_consent", JSON.stringify(newConsent));
    } catch {
      // storage disabled
    }
    setIsVisible(false);
    trackEvent({
      action: "cookie_consent_saved",
      category: "privacy",
      label: `analytics:${newConsent.analytics}|ads:${newConsent.advertising}`,
    });
  };

  const handleAccept = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      advertising: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleDismiss = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      advertising: false,
      timestamp: new Date().toISOString(),
    });
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none"
    >
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-[#0B1424]/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Cookie className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] text-slate-300 leading-tight truncate">
            We use essential cookies &amp; analytics for secure M-Pesa escrow.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleAccept}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all active:scale-95"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
            title="Dismiss"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
