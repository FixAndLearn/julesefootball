"use client";

import React, { useState } from "react";
import { MessageCircle, Share2, Check, Copy } from "lucide-react";
import { formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";

export interface WhatsAppShareButtonProps {
  listing: {
    id: string;
    title: string;
    price: number;
    currency?: string;
    overall_team_strength: number;
    epic_players_count?: number;
    platform: string;
    primary_playstyle?: string;
  };
  className?: string;
}

export function WhatsAppShareButton({ listing, className = "" }: WhatsAppShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getListingUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/listings/${listing.id}`;
    }
    return `https://www.efootballmarket.co.ke/listings/${listing.id}`;
  };

  const getShareMessage = () => {
    const url = getListingUrl();
    const formattedPrice = formatCurrency(listing.price, listing.currency || "KES");
    const platformLabel = getPlatformLabel(listing.platform);
    const epicsText = listing.epic_players_count ? `• ${listing.epic_players_count} Epic/Booster Cards` : "";
    const playstyleText = listing.primary_playstyle ? `• Playstyle: ${getPlaystyleLabel(listing.primary_playstyle)}` : "";

    return (
      `⚽ *eFootball Account For Sale on eFootballMarket* ⚽\n\n` +
      `🔥 *[OVR ${listing.overall_team_strength}]* ${listing.title}\n` +
      `💰 *Price:* ${formattedPrice}\n` +
      `📱 *Platform:* ${platformLabel}\n` +
      `${epicsText ? `${epicsText}\n` : ""}` +
      `${playstyleText ? `${playstyleText}\n` : ""}` +
      `🛡️ *100% Non-Custodial Escrow Protection via M-Pesa (No Scams)*\n\n` +
      `👉 Inspect Squad or Buy Now:\n` +
      `${url}`
    );
  };

  const handleShareToWhatsApp = () => {
    const message = getShareMessage();
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getListingUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary WhatsApp Share Button */}
      <button
        type="button"
        onClick={handleShareToWhatsApp}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all duration-200 active:scale-[0.98] group"
      >
        <MessageCircle className="w-4 h-4 fill-white group-hover:rotate-12 transition-transform shrink-0" />
        <span>Share to WhatsApp Group / Status</span>
      </button>

      {/* Copy Link Helper */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
        <span className="truncate">Sellers: Share in groups to find buyers</span>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium transition-colors ml-2 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Direct Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
