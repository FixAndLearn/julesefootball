import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewsService } from "@/services/newsService";
import { TournamentService } from "@/services/tournamentService";
import { NewsArticle, Tournament } from "@/types/database";
import {
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Newspaper,
  ShieldAlert,
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
    tournaments = tourneysResult;
    articles = articlesResult.slice(0, 3);
  } catch (error) {
    console.error("Homepage data fetch notice:", error);
  }

  return (
    <div className="flex flex-col w-full bg-[#0B1220] text-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#1F2937]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Community Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#FBBF24] mb-6">
            <Trophy className="w-4 h-4 text-[#FBBF24]" />
            <span>eFootball Community Kenya</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#F8FAFC] tracking-tight font-display leading-[1.15] max-w-4xl mx-auto">
            The Home for Kenya&apos;s eFootball Players
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Compete in organized 1v1 knockout cups, follow live tournament brackets, and stay informed with community updates and scammer alerts across Kenya.
          </p>

          {/* Primary Action Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/tournaments"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#22C55E] text-[#0B1220] font-bold text-sm hover:bg-[#16a34a] transition-all shadow-md min-h-[48px]"
            >
              <Trophy className="w-4 h-4" />
              <span>Explore Tournaments</span>
            </Link>

            <Link
              href="/news"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#111827] border border-[#1F2937] text-[#F8FAFC] font-semibold text-sm hover:bg-[#1F2937] transition-all min-h-[48px]"
            >
              <Newspaper className="w-4 h-4 text-[#94A3B8]" />
              <span>Community News & Alerts</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Community Tournaments Section (Top Priority Content) */}
      <section className="py-12 md:py-16 border-b border-[#1F2937]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FBBF24] uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>Competitive Play</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                Tournaments & Brackets
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Participate in knockout cups, submit match scores, and climb local rankings.
              </p>
            </div>
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:underline shrink-0"
            >
              <span>View All Tournaments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tournaments.slice(0, 3).map((tourney) => (
                <Link
                  key={tourney.id}
                  href={`/tournaments`}
                  className="group block p-5 sm:p-6 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#374151] transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1F2937] text-[#94A3B8] uppercase">
                      {tourney.platform}
                    </span>
                    {tourney.prize_pool_kes > 0 && (
                      <span className="text-xs font-bold text-[#FBBF24]">
                        KES {tourney.prize_pool_kes.toLocaleString()} Prize
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#22C55E] transition-colors line-clamp-1">
                    {tourney.title}
                  </h3>

                  <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed">
                    {tourney.subtitle || tourney.format}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs text-[#94A3B8]">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{tourney.participants?.length || tourney.registered_count || 0} / {tourney.max_players} Players</span>
                    </div>
                    <span className="font-semibold text-[#22C55E] group-hover:underline">
                      View Bracket →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-2xl bg-[#111827] border border-[#1F2937] text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24] mx-auto mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">No Live Tournaments Scheduled</h3>
              <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                Weekend cups and 1v1 community matches are hosted regularly. Check the tournaments hub to view the latest brackets or host a competition.
              </p>
              <div className="mt-6">
                <Link
                  href="/tournaments"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22C55E] text-[#0B1220] font-bold text-xs hover:bg-[#16a34a] transition-all min-h-[44px]"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Visit Tournaments Hub</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Community News & Alerts Section */}
      <section className="py-12 md:py-16 border-b border-[#1F2937]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                <Newspaper className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Game News & Alerts</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
                News & Scammer Alerts
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Stay informed on game maintenance, competitive updates, and fraud warnings.
              </p>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:underline shrink-0"
            >
              <span>View All News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group block p-5 sm:p-6 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#374151] transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1F2937] text-[#94A3B8] capitalize">
                      {article.category?.replace("_", " ") || "Notice"}
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#22C55E] transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[#94A3B8] mt-2 line-clamp-3 leading-relaxed">
                    {article.summary || article.content?.slice(0, 120) + "..."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Read Announcement</span>
                    <span className="font-semibold text-[#22C55E] group-hover:underline">
                      Read More →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-2xl bg-[#111827] border border-[#1F2937] text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#94A3B8] mx-auto mb-4">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">No Recent Articles</h3>
              <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
                Platform notices, patch highlights, and safety advisories will appear here. Visit our News section for updates.
              </p>
              <div className="mt-6">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-[#F8FAFC] font-semibold text-xs hover:bg-[#1F2937] transition-all min-h-[44px]"
                >
                  <span>Visit News Section</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Community Safety & Fair Play Guidelines */}
      <section className="py-12 md:py-16 border-b border-[#1F2937]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
              Community Safety & Guidelines
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
              Fostering a safe, transparent, and competitive environment for players across Kenya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Safety Card 1 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-[#1F2937] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#1F2937] flex items-center justify-center text-amber-400 mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Official Konami Rules</h3>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  Konami’s current rules prohibit selling or transferring eFootball accounts and sharing account IDs or passwords. Trading may result in loss of account access or support.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2937]">
                <a
                  href="https://www.konami.com/efootball/en-us/topic/news/5174"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                >
                  <span>Read Konami Notice</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Safety Card 2 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-[#1F2937] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#1F2937] flex items-center justify-center text-rose-400 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Beware of Scammers</h3>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  Avoid external individuals impersonating tournament hosts or staff on unverified WhatsApp groups or Telegram channels. Verified community notices are published on our news page.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2937]">
                <Link
                  href="/news?category=scammer_alert"
                  className="inline-flex items-center gap-1.5 text-xs text-[#22C55E] hover:underline"
                >
                  <span>View Scammer Alerts →</span>
                </Link>
              </div>
            </div>

            {/* Safety Card 3 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-[#1F2937] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#1F2937] flex items-center justify-center text-[#22C55E] mb-4">
                  <Swords className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Fair Play in 1v1 Matches</h3>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  All tournament matches must be played with standard match settings. Players should capture full-time match result screenshots to verify bracket scores accurately.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1F2937]">
                <Link
                  href="/tournaments"
                  className="inline-flex items-center gap-1.5 text-xs text-[#22C55E] hover:underline"
                >
                  <span>Tournament Rules →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Community Contact Banner */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#111827] border border-[#1F2937]">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] font-display">
              Connect with Kenyan eFootball Players
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2 max-w-xl mx-auto leading-relaxed">
              Have questions about upcoming tournaments, want to coordinate friendly friend-matches, or need assistance? Reach out to our community coordinators.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/254794400365"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#22C55E] text-[#0B1220] font-bold text-sm hover:bg-[#16a34a] transition-all min-h-[48px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Community: 0794400365</span>
              </a>
              <Link
                href="/tournaments"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1F2937] border border-[#374151] text-[#F8FAFC] font-semibold text-sm hover:bg-[#374151] transition-all min-h-[48px]"
              >
                <Trophy className="w-4 h-4 text-[#FBBF24]" />
                <span>Tournaments Hub</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
