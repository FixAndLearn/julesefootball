"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, ShoppingCart, UserCheck, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface BuyNowButtonProps {
  listingId: string;
  priceFormatted: string;
}

export function BuyNowButton({ listingId, priceFormatted }: BuyNowButtonProps) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuyNow = async () => {
    setError("");

    if (!isAuthenticated && !authLoading) {
      router.push(`/login?redirect=/listings/${listingId}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/listings/${listingId}`);
          return;
        }
        throw new Error(data.error || "Failed to initialize order");
      }

      // Redirect directly to the order escrow page
      router.push(`/orders/${data.order.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <Button
        variant="gold"
        size="lg"
        className="w-full font-bold text-base shadow-xl shadow-amber-500/10"
        onClick={handleBuyNow}
        isLoading={loading}
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        {isAuthenticated ? `Buy Now & Lock Escrow (${priceFormatted})` : `Log In to Purchase (${priceFormatted})`}
      </Button>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 shadow-md">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}


      {/* Guest guidance: tells visitor when & why to sign in or create an account */}
      {!isAuthenticated && !authLoading && (
        <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guest Buyer Recommendation:</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Create an account or log in to secure your M-Pesa payment in escrow and view encrypted account login credentials safely.
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <Link
              href={`/login?redirect=/listings/${listingId}`}
              className="text-xs px-2.5 py-1 rounded-md bg-pitch-surface border border-pitch-border text-slate-200 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href={`/register?redirect=/listings/${listingId}`}
              className="text-xs px-2.5 py-1 rounded-md bg-brand-500/20 border border-brand-500/40 text-brand-300 hover:bg-brand-500/30 font-semibold transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-0.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Protected by eFootballMarket Escrow Guarantee
      </p>
    </div>
  );
}
