"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "sw";

export interface Translations {
  browseSquads: string;
  fridayDrops: string;
  escrowGuide: string;
  scammerCheck: string;
  communityBulletin: string;
  sellAccount: string;
  heroHeadline: string;
  heroSubheadline: string;
  browseVerifiedSquads: string;
  listSquadFree: string;
  escrowGuaranteePill: string;
  manualVerificationPill: string;
  instantMpesaPill: string;
  adminDisputePill: string;
  inspectSquad: string;
  escrowProtected: string;
  collectiveStrength: string;
  buySafelyMpesa: string;
  scammerSearchPlaceholder: string;
  checkNumber: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    browseSquads: "Browse Squads",
    fridayDrops: "Friday Drops",
    escrowGuide: "Escrow Protocol",
    scammerCheck: "Scammer Check",
    communityBulletin: "Market Bulletin",
    sellAccount: "Sell Account",
    heroHeadline: "Kenya's #1 Secure eFootball Account Trading & Community Hub",
    heroSubheadline:
      "M-PESA NATIVE | 100% ESCROW PROTECTED | VERIFIED SELLERS. No scams. No stress. Just football.",
    browseVerifiedSquads: "Browse Verified Squads",
    listSquadFree: "List Your Squad for Free",
    escrowGuaranteePill: "100% Money-Back Escrow Guarantee",
    manualVerificationPill: "Manual Konami ID Link Verification",
    instantMpesaPill: "Instant M-Pesa Payouts Upon Confirmation",
    adminDisputePill: "24/7 Admin Dispute Moderation",
    inspectSquad: "Inspect Squad",
    escrowProtected: "Escrow Protected",
    collectiveStrength: "Collective Strength",
    buySafelyMpesa: "Buy Safely with M-Pesa Escrow",
    scammerSearchPlaceholder: "Enter Kenyan phone (07... / +254...) or handle...",
    checkNumber: "Verify Blacklist Status",
  },
  sw: {
    browseSquads: "Browse Squads",
    fridayDrops: "Friday Drops",
    escrowGuide: "Escrow Protocol",
    scammerCheck: "Scammer Check",
    communityBulletin: "Market Bulletin",
    sellAccount: "Sell Account",
    heroHeadline: "Kenya's #1 Secure eFootball Account Trading & Community Hub",
    heroSubheadline:
      "M-PESA NATIVE | 100% ESCROW PROTECTED | VERIFIED SELLERS. No scams. No stress. Just football.",
    browseVerifiedSquads: "Browse Verified Squads",
    listSquadFree: "List Your Squad for Free",
    escrowGuaranteePill: "100% Money-Back Escrow Guarantee",
    manualVerificationPill: "Manual Konami ID Link Verification",
    instantMpesaPill: "Instant M-Pesa Payouts Upon Confirmation",
    adminDisputePill: "24/7 Admin Dispute Moderation",
    inspectSquad: "Inspect Squad",
    escrowProtected: "Escrow Protected",
    collectiveStrength: "Collective Strength",
    buySafelyMpesa: "Buy Safely with M-Pesa Escrow",
    scammerSearchPlaceholder: "Enter Kenyan phone (07... / +254...) or handle...",
    checkNumber: "Verify Blacklist Status",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: TRANSLATIONS.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Permanently stick to English across the platform
  const [language] = useState<Language>("en");

  useEffect(() => {
    try {
      localStorage.removeItem("efootball_lang");
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (_lang: Language) => {
    // Platform sticks strictly to English
  };

  return (
    <LanguageContext.Provider value={{ language: "en", setLanguage, t: TRANSLATIONS.en }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
