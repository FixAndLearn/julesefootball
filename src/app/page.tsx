import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewsService } from "@/services/newsService";
import { TournamentService } from "@/services/tournamentService";
import { NewsArticle, Tournament } from "@/types/database";
import {
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Newspaper,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // Refresh dynamic community data every 60s

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const newsService = new NewsService(supabase);

  let tournaments: Tournament[] = [];
  let articles: NewsArticle[] = [];

  try {
    const [tourneysResult, articlesResult] = await Promise.all([
      TournamentService.getAllTournaments().catch(() => []),
      newsService.getPublishedArticles().catch(() => []),
    ]);

    tournaments = tourneysResult || [];
    articles = (articlesResult || []).slice(0, 3);
  } catch (error) {
    console.error("Home page database fetch notice:", error);
  }

  return (
    <div className="flex flex-col w-full bg-[#0B1220] text-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 md:p-16 text-center max-w-5xl mx-auto shadow-xl relative overflow-hidden">
            {/* Subtle highlight pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F2937] border border-[#374151] text-xs font-semibold text-[#FBBF24] mb-6 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>eFootball Community Kenya</span>
            </div>

            {/* One Clear Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#F8FAFC] tracking-tight font-display leading-[1.14] max-w-4xl mx-auto">
              The Home of Kenya&apos;s eFootball Community
            </h1>

            {/* Short Explanation */}
            <p className="mt-5 text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
              Compete in organized 1v1 knockout cups, track live tournament brackets, and get verified game updates and scam prevention alerts across Kenya.
            </p>

            {/* No More Than Two Prominent Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/tournaments">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-sm px-7 py-3.5 rounded-xl shadow-md transition-all min-h-[48px] flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 stroke-[2.5]" />
                  <span>Explore Tournaments</span>
                </Button>
              </Link>

              <Link href="/news">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-[#111827] border border-[#1F2937] hover:border-slate-500 text-[#F8FAFC] hover:bg-[#1F2937] font-semibold text-sm px-6 py-3.5 rounded-xl transition-all min-h-[48px] flex items-center gap-2"
                >
                  <Newspaper className="w-4 h-4 text-[#94A3B8]" />
                  <span>Community News & Alerts</span>
                </Button>
              </Link>
            </div>

            {/* Three Compact Community Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-10 border-t border-[#1F2937] text-left">
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24] mb-3">
                  <Swords className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#F8FAFC]">1v1 Knockout Cups</h2>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Single-elimination brackets with verified room codes and match results.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#22C55E] mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#F8FAFC]">Verified Match Scoring</h2>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Transparent score tracking and automated progression into subsequent rounds.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#94A3B8] mb-3">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <h2 className="text-sm font-bold text-[#F8FAFC]">Player Safety Bulletins</h2>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Timely warnings regarding impersonation scams, phishing, and fake admins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Active Tournaments & Live Brackets Section */}
      <section className="py-14 md:py-20 border-b border-[#1F2937] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FBBF24] uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>Competitive Play</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                Tournaments & Brackets
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Participate in organized 1v1 cups, follow live knockout brackets, and climb player rankings.
              </p>
            </div>
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:underline shrink-0 min-h-[44px]"
            >
              <span>View All Tournaments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-8 sm:p-12 text-center max-w-xl mx-auto">
              <Trophy className="w-10 h-10 text-[#94A3B8] mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-[#F8FAFC]">No active tournaments scheduled right now</h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Tournament registrations are announced directly in our player bulletins. Check back soon or follow community updates below.
              </p>
              <div className="mt-5">
                <Link href="/tournaments">
                  <Button variant="secondary" size="sm" className="bg-[#1F2937] border border-[#374151] text-xs text-[#F8FAFC] min-h-[40px]">
                    Check Tournament Hub
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tournaments.slice(0, 3).map((tournament) => (
                <div
                  key={tournament.id}
                  className="rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#FBBF24]/50 transition-all p-5 flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1F2937] text-[#FBBF24] border border-[#FBBF24]/30">
                        {tournament.status.replace("_", " ")}
                      </span>
                      {tournament.prize_pool_kes > 0 && (
                        <span className="text-xs font-bold text-[#22C55E]">
                          {formatCurrency(tournament.prize_pool_kes)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#F8FAFC] line-clamp-1 mb-1.5">
                      {tournament.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {tournament.description || "Official Kenyan eFootball 1v1 knockout cup."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#1F2937] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {tournament.registered_count || 0} / {tournament.max_players || 32} Players
                      </span>
                    </div>
                    <Link
                      href={`/tournaments/${tournament.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#22C55E] hover:underline min-h-[40px]"
                    >
                      <span>View Brackets</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Community Bulletins & Scammer Alerts Section */}
      <section className="py-14 md:py-20 border-b border-[#1F2937] bg-[#090d16] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-2">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Community Bulletin</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                News & Scammer Alerts
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Verified game announcements, local community notices, and anti-fraud warnings.
              </p>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:underline shrink-0 min-h-[44px]"
            >
              <span>Browse All Updates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-8 sm:p-12 text-center max-w-xl mx-auto">
              <Newspaper className="w-10 h-10 text-[#94A3B8] mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-bold text-[#F8FAFC]">No published alerts yet</h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Official notices and community alerts will be posted here as they are published by the administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {articles.map((article) => {
                const isAlert = article.category === "scammer_alert";
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-slate-500 p-5 flex flex-col justify-between transition-all shadow-md group min-h-[180px]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isAlert
                              ? "bg-rose-950/70 text-rose-300 border border-rose-800/60"
                              : "bg-[#1F2937] text-[#94A3B8] border border-[#374151]"
                          }`}
                        >
                          {isAlert ? "Scammer Alert" : article.category?.replace("_", " ") || "Notice"}
                        </span>
                        <span className="text-[11px] text-[#94A3B8]">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#22C55E] transition-colors line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs font-medium text-[#94A3B8]">
                      <span>Read bulletin</span>
                      <ArrowRight className="w-3 h-3 text-[#22C55E] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Fair Play & Anti-Fraud Safety Guide */}
      <section className="py-14 md:py-20 border-b border-[#1F2937] bg-[#0B1220] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#111827] border border-[#1F2937] p-6 sm:p-10 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Fair Play & Community Integrity</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] font-display">
                  Protect Yourself from Online Scams & Impersonation
                </h2>
                <p className="text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
                  Scammers frequently use forged M-Pesa SMS messages, fake social media groups, and impersonation to deceive players. Learn the verified guidelines to safeguard your devices, accounts, and payments.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#94A3B8]">
                  <div className="flex items-start gap-2">
                    <span className="text-[#22C55E] font-bold">✓</span>
                    <span>Always verify official admin contacts via our hotline: 0794400365.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#22C55E] font-bold">✓</span>
                    <span>Never trust customer screenshots; verify real M-Pesa statements directly.</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 flex justify-start lg:justify-end">
                <Link href="/fraud-prevention" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs px-6 py-3 min-h-[44px]"
                  >
                    <span>Read Full Safety Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WhatsApp Player Community & Support Banner */}
      <section className="py-12 md:py-16 bg-[#111827]/40 border-b border-[#1F2937] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#111827] via-[#161F30] to-[#111827] border border-[#1F2937] p-6 sm:p-10 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F2937] border border-[#374151] text-[#F8FAFC] text-xs font-semibold mb-3">
                  <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Kenyan Player Network</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] font-display">
                  Connect with Fellow Players Across Kenya
                </h2>
                <p className="text-sm text-[#94A3B8] mt-2 max-w-2xl leading-relaxed">
                  Join our official WhatsApp community group to find friendly 1v1 match opponents, participate in pickup cups, and get direct assistance from community administrators.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <a
                  href="https://wa.me/254794400365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs py-3 min-h-[44px]"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>Join WhatsApp Group</span>
                  </Button>
                </a>
                <a
                  href="tel:0794400365"
                  className="w-full"
                >
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full bg-[#1F2937] border border-[#374151] hover:border-slate-400 text-[#F8FAFC] text-xs py-3 font-semibold min-h-[44px]"
                  >
                    <Phone className="w-4 h-4 mr-2 text-[#94A3B8]" />
                    <span>Call Hotline: 0794400365</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Independent Notice & Konami Terms Compliance Advisory */}
      <section className="py-8 bg-[#0B1220] relative z-10 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-5 leading-relaxed">
            <p className="font-semibold text-[#F8FAFC] mb-1">
              Independent Community Notice & Konami Terms Advisory:
            </p>
            <p className="text-[#94A3B8]">
              eFootball Community Kenya is an independent community resource and is not affiliated with, endorsed by, or sponsored by Konami Digital Entertainment Inc. Konami’s current rules prohibit selling or transferring eFootball accounts and sharing account IDs or passwords. Trading may result in loss of account access or support.{" "}
              <a
                href="https://www.konami.com/efootball/en-us/topic/news/5174"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#22C55E] hover:underline font-medium inline-flex items-center gap-0.5"
              >
                Read Konami’s official notice <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
