import { EarningsWithdrawSection } from "@/components/seller/EarningsWithdrawSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, Clock, Smartphone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function SellerEarningsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/seller/earnings");
  }

  const adminSupabase = createAdminClient();
  const serviceRoleConfigured = hasServiceRoleKey();
  const primaryClient = serviceRoleConfigured ? adminSupabase : supabase;

  // Fetch seller profile balances
  const { data: profile } = await primaryClient
    .from("profiles")
    .select("available_balance, escrow_balance, completed_sales_count, phone_number")
    .eq("id", user.id)
    .single();

  // Fetch past withdrawals
  const { data: withdrawals } = await primaryClient
    .from("seller_withdrawals")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const availableBalance = Number(profile?.available_balance || 0);
  const escrowBalance = Number(profile?.escrow_balance || 0);
  const completedSales = profile?.completed_sales_count || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <Link
          href="/dashboard/seller"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Seller Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Seller Earnings &amp; M-Pesa Withdrawals
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct disbursements to your registered Safaricom M-Pesa line.
            </p>
          </div>
          <Link href="/dashboard/seller">
            <Button variant="primary" size="md">
              Manage Listings &amp; Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Corporate Governance Notice */}
      <div className="p-4 rounded-xl bg-pitch-surface border border-pitch-border flex items-center gap-3 text-xs text-slate-300">
        <Building2 className="w-5 h-5 text-brand-400 shrink-0" />
        <span>
          Financial settlement infrastructure operated under the executive oversight of <strong>Brian Okibo, Chief Executive Officer (CEO)</strong> with automated ledger auditing and atomic balance deductions.
        </span>
      </div>

      {/* Prominent Active Withdrawal Banner & Action */}
      <EarningsWithdrawSection
        availableBalance={availableBalance}
        escrowBalance={escrowBalance}
      />

      {/* Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl">
          <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
            Available Balance
          </span>
          <span className="text-3xl font-extrabold text-emerald-400 font-display mt-2 block font-mono">
            {formatCurrency(availableBalance)}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            Cleared funds ready for instant M-Pesa withdrawal.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl">
          <span className="block text-xs uppercase font-bold text-amber-400 tracking-wider">
            Locked in Escrow
          </span>
          <span className="text-3xl font-extrabold text-amber-400 font-display mt-2 block font-mono">
            {formatCurrency(escrowBalance)}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            Awaiting buyer inspection or order completion.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border shadow-xl">
          <span className="block text-xs uppercase font-bold text-indigo-400 tracking-wider">
            Completed Transfers
          </span>
          <span className="text-3xl font-extrabold text-white font-display mt-2 block">
            {completedSales}
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            Total successful account settlements.
          </p>
        </div>
      </div>

      {/* Clear Explanation: What does "Pending" mean? */}
      <div className="p-5 rounded-2xl bg-pitch-surface border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Clock className="w-4 h-4" />
          <span>Understanding Withdrawal Status &amp; Processing</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          When you submit a withdrawal, it is marked <strong className="text-amber-400">PENDING</strong> while our financial administration team prepares the payout from the platform Till to your Safaricom M-Pesa line.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
            <span className="font-bold text-slate-200 block text-[11px]">1. Balance Reserved</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Your available balance is deducted instantly to prevent double-spending.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
            <span className="font-bold text-amber-400 block text-[11px]">2. Payout Queued (Pending)</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Disbursed to your Safaricom M-Pesa phone number (processed within 15–30 minutes).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-1">
            <span className="font-bold text-emerald-400 block text-[11px]">3. Status Completed</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Once money reaches your phone, status marks as Paid. If wrong phone number, funds are refunded.
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal History Table */}
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 font-display">
          M-Pesa Payout History
        </h2>

        {withdrawals && withdrawals.length > 0 ? (
          <div className="divide-y divide-pitch-border/60">
            {withdrawals.map((w: any) => {
              const isPending = w.status === "pending";
              const isCompleted = w.status === "completed";
              const isRejected = w.status === "rejected";

              return (
                <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        To: {w.phone_number}
                      </span>
                      {isPending && (
                        <Badge variant="warning" size="sm" className="font-bold">
                          PENDING DISBURSEMENT
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="success" size="sm" className="font-bold">
                          COMPLETED &amp; PAID
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge variant="danger" size="sm" className="font-bold">
                          REJECTED (REFUNDED)
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{new Date(w.created_at).toLocaleString()}</span>
                      <span>&bull;</span>
                      {isPending && (
                        <span className="text-amber-400/90 font-medium">
                          Queued for platform Till payout (15–30 mins)
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-emerald-400/90 font-medium">
                          Disbursed to Safaricom line
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-rose-400/90 font-medium">
                          {w.failure_reason ? `Reason: ${w.failure_reason}` : "Balance restored"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {formatCurrency(w.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Smartphone}
            title="No withdrawals yet"
            description="You have not requested any balance payouts yet. When buyers complete orders, your cleared earnings appear in your available balance."
          />
        )}
      </div>
    </div>
  );
}
