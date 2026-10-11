"use client";

import { useState, useEffect } from "react";
import { ListingOffer } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Handshake,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

interface SellerListingOffersPanelProps {
  listingId: string;
}

export function SellerListingOffersPanel({ listingId }: SellerListingOffersPanelProps) {
  const [offers, setOffers] = useState<ListingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ [offerId: string]: { checkoutUrl: string; buyerWhatsAppUrl?: string } }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      const res = await fetch(`/api/offers?listingId=${encodeURIComponent(listingId)}`);
      const data = await res.json();
      if (data.offers) {
        setOffers(data.offers);
      }
    } catch (err) {
      console.warn("Failed to fetch offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [listingId]);

  const handleAction = async (offerId: string, action: "accept" | "counter" | "decline", counterPrice?: number) => {
    setActionLoading(offerId);
    try {
      const res = await fetch("/api/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer_id: offerId,
          action,
          counter_price: counterPrice,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionResult((prev) => ({
          ...prev,
          [offerId]: {
            checkoutUrl: data.checkoutUrl,
            buyerWhatsAppUrl: data.buyerWhatsAppUrl,
          },
        }));
        fetchOffers();
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyCheckout = (url: string, offerId: string) => {
    const full = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(full);
    setCopiedId(offerId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) return null;
  if (offers.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-600/40 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Handshake className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider font-display">
            Incoming Buyer Offers ({offers.length})
          </h3>
        </div>
        <span className="text-[11px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
          Negotiation Active
        </span>
      </div>

      <div className="space-y-3">
        {offers.map((offer) => {
          const result = actionResult[offer.id];

          return (
            <div
              key={offer.id}
              className="p-4 rounded-xl bg-pitch-surface border border-pitch-border space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">
                      {offer.buyer_name}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({offer.buyer_phone})
                    </span>
                  </div>
                  {offer.note && (
                    <p className="text-xs text-slate-300 italic mt-1 bg-pitch-card p-2 rounded-lg border border-pitch-border/60">
                      "{offer.note}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-emerald-400 font-mono block">
                    {formatCurrency(offer.offered_price)}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    -{offer.discount_percentage}% OFF
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`font-semibold capitalize px-2 py-0.5 rounded-md text-[11px] ${
                    offer.status === "accepted"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : offer.status === "declined"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : offer.status === "countered"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-slate-800 text-slate-200 border border-slate-700"
                  }`}
                >
                  {offer.status}
                </span>

                {offer.status === "accepted" && offer.expires_at && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Expires in 12 hours</span>
                  </span>
                )}
              </div>

              {/* Action Result / Link sharing */}
              {result && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 space-y-2 text-xs">
                  <span className="font-bold text-emerald-300 block">
                    🎉 Offer Accepted! Share Discounted Checkout Link:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopyCheckout(result.checkoutUrl, offer.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pitch-card border border-pitch-border text-slate-200 hover:text-white font-mono text-[11px]"
                    >
                      {copiedId === offer.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === offer.id ? "Copied!" : "Copy Checkout Link"}</span>
                    </button>

                    {result.buyerWhatsAppUrl && (
                      <a
                        href={result.buyerWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px]"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Send Link on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions for Pending Offer */}
              {offer.status === "pending" && !result && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="gold"
                    size="sm"
                    className="flex-1 font-bold text-xs"
                    disabled={actionLoading === offer.id}
                    onClick={() => handleAction(offer.id, "accept")}
                  >
                    {actionLoading === offer.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>Accept (KES {offer.offered_price.toLocaleString()})</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-rose-400 border-rose-800 hover:bg-rose-950/40"
                    disabled={actionLoading === offer.id}
                    onClick={() => handleAction(offer.id, "decline")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
