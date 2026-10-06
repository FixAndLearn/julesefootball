import { NewsArticle, NewsCategory } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export const INITIAL_NEWS_SEED: Omit<NewsArticle, "id" | "created_at" | "updated_at">[] = [
  {
    title: "🚨 SCAMMER ALERT: Beware of Telegram & WhatsApp 'Middlemen' Impersonators",
    slug: "beware-of-off-platform-middlemen-scammers",
    category: "scammer_alert",
    summary:
      "Multiple fraudulent actors are attempting to invite eFootball players to WhatsApp groups claiming to be official market escrow agents. Read this urgent warning.",
    content: `### 🚨 Urgent Security Bulletin: Off-Platform Escrow Impersonators

We have observed fraudulent individuals contacting buyers and sellers with messages such as:
* *"Let's talk on WhatsApp, I will give you a link to pay"*
* *"Join our Telegram escrow group to avoid fees"*
* *"Send credentials directly, I paid already"*

#### How the Scam Works
1. Scammers pose as buyers or sellers and solicit your WhatsApp number or Telegram handle.
2. They send fake M-Pesa SMS messages or phony screenshots claiming funds have been transferred.
3. They take your Konami ID and instantly change the recovery email, locking you out permanently.

#### How to Stay 100% Protected
* **Stay Inside eFootballMarket**: All legitimate trades MUST take place on this website. Our automated Safaricom Lipa Na M-Pesa STK Push automatically locks money into our secure escrow vault.
* **Never Click External Links**: Our anti-circumvention chat filter blocks WhatsApp, Telegram, and unauthorized links.
* **Wait for the 'Escrow Locked' Status**: Never hand over account credentials until the order screen specifically indicates **'Payment Secured in Escrow'**.

If anyone asks you to move off-platform, report them immediately to platform administration.`,
    cover_image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    author_name: "Brian Okibo, CEO & Security Moderation",
    is_pinned: true,
    is_published: true,
    views_count: 1420,
  },
  {
    title: "⚽ eFootball 2026 Season Update: Epic & Big Time Player Rating Guide",
    slug: "efootball-2026-season-update-epic-big-time-guide",
    category: "efootball_news",
    summary:
      "Konami has announced major updates to Epic Booster cards and team playstyle proficiencies. Learn which squads hold the highest market value.",
    content: `### eFootball 2026 Squad Valuation & Market Trends

With the latest Konami engine updates, account valuations are heavily influenced by the presence of double-booster Epic legends and optimized managers.

#### Highest Demand Player Cards:
1. **Epic Boosted Patrick Vieira (DMF)**: The most sought-after anchor man with 98+ physical contact and defensive awareness.
2. **Big Time Lionel Messi (2015 / 2022)**: Incredible dribbling agility and custom acceleration curves.
3. **Epic Ruud Gullit & Kaká**: Versatile offensive engines dominating current division gameplay.

#### Pricing Recommendations for Sellers:
* Squads with **OVR 3150+** and at least 5 Epic Boosters command premium prices above KES 4,500.
* Ensure your Konami ID is set to transferable status before listing to guarantee fast escrow completion!`,
    cover_image_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    author_name: "eFootballMarket Editorial Staff",
    is_pinned: false,
    is_published: true,
    views_count: 890,
  },
  {
    title: "🛡️ How eFootballMarket Automated M-Pesa Escrow Protects Your Money",
    slug: "how-automated-mpesa-escrow-works",
    category: "escrow_guide",
    summary:
      "A complete walkthrough of the escrow vault: From STK Push settlement to the 24-hour credential inspection window.",
    content: `### Understanding the eFootballMarket Escrow Guarantee

Every trade on eFootballMarket is guarded by an institutional-grade escrow engine integrated directly with Safaricom Daraja API.

#### Step-by-Step Escrow Flow:
1. **Buyer Orders Squad**: An order is created with status \`payment_pending\`. Direct chat is locked to prevent circumvention.
2. **Automated STK Push**: The buyer receives a prompt on their Safaricom phone to enter their M-Pesa PIN.
3. **Escrow Lock**: Funds enter the secure platform escrow vault. The status shifts to \`escrow_locked\`.
4. **Credential Handoff**: The seller delivers the Konami ID and password into the encrypted delivery vault.
5. **Inspection Window**: The buyer receives a 24-hour window to log in, test the squad, and bind their own email.
6. **Settlement**: Once the buyer confirms (or if 24 hours expire with no dispute), funds are instantly credited to the seller's available balance!`,
    cover_image_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    author_name: "Brian Okibo, Chief Executive Officer",
    is_pinned: false,
    is_published: true,
    views_count: 654,
  },
];

export class NewsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetch all published news articles with seed fallback if table is empty
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

      if (!error && data && data.length > 0) {
        return data as NewsArticle[];
      }

      // If empty or table not yet created in Supabase, seed initial articles
      if (this.supabase) {
        try {
          await this.supabase.from("news_articles").insert(INITIAL_NEWS_SEED);
          const { data: seeded } = await query;
          if (seeded && seeded.length > 0) return seeded as NewsArticle[];
        } catch {
          // Fall through to memory fallback
        }
      }
    } catch (err) {
      console.warn("News query error:", err);
    }

    // Memory fallback if DB is initializing
    const filtered = category && category !== "all"
      ? INITIAL_NEWS_SEED.filter((a) => a.category === category)
      : INITIAL_NEWS_SEED;

    return filtered.map((a, index) => ({
      ...a,
      id: `seed-${index + 1}`,
      created_at: new Date(Date.now() - index * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    })) as NewsArticle[];
  }

  /**
   * Fetch article by slug or ID
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
    } catch {
      // Memory fallback
    }

    const found = INITIAL_NEWS_SEED.find((a) => a.slug === slug);
    if (found) {
      return {
        ...found,
        id: "seed-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return null;
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
   * Delete an article
   */
  async deleteArticle(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("news_articles")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete news article: ${error.message}`);
    }
  }
}
