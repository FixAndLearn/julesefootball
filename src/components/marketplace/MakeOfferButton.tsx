"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MakeOfferModal } from "@/components/marketplace/MakeOfferModal";
import { Listing } from "@/types/database";
import { Handshake } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MakeOfferButtonProps {
  listing: Listing;
}

export function MakeOfferButton({ listing }: MakeOfferButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsOpen(true)}
        className="w-full font-bold border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400"
      >
        <Handshake className="w-4 h-4 mr-2 text-amber-400" />
        Make an Offer / Bargain Price
      </Button>

      {isOpen && (
        <MakeOfferModal
          listing={listing}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          buyerId={user?.id}
          buyerDefaultName={profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : profile?.username || ""}
          buyerDefaultPhone={profile?.phone_number || ""}
        />
      )}
    </>
  );
}
