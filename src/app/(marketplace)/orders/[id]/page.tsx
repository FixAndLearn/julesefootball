import { OrderChatBox } from "@/components/chat/OrderChatBox";
import { OrderEscrowController } from "@/components/escrow/OrderEscrowController";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, getPlatformLabel } from "@/lib/utils";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MessageService } from "@/services/messageService";
import { OrderService } from "@/services/orderService";
import { ArrowLeft, Clock, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const revalidate = 0;

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/orders/${params.id}`);
  }

  const adminSupabase = createAdminClient();
  const serviceRoleConfigured = hasServiceRoleKey();
  const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;

  const orderService = new OrderService(primaryClient);
  const order = await orderService.getOrderById(params.id);

  if (!order) {
    notFound();
  }

  // Ensure user is buyer or seller
  if (order.buyer_id !== user.id && order.seller_id !== user.id) {
    redirect("/dashboard/buyer");
  }

  const isBuyer = order.buyer_id === user.id;

  // Fetch or initialize order conversation
  const messageService = new MessageService(primaryClient);

  const conversation = await messageService.getOrCreateOrderConversation(
    order.id,
    order.buyer_id,
    order.seller_id
  );
  const messages = await messageService.getMessages(conversation.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Navigation & Order Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href={isBuyer ? "/dashboard/buyer" : "/dashboard/seller"}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Order #{order.order_number}
            </h1>
            <Badge variant="brand" size="sm">
              {order.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4" />
          <span>Created {new Date(order.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Escrow Lifecycle & Controls (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <OrderEscrowController order={order} currentUserId={user.id} />

          {/* Account Overview Summary */}
          {order.listing && (
            <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Target Account Overview
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-pitch-card border border-pitch-border">
                <div>
                  <h4 className="text-base font-bold text-slate-100">{order.listing.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{getPlatformLabel(order.listing.platform)}</span>
                    <span>•</span>
                    <span>OVR {order.listing.overall_team_strength}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Escrow Amount</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-display">
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Secure Chat & Audit (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <OrderChatBox
            conversationId={conversation.id}
            currentUserId={user.id}
            initialMessages={messages}
            orderId={order.id}
            orderNumber={order.order_number}
            orderStatus={order.status}
            isBuyer={isBuyer}
            totalAmount={order.total_amount}
            currency={order.currency}
          />

          {/* Participant Card */}
          <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Transaction Counterparty
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {isBuyer ? order.seller?.username || "Seller" : order.buyer?.username || "Buyer"}
                </p>
                <p className="text-xs text-slate-400">
                  {isBuyer ? "Account Provider" : "Verified Purchaser"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
