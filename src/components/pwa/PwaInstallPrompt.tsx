"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (dismissed) return;

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Delay prompt slightly for better UX
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    // Listen for Chromium beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showPrompt || installed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-4">
      <div className="p-4 rounded-3xl bg-pitch-surface/95 border border-brand-500/60 shadow-2xl backdrop-blur-xl relative overflow-hidden flex items-start gap-3.5">
        {/* Glow sheen */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold text-white">Install eFootballMarket App</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Fast</span>
          </div>

          <p className="text-xs text-slate-300 leading-tight">
            {isIos
              ? "Tap Share ⎋ at bottom of Safari, then choose 'Add to Home Screen ⊞' for full screen app."
              : "Install our lightweight mobile app for 1-tap browsing and instant M-Pesa order notifications."}
          </p>

          {!isIos && deferredPrompt && (
            <div className="mt-2.5 flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleInstallClick}
                className="text-xs font-bold px-3 py-1 h-7 bg-brand-600 hover:bg-brand-500 shadow-md"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Install Now
              </Button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-slate-200 py-1 px-2"
              >
                Later
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
