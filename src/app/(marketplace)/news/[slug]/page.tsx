import { Button } from "@/components/ui/Button";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewsService } from "@/services/newsService";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Eye,
  MessageCircle,
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
        title: "Bulletin Not Found | eFootball Community Kenya",
      };
    }

    return {
      title: `${article.title} | eFootball Community Kenya`,
      description: article.summary,
      openGraph: {
        title: article.title,
        description: article.summary,
        images: article.cover_image_url ? [article.cover_image_url] : [],
      },
    };
  } catch {
    return {
      title: "Community Bulletin | eFootball Community Kenya",
    };
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawSlug = resolvedParams?.slug || "";
  const slug = decodeURIComponent(rawSlug).trim();

  const primaryClient = hasServiceRoleKey() ? createAdminClient() : createServerSupabaseClient();
  const service = new NewsService(primaryClient);
  const article = await service.getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const isScammerAlert = article.category === "scammer_alert";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 bg-[#0B1220] text-[#F8FAFC]">
      {/* Back Button */}
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors py-1 min-h-[36px]"
      >
        <ArrowLeft className="w-4 h-4 text-[#22C55E]" />
        <span>Back to News & Alerts</span>
      </Link>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isScammerAlert
                ? "bg-rose-950/70 border border-rose-800/80 text-rose-300"
                : "bg-[#1F2937] border border-[#374151] text-[#94A3B8]"
            }`}
          >
            {isScammerAlert ? "🚨 Security Advisory" : "Community Bulletin"}
          </span>

          <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
            {new Date(article.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>

          <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#94A3B8]" />
            {article.views_count} views
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display leading-tight tracking-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 pt-2 text-xs text-[#94A3B8]">
          <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center font-bold text-[#F8FAFC]">
            <User className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div>
            <p className="font-semibold text-[#F8FAFC]">{article.author_name || "Community Administration"}</p>
            <p className="text-[11px] text-[#94A3B8]">eFootball Community Kenya Editorial</p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {article.cover_image_url && (
        <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-[#1F2937] bg-[#111827] shadow-lg relative">
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
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3.5 shadow-md">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-200">
              Community Advisory: Avoid Off-Platform Impersonation
            </h3>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              Never share account passwords or verification codes with unverified individuals. Report suspicious activity to our official community hotline: 0794400365.
            </p>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
        <div className="text-sm sm:text-base text-[#F8FAFC] leading-relaxed space-y-4 whitespace-pre-line font-sans">
          {article.content}
        </div>

        {/* Community Discussion & Support Box */}
        <div className="mt-10 p-5 rounded-2xl bg-[#1F2937] border border-[#374151] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111827] border border-[#374151] flex items-center justify-center text-[#22C55E] shrink-0">
              <MessageCircle className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Community Discussion & Support
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Connect with fellow Kenyan players on WhatsApp or reach administration at 0794400365.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/254794400365"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="primary"
              size="sm"
              className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs px-4 py-2 min-h-[40px] rounded-lg shadow-sm"
            >
              Join WhatsApp Discussion
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
