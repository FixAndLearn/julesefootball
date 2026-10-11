"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Listing } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import {
  Handshake,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Smartphone,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";

interface MakeOfferModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  buyerDefaultName?: string;
  buyerDefaultPhone?: string;
  buyerId?: string;
}

export function MakeOfferModal({
  listing,
  isOpen,
  onClose,
  buyerDefaultName = "",
  buyerDefaultPhone = "",
  buyerId,
}: MakeOfferModalProps) {
  const originalPrice = Number(listing.price);
  const minAllowed = Math.floor(originalPrice * 0.5);

  const [offerPrice, setOfferPrice] = useState<number | string>(
    Math.round(originalPrice * 0.85) // default 15% discount
  );
  const [buyerName, setBuyerName] = useState(buyerDefaultName);
  const [buyerPhone, setBuyerPhone] = useState(buyerDefaultPhone);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState<{
    offer: any;
    whatsappUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  const numericOffer = Number(offerPrice) || 0;
  const discountAmount = originalPrice - numericOffer;
  const discountPercent =
    originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;

  const setDiscountPreset = (percent: number) => {
    const discounted = Math.round(originalPrice * (1 - percent / 100));
    setOfferPrice(discounted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!numericOffer || numericOffer < minAllowed) {
      setError(`Minimum allowed offer is KES ${minAllowed.toLocaleString()} (50% of asking price).`);
      return;
    }

    if (numericOffer >= originalPrice) {
      setError(`Offer must be lower than the asking price of KES ${originalPrice.toLocaleString()}. To pay asking price, click Buy Now!`);
      return;
    }

    const cleanPhone = buyerPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      setError("Please provide a valid phone number so the seller can contact you.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          buyer_name: buyerName.trim() || "Trader",
          buyer_phone: cleanPhone,
          offered_price: numericOffer,
          note: note.trim(),
          buyer_id: buyerId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit offer.");
      }

      setSubmittedData({
        offer: data.offer,
        whatsappUrl: data.whatsappUrl,
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-pitch-border flex items-center justify-between bg-pitch-card/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Handshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">
                Make an Offer / Bargain Price
              </h3>
              <p className="text-[11px] text-slate-400">
                Propose your price directly to the seller with Till 1572931 escrow guarantee
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-pitch-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedData ? (
          /* Success Screen */
          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-100 font-display">
                Offer Sent to Seller!
              </h4>
              <p className="text-xs text-slate-300">
                You offered <strong className="text-emerald-400 font-mono">KES {numericOffer.toLocaleString()}</strong> ({discountPercent}% off asking price).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-left text-slate-300 space-y-2">
              <span className="font-semibold text-amber-300 block">⚡ Next Step: Alert Seller on WhatsApp</span>
              <p className="text-[11px] text-slate-400">
                Tap below to send the seller an instant WhatsApp notification with your offer details so they can accept it immediately:
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={submittedData.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify Seller on WhatsApp</span>
              </a>

              <Button variant="secondary" size="md" className="w-full" onClick={onClose}>
                Done & Return to Listing
              </Button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Squad Overview */}
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Target Squad
                </span>
                <p className="text-xs font-bold text-slate-200 mt-0.5 line-clamp-1">
                  {listing.title}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Original Price
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  {formatCurrency(originalPrice)}
                </span>
              </div>
            </div>

            {/* Quick Discount Presets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Quick Discount Presets:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPreset(pct)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1 ${
                      discountPercent === pct
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-pitch-card border-pitch-border text-slate-300 hover:bg-pitch-surface hover:text-white"
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>-{pct}% (KES {Math.round(originalPrice * (1 - pct / 100)).toLocaleString()})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Price Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Your Offer Amount (KES) <span className="text-rose-400">*</span>
                </label>
                {discountAmount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-400">
                    Saves {formatCurrency(discountAmount)} ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                  KES
                </span>
                <input
                  type="number"
                  min={minAllowed}
                  max={originalPrice - 1}
                  step="50"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                  className="w-full pl-14 pr-4 py-3 rounded-xl bg-pitch-card border border-pitch-border text-slate-100 text-base font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Minimum allowed offer: KES {minAllowed.toLocaleString()} (50% threshold)
              </span>
            </div>

            {/* Buyer Contact Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name / Handle <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kelvin M."
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  M-Pesa Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="07XX XXX XXX"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Note to Seller */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Note to Seller <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cash ready on M-Pesa right now, fast deal"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={150}
                className="w-full px-3 py-2 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div className="pt-1 space-y-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full font-bold shadow-xl shadow-amber-500/10"
                isLoading={loading}
              >
                <Handshake className="w-4 h-4 mr-2" />
                Submit Offer of KES {numericOffer > 0 ? numericOffer.toLocaleString() : "..."}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by Till 1572931 Escrow Guarantee</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
