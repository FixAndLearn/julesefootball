import { WithdrawModal } from "@/components/seller/WithdrawModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock, Smartphone, Building2, Wallet } from "lucide-react";
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

  // Fetch seller profile balances
  const { data: profile } = await supabase
    .from("profiles")
    .select("available_balance, escrow_balance, completed_sales_count, phone_number")
    .eq("id", user.id)
    .single();

  // Fetch past withdrawals
  const { data: withdrawals } = await supabase
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
              Seller Earnings & M-Pesa Withdrawals
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct B2C disbursements via Safaricom Daraja API v2.
            </p>
          </div>
          <Link href="/dashboard/seller">
            <Button variant="primary" size="md">
              Manage Listings & Orders
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
            Awaiting buyer 24h inspection or delivery confirmation.
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

      {/* Withdrawal History Table */}
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 font-display">
          M-Pesa Payout History
        </h2>

        {withdrawals && withdrawals.length > 0 ? (
          <div className="divide-y divide-pitch-border/60">
            {withdrawals.map((w: any) => (
              <div key={w.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300">
                      To: {w.phone_number}
                    </span>
                    <Badge variant={w.status === "completed" ? "success" : "warning"} size="sm">
                      {w.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {new Date(w.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {formatCurrency(w.amount)}
                  </span>
                </div>
              </div>
            ))}
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
