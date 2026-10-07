import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mpesaClient } from "@/lib/mpesa/client";
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
    const { data: profile, error: profileError } = await primaryClient
      .from("profiles")
      .select("available_balance, escrow_balance, is_suspended")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
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
    const { error: deductError } = await primaryClient
      .from("profiles")
      .update({
        available_balance: newAvailBal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (deductError) {
      return NextResponse.json({ error: "Failed to update available balance." }, { status: 500 });
    }

    // Insert withdrawal record using service-role primaryClient to bypass RLS
    const { data: withdrawal, error: withdrawalError } = await primaryClient
      .from("seller_withdrawals")
      .insert({
        seller_id: user.id,
        amount,
        payout_method: "mpesa",
        phone_number: normalizedPhone,
        status: "pending",
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("Withdrawal record creation error:", withdrawalError);
      // Revert balance deduction on failure
      await primaryClient
        .from("profiles")
        .update({ available_balance: availBal })
        .eq("id", user.id);
      return NextResponse.json(
        { error: `Failed to initiate withdrawal: ${withdrawalError.message}` },
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

    const { data: withdrawals, error } = await primaryClient
      .from("seller_withdrawals")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ withdrawals: withdrawals || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
