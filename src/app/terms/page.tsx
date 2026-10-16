import { Scale, Building2, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | eFootball Community Kenya",
  description: "Official community guidelines, user terms, and legal policies of eFootball Community Kenya.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10 bg-[#0B1220] text-[#F8FAFC]">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-[#22C55E] text-xs font-semibold">
          <Scale className="w-4 h-4 text-[#22C55E]" />
          <span>Community Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display tracking-tight">
          Community Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Effective Date: October 2026. General terms, acceptable conduct, and rules governing participation in eFootball Community Kenya.
        </p>
      </div>

      {/* Governance Notice */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] font-display">
              Community Administration & Leadership
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Directed by Brian Okibo, Community Director
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          eFootball Community Kenya operates as an independent gaming hub and tournament platform for eFootball players in Kenya. By accessing our website, tournament brackets, or community groups, you agree to comply with these terms.
        </p>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 text-[#94A3B8] text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">1.</span> Nature of the Hub & Game Publisher Disclaimer
          </h2>
          <p>
            eFootball Community Kenya is an independent community hub organized for competitive play, tournament brackets, and player news.
          </p>
          <div className="p-4 rounded-xl bg-[#1F2937] border border-[#374151] text-xs text-[#94A3B8] space-y-2">
            <strong className="text-[#FBBF24] block font-semibold uppercase tracking-wider">
              Third-Party Publisher Disclaimer:
            </strong>
            <p>
              eFootball™ and PES are registered trademarks of Konami Digital Entertainment Inc. eFootball Community Kenya and its administrators are completely independent and maintain NO affiliation, sponsorship, endorsement, or commercial partnership with Konami Digital Entertainment Inc. Users are advised to review Konami’s official terms of use prohibiting account sales and transfers.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">2.</span> Tournament Conduct & Fair Play Rules
          </h2>
          <p>
            All participants entering 1v1 knockout tournaments, leagues, or pickup matches must adhere strictly to fair play guidelines:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Match Code Adherence:</strong> Players must join assigned match rooms promptly with their registered in-game Friend ID.</li>
            <li><strong>Score Falsification:</strong> Submitting altered or falsified match screenshots results in immediate disqualification and a ban from future tournaments.</li>
            <li><strong>Network Disconnections:</strong> Intentional network tampering or lag-switching during competitive play will forfeit the match.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">3.</span> Community Respect & Anti-Harassment
          </h2>
          <p>
            Our community channels, comment threads, and player networks must remain respectful and welcoming. Harassment, hate speech, abusive language, or fraudulent solicitations will result in immediate termination of account access and removal from player groups.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">4.</span> Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, eFootball Community Kenya and its administration shall not be liable for any indirect, incidental, or consequential damages resulting from your participation in online matches, server maintenance by game publishers, or third-party telecommunication disruptions.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">5.</span> Inquiries & Administration
          </h2>
          <p>
            For community inquiries, tournament disputes, or rule clarifications, contact administration via WhatsApp at <strong>+254 794 400 365</strong> or call <strong>0794400365</strong>.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/" className="text-xs text-[#22C55E] hover:underline font-bold">
          Return to Community Home →
        </Link>
      </div>
    </div>
  );
}
