import { Badge } from "@/components/ui/Badge";
import { formatCompactNumber, formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { Listing } from "@/types/database";
import { ShieldCheck, Star, Trophy, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const primaryImage = listing.images?.find((img) => img.is_primary)?.image_url || listing.images?.[0]?.image_url;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block bg-pitch-surface/90 border border-pitch-border rounded-2xl overflow-hidden hover:border-brand-500/80 transition-all duration-300 hover:shadow-xl hover:shadow-brand-950/40 relative flex flex-col"
    >
      {/* Media Header / Image */}
      <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={true}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-600">
            <Trophy className="w-12 h-12 stroke-[1.5] mb-1" />
            <span className="text-xs uppercase tracking-wider font-semibold">Account Preview</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-pitch-card via-transparent to-black/60 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <Badge variant="brand" size="sm" className="font-semibold shadow-md">
            {getPlatformLabel(listing.platform)}
          </Badge>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-bold text-amber-300">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>OVR {listing.overall_team_strength}</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-200">
              Div {listing.current_division}
            </div>
          </div>
        </div>

        {/* Bottom Playstyle Chip & Image Count on Image */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-[11px] font-medium text-slate-200 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/60">
            {getPlaystyleLabel(listing.primary_playstyle)}
          </span>
          {listing.images && listing.images.length > 1 && (
            <span className="text-[10px] font-semibold text-slate-200 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
              📷 {listing.images.length} photos
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-slate-100 text-base line-clamp-1 group-hover:text-brand-300 transition-colors">
            {listing.title}
          </h3>

          {/* Special Cards Highlights */}
          <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-pitch-card/70 border border-pitch-border/50 text-center">
            <div>
              <span className="block text-[10px] uppercase font-bold text-amber-400">Epics</span>
              <span className="text-xs font-semibold text-slate-100">{listing.epic_players_count}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-indigo-400">Coins</span>
              <span className="text-xs font-semibold text-slate-100">{formatCompactNumber(listing.coin_balance)}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-emerald-400">GP</span>
              <span className="text-xs font-semibold text-slate-100">{formatCompactNumber(listing.gp_balance)}</span>
            </div>
          </div>
        </div>

        {/* Seller Info & Price Footer */}
        <div className="mt-4 pt-3 border-t border-pitch-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {listing.seller?.username ? listing.seller.username.slice(0, 2).toUpperCase() : <Users className="w-3.5 h-3.5" />}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-300">{listing.seller?.username || "Verified Seller"}</span>
                {listing.seller?.is_verified_seller && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                {(listing.seller?.completed_sales_count || 0) > 0 && listing.seller?.seller_rating ? (
                  <>
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span>{Number(listing.seller.seller_rating).toFixed(1)}</span>
                    <span>({listing.seller.completed_sales_count} sales)</span>
                  </>
                ) : (
                  <span>New Seller (0 sales)</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase font-medium">Escrow Price</span>
            <span className="text-base font-bold text-emerald-400 font-display">
              {formatCurrency(listing.price, listing.currency)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
