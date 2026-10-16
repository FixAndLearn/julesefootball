import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, Lock, ShieldCheck, Building2, AlertTriangle, Trophy } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Integrity & Player Safety | eFootball Community Kenya",
  description: "Learn how eFootball Community Kenya ensures fair play, transparent match outcomes, and player safety.",
};

export default function EscrowGuaranteePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10 bg-[#0B1220] text-[#F8FAFC]">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-[#22C55E] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Fair Play Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display tracking-tight">
          Community Integrity & Player Safety
        </h1>
        <p className="text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          How our rules, match verification systems, and administration protect players across Kenya.
        </p>
      </div>

      {/* Governance Notice */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24]">
            <Building2 className="w-5 h-5 text-[#FBBF24]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC] font-display">
              Administration Directed by Brian Okibo
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Official Community Hotline: 0794400365
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          <strong>eFootball Community Kenya</strong> is dedicated to providing an organized, scam-free competitive environment for Kenyan eFootball gamers. All tournaments, brackets, and community channels are moderated under strict fair-play standards.
        </p>
      </div>

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#22C55E]">
            <Lock className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="text-base font-bold text-[#F8FAFC]">1. Transparent Bracket Progression</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Tournament matches use automated single-elimination logic. Winners advance only after verified room code completion and confirmed final score submissions.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24]">
            <Clock className="w-5 h-5 text-[#FBBF24]" />
          </div>
          <h3 className="text-base font-bold text-[#F8FAFC]">2. Strict Match SLA Deadlines</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            To prevent stalled brackets, players have set match windows to connect and play. Unresponsive participants are forfeited to keep competitions on schedule.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#22C55E]">
            <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
          </div>
          <h3 className="text-base font-bold text-[#F8FAFC]">3. Anti-Fraud & Scam Bulletins</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            We publish active warnings regarding payment SMS spoofing, fake admin numbers, and fraudulent third-party schemes targeting the Kenyan player base.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111827] border border-[#1F2937] shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-base font-bold text-[#F8FAFC]">4. Publisher Rule Compliance</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            We support fair play and inform our community that Konami terms prohibit the sale, loan, or transfer of game accounts and sharing credentials.
          </p>
        </div>
      </div>

      {/* Community Rules list */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <h2 className="text-lg font-bold text-[#F8FAFC] font-display">
          Core Community Standards
        </h2>
        <ul className="space-y-3 text-xs sm:text-sm text-[#94A3B8]">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <span>Always submit authentic, unedited match summary screenshots showing full-time scores and gamer tags.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <span>Never share your Konami ID password or two-factor verification codes with anyone online.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <span>Report suspicious activity or fake admins to our official hotline: 0794400365.</span>
          </li>
        </ul>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link href="/tournaments">
            <Button
              variant="primary"
              size="lg"
              className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs px-6 py-3 min-h-[44px] rounded-xl shadow-sm"
            >
              <Trophy className="w-4 h-4 mr-2" />
              <span>Explore Tournaments</span>
            </Button>
          </Link>
          <Link href="/fraud-prevention">
            <Button
              variant="secondary"
              size="lg"
              className="bg-[#1F2937] border border-[#374151] hover:border-slate-400 text-[#F8FAFC] text-xs px-6 py-3 min-h-[44px] rounded-xl"
            >
              <span>Read Safety Guide</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
