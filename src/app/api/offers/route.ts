import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ListingOffer } from "@/types/database";

export const dynamic = "force-dynamic";

// In-memory runtime persistence
const MEMORY_OFFERS: ListingOffer[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get("offerId");
    const listingId = searchParams.get("listingId");
    const sellerId = searchParams.get("sellerId");
    const buyerPhone = searchParams.get("phone");

    // 1. Try fetching from Supabase if table exists
    try {
      const supabase = createAdminClient();
      let query = supabase.from("listing_offers").select("*, listing:listings(id, title, price, platform, overall_team_strength, manager_name)");

      if (offerId) {
        query = query.eq("id", offerId);
      } else if (listingId) {
        query = query.eq("listing_id", listingId);
      } else if (sellerId) {
        query = query.eq("seller_id", sellerId);
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
    } catch {
      // Fallback to in-memory
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

    const supabase = createAdminClient();
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, title, price, seller_id, platform, overall_team_strength, manager_name, seller:profiles(username, phone_number)")
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

    const newOffer: ListingOffer = {
      id: offerId,
      listing_id,
      seller_id: listing.seller_id,
      buyer_id: buyer_id || undefined,
      buyer_name: buyer_name.trim(),
      buyer_phone: buyer_phone.trim().replace(/[^0-9+]/g, ""),
      offered_price: offerNum,
      original_price: originalPrice,
      discount_percentage: discountPercentage,
      status: "pending",
      note: note ? String(note).slice(0, 300) : undefined,
      created_at: new Date().toISOString(),
      listing: {
        id: listing.id,
        title: listing.title,
        price: originalPrice,
        platform: listing.platform,
        overall_team_strength: listing.overall_team_strength,
        manager_name: listing.manager_name,
      },
    };

    // Try saving to Supabase
    try {
      await supabase.from("listing_offers").insert(newOffer);
    } catch {
      // Memory store fallback
    }
    MEMORY_OFFERS.unshift(newOffer);

    // Build pre-filled WhatsApp alert text for buyer to ping seller
    const sellerPhone = (listing.seller as any)?.phone_number || "254794400365";
    const cleanSellerPhone = sellerPhone.replace(/[^0-9]/g, "");
    const waText = encodeURIComponent(
      `Hello! I just submitted an offer of KES ${offerNum.toLocaleString()} (${discountPercentage}% off) for your eFootball squad "${listing.title}" on eFootballMarket.\n\nSquad Link: https://www.efootballmarket.co.ke/listings/${listing.id}\nMy Name: ${buyer_name}\nMy Phone: ${buyer_phone}\nEscrow Guaranteed via Till 1572931!`
    );
    const whatsappUrl = `https://wa.me/${cleanSellerPhone}?text=${waText}`;

    return NextResponse.json({
      success: true,
      offer: newOffer,
      whatsappUrl,
      message: "Offer submitted successfully! Seller will review your proposal.",
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

    const offerIndex = MEMORY_OFFERS.findIndex((o) => o.id === offer_id);
    let targetOffer: ListingOffer | null = offerIndex !== -1 ? MEMORY_OFFERS[offerIndex] : null;

    const supabase = createAdminClient();
    try {
      const { data } = await supabase.from("listing_offers").select("*").eq("id", offer_id).single();
      if (data) targetOffer = data;
    } catch {
      // Use memory
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
      // 12-hour expiry window for buyer to complete checkout at discounted price
      expiresAt = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();
    } else if (action === "counter") {
      updatedStatus = "countered";
      finalCounter = Number(counter_price);
      if (isNaN(finalCounter) || finalCounter <= 0) {
        return NextResponse.json({ error: "Valid counter price required" }, { status: 400 });
      }
    } else if (action === "decline") {
      updatedStatus = "declined";
    }

    const updatedOffer: ListingOffer = {
      ...targetOffer,
      status: updatedStatus,
      expires_at: expiresAt,
      counter_price: finalCounter,
      note: seller_note || targetOffer.note,
      updated_at: now.toISOString(),
    };

    if (offerIndex !== -1) {
      MEMORY_OFFERS[offerIndex] = updatedOffer;
    } else {
      MEMORY_OFFERS.push(updatedOffer);
    }

    try {
      await supabase.from("listing_offers").update(updatedOffer).eq("id", offer_id);
    } catch {
      // memory fallback
    }

    // Generate direct fast checkout link for accepted offer
    const checkoutUrl = `/pay/${updatedOffer.listing_id}?offer=${updatedOffer.id}`;

    // Generate WhatsApp notification to buyer
    const cleanBuyerPhone = updatedOffer.buyer_phone.replace(/[^0-9]/g, "");
    let buyerWaMessage = "";
    if (action === "accept") {
      buyerWaMessage = encodeURIComponent(
        `Great news ${updatedOffer.buyer_name}! Your offer of KES ${updatedOffer.offered_price.toLocaleString()} for the eFootball squad was ACCEPTED by the seller on eFootballMarket!\n\nYou have 12 hours to complete checkout via M-Pesa Till 1572931:\nhttps://www.efootballmarket.co.ke${checkoutUrl}`
      );
    } else if (action === "counter") {
      buyerWaMessage = encodeURIComponent(
        `Hello ${updatedOffer.buyer_name}, the seller reviewed your offer on eFootballMarket and countered with KES ${finalCounter?.toLocaleString()}.\nCheck details here: https://www.efootballmarket.co.ke/listings/${updatedOffer.listing_id}`
      );
    }

    const buyerWhatsAppUrl = cleanBuyerPhone ? `https://wa.me/${cleanBuyerPhone}?text=${buyerWaMessage}` : null;

    return NextResponse.json({
      success: true,
      offer: updatedOffer,
      checkoutUrl,
      buyerWhatsAppUrl,
      message: `Offer ${action}ed successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
