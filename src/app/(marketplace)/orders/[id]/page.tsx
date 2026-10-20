import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  User,
  MessageCircle,
  ExternalLink,
  Trophy,
  Sparkles,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Coins,
  Shield,
  Layers,
  Check,
} from "lucide-react";
import { OrderChatBox } from "@/components/chat/OrderChatBox";
import { OrderEscrowController } from "@/components/escrow/OrderEscrowController";
import { OrderCopyButton } from "@/components/orders/OrderCopyButton";
import { formatCurrency, formatCompactNumber, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MessageService } from "@/services/messageService";
import { OrderService } from "@/services/orderService";
import { isSuperAdminEmail } from "@/lib/security/adminAuth";
import { OrderStatus } from "@/types/database";

export const revalidate = 0;

interface OrderPageProps {
  params: {
    id: string;
  };
}

const getStatusConfig = (status: OrderStatus | string) => {
  switch (status) {
    case "payment_pending":
      return {
        label: "Payment Pending",
        colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        icon: Clock,
      };
    case "escrow_locked":
      return {
        label: "Funds in Escrow",
        colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        icon: ShieldCheck,
      };
    case "seller_delivered":
      return {
        label: "Credentials Delivered",
        colorClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        icon: KeyRound,
      };
    case "buyer_reviewing":
      return {
        label: "24h Inspection Window",
        colorClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
        icon: Clock,
      };
    case "completed":
      return {
        label: "Trade Completed",
        colorClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
        icon: CheckCircle2,
      };
    case "disputed":
      return {
        label: "Dispute Opened",
        colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        icon: ShieldAlert,
      };
    case "cancelled":
    case "refunded":
      return {
        label: status === "refunded" ? "Escrow Refunded" : "Order Cancelled",
        colorClass: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        icon: Shield,
      };
    default:
      return {
        label: status.replace("_", " ").toUpperCase(),
        colorClass: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        icon: Clock,
      };
  }
};

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

  const isAdmin = isSuperAdminEmail(user.email);

  // Ensure user is buyer, seller, or super admin
  if (order.buyer_id !== user.id && order.seller_id !== user.id && !isAdmin) {
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

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const primaryImage =
    order.listing?.images?.find((img) => img.is_primary)?.image_url ||
    order.listing?.images?.[0]?.image_url ||
    null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <Link
            href={isBuyer ? "/dashboard/buyer" : "/dashboard/seller"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {isBuyer ? "Buyer" : "Seller"} Dashboard</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              Escrow Trade Room
            </h1>
            <OrderCopyButton orderNumber={order.order_number} />
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.colorClass}`}>
              <StatusIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{statusConfig.label}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">Safaricom Till 1572931 Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {new Date(order.created_at).toLocaleDateString("en-KE", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Escrow Officer Concierge Bar */}
      <div className="bg-gradient-to-r from-[#071E16] via-pitch-card to-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="relative w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
            <MessageCircle className="w-5 h-5 fill-emerald-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-pitch-bg animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Escrow Officer: Brian Okibo</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                Online &amp; Monitoring
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Assigned mediator for Order #{order.order_number}. Real-time M-Pesa Till verification, handover oversight, and dispute resolution.
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/254794400365?text=${encodeURIComponent(
            `Hello Brian Okibo, I need assistance with Order #${order.order_number} (${order.listing?.title || "eFootball Squad"}). Escrow Amount: KES ${order.total_amount}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>WhatsApp Brian (0794400365)</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Target Account Showcase & Escrow Handover Controller (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Account Esports Showcase Card */}
          {order.listing && (
            <div className="rounded-3xl bg-gradient-to-br from-[#0D192E] via-[#081224] to-[#0D192E] border border-slate-800/90 hover:border-emerald-500/40 p-5 sm:p-6 shadow-2xl transition-all space-y-5 relative overflow-hidden group">
              {/* Stadium Background Glow */}
              <div className="absolute top-0 right-0 w-72 h-36 bg-emerald-500/5 blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

              {/* Card Header: Category & Public Listing Link */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                    Target eFootball Account
                  </span>
                </div>
                <Link
                  href={`/listings/${order.listing.id}`}
                  target="_blank"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  <span>View Public Listing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Squad Image Banner with Overlay Badges */}
              <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-lg">
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={order.listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0F1E38] via-[#0A1426] to-[#08101E] text-emerald-400 p-6 text-center">
                    <ShieldCheck className="w-12 h-12 mb-2 text-emerald-400 opacity-90" />
                    <span className="text-sm font-bold text-white font-display">eFootball Squad Verified</span>
                    <span className="text-xs text-slate-400 mt-1">Konami ID Handover Secured</span>
                  </div>
                )}

                {/* Gradient vignette for badges readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/60 pointer-events-none" />

                {/* Top-Left: OVR Pill Badge */}
                {order.listing.overall_team_strength && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/60 text-amber-300 font-mono font-black text-sm flex items-center gap-1.5 shadow-lg">
                    <span>⚡</span>
                    <span>{order.listing.overall_team_strength} OVR</span>
                  </div>
                )}

                {/* Top-Right: Till 1572931 Seal */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/50 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Till 1572931 Protected</span>
                </div>

                {/* Bottom-Left: Platform Pill */}
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-semibold">
                  {getPlatformLabel(order.listing.platform)}
                </div>

                {/* Bottom-Right: Division Pill */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Div {order.listing.current_division || 1}</span>
                </div>
              </div>

              {/* Account Title */}
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white font-display leading-snug">
                  {order.listing.title}
                </h2>
              </div>

              {/* Spec Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Division</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    Div {order.listing.current_division || 1}
                  </span>
                  <span className="text-[10px] text-slate-400">Peak: Div {order.listing.highest_division || 1}</span>
                </div>

                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Card Power</span>
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {order.listing.epic_players_count || 0} Epics
                  </span>
                  <span className="text-[10px] text-slate-400">{order.listing.legend_players_count || 0} Legends</span>
                </div>

                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Konami ID</span>
                  <span className="text-emerald-300 font-bold truncate block">
                    {order.listing.konami_id_status === "unlinked" ? "Clean Unlinked" : "Changeable ID"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {order.listing.linked_email_status === "transferable_full_access" ? "Full Email Access" : "Buyer Bindable"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Currency Balance</span>
                  <span className="text-yellow-300 font-bold flex items-center gap-1">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    {(order.listing.coin_balance || 0).toLocaleString()} Coins
                  </span>
                  <span className="text-[10px] text-slate-400">{formatCompactNumber(order.listing.gp_balance || 0)} GP</span>
                </div>
              </div>

              {/* Key Players Showcase (if populated) */}
              {order.listing.key_players_list && order.listing.key_players_list.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                    Featured Squad Stars
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {order.listing.key_players_list.slice(0, 8).map((player, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-pitch-card border border-pitch-border text-slate-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{player}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial & Escrow Custody Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-pitch-card to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                    Escrow Custody Amount
                  </span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold block flex items-center gap-1 sm:justify-end">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>100% Protected via Safaricom Till 1572931</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Funds released only after buyer verifies Konami ID &amp; 2FA
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Escrow Progress & Handover Controller */}
          <OrderEscrowController order={order} currentUserId={user.id} />
        </div>

        {/* Right Column: Order Secure 2-Way Chat & Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
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

          {/* Participant / Counterparty Card */}
          <div className="rounded-2xl bg-pitch-surface border border-pitch-border p-5 shadow-xl space-y-4">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
              Trade Counterparty
            </h4>
            <div className="flex items-center gap-3.5 pb-3 border-b border-pitch-border">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-base text-slate-200 shadow-inner">
                {isBuyer
                  ? (order.seller?.username?.[0] || "S").toUpperCase()
                  : (order.buyer?.username?.[0] || "B").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-white truncate font-display">
                  {isBuyer ? order.seller?.username || "Verified Seller" : order.buyer?.username || "Verified Buyer"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/80">
                    {isBuyer ? "Account Provider" : "Purchaser (Funds Guaranteed)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Rules Box */}
            <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2">
              <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                Escrow Rules for Counterparties:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>All messages &amp; credential codes are encrypted and permanently logged for dispute resolution.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Never pay or accept payments outside Till 1572931. Direct personal trades are ineligible for dispute coverage.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Verify in-game <em>Support &gt; Link Data</em> has ZERO Google Play links before confirming funds release.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
