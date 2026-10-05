import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes cleanly and resolves conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats monetary amounts in KES (Kenyan Shillings) or custom currency.
 */
export function formatCurrency(amount: number, currency: string = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats large gaming stats (e.g. 1,200,000 GP -> 1.2M GP).
 */
export function formatCompactNumber(number: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
}

/**
 * Maps raw playstyle keys to human readable titles.
 */
export function getPlaystyleLabel(playstyle: string): string {
  const map: Record<string, string> = {
    possession: "Possession Game",
    quick_counter: "Quick Counter",
    long_ball_counter: "Long Ball Counter",
    out_wide: "Out Wide",
    long_ball: "Long Ball",
  };
  return map[playstyle] || playstyle;
}

/**
 * Maps platform codes to display badges.
 */
export function getPlatformLabel(platform: string): string {
  const map: Record<string, string> = {
    android: "Android Mobile",
    ios: "iOS Mobile",
    pc_steam: "PC / Steam",
    playstation_4: "PlayStation 4",
    playstation_5: "PlayStation 5",
    xbox_one: "Xbox One",
    xbox_series_x: "Xbox Series X/S",
  };
  return map[platform] || platform;
}

/**
 * Maps Konami ID status to user-friendly badge data.
 */
export function getKonamiIdStatusInfo(status: string): { label: string; safe: boolean; description: string } {
  switch (status) {
    case "linked_changeable":
      return {
        label: "Konami ID Changeable",
        safe: true,
        description: "Seller can transfer the Konami ID and associated email directly to buyer.",
      };
    case "unlinked":
      return {
        label: "Konami ID Unlinked",
        safe: true,
        description: "Account is not yet bound to Konami ID. Buyer can bind their own email immediately.",
      };
    case "linked_immutable":
      return {
        label: "Konami ID Locked",
        safe: false,
        description: "Account email cannot be modified. Extreme caution advised.",
      };
    default:
      return {
        label: status,
        safe: false,
        description: "Unknown linking status.",
      };
  }
}
