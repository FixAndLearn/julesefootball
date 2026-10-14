"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { CheckCircle2, Phone, Smartphone, X, AlertCircle, Loader2, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isCheckingManual, setIsCheckingManual] = useState(false);
  const [manualNote, setManualNote] = useState("");
  const [receiptCode, setReceiptCode] = useState("");
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  const completedRef = useRef(false);

  const handleCompleteSuccess = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setStatus("completed");
    setTimeout(() => {
      onSuccess();
    }, 800);
  };

  // 1. Supabase Realtime Listener for instant payment detection
  useEffect(() => {
    if (!isOpen || status !== "awaiting_pin") return;

    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`modal-order-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          (payload: any) => {
            if (payload.new && payload.new.status !== "payment_pending") {
              handleCompleteSuccess();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "payments",
            filter: `order_id=eq.${orderId}`,
          },
          (payload: any) => {
            if (payload.new && payload.new.status === "completed") {
              handleCompleteSuccess();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn("Supabase Realtime subscription error:", e);
    }
  }, [isOpen, status, orderId]);

  // 2. High-frequency Poller (every 1.5s) while awaiting PIN
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "awaiting_pin") {
      interval = setInterval(async () => {
        if (completedRef.current) {
          clearInterval(interval);
          return;
        }

        try {
          const res = await fetch(
            `/api/payments/status?checkoutRequestId=${encodeURIComponent(
              checkoutRequestId || ""
            )}&orderId=${encodeURIComponent(orderId)}&_t=${Date.now()}`,
            {
              cache: "no-store",
              headers: {
                "Pragma": "no-cache",
                "Cache-Control": "no-cache, no-store, must-revalidate",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === "completed") {
              clearInterval(interval);
              handleCompleteSuccess();
            } else if (data.status === "failed") {
              setStatus("failed");
              setErrorMessage(data.resultDesc || "Payment was rejected or cancelled.");
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [status, checkoutRequestId, orderId]);

  // 3. Countdown timer (runs down from 45s, polling continues regardless)
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
    setManualNote("");
    setReceiptError("");
    completedRef.current = false;

    const normPhone = normalizePhoneNumber(phoneNumber.trim());
    if (!normPhone.isValid) {
      setErrorMessage("Please enter a valid Safaricom phone number (e.g. +254 7XX XXX XXX or 07XXXXXXXX).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payments/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          phoneNumber: normPhone.digits,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate M-Pesa payment");
      }

      setCheckoutRequestId(data.checkoutRequestId);
      setStatus("awaiting_pin");
      setTimerSeconds(45);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = async () => {
    setIsCheckingManual(true);
    setManualNote("Contacting Safaricom Till 1572931 & verifying database...");

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/payments/status?checkoutRequestId=${encodeURIComponent(
            checkoutRequestId || ""
          )}&orderId=${encodeURIComponent(orderId)}&forceCheck=true&_t=${Date.now()}`,
          {
            cache: "no-store",
            headers: {
              "Pragma": "no-cache",
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === "completed") {
            handleCompleteSuccess();
            return true;
          } else if (data.status === "failed") {
            setStatus("failed");
            setErrorMessage(data.resultDesc || "Payment was cancelled or rejected.");
            return true;
          }
        }
      } catch (e) {
        console.error("Manual check error:", e);
      }
      return false;
    };

    const immediateDone = await checkStatus();
    if (immediateDone) {
      setIsCheckingManual(false);
      return;
    }

    // Quick 2nd pulse after 1.2 seconds in case network packet is inflight
    setTimeout(async () => {
      const secondDone = await checkStatus();
      if (!secondDone) {
        setManualNote("Safaricom Till 1572931 received request. If PIN was entered, enter your SMS receipt code below for instant confirmation.");
      }
      setIsCheckingManual(false);
    }, 1200);
  };

  const handleVerifyReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = receiptCode.trim().toUpperCase();
    if (!cleanCode) {
      setReceiptError("Please enter your M-Pesa receipt code (e.g. UJD9J9UHFD).");
      return;
    }

    if (cleanCode.length < 8) {
      setReceiptError("M-Pesa receipt codes are at least 8-10 characters (e.g. UJD9J9UHFD).");
      return;
    }

    setIsVerifyingReceipt(true);
    setReceiptError("");

    try {
      const res = await fetch("/api/payments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          receiptNumber: cleanCode,
          checkoutRequestId: checkoutRequestId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify M-Pesa receipt.");
      }

      if (data.status === "completed") {
        handleCompleteSuccess();
      } else {
        setReceiptError("Verification pending. Please wait a moment.");
      }
    } catch (err: any) {
      setReceiptError(err.message || "Could not verify code. Please double check.");
    } finally {
      setIsVerifyingReceipt(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-pitch-surface border border-pitch-border rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
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
              placeholder="e.g. +254 7XX XXX XXX or 07XXXXXXXX"
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
          <div className="text-center py-4 space-y-4">
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

            {timerSeconds > 0 ? (
              <div className="text-xs text-slate-400">
                Waiting for network confirmation... (<span className="text-amber-400 font-mono font-semibold">{timerSeconds}s</span>)
              </div>
            ) : (
              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Checking Safaricom Till 1572931... Click confirm or enter receipt below.</span>
              </div>
            )}

            {manualNote && (
              <div className="p-2.5 rounded-xl bg-pitch-card border border-pitch-border text-[11px] text-slate-300 flex items-center gap-2 animate-in fade-in text-left">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400 shrink-0" />
                <span>{manualNote}</span>
              </div>
            )}

            <div className="pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs font-semibold py-2.5"
                isLoading={isCheckingManual}
                onClick={handleManualCheck}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                I have entered PIN — Confirm Status Now
              </Button>
            </div>

            {/* Instant M-Pesa SMS Receipt Fallback (Direct unlock with code e.g. UJD9J9UHFD) */}
            <div className="pt-3 border-t border-pitch-border/70 text-left">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Have Your M-Pesa SMS Receipt?</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Instant Unlock
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Received the SMS from Safaricom? Enter the receipt code (e.g. <strong className="text-slate-200">UJD9J9UHFD</strong>) to immediately lock funds in escrow without waiting.
                </p>
                <form onSubmit={handleVerifyReceipt} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. UJD9J9UHFD"
                    value={receiptCode}
                    onChange={(e) => setReceiptCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg bg-pitch-surface border border-pitch-border text-xs text-white uppercase font-mono tracking-wider placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <Button
                    type="submit"
                    variant="gold"
                    size="sm"
                    className="text-xs shrink-0 font-bold px-3 py-2"
                    isLoading={isVerifyingReceipt}
                    disabled={!receiptCode.trim()}
                  >
                    Verify Receipt
                  </Button>
                </form>
                {receiptError && (
                  <p className="text-[11px] text-rose-400 font-medium pt-0.5 animate-in fade-in">
                    {receiptError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completed State */}
        {status === "completed" && (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Payment Verified!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Funds are securely locked in eFootballMarket Escrow. Transitioning to account handover...
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
