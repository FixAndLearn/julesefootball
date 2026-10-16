"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import { PlayerCardData, GalleryCategory } from "./types";
import { MOCK_MARKETPLACE_CARDS } from "./data/mockCards";
import { InteractivePlayerCard } from "./InteractivePlayerCard";
import { QuickViewModal } from "./QuickViewModal";
import {
  Sparkles,
  Sliders,
  Eye,
  Flame,
  Shield,
  Trophy,
  Filter,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface MarketplaceGalleryProps {
  onCustomizeCard: (card: PlayerCardData) => void;
}

export function MarketplaceGallery({ onCustomizeCard }: MarketplaceGalleryProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>("all");
  const [selectedCardForModal, setSelectedCardForModal] = useState<PlayerCardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate skeleton image loading to demonstrate zero layout shift
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const categories: { id: GalleryCategory; label: string; icon: any }[] = [
    { id: "all", label: t.filterAll, icon: Filter },
    { id: "trending", label: t.filterTrending, icon: Flame },
    { id: "formation", label: t.filterFormations, icon: Zap },
    { id: "goalkeeper", label: t.filterGK, icon: Shield },
    { id: "legendary", label: t.filterLegendary, icon: Trophy },
  ];

  const filteredCards = MOCK_MARKETPLACE_CARDS.filter((card) => {
    if (selectedCategory === "all") return true;
    return card.category === selectedCategory;
  });

  const handleOpenQuickView = (card: PlayerCardData) => {
    setSelectedCardForModal(card);
    setIsModalOpen(true);
  };

  return (
    <section id="marketplace-gallery" className="py-16 md:py-24 bg-[#070B14] text-white relative z-10 border-b border-slate-800">
      {/* Background radial ambient lights */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#FBBF24]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-[#FBBF24]/40 text-[#FBBF24] text-xs font-mono font-bold mb-3">
              <Trophy className="w-3.5 h-3.5" />
              <span>PREMIUM DIGITAL ASSET VAULT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight">
              {t.galleryTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl font-sans">
              {t.gallerySubtitle}
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            SHOWING <strong className="text-[#00F0FF]">{filteredCards.length}</strong> VERIFIED ASSETS
          </div>
        </div>

        {/* Filter Pills Navigation (Min-h 48px Touch Friendly) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 no-scrollbar mb-8">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setSelectedCategory(cat.id);
                }}
                className={`min-h-[48px] px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? "bg-[#00F0FF] text-slate-950 font-black shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                    : "bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Skeleton Loader Grid during filter switches to prevent layout shift */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 animate-pulse min-h-[420px]"
              >
                <div className="w-full h-64 rounded-2xl bg-slate-800/60" />
                <div className="w-3/4 h-5 rounded-lg bg-slate-800/80" />
                <div className="w-1/2 h-4 rounded-lg bg-slate-800/50" />
                <div className="w-full h-12 rounded-xl bg-slate-800/70" />
              </div>
            ))}
          </div>
        ) : (
          /* Cards Grid with Scaling Hover & Glowing Drop-Shadow */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="group relative rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-[#00F0FF]/60 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] p-4 flex flex-col justify-between backdrop-blur-xl transition-all"
              >
                {/* 3D Mini Interactive Preview */}
                <div className="py-2 flex items-center justify-center">
                  <InteractivePlayerCard card={card} size="sm" enableTilt={true} />
                </div>

                {/* Card Meta Description */}
                <div className="pt-3 pb-2 space-y-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-display truncate max-w-[140px]">
                      {card.gamerHandle}
                    </span>
                    <span className="text-xs font-mono font-black text-[#00F0FF]">
                      KES {card.priceKes.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {card.tacticalDescription}
                  </p>
                </div>

                {/* Action Buttons (Min-h 48px touch targets) */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQuickView(card)}
                    className="min-h-[48px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>{t.quickView}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCustomizeCard(card)}
                    className="min-h-[48px] py-2.5 px-3 rounded-xl bg-[#00F0FF]/15 hover:bg-[#00F0FF] border border-[#00F0FF]/40 text-[#00F0FF] hover:text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{t.customizeTemplate}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Adaptive Quick View Modal with Zoom & Mobile Bottom Sheet */}
      <QuickViewModal
        card={selectedCardForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCustomize={(card) => {
          onCustomizeCard(card);
          setIsModalOpen(false);
        }}
      />
    </section>
  );
}
