"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { isUserAdmin } from "@/lib/security/adminAuth";
import { NewsArticle, NewsCategory } from "@/types/database";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Eye,
  Flame,
  Newspaper,
  PenSquare,
  Search,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function getCategoryBadge(category: NewsCategory | string) {
  switch (category) {
    case "scammer_alert":
      return {
        label: "Scammer Alert",
        color: "bg-rose-950/60 border-rose-800/80 text-rose-300",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
      };
    case "escrow_guide":
      return {
        label: "Safety Guide",
        color: "bg-emerald-950/60 border-emerald-800/80 text-emerald-300",
        icon: <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />,
      };
    case "announcement":
      return {
        label: "Notice",
        color: "bg-[#1F2937] border-[#374151] text-[#FBBF24]",
        icon: <Trophy className="w-3.5 h-3.5 text-[#FBBF24]" />,
      };
    default:
      return {
        label: "Game News",
        color: "bg-[#1F2937] border-[#374151] text-[#94A3B8]",
        icon: <Newspaper className="w-3.5 h-3.5 text-[#94A3B8]" />,
      };
  }
}

export default function NewsFeedPage() {
  const { user, profile } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = isUserAdmin(user?.email, profile?.role);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      try {
        const url =
          activeCategory === "all"
            ? "/api/news"
            : `/api/news?category=${activeCategory}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.articles)) {
            setArticles(data.articles);
          }
        }
      } catch (err) {
        console.warn("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, [activeCategory]);

  const filteredArticles = articles.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
    );
  });

  const pinnedArticle = filteredArticles.find((a) => a.is_pinned);
  const standardArticles = filteredArticles.filter((a) => a.id !== pinnedArticle?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 bg-[#0B1220] text-[#F8FAFC]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1F2937] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#1F2937] text-xs font-semibold mb-3 text-[#22C55E]">
            <Newspaper className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Community Bulletins & Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display tracking-tight">
            Community News & Scammer Alerts
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-2xl mt-1.5 leading-relaxed">
            Verified eFootball patch notes, tournament announcements, local player notices, and scam prevention advisories.
          </p>
        </div>

        {isAdmin && (
          <Link href="/admin?tab=news" className="shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs px-4 py-2 rounded-xl shadow-sm min-h-[40px] flex items-center gap-1.5"
            >
              <PenSquare className="w-4 h-4 stroke-[2.5]" />
              <span>Publish Bulletin</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Bulletins" },
            { id: "scammer_alert", label: "🚨 Scammer Alerts" },
            { id: "efootball_news", label: "⚽ Game News" },
            { id: "escrow_guide", label: "🛡️ Safety Guides" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] ${
                activeCategory === cat.id
                  ? "bg-[#22C55E] text-[#0B1220] shadow-sm"
                  : "bg-[#111827] text-[#94A3B8] border border-[#1F2937] hover:text-[#F8FAFC] hover:bg-[#1F2937]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bulletins..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#22C55E] min-h-[40px]"
          />
        </div>
      </div>

      {/* Featured Pinned Article */}
      {pinnedArticle && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111827] border border-rose-900/40 shadow-xl relative overflow-hidden space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/80 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              Pinned Advisory
            </span>
            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#94A3B8]" />
              {new Date(pinnedArticle.created_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#94A3B8]" />
              {pinnedArticle.views_count} views
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-display">
            <Link href={`/news/${pinnedArticle.slug}`} className="hover:text-[#22C55E] transition-colors">
              {pinnedArticle.title}
            </Link>
          </h2>

          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
            {pinnedArticle.summary}
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">
              Published by <strong className="text-[#F8FAFC]">{pinnedArticle.author_name}</strong>
            </span>
            <Link href={`/news/${pinnedArticle.slug}`}>
              <Button
                variant="primary"
                size="sm"
                className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs px-4 py-2 min-h-[40px] rounded-lg shadow-sm"
              >
                <span>Read Warning</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Standard Articles Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-[#94A3B8]">Loading community bulletins...</p>
        </div>
      ) : standardArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardArticles.map((article) => {
            const badge = getCategoryBadge(article.category);
            return (
              <div
                key={article.id}
                className="bg-[#111827] border border-[#1F2937] rounded-3xl overflow-hidden shadow-md hover:border-slate-600 transition-all flex flex-col group"
              >
                {article.cover_image_url && (
                  <div className="h-44 w-full relative overflow-hidden bg-[#1F2937]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#94A3B8]" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#22C55E] transition-colors line-clamp-2">
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs text-[#94A3B8]">
                    <span className="truncate max-w-[140px] text-[11px] text-[#94A3B8]">
                      {article.author_name}
                    </span>
                    <Link
                      href={`/news/${article.slug}`}
                      className="inline-flex items-center gap-1 text-[#22C55E] hover:underline font-semibold min-h-[36px]"
                    >
                      <span>Read Bulletin</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#111827] border border-[#1F2937] space-y-3">
          <BookOpen className="w-10 h-10 text-[#94A3B8] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#F8FAFC]">No bulletins found in this category</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
            Try switching category filters or search keywords. New bulletins are posted frequently by community administration.
          </p>
        </div>
      )}
    </div>
  );
}
