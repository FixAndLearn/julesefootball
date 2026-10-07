import { isUserAdmin } from "@/lib/security/adminAuth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewsService } from "@/services/newsService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateNewsSchema = z.object({
  title: z.string().min(5).optional(),
  category: z.enum(["scammer_alert", "efootball_news", "escrow_guide", "announcement", "update"]).optional(),
  summary: z.string().min(10).optional(),
  content: z.string().min(20).optional(),
  cover_image_url: z.string().nullable().optional(),
  author_name: z.string().optional(),
  is_pinned: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

    const service = new NewsService(primaryClient);
    const article = await service.getArticleBySlug(params.id);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const parsed = updateNewsSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const service = new NewsService(primaryClient);
    const updated = await service.updateArticle(params.id, parsed.data);

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
      article: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const service = new NewsService(primaryClient);
    await service.deleteArticle(params.id);

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
