import { Metadata } from "next";

export const metadata: Metadata = {
  title: "eFootball Intelligence & Scammer Alerts | eFootballMarket Kenya",
  description:
    "Official eFootball news, scammer alerts, squad valuation guides, and market updates from eFootballMarket platform administration.",
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
