import { Metadata } from "next";
import { CyberPitchExperience } from "@/components/cyber-pitch/CyberPitchExperience";

export const metadata: Metadata = {
  title: "Bespoke eFootball Cards & Formations | eFootballMarket Kenya",
  description:
    "Dominate the Pitch. Claim Your Legacy. Craft custom eFootball mobile player trading cards and elite tactical formations with live 3D gyroscopic tilt and M-Pesa escrow protection.",
};

export default function CardsPage() {
  return <CyberPitchExperience />;
}
