import { isUserAdmin } from "@/lib/security/adminAuth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    const { data: callerProfile } = await primaryClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isUserAdmin(user.email, callerProfile?.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { data: listings, error } = await primaryClient
      .from("listings")
      .select("*, seller:profiles(id, username, phone_number, is_verified_seller, is_suspended)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ listings: listings || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const listingActionSchema = z.object({
  listingId: z.string().uuid(),
  action: z.enum(["take_down", "reinstate", "delete"]),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
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

    const { data: callerProfile } = await primaryClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isUserAdmin(user.email, callerProfile?.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const json = await req.json();
    const parsed = listingActionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { listingId, action, reason } = parsed.data;

    // Get listing details
    const { data: listing } = await primaryClient
      .from("listings")
      .select("id, title, seller_id")
      .eq("id", listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (action === "take_down") {
      await primaryClient
        .from("listings")
        .update({ status: "suspended" })
        .eq("id", listingId);

      // Alert the seller
      await primaryClient.from("notifications").insert({
        recipient_id: listing.seller_id,
        type: "listing_moderated",
        title: "⚠️ Listing Brought Down by Administration",
        message:
          reason ||
          `Your squad listing "${listing.title}" was brought down for non-conformance with platform rules. Please review guidelines.`,
        action_url: "/seller/guidelines",
        is_read: false,
      });

      return NextResponse.json({ success: true, message: "Listing brought down and seller alerted." });
    }

    if (action === "reinstate") {
      await primaryClient
        .from("listings")
        .update({ status: "active" })
        .eq("id", listingId);

      await primaryClient.from("notifications").insert({
        recipient_id: listing.seller_id,
        type: "listing_reinstated",
        title: "✅ Listing Restored to Marketplace",
        message: `Your squad listing "${listing.title}" has been approved and reinstated to the active browse catalog.`,
        action_url: `/listings/${listing.id}`,
        is_read: false,
      });

      return NextResponse.json({ success: true, message: "Listing reinstated to active catalog." });
    }

    if (action === "delete") {
      await primaryClient
        .from("listings")
        .update({ deleted_at: new Date().toISOString(), status: "cancelled" })
        .eq("id", listingId);

      return NextResponse.json({ success: true, message: "Listing deleted." });
    }

    return NextResponse.json({ error: "Unhandled action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
