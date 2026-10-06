import { MetadataRoute } from "next";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://efootballmarket.com");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/escrow-guarantee`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/fraud-prevention`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/seller/create-listing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/seller/verification`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/dispute-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const supabase = hasServiceRoleKey() ? createAdminClient() : createServerSupabaseClient();

    const [listingsRes, newsRes] = await Promise.all([
      supabase.from("listings").select("id, updated_at").eq("status", "published").limit(100),
      supabase.from("news_articles").select("slug, updated_at").eq("is_published", true).limit(50),
    ]);

    const listingRoutes: MetadataRoute.Sitemap = (listingsRes.data || []).map((listing: any) => ({
      url: `${siteUrl}/listings/${listing.id}`,
      lastModified: new Date(listing.updated_at || Date.now()),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const newsRoutes: MetadataRoute.Sitemap = (newsRes.data || []).map((article: any) => ({
      url: `${siteUrl}/news/${article.slug}`,
      lastModified: new Date(article.updated_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...listingRoutes, ...newsRoutes];
  } catch {
    return staticRoutes;
  }
}
