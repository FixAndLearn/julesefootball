"use client";

import { Button } from "@/components/ui/Button";
import { ShieldCheck, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface BuyNowButtonProps {
  listingId: string;
  priceFormatted: string;
}

export function BuyNowButton({ listingId, priceFormatted }: BuyNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuyNow = async () => {
    setLoading(true);
    setError("");

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
    <div className="w-full space-y-2">
      <Button
        variant="gold"
        size="lg"
        className="w-full font-bold text-base shadow-xl shadow-amber-500/10"
        onClick={handleBuyNow}
        isLoading={loading}
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Buy Now & Lock Escrow ({priceFormatted})
      </Button>

      {error && (
        <p className="text-xs text-rose-400 text-center font-medium">{error}</p>
      )}

      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Protected by eFootballMarket Escrow Guarantee
      </p>
    </div>
  );
}
