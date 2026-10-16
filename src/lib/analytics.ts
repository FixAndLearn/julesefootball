// Google Analytics 4 & Google Consent Mode v2 Engine

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export interface CookieConsentState {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
}

export const DEFAULT_CONSENT: CookieConsentState = {
  necessary: true,
  analytics: false,
  advertising: false,
  timestamp: new Date().toISOString(),
};

// Update Google Consent Mode v2
export const updateGoogleConsent = (consent: CookieConsentState) => {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  (window as any).gtag("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.advertising ? "granted" : "denied",
    ad_user_data: consent.advertising ? "granted" : "denied",
    ad_personalization: consent.advertising ? "granted" : "denied",
  });
};

// Track Page Views
export const pageview = (url: string) => {
  if (typeof window === "undefined" || !(window as any).gtag || !GA_MEASUREMENT_ID) return;
  (window as any).gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track Custom Event
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window === "undefined" || !(window as any).gtag) return;
  (window as any).gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
