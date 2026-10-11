"use client";

import React, { useState } from "react";
import { Listing } from "@/types/database";
import { WhatsAppFlyerModal } from "@/components/seller/WhatsAppFlyerModal";
import { Sparkles } from "lucide-react";

export function FlyerTriggerButton({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-pitch-card hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-semibold text-xs shadow-md transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span>Generate WhatsApp Promo Flyer</span>
      </button>

      <WhatsAppFlyerModal listing={listing} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
