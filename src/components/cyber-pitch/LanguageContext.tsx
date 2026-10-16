"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SupportedLanguage } from "./types";

interface Translations {
  heroTagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaCraft: string;
  heroCtaExplore: string;
  statCardsMinted: string;
  statTournaments: string;
  statRating: string;
  wizardTitle: string;
  wizardSubtitle: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  gamerHandleLabel: string;
  gamerHandlePlaceholder: string;
  teamNameLabel: string;
  teamNamePlaceholder: string;
  positionLabel: string;
  cardThemeLabel: string;
  cardFinishLabel: string;
  attributesTitle: string;
  paceLabel: string;
  shootingLabel: string;
  passingLabel: string;
  dribblingLabel: string;
  defendingLabel: string;
  physicalLabel: string;
  tacticsTitle: string;
  formationDropdownLabel: string;
  nextStep: string;
  prevStep: string;
  mintCard: string;
  galleryTitle: string;
  gallerySubtitle: string;
  filterAll: string;
  filterTrending: string;
  filterFormations: string;
  filterGK: string;
  filterLegendary: string;
  quickView: string;
  customizeTemplate: string;
  livePreviewBadge: string;
}

const translations: Record<SupportedLanguage, Translations> = {
  en: {
    heroTagline: "CYBER-ATHLETIC DIGITAL ASSETS",
    heroHeadline: "Dominate the Pitch. Claim Your Legacy.",
    heroSubheadline:
      "Bespoke eFootball trading cards and elite tactical formations engineered for competitive mobile champions.",
    heroCtaCraft: "Craft Your Card",
    heroCtaExplore: "Explore Formations",
    statCardsMinted: "Custom Cards Minted",
    statTournaments: "Championship Cups",
    statRating: "Pro Gamer Rating",
    wizardTitle: "The Customization Engine",
    wizardSubtitle:
      "Sculpt your custom digital player card with responsive live attributes and tactical pitch formations.",
    step1Title: "1. Identity",
    step2Title: "2. Aesthetics",
    step3Title: "3. Attributes",
    step4Title: "4. Tactics",
    gamerHandleLabel: "Gamer Handle",
    gamerHandlePlaceholder: "Brinaki Gamer",
    teamNameLabel: "Team Name",
    teamNamePlaceholder: "MG FC",
    positionLabel: "Pitch Role / Position",
    cardThemeLabel: "Card Holographic Theme",
    cardFinishLabel: "Card Surface Finish",
    attributesTitle: "Player Attributes (Dynamic Sliders)",
    paceLabel: "Pace (PAC)",
    shootingLabel: "Shooting (SHO)",
    passingLabel: "Passing (PAS)",
    dribblingLabel: "Dribbling (DRI)",
    defendingLabel: "Defending (DEF)",
    physicalLabel: "Physicality (PHY)",
    tacticsTitle: "Tactical Pitch Formation",
    formationDropdownLabel: "Choose Pitch Setup",
    nextStep: "Continue",
    prevStep: "Back",
    mintCard: "Mint Card (M-Pesa Escrow)",
    galleryTitle: "Marketplace Gallery",
    gallerySubtitle:
      "Inspect trending tournament cards, verified squad formations, and goalkeeper specials ready for instant gameplay.",
    filterAll: "All Assets",
    filterTrending: "Trending Cards",
    filterFormations: "Pro Formations",
    filterGK: "Goalkeeper Specials",
    filterLegendary: "Legendary Icons",
    quickView: "Quick View",
    customizeTemplate: "Clone & Customize",
    livePreviewBadge: "LIVE CARD RADAR",
  },
  sw: {
    heroTagline: "RASILIMALI ZA KIDIJITALI ZA EFOOTBALL",
    heroHeadline: "Tawala Uwanja. Simika Historia Yako.",
    heroSubheadline:
      "Kadi maalum za eFootball na mifumo ya mbinu za kiwango cha juu iliyoundwa kwa ajili ya wachezaji mahiri.",
    heroCtaCraft: "Unda Kadi Yako",
    heroCtaExplore: "Tazama Mifumo",
    statCardsMinted: "Kadi Zilizoundwa",
    statTournaments: "Vikombe vya Ushindi",
    statRating: "Kiwango cha Ubora",
    wizardTitle: "Injini ya Kubuni Kadi",
    wizardSubtitle:
      "Buni kadi yako ya mchezaji kwa takwimu za papo hapo na mifumo ya mbinu uwanjani.",
    step1Title: "1. Utambulisho",
    step2Title: "2. Mwonekano",
    step3Title: "3. Takwimu",
    step4Title: "4. Mbinu",
    gamerHandleLabel: "Jina la Mchezaji",
    gamerHandlePlaceholder: "Brinaki Gamer",
    teamNameLabel: "Jina la Timu",
    teamNamePlaceholder: "MG FC",
    positionLabel: "Nafasi ya Uchezaji",
    cardThemeLabel: "Mandhari ya Kadi",
    cardFinishLabel: "Mng'aro wa Kadi",
    attributesTitle: "Takwimu za Mchezaji (Telezesha Kusawazisha)",
    paceLabel: "Kasi (PAC)",
    shootingLabel: "Mashuti (SHO)",
    passingLabel: "Pasi (PAS)",
    dribblingLabel: "Chenga (DRI)",
    defendingLabel: "Ulinzi (DEF)",
    physicalLabel: "Nguvu ya Mwili (PHY)",
    tacticsTitle: "Mfumo wa Mbinu Uwanjani",
    formationDropdownLabel: "Chagua Mfumo wa Kikosi",
    nextStep: "Endelea",
    prevStep: "Nyuma",
    mintCard: "Hifadhi Kadi (M-Pesa Escrow)",
    galleryTitle: "Soko la Kadi & Mifumo",
    gallerySubtitle:
      "Tazama kadi zinazovuma, mifumo ya mabingwa na wachezaji maalum walio tayari kwa ushindani.",
    filterAll: "Zote",
    filterTrending: "Zinazovuma",
    filterFormations: "Mifumo ya Pro",
    filterGK: "Walinda Lango",
    filterLegendary: "Wakongwe Maarufu",
    quickView: "Tazama Haraka",
    customizeTemplate: "Badilisha Hii",
    livePreviewBadge: "MUONEKANO WA PAPO HAPO",
  },
  kam: {
    heroTagline: "SYĨNDŨ SYA KĨDIJITALI SYA EFOOTBALL",
    heroHeadline: "Itha Kĩwanzaani. Ika Ũtaana Waku.",
    heroSubheadline:
      "Kati sya mwanya sya eFootball na mĩvango mĩseo ya kĩwanza ya kũtelemya ngewa.",
    heroCtaCraft: "Seuvya Kati Yaku",
    heroCtaExplore: "Sisya Mĩvango",
    statCardsMinted: "Kati Syeuvĩtwe",
    statTournaments: "Mavĩtano Mamatheũka",
    statRating: "Ũseo wa Athaũki",
    wizardTitle: "Mũtambo wa Kũseuvya Kati",
    wizardSubtitle:
      "Seuvya kati yaku ya mwanake ya eFootball ĩna ũũnĩ wa kĩwanza na mĩsembe mĩseo.",
    step1Title: "1. Mũmanyĩle",
    step2Title: "2. Mwonekano",
    step3Title: "3. Mĩsembe",
    step4Title: "4. Mĩvango",
    gamerHandleLabel: "Iĩtwa ya Mũthaũki",
    gamerHandlePlaceholder: "Brinaki Gamer",
    teamNameLabel: "Iĩtwa ya Timu",
    teamNamePlaceholder: "MG FC",
    positionLabel: "Kanya ka Kĩwanza",
    cardThemeLabel: "Mwonekano wa Kati",
    cardFinishLabel: "Ũtheu wa Kĩmulĩko",
    attributesTitle: "Mĩsembe na Vinya wa Mũthaũki",
    paceLabel: "Mĩsembe (PAC)",
    shootingLabel: "Mĩkũũnĩle (SHO)",
    passingLabel: "Kũnenga Boli (PAS)",
    dribblingLabel: "Kũvĩndũa Boli (DRI)",
    defendingLabel: "Kũsũvĩa Boli (DEF)",
    physicalLabel: "Vinya wa Mwĩĩ (PHY)",
    tacticsTitle: "Mũvango wa Kĩwanza",
    formationDropdownLabel: "Nyuvana Mũvango wa Timu",
    nextStep: "Thi Mbee",
    prevStep: "Inyoka",
    mintCard: "Ĩvia Kati (M-Pesa Escrow)",
    galleryTitle: "Soko ya Kati na Mĩvango",
    gallerySubtitle:
      "Sisya kati ila syendeele mũno, mĩvango ya kĩwanza na asũvĩi ma goolo ma wendo.",
    filterAll: "Syonthe",
    filterTrending: "Ila Syendeele",
    filterFormations: "Mĩvango ya Pro",
    filterGK: "Asũvĩi ma Goolo",
    filterLegendary: "Athauki Nguma",
    quickView: "Sisya Mitũkĩ",
    customizeTemplate: "Alyũla Ĩno",
    livePreviewBadge: "KATI YA MWANYA",
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  // Load preferred language from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("efootball_lang") as SupportedLanguage;
      if (saved && (saved === "en" || saved === "sw" || saved === "kam")) {
        setLanguageState(saved);
      }
    } catch {
      // Local storage disabled or unavailable
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("efootball_lang", lang);
    } catch {
      // Local storage disabled or unavailable
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
