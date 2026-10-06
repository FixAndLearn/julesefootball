import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewsService } from "@/services/newsService";
import { NextRequest, NextResponse } from "next/server";

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
