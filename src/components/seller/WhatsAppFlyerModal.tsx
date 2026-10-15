"use client";

import React, { useRef, useState, useEffect } from "react";
import { Listing } from "@/types/database";
import { formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import {
  Download,
  Copy,
  Check,
  MessageCircle,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppFlyerModal({ listing, isOpen, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);
  const [copiedText, setCopiedText] = useState(false);

  const primaryImage =
    listing.images?.find((img) => img.is_primary)?.image_url ||
    listing.images?.[0]?.image_url;

  const viralText = `🔥 *HOT eFootball Account for Sale on EFootballMarket!* 🇰🇪\n\n🎮 *Squad*: ${listing.title}\n⭐ *Team OVR*: ${listing.overall_team_strength}\n💎 *Epic / Boosters*: ${listing.epic_players_count} cards\n🏆 *Current Division*: Div ${listing.current_division}\n💰 *Price*: ${formatCurrency(listing.price, listing.currency)}\n\n🛡️ *Escrow Protected by Safaricom Till 1572931*\nFunds held safely until credentials are verified!\n\n🔗 *View Photos & Buy*: https://www.efootballmarket.co.ke/listings/${listing.id}`;

  const drawFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setGenerating(true);

    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // 1. Dark Futuristic Pitch Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#030712"); // deep slate
    bgGrad.addColorStop(0.5, "#0b1528"); // night pitch
    bgGrad.addColorStop(1, "#022c22"); // deep emerald
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Neon decorative accent lines
    ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 480, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(245, 158, 11, 0.25)";
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 520, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Top Header Ribbon
    ctx.fillStyle = "#10B981";
    ctx.font = "900 38px system-ui, sans-serif";
    ctx.fillText("🛡️ EFOOTBALLMARKET.CO.KE", 70, 90);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("KENYA'S ESCROW MARKETPLACE", W - 70, 90);
    ctx.textAlign = "left";

    // 3. Title Box
    ctx.fillStyle = "#F8FAFC";
    ctx.font = "900 48px system-ui, sans-serif";
    const titleText = listing.title.length > 38 ? listing.title.slice(0, 35) + "..." : listing.title;
    ctx.fillText(titleText, 70, 170);

    // Badges Row
    ctx.fillStyle = "#F59E0B";
    ctx.font = "800 28px system-ui, sans-serif";
    ctx.fillText(`⚡ OVR ${listing.overall_team_strength}`, 70, 220);

    ctx.fillStyle = "#38BDF8";
    ctx.fillText(`🎮 ${getPlatformLabel(listing.platform).toUpperCase()}`, 270, 220);

    ctx.fillStyle = "#A7F3D0";
    ctx.fillText(`⭐ ${listing.epic_players_count} EPICS`, 580, 220);

    // 4. Middle Card Image Container
    const cardX = 70;
    const cardY = 260;
    const cardW = W - 140;
    const cardH = 500;

    // Draw container shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(cardX, cardY, cardW, cardH);

    const renderCard = (img?: HTMLImageElement) => {
      if (img) {
        ctx.drawImage(img, cardX, cardY, cardW, cardH);
      } else {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "700 36px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("eFootball Verified Squad", W / 2, cardY + cardH / 2);
        ctx.textAlign = "left";
      }

      // Draw subtle inner border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 4;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      // 5. Price & Till Box
      const bottomY = 800;
      const bottomH = 220;

      // Dark card container
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(70, bottomY, W - 140, bottomH);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
      ctx.lineWidth = 4;
      ctx.strokeRect(70, bottomY, W - 140, bottomH);

      // Price Tag
      ctx.fillStyle = "#94A3B8";
      ctx.font = "700 24px system-ui, sans-serif";
      ctx.fillText("PRICE (ESCROW PROTECTED)", 110, bottomY + 55);

      ctx.fillStyle = "#10B981";
      ctx.font = "900 64px system-ui, sans-serif";
      ctx.fillText(formatCurrency(listing.price, listing.currency), 110, bottomY + 130);

      // Till Guarantee Box
      ctx.fillStyle = "#F59E0B";
      ctx.font = "900 34px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("LIPA NA M-PESA TILL 1572931", W - 110, bottomY + 65);

      ctx.fillStyle = "#F1F5F9";
      ctx.font = "600 24px system-ui, sans-serif";
      ctx.fillText("Funds Held Until Login Verified", W - 110, bottomY + 110);

      ctx.fillStyle = "#34D399";
      ctx.font = "700 22px system-ui, sans-serif";
      ctx.fillText("Escrow Officer: Brian Okibo (0794400365)", W - 110, bottomY + 155);

      ctx.textAlign = "left";

      // Ready for download
      try {
        const url = canvas.toDataURL("image/png");
        setDownloadUrl(url);
      } catch (e) {
        console.warn("Could not export canvas data URL:", e);
      }
      setGenerating(false);
    };

    if (primaryImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => renderCard(img);
      img.onerror = () => renderCard();
      img.src = primaryImage;
    } else {
      renderCard();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawFlyer, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(viralText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-pitch-surface border border-pitch-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-pitch-border bg-pitch-card/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">WhatsApp Group Promo Flyer</h3>
              <p className="text-xs text-slate-400">Post into Kenyan eFootball WhatsApp groups to sell fast.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Canvas Poster Preview */}
          <div className="aspect-square max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-pitch-border shadow-2xl bg-slate-950 relative">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
            {generating && (
              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs text-amber-300">
                Generating High-Resolution Poster...
              </div>
            )}
          </div>

          {/* Viral WhatsApp Text Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pre-formatted WhatsApp Pitch Text:</span>
              </label>
              <button
                type="button"
                onClick={handleCopyPitch}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>

            <textarea
              readOnly
              rows={5}
              value={viralText}
              className="w-full p-3 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-200 font-mono select-all"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-pitch-border bg-pitch-card/60 flex flex-col sm:flex-row items-center gap-3">
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`efootball_squad_${listing.id.slice(0, 8)}.png`}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Poster Image</span>
            </a>
          )}

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(viralText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Share Directly to WhatsApp</span>
          </a>

          <Button variant="secondary" size="md" onClick={onClose} className="w-full sm:w-auto text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
