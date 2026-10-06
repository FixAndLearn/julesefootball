import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "eFootballMarket | Institutional eFootball Account Escrow Marketplace",
  description:
    "The world's premier escrow-protected marketplace for trading verified eFootball PES accounts. Automated M-Pesa STK Push payments, non-custodial escrow, and instant verified delivery.",
  keywords: [
    "eFootball accounts",
    "buy eFootball account",
    "sell PES account",
    "eFootball escrow",
    "M-Pesa gaming account",
    "eFootball mobile accounts Kenya",
    "PES 2026 accounts",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
