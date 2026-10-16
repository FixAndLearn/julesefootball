"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MakeOfferModal } from "@/components/marketplace/MakeOfferModal";
import { Listing } from "@/types/database";
import { Handshake, Flame, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { canListingBeBargained } from "@/lib/utils/flashSale";

interface MakeOfferButtonProps {
  listing: Listing;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "outline" | "gold" | "secondary";
}

export function MakeOfferButton({
  listing,
  size = "lg",
  className = "",
  variant = "outline",
}: MakeOfferButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();

  const bargainCheck = canListingBeBargained(listing, user?.id);

  // 1. If seller is the owner of this account, do not show bargaining button
  if (bargainCheck.reason === "is_owner") {
    return null;
  }

  // 2. If listing is on Flash Sale / Friday Drop, bargaining is strictly withdrawn
  if (bargainCheck.reason === "flash_sale") {
    return (
      <div
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-not-allowed select-none shadow-sm ${className}`}
        title="Bargaining is withdrawn for active Flash Drops. Price is locked at maximum discount."
      >
        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
        <span className="truncate">Flash Drop Locked (No Bargaining)</span>
      </div>
    );
  }

  // 3. If listing is not published (sold or in escrow), bargaining is disabled
  if (!bargainCheck.allowed) {
    return (
      <div
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed select-none ${className}`}
      >
        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="truncate">
          {listing.status === "sold" ? "Account Sold" : "Under Escrow Lock"}
        </span>
      </div>
    );
  }

  // 4. Normal open bargaining
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={`font-bold border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 active:scale-95 transition-all ${className}`}
      >
        <Handshake className="w-4 h-4 mr-1.5 text-amber-400 shrink-0" />
        <span>Bargain / Make Offer</span>
      </Button>

      {isOpen && (
        <MakeOfferModal
          listing={listing}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          buyerId={user?.id}
          buyerDefaultName={
            profile?.first_name
              ? `${profile.first_name} ${profile.last_name || ""}`.trim()
              : profile?.username || ""
          }
          buyerDefaultPhone={profile?.phone_number || ""}
        />
      )}
    </>
  );
}
