import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mpesaClient } from "@/lib/mpesa/client";
import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const withdrawalSchema = z.object({
  amount: z.number().min(10, "Minimum withdrawal is KES 10"),
  phoneNumber: z.string().min(9, "Valid M-Pesa phone number required"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to withdraw." }, { status: 401 });
    }

    const json = await req.json();
    const parsed = withdrawalSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid withdrawal parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { amount, phoneNumber } = parsed.data;
    const normalizedPhone = mpesaClient.normalizePhoneNumber(phoneNumber);

    const adminSupabase = createAdminClient();
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;

    // Fetch user profile and verify balance
    let profile = null;
    const { data: p1 } = await primaryClient
      .from("profiles")
      .select("username, available_balance, escrow_balance, is_suspended")
      .eq("id", user.id)
      .single();

    if (p1) {
      profile = p1;
    } else {
      const { data: p2 } = await adminSupabase
        .from("profiles")
        .select("username, available_balance, escrow_balance, is_suspended")
        .eq("id", user.id)
        .single();
      profile = p2;
    }

    if (!profile) {
      return NextResponse.json({ error: "Seller profile not found." }, { status: 404 });
    }

    if (profile.is_suspended) {
      return NextResponse.json({ error: "Account is suspended. Withdrawals disabled." }, { status: 403 });
    }

    const availBal = Number(profile.available_balance || 0);
    const escrowBal = Number(profile.escrow_balance || 0);

    if (availBal < amount) {
      if (escrowBal > 0) {
        return NextResponse.json(
          {
            error: `Insufficient available balance (KES ${availBal.toLocaleString()}). You have KES ${escrowBal.toLocaleString()} currently locked in Escrow. Escrow funds are released to your Available Balance as soon as the buyer confirms the account or the 24h inspection window ends.`,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: `Insufficient available balance. You currently have KES ${availBal.toLocaleString()} available to withdraw.`,
        },
        { status: 400 }
      );
    }

    // Deduct available balance
    const newAvailBal = Math.max(0, availBal - amount);
    let balanceDeducted = false;

    const { error: deductErr1 } = await primaryClient
      .from("profiles")
      .update({
        available_balance: newAvailBal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!deductErr1) {
      balanceDeducted = true;
    } else {
      const { error: deductErr2 } = await adminSupabase
        .from("profiles")
        .update({
          available_balance: newAvailBal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (!deductErr2) {
        balanceDeducted = true;
      } else {
        return NextResponse.json({ error: "Failed to update available balance." }, { status: 500 });
      }
    }

    // Insert withdrawal record using multi-tier clients
    let withdrawal = null;
    let withdrawalError = null;

    const insertPayload = {
      seller_id: user.id,
      amount,
      payout_method: "mpesa",
      phone_number: normalizedPhone,
      status: "pending",
    };

    // Attempt 1: primaryClient
    const { data: w1, error: wErr1 } = await primaryClient
      .from("seller_withdrawals")
      .insert(insertPayload)
      .select()
      .single();

    if (!wErr1 && w1) {
      withdrawal = w1;
    } else {
      withdrawalError = wErr1;
      // Attempt 2: adminSupabase
      const { data: w2, error: wErr2 } = await adminSupabase
        .from("seller_withdrawals")
        .insert(insertPayload)
        .select()
        .single();

      if (!wErr2 && w2) {
        withdrawal = w2;
        withdrawalError = null;
      } else {
        withdrawalError = wErr2 || wErr1;
      }
    }

    if (withdrawalError || !withdrawal) {
      console.error("Withdrawal record creation error:", withdrawalError);
      // Revert balance deduction on failure
      try {
        await primaryClient
          .from("profiles")
          .update({ available_balance: availBal })
          .eq("id", user.id);
      } catch {
        // try fallback
      }

      try {
        await adminSupabase
          .from("profiles")
          .update({ available_balance: availBal })
          .eq("id", user.id);
      } catch {
        // ignore
      }

      return NextResponse.json(
        { error: `Failed to initiate withdrawal: ${withdrawalError?.message || "Database insert failed"}` },
        { status: 500 }
      );
    }

    // Create notification for seller
    try {
      await primaryClient.from("notifications").insert({
        recipient_id: user.id,
        type: "order_update",
        title: "M-Pesa Withdrawal Submitted",
        message: `Your withdrawal request of KES ${amount} to ${normalizedPhone} has been received and queued for disbursement.`,
        action_url: "/seller/earnings",
        is_read: false,
      });
    } catch (notifErr) {
      console.warn("Notification error:", notifErr);
    }

    // Automated high-priority alerts to Brian Okibo (Telegram smartphone push + WhatsApp + SMS)
    const sellerUsername =
      profile?.username ||
      user.user_metadata?.username ||
      (user.email ? user.email.split("@")[0] : "Trader");

    dispatchAdminWhatsAppAlert({
      eventType: "WITHDRAWAL_REQUESTED",
      orderId: withdrawal.id,
      amount,
      sellerPhone: normalizedPhone,
      username: sellerUsername,
      userEmail: user.email || undefined,
    }).catch((err) => {
      console.warn("Admin alert dispatch warning:", err);
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal of KES ${amount} to ${normalizedPhone} submitted successfully.`,
      withdrawal,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    const adminSupabase = createAdminClient();
    const serviceRoleConfigured = hasServiceRoleKey();
    const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;

    let withdrawals: any[] = [];
    const { data: wData1, error: wErr1 } = await primaryClient
      .from("seller_withdrawals")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (!wErr1 && wData1) {
      withdrawals = wData1;
    } else {
      const { data: wData2 } = await adminSupabase
        .from("seller_withdrawals")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      withdrawals = wData2 || [];
    }

    return NextResponse.json({ withdrawals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
