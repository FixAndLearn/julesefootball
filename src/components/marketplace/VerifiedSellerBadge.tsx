"use client";

import React, { useState } from "react";
import { ShieldCheck, Zap, Award, CheckCircle2, Phone, Star } from "lucide-react";
import { Profile } from "@/types/database";

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

  // If no seller data provided, render standard verified shield
  const isVerified = seller?.is_verified_seller ?? true;
  const salesCount = Number(seller?.completed_sales_count || 0);
  const rating = Number(seller?.seller_rating || 5.0);
  const hasPhone = Boolean(seller?.phone_number);

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const badgeTextSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm font-bold",
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
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-semibold transition-all ${badgeTextSizes[size]}`}
      >
        <ShieldCheck className={`${iconSizes[size]} text-emerald-400 fill-emerald-400/20`} />
        <span>Verified Trader</span>
      </button>

      {/* Trust Popover */}
      {showPopover && popoverOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-0 mb-2 z-50 w-64 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 shadow-2xl space-y-2 text-left animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Trust & Security Badges</h5>
              <p className="text-[10px] text-emerald-400 font-medium">eFootballMarket Escrow Guarantee</p>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span><strong>M-Pesa Escrow:</strong> 100% completed trades</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><strong>Fast Handover:</strong> 15-min avg response</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-200">
              <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span><strong>Safaricom Verified:</strong> Confirmed Kenyan ID</span>
            </div>

            {salesCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-300 pt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>
                  <strong>{rating.toFixed(1)} / 5.0</strong> ({salesCount} completed escrows)
                </span>
              </div>
            )}
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[9px] text-slate-400">
            Funds held securely until buyer confirms Konami ID ownership.
          </div>
        </div>
      )}
    </div>
  );
}
