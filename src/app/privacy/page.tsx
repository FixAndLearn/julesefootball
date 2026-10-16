import { Lock, ShieldCheck, Database, Building2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy & Data Protection Policy | eFootball Community Kenya",
  description: "Official Privacy and Data Protection policy in accordance with the Kenya Data Protection Act, 2019.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10 bg-[#0B1220] text-[#F8FAFC]">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-[#22C55E] text-xs font-semibold">
          <Lock className="w-4 h-4 text-[#22C55E]" />
          <span>Privacy & Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display tracking-tight">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Effective Date: October 2026. How eFootball Community Kenya processes, protects, and handles personal data in accordance with the Kenya Data Protection Act, 2019.
        </p>
      </div>

      {/* Controller Notice */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] font-display">
              Data Controller Information
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Administration directed by Brian Okibo
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          <strong>eFootball Community Kenya</strong> operates under data minimization principles in line with the Kenya Data Protection Act, 2019. We process only information necessary to coordinate tournaments, verify match results, and administer community services.
        </p>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 text-[#94A3B8] text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">1.</span> Scope of Data Collection
          </h2>
          <p>
            To facilitate tournament participation and community integrity, we collect only necessary data:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Member Profile:</strong> Usernames, gamer tags, and registered email addresses.</li>
            <li><strong>Tournament Coordination:</strong> In-game Friend IDs and phone numbers for official WhatsApp match room communication.</li>
            <li><strong>Match Logs:</strong> Scores, timestamps, tournament brackets, and round progression data.</li>
            <li><strong>System Logs:</strong> Timestamps and security audit logs to protect our website against malicious traffic.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">2.</span> Security & Storage Limitation
          </h2>
          <p>
            In accordance with Section 30(1)(e) of the Kenya Data Protection Act, 2019, personal data is retained only for the duration required to deliver tournament services and support player inquiries. Technical safeguards including encrypted transport protocols (HTTPS/TLS) are enforced across the platform.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">3.</span> User Rights Under Kenya Law
          </h2>
          <p>
            Under the Kenya Data Protection Act, 2019, you have the right to be informed about how your data is used, request access to your stored personal information, and request correction or deletion of outdated data. To submit a data request, reach out to community administration on WhatsApp at <strong>+254 794 400 365</strong>.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/terms" className="text-xs text-[#22C55E] hover:underline font-bold">
          View Community Terms of Service →
        </Link>
      </div>
    </div>
  );
}
