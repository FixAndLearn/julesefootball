"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, CheckCircle2, Phone, Smartphone, X, AlertCircle } from "lucide-react";
import { useState } from "react";

export interface WithdrawModalProps {
  availableBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WithdrawModal({ availableBalance, isOpen, onClose, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const parsedAmount = Number(amount);
    if (parsedAmount > availableBalance) {
      setError("Withdrawal amount cannot exceed available balance.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          phoneNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit withdrawal");

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-pitch-surface border border-pitch-border rounded-2xl shadow-2xl p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-pitch-border/60 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Withdraw Earnings</h3>
            <p className="text-xs text-slate-400">Direct Safaricom M-Pesa B2C Payout</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Withdrawal Submitted!</h4>
            <p className="text-xs text-slate-300">
              Funds are being transferred to your M-Pesa mobile line.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border flex items-center justify-between text-xs">
              <span className="text-slate-400">Withdrawable Balance:</span>
              <span className="font-bold text-emerald-400 text-sm font-mono">
                {formatCurrency(availableBalance)}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Withdrawal Amount (KES)"
              type="number"
              min={200}
              max={availableBalance}
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="Minimum payout threshold: KES 200"
              required
            />

            <Input
              label="M-Pesa Phone Number"
              type="text"
              placeholder="07XXXXXXXX or 254XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Funds will be deposited directly to this registered M-Pesa line."
              required
            />

            <Button
              type="submit"
              variant="gold"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
              disabled={availableBalance < 200}
            >
              Confirm M-Pesa Withdrawal
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
