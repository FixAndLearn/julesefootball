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
      label: "Master Merchant",
      shortLabel: "Master",
      badgeClass:
        "bg-gradient-to-r from-amber-500/30 via-yellow-400/25 to-amber-600/30 border-amber-400/80 text-amber-200 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50",
      iconType: "crown",
      salesRequiredForNext: 0,
      nextTierLabel: null,
      description: "Elite eFootball vendor with 10+ verified escrow completions and top-rated trade record.",
      perks: [
        "Gold Master Merchant badge on all listings",
        "Top-priority search ranking & browse visibility",
        "Fast-track 60-second M-Pesa withdrawal processing",
        "Direct VIP channel to Platform Director Brian Okibo",
      ],
    };
  }

  if (count >= 3) {
    const remaining = Math.max(0, 10 - count);
    return {
      level: "verified",
      label: "Verified Trader",
      shortLabel: "Verified",
      badgeClass:
        "bg-emerald-950/90 border-emerald-500/70 text-emerald-300 shadow-md shadow-emerald-500/15",
      iconType: "shield-check",
      salesRequiredForNext: remaining,
      nextTierLabel: "Master Merchant",
      description: "Established Kenyan seller with 3+ successful account transfers and 100% escrow completion.",
      perks: [
        "Verified Trader emerald shield on all listings",
        "Elevated browse ranking above new sellers",
        "Access to 1-Click WhatsApp promotional flyer tools",
      ],
    };
  }

  const remaining = Math.max(0, 3 - count);
  return {
    level: "rookie",
    label: "Rookie Trader",
    shortLabel: "Rookie",
    badgeClass:
      "bg-slate-900/90 border-slate-700 text-slate-300 shadow-sm",
    iconType: "shield",
    salesRequiredForNext: remaining,
    nextTierLabel: "Verified Trader",
    description: "New platform seller trading under mandatory 24-hour Safaricom Till 1572931 Escrow Protection.",
    perks: [
      "100% Escrow Protection via Till 1572931",
      "0% platform seller fee (100% net payout)",
      "Automatic promotion to Verified after 3 successful sales",
    ],
  };
}
