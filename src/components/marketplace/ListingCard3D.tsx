"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { VerifiedSellerBadge } from "@/components/marketplace/VerifiedSellerBadge";
import { formatCompactNumber, formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { ShieldCheck, Star, Trophy, Users, Zap, Sparkles, MessageCircle } from "lucide-react";

export interface ListingCard3DProps {
  listing: Listing;
  featured?: boolean;
}

export function ListingCard3D({ listing, featured = false }: ListingCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = listing.images?.find((img) => img.is_primary)?.image_url || listing.images?.[0]?.image_url;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxTilt = 15; // degrees
    const rX = -((y - centerY) / centerY) * maxTilt;
    const rY = ((x - centerX) / centerX) * maxTilt;

    setRotateX(rX);
    setRotateY(rY);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 w-full h-full"
    >
      <Link
        href={`/listings/${listing.id}`}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.03 : 1}, ${
            isHovered ? 1.03 : 1
          }, 1)`,
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.5s ease-out",
        }}
        className={`group block bg-pitch-surface/90 border rounded-2xl overflow-hidden relative flex flex-col h-full justify-between ${
          featured
            ? "border-amber-500/70 shadow-2xl shadow-amber-500/10"
            : "border-pitch-border hover:border-brand-500/80 shadow-xl shadow-black/40"
        }`}
      >
        {/* Holographic Specular Foil Layer */}
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 rounded-2xl"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(56, 189, 248, 0.25) 25%, rgba(245, 158, 11, 0.2) 50%, transparent 75%)`,
            mixBlendMode: "color-dodge",
          }}
        />

        {/* 3D Dynamic Edge Glow */}
        <div
          className="absolute -inset-px rounded-2xl pointer-events-none transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 0.8 : 0,
            background: `linear-gradient(${rotateY * 12 + 90}deg, rgba(99, 102, 241, 0.4), rgba(245, 158, 11, 0.4))`,
            filter: "blur(1px)",
          }}
        />

        {/* Media Header / Image with 3D Depth */}
        <div
          style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
          className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden"
        >
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={true}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-600">
              <Trophy className="w-12 h-12 stroke-[1.5] mb-1" />
              <span className="text-xs uppercase tracking-wider font-semibold">Account Preview</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-pitch-card via-transparent to-black/60 pointer-events-none" />

          {/* Top Badges with higher translateZ for floating effect */}
          <div
            style={{ transform: "translateZ(45px)" }}
            className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="brand" size="sm" className="font-semibold shadow-xl backdrop-blur-md">
                {getPlatformLabel(listing.platform)}
              </Badge>
              {listing.allows_swap && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-[10px] font-bold text-emerald-300 shadow-md">
                  🔁 Swap Welcome
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/90 backdrop-blur-md border border-amber-400 text-[11px] font-black text-amber-300 shadow-md shadow-amber-500/20">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{listing.overall_team_strength} OVR</span>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-slate-200 shadow-md">
                Div {listing.current_division || 1}
              </div>
            </div>
          </div>

          {/* Bottom Playstyle Chip with 3D elevation */}
          <div
            style={{ transform: "translateZ(30px)" }}
            className="absolute bottom-2 left-3 right-3 flex items-center justify-between"
          >
            <span className="text-[11px] font-medium text-slate-200 bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-slate-700/80 shadow-md pointer-events-none">
              {getPlaystyleLabel(listing.primary_playstyle)}
            </span>
            <div className="flex items-center gap-1.5">
              {listing.images && listing.images.length > 1 && (
                <span className="text-[10px] font-semibold text-slate-200 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1 pointer-events-none">
                  📷 {listing.images.length} photos
                </span>
              )}
              <button
                type="button"
                title="Share to WhatsApp Group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.efootballmarket.co.ke";
                  const text = `⚽ *[OVR ${listing.overall_team_strength}]* ${listing.title} for ${formatCurrency(listing.price, listing.currency)} on eFootballMarket.\n🛡️ Escrow Protected via M-Pesa: ${origin}/listings/${listing.id}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="p-1 rounded-md bg-emerald-950/90 hover:bg-emerald-700 text-emerald-300 hover:text-white border border-emerald-500/60 shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Body with 3D Depth */}
        <div
          style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}
          className="p-4 flex-1 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-semibold text-slate-100 text-base line-clamp-1 group-hover:text-brand-300 transition-colors">
              {listing.title}
            </h3>

            {/* Special Cards Highlights with 3D embossing */}
            <div
              style={{ transform: "translateZ(15px)" }}
              className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-pitch-card/80 border border-pitch-border/60 text-center shadow-inner"
            >
              <div>
                <span className="block text-[10px] uppercase font-bold text-amber-400">Epics</span>
                <span className="text-xs font-semibold text-slate-100">{listing.epic_players_count}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-indigo-400">Coins</span>
                <span className="text-xs font-semibold text-slate-100">{formatCompactNumber(listing.coin_balance)}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-emerald-400">GP</span>
                <span className="text-xs font-semibold text-slate-100">{formatCompactNumber(listing.gp_balance)}</span>
              </div>
            </div>
          </div>

          {/* Seller Info & Price Footer with 3D elevation */}
          <div
            style={{ transform: "translateZ(35px)" }}
            className="mt-4 pt-3 border-t border-pitch-border/60 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-sm">
                {listing.seller?.username ? listing.seller.username.slice(0, 2).toUpperCase() : <Users className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium text-slate-300">{listing.seller?.username || "Verified Seller"}</span>
                  <VerifiedSellerBadge seller={listing.seller} size="sm" showPopover={true} />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  {(listing.seller?.completed_sales_count || 0) > 0 && listing.seller?.seller_rating ? (
                    <>
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span>{Number(listing.seller.seller_rating).toFixed(1)}</span>
                      <span>({listing.seller.completed_sales_count} sales)</span>
                    </>
                  ) : (
                    <span>New Seller (0 sales)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">M-Pesa Escrow</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">
                {formatCurrency(listing.price, listing.currency)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
