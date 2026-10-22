import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingOffer } from "@/types/database";
import { normalizePhoneNumber, formatWhatsAppPhone } from "@/lib/utils/phone";
import { dispatchAdminWhatsAppAlert } from "@/lib/notifications/adminAlert";
import { sendSellerOfferReceivedSms, sendBuyerOfferResponseSms } from "@/lib/notifications/smsAlert";
import { notifySellerNewOfferViaTelegram } from "@/lib/notifications/telegramAlert";

export const dynamic = "force-dynamic";

// In-memory fallback for offline/test environments
const MEMORY_OFFERS: ListingOffer[] = [];

function getClient() {
  const adminSupabase = createAdminClient();
  const userSupabase = createServerSupabaseClient();
  return hasServiceRoleKey() ? adminSupabase : userSupabase;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get("offerId");
    const listingId = searchParams.get("listingId");
    const sellerId = searchParams.get("sellerId");
    const buyerPhone = searchParams.get("phone");
    const buyerId = searchParams.get("buyerId");

    const supabase = getClient();

    // 1. Fetch from Supabase
    try {
      let query = supabase
        .from("listing_offers")
        .select("*, listing:listings(id, title, price, platform, overall_team_strength, manager_name, images:listing_images(image_url))")
        .order("created_at", { ascending: false });

      if (offerId) {
        query = query.eq("id", offerId);
      } else if (listingId) {
        query = query.eq("listing_id", listingId);
      } else if (sellerId) {
        query = query.eq("seller_id", sellerId);
      } else if (buyerId) {
        query = query.eq("buyer_id", buyerId);
      } else if (buyerPhone) {
        query = query.eq("buyer_phone", buyerPhone);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        if (offerId) {
          return NextResponse.json({ offer: data[0] });
        }
        return NextResponse.json({ offers: data });
      }
    } catch (e) {
      console.warn("Supabase offers query fallback:", e);
    }

    // 2. In-memory fallback
    if (offerId) {
      const found = MEMORY_OFFERS.find((o) => o.id === offerId);
      if (!found) {
        return NextResponse.json({ error: "Offer not found or expired" }, { status: 404 });
      }
      return NextResponse.json({ offer: found });
    }

    let filtered = [...MEMORY_OFFERS];
    if (listingId) {
      filtered = filtered.filter((o) => o.listing_id === listingId);
    }
    if (sellerId) {
      filtered = filtered.filter((o) => o.seller_id === sellerId);
    }
    if (buyerId) {
      filtered = filtered.filter((o) => o.buyer_id === buyerId);
    }
    if (buyerPhone) {
      filtered = filtered.filter((o) => o.buyer_phone === buyerPhone);
    }

    // Filter expired accepted offers
    const now = Date.now();
    filtered = filtered.map((o) => {
      if (o.status === "accepted" && o.expires_at && new Date(o.expires_at).getTime() < now) {
        return { ...o, status: "expired" as const };
      }
      return o;
    });

    return NextResponse.json({ offers: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing_id, buyer_name, buyer_phone, offered_price, note, buyer_id } = body;

    if (!listing_id || !buyer_name || !buyer_phone || !offered_price) {
      return NextResponse.json(
        { error: "Listing ID, buyer name, phone number, and offer price are required." },
        { status: 400 }
      );
    }

    const offerNum = Number(offered_price);
    if (isNaN(offerNum) || offerNum <= 0) {
      return NextResponse.json({ error: "Please enter a valid offer amount in KES." }, { status: 400 });
    }

    const supabase = getClient();
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, title, price, seller_id, platform, overall_team_strength, manager_name, seller:profiles!listings_seller_id_fkey(username, phone_number)")
      .eq("id", listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found or no longer active." }, { status: 404 });
    }

    const originalPrice = Number(listing.price);
    const minAllowed = Math.floor(originalPrice * 0.5); // Minimum 50% threshold to prevent spam

    if (offerNum < minAllowed) {
      return NextResponse.json(
        { error: `Offer is too low. Minimum allowed offer is KES ${minAllowed.toLocaleString()} (50% of listing price).` },
        { status: 400 }
      );
    }

    if (offerNum >= originalPrice) {
      return NextResponse.json(
        { error: `Your offer is equal to or higher than the listing price (KES ${originalPrice.toLocaleString()}). You can buy now directly!` },
        { status: 400 }
      );
    }

    const discountPercentage = Math.round(((originalPrice - offerNum) / originalPrice) * 100);
    const offerId = `off_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const normBuyerPhone = normalizePhoneNumber(buyer_phone);
    const internationalBuyerPhone = normBuyerPhone.isValid ? normBuyerPhone.international : buyer_phone.trim();

    const nowIso = new Date().toISOString();

    // 1. Clean DB payload matching exact schema columns of public.listing_offers
    const dbPayload = {
      id: offerId,
      listing_id,
      seller_id: listing.seller_id,
      buyer_id: buyer_id || null,
      buyer_name: buyer_name.trim(),
      buyer_phone: internationalBuyerPhone,
      offered_price: offerNum,
      original_price: originalPrice,
      discount_percentage: discountPercentage,
      status: "pending",
      note: note ? String(note).slice(0, 300) : null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // 2. Persist offer to Supabase
    try {
      const { error: insErr } = await supabase.from("listing_offers").insert(dbPayload);
      if (insErr) {
        console.error("Supabase listing_offers insert error:", insErr);
      }
    } catch (e) {
      console.error("Supabase insert exception:", e);
    }

    const newOffer: ListingOffer = {
      ...dbPayload,
      buyer_id: buyer_id || undefined,
      status: "pending",
      note: note ? String(note).slice(0, 300) : undefined,
      listing: {
        id: listing.id,
        title: listing.title,
        price: originalPrice,
        platform: listing.platform,
        overall_team_strength: listing.overall_team_strength,
        manager_name: listing.manager_name,
      },
    };
    MEMORY_OFFERS.unshift(newOffer);

    // 3. Automated In-App Notification to Seller
    if (listing.seller_id) {
      try {
        await supabase.from("notifications").insert({
          recipient_id: listing.seller_id,
          type: "new_offer",
          title: `New Price Offer: KES ${offerNum.toLocaleString()}`,
          message: `${buyer_name.trim()} offered KES ${offerNum.toLocaleString()} (${discountPercentage}% off) for "${listing.title}". Review, accept, or counter now!`,
          action_url: `/dashboard/seller`,
          is_read: false,
        });
      } catch (notifErr) {
        console.warn("Seller in-app notification error:", notifErr);
      }
    }

    // 4. Automated SMS & Telegram Alert to Seller
    const rawSellerPhone = (listing.seller as any)?.phone_number;
    if (rawSellerPhone) {
      sendSellerOfferReceivedSms(
        rawSellerPhone,
        buyer_name.trim(),
        offerNum,
        originalPrice,
        listing.title,
        listing.id
      ).catch((err) => console.warn("Seller offer SMS failed:", err));
    }

    if (listing.seller_id) {
      notifySellerNewOfferViaTelegram({
        sellerId: listing.seller_id,
        offerId,
        listingId: listing.id,
        listingTitle: listing.title,
        offerAmount: offerNum,
        originalPrice,
        buyerName: buyer_name.trim(),
        note: note || undefined,
      }).catch((err) => console.warn("Seller Telegram offer alert failed:", err));
    }

    // 5. Build optional WhatsApp link for buyer courtesy ping
    const cleanSellerPhone = formatWhatsAppPhone(rawSellerPhone || "254794400365") || "254794400365";
    const waText = encodeURIComponent(
      `Hello! I just submitted an offer of KES ${offerNum.toLocaleString()} (${discountPercentage}% off) for your eFootball squad "${listing.title}" on eFootballMarket.\n\nSquad Link: https://www.efootballmarket.co.ke/listings/${listing.id}\nMy Name: ${buyer_name}\nMy Phone: ${internationalBuyerPhone}\nEscrow Guaranteed via Till 1572931!`
    );
    const whatsappUrl = `https://wa.me/${cleanSellerPhone}?text=${waText}`;

    // Admin WhatsApp alert
    dispatchAdminWhatsAppAlert({
      eventType: "NEW_OFFER_SUBMITTED",
      listingTitle: listing.title,
      amount: offerNum,
      buyerPhone: internationalBuyerPhone,
      details: note || `${discountPercentage}% discount proposed by ${buyer_name}`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      offer: newOffer,
      whatsappUrl,
      message: "Offer submitted successfully! Seller has been alerted automatically.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { offer_id, action, counter_price, seller_note } = body;

    if (!offer_id || !action) {
      return NextResponse.json({ error: "Offer ID and action are required" }, { status: 400 });
    }

    const supabase = getClient();

    // 1. Fetch current offer
    let targetOffer: ListingOffer | null = null;
    try {
      const { data } = await supabase
        .from("listing_offers")
        .select("*, listing:listings(id, title, price)")
        .eq("id", offer_id)
        .maybeSingle();
      if (data) targetOffer = data;
    } catch {
      // Use memory
    }

    if (!targetOffer) {
      targetOffer = MEMORY_OFFERS.find((o) => o.id === offer_id) || null;
    }

    if (!targetOffer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const now = new Date();
    let updatedStatus: ListingOffer["status"] = targetOffer.status;
    let expiresAt: string | undefined = targetOffer.expires_at;
    let finalCounter: number | undefined = targetOffer.counter_price;

    if (action === "accept") {
      updatedStatus = "accepted";
      // 12-hour expiry window for buyer to complete checkout at agreed price
      expiresAt = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();
    } else if (action === "counter") {
      updatedStatus = "countered";
      finalCounter = Number(counter_price);
      if (isNaN(finalCounter) || finalCounter <= 0) {
        return NextResponse.json({ error: "Please enter a valid counter-offer price in KES." }, { status: 400 });
      }
    } else if (action === "decline") {
      updatedStatus = "declined";
    }

    const listingTitle = (targetOffer.listing as any)?.title || "eFootball Squad";
    const checkoutUrl = `/pay/${targetOffer.listing_id}?offer=${targetOffer.id}`;

    // 2. Persist update to Supabase
    try {
      await supabase
        .from("listing_offers")
        .update({
          status: updatedStatus,
          expires_at: expiresAt || null,
          counter_price: finalCounter || null,
          note: seller_note ? String(seller_note).slice(0, 300) : targetOffer.note || null,
          updated_at: now.toISOString(),
        })
        .eq("id", offer_id);
    } catch (e) {
      console.error("Supabase offer update error:", e);
    }

    const updatedOffer: ListingOffer = {
      ...targetOffer,
      status: updatedStatus,
      expires_at: expiresAt,
      counter_price: finalCounter,
      note: seller_note || targetOffer.note,
      updated_at: now.toISOString(),
    };

    const offerIndex = MEMORY_OFFERS.findIndex((o) => o.id === offer_id);
    if (offerIndex !== -1) {
      MEMORY_OFFERS[offerIndex] = updatedOffer;
    } else {
      MEMORY_OFFERS.push(updatedOffer);
    }

    // 3. In-App Notification to Buyer (if registered account)
    if (targetOffer.buyer_id) {
      const notifTitle =
        action === "accept"
          ? "Offer Accepted! Proceed to Checkout"
          : action === "counter"
          ? `Seller Countered: KES ${finalCounter?.toLocaleString()}`
          : "Offer Declined by Seller";

      const notifMessage =
        action === "accept"
          ? `The seller accepted your offer of KES ${targetOffer.offered_price.toLocaleString()} for "${listingTitle}". Checkout window expires in 12 hours!`
          : action === "counter"
          ? `The seller proposed KES ${finalCounter?.toLocaleString()} for "${listingTitle}".${seller_note ? ` Note: "${seller_note}"` : ""}`
          : `The seller declined your offer for "${listingTitle}".${seller_note ? ` Reason: "${seller_note}"` : " You can submit a revised offer."}`;

      try {
        await supabase.from("notifications").insert({
          recipient_id: targetOffer.buyer_id,
          type: "offer_response",
          title: notifTitle,
          message: notifMessage,
          action_url: action === "accept" ? checkoutUrl : `/listings/${targetOffer.listing_id}`,
          is_read: false,
        });
      } catch (e) {
        console.warn("Buyer in-app notification error:", e);
      }
    }

    // 4. Automated SMS Alert to Buyer
    if (targetOffer.buyer_phone) {
      sendBuyerOfferResponseSms(
        targetOffer.buyer_phone,
        action === "accept" ? "accepted" : action === "counter" ? "countered" : "declined",
        action === "counter" ? (finalCounter || 0) : targetOffer.offered_price,
        listingTitle,
        action === "accept" ? checkoutUrl : `/listings/${targetOffer.listing_id}`
      ).catch((err) => console.warn("Buyer offer SMS failed:", err));
    }

    // 5. WhatsApp Courtesy Notification for Buyer
    const cleanBuyerPhone = formatWhatsAppPhone(targetOffer.buyer_phone);
    let buyerWaMessage = "";
    if (action === "accept") {
      buyerWaMessage = encodeURIComponent(
        `Great news ${targetOffer.buyer_name}! Your offer of KES ${targetOffer.offered_price.toLocaleString()} for the eFootball squad was ACCEPTED by the seller on eFootballMarket!\n\nYou have 12 hours to complete checkout via M-Pesa Till 1572931:\nhttps://www.efootballmarket.co.ke${checkoutUrl}`
      );
    } else if (action === "counter") {
      buyerWaMessage = encodeURIComponent(
        `Hello ${targetOffer.buyer_name}, the seller reviewed your offer on eFootballMarket and countered with KES ${finalCounter?.toLocaleString()}.\nReview & accept here: https://www.efootballmarket.co.ke/listings/${targetOffer.listing_id}`
      );
    }

    const buyerWhatsAppUrl = cleanBuyerPhone ? `https://wa.me/${cleanBuyerPhone}?text=${buyerWaMessage}` : null;

    return NextResponse.json({
      success: true,
      offer: updatedOffer,
      checkoutUrl,
      buyerWhatsAppUrl,
      message: `Offer ${action}ed successfully. Buyer has been notified.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
