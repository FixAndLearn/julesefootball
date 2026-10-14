import { isUserAdmin } from "@/lib/security/adminAuth";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendSellerWithdrawalStatusSms } from "@/lib/notifications/smsAlert";
import { sendSellerWithdrawalStatusWhatsApp } from "@/lib/whatsapp/notifications";
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
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;

    // Check admin via user_roles or email
    const { data: userRole } = await primaryClient
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .in("role_id", ["admin", "super_admin"])
      .limit(1);

    const isAdmin = Boolean((userRole && userRole.length > 0) || isUserAdmin(user.email));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    // Resilient multi-tier query:
    // NOTE: profiles table does NOT have an 'email' column (email lives in auth.users).
    // We select valid columns only: id, username, first_name, last_name, phone_number, available_balance
    let fetchedWithdrawals: any[] = [];

    // Attempt 1: Joined query with valid profile columns
    const { data: joinedData, error: joinError } = await primaryClient
      .from("seller_withdrawals")
      .select("*, seller:profiles(id, username, first_name, last_name, phone_number, available_balance)")
      .order("created_at", { ascending: false });

    if (!joinError && joinedData) {
      fetchedWithdrawals = joinedData;
    } else {
      console.warn("Joined withdrawals query warning:", joinError?.message);

      // Attempt 2: Fallback direct query on seller_withdrawals to ensure data is never lost
      const { data: directData, error: directError } = await primaryClient
        .from("seller_withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (directError) {
        // Attempt 3: Try adminSupabase in case of RLS differences
        const { data: adminData, error: adminErr } = await adminSupabase
          .from("seller_withdrawals")
          .select("*")
          .order("created_at", { ascending: false });

        if (adminErr) {
          console.error("Admin withdrawals fetch failed:", adminErr);
          throw adminErr;
        }
        fetchedWithdrawals = adminData || [];
      } else {
        fetchedWithdrawals = directData || [];
      }

      // Hydrate profiles manually
      if (fetchedWithdrawals.length > 0) {
        const sellerIds = Array.from(new Set(fetchedWithdrawals.map((w) => w.seller_id)));
        try {
          const { data: profiles } = await primaryClient
            .from("profiles")
            .select("id, username, first_name, last_name, phone_number, available_balance")
            .in("id", sellerIds);

          const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
          fetchedWithdrawals = fetchedWithdrawals.map((w) => ({
            ...w,
            seller: profileMap.get(w.seller_id) || null,
          }));
        } catch {
          // Non-blocking profile mapping
        }
      }
    }

    // Enrich with auth email addresses from auth.users (if service role / admin client permits)
    try {
      const { data: authData } = await adminSupabase.auth.admin.listUsers();
      if (authData?.users) {
        const emailMap = new Map(authData.users.map((u) => [u.id, u.email]));
        fetchedWithdrawals = fetchedWithdrawals.map((w) => {
          const sellerEmail = emailMap.get(w.seller_id) || "";
          return {
            ...w,
            seller: {
              ...(w.seller || {}),
              email: sellerEmail || w.seller?.email || "",
            },
          };
        });
      }
    } catch {
      // Non-blocking email enrichment
    }

    return NextResponse.json({ withdrawals: fetchedWithdrawals || [] });
  } catch (error: any) {
    console.error("GET /api/admin/withdrawals fatal:", error);
    return NextResponse.json({ error: error.message || "Failed to load withdrawals" }, { status: 500 });
  }
}

const updateWithdrawalSchema = z.object({
  withdrawalId: z.string().uuid(),
  status: z.enum(["pending", "processing", "completed", "rejected"]),
  failureReason: z.string().optional(),
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
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;

    const { data: userRole } = await primaryClient
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .in("role_id", ["admin", "super_admin"])
      .limit(1);

    const isAdmin = Boolean((userRole && userRole.length > 0) || isUserAdmin(user.email));
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const json = await req.json();
    const parsed = updateWithdrawalSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parsed.error.format() }, { status: 400 });
    }

    const { withdrawalId, status, failureReason } = parsed.data;

    // Fetch withdrawal
    let withdrawal = null;
    const { data: w1 } = await primaryClient
      .from("seller_withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (w1) {
      withdrawal = w1;
    } else {
      const { data: w2 } = await adminSupabase
        .from("seller_withdrawals")
        .select("*")
        .eq("id", withdrawalId)
        .single();
      withdrawal = w2;
    }

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found." }, { status: 404 });
    }

    // If rejected, refund the seller's available_balance
    if (status === "rejected" && withdrawal.status !== "rejected") {
      let currentBal = 0;
      const { data: prof1 } = await primaryClient
        .from("profiles")
        .select("available_balance")
        .eq("id", withdrawal.seller_id)
        .single();

      if (prof1) {
        currentBal = Number(prof1.available_balance || 0);
      } else {
        const { data: prof2 } = await adminSupabase
          .from("profiles")
          .select("available_balance")
          .eq("id", withdrawal.seller_id)
          .single();
        currentBal = Number(prof2?.available_balance || 0);
      }

      const refundedBal = currentBal + Number(withdrawal.amount);

      // Update balance using primaryClient and fallback to adminSupabase
      const { error: refundErr1 } = await primaryClient
        .from("profiles")
        .update({
          available_balance: refundedBal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", withdrawal.seller_id);

      if (refundErr1) {
        await adminSupabase
          .from("profiles")
          .update({
            available_balance: refundedBal,
            updated_at: new Date().toISOString(),
          })
          .eq("id", withdrawal.seller_id);
      }
    }

    // Update withdrawal record
    const updatePayload = {
      status,
      reviewed_by: user.id,
      failure_reason: failureReason || null,
      updated_at: new Date().toISOString(),
    };

    let updateSuccess = false;
    const { error: updateError1 } = await primaryClient
      .from("seller_withdrawals")
      .update(updatePayload)
      .eq("id", withdrawalId);

    if (!updateError1) {
      updateSuccess = true;
    } else {
      const { error: updateError2 } = await adminSupabase
        .from("seller_withdrawals")
        .update(updatePayload)
        .eq("id", withdrawalId);

      if (!updateError2) {
        updateSuccess = true;
      } else {
        throw updateError2;
      }
    }

    // Notify seller
    try {
      const notifData = {
        recipient_id: withdrawal.seller_id,
        type: "order_update",
        title: status === "completed" ? "M-Pesa Withdrawal Completed" : `Withdrawal ${status.toUpperCase()}`,
        message:
          status === "completed"
            ? `Your M-Pesa withdrawal of KES ${withdrawal.amount} has been processed and disbursed.`
            : `Your withdrawal request of KES ${withdrawal.amount} was ${status}.${failureReason ? ` Reason: ${failureReason}` : ""}`,
        action_url: "/seller/earnings",
        is_read: false,
      };

      try {
        await primaryClient.from("notifications").insert(notifData);
      } catch {
        // non-blocking
      }

      // Dispatch WhatsApp & SMS messages to seller
      if (withdrawal.phone_number && (status === "completed" || status === "rejected")) {
        sendSellerWithdrawalStatusWhatsApp(
          withdrawal.phone_number,
          Number(withdrawal.amount),
          status,
          failureReason
        ).catch((err) => console.warn("Seller withdrawal WhatsApp notice:", err));

        sendSellerWithdrawalStatusSms(
          withdrawal.phone_number,
          Number(withdrawal.amount),
          status,
          failureReason
        ).catch((err) => console.warn("Seller withdrawal SMS notice:", err));
      }
    } catch (e) {
      console.warn("Failed to notify seller:", e);
    }

    return NextResponse.json({ success: true, message: `Withdrawal marked as ${status}.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
