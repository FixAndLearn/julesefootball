import { Button } from "@/components/ui/Button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OrderService } from "@/services/orderService";
import { ShieldCheck, ShoppingBag, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Order } from "@/types/database";
import { BuyerDashboardView } from "@/components/dashboard/BuyerDashboardView";

export const revalidate = 0;

export default async function BuyerDashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/buyer");
  }

  const orderService = new OrderService(supabase);
  let orders: Order[] = [];

  try {
    orders = await orderService.getUserOrders(user.id, "buyer");
  } catch (error) {
    console.error("Failed to load buyer orders:", error);
  }

  const activeEscrowOrders = orders.filter((o) =>
    ["payment_pending", "escrow_locked", "seller_delivered", "buyer_reviewing"].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* 1. Header & Authority Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pitch-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Purchase History &amp; Active Escrow
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of Safaricom Till 1572931 escrow custody, credential handover, and 24h inspection.
          </p>
        </div>
        <Link href="/browse">
          <Button
            variant="primary"
            size="md"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            + Browse Verified Squads
          </Button>
        </Link>
      </div>

      {/* 2. Elevated Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Orders */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0F1E38] to-[#0A1426] border border-slate-700/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
              Total Purchases
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-white font-display mt-2 block font-mono">
            {orders.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            All marketplace &amp; middleman trades
          </span>
        </div>

        {/* Active in Escrow */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1C1808] via-[#0F1B2E] to-[#0A1426] border border-amber-500/50 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                Active in Escrow
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-amber-300 font-display mt-2 block font-mono">
            {activeEscrowOrders.length}
          </span>
          <span className="text-[11px] text-amber-200/80 mt-1 block">
            Secured in Till 1572931 custody
          </span>
        </div>

        {/* Completed Purchases */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#08201D] via-[#0D1E2A] to-[#0A1426] border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-300 tracking-wider">
              Completed Deals
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-display mt-2 block font-mono">
            {completedOrders.length}
          </span>
          <span className="text-[11px] text-emerald-200/80 mt-1 block">
            Inspected, transferred &amp; bound
          </span>
        </div>
      </div>

      {/* 3. Interactive Escrow Orders Manager */}
      <BuyerDashboardView orders={orders} />
    </div>
  );
}
