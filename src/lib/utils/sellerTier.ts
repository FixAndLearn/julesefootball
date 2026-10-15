export type SellerTierLevel = "rookie" | "verified" | "master";

export interface SellerTierInfo {
  level: SellerTierLevel;
  label: string;
  shortLabel: string;
  badgeClass: string;
  iconType: "shield" | "shield-check" | "crown";
  salesRequiredForNext: number;
  nextTierLabel: string | null;
  description: string;
  perks: string[];
}

export function getSellerTier(salesCount: number = 0, rating: number = 5.0): SellerTierInfo {
  const count = Math.max(0, Number(salesCount) || 0);
  const rate = Number(rating) || 5.0;

  if (count >= 10 && rate >= 4.5) {
    return {
      level: "master",
      label: "Top Rated Trader",
      shortLabel: "Top Rated",
      badgeClass:
        "bg-gradient-to-r from-amber-500/30 via-yellow-400/25 to-amber-600/30 border-amber-400/80 text-amber-200 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50",
      iconType: "crown",
      salesRequiredForNext: 0,
      nextTierLabel: null,
      description: "High-volume seller with 10+ completed escrow account transfers and strong buyer feedback.",
      perks: [
        "Top Rated Trader badge on all listings",
        "Top-priority search ranking & browse visibility",
        "Fast-track M-Pesa withdrawal processing",
        "Direct trade support channel",
      ],
    };
  }

  if (count >= 3) {
    const remaining = Math.max(0, 10 - count);
    return {
      level: "verified",
      label: "Experienced Trader",
      shortLabel: "Experienced",
      badgeClass:
        "bg-emerald-950/90 border-emerald-500/70 text-emerald-300 shadow-md shadow-emerald-500/15",
      iconType: "shield-check",
      salesRequiredForNext: remaining,
      nextTierLabel: "Top Rated Trader",
      description: "Active seller with 3+ completed account transfers under platform escrow.",
      perks: [
        "Experienced Trader shield badge on all listings",
        "Elevated browse ranking above new sellers",
        "Access to WhatsApp promotional flyer tools",
      ],
    };
  }

  const remaining = Math.max(0, 3 - count);
  return {
    level: "rookie",
    label: "New Trader",
    shortLabel: "New",
    badgeClass:
      "bg-slate-900/90 border-slate-700 text-slate-300 shadow-sm",
    iconType: "shield",
    salesRequiredForNext: remaining,
    nextTierLabel: "Experienced Trader",
    description: "Seller trading under standard 24-hour Safaricom Till 1572931 Escrow Protection.",
    perks: [
      "Escrow Protection via Till 1572931",
      "0% platform seller fee (full net payout)",
      "Automatic promotion after 3 completed sales",
    ],
  };
}
