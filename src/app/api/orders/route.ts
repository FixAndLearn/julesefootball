import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OrderService } from "@/services/orderService";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createOrderSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to complete your purchase." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = createOrderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 1. Ensure the buyer's profile record exists in public.profiles table
    const cleanId = user.id.replace(/-/g, "").slice(0, 6);
    const emailPrefix = user.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") : "";
    const fallbackUsername =
      user.user_metadata?.username?.trim() ||
      (emailPrefix ? `${emailPrefix}_${cleanId}` : `buyer_${cleanId}`);

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

    // Ensure buyer profile exists (admin client bypasses RLS)
    try {
      await adminSupabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" });
    } catch (err) {
      console.warn("adminSupabase buyer profile upsert notice:", err);
    }

    // Ensure default buyer role exists
    try {
      await adminSupabase.from("user_roles").upsert(
        { user_id: user.id, role_id: "buyer" },
        { onConflict: "user_id,role_id" }
      );
    } catch {
      // Non-blocking
    }

    // 2. Create the order using admin client if service role key is present to bypass RLS,
    // otherwise fallback to authenticated user client.
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;
    const orderService = new OrderService(primaryClient);

    let order;
    try {
      order = await orderService.createOrder(user.id, parsed.data.listingId);
    } catch (createErr: any) {
      if (serviceRoleConfigured) {
        console.warn("Primary client createOrder failed, falling back to user client:", createErr.message);
        const fallbackService = new OrderService(supabase);
        order = await fallbackService.createOrder(user.id, parsed.data.listingId);
      } else {
        throw createErr;
      }
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error("Order creation API error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 400 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = (searchParams.get("role") as "buyer" | "seller") || "buyer";

    const adminSupabase = createAdminClient();
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;
    const orderService = new OrderService(primaryClient);
    const orders = await orderService.getUserOrders(user.id, role);

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });

  }
}
