"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import { normalizePhoneNumber, formatDisplayPhone } from "@/lib/utils/phone";
import { Listing, ListingOffer } from "@/types/database";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Lock,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Clock,
  Tag,
} from "lucide-react";
import Link from "next/link";

interface DirectCheckoutFormProps {
  listing: Listing;
  currentUserId?: string;
  currentUserPhone?: string;
  currentUserName?: string;
}

export function DirectCheckoutForm({
  listing,
  currentUserId,
  currentUserPhone = "",
  currentUserName = "",
}: DirectCheckoutFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offer");

  const [phoneNumber, setPhoneNumber] = useState(currentUserPhone);
  const [buyerName, setBuyerName] = useState(currentUserName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Offer verification state
  const [activeOffer, setActiveOffer] = useState<ListingOffer | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(Boolean(offerId));

  // Payment progress states
  const [stkStatus, setStkStatus] = useState<"idle" | "prompt_sent" | "polling" | "confirmed" | "failed">("idle");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [countdown, setCountdown] = useState(60);

  // Fetch offer details if offerId is present
  useEffect(() => {
    if (!offerId) return;

    let isMounted = true;
    fetch(`/api/offers?offerId=${encodeURIComponent(offerId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.offer && data.offer.status === "accepted") {
          setActiveOffer(data.offer);
          if (data.offer.buyer_name && !buyerName) setBuyerName(data.offer.buyer_name);
          if (data.offer.buyer_phone && !phoneNumber) setPhoneNumber(data.offer.buyer_phone);
        }
      })
      .catch((err) => console.warn("Offer fetch note:", err))
      .finally(() => {
        if (isMounted) setLoadingOffer(false);
      });

    return () => {
      isMounted = false;
    };
  }, [offerId]);

  // Polling STK Push status
  useEffect(() => {
    if (stkStatus !== "polling" || !checkoutRequestId) return;

    let pollInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;

    timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          clearInterval(pollInterval);
          setStkStatus("failed");
          setError("M-Pesa payment prompt timed out. Please retry or verify you have sufficient funds.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}`);
        const data = await res.json();

        if (data.status === "completed" || data.status === "success") {
          clearInterval(pollInterval);
          clearInterval(timerInterval);
          setStkStatus("confirmed");
          setTimeout(() => {
            if (createdOrderId) {
              router.push(`/orders/${createdOrderId}`);
            }
          }, 2500);
        } else if (data.status === "failed") {
          clearInterval(pollInterval);
          clearInterval(timerInterval);
          setStkStatus("failed");
          setError(data.message || "Payment cancelled or rejected by user.");
        }
      } catch {
        // Continue polling
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [stkStatus, checkoutRequestId, createdOrderId, router]);

  const payablePrice = activeOffer?.offered_price || Number(listing.price);
  const isDiscounted = activeOffer && activeOffer.status === "accepted";

  const handleTriggerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const norm = normalizePhoneNumber(phoneNumber);
    if (!norm.isValid) {
      setError("Please enter a valid Safaricom phone number (e.g. 0794400365 or +254 794 400 365).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payments/direct-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          phoneNumber: norm.digits,
          buyerName: buyerName || "eFootball Trader",
          offerId: activeOffer?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger M-Pesa STK Push");
      }

      setCreatedOrderId(data.orderId);
      setCheckoutRequestId(data.checkoutRequestId || "");
      setCountdown(60);
      setStkStatus("polling");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Top Escrow Guarantee Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Till 1572931 Verified Escrow Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
          Instant M-Pesa Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Funds are locked in escrow and released to the seller only after you test and bind Konami ID credentials.
        </p>
      </div>

      {/* Accepted Offer Banner */}
      {isDiscounted && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-emerald-950/60 border border-amber-500/50 flex items-start gap-3 shadow-lg">
          <Tag className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <span className="font-bold text-amber-300 block text-sm">
              🎉 Accepted Offer Applied ({activeOffer.discount_percentage}% OFF)
            </span>
            <p className="text-slate-300">
              The seller accepted your custom price of <strong>KES {activeOffer.offered_price.toLocaleString()}</strong>.
              This discounted rate is locked for checkout.
            </p>
          </div>
        </div>
      )}

      {/* Squad Summary Card */}
      <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                {getPlatformLabel(listing.platform)}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                OVR {listing.overall_team_strength}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 font-display">
              {listing.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manager: {listing.manager_name || "Custom"} • Playstyle: {listing.primary_playstyle?.replace("_", " ") || "Quick Counter"}
            </p>
          </div>

          <Link
            href={`/listings/${listing.id}`}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 shrink-0 pt-1"
          >
            <span>View Squad</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pricing Breakdown */}
        <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Listing Price</span>
            <span className={isDiscounted ? "line-through text-slate-500 font-mono" : "text-slate-200 font-mono"}>
              {formatCurrency(listing.price)}
            </span>
          </div>

          {isDiscounted && (
            <div className="flex justify-between text-amber-400 font-semibold">
              <span>Accepted Offer Discount</span>
              <span className="font-mono">
                - {formatCurrency(Number(listing.price) - activeOffer.offered_price)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Escrow Protection Fee</span>
            <span className="text-emerald-400 font-semibold">0 KES (Free Launch Promo)</span>
          </div>

          <div className="border-t border-pitch-border/60 pt-2 flex justify-between items-baseline font-bold text-sm">
            <span className="text-slate-200">Total Payable via M-Pesa:</span>
            <span className="text-2xl text-emerald-400 font-mono font-extrabold">
              {formatCurrency(payablePrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Checkout Form OR Polling State */}
      {stkStatus === "idle" || stkStatus === "failed" ? (
        <form onSubmit={handleTriggerPayment} className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-2xl space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-pitch-border/60">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Enter Safaricom Details
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                M-Pesa Phone Number (Auto International Format) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 0794400365 or +254 794 400 365"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-pitch-card border border-pitch-border text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports local (07/01) or international (+254) formats. PIN prompt will appear for <strong>Till 1572931 (EFootballMarket)</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Name / WhatsApp Handle <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Brian O."
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5 shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Payment Notice</span>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full text-base font-extrabold shadow-xl shadow-amber-500/10 py-6"
            isLoading={loading}
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Pay {formatCurrency(payablePrice)} via M-Pesa
          </Button>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safaricom Daraja API Protected</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Share Buy Link"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Live Polling & Prompt Status Screen */
        <div className="p-8 rounded-2xl bg-pitch-surface border border-emerald-500/40 shadow-2xl space-y-6 text-center animate-fade-in">
          {stkStatus === "confirmed" ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-emerald-300 font-display">
                  Payment Confirmed via M-Pesa!
                </h3>
                <p className="text-xs text-slate-300">
                  Funds safely secured in escrow under <strong>Till 1572931</strong>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300">
                Redirecting you to view credentials & start the Konami ID takeover checklist...
              </div>
              {createdOrderId && (
                <Link href={`/orders/${createdOrderId}`}>
                  <Button variant="gold" size="lg" className="w-full mt-2 font-bold">
                    View Credentials & Order #{createdOrderId.slice(0, 8)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400/80 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-100 font-display">
                  M-Pesa STK Prompt Sent!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  A prompt was sent to <strong className="text-emerald-400 font-mono">{phoneNumber}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-left space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>Next Steps on your phone ({countdown}s):</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-300">
                  <li>Unlock your Safaricom phone.</li>
                  <li>Verify Till: <strong>1572931 (EFootballMarket)</strong>.</li>
                  <li>Verify Amount: <strong>KES {payablePrice.toLocaleString()}</strong>.</li>
                  <li>Enter your Secret M-Pesa PIN and press OK.</li>
                </ol>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Waiting for Safaricom confirmation...</span>
              </div>

              <button
                type="button"
                onClick={() => setStkStatus("idle")}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Change Phone Number or Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security Footer Guarantee */}
      <div className="p-4 rounded-xl bg-pitch-card/60 border border-pitch-border/60 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Why this checkout is 100% scam-proof:</span>
        </div>
        <ul className="space-y-1 text-[11px] text-slate-400 pl-6 list-disc">
          <li>The seller DOES NOT receive your money until you confirm Konami ID access.</li>
          <li>If credentials do not work, you can open an instant dispute for a full refund.</li>
          <li>Executive oversight by Brian Okibo, CEO (Helpline: 0794400365).</li>
        </ul>
      </div>
    </div>
  );
}
