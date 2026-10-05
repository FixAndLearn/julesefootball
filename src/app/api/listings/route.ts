import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const listingCreateSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20),
  price: z.number().min(100),
  currency: z.string().default("KES"),
  platform: z.enum([
    "android",
    "ios",
    "pc_steam",
    "playstation_4",
    "playstation_5",
    "xbox_one",
    "xbox_series_x",
  ]),
  game_version: z.string().default("v4.0.0"),
  region: z.string().default("Global"),
  account_level: z.number().min(1),
  overall_team_strength: z.number().min(2000),
  gp_balance: z.number().min(0).default(0),
  coin_balance: z.number().min(0).default(0),
  efootball_points: z.number().min(0).default(0),
  contract_renewal_tickets: z.number().min(0).default(0),
  booster_tokens: z.number().min(0).default(0),
  training_programs: z.number().min(0).default(0),
  player_slots: z.number().min(100).default(500),
  legend_players_count: z.number().min(0).default(0),
  epic_players_count: z.number().min(0).default(0),
  big_time_players_count: z.number().min(0).default(0),
  highlight_players_count: z.number().min(0).default(0),
  featured_players_count: z.number().min(0).default(0),
  key_players_list: z.array(z.string()).default([]),
  manager_name: z.string().nullable().optional(),
  formation: z.string().nullable().optional(),
  primary_playstyle: z.enum([
    "possession",
    "quick_counter",
    "long_ball_counter",
    "out_wide",
    "long_ball",
  ]),
  possession_rating: z.number().min(0).max(100).default(70),
  quick_counter_rating: z.number().min(0).max(100).default(70),
  long_ball_counter_rating: z.number().min(0).max(100).default(70),
  out_wide_rating: z.number().min(0).max(100).default(70),
  long_ball_rating: z.number().min(0).max(100).default(70),
  current_division: z.number().min(1).max(10).default(10),
  highest_division: z.number().min(1).max(10).default(10),
  dream_team_name: z.string().nullable().optional(),
  matches_played: z.number().min(0).default(0),
  wins: z.number().min(0).default(0),
  draws: z.number().min(0).default(0),
  losses: z.number().min(0).default(0),
  goals_scored: z.number().min(0).default(0),
  goals_conceded: z.number().min(0).default(0),
  account_age_months: z.number().min(0).default(0),
  konami_id_status: z.enum(["linked_changeable", "unlinked", "linked_immutable"]),
  linked_email_status: z.enum(["transferable_full_access", "buyer_email_bindable"]),
  status: z.enum(["draft", "pending_review", "published"]).default("published"),
  is_featured: z.boolean().default(false),
  image_urls: z.array(z.string()).min(1, "At least one screenshot is required"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const platform = (searchParams.get("platform") as any) || undefined;
    const playstyle = (searchParams.get("playstyle") as any) || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const minStrength = searchParams.get("minStrength") ? Number(searchParams.get("minStrength")) : undefined;
    const minCoins = searchParams.get("minCoins") ? Number(searchParams.get("minCoins")) : undefined;
    const minGp = searchParams.get("minGp") ? Number(searchParams.get("minGp")) : undefined;
    const minEpics = searchParams.get("minEpics") ? Number(searchParams.get("minEpics")) : undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "newest";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;

    const supabase = createServerSupabaseClient();
    const service = new ListingService(supabase);

    const result = await service.getListings({
      search,
      platform,
      playstyle,
      minPrice,
      maxPrice,
      minStrength,
      minCoins,
      minGp,
      minEpics,
      sortBy,
      limit,
      offset,
    });

    return NextResponse.json(result);
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
      return NextResponse.json({ error: "Unauthorized. Authentication required." }, { status: 401 });
    }

    const json = await req.json();
    const parsed = listingCreateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid listing submission", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { image_urls, ...listingData } = parsed.data;
    const service = new ListingService(supabase);

    const listing = await service.createListing(
      {
        ...listingData,
        seller_id: user.id,
      } as any,
      image_urls
    );

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
