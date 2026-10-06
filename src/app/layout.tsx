import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://efootballmarket.com");

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "eFootballMarket | Kenya's #1 Secure eFootball Account Trading Platform",
    template: "%s | eFootballMarket",
  },
  description:
    "Buy and sell verified eFootball (PES) accounts with 100% automated Safaricom M-Pesa escrow protection. Instant STK push payments, 24-hr inspection window, and zero scams.",
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
    "3100 OVR eFootball account",
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
    title: "eFootballMarket | Kenya's #1 Secure eFootball Account Trading Platform",
    description:
      "Eliminate peer-to-peer scams. Trade high-OVR eFootball accounts safely with automated Safaricom M-Pesa escrow and 24-hr buyer inspection guarantee.",
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
    title: "eFootballMarket | Kenya's #1 Secure eFootball Account Trading Platform",
    description:
      "Buy and sell high-OVR eFootball accounts safely with automated M-Pesa escrow and 24-hr buyer inspection guarantee.",
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
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
