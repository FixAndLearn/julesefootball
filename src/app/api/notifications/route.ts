import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
        isAuthenticated: false,
      });
    }

    const adminSupabase = createAdminClient();

    // Query user notifications
    const { data: notifications, error } = await adminSupabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("Error querying notifications:", error.message);
    }

    let items = (notifications || []).map((n) => {
      let url = n.action_url;
      // Heal legacy placeholder urls that point to rules instead of dashboard
      if (url === "/escrow-guarantee") {
        url = "/dashboard/buyer";
      } else if (url && url.startsWith("/seller/orders/")) {
        url = url.replace("/seller/orders/", "/orders/");
      } else if (url === "/seller/orders" || url === "/seller") {
        url = "/dashboard/seller";
      }
      return { ...n, action_url: url };
    });

    const unreadCount = items.filter((n) => !n.is_read).length;

    return NextResponse.json({
      notifications: items,
      unreadCount,
      isAuthenticated: true,
    });
  } catch (error: any) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { id, markAll } = json;

    const adminSupabase = createAdminClient();

    if (markAll) {
      const { error } = await adminSupabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_id", user.id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (id) {
      const { error } = await adminSupabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("recipient_id", user.id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ error: "Missing id or markAll parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearRead = searchParams.get("clearRead") === "true";

    const adminSupabase = createAdminClient();

    if (clearRead) {
      const { error } = await adminSupabase
        .from("notifications")
        .delete()
        .eq("recipient_id", user.id)
        .eq("is_read", true);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "All read notifications cleared." });
    }

    if (id) {
      const { error } = await adminSupabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("recipient_id", user.id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Notification removed." });
    }

    return NextResponse.json({ error: "Missing id or clearRead parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Notifications DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
