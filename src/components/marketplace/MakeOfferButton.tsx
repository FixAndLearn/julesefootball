"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MakeOfferModal } from "@/components/marketplace/MakeOfferModal";
import { Listing } from "@/types/database";
import { Handshake } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
