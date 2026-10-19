import { Listing } from "@/types/database";

export const FRIDAY_DROP_START_HOUR_EAT = 14; // 2:00 PM East Africa Time
export const FRIDAY_DROP_END_HOUR_EAT = 22;   // 10:00 PM East Africa Time
export const FRIDAY_DROP_DURATION_HOURS = 8;  // Strictly 8 hours duration

/**
 * Returns the current date shifted into East Africa Time (EAT = UTC+3).
 * When reading time components, use getUTC* methods (getUTCDay, getUTCHours, etc.)
 * to ensure 100% independence from the client/server machine's local timezone.
 */
export function getEATDate(date: Date = new Date()): Date {
  const eatOffsetMs = 3 * 60 * 60 * 1000; // EAT is UTC+3 permanently
  return new Date(date.getTime() + eatOffsetMs);
}

/**
 * Checks if current time in East Africa Time (EAT / UTC+3) is within the
 * exclusive 8-hour Friday drop window (Friday 14:00:00 to 21:59:59 EAT).
 */
export function isFridayDropActive(date: Date = new Date()): boolean {
  try {
    const eatDate = getEATDate(date);
    const dayOfWeek = eatDate.getUTCDay(); // 0 = Sunday, 5 = Friday
    const hour = eatDate.getUTCHours();
    return dayOfWeek === 5 && hour >= FRIDAY_DROP_START_HOUR_EAT && hour < FRIDAY_DROP_END_HOUR_EAT;
  } catch {
    return false;
  }
}

/**
 * Legacy alias for isFridayDropActive to ensure backward-compatibility.
 * Returns true strictly during the 8-hour Friday drop window.
 */
export function isFridayInEAT(): boolean {
  return isFridayDropActive();
}

export interface FridayDropCountdown {
  isActive: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  targetDateUtc: Date;
}

/**
 * Calculates countdown time to the next Friday Drop start OR to the end of the
 * current active 8-hour Friday drop.
 */
export function getFridayDropCountdown(date: Date = new Date()): FridayDropCountdown {
  const eatOffsetMs = 3 * 60 * 60 * 1000;
  const eatDate = new Date(date.getTime() + eatOffsetMs);
  const dayOfWeek = eatDate.getUTCDay(); // 0 = Sunday, 5 = Friday
  const hour = eatDate.getUTCHours();

  const isFriday = dayOfWeek === 5;
  const isActive = isFriday && hour >= FRIDAY_DROP_START_HOUR_EAT && hour < FRIDAY_DROP_END_HOUR_EAT;

  let targetDateUtc: Date;

  if (isActive) {
    // Drop is LIVE! Countdown until the end of the 8-hour window (22:00:00 EAT)
    const target = new Date(eatDate);
    target.setUTCHours(FRIDAY_DROP_END_HOUR_EAT, 0, 0, 0);
    targetDateUtc = new Date(target.getTime() - eatOffsetMs);
  } else {
    // Drop is inactive. Calculate countdown to next Friday at 14:00:00 EAT
    let daysToAdd = 0;
    if (isFriday && hour < FRIDAY_DROP_START_HOUR_EAT) {
      // It's Friday before 14:00 EAT; drop unlocks later today
      daysToAdd = 0;
    } else {
      // Days until next Friday (day 5)
      daysToAdd = (5 - dayOfWeek + 7) % 7;
      if (daysToAdd === 0) {
        // It's Friday after 22:00 EAT; next drop is 7 days away
        daysToAdd = 7;
      }
    }

    const target = new Date(eatDate);
    target.setUTCDate(eatDate.getUTCDate() + daysToAdd);
    target.setUTCHours(FRIDAY_DROP_START_HOUR_EAT, 0, 0, 0);
    targetDateUtc = new Date(target.getTime() - eatOffsetMs);
  }

  const diffMs = Math.max(0, targetDateUtc.getTime() - date.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    isActive,
    days,
    hours,
    minutes,
    seconds,
    targetDateUtc,
  };
}

/**
 * Determines if a listing is currently under an active Flash Drop / Friday Sale.
 * Drops are manipulated to drop on Fridays ONLY for 8 hours (14:00 - 22:00 EAT).
 * Outside of this 8-hour window, Friday drops disappear completely until next Friday.
 */
export function isListingOnFlashSale(listing?: Listing | null): boolean {
  if (!listing) return false;
  // Flash drops strictly run during the 8-hour Friday window
  if (!isFridayDropActive()) return false;
  // If explicitly flagged as a flash sale
  if ((listing as any).is_flash_sale) return true;
  // If the listing is curated/featured during the active drop window
  if (listing.is_featured) return true;
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
