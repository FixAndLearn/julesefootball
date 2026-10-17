import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import { WhatsAppSupportWidget } from "@/components/support/WhatsAppSupportWidget";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";

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
    "buy eFootball account Kenya",
    "sell eFootball squad M-Pesa",
    "eFootball escrow Kenya",
    "verified Konami ID accounts",
    "eFootball accounts",
    "eFootball market Kenya",
    "buy eFootball account",
    "sell PES account",
    "eFootball mobile accounts",
    "M-Pesa gaming account",
    "Konami ID accounts",
    "eFootball 2026 accounts",
    "3200 OVR eFootball account",
    "Epic booster player account",
    "buy PES mobile account M-Pesa",
    "eFootball accounts Nairobi",
    "scammer blacklist Kenya eFootball",
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
    title: "eFootballMarket | Kenya's #1 Secure eFootball Account Trading & Community Hub",
    description:
      "M-PESA NATIVE • 100% ESCROW PROTECTED • VERIFIED SELLERS. Buy and sell verified eFootball squads safely with M-Pesa Escrow (Till 1572931) and 24h buyer protection.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "eFootballMarket - Kenya's #1 Secure eFootball Account Trading Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "eFootballMarket | Kenya's #1 Secure eFootball Account Trading & Community Hub",
    description:
      "M-PESA NATIVE • 100% ESCROW PROTECTED • VERIFIED SELLERS. Buy and sell verified eFootball squads safely with M-Pesa Escrow.",
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
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-5924764989915276";

  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
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

        {/* Google AdSense Official Publisher Script (ca-pub-5924764989915276) */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#0B1220] text-[#F8FAFC] min-h-screen flex flex-col antialiased selection:bg-[#22C55E] selection:text-[#0B1220] relative font-sans pb-16 md:pb-0">
        <LanguageProvider>
          <Header />
          <main className="flex-1 flex flex-col relative z-10">{children}</main>
          <Footer />
          <MobileBottomNav />
          <CookieConsentBanner />
          <WhatsAppSupportWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
