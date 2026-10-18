import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCompactNumber, formatCurrency, getKonamiIdStatusInfo, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { formatWhatsAppPhone } from "@/lib/utils/phone";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { Listing } from "@/types/database";
import { BuyNowButton } from "@/components/marketplace/BuyNowButton";
import { ListingGallery } from "@/components/marketplace/ListingGallery";
import { WhatsAppShareButton } from "@/components/marketplace/WhatsAppShareButton";
import { VerifiedSellerBadge } from "@/components/marketplace/VerifiedSellerBadge";
import { FlyerTriggerButton } from "@/components/seller/FlyerTriggerButton";
import { MakeOfferButton } from "@/components/marketplace/MakeOfferButton";
import { FastBuyLinkButton } from "@/components/marketplace/FastBuyLinkButton";
import { SellerListingOffersPanel } from "@/components/marketplace/SellerListingOffersPanel";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ListingCard3D } from "@/components/marketplace/ListingCard3D";
import { AdBanner } from "@/components/common/AdBanner";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Edit3,
  Eye,
  Lock,
  Shield,
  ShieldCheck,
  Star,
  Swords,
  Trophy,
  Users,
  Zap,
  ArrowRightLeft,
  MessageCircle,
  Building2,
  Sparkles,
  Flame,
} from "lucide-react";
import { isListingOnFlashSale, getFlashSalePricing } from "@/lib/utils/flashSale";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 0;

