import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface MiddlemanDeal {
  id: string;
  deal_code: string;
  buyer_name: string;
  buyer_phone: string;
  seller_name: string;
  seller_phone: string;
  deal_title: string;
  deal_description: string;
  item_amount_kes: number;
  escrow_fee_kes: number;
  total_amount_kes: number;
  status: "awaiting_payment" | "escrow_locked" | "seller_delivering" | "buyer_verifying" | "completed" | "disputed";
  till_number: string;
  mpesa_receipt?: string;
  created_at: string;
}

// In-memory runtime persistence
const MEMORY_DEALS: MiddlemanDeal[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const phone = searchParams.get("phone");

    // Check Supabase if table exists
    try {
      const supabase = createAdminClient();
      let query = supabase.from("middleman_deals").select("*");
      if (code) query = query.eq("deal_code", code.trim().toUpperCase());
      if (phone) query = query.or(`buyer_phone.eq.${phone},seller_phone.eq.${phone}`);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ deals: data });
      }
    } catch {
      // fallback
    }

    let results = [...MEMORY_DEALS];
    if (code) {
      results = results.filter((d) => d.deal_code.toLowerCase() === code.trim().toLowerCase());
    }
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      results = results.filter(
        (d) => d.buyer_phone.includes(cleanPhone) || d.seller_phone.includes(cleanPhone)
      );
    }

    return NextResponse.json({ deals: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to query deals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      buyer_name,
      buyer_phone,
      seller_name,
      seller_phone,
      deal_title,
      deal_description,
      item_amount_kes,
    } = body;

    if (!buyer_name || !buyer_phone || !seller_phone || !deal_title || !item_amount_kes) {
      return NextResponse.json(
        { error: "Please fill in buyer phone, seller phone, deal title, and agreed amount." },
        { status: 400 }
      );
    }

    const amount = Number(item_amount_kes);
    if (isNaN(amount) || amount < 100) {
      return NextResponse.json({ error: "Agreed deal amount must be at least KES 100." }, { status: 400 });
    }

    // 5% Escrow commission (minimum 50 KES, maximum 350 KES)
    const rawFee = Math.round(amount * 0.05);
    const fee = Math.max(50, Math.min(350, rawFee));
    const total = amount + fee;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const dealCode = `EFM-${randomSuffix}`;

    const newDeal: MiddlemanDeal = {
      id: `mdm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      deal_code: dealCode,
      buyer_name: buyer_name.trim(),
      buyer_phone: buyer_phone.trim(),
      seller_name: seller_name?.trim() || "Trader",
      seller_phone: seller_phone.trim(),
      deal_title: deal_title.trim(),
      deal_description: deal_description?.trim() || "Private trade secured via eFootballMarket Escrow.",
      item_amount_kes: amount,
      escrow_fee_kes: fee,
      total_amount_kes: total,
      status: "awaiting_payment",
      till_number: "1572931",
      created_at: new Date().toISOString(),
    };

    // Try saving to Supabase
    try {
      const supabase = createAdminClient();
      await supabase.from("middleman_deals").insert(newDeal);
    } catch {
      // In-memory fallback
    }

    MEMORY_DEALS.unshift(newDeal);

    return NextResponse.json({ success: true, deal: newDeal }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create escrow contract" }, { status: 500 });
  }
}
