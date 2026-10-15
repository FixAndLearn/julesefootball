import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
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
    default: "eFootball Community Kenya | Tournaments, News & Alerts",
    template: "%s | eFootball Community Kenya",
  },
  description:
    "The central community hub for eFootball players in Kenya. Compete in local knockout tournaments, follow match brackets, and get verified game updates and scammer alerts.",
  applicationName: "eFootball Community Kenya",
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
  return (
    <html lang="en" className="dark">
      <head>
        <JsonLd siteUrl={siteUrl} />
      </head>
      <body className="bg-[#0B1220] text-[#F8FAFC] min-h-screen flex flex-col antialiased selection:bg-[#22C55E] selection:text-[#0B1220] relative">
        <Header />
        <main className="flex-1 flex flex-col relative z-10">{children}</main>
        <Footer />
        <WhatsAppSupportWidget />
      </body>
    </html>
  );
}
