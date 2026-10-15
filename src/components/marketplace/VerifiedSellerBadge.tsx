"use client";

import React, { useState } from "react";
import { ShieldCheck, Shield, Crown, Zap, Award, CheckCircle2, Phone, Star } from "lucide-react";
import { Profile } from "@/types/database";
import { getSellerTier } from "@/lib/utils/sellerTier";

export interface VerifiedSellerBadgeProps {
  seller?: Partial<Profile> | null;
  size?: "sm" | "md" | "lg";
  showPopover?: boolean;
}

export function VerifiedSellerBadge({
  seller,
  size = "sm",
  showPopover = true,
}: VerifiedSellerBadgeProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const salesCount = Number(seller?.completed_sales_count || 0);
  const rating = Number(seller?.seller_rating || 5.0);
  const tier = getSellerTier(salesCount, rating);

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  const badgeTextSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm font-bold",
  };

  const renderIcon = () => {
    switch (tier.iconType) {
      case "crown":
        return <Crown className={`${iconSizes[size]} text-amber-300 fill-amber-300/30 animate-pulse`} />;
      case "shield-check":
        return <ShieldCheck className={`${iconSizes[size]} text-emerald-400 fill-emerald-400/20`} />;
      default:
        return <Shield className={`${iconSizes[size]} text-slate-400`} />;
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (showPopover) setPopoverOpen(!popoverOpen);
        }}
        onMouseEnter={() => showPopover && setPopoverOpen(true)}
        onMouseLeave={() => showPopover && setPopoverOpen(false)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${tier.badgeClass} ${badgeTextSizes[size]}`}
      >
        {renderIcon()}
        <span>{tier.label}</span>
      </button>

      {/* Trust Popover */}
      {showPopover && popoverOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-0 mb-2 z-50 w-72 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl space-y-2.5 text-left animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{tier.label}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-300">
                  Level {tier.level === "master" ? "3" : tier.level === "verified" ? "2" : "1"}
                </span>
              </h5>
              <p className="text-[10px] text-emerald-400 font-medium">Safaricom Till 1572931 Escrow</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-normal">
            {tier.description}
          </p>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                <strong>{salesCount}</strong> completed escrow transfers
              </span>
            </div>

            {salesCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>
                  <strong>{rating.toFixed(1)} / 5.0</strong> seller satisfaction rating
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-200">
              <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span><strong>M-Pesa Registered:</strong> Safaricom mobile phone registered</span>
            </div>
          </div>

          {tier.nextTierLabel && (
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-[10px] text-slate-300">
              <span className="text-amber-300 font-bold">{tier.salesRequiredForNext} more sales</span> until {tier.nextTierLabel} promotion.
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-800 text-[9px] text-slate-400">
            Funds held securely until buyer verifies Konami ID login.
          </div>
        </div>
      )}
    </div>
  );
}