interface ListingDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await Promise.resolve(params);
    const supabase = createServerSupabaseClient();
    const listingService = new ListingService(supabase);
    const listing = await listingService.getListingById(resolvedParams.id);

    if (!listing) {
      return {
        title: "Account Listing | eFootballMarket",
      };
    }

    const primaryImage =
      listing.images?.find((img) => img.is_primary)?.image_url ||
      listing.images?.[0]?.image_url ||
      "/og-image.svg";

    const title = `${listing.title} | eFootballMarket`;
    const description = `Buy verified ${listing.overall_team_strength} OVR eFootball account for ${formatCurrency(
      listing.price
    )}. Includes ${listing.epic_players_count} Epics, ${listing.coin_balance} Coins, and automated Safaricom M-Pesa escrow protection.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: [
          {
            url: primaryImage,
            alt: listing.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [primaryImage],
      },
    };
  } catch {
    return {
      title: "Account Listing | eFootballMarket",
    };
  }
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const listingService = new ListingService(supabase);
  const listing = await listingService.getListingById(params.id);

  if (!listing) {
    notFound();
  }

  // Fetch real related listings from the database (zero demo data)
  let relatedListings: Listing[] = [];
  try {
    const relatedResult = await listingService.getListings({
      platform: listing.platform,
      limit: 6,
    });
    relatedListings = (relatedResult.listings || []).filter((l) => l.id !== listing.id).slice(0, 3);
  } catch (err) {
    console.error("Error fetching related listings:", err);
  }

  const isOwner = Boolean(user && listing.seller_id === user.id);
  const konamiStatus = getKonamiIdStatusInfo(listing.konami_id_status);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Browse Squads", url: "/browse" },
    { name: listing.title, url: `/listings/${listing.id}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 w-full space-y-8">
      <ProductJsonLd listing={listing} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Semantic Breadcrumbs & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-pitch-border/60">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <Link href="/" className="hover:text-slate-200 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-slate-200 transition-colors">
            Browse Squads
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold truncate max-w-[240px] sm:max-w-md">
            {listing.title}
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </Link>
          {isOwner && (
            <Link href={`/seller/edit-listing/${listing.id}`}>
              <Button variant="gold" size="sm">
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit Listing
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Gallery & In-Depth Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visual Banner / Screenshots with HD Lossless Viewer & Lightbox */}
          <ListingGallery
            images={listing.images || []}
            title={listing.title}
            platform={listing.platform}
            overallTeamStrength={listing.overall_team_strength}
          />


          {/* Title & Key Attributes */}
          <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 flex-wrap">
                <span>Account ID: <span className="font-mono text-slate-300">{listing.id.slice(0, 8)}</span></span>
                <span className="text-slate-600">/</span>
                <span>Region: <span className="text-slate-300">{listing.region || "Global"}</span></span>
                <span className="text-slate-600">/</span>
                <span>Version: <span className="text-slate-300">{listing.game_version || "eFootball 2026"}</span></span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-display">
                {listing.title}
              </h1>
            </div>

            {/* In-Game Resource Counter Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="block text-[10px] uppercase font-bold text-amber-400">eFootball Coins</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {formatCompactNumber(listing.coin_balance)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="block text-[10px] uppercase font-bold text-emerald-400">GP Balance</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {formatCompactNumber(listing.gp_balance)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="block text-[10px] uppercase font-bold text-indigo-400">ePoints</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {formatCompactNumber(listing.efootball_points)}
                </span>
              </div>
            </div>

            {/* Special Player Tiers Count */}
            <div className="p-4 sm:p-5 rounded-2xl bg-pitch-card/70 border border-pitch-border shadow-xl">
              <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">
                Squad Player Composition
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 rounded-xl bg-gradient-to-b from-amber-500/20 via-yellow-600/15 to-amber-950/40 border border-amber-400/60 shadow-lg shadow-amber-500/10 transition-transform hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase text-amber-300">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Epics</span>
                  </div>
                  <span className="text-2xl font-black text-amber-100 font-mono mt-1 block">
                    {listing.epic_players_count}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-b from-purple-500/20 via-fuchsia-600/15 to-indigo-950/40 border border-purple-400/60 shadow-lg shadow-purple-500/10 transition-transform hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase text-purple-300">
                    <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                    <span>Big Time</span>
                  </div>
                  <span className="text-2xl font-black text-purple-100 font-mono mt-1 block">
                    {listing.big_time_players_count}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-b from-emerald-500/20 via-teal-600/15 to-emerald-950/40 border border-emerald-400/60 shadow-lg shadow-emerald-500/10 transition-transform hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase text-emerald-300">
                    <Star className="w-3 h-3 text-emerald-400" />
                    <span>Highlights</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-100 font-mono mt-1 block">
                    {listing.highlight_players_count}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-b from-sky-500/15 via-blue-600/10 to-slate-900/40 border border-sky-400/50 transition-transform hover:scale-[1.02]">
                  <span className="block text-[11px] font-bold uppercase text-sky-300">Featured</span>
                  <span className="text-2xl font-black text-sky-100 font-mono mt-1 block">
                    {listing.featured_players_count}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-b from-slate-700/30 to-slate-900/50 border border-slate-600/60 transition-transform hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase text-slate-300">
                    <Trophy className="w-3 h-3 text-slate-400" />
                    <span>Legends</span>
                  </div>
                  <span className="text-2xl font-black text-slate-200 font-mono mt-1 block">
                    {listing.legend_players_count}
                  </span>
                </div>
              </div>

              {listing.key_players_list && listing.key_players_list.length > 0 && (
                <div className="mt-4 pt-4 border-t border-pitch-border/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                      Key Featured Squad Cards
                    </span>
                    <span className="text-[11px] text-amber-400/90 font-medium">
                      {listing.key_players_list.length} showcased
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {listing.key_players_list.map((player, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/50 text-xs font-bold text-amber-200 shadow-sm shadow-amber-500/10 hover:border-amber-400 transition-all"
                      >
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{player}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tactical Blueprint & Division Record */}
            <div className="p-4 rounded-xl bg-pitch-card/60 border border-pitch-border space-y-3">
              <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Tactical Profile & Division Standing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Manager:</span>
                  <span className="font-semibold text-slate-200">{listing.manager_name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Playstyle:</span>
                  <span className="font-semibold text-brand-300">{getPlaystyleLabel(listing.primary_playstyle)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Division Standing:</span>
                  <span className="font-semibold text-emerald-400">Div {listing.current_division} (Best: Div {listing.highest_division})</span>
                </div>
              </div>
            </div>

            {/* Account Description */}
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Seller Account Description</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-pitch-card/40 p-4 rounded-xl border border-pitch-border/40">
                {listing.description}
              </p>
            </div>

            {/* Buyer Inspection & Konami ID Security Protocol */}
            <div className="pt-4 border-t border-pitch-border/60 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  24-Hour Inspection & Account Security Protocol
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-pitch-card/60 border border-pitch-border space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-[10px] font-black">1</span>
                    Verify Roster & Strength
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Log in and confirm all {listing.overall_team_strength} OVR players, Epic cards, coins, and GP match this listing description exactly.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-pitch-card/60 border border-pitch-border space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-[10px] font-black">2</span>
                    Rebind Registered Email
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Navigate to my.konami.net, change the registered email to your own, and confirm the verification link sent by Konami.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-pitch-card/60 border border-pitch-border space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-[10px] font-black">3</span>
                    Activate 2-Step Verification
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Turn on Two-Factor Authentication via Google Authenticator or SMS to lock out any previous devices permanently.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-pitch-card/60 border border-pitch-border space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-[10px] font-black">4</span>
                    Release Funds or Dispute
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Confirm delivery in your order dashboard or tap Open Dispute before the 24-hour timer expires to halt payout.
                  </p>
                </div>
              </div>

              {/* Authority Escrow Seal */}
              <div className="p-3.5 rounded-xl bg-[#090D16] border border-[#1F2937] flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Escrow Cleared via Till 1572931 | Governed by Brian Okibo, CEO</span>
                </div>
                <Link href="/escrow-guarantee" className="text-[#22C55E] hover:underline font-semibold shrink-0">
                  Read Escrow Terms &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Buy & Escrow Checkout Widget (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Price & Buy Now Card */}
          <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-2xl space-y-5 sticky top-20">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Escrow Purchase Price
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white font-display">
                  {formatCurrency(listing.price, listing.currency)}
                </span>
                <span className="text-xs font-semibold text-emerald-400">Fixed Escrow</span>
              </div>
            </div>

            {/* Konami ID Transfer Safety Rating */}
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">{konamiStatus.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {konamiStatus.description}
              </p>
            </div>

            {/* Buy Now or Edit Interactive Button */}
            {isOwner ? (
              <div className="space-y-4">
                <Link href={`/seller/edit-listing/${listing.id}`} className="block">
                  <Button variant="gold" size="lg" className="w-full">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit This Listing
                  </Button>
                </Link>

                {/* Seller Offers Management Panel */}
                <SellerListingOffersPanel listingId={listing.id} />

                <p className="text-[11px] text-center text-slate-400">
                  You own this listing. Buyers see the Buy Now and Make Offer buttons.
                </p>
              </div>
            ) : listing.status !== "published" ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {listing.status === "sold" ? "Account Sold & Delivered" : "Locked in Active Escrow"}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {listing.status === "sold"
                    ? "This squad was successfully delivered to a verified buyer."
                    : "A buyer has deposited funds into Till 1572931 and 24-hour verification is in progress."}
                </p>
                <Link href="/browse" className="inline-block pt-1">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Browse Other Verified Squads &rarr;
                  </Button>
                </Link>
              </div>
            ) : isListingOnFlashSale(listing) ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2.5 shadow-md">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Friday Flash Drop Price Locked</span>
                    <span className="text-[11px] text-amber-200/90 leading-tight block mt-0.5">
                      Bargaining is withdrawn. Price is locked at maximum flash drop discount for immediate checkout.
                    </span>
                  </div>
                </div>
                <BuyNowButton
                  listingId={listing.id}
                  priceFormatted={formatCurrency(listing.price, listing.currency)}
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                <BuyNowButton
                  listingId={listing.id}
                  priceFormatted={formatCurrency(listing.price, listing.currency)}
                />
                <MakeOfferButton listing={listing} />
              </div>
            )}

            {/* Account Swap + Cash Offer Box (Withdrawn during Flash Sales, Escrow Locks & For Owner) */}
            {listing.allows_swap && !isOwner && !isListingOnFlashSale(listing) && listing.status === "published" && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Account Swap + Cash Welcome!</span>
                </div>
                {listing.swap_preferences && (
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Seller preferences: <em>"{listing.swap_preferences}"</em>
                  </p>
                )}
                <a
                  href={`https://wa.me/${formatWhatsAppPhone(listing.seller?.phone_number || "254794400365")}?text=${encodeURIComponent(
                    `Hello ${listing.seller?.username || "Seller"}, I saw your listing "${listing.title}" on eFootballMarket. I want to propose an Account Swap + Cash deal!\nEscrow will be held via Till 1572931: https://www.efootballmarket.co.ke/listings/${listing.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Propose Swap to Seller</span>
                </a>
              </div>
            )}

            {/* 1-Click WhatsApp Share, Fast Buy Link & Promo Flyer Tools */}
            <div className="pt-2 space-y-2">
              <FastBuyLinkButton
                listingId={listing.id}
                listingTitle={listing.title}
                price={Number(listing.price)}
              />
              <WhatsAppShareButton listing={listing} />
              <FlyerTriggerButton listing={listing} />
            </div>

            {/* Escrow Guarantee Bullets */}
            <div className="border-t border-pitch-border/60 pt-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Funds held safely in escrow until you verify account login.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant automated M-Pesa STK push confirmation.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>24-Hour full dispute window with platform moderation.</span>
              </div>
            </div>

            {/* Seller Trust Card */}
            <div className="border-t border-pitch-border/60 pt-4">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                Seller Information
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
                  {listing.seller?.username ? listing.seller.username.slice(0, 2).toUpperCase() : <Users className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-200">{listing.seller?.username || "Verified Seller"}</span>
                    <VerifiedSellerBadge seller={listing.seller} size="sm" showPopover={true} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    {(listing.seller?.completed_sales_count || 0) > 0 && listing.seller?.seller_rating ? (
                      <>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{Number(listing.seller.seller_rating).toFixed(1)}</span>
                        <span className="text-slate-600">/</span>
                        <span>{listing.seller.completed_sales_count} completed orders</span>
                      </>
                    ) : (
                      <span>New Seller (0 completed orders)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google-Compliant In-Content AdSense Slot */}
      <div className="pt-2">
        <AdBanner slot="listing_detail_bottom" format="horizontal" />
      </div>

      {/* Similar Verified Squads Section (Zero Demo Data) */}
      {relatedListings.length > 0 && (
        <section className="pt-6 border-t border-pitch-border/60 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Marketplace Recommendations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                Similar Verified Accounts
              </h2>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#22C55E] hover:underline"
            >
              <span>View All Squads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedListings.map((relListing) => (
              <ListingCard3D key={relListing.id} listing={relListing} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Thumb-Zone Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-pitch/95 backdrop-blur-xl border-t border-pitch-border/90 px-4 py-3 lg:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Price</p>
          <p className="text-lg font-black font-mono text-emerald-400 truncate">
            {formatCurrency(listing.price, listing.currency)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOwner ? (
            <Link href={`/seller/edit-listing/${listing.id}`}>
              <Button variant="gold" size="sm">
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit Listing
              </Button>
            </Link>
          ) : listing.status !== "published" ? (
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-400">
              {listing.status === "sold" ? "Sold" : "In Escrow"}
            </span>
          ) : isListingOnFlashSale(listing) ? (
            <BuyNowButton
              listingId={listing.id}
              priceFormatted={formatCurrency(listing.price, listing.currency)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <MakeOfferButton listing={listing} size="sm" />
              <BuyNowButton
                listingId={listing.id}
                priceFormatted={formatCurrency(listing.price, listing.currency)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
