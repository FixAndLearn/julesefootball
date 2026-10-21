import { mpesaClient } from "@/lib/mpesa/client";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TournamentService } from "@/services/tournamentService";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { tournament_id, gamer_tag, friend_id, phone_number, user_id } = body;

    const verifiedUserId = authUser?.id || (user_id ? String(user_id).trim() : null);

    if (!verifiedUserId) {
      return NextResponse.json(
        {
          error:
            "Community Membership Required: Only registered members can join tournaments. Please log in or register first.",
        },
        { status: 401 }
      );
    }

    if (!tournament_id || !gamer_tag || !friend_id || !phone_number) {
      return NextResponse.json(
        { error: "Tournament ID, Gamer Tag, Friend ID, and Safaricom Phone Number are required." },
        { status: 400 }
      );
    }

    // Rate limit checks (e.g. max 5 STK pushes per minute)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const rateCheck = checkRateLimit(`tourney_stk:${verifiedUserId}:${ip}`, 5, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait a minute before requesting another STK Push." },
        { status: 429 }
      );
    }

    const tourney = await TournamentService.getTournamentById(tournament_id);
    if (!tourney) {
      return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
    }

    if (tourney.status !== "registration_open") {
      return NextResponse.json(
        { error: "Registration is closed for this tournament." },
        { status: 400 }
      );
    }

    if (tourney.entry_fee_kes <= 0) {
      return NextResponse.json(
        { error: "This is a free tournament! Register directly with zero payment." },
        { status: 400 }
      );
    }

    const participants = tourney.participants || [];
    if (participants.length >= tourney.max_players) {
      return NextResponse.json(
        { error: "This tournament is already full. No remaining slots." },
        { status: 400 }
      );
    }

    const cleanFriendId = friend_id.trim().toLowerCase();
    if (participants.some((p) => p.friend_id.trim().toLowerCase() === cleanFriendId)) {
      return NextResponse.json(
        { error: "A player with this eFootball Friend ID has already registered." },
        { status: 400 }
      );
    }

    if (participants.some((p) => p.user_id === verifiedUserId)) {
      return NextResponse.json(
        { error: "You have already joined this tournament with your account." },
        { status: 400 }
      );
    }

    const normalizedPhone = mpesaClient.normalizePhoneNumber(phone_number);
    if (normalizedPhone.length < 12) {
      return NextResponse.json(
        { error: "Please enter a valid Safaricom phone number (e.g. 0712345678 or 254712345678)." },
        { status: 400 }
      );
    }

    const orderRef = `TRN-${tourney.id.slice(0, 6)}-${Date.now().toString().slice(-4)}`;

    // Trigger Daraja / UnifiedPay STK Push
    const stkResponse = await mpesaClient.initiateStkPush({
      phoneNumber: normalizedPhone,
      amount: tourney.entry_fee_kes,
      orderNumber: orderRef,
      description: `Entry: ${tourney.title.slice(0, 20)}`,
    });

    const checkoutRequestId = stkResponse.CheckoutRequestID;
    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: "Failed to initiate M-Pesa STK push prompt. Please check your phone number and try again." },
        { status: 500 }
      );
    }

    // Record pending payment in tournament_payments table & memory
    await TournamentService.createTournamentPayment({
      tournament_id,
      user_id: verifiedUserId,
      gamer_tag: gamer_tag.trim(),
      friend_id: friend_id.trim(),
      phone_number: normalizedPhone,
      amount: tourney.entry_fee_kes,
      checkout_request_id: checkoutRequestId,
      merchant_request_id: stkResponse.MerchantRequestID,
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId,
      customerMessage:
        stkResponse.CustomerMessage ||
        `M-Pesa STK Push sent to ${normalizedPhone}. Please check your phone and enter your PIN.`,
    });
  } catch (err: any) {
    console.error("Tournament STK Push error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate tournament STK Push." },
      { status: 500 }
    );
  }
}
