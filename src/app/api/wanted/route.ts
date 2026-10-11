import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { WantedRequest } from "@/types/database";

export const dynamic = "force-dynamic";

// Initial realistic seed requests from Kenyan eFootball gamers
const INITIAL_WANTED_REQUESTS: WantedRequest[] = [
  {
    id: "req_seed_1",
    buyer_name: "Kevin Omondi",
    buyer_phone: "254712345678",
    title: "Looking for 3120+ OVR Long Ball Counter with Blitz Curler Son + Vieira",
    description: "Looking for a top-tier LBC squad on Android. Must have Blitz Curler Son, Epic Vieira, and 105 Messi. Budget ready in M-Pesa.",
    min_overall_rating: 3120,
    target_playstyle: "long_ball_counter",
    preferred_platform: "android",
    budget_kes: 3500,
    key_players_wanted: ["Blitz Curler Son", "Epic Vieira", "105 Messi", "Gullit"],
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "req_seed_2",
    buyer_name: "Dennis Mwangi",
    buyer_phone: "254798765432",
    title: "Need iOS Quick Counter Squad with Big Time Rummenigge",
    description: "Want an iOS account with Rummenigge, Makelele, and Casillas. Division 1 or Division 2 dream team. Cash ready.",
    min_overall_rating: 3100,
    target_playstyle: "quick_counter",
    preferred_platform: "ios",
    budget_kes: 4200,
    key_players_wanted: ["BT Rummenigge", "Epic Makelele", "Casillas", "Nesta"],
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "req_seed_3",
    buyer_name: "Brian Kiprop",
    buyer_phone: "254722114455",
    title: "Budget Android Account with 105 Messi + 1500+ Coins",
    description: "Looking for a fresh or mid-tier account with 105 Copa Messi and extra coins to spin upcoming booster packs. Paying via Till 1572931.",
    min_overall_rating: 3050,
    target_playstyle: "possession",
    preferred_platform: "android",
    budget_kes: 1800,
    key_players_wanted: ["105 Messi", "Neymar Jr", "Rodri"],
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// Persistent in-memory storage for requests submitted in runtime
let memoryRequests: WantedRequest[] = [...INITIAL_WANTED_REQUESTS];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const minOvr = searchParams.get("minOvr");
    const maxBudget = searchParams.get("maxBudget");

    // Try Supabase first if table exists
    const supabase = createAdminClient();
    try {
      let query = supabase.from("wanted_requests").select("*").eq("status", "active");

      if (platform && platform !== "all") {
        query = query.eq("preferred_platform", platform);
      }
      if (minOvr) {
        query = query.gte("min_overall_rating", parseInt(minOvr, 10));
      }
      if (maxBudget) {
        query = query.lte("budget_kes", parseInt(maxBudget, 10));
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json({ requests: data });
      }
    } catch {
      // fallback to memory
    }

    // Filter memory requests
    let filtered = [...memoryRequests];
    if (platform && platform !== "all") {
      filtered = filtered.filter((r) => r.preferred_platform === platform);
    }
    if (minOvr) {
      filtered = filtered.filter((r) => r.min_overall_rating >= parseInt(minOvr, 10));
    }
    if (maxBudget) {
      filtered = filtered.filter((r) => r.budget_kes <= parseInt(maxBudget, 10));
    }

    return NextResponse.json({ requests: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      buyer_name,
      buyer_phone,
      title,
      description,
      min_overall_rating,
      target_playstyle,
      preferred_platform,
      budget_kes,
      key_players_wanted,
    } = body;

    if (!title || !budget_kes || !preferred_platform) {
      return NextResponse.json(
        { error: "Title, Budget (KES), and Platform are required fields." },
        { status: 400 }
      );
    }

    const newRequest: WantedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      buyer_name: buyer_name?.trim() || "Verified Buyer",
      buyer_phone: buyer_phone?.trim() || "0794400365",
      title: title.trim(),
      description: description?.trim() || "Ready to purchase through eFootballMarket escrow immediately.",
      min_overall_rating: Number(min_overall_rating) || 3000,
      target_playstyle: target_playstyle || "quick_counter",
      preferred_platform: preferred_platform || "android",
      budget_kes: Number(budget_kes),
      key_players_wanted: Array.isArray(key_players_wanted)
        ? key_players_wanted
        : typeof key_players_wanted === "string"
        ? key_players_wanted.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      status: "active",
      created_at: new Date().toISOString(),
    };

    // Try saving to Supabase
    try {
      const supabase = createAdminClient();
      await supabase.from("wanted_requests").insert(newRequest);
    } catch {
      // In-memory fallback
    }

    memoryRequests.unshift(newRequest);

    return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create request" }, { status: 500 });
  }
}
