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
    default: "eFootball Community Kenya | Tournaments, News & Guides",
    template: "%s | eFootball Community Kenya",
  },
  description:
    "The central community resource for eFootball players in Kenya. Compete in organized tournaments, follow live brackets, read game updates, and learn player safety practices.",
  applicationName: "eFootball Community Kenya",
  authors: [{ name: "Brian Okibo, Community Director" }],
  generator: "Next.js",
  keywords: [
    "eFootball Kenya",
    "eFootball tournaments Kenya",
    "eFootball 1v1 cups Nairobi",
    "PES tournaments Kenya",
    "eFootball community Kenya",
    "eFootball brackets",
    "eFootball mobile tournaments",
    "eFootball news Kenya",
  ],
  creator: "Brian Okibo",
  publisher: "eFootball Community Kenya",
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
    siteName: "eFootball Community Kenya",
    title: "eFootball Community Kenya | Tournaments, News & Guides",
    description:
      "The central community resource for eFootball players in Kenya. Compete in organized tournaments, follow live brackets, read game updates, and learn player safety practices.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "eFootball Community Kenya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "eFootball Community Kenya | Tournaments, News & Guides",
    description:
      "The central community resource for eFootball players in Kenya. Compete in organized tournaments, follow live brackets, read game updates, and learn player safety practices.",
    images: ["/og-image.svg"],
    creator: "@eFootballKenya",
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
