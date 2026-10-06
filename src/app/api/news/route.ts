import { isUserAdmin } from "@/lib/security/adminAuth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewsService } from "@/services/newsService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createNewsSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.enum(["scammer_alert", "efootball_news", "escrow_guide", "announcement", "update"]).default("efootball_news"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  cover_image_url: z.string().optional(),
  author_name: z.string().optional(),
  is_pinned: z.boolean().default(false),
  broadcastNotification: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const supabase = createServerSupabaseClient();
    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

    const service = new NewsService(primaryClient);
    const articles = await service.getPublishedArticles(category);

    return NextResponse.json({ articles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

    // Check admin privilege
    const { data: profile } = await primaryClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isUserAdmin(user.email, profile?.role)) {
      return NextResponse.json(
        { error: "Forbidden: Super Administrator or Admin privileges required." },
        { status: 403 }
      );
    }

    const json = await req.json();
    const parsed = createNewsSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid news payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const service = new NewsService(primaryClient);
    const article = await service.createArticle(parsed.data, user.id);

    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

    const { data: profile } = await primaryClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isUserAdmin(user.email, profile?.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can delete news bulletins." },
        { status: 403 }
      );
    }

    const service = new NewsService(primaryClient);
    await service.deleteArticle(id);

    return NextResponse.json({ success: true, message: "Article removed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
