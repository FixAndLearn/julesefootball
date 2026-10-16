"use client";

import React, { useRef } from "react";
import { LanguageProvider } from "./LanguageContext";
import { HeroSection } from "./HeroSection";
import { CardCreatorWizard } from "./CardCreatorWizard";
import { MarketplaceGallery } from "./MarketplaceGallery";
import { PlayerCardData } from "./types";

export function CyberPitchExperience() {
  const wizardRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollToWizard = () => {
    const el = document.getElementById("card-creator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToGallery = () => {
    const el = document.getElementById("marketplace-gallery");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCustomizeFromGallery = (card: PlayerCardData) => {
    scrollToWizard();
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#050811] text-white selection:bg-[#00F0FF] selection:text-black">
        {/* 1. The Hero Section (The Hook) */}
        <HeroSection
          onScrollToWizard={scrollToWizard}
          onScrollToGallery={scrollToGallery}
        />

        {/* 2. The Customization Engine (Product Intake) */}
        <div ref={wizardRef}>
          <CardCreatorWizard />
        </div>

        {/* 3. The Marketplace Gallery */}
        <div ref={galleryRef}>
          <MarketplaceGallery onCustomizeCard={handleCustomizeFromGallery} />
        </div>
      </div>
    </LanguageProvider>
  );
}
