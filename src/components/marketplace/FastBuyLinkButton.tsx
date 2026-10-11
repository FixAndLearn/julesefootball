"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Copy, Check, Zap, Share2 } from "lucide-react";

interface FastBuyLinkButtonProps {
  listingId: string;
  listingTitle?: string;
  price?: number;
  variant?: "button" | "compact";
}

export function FastBuyLinkButton({
  listingId,
  listingTitle,
  price,
  variant = "button",
}: FastBuyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const getPayUrl = () => {
    if (typeof window === "undefined") return `/pay/${listingId}`;
    return `${window.location.origin}/pay/${listingId}`;
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getPayUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (variant === "compact") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
        onClick={handleCopy}
        title="Copy direct 1-tap M-Pesa checkout link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>Fast Link</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="md"
      className="w-full text-xs font-semibold border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-400"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2 text-emerald-400" />
          <span>Direct Checkout Link Copied to Clipboard!</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 mr-2 text-emerald-400" />
          <span>Copy Fast WhatsApp Buy Link (/pay/{listingId.slice(0, 8)})</span>
        </>
      )}
    </Button>
  );
}
