import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // 1. Fetch real published listings from Supabase (Zero mock/demo data)
    const { data: listings } = await supabase
      .from("listings")
      .select("id, title, price, currency, overall_team_strength, platform, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(6);

    const realListingItems = (listings || []).map((listing) => ({
      id: `listing-${listing.id}`,
      type: "real_listing",
      badge: "🔥 LIVE SQUAD",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      text: `${listing.title} | ${listing.overall_team_strength} OVR | KSh ${Number(listing.price).toLocaleString()} via Till 1572931`,
      link: `/listings/${listing.id}`,
      icon: "drops" as const,
    }));

    // 2. High-value official marketplace promotions & community security rules
    // (Requested: "if there's nothing happening, we can just have someone advertising the website, or we can make it somehow interesting")
    const promotionalBroadcasts = [
      {
        id: "promo-sell",
        type: "promo",
        badge: "📢 SELL ACCOUNT",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        text: "Got a high-OVR squad? List for free on Kenya's #1 eFootball hub & get instant M-Pesa payouts",
        link: "/seller/create-listing",
        icon: "verified" as const,
      },
      {
        id: "promo-escrow",
        type: "promo",
        badge: "🛡️ TILL 1572931 ESCROW",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        text: "Never send money directly on WhatsApp | Funds stay in Till 1572931 until you test the Konami login",
        link: "/escrow-guarantee",
        icon: "escrow" as const,
      },
      {
        id: "promo-scammer",
        type: "promo",
        badge: "🚨 SCAMMER CHECK",
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        text: "Verify trader phone numbers & WhatsApp handles against Kenya's Official Scammer Blacklist",
        link: "/scammer-check",
        icon: "alert" as const,
      },
      {
        id: "promo-friday",
        type: "promo",
        badge: "🔥 FRIDAY FLASH DROPS",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        text: "Curated high-OVR squads discounted up to 35% every Friday (2:00 PM – 10:00 PM EAT)",
        link: "/friday-drops",
        icon: "drops" as const,
      },
      {
        id: "promo-wanted",
        type: "promo",
        badge: "⚡ WANTED BOARD",
        badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
        text: "Looking for Blitz Curler Son, Vieira or Bully Messi? Post your request on our Wanted Board",
        link: "/wanted",
        icon: "verified" as const,
      },
      {
        id: "promo-safety",
        type: "promo",
        badge: "🔒 2FA SAFETY RULE",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        text: "Safety protocol: Always verify Google Play / Apple ID is unlinked before changing Konami ID email",
        link: "/escrow-guarantee",
        icon: "escrow" as const,
      },
    ];

    // Interleave real listing drops with promotional broadcasts for high engagement
    const combined = [];
    const maxLen = Math.max(realListingItems.length, promotionalBroadcasts.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < realListingItems.length) {
        combined.push(realListingItems[i]);
      }
      if (i < promotionalBroadcasts.length) {
        combined.push(promotionalBroadcasts[i]);
      }
    }

    return NextResponse.json({
      success: true,
      items: combined.length > 0 ? combined : promotionalBroadcasts,
      realListingsCount: realListingItems.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
