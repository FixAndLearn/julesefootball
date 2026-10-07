"use client";

import { Button } from "@/components/ui/Button";
import { WithdrawModal } from "@/components/seller/WithdrawModal";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface EarningsWithdrawSectionProps {
  availableBalance: number;
  escrowBalance: number;
}

export function EarningsWithdrawSection({
  availableBalance,
  escrowBalance,
}: EarningsWithdrawSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-pitch-surface to-pitch-surface border border-emerald-900/40 shadow-xl">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Withdrawable Available Balance
          </span>
          {escrowBalance > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
              {formatCurrency(escrowBalance)} Locked in Escrow
            </span>
          )}
        </div>
        <div className="text-3xl font-extrabold text-emerald-400 font-display font-mono">
          {formatCurrency(availableBalance)}
        </div>
        <p className="text-xs text-slate-400">
          Instant disbursement to your registered Safaricom M-Pesa mobile line.
        </p>
      </div>

      <div>
        <Button
          variant="gold"
          size="lg"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto font-bold"
          disabled={availableBalance < 10 && escrowBalance <= 0}
        >
          <ArrowUpRight className="w-5 h-5 mr-1.5" />
          Withdraw Funds to M-Pesa
        </Button>
      </div>

      <WithdrawModal
        availableBalance={availableBalance}
        escrowBalance={escrowBalance}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
