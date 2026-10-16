"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, X, Settings2, Check, Lock } from "lucide-react";
import { CookieConsentState, DEFAULT_CONSENT, updateGoogleConsent, trackEvent } from "@/lib/analytics";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("efootball_cookie_consent");
      if (saved) {
        const parsed: CookieConsentState = JSON.parse(saved);
        setConsent(parsed);
        updateGoogleConsent(parsed);
      } else {
        // Show banner after brief delay on first visit
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }

    // Listen for custom event to reopen modal from footer link
    const handleOpenSettings = () => setIsModalOpen(true);
    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
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
    setIsModalOpen(false);
    trackEvent({
      action: "cookie_consent_saved",
      category: "privacy",
      label: `analytics:${newConsent.analytics}|ads:${newConsent.advertising}`,
    });
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      advertising: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRejectOptional = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      advertising: false,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <>
      {/* 1. Floating Bottom Banner */}
      {isVisible && !isModalOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-6 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="rounded-2xl bg-[#0F172A]/95 border border-slate-700/80 p-5 shadow-2xl backdrop-blur-xl text-white">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Privacy & Cookie Preferences</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Kenya DPA (2019)
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  We use cookies and secure analytics to understand site traffic, process automated M-Pesa escrow orders, and display relevant Google ads. You control which cookies you allow.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    Accept All Cookies
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectOptional}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all active:scale-95 border border-slate-700"
                  >
                    Essential Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRejectOptional}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Granular Privacy Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-slate-700 shadow-2xl p-6 sm:p-7 text-white space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
                <h3 className="text-base font-bold text-white">Cookie Consent Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with Google&apos;s publisher policies and the Kenya Data Protection Act 2019, you can customize the categories of cookies stored on your device:
            </p>

            {/* Cookie Categories */}
            <div className="space-y-3.5">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Strictly Necessary Cookies</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                    Always Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Required for user authentication, M-Pesa order state persistence, and anti-fraud CSRF security. Cannot be switched off.
                </p>
              </div>

              {/* Category 2: Analytics & Performance */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Performance & Analytics</span>
                    <span className="block text-[10px] text-slate-400">Google Analytics 4 & Visitor Trends</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                    className="w-5 h-5 rounded-md accent-[#22C55E] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Allows us to count visits, track popular squad listings, and measure button clicks to improve site speed and platform usability.
                </p>
              </div>

              {/* Category 3: Advertising & Marketing */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Advertising & Google AdSense</span>
                    <span className="block text-[10px] text-slate-400">Personalized Google Partner Ads</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.advertising}
                    onChange={(e) => setConsent({ ...consent, advertising: e.target.checked })}
                    className="w-5 h-5 rounded-md accent-[#22C55E] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enables Google AdSense and certified marketing partners to serve relevant gaming promotions and measure campaign effectiveness.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => saveConsent(consent)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                Save My Preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
