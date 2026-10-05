"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getPlatformLabel } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Trophy,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

export interface GalleryImage {
  id?: string;
  image_url: string;
  is_primary?: boolean;
  display_order?: number;
}

export interface ListingGalleryProps {
  images: GalleryImage[];
  title: string;
  platform: string;
  overallTeamStrength: number;
}

export function ListingGallery({
  images,
  title,
  platform,
  overallTeamStrength,
}: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Normalize image list
  const validImages = images.length > 0 ? images : [];
  const activeImage = validImages[activeIndex]?.image_url || "";

  const handleNext = useCallback(() => {
    if (validImages.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % validImages.length);
    setZoomLevel(1);
  }, [validImages.length]);

  const handlePrev = useCallback(() => {
    if (validImages.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    setZoomLevel(1);
  }, [validImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setZoomLevel(1);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  return (
    <>
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Main Display Container */}
        <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden group select-none">
          {activeImage ? (
            <>
              {/* Atmospheric Ambient Glow Backdrop (Eliminates harsh black bars while keeping 100% sharp foreground) */}
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110 pointer-events-none transition-all duration-700"
                style={{ backgroundImage: `url(${activeImage})` }}
              />

              {/* Lossless HD Foreground Image */}
              <div
                className="relative z-10 w-full h-full flex items-center justify-center cursor-zoom-in p-1"
                onClick={() => setIsLightboxOpen(true)}
                title="Click to inspect in Full HD / Zoom"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={title}
                  className={`w-full h-full transition-all duration-300 drop-shadow-2xl ${
                    fitMode === "contain"
                      ? "object-contain"
                      : "object-cover scale-100"
                  }`}
                  style={{
                    imageRendering: "auto",
                  }}
                />
              </div>

              {/* Top Left Badges */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
                <Badge variant="brand" size="md" className="font-bold shadow-lg backdrop-blur-md">
                  {getPlatformLabel(platform)}
                </Badge>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300 shadow-lg">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>OVR {overallTeamStrength}</span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-600/40 text-[11px] font-semibold text-emerald-300 shadow-md">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>HD Lossless</span>
                </div>
              </div>

              {/* Top Right Presentation Controls */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                {/* Fit Mode Toggle: Contain vs Cover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFitMode((prev) => (prev === "contain" ? "cover" : "contain"));
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-slate-200 hover:text-white backdrop-blur-md border border-white/15 text-xs font-medium transition-all shadow-lg flex items-center gap-1.5"
                  title={fitMode === "contain" ? "Switch to Fill Frame" : "Switch to Fit Entire Screenshot"}
                >
                  {fitMode === "contain" ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-brand-400" />
                      <span className="hidden sm:inline">Fit Entire Screenshot</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-brand-400" />
                      <span className="hidden sm:inline">Fill Box</span>
                    </>
                  )}
                </button>

                {/* Inspect Fullscreen Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-brand-600/90 hover:bg-brand-500 text-white backdrop-blur-md border border-brand-400/40 text-xs font-semibold transition-all shadow-lg flex items-center gap-1.5"
                  title="Open Fullscreen Lightbox & Zoom"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Inspect Full HD</span>
                </button>
              </div>

              {/* Bottom Subtle Guidance Hint */}
              <div className="absolute bottom-3 right-4 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[11px] text-slate-300 border border-white/10 font-mono">
                  🔍 Click image to zoom & inspect cards
                </span>
              </div>

              {/* Left / Right Carousel Chevrons (if multiple screenshots) */}
              {validImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 transition-all shadow-xl"
                    aria-label="Previous screenshot"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 transition-all shadow-xl"
                    aria-label="Next screenshot"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
              <Trophy className="w-16 h-16 stroke-[1.5] mb-2" />
              <span className="text-sm font-semibold">Account Squad Preview</span>
            </div>
          )}
        </div>

        {/* Thumbnail Gallery Row */}
        {validImages.length > 1 && (
          <div className="p-3 border-t border-pitch-border bg-pitch-card/60 flex items-center gap-2.5 overflow-x-auto">
            {validImages.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setZoomLevel(1);
                }}
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border transition-all duration-200 bg-slate-900 ${
                  activeIndex === idx
                    ? "border-brand-400 ring-2 ring-brand-500/50 scale-105"
                    : "border-pitch-border hover:border-slate-500 opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={`Screenshot thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen High-Resolution Lightbox & Inspection Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => {
            setIsLightboxOpen(false);
            setZoomLevel(1);
          }}
        >
          {/* Lightbox Header Bar */}
          <div
            className="flex items-center justify-between z-30 pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {title}
                </h3>
                <p className="text-xs text-slate-400">
                  Lossless HD Squad Screenshot • {activeIndex + 1} of {validImages.length || 1}
                </p>
              </div>
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                  disabled={zoomLevel <= 1}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-300 font-semibold min-w-[50px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  disabled={zoomLevel >= 3}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all ml-1 border-l border-slate-800 pl-2"
                  title="Reset to 100%"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Open Raw Original Image in New Tab */}
              <a
                href={activeImage}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all flex items-center gap-1.5"
                title="Open full resolution in new tab"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden md:inline">Open Raw</span>
              </a>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-400/30 transition-all shadow-lg"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Viewport */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-auto p-2 sm:p-4"
            onClick={(e) => {
              // Clicking outside the image toggles zoom or closes
              if (e.target === e.currentTarget) {
                if (zoomLevel > 1) {
                  setZoomLevel(1);
                } else {
                  setIsLightboxOpen(false);
                }
              }
            }}
          >
            {/* Previous Arrow in Lightbox */}
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 transition-all shadow-2xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Lightbox Scaled Image */}
            <div
              className="relative max-w-full max-h-full transition-transform duration-200 flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Toggle zoom between 1x and 1.75x on image click
                setZoomLevel((prev) => (prev > 1 ? 1 : 1.75));
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={title}
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
                style={{
                  cursor: zoomLevel > 1 ? "zoom-out" : "zoom-in",
                  imageRendering: "auto",
                }}
              />
            </div>

            {/* Next Arrow in Lightbox */}
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 transition-all shadow-2xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Footer Bar */}
          <div
            className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">Shortcuts:</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                ESC
              </kbd>
              <span className="hidden sm:inline">to close •</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                ← / →
              </kbd>
              <span className="hidden sm:inline">to navigate</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400 font-medium">
                ✓ 100% Uncompressed Original Squad Data
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
