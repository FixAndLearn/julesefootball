import { Listing } from "@/types/database";

/**
 * Checks if current time in East Africa Time (EAT / UTC+3) is Friday.
 */
export function isFridayInEAT(): boolean {
  try {
    const now = new Date();
    // Convert to UTC+3 (East Africa Time)
    const eatOffsetMs = 3 * 60 * 60 * 1000;
    const eatNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + eatOffsetMs);
    return eatNow.getDay() === 5; // 5 = Friday
  } catch {
    return false;
  }
}

/**
 * Determines if a listing is currently under an active Flash Drop / Friday Sale.
 */
export function isListingOnFlashSale(listing?: Listing | null): boolean {
  if (!listing) return false;
  // If explicitly flagged as a flash sale
  if ((listing as any).is_flash_sale) return true;
  // If Friday Drops are active in Kenya and the listing is curated/featured
  if (isFridayInEAT() && listing.is_featured) return true;
  return false;
}

/**
 * Calculates original reference price and flash sale discount percentage.
 */
export function getFlashSalePricing(listing: Listing) {
  const flashPrice = Number(listing.price);
  const originalPrice = Math.round(flashPrice * 1.35); // 26% flash discount
  const discountPercent = Math.round(((originalPrice - flashPrice) / originalPrice) * 100);

  return {
    originalPrice,
    flashPrice,
    discountPercent,
  };
}

/**
 * Mutually exclusive trade validation:
 * Determines if a buyer is allowed to negotiate/bargain on a listing.
 *
 * Rules:
 * - A listing on Flash Sale cannot be bargained (promotional price is locked).
 * - A listing that is not 'published' (e.g. sold, in_escrow) cannot be bargained.
 * - A seller cannot bargain on their own listing.
 */
export function canListingBeBargained(listing?: Listing | null, currentUserId?: string): {
  allowed: boolean;
  reason?: "flash_sale" | "not_published" | "is_owner";
  message?: string;
} {
  if (!listing) {
    return { allowed: false, reason: "not_published", message: "Listing not found." };
  }

  if (listing.status !== "published") {
    return {
      allowed: false,
      reason: "not_published",
      message:
        listing.status === "sold"
          ? "This account has already been sold and delivered."
          : "This account is currently locked in escrow inspection.",
    };
  }

  if (currentUserId && currentUserId === listing.seller_id) {
    return {
      allowed: false,
      reason: "is_owner",
      message: "You own this listing.",
    };
  }

  if (isListingOnFlashSale(listing)) {
    return {
      allowed: false,
      reason: "flash_sale",
      message: "Bargaining is withdrawn during Flash Drops. Price is locked at maximum discount.",
    };
  }

  return { allowed: true };
}

/**
 * Mutually exclusive purchase validation:
 * Determines if a listing can be purchased.
 */
export function canListingBePurchased(listing?: Listing | null, currentUserId?: string): {
  allowed: boolean;
  reason?: "not_published" | "is_owner";
  message?: string;
} {
  if (!listing) {
    return { allowed: false, reason: "not_published", message: "Listing not found." };
  }

  if (listing.status !== "published") {
    return {
      allowed: false,
      reason: "not_published",
      message:
        listing.status === "sold"
          ? "This squad is sold and delivered."
          : "Under 24h escrow inspection.",
    };
  }

  if (currentUserId && currentUserId === listing.seller_id) {
    return {
      allowed: false,
      reason: "is_owner",
      message: "You own this listing.",
    };
  }

  return { allowed: true };
}
