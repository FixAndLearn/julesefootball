import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCompactNumber, formatCurrency, getKonamiIdStatusInfo, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListingService } from "@/services/listingService";
import { BuyNowButton } from "@/components/marketplace/BuyNowButton";
import { ListingGallery } from "@/components/marketplace/ListingGallery";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Eye,
  Lock,
  Shield,
  ShieldCheck,
  Star,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

interface ListingDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const supabase = createServerSupabaseClient();
  const listingService = new ListingService(supabase);
  const listing = await listingService.getListingById(params.id);

  if (!listing) {
    notFound();
  }

  const konamiStatus = getKonamiIdStatusInfo(listing.konami_id_status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
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
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Account ID: {listing.id.slice(0, 8)}...</span>
                <span>•</span>
                <span>Region: {listing.region}</span>
                <span>•</span>
                <span>Version: {listing.game_version}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-display">
                {listing.title}
              </h1>
            </div>

            {/* In-Game Resource Counter Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
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
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="block text-[10px] uppercase font-bold text-rose-400">Contract Tickets</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {listing.contract_renewal_tickets}
                </span>
              </div>
            </div>

            {/* Special Player Tiers Count */}
            <div className="p-4 rounded-xl bg-pitch-card/60 border border-pitch-border">
              <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">
                Squad Player Composition
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40">
                  <span className="block text-xs font-semibold text-amber-300">Epics</span>
                  <span className="text-base font-bold text-white">{listing.epic_players_count}</span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/40">
                  <span className="block text-xs font-semibold text-indigo-300">Big Time</span>
                  <span className="text-base font-bold text-white">{listing.big_time_players_count}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
                  <span className="block text-xs font-semibold text-emerald-300">Highlights</span>
                  <span className="text-base font-bold text-white">{listing.highlight_players_count}</span>
                </div>
                <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/40">
                  <span className="block text-xs font-semibold text-purple-300">Featured</span>
                  <span className="text-base font-bold text-white">{listing.featured_players_count}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="block text-xs font-semibold text-slate-300">Legends</span>
                  <span className="text-base font-bold text-white">{listing.legend_players_count}</span>
                </div>
              </div>

              {listing.key_players_list && listing.key_players_list.length > 0 && (
                <div className="mt-3 pt-3 border-t border-pitch-border/60">
                  <span className="block text-[11px] text-slate-400 font-medium mb-1.5">Key Featured Cards:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.key_players_list.map((player, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-amber-200"
                      >
                        {player}
                      </span>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Manager:</span>
                  <span className="font-semibold text-slate-200">{listing.manager_name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Formation:</span>
                  <span className="font-semibold text-slate-200">{listing.formation || "4-3-3"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Playstyle:</span>
                  <span className="font-semibold text-brand-300">{getPlaystyleLabel(listing.primary_playstyle)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Division:</span>
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

            {/* Buy Now Interactive Button */}
            <BuyNowButton
              listingId={listing.id}
              priceFormatted={formatCurrency(listing.price, listing.currency)}
            />

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
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-200">{listing.seller?.username || "Verified Seller"}</span>
                    {listing.seller?.is_verified_seller && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    {(listing.seller?.completed_sales_count || 0) > 0 && listing.seller?.seller_rating ? (
                      <>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{Number(listing.seller.seller_rating).toFixed(1)}</span>
                        <span>•</span>
                        <span>{listing.seller.completed_sales_count} completed orders</span>
                      </>
                    ) : (
                      <span>New Seller • 0 completed orders</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
