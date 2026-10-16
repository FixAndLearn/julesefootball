import { AlertTriangle, CheckCircle2, Scale, Building2, Swords } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Tournament & Match Dispute Policy | eFootball Community Kenya",
  description: "Official rules and adjudication protocols for match disputes, score verification, and fair play enforcement in eFootball tournaments.",
};

export default function DisputePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10 bg-[#0B1220] text-[#F8FAFC]">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#FBBF24]">
          <Scale className="w-4 h-4 text-[#FBBF24]" />
          <span>Fair Play Adjudication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display tracking-tight">
          Tournament Dispute & Match Adjudication Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Standardized rules, evidence requirements, and dispute mechanics for eFootball Community Kenya competitions.
        </p>
      </div>

      {/* Leadership Notice */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] font-display">
              Arbitration Framework Managed by Brian Okibo
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Objective, Forensically Verified Match Determination
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          To maintain competitive integrity across all 1v1 knockout tournaments, match disputes are resolved impartially by community administration. Decisions are reached strictly through digital evidence submitted by players.
        </p>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 text-[#94A3B8] text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">1.</span> Valid Grounds for Submitting a Match Dispute
          </h2>
          <p>
            A match dispute may be raised within <strong>30 minutes</strong> of match conclusion for one of the following documented reasons:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-[#1F2937] border border-[#374151] text-xs">
              <strong className="text-[#F8FAFC] block mb-1">Conflicting Score Submissions</strong>
              <p className="text-[#94A3B8]">Opponent reports an inaccurate final match score contradictory to the final game summary screen.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1F2937] border border-[#374151] text-xs">
              <strong className="text-[#F8FAFC] block mb-1">Intentional Match Quitting</strong>
              <p className="text-[#94A3B8]">Opponent forcibly disconnects while trailing to trigger a void match or nullify result.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1F2937] border border-[#374151] text-xs">
              <strong className="text-[#F8FAFC] block mb-1">Ringer / Impersonator Play</strong>
              <p className="text-[#94A3B8]">Opponent fields an unauthorized account or incorrect Friend ID not matching tournament registration.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1F2937] border border-[#374151] text-xs">
              <strong className="text-[#F8FAFC] block mb-1">Unresponsive Opponent</strong>
              <p className="text-[#94A3B8]">Registered player fails to accept the match room invitation within the mandatory 15-minute SLA.</p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">2.</span> Evidentiary Standards & Required Proof
          </h2>
          <p>
            Claims must be accompanied by unedited digital proof submitted via our official WhatsApp match support hotline:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Final Match Summary Screenshot:</strong> Clear screenshot displaying the full-time score, player gamer tags, and match statistics.</li>
            <li><strong>Room Code Verification:</strong> Evidence of the official Konami Match Room number and invitation timestamp.</li>
            <li><strong>Screen Recording (Disconnects):</strong> In disputed disconnection cases, a screen recording showing the sudden disconnection prompt is required.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-display flex items-center gap-2">
            <span className="text-[#22C55E]">3.</span> Adjudication Finality
          </h2>
          <p>
            Rulings issued by community tournament organizers are final. Any player found fabricating screenshots or falsifying scores faces immediate tournament disqualification and a ban from future competitive events.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/tournaments" className="text-xs text-[#22C55E] hover:underline font-bold">
          Return to Tournament Hub →
        </Link>
      </div>
    </div>
  );
}
