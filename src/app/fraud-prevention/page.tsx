import { Building2, ExternalLink, MessageCircle, Phone, ShieldAlert, ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Fair Play & Anti-Fraud Safety Guide | eFootball Community Kenya",
  description: "Community player guidelines, scam awareness, and security recommendations for eFootball players in Kenya.",
};

export default function FraudPreventionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10 bg-[#0B1220] text-[#F8FAFC]">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#22C55E]">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Community Safety Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display tracking-tight">
          Fair Play & Anti-Fraud Safety Guide
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          How to protect yourself against payment spoofing, impersonator fraud, and unauthorized credential sharing in Kenya.
        </p>
      </div>

      {/* Administration Contact Banner */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24]">
            <Building2 className="w-5 h-5 text-[#FBBF24]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] font-display">
              Official Administration Hotline: 0794400365
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Directed by Brian Okibo, Community Director
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          In unmonitored WhatsApp or Facebook gaming groups, players frequently encounter impersonators pretending to be tournament admins or escrow agents. Always verify communications through our official telephone hotline (<strong>0794400365</strong>) or official website channels.
        </p>
      </div>

      {/* Main Guidelines Cards */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 text-[#94A3B8] text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">1.</span> Recognizing Fake M-Pesa SMS & Screenshot Scams
          </h2>
          <p>
            The most common fraud across online gaming communities in Kenya involves fabricated SMS messages resembling Safaricom Lipa Na M-Pesa notifications or altered screenshot images.
          </p>
          <div className="p-4 rounded-xl bg-[#1F2937] border border-[#374151] text-xs text-[#F8FAFC] space-y-2">
            <strong className="text-[#22C55E] block font-semibold">Verification Rule:</strong>
            <p className="text-[#94A3B8]">
              Never rely on customer-provided screenshots as proof of payment. For tournament entries or friendly matches, check your official M-Pesa statement or Safaricom App balance directly before confirming match schedules.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">2.</span> Impersonation & Fake Group Warning
          </h2>
          <p>
            Fraudsters frequently copy administrator names, profile pictures, and group logos to message players privately with unverified offers or counterfeit tournament registration links.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Official WhatsApp Number:</strong> The only authorized administrator number is <strong>+254 794 400 365</strong>.</li>
            <li><strong>No Unsolicited DMs:</strong> Community staff will never message you asking for your password, email OTP, or private two-factor backup codes.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">3.</span> Konami Official Terms Advisory
          </h2>
          <p>
            We encourage all players to understand the official publisher rules governing eFootball accounts:
          </p>
          <div className="p-4 rounded-xl bg-[#1F2937] border border-[#374151] text-xs text-[#94A3B8] space-y-2">
            <p>
              According to <a href="https://www.konami.com/efootball/en-us/topic/news/5174" target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:underline font-semibold inline-flex items-center gap-0.5">Konami’s official terms <ExternalLink className="w-3 h-3 ml-0.5" /></a>, loaning, selling, or transferring accounts and sharing passwords are prohibited. Doing so carries risk of account suspension or permanent termination by the publisher.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">4.</span> Reporting Community Scammers
          </h2>
          <p>
            If you encounter an impersonator or scammer operating in a local group, report their phone number and evidence directly to our administration team on WhatsApp at <strong>+254 794 400 365</strong> so a public warning bulletin can be issued.
          </p>
        </section>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs">
        <Link href="/news?category=scammer_alert" className="text-[#22C55E] hover:underline font-bold">
          View Recent Scammer Alerts →
        </Link>
        <span className="text-[#1F2937]">|</span>
        <Link href="/terms" className="text-[#94A3B8] hover:text-[#F8FAFC] font-semibold">
          Community Terms of Service →
        </Link>
      </div>
    </div>
  );
}
