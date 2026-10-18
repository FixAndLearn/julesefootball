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
    browseSquads: "Tazama Vikosi",
    fridayDrops: "Matoleo ya Ijumaa",
    escrowGuide: "Mwongozo wa Escrow",
    scammerCheck: "Kagua Matapeli",
    communityBulletin: "Taarifa za Soko",
    sellAccount: "Uza Kikosi",
    heroHeadline: "Soko Nambari 1 Kenya la Akaunti za eFootball Salama",
    heroSubheadline:
      "M-PESA NATIVE | 100% ULINZI WA ESCROW | WAUZAJI WALIOTHIBITISHWA. Hakuna utapeli. Hakuna hofu. Ni soka tu.",
    browseVerifiedSquads: "Tazama Vikosi Vilivyothibitishwa",
    listSquadFree: "Weka Kikosi Chako Bure",
    escrowGuaranteePill: "100% Hakikisho la Kurudishiwa Pesa",
    manualVerificationPill: "Uhakiki wa Konami ID Bila Ulaghai",
    instantMpesaPill: "Malipo ya Papo hapo ya M-Pesa Ukithibitisha",
    adminDisputePill: "Upatanishi wa Migogoro Saa 24/7",
    inspectSquad: "Kagua Kikosi",
    escrowProtected: "Imelindwa na Escrow",
    collectiveStrength: "Nguvu ya Kikosi",
    buySafelyMpesa: "Nunua Salama kupitia M-Pesa Escrow",
    scammerSearchPlaceholder: "Weka nambari ya simu (07... / +254...) au jina...",
    checkNumber: "Kagua Orodha ya Matapeli",
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
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("efootball_lang") as Language;
      if (saved && (saved === "en" || saved === "sw")) {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("efootball_lang", lang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
