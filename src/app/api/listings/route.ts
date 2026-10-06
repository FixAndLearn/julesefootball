import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const listingCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().default("Verified eFootball account with confirmed squad strength and player assets."),
  price: z.coerce.number().min(100, "Listing price must be at least 100 KES"),
  currency: z.string().default("KES"),
  platform: z.enum([
    "android",
    "ios",
    "pc_steam",
    "playstation_4",
    "playstation_5",
    "xbox_one",
    "xbox_series_x",
  ]).default("android"),
  game_version: z.string().default("v4.0.0"),
  region: z.string().default("Global"),
  account_level: z.coerce.number().min(1).default(1),
  overall_team_strength: z.coerce
    .number()
    .min(2000, "Overall team strength must be at least 2000 OVR")
    .default(3000),
  gp_balance: z.coerce.number().min(0).default(0),
  coin_balance: z.coerce.number().min(0).default(0),
  efootball_points: z.coerce.number().min(0).default(0),
  contract_renewal_tickets: z.coerce.number().min(0).default(0),
  booster_tokens: z.coerce.number().min(0).default(0),
  training_programs: z.coerce.number().min(0).default(0),
  player_slots: z.coerce.number().min(100).default(500),
  legend_players_count: z.coerce.number().min(0).default(0),
  epic_players_count: z.coerce.number().min(0).default(0),
  big_time_players_count: z.coerce.number().min(0).default(0),
  highlight_players_count: z.coerce.number().min(0).default(0),
  featured_players_count: z.coerce.number().min(0).default(0),
  key_players_list: z.array(z.string()).default([]),
  manager_name: z
    .string()
    .nullish()
    .transform((val) => val?.trim() || null),
  formation: z
    .string()
    .nullish()
    .transform((val) => val?.trim() || null),
  primary_playstyle: z.enum([
    "possession",
    "quick_counter",
    "long_ball_counter",
    "out_wide",
    "long_ball",
  ]).default("quick_counter"),
  possession_rating: z.coerce.number().min(0).max(100).default(70),
  quick_counter_rating: z.coerce.number().min(0).max(100).default(70),
  long_ball_counter_rating: z.coerce.number().min(0).max(100).default(70),
  out_wide_rating: z.coerce.number().min(0).max(100).default(70),
  long_ball_rating: z.coerce.number().min(0).max(100).default(70),
  current_division: z.coerce
    .number()
    .transform((val) => Math.min(10, Math.max(1, val || 10)))
    .default(10),
  highest_division: z.coerce
    .number()
    .transform((val) => Math.min(10, Math.max(1, val || 10)))
    .default(10),
  dream_team_name: z
    .string()
    .nullish()
    .transform((val) => val?.trim() || null),
  matches_played: z.coerce.number().min(0).default(0),
  wins: z.coerce.number().min(0).default(0),
  draws: z.coerce.number().min(0).default(0),
  losses: z.coerce.number().min(0).default(0),
  goals_scored: z.coerce.number().min(0).default(0),
  goals_conceded: z.coerce.number().min(0).default(0),
  account_age_months: z.coerce.number().min(0).default(0),
  konami_id_status: z.enum(["linked_changeable", "unlinked", "linked_immutable"]).default("linked_changeable"),
  linked_email_status: z.enum(["transferable_full_access", "buyer_email_bindable"]).default("transferable_full_access"),
  status: z.enum(["draft", "pending_review", "published"]).default("published"),
  is_featured: z.boolean().default(false),
  image_urls: z
    .array(z.string())
    .min(1, "Please upload at least one squad screenshot")
    .max(5, "You can upload a maximum of 5 squad screenshots"),
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
      return NextResponse.json(
        { error: "Unauthorized. Please log in or create an account to publish a listing." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = listingCreateSchema.safeParse(json);

    if (!parsed.success) {
      const issueDetails = parsed.error.issues
        .map((issue) => {
          const field = issue.path.join(".") || "field";
          return `${field.replace(/_/g, " ")}: ${issue.message}`;
        })
        .join("; ");

      return NextResponse.json(
        {
          error: `Please correct the following: ${issueDetails}`,
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    // 1. Ensure the seller's profile record exists in public.profiles table
    const adminSupabase = createAdminClient();
    const cleanId = user.id.replace(/-/g, "").slice(0, 6);
    const emailPrefix = user.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") : "";
    const fallbackUsername =
      user.user_metadata?.username?.trim() ||
      (emailPrefix ? `${emailPrefix}_${cleanId}` : `trader_${cleanId}`);

    const firstName =
      user.user_metadata?.first_name?.trim() ||
      emailPrefix ||
      "Trader";
    const lastName = user.user_metadata?.last_name?.trim() || "";
    const phoneNumber = user.user_metadata?.phone_number?.trim() || "";

    const profileData = {
      id: user.id,
      username: fallbackUsername,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      country: "KEN",
      is_verified_seller: false,
      available_balance: 0.0,
      escrow_balance: 0.0,
    };

    // First attempt: Provision profile via admin client (service role key bypasses RLS)
    let profileReady = false;
    try {
      const { error: adminProfileErr } = await adminSupabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" });

      if (!adminProfileErr) {
        profileReady = true;
      } else {
        console.warn("adminSupabase profile upsert note:", adminProfileErr.message);
      }
    } catch (err: any) {
      console.warn("adminSupabase profile upsert exception:", err.message);
    }

    // Fallback: Provision profile via authenticated user client
    if (!profileReady) {
      try {
        const { error: userProfileErr } = await supabase
          .from("profiles")
          .upsert(profileData, { onConflict: "id" });

        if (userProfileErr) {
          console.warn("supabase user profile upsert note:", userProfileErr.message);
        } else {
          profileReady = true;
        }
      } catch (err: any) {
        console.warn("supabase user profile upsert exception:", err.message);
      }
    }

    // Ensure seller and buyer roles exist for this user in user_roles
    try {
      await adminSupabase.from("user_roles").upsert(
        [
          { user_id: user.id, role_id: "seller" },
          { user_id: user.id, role_id: "buyer" },
        ],
        { onConflict: "user_id,role_id" }
      );
    } catch {
      try {
        await supabase.from("user_roles").upsert(
          [
            { user_id: user.id, role_id: "seller" },
            { user_id: user.id, role_id: "buyer" },
          ],
          { onConflict: "user_id,role_id" }
        );
      } catch {
        // Non-blocking role assignment
      }
    }

    const { image_urls, ...listingData } = parsed.data;

    // Use admin client if service role key is present to bypass any residual RLS issues,
    // otherwise use the authenticated cookie client.
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;
    const service = new ListingService(primaryClient);

    let listing;
    try {
      listing = await service.createListing(
        {
          ...listingData,
          seller_id: user.id,
        } as any,
        image_urls
      );
    } catch (createError: any) {
      // If primary client failed and we used admin client, retry with user client
      if (serviceRoleConfigured) {
        console.warn("Primary client createListing failed, retrying with user client:", createError.message);
        const fallbackService = new ListingService(supabase);
        listing = await fallbackService.createListing(
          {
            ...listingData,
            seller_id: user.id,
          } as any,
          image_urls
        );
      } else {
        throw createError;
      }
    }

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error: any) {
    console.error("Listing creation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}
