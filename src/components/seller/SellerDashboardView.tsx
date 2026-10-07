"use client";

import { WithdrawModal } from "@/components/seller/WithdrawModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import { Listing, Order } from "@/types/database";
import { ArrowRight, ArrowUpRight, Edit3, PlusCircle, ShieldCheck, Star, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface SellerDashboardViewProps {
  sellerProfile: {
    available_balance: number;
    escrow_balance: number;
    completed_sales_count: number;
    seller_rating: number;
    is_verified_seller: boolean;
  };
  listings: Listing[];
  pendingOrders: Order[];
}

export function SellerDashboardView({
  sellerProfile,
  listings,
  pendingOrders,
}: SellerDashboardViewProps) {
  const router = useRouter();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Top Financial Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg">
          <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
            Available to Withdraw
          </span>
          <span className="text-3xl font-bold text-emerald-400 font-display mt-2 block font-mono">
            {formatCurrency(sellerProfile.available_balance)}
          </span>
          <Button
            variant="gold"
            size="sm"
            className="mt-3 w-full"
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={sellerProfile.available_balance < 10 && sellerProfile.escrow_balance <= 0}
          >
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Withdraw M-Pesa
          </Button>
        </div>

        <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg">
          <span className="block text-xs uppercase font-bold text-amber-400 tracking-wider">
            Locked in Escrow
          </span>
          <span className="text-3xl font-bold text-amber-400 font-display mt-2 block font-mono">
            {formatCurrency(sellerProfile.escrow_balance)}
          </span>
          <span className="text-[11px] text-slate-400 mt-3 block">
            Released automatically after buyer confirmation
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg">
          <span className="block text-xs uppercase font-bold text-indigo-400 tracking-wider">
            Completed Sales
          </span>
          <span className="text-3xl font-bold text-white font-display mt-2 block">
            {sellerProfile.completed_sales_count}
          </span>
          <span className="text-[11px] text-slate-400 mt-3 block">
            Total successful transfers
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg">
          <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
            Seller Rating
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-bold text-white font-display">
              {sellerProfile.seller_rating > 0
                ? Number(sellerProfile.seller_rating).toFixed(1)
                : "New"}
            </span>
            {sellerProfile.seller_rating > 0 && (
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-300">
            {sellerProfile.is_verified_seller ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified Seller
              </span>
            ) : (
              <Link href="/seller/verification" className="text-amber-400 hover:underline text-[11px]">
                Submit KYC Verification →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Action Required: Orders Awaiting Credential Delivery */}
      {pendingOrders.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h2 className="text-base font-bold text-amber-200 font-display">
              Action Required: {pendingOrders.length} Order(s) Awaiting Credential Delivery
            </h2>
          </div>

          <div className="divide-y divide-amber-900/40">
            {pendingOrders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    Order #{order.order_number}
                  </span>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {order.listing?.title}
                  </p>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="gold" size="sm">
                    Deliver Credentials Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seller Listings */}
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 font-display">
            Your Listed Accounts ({listings.length})
          </h2>
          <Link href="/seller/create-listing">
            <Button variant="primary" size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Create New Listing
            </Button>
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="divide-y divide-pitch-border/60">
            {listings.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-pitch-card/40 px-3 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === "published" ? "success" : "default"} size="sm">
                      {item.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-400">{getPlatformLabel(item.platform)}</span>
                    <span className="text-xs text-slate-400">• OVR {item.overall_team_strength}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mt-1">{item.title}</h3>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-base font-bold text-emerald-400 font-display font-mono mr-2">
                    {formatCurrency(item.price, item.currency)}
                  </span>
                  <Link href={`/seller/edit-listing/${item.id}`}>
                    <Button variant="gold" size="sm">
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/listings/${item.id}`}>
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No listings yet"
            description="You haven't listed any eFootball accounts for sale yet. Publish your squad to reach thousands of buyers."
            actionLabel="Create Account Listing"
            actionHref="/seller/create-listing"
          />
        )}
      </div>

      <WithdrawModal
        availableBalance={sellerProfile.available_balance}
        escrowBalance={sellerProfile.escrow_balance}
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
