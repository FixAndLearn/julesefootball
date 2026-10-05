import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OrderService } from "@/services/orderService";
import { ArrowRight, Clock, ShieldCheck, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Order } from "@/types/database";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Buyer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your escrow purchases, credential releases, and account deliveries.
          </p>
        </div>
        <Link href="/browse">
          <Button variant="primary" size="md">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Browse Accounts
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg">
          <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
            Total Orders
          </span>
          <span className="text-3xl font-bold text-white font-display mt-2 block">
            {orders.length}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg">
          <span className="block text-xs uppercase font-bold text-amber-400 tracking-wider">
            Active in Escrow
          </span>
          <span className="text-3xl font-bold text-amber-400 font-display mt-2 block">
            {activeEscrowOrders.length}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border shadow-lg">
          <span className="block text-xs uppercase font-bold text-emerald-400 tracking-wider">
            Completed Purchases
          </span>
          <span className="text-3xl font-bold text-emerald-400 font-display mt-2 block">
            {completedOrders.length}
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 font-display">
          Purchase History & Active Escrow
        </h2>

        {orders.length > 0 ? (
          <div className="divide-y divide-pitch-border/60">
            {orders.map((order) => (
              <div
                key={order.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-pitch-card/40 px-3 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-400">
                      #{order.order_number}
                    </span>
                    <Badge variant="brand" size="sm">
                      {order.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mt-1">
                    {order.listing?.title || "eFootball Account"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{order.listing?.platform ? getPlatformLabel(order.listing.platform) : "Platform"}</span>
                    <span>•</span>
                    <span>OVR {order.listing?.overall_team_strength}</span>
                    <span>•</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-base font-bold text-emerald-400 font-display">
                      {formatCurrency(order.total_amount, order.currency)}
                    </span>
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="secondary" size="sm">
                      <span>View Escrow</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="No purchases yet"
            description="You have not purchased any eFootball accounts yet. Explore verified listings and checkout with automated M-Pesa escrow protection."
            actionLabel="Browse Marketplace"
            actionHref="/browse"
          />
        )}
      </div>
    </div>
  );
}
