/**
 * eFootballMarket Anti-Circumvention & Anti-Fraud Chat Shield
 * Strict zero-tolerance detection for off-platform contacts (WhatsApp, Telegram, phone numbers, external URLs).
 * Prevents off-platform bypass scams and protects buyers & sellers within automated M-Pesa escrow.
 */

export interface FilterResult {
  isBlocked: boolean;
  reason?: string;
  matchedCategory?: "whatsapp" | "telegram" | "url" | "phone_number" | "off_platform";
  userWarningMessage?: string;
}

const WHATSAPP_PATTERNS = [
  /\bwhats\s*app\b/i,
  /\bwa\.me\b/i,
  /\bwats\s*app?\b/i,
  /\bwat\s*sap\b/i,
  /\bchat\s+(on|in|via)\s+wa\b/i,
  /\b(hmu|dm|text|msg|inbox)\s+(on|in|via)?\s*wa\b/i,
  /\bwa\s+number\b/i,
  /\bmy\s+wa\b/i,
  /\bwa\s*:\s*\d+/i,
];

const TELEGRAM_PATTERNS = [
  /\btele\s*gram\b/i,
  /\bt\.me\b/i,
  /\btg\s+me\b/i,
  /\bchat\s+(on|in|via)\s+tg\b/i,
  /\b(hmu|dm|text|msg|inbox)\s+(on|in|via)?\s*tg\b/i,
  /\btelegram\s+handle\b/i,
  /@[a-zA-Z0-9_]{5,32}\b/i, // Telegram style username handles
];

const EXTERNAL_URL_PATTERNS = [
  /https?:\/\/[^\s]+/i,
  /\bwww\.[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/i,
  /\b[a-zA-Z0-9-]+\.(com|org|net|io|co|ke|me|xyz|app|link|cc|to|gg|site|top|online|tech)\b/i,
  /\b(give|send|open|click|use)\s+(you\s+)?(a|the|this)?\s*link\b/i,
];

const OFF_PLATFORM_KEYWORDS = [
  /\bdiscord\b/i,
  /\binstagram\b/i,
  /\binsta\b/i,
  /\b(my|on)\s+ig\b/i,
  /\bsnap\s*chat\b/i,
  /\bface\s*book\b/i,
  /\btwitter\b/i,
  /\btiktok\b/i,
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i, // Raw email addresses
];

// Matches phone numbers including Kenyan formats (07..., 01..., +254..., 254...)
// Handles spaced or dash-separated numbers e.g. "07 12 34 56 78" or "07-12-34-56"
const PHONE_NUMBER_PATTERNS = [
  /(?:\+?254|0)[17]\d{1,2}[\s.-]?\d{3}[\s.-]?\d{3,4}/,
  /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  /\b0[17]\d{8}\b/,
];

const SOLICITATION_PATTERNS = [
  /\b(chat|talk|message|contact\s+me)\s+(in|on|via)\s+(whats\s*app|watsapp|telegram|tg|wa)\b/i,
  /\b(give|send|share|drop|leave)\s+(me\s+)?(your|ur)?\s*(number|no|digits|contact|phone)\b/i,
  /\b(my|call\s+me\s+on)\s*(number|no|digits|contact|phone)\s*(is|:)?\b/i,
];

export function detectProhibitedOffPlatformContent(rawContent: string): FilterResult {
  if (!rawContent || typeof rawContent !== "string") {
    return { isBlocked: false };
  }

  const content = rawContent.trim();

  // Normalize leetspeak and stripped spacing (e.g. "w h a t s a p p" -> "whatsapp")
  const strippedContent = content
    .toLowerCase()
    .replace(/[\s._-]+/g, "");

  // 1. WhatsApp Check
  for (const pattern of WHATSAPP_PATTERNS) {
    if (pattern.test(content) || pattern.test(strippedContent)) {
      return {
        isBlocked: true,
        reason: "Detected WhatsApp solicitation or contact handle",
        matchedCategory: "whatsapp",
        userWarningMessage:
          "⚠️ Prohibited: Sharing or requesting WhatsApp contact is strictly forbidden. For your financial safety, all conversations, orders, and deliveries must stay within eFootballMarket's automated M-Pesa escrow. Moving off-platform voids your buyer/seller guarantee and will lead to account suspension.",
      };
    }
  }

  if (strippedContent.includes("whatsapp") || strippedContent.includes("watsapp") || strippedContent.includes("wame")) {
    return {
      isBlocked: true,
      reason: "Detected obfuscated WhatsApp keyword",
      matchedCategory: "whatsapp",
      userWarningMessage:
        "⚠️ Prohibited: Sharing or requesting WhatsApp contact is strictly forbidden. Communications must remain in our protected escrow messaging center.",
    };
  }

  // 2. Telegram Check
  for (const pattern of TELEGRAM_PATTERNS) {
    if (pattern.test(content) || pattern.test(strippedContent)) {
      return {
        isBlocked: true,
        reason: "Detected Telegram handle or link",
        matchedCategory: "telegram",
        userWarningMessage:
          "⚠️ Prohibited: Sharing or requesting Telegram contact is strictly forbidden. All negotiations and account transfers must remain inside eFootballMarket to protect your funds in escrow.",
      };
    }
  }

  if (strippedContent.includes("telegram") || strippedContent.includes("tme/")) {
    return {
      isBlocked: true,
      reason: "Detected obfuscated Telegram keyword",
      matchedCategory: "telegram",
      userWarningMessage:
        "⚠️ Prohibited: Sharing Telegram details is strictly forbidden. Moving off-platform is a primary vector for account theft.",
    };
  }

  // 3. External URLs / Links Check
  for (const pattern of EXTERNAL_URL_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isBlocked: true,
        reason: "Detected external hyperlink or unauthorized URL",
        matchedCategory: "url",
        userWarningMessage:
          "⚠️ Prohibited: Sharing external website links or phishing URLs is strictly blocked. To keep all traders secure from phishing and credential snatching, links outside eFootballMarket are deleted directly.",
      };
    }
  }

  // 4. Phone Numbers Check
  for (const pattern of PHONE_NUMBER_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isBlocked: true,
        reason: "Detected personal phone number exchange",
        matchedCategory: "phone_number",
        userWarningMessage:
          "⚠️ Prohibited: Sharing direct phone numbers is blocked. Transactions must proceed via automated M-Pesa STK Push inside the escrow vault without off-platform contact.",
      };
    }
  }

  // 4b. Contact Solicitation Check
  for (const pattern of SOLICITATION_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isBlocked: true,
        reason: "Detected solicitation for off-platform contact",
        matchedCategory: "off_platform",
        userWarningMessage:
          "⚠️ Prohibited: Soliciting off-platform contacts or phone numbers is strictly forbidden. All negotiations and escrow transactions must remain inside eFootballMarket.",
      };
    }
  }

  // 5. General Off-Platform Social Channels & Emails
  for (const pattern of OFF_PLATFORM_KEYWORDS) {
    if (pattern.test(content) || pattern.test(strippedContent)) {
      return {
        isBlocked: true,
        reason: "Detected off-platform contact channel or raw email",
        matchedCategory: "off_platform",
        userWarningMessage:
          "⚠️ Prohibited: Sharing external social media accounts or off-platform contact details is forbidden. All order support and credential delivery take place right here.",
      };
    }
  }

  return { isBlocked: false };
}
