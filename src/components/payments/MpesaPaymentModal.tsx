"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Phone, Smartphone, X, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export interface MpesaPaymentModalProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MpesaPaymentModal({
  orderId,
  orderNumber,
  amount,
  currency,
  isOpen,
  onClose,
  onSuccess,
}: MpesaPaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "awaiting_pin" | "completed" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(60);

  // Poll payment status while awaiting PIN
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "awaiting_pin" && checkoutRequestId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/payments/status?checkoutRequestId=${checkoutRequestId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "completed") {
              setStatus("completed");
              clearInterval(interval);
              setTimeout(() => {
                onSuccess();
              }, 1500);
            } else if (data.status === "failed") {
              setStatus("failed");
              setErrorMessage(data.resultDesc || "Payment was rejected or cancelled.");
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, checkoutRequestId, onSuccess]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "awaiting_pin" && timerSeconds > 0) {
      timer = setTimeout(() => setTimerSeconds((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [status, timerSeconds]);

  if (!isOpen) return null;

  const handleInitiateSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/payments/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate M-Pesa payment");
      }

      setCheckoutRequestId(data.checkoutRequestId);
      setStatus("awaiting_pin");
      setTimerSeconds(60);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-pitch-surface border border-pitch-border rounded-2xl shadow-2xl overflow-hidden p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Lipa Na M-Pesa STK Push</h3>
            <p className="text-xs text-slate-400">Order #{orderNumber}</p>
          </div>
        </div>

        {/* Idle State: Phone Input */}
        {status === "idle" && (
          <form onSubmit={handleInitiateSTK} className="space-y-4">
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border flex items-center justify-between text-sm">
              <span className="text-slate-400">Escrow Total Amount:</span>
              <span className="font-bold text-emerald-400 text-base">{formatCurrency(amount, currency)}</span>
            </div>

            <Input
              label="Safaricom M-Pesa Phone Number"
              placeholder="e.g. 0712345678 or 254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              error={errorMessage}
              helperText="You will receive a prompt on this handset asking for your M-Pesa PIN."
              required
            />

            <Button type="submit" variant="gold" size="lg" className="w-full mt-2" isLoading={loading}>
              Send STK Push Prompt
            </Button>
          </form>
        )}

        {/* Awaiting PIN Handset State */}
        {status === "awaiting_pin" && (
          <div className="text-center py-6 space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-slate-100">Check Your Handset</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                An M-Pesa PIN prompt for <strong className="text-slate-200">{formatCurrency(amount, currency)}</strong> has been sent to {phoneNumber}. Enter your PIN to lock funds in escrow.
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Waiting for network confirmation... (<span className="text-amber-400 font-mono font-semibold">{timerSeconds}s</span>)
            </div>
          </div>
        )}

        {/* Completed State */}
        {status === "completed" && (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Payment Verified!</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Funds are now securely locked in eFootballMarket Escrow. The seller has been alerted to provide account credentials.
            </p>
          </div>
        )}

        {/* Failed State */}
        {status === "failed" && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-500 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">Payment Unsuccessful</h4>
              <p className="text-xs text-rose-300 mt-1">{errorMessage}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
