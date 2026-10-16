import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import { WhatsAppSupportWidget } from "@/components/support/WhatsAppSupportWidget";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.efootballmarket.co.ke");

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "eFootballMarket | Kenya's #1 Secure eFootball Account Trading & Community Hub",
    template: "%s | eFootballMarket",
  },
  description:
    "Buy and sell verified eFootball accounts with automated Safaricom M-Pesa escrow protection (Till 1572931). Compete in Kenyan tournaments, follow live brackets, and trade safely with a 24-hr buyer inspection window.",
  applicationName: "eFootballMarket",
  authors: [{ name: "Brian Okibo, Chief Executive Officer (CEO)" }],
  generator: "Next.js",
  keywords: [
    "eFootball accounts",
    "eFootball market Kenya",
    "buy eFootball account",
    "sell PES account",
    "eFootball mobile accounts",
    "eFootball escrow Kenya",
    "M-Pesa gaming account",
    "Konami ID accounts",
    "eFootball 2026 accounts",
    "3200 OVR eFootball account",
    "Epic booster player account",
    "buy PES mobile account M-Pesa",
    "eFootball accounts Nairobi",
  ],
  creator: "Brian Okibo",
  publisher: "eFootballMarket",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: siteUrl,
    siteName: "eFootballMarket",
    title: "eFootballMarket | Escrow Platform for eFootball Account Trading",
    description:
      "Trade high-OVR eFootball accounts with automated Safaricom M-Pesa escrow protection and 24-hour buyer inspection.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "eFootballMarket - Secure Account Escrow Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "eFootballMarket | Escrow Platform for eFootball Account Trading",
    description:
      "Buy and sell high-OVR eFootball accounts with automated M-Pesa escrow protection and 24-hr buyer inspection.",
    images: ["/og-image.svg"],
    creator: "@eFootballMarket",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "googlee8e97a3f5a54db68",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" className="dark">
      <head>
        <JsonLd siteUrl={siteUrl} />

        {/* Google Consent Mode v2 Default (Must execute before any Google tags) */}
        <Script
          id="google-consent-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
              });
            `,
          }}
        />

        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Google AdSense Script */}
        {adsenseId && (
          <Script
            async
            strategy="lazyOnload"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          />
        )}
      </head>
      <body className="bg-[#0B1220] text-[#F8FAFC] min-h-screen flex flex-col antialiased selection:bg-[#22C55E] selection:text-[#0B1220] relative">
        <Header />
        <main className="flex-1 flex flex-col relative z-10">{children}</main>
        <Footer />
        <CookieConsentBanner />
        <WhatsAppSupportWidget />
      </body>
    </html>
  );
}
