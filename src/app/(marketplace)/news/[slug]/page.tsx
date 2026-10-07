import { Button } from "@/components/ui/Button";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewsService } from "@/services/newsService";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Eye,
  Lock,
  Share2,
  ShieldCheck,
  User,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface NewsArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = decodeURIComponent(resolvedParams?.slug || "").trim();
    const primaryClient = hasServiceRoleKey() ? createAdminClient() : createServerSupabaseClient();
    const service = new NewsService(primaryClient);
    const article = await service.getArticleBySlug(slug);

    if (!article) {
      return {
        title: "Bulletin Not Found | eFootballMarket",
      };
    }

    return {
      title: `${article.title} | eFootballMarket Intelligence`,
      description: article.summary,
      openGraph: {
        title: article.title,
        description: article.summary,
        images: article.cover_image_url ? [article.cover_image_url] : [],
      },
    };
  } catch {
    return {
      title: "eFootballMarket Bulletin",
    };
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawSlug = resolvedParams?.slug || "";
  const decodedSlug = decodeURIComponent(rawSlug).trim();

  const supabase = createServerSupabaseClient();
  const adminSupabase = createAdminClient();
  const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

  const service = new NewsService(primaryClient);
  let article = await service.getArticleBySlug(decodedSlug);

  // Resilient fallback with user client if admin client had an issue
  if (!article && primaryClient !== supabase) {
    const fallbackService = new NewsService(supabase);
    article = await fallbackService.getArticleBySlug(decodedSlug);
  }

  if (!article) {
    notFound();
  }

  const isScammerAlert = article.category === "scammer_alert";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Back to Bulletins */}
      <Link
        href="/news"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to News & Alerts</span>
      </Link>

      {/* Article Header */}
      <div className="space-y-4 border-b border-pitch-border/80 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
              isScammerAlert
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-brand-500/20 border-brand-500/40 text-brand-300"
            }`}
          >
            {isScammerAlert ? "🚨 Security Advisory" : "Official Bulletin"}
          </span>

          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(article.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>

          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {article.views_count} views
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">{article.author_name}</p>
            <p className="text-[11px] text-slate-500">eFootballMarket Verified Editorial</p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {article.cover_image_url && (
        <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-pitch-border bg-pitch-surface shadow-2xl relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Security Banner if Scammer Alert */}
      {isScammerAlert && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5 shadow-xl">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-200">
              Active Security Alert: Beware of Off-Platform Infiltration
            </h3>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              All eFootball trading must proceed exclusively through our automated M-Pesa STK Push escrow. Never accept requests to chat on WhatsApp or Telegram.
            </p>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="bg-pitch-surface border border-pitch-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="text-sm sm:text-base text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-sans">
          {article.content}
        </div>

        {/* Platform Escrow Guarantee Box */}
        <div className="mt-10 p-5 rounded-2xl bg-pitch-card border border-pitch-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                eFootballMarket Escrow Guarantee
              </h4>
              <p className="text-[11px] text-slate-400">
                Automated Lipa Na M-Pesa escrow protection on all account transactions.
              </p>
            </div>
          </div>

          <Link href="/browse">
            <Button variant="gold" size="sm" className="font-bold text-xs shadow-md">
              Browse Safe Squads
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
