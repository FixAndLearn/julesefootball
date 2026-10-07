import { NewsArticle, NewsCategory } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export class NewsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetch all published news articles directly from the live database.
   * Returns an empty array if no articles exist. Never returns demo or mock seeds.
   */
  async getPublishedArticles(category?: string): Promise<NewsArticle[]> {
    try {
      let query = this.supabase
        .from("news_articles")
        .select("*")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data as NewsArticle[];
      }
      return [];
    } catch (err) {
      console.warn("News query error:", err);
      return [];
    }
  }

  /**
   * Fetch article by slug or ID directly from the database.
   * Returns null if not found.
   */
  async getArticleBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await this.supabase
        .from("news_articles")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single();

      if (!error && data) {
        // Increment views count non-blockingly
        this.supabase
          .from("news_articles")
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq("id", data.id)
          .then();

        return data as NewsArticle;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Create a news article and optionally broadcast notification to all users
   */
  async createArticle(
    payload: {
      title: string;
      category: NewsCategory;
      summary: string;
      content: string;
      cover_image_url?: string;
      author_name?: string;
      is_pinned?: boolean;
      broadcastNotification?: boolean;
    },
    authorId?: string
  ): Promise<NewsArticle> {
    const slug =
      payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 7);

    const { data, error } = await this.supabase
      .from("news_articles")
      .insert({
        title: payload.title,
        slug,
        category: payload.category,
        summary: payload.summary,
        content: payload.content,
        cover_image_url: payload.cover_image_url || null,
        author_id: authorId || null,
        author_name: payload.author_name || "Brian Okibo, Chief Executive Officer (CEO)",
        is_pinned: Boolean(payload.is_pinned),
        is_published: true,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create news article: ${error?.message}`);
    }

    // Broadcast push notification to all users if requested
    if (payload.broadcastNotification) {
      try {
        const { data: allProfiles } = await this.supabase
          .from("profiles")
          .select("id");

        if (allProfiles && allProfiles.length > 0) {
          const notifications = allProfiles.map((p: any) => ({
            recipient_id: p.id,
            type: payload.category === "scammer_alert" ? "scammer_alert" : "news_broadcast",
            title:
              payload.category === "scammer_alert"
                ? `🚨 SCAMMER ALERT: ${payload.title}`
                : `📢 NEW BULLETIN: ${payload.title}`,
            message: payload.summary.slice(0, 110),
            action_url: `/news/${slug}`,
            is_read: false,
          }));

          // Batch insert notifications
          await this.supabase.from("notifications").insert(notifications);
        }
      } catch (broadcastErr) {
        console.warn("Failed to broadcast notifications:", broadcastErr);
      }
    }

    return data as NewsArticle;
  }

  /**
   * Update an article
   */
  async updateArticle(
    id: string,
    payload: Partial<Omit<NewsArticle, "id" | "created_at">>
  ): Promise<NewsArticle> {
    const { data, error } = await this.supabase
      .from("news_articles")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${id},slug.eq.${id}`)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update news article: ${error?.message}`);
    }

    return data as NewsArticle;
  }

  /**
   * Delete an article
   */
  async deleteArticle(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("news_articles")
      .delete()
      .or(`id.eq.${id},slug.eq.${id}`);

    if (error) {
      throw new Error(`Failed to delete news article: ${error.message}`);
    }
  }
}
