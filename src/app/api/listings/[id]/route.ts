import { isUserAdmin } from "@/lib/security/adminAuth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const listingUpdateSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(100).optional(),
  currency: z.string().default("KES").optional(),
  platform: z.enum([
    "android",
    "ios",
    "pc_steam",
    "playstation_4",
    "playstation_5",
    "xbox_one",
    "xbox_series_x",
  ]).optional(),
  game_version: z.string().optional(),
  region: z.string().optional(),
  account_level: z.coerce.number().min(1).optional(),
  overall_team_strength: z.coerce.number().min(2000).optional(),
  gp_balance: z.coerce.number().min(0).optional(),
  coin_balance: z.coerce.number().min(0).optional(),
  efootball_points: z.coerce.number().min(0).optional(),
  contract_renewal_tickets: z.coerce.number().min(0).optional(),
  epic_players_count: z.coerce.number().min(0).optional(),
  big_time_players_count: z.coerce.number().min(0).optional(),
  highlight_players_count: z.coerce.number().min(0).optional(),
  featured_players_count: z.coerce.number().min(0).optional(),
  legend_players_count: z.coerce.number().min(0).optional(),
  key_players_list: z.array(z.string()).optional(),
  manager_name: z.string().nullish().transform((val) => val?.trim() || null).optional(),
  formation: z.string().nullish().transform((val) => val?.trim() || null).optional(),
  primary_playstyle: z.enum([
    "possession",
    "quick_counter",
    "long_ball_counter",
    "out_wide",
    "long_ball",
  ]).optional(),
  current_division: z.coerce.number().transform((val) => Math.min(10, Math.max(1, val || 10))).optional(),
  highest_division: z.coerce.number().transform((val) => Math.min(10, Math.max(1, val || 10))).optional(),
  konami_id_status: z.enum(["linked_changeable", "unlinked", "linked_immutable"]).optional(),
  linked_email_status: z.enum(["transferable_full_access", "buyer_email_bindable"]).optional(),
  status: z.enum(["draft", "pending_review", "published", "sold", "archived"]).optional(),
  image_urls: z.array(z.string()).min(1).max(5).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const service = new ListingService(supabase);
    const listing = await service.getListingById(params.id);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
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
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = listingUpdateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid listing update payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

    // Check if user is admin
    const { data: profile } = await primaryClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isAdmin = isUserAdmin(user.email, profile?.role);

    const { image_urls, ...listingData } = parsed.data;
    const service = new ListingService(primaryClient);

    const updated = await service.updateListing(
      params.id,
      user.id,
      listingData,
      image_urls,
      isAdmin
    );

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully",
      listing: updated,
    });
  } catch (error: any) {
    console.error("Listing update error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
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
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const primaryClient = hasServiceRoleKey() ? adminSupabase : supabase;

    const { data: profile } = await primaryClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isAdmin = isUserAdmin(user.email, profile?.role);

    const service = new ListingService(primaryClient);
    await service.deleteListing(params.id, user.id, isAdmin);

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error: any) {
    console.error("Listing delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
