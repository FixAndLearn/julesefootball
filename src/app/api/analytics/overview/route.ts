import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AnalyticsService } from "@/services/analyticsService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const service = new AnalyticsService(supabase);
    const metrics = await service.getPlatformOverview();

    return NextResponse.json({ metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
