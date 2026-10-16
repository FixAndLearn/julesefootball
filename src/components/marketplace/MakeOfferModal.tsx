"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Listing } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { isListingOnFlashSale } from "@/lib/utils/flashSale";
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
  Sparkles,
  Edit3,
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
  const [mounted, setMounted] = useState(false);

  const originalPrice = Number(listing.price);
  const minAllowed = Math.floor(originalPrice * 0.5);

  const [offerPrice, setOfferPrice] = useState<number | string>(
    Math.round(originalPrice * 0.85) // default 15% discount
  );
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(15);
  const [buyerName, setBuyerName] = useState(buyerDefaultName);
  const [buyerPhone, setBuyerPhone] = useState(buyerDefaultPhone);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState<{
    offer: any;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update default contact details when props change
  useEffect(() => {
    if (buyerDefaultName) setBuyerName(buyerDefaultName);
    if (buyerDefaultPhone) setBuyerPhone(buyerDefaultPhone);
  }, [buyerDefaultName, buyerDefaultPhone]);

  if (!isOpen || !mounted) return null;

  const numericOffer = Number(offerPrice) || 0;
  const discountAmount = originalPrice - numericOffer;
  const discountPercent =
    originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;

  const handlePresetClick = (percent: number) => {
    setSelectedPreset(percent);
    const discounted = Math.round(originalPrice * (1 - percent / 100));
    setOfferPrice(discounted);
    setError("");
  };

  const handleCustomPriceChange = (val: string) => {
    setSelectedPreset("custom");
    setOfferPrice(val);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isListingOnFlashSale(listing)) {
      setError("This account is currently on Friday Flash Drop at a fixed promotional discount. Bargaining is withdrawn during flash sales.");
      return;
    }

    if (!numericOffer || numericOffer < minAllowed) {
      setError(`Minimum allowed offer is KES ${minAllowed.toLocaleString()} (50% of asking price).`);
      return;
    }

    if (numericOffer >= originalPrice) {
      setError(`Offer must be lower than the asking price of KES ${originalPrice.toLocaleString()}. To pay asking price, click Buy Now!`);
      return;
    }

    const norm = normalizePhoneNumber(buyerPhone);
    if (!norm.isValid) {
      setError("Please provide a valid phone number (e.g. 0794400365 or +254 794 400 365).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          buyer_name: buyerName.trim() || "Buyer",
          buyer_phone: norm.international,
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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-pitch-surface border border-pitch-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-pitch-border flex items-center justify-between bg-pitch-card/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 font-display">
                Make an Offer / Bargain Price
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct price negotiation backed by Till 1572931 Escrow
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-pitch-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedData ? (
          /* Success Screen */
          <div className="p-6 space-y-5 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in-95">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-100 font-display">
                Offer Automatically Sent to Seller!
              </h4>
              <p className="text-xs text-slate-300">
                You proposed <strong className="text-emerald-400 font-mono text-sm">KES {numericOffer.toLocaleString()}</strong> ({discountPercent}% discount).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-left text-slate-300 space-y-2">
              <span className="font-semibold text-emerald-300 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Automatic Seller Alert Dispatched</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The seller has been notified on their registered phone number and eFootballMarket account. Once the seller accepts or counters, you will receive an instant notification to complete checkout via Till 1572931.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <div className="text-left">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Optional Courtesy Action:
                </span>
                <a
                  href={submittedData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-lg active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Courtesy WhatsApp Ping (Optional)</span>
                </a>
              </div>

              <Button variant="secondary" size="md" className="w-full text-xs font-semibold" onClick={onClose}>
                Done & Return to Listing
              </Button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
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

              {/* Quick Discount Presets & Custom Pill */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Quick Discount Presets or Custom Amount:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePresetClick(pct)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                        selectedPreset === pct
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:bg-pitch-surface hover:text-white"
                      }`}
                    >
                      <span className="font-bold">-{pct}%</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        KES {Math.round(originalPrice * (1 - pct / 100)).toLocaleString()}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelectedPreset("custom")}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      selectedPreset === "custom"
                        ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10"
                        : "bg-pitch-card border-pitch-border text-slate-300 hover:bg-pitch-surface hover:text-white"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold">Custom</span>
                  </button>
                </div>
              </div>

              {/* Custom Price Input (Full arbitrary price freedom e.g. 70 bob) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
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
                    step="1"
                    placeholder={`e.g. ${Math.round(originalPrice * 0.75)}`}
                    value={offerPrice}
                    onChange={(e) => handleCustomPriceChange(e.target.value)}
                    required
                    className="w-full pl-14 pr-4 py-3 rounded-xl bg-pitch-card border border-pitch-border text-slate-100 text-base font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Minimum acceptable offer: <strong className="text-slate-300">KES {minAllowed.toLocaleString()}</strong> (50% threshold)</span>
                  <span>Asking: <strong className="text-slate-300">{formatCurrency(originalPrice)}</strong></span>
                </div>
              </div>

              {/* Buyer Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name / Handle <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Brian O."
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    M-Pesa Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0794400365 or +254 794 400 365"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
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
                  className="w-full px-3 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}
            </div>

            {/* Sticky Modal Footer: Submit Button is ALWAYS visible */}
            <div className="p-4 sm:p-5 border-t border-pitch-border bg-pitch-surface shrink-0 space-y-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full font-bold shadow-xl shadow-amber-500/10 py-3 text-sm"
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

  return createPortal(modalContent, document.body);
}
