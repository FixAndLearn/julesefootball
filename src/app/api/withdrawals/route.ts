import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mpesaClient } from "@/lib/mpesa/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const withdrawalSchema = z.object({
  amount: z.number().min(200, "Minimum withdrawal is KES 200"),
  phoneNumber: z.string().min(9, "Valid M-Pesa phone number required"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = withdrawalSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid withdrawal parameters", details: parsed.error.format() }, { status: 400 });
    }

    const { amount, phoneNumber } = parsed.data;
    const normalizedPhone = mpesaClient.normalizePhoneNumber(phoneNumber);

    // Lock user profile and verify balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("available_balance, is_suspended")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    if (profile.is_suspended) {
      return NextResponse.json({ error: "Account is suspended. Withdrawals disabled." }, { status: 403 });
    }

    if (Number(profile.available_balance) < amount) {
      return NextResponse.json({ error: "Insufficient available balance" }, { status: 400 });
    }

    // Deduct balance
    const { error: deductError } = await supabase
      .from("profiles")
      .update({
        available_balance: Number(profile.available_balance) - amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (deductError) {
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    // Insert withdrawal record
    const { data: withdrawal, error: withdrawalError } = await supabase
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
      // Revert balance deduction on failure
      await supabase
        .from("profiles")
        .update({ available_balance: Number(profile.available_balance) })
        .eq("id", user.id);
      return NextResponse.json({ error: "Failed to initiate withdrawal request" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted for processing.",
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

    const { data: withdrawals, error } = await supabase
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
