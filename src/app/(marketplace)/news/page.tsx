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
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function getCategoryBadge(category: NewsCategory | string) {
  switch (category) {
    case "scammer_alert":
      return {
        label: "Scammer Alert",
        color: "bg-rose-500/15 border-rose-500/40 text-rose-300",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
      };
    case "escrow_guide":
      return {
        label: "Escrow Guide",
        color: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      };
    case "announcement":
      return {
        label: "Official Notice",
        color: "bg-amber-500/15 border-amber-500/40 text-amber-300",
        icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
      };
    default:
      return {
        label: "eFootball News",
        color: "bg-brand-500/15 border-brand-500/40 text-brand-300",
        icon: <Trophy className="w-3.5 h-3.5 text-brand-400" />,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-pitch-border/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-3">
            <Newspaper className="w-3.5 h-3.5 text-brand-400" />
            <span>Marketplace Community & Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            eFootball News & Scammer Alerts
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
            Real-time updates, security blacklists, Konami patch notes, and official escrow guides curated by eFootballMarket administration.
          </p>
        </div>

        {isAdmin && (
          <Link href="/admin?tab=news" className="shrink-0">
            <Button variant="gold" size="sm" className="font-bold shadow-lg">
              <PenSquare className="w-4 h-4 mr-1.5" />
              Publish News or Scammer Alert
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Bulletins" },
            { id: "scammer_alert", label: "🚨 Scammer Alerts" },
            { id: "efootball_news", label: "⚽ eFootball News" },
            { id: "escrow_guide", label: "🛡️ Escrow Guides" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-900/40"
                  : "bg-pitch-surface text-slate-400 hover:text-white hover:bg-pitch-card"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts or news..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-pitch-surface border border-pitch-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Featured Pinned Article */}
      {pinnedArticle && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-pitch-surface to-pitch-surface border border-rose-500/30 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Urgent Advisory
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(pinnedArticle.created_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {pinnedArticle.views_count} views
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            <Link href={`/news/${pinnedArticle.slug}`} className="hover:text-amber-300 transition-colors">
              {pinnedArticle.title}
            </Link>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {pinnedArticle.summary}
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Published by <strong className="text-slate-200">{pinnedArticle.author_name}</strong>
            </span>
            <Link href={`/news/${pinnedArticle.slug}`}>
              <Button variant="gold" size="sm" className="font-bold text-xs shadow-md">
                <span>Read Full Warning</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Standard Articles Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading latest community bulletins...</p>
        </div>
      ) : standardArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardArticles.map((article) => {
            const badge = getCategoryBadge(article.category);
            return (
              <div
                key={article.id}
                className="bg-pitch-surface border border-pitch-border rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 hover:shadow-2xl transition-all flex flex-col group"
              >
                {article.cover_image_url && (
                  <div className="h-44 w-full relative overflow-hidden bg-pitch-card">
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

                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-pitch-border/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[140px] text-[11px] text-slate-400">
                      {article.author_name}
                    </span>
                    <Link
                      href={`/news/${article.slug}`}
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-pitch-surface border border-pitch-border space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No articles found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching category filters or search terms. New bulletins are posted frequently by administration.
          </p>
        </div>
      )}
    </div>
  );
}
