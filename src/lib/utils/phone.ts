/**
/**
 * Universal Phone Number Formatting & Normalization Library
 * Standardizes Kenyan and international phone numbers across registration,
 * profiles, M-Pesa STK push, and direct WhatsApp links (wa.me).
 */

export interface NormalizedPhone {
  international: string;    // e.g. "+254794400365" (E.164 standard)
  digits: string;           // e.g. "254794400365" (For Safaricom Daraja STK Push)
  display: string;          // e.g. "+254 794 400 365" (Clean user display)
  whatsappDigits: string;   // e.g. "254794400365" (For https://wa.me/...)
  isValid: boolean;
}

/**
 * Normalizes any phone input string into standard international format.
 * Defaults to Kenya (+254) for numbers starting with 07, 01, 7, 1.
 */
export function normalizePhoneNumber(rawPhone: string): NormalizedPhone {
  if (!rawPhone || typeof rawPhone !== "string") {
    return {
      international: "",
      digits: "",
      display: "",
      whatsappDigits: "",
      isValid: false,
    };
  }

  // Strip all non-numeric characters except leading '+'
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, "");
  const hasPlus = cleaned.startsWith("+");
  let digitsOnly = cleaned.replace(/\D/g, "");

  if (!digitsOnly) {
    return {
      international: "",
      digits: "",
      display: "",
      whatsappDigits: "",
      isValid: false,
    };
  }

  // Kenyan local prefixes
  // e.g. 0794400365 -> 254794400365
  // e.g. 0112345678 -> 254112345678
  if (digitsOnly.startsWith("0") && (digitsOnly.length === 10)) {
    digitsOnly = "254" + digitsOnly.slice(1);
  } else if ((digitsOnly.startsWith("7") || digitsOnly.startsWith("1")) && digitsOnly.length === 9) {
    digitsOnly = "254" + digitsOnly;
  } else if (digitsOnly.startsWith("254") && digitsOnly.length === 12) {
    // Already in 254XXXXXXXXX format
  } else if (hasPlus && digitsOnly.length >= 10) {
    // Non-Kenyan international number (e.g. +256, +255, +44, +1)
  }

  const international = "+" + digitsOnly;
  const whatsappDigits = digitsOnly;

  // Pretty display formatting
  let display = international;
  if (digitsOnly.startsWith("254") && digitsOnly.length === 12) {
    const p1 = digitsOnly.slice(0, 3); // 254
    const p2 = digitsOnly.slice(3, 6); // 794
    const p3 = digitsOnly.slice(6, 9); // 400
    const p4 = digitsOnly.slice(9, 12); // 365
    display = `+${p1} ${p2} ${p3} ${p4}`;
  }

  // Validation check: Kenyan numbers must be 12 digits starting with 2547 or 2541
  // Other international numbers must have between 10 and 15 digits
  const isKenyanValid = digitsOnly.startsWith("254") && (digitsOnly.length === 12);
  const isOtherValid = digitsOnly.length >= 10 && digitsOnly.length <= 15;
  const isValid = isKenyanValid || isOtherValid;

  return {
    international,
    digits: digitsOnly,
    display,
    whatsappDigits,
    isValid,
  };
}

/**
 * Returns formatted international phone: "+254794400365"
 */
export function formatInternationalPhone(rawPhone: string): string {
  return normalizePhoneNumber(rawPhone).international;
}

/**
 * Returns clean display phone: "+254 794 400 365"
 */
export function formatDisplayPhone(rawPhone: string): string {
  return normalizePhoneNumber(rawPhone).display;
}

/**
 * Returns pure digits for WhatsApp URL: "254794400365"
 */
export function formatWhatsAppPhone(rawPhone: string): string {
  return normalizePhoneNumber(rawPhone).whatsappDigits;
}

/**
 * Builds a direct wa.me link with encoded pre-filled message.
 */
export function buildWhatsAppLink(rawPhone: string, message?: string): string {
  const norm = normalizePhoneNumber(rawPhone);
  const target = norm.whatsappDigits || "254794400365";
  if (!message) {
    return `https://wa.me/${target}`;
  }
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}
