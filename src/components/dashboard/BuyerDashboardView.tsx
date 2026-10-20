"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  KeyRound,
  ArrowRight,
  Copy,
  Check,
  Search,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Order, OrderStatus } from "@/types/database";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface BuyerDashboardViewProps {
  orders: Order[];
}

export function BuyerDashboardView({ orders }: BuyerDashboardViewProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const activeOrders = orders.filter((o) =>
    ["payment_pending", "escrow_locked", "seller_delivered", "buyer_reviewing"].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === "completed");

  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (filter === "active") {
      if (!["payment_pending", "escrow_locked", "seller_delivered", "buyer_reviewing"].includes(order.status)) {
        return false;
      }
    } else if (filter === "completed") {
      if (order.status !== "completed") return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = order.order_number?.toLowerCase().includes(q);
      const matchTitle = order.listing?.title?.toLowerCase().includes(q);
      const matchStatus = order.status?.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchStatus) return false;
    }

    return true;
  });

  const handleCopyOrderNumber = (e: React.MouseEvent, num: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedOrderId(num);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Status visual configurations
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "payment_pending":
        return {
          label: "Awaiting M-Pesa Payment",
          badgeClass: "bg-amber-500/15 border-amber-400/40 text-amber-300 ring-1 ring-amber-400/20",
          icon: CreditCard,
          stepIndex: 1,
          stepNote: "STK prompt pending on your Safaricom phone",
          actionLabel: "Complete Payment",
          actionVariant: "primary" as const,
        };
      case "escrow_locked":
        return {
          label: "Funds Locked in Till 1572931",
          badgeClass: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300 ring-1 ring-emerald-400/20",
          icon: ShieldCheck,
          stepIndex: 2,
          stepNote: "Payment secured. Awaiting seller Konami ID delivery",
          actionLabel: "Open Escrow Room",
          actionVariant: "primary" as const,
        };
      case "seller_delivered":
      case "buyer_reviewing":
        return {
          label: "24h Inspection Window Active",
          badgeClass: "bg-cyan-500/15 border-cyan-400/40 text-cyan-300 ring-1 ring-cyan-400/20 animate-pulse",
          icon: Clock,
          stepIndex: 3,
          stepNote: "Credentials delivered. Inspect squad on device & bind email",
          actionLabel: "Inspect & Release",
          actionVariant: "primary" as const,
        };
      case "completed":
        return {
          label: "Verified & Handed Over",
          badgeClass: "bg-emerald-950/80 border-emerald-600/60 text-emerald-300",
          icon: CheckCircle2,
          stepIndex: 4,
          stepNote: "Account secured. Funds disbursed to seller via Till 1572931",
          actionLabel: "View Escrow Receipt",
          actionVariant: "secondary" as const,
        };
      case "disputed":
        return {
          label: "Dispute in Arbitration",
          badgeClass: "bg-rose-500/15 border-rose-400/40 text-rose-300",
          icon: AlertTriangle,
          stepIndex: 3,
          stepNote: "Administrator Brian Okibo mediating credential audit",
          actionLabel: "View Dispute Case",
          actionVariant: "secondary" as const,
        };
      default:
        return {
          label: status.replace("_", " ").toUpperCase(),
          badgeClass: "bg-slate-800 border-slate-700 text-slate-300",
          icon: ShieldCheck,
          stepIndex: 1,
          stepNote: "Status updating...",
          actionLabel: "View Order",
          actionVariant: "secondary" as const,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Interactive Tab Filters & Instant Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-pitch-border/60">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filter === "all"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-pitch-surface border border-pitch-border text-slate-300 hover:text-white hover:bg-pitch-card"
            }`}
          >
            <span>All Purchases</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filter === "active"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-pitch-surface border border-pitch-border text-slate-300 hover:text-white hover:bg-pitch-card"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Active in Escrow</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {activeOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filter === "completed"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-pitch-surface border border-pitch-border text-slate-300 hover:text-white hover:bg-pitch-card"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {completedOrders.length}
            </span>
          </button>
        </div>

        {/* Quick Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by #EFM or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-pitch-card border border-pitch-border rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
          />
        </div>
      </div>

      {/* 2. Enhanced Order Cards */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const primaryImage =
              order.listing?.images?.find((img) => img.is_primary)?.image_url ||
              order.listing?.images?.[0]?.image_url ||
              null;

            const isPendingPayment = order.status === "payment_pending";

            return (
              <div
                key={order.id}
                className="rounded-3xl bg-gradient-to-br from-[#0D192E] via-[#081224] to-[#0D192E] border border-slate-800/90 hover:border-emerald-500/40 p-5 sm:p-6 shadow-2xl transition-all space-y-5 relative overflow-hidden group"
              >
                {/* Stadium Accent Glow */}
                <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/5 blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

                {/* Top Row: Order Code, Timestamp & Dynamic Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <span>#{order.order_number}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyOrderNumber(e, order.order_number)}
                        className="text-emerald-400 hover:text-white transition-colors"
                        title="Copy Order Number"
                      >
                        {copiedOrderId === order.order_number ? (
                          <Check className="w-3 h-3 text-emerald-300" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(order.created_at).toLocaleDateString("en-KE", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.badgeClass} self-start sm:self-auto`}>
                    <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Middle Row: Squad Thumbnail + Rich Specs */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Left: Squad Thumbnail */}
                  <div className="md:col-span-8 flex items-start gap-4">
                    <div className="relative w-24 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 shrink-0 shadow-md">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={order.listing?.title || "eFootball Squad"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0F1E38] to-[#0A1426] text-emerald-400">
                          <ShieldCheck className="w-6 h-6 mb-1 opacity-80" />
                          <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Squad</span>
                        </div>
                      )}

                      {/* OVR Pill Badge over image */}
                      {order.listing?.overall_team_strength && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs border border-amber-400/50 text-amber-300 font-mono font-black text-[10px]">
                          ⚡ {order.listing.overall_team_strength}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-base sm:text-lg font-bold text-white hover:text-emerald-300 transition-colors line-clamp-1 font-display"
                      >
                        {order.listing?.title || "eFootball Mobile Account"}
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {order.listing?.platform && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                            {getPlatformLabel(order.listing.platform)}
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Till 1572931 Escrow
                        </span>

                        {order.seller?.username && (
                          <span className="text-slate-400 text-[11px]">
                            Seller: <strong className="text-slate-300 font-medium">@{order.seller.username}</strong>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 italic">
                        {statusConfig.stepNote}
                      </p>
                    </div>
                  </div>

                  {/* Right: Settlement Price & Actions */}
                  <div className="md:col-span-4 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Settled via Escrow
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight block">
                        {formatCurrency(order.total_amount, order.currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/orders/${order.id}`}>
                        <Button
                          variant={statusConfig.actionVariant}
                          size="sm"
                          className={
                            isPendingPayment
                              ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20"
                          }
                        >
                          <span>{statusConfig.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: 4-Step Escrow Pipeline Stepper */}
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    {/* Step 1: M-Pesa Deposit */}
                    <div className={`p-2 rounded-xl border transition-all ${
                      statusConfig.stepIndex >= 1
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-900/50 border-slate-800 text-slate-500"
                    }`}>
                      <span className="block font-bold">1. M-Pesa Deposit</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Till 1572931</span>
                    </div>

                    {/* Step 2: Credential Handover */}
                    <div className={`p-2 rounded-xl border transition-all ${
                      statusConfig.stepIndex >= 2
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-900/50 border-slate-800 text-slate-500"
                    }`}>
                      <span className="block font-bold">2. Handover</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Konami ID Vault</span>
                    </div>

                    {/* Step 3: 24h Inspection */}
                    <div className={`p-2 rounded-xl border transition-all ${
                      statusConfig.stepIndex >= 3
                        ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-300"
                        : "bg-slate-900/50 border-slate-800 text-slate-500"
                    }`}>
                      <span className="block font-bold">3. 24h Inspection</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Bind &amp; Secure</span>
                    </div>

                    {/* Step 4: Payout Released */}
                    <div className={`p-2 rounded-xl border transition-all ${
                      statusConfig.stepIndex >= 4
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-900/50 border-slate-800 text-slate-500"
                    }`}>
                      <span className="block font-bold">4. Released</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Final Payout</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 rounded-3xl bg-pitch-surface border border-pitch-border text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No purchases found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try clearing your search.`
              : "You do not have any orders matching this tab filter."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-xs"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
