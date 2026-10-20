"use client";

import { CredentialsDeliveryForm } from "@/components/escrow/CredentialsDeliveryForm";
import { CredentialsRevealModal } from "@/components/escrow/CredentialsRevealModal";
import { DisputeModal } from "@/components/escrow/DisputeModal";
import { EscrowStatusStepper } from "@/components/escrow/EscrowStatusStepper";
import { EscrowReceiptModal } from "@/components/escrow/EscrowReceiptModal";
import { DisputeEvidenceLocker } from "@/components/escrow/DisputeEvidenceLocker";
import { KonamiTransferChecklistModal } from "@/components/escrow/KonamiTransferChecklistModal";
import { MpesaPaymentModal } from "@/components/payments/MpesaPaymentModal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { EscrowState, Order, OrderStatus } from "@/types/database";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, FileText, KeyRound, Lock, Send, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface OrderEscrowControllerProps {
  order: Order;
  currentUserId: string;
}

export function OrderEscrowController({ order, currentUserId }: OrderEscrowControllerProps) {
  const router = useRouter();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const isBuyer = currentUserId === order.buyer_id;
  const isSeller = currentUserId === order.seller_id;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus | string>(order.status);
  const [currentEscrowState, setCurrentEscrowState] = useState<EscrowState>(
    (order.escrow?.escrow_state || "pending") as EscrowState
  );

  const [stepLogin, setStepLogin] = useState(false);
  const [stepPassword, setStepPassword] = useState(false);
  const [stepEmail, setStepEmail] = useState(false);
  const [step2FA, setStep2FA] = useState(false);
  const [stepUnlink, setStepUnlink] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [releasingFunds, setReleasingFunds] = useState(false);
  const [releaseError, setReleaseError] = useState("");

  // Sync prop changes
  useEffect(() => {
    setCurrentStatus(order.status);
  }, [order.status]);

  useEffect(() => {
    if (order.escrow?.escrow_state) {
      setCurrentEscrowState(order.escrow.escrow_state as EscrowState);
    }
  }, [order.escrow?.escrow_state]);

  // Real-time synchronization for order state across buyers & sellers
  useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`escrow-order-live-${order.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${order.id}`,
          },
          (payload: any) => {
            if (payload.new && payload.new.status) {
              setCurrentStatus(payload.new.status);
              router.refresh();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "escrow_accounts",
            filter: `order_id=eq.${order.id}`,
          },
          (payload: any) => {
            if (payload.new && payload.new.escrow_state) {
              setCurrentEscrowState(payload.new.escrow_state as EscrowState);
            }
            router.refresh();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "account_deliveries",
            filter: `order_id=eq.${order.id}`,
          },
          () => {
            setCurrentStatus((prev) => (prev === "escrow_locked" ? "seller_delivered" : prev));
            setCurrentEscrowState((prev) => (prev === "waiting_for_seller" ? "seller_delivered" : prev));
            router.refresh();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn("Realtime order channel error:", e);
    }
  }, [order.id, router]);

  // If order is payment_pending, poll gently every 2s to catch payments automatically
  useEffect(() => {
    if (currentStatus !== "payment_pending") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payments/status?orderId=${encodeURIComponent(order.id)}&_t=${Date.now()}`,
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
            setCurrentStatus("escrow_locked");
            setCurrentEscrowState("payment_received");
            router.refresh();
          }
        }
      } catch (e) {
        // quiet fallback
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [order.id, currentStatus, router]);

  const refreshPage = () => {
    router.refresh();
  };

  const handleConfirmAndRelease = async () => {
    if (!stepLogin || !stepPassword || !stepEmail || !step2FA || !stepUnlink) {
      setReleaseError("Please verify all 5 security transfer checkpoints (Login, Password, Email, 2FA, & Unlinking) before releasing escrow funds.");
      return;
    }

    setReleasingFunds(true);
    setReleaseError("");
    try {
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to release escrow funds");
      refreshPage();
    } catch (err: any) {
      setReleaseError(err.message);
    } finally {
      setReleasingFunds(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Escrow Progress Stepper */}
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Transaction Lifecycle &amp; Escrow State
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChecklistModalOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-bold transition-colors cursor-pointer bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1.5 rounded-xl shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Handover Guide &amp; Rules</span>
            </button>
            {currentStatus !== "payment_pending" && currentStatus !== "cancelled" && (
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 font-bold transition-colors cursor-pointer bg-pitch-card border border-pitch-border px-2.5 py-1.5 rounded-xl"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Official Receipt</span>
              </button>
            )}
            {currentStatus !== "payment_pending" && currentStatus !== "cancelled" && currentStatus !== "disputed" && (
              <button
                type="button"
                onClick={() => setIsDisputeModalOpen(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-bold transition-colors cursor-pointer bg-rose-950/60 border border-rose-800/80 px-2.5 py-1.5 rounded-xl shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{currentStatus === "completed" ? "Post-Release Dispute" : "Raise Dispute"}</span>
              </button>
            )}
          </div>
        </div>
        <EscrowStatusStepper state={currentEscrowState} />
      </div>

      {/* Stage 1: Payment Pending (Buyer STK Push Trigger) */}
      {currentStatus === "payment_pending" && (
        <div className="bg-gradient-to-br from-[#0D192E] via-pitch-surface to-[#0A1220] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-pitch-border/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Smartphone className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-display">Awaiting M-Pesa Deposit</h3>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                    Safaricom Till 1572931
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Deposit escrow amount to unlock seller credentials &amp; encrypted chat.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Payable Total</span>
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                {formatCurrency(order.total_amount, order.currency)}
              </span>
            </div>
          </div>

          {isBuyer ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-pitch-card border border-pitch-border flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span className="text-slate-300 text-[11px] leading-tight">Tap Pay to trigger M-Pesa prompt on phone</span>
                </div>
                <div className="p-2.5 rounded-xl bg-pitch-card border border-pitch-border flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span className="text-slate-300 text-[11px] leading-tight">Enter your Safaricom PIN on handset</span>
                </div>
                <div className="p-2.5 rounded-xl bg-pitch-card border border-pitch-border flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span className="text-slate-300 text-[11px] leading-tight">Locked in Till 1572931 custody instantly</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full sm:w-auto font-bold shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Pay via M-Pesa STK Push
                </Button>
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% money-back escrow guarantee if seller fails to deliver</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
              <span>
                Awaiting buyer M-Pesa settlement into Safaricom Till 1572931. <strong>Do NOT share account credentials</strong> until escrow confirmation illuminates.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stage 2: Escrow Locked (Seller delivering credentials via form or chat) */}
      {currentStatus === "escrow_locked" && (
        <div>
          {isSeller ? (
            <CredentialsDeliveryForm orderId={order.id} onDelivered={refreshPage} />
          ) : (
            <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Payment Secured in Escrow (Funds Safely Held)</h3>
                  <p className="text-xs text-slate-400">
                    Safaricom Till 1572931 custody active. Seller cannot withdraw funds until you confirm full access.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-white block">Escrow Protection &amp; Handover Protocol:</span>
                <p className="text-slate-300">
                  The seller will deliver credentials either using the encrypted vault OR by communicating directly with you in the <strong>Order Chat</strong> to the right.
                </p>
              </div>

              {/* Handover Verification Card (In case seller provides credentials in chat) */}
              <div className="p-4 rounded-xl bg-pitch-card/70 border border-emerald-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Received Credentials via Chat or Form? Verify Here:</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      You do not have to wait if the seller assists you directly in chat. Verify all 5 points before releasing funds.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChecklistModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>View Visual 6-Step Guide</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-pitch-border/60 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={stepLogin}
                      onChange={(e) => setStepLogin(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500"
                    />
                    <span><strong>1. Account Inspection:</strong> Logged into eFootball and confirmed squad players, OVR, and Epics match the listing.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={stepEmail}
                      onChange={(e) => setStepEmail(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500"
                    />
                    <span><strong>2. Primary Email Binding:</strong> Changed registered email at <em>my.konami.net</em> to my own email and confirmed OTP code.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={stepPassword}
                      onChange={(e) => setStepPassword(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500"
                    />
                    <span><strong>3. Password &amp; Security:</strong> Updated Konami ID password and security question to new private combinations.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={step2FA}
                      onChange={(e) => setStep2FA(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500"
                    />
                    <span><strong>4. Two-Step Verification (2FA):</strong> Enabled 2-Step OTP on my own phone to block previous owner access.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={stepUnlink}
                      onChange={(e) => setStepUnlink(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500"
                    />
                    <span className="text-rose-200">
                      <strong>5. Verified ZERO Google-Play Link (&quot;Googling&quot;):</strong> Checked in-game <em>Extras &rarr; Support &rarr; Link Data</em> and confirmed Google Play Games says <strong>&quot;Not Linked&quot;</strong>. (If linked, STOP &amp; Dispute).
                    </span>
                  </label>
                </div>

                {releaseError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{releaseError}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    variant="gold"
                    size="md"
                    className="w-full sm:flex-1 font-bold"
                    onClick={handleConfirmAndRelease}
                    isLoading={releasingFunds}
                    disabled={!stepLogin || !stepPassword || !stepEmail || !step2FA || !stepUnlink}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Complete Handover &amp; Release Funds to Seller
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setIsDisputeModalOpen(true)}
                  >
                    <ShieldAlert className="w-4 h-4 mr-1.5" />
                    Report Problem / Dispute
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 3: Seller Delivered (Buyer Reviewing & 2-Way Code Transfer Window) */}
      {currentStatus === "seller_delivered" && (
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {isBuyer ? "Account Handover in Progress (2-Way Code Transfer)" : "Credentials Delivered — Handover Active"}
                </h3>
                <p className="text-xs text-slate-400">24-Hour Security & Binding Window Active</p>
              </div>
            </div>
          </div>

          {isBuyer ? (
            <div className="space-y-4 pt-1">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1.5">
                <span className="font-bold text-amber-300 block">💬 Two-Way Verification in Progress:</span>
                <p>
                  Konami ID security requires login OTP codes and email change confirmations. View opening credentials below, log into eFootball, and use the <strong>Order Chat</strong> to get the 2-step codes from the seller so you can change <strong>both the password and registered email address</strong>.
                </p>
              </div>

              {/* Step 1: Opening Credentials */}
              <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">1</span>
                    Opening Credentials Vault
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Konami ID email & temporary opening login details.
                  </p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setIsRevealModalOpen(true)}
                >
                  <KeyRound className="w-4 h-4 mr-1.5" />
                  View Opening Credentials
                </Button>
              </div>

              {/* Step 2: Live Chat for Codes */}
              <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">2</span>
                    Request 2FA / OTP in Chat
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ask seller for the Konami 2-Step verification code sent to their email.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  Chat Active
                </span>
              </div>

              {/* Step 3: Konami ID Security Transfer Checklist (5-Point Protocol) */}
              <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">3</span>
                    Konami ID Handover Safety Checklist
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsChecklistModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>View Visual Handover Guide</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Complete all 5 security protocols below before releasing escrow funds:
                </p>

                <div className="space-y-2.5 pt-1 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={stepLogin}
                      onChange={(e) => setStepLogin(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500 focus:ring-brand-500/20"
                    />
                    <span><strong>1. Account Inspection:</strong> Logged in and verified all squad players, OVR, Epics, and Coin balances match the listing.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={stepEmail}
                      onChange={(e) => setStepEmail(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500 focus:ring-brand-500/20"
                    />
                    <span><strong>2. Primary Email Binding:</strong> Changed registered email at <em>my.konami.net</em> to my own personal email and confirmed OTP code.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={stepPassword}
                      onChange={(e) => setStepPassword(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500 focus:ring-brand-500/20"
                    />
                    <span><strong>3. Password & Security:</strong> Updated Konami ID password and security question to new private combinations.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={step2FA}
                      onChange={(e) => setStep2FA(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500 focus:ring-brand-500/20"
                    />
                    <span><strong>4. Two-Step Verification (2FA):</strong> Enabled Konami 2-Step OTP on my own handset to block previous owner access.</span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={stepUnlink}
                      onChange={(e) => setStepUnlink(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-pitch-border text-brand-500 focus:ring-brand-500/20"
                    />
                    <span className="text-rose-200">
                      <strong>5. Verified ZERO Google-Play Link (&quot;Googling&quot;):</strong> Checked in-game <em>Extras &rarr; Support &rarr; Link Data</em> and confirmed Google Play Games says <strong>&quot;Not Linked&quot;</strong>. (If linked, STOP &amp; Dispute).
                    </span>
                  </label>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-pitch-border/60">
                  <span>Completed: <strong>{[stepLogin, stepEmail, stepPassword, step2FA, stepUnlink].filter(Boolean).length} / 5</strong></span>
                  <a
                    href="https://my.konami.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Open official my.konami.net ↗
                  </a>
                </div>
              </div>

              {releaseError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{releaseError}</span>
                </div>
              )}

              {/* Step 4: Final Handover Release */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full sm:flex-1 font-bold"
                  onClick={handleConfirmAndRelease}
                  isLoading={releasingFunds}
                  disabled={!stepLogin || !stepPassword || !stepEmail || !step2FA || !stepUnlink}
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Complete Handover & Release Funds to Seller
                </Button>

                <Button
                  variant="danger"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => setIsDisputeModalOpen(true)}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Report Problem / Dispute
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200 space-y-2">
                <span className="font-bold text-amber-300 block text-sm">⚡ Action Needed in Order Chat:</span>
                <p>
                  The buyer is currently attempting login and updating the Konami account. Please stay active in the <strong>Order Chat</strong> below to send the <strong>2-Step OTP codes</strong> when prompted!
                </p>
                <p className="text-[11px] text-amber-300/80">
                  Once the buyer finishes binding both their password and email, the escrow funds will be cleared automatically to your Available Balance.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRevealModalOpen(true)}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  View Delivered Opening Credentials
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 4: Order Completed */}
      {currentStatus === "completed" && (
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Order Completed & Funds Released</h3>
              <p className="text-xs text-slate-400">Escrow ledger settled successfully.</p>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            {isBuyer
              ? "Account access confirmed. Enjoy your new eFootball squad!"
              : `Net payout of ${formatCurrency(order.seller_net_amount, order.currency)} has been credited to your available balance.`}
          </p>

          {/* Post-Release Dispute Guarantee Box */}
          <div className="p-4 rounded-xl bg-pitch-card/80 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Konami Post-Release Security Guarantee</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Did the seller attempt to recover the Konami ID? Was an unmentioned Google Play link found, or did the account get banned? You can raise an official post-release dispute at any time.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDisputeModalOpen(true)}
                className="shrink-0 font-bold shadow-md cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 mr-1.5" />
                Raise Post-Release Dispute
              </Button>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsReceiptModalOpen(true)}
              className="font-bold shadow-md cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              View Official Escrow Receipt (Print / PDF)
            </Button>
          </div>
        </div>
      )}

      {/* Stage 5: Disputed */}
      {currentStatus === "disputed" && (
        <DisputeEvidenceLocker order={order} currentUserId={currentUserId} />
      )}

      {/* Modals */}
      <MpesaPaymentModal
        orderId={order.id}
        orderNumber={order.order_number}
        amount={order.total_amount}
        currency={order.currency}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          refreshPage();
        }}
      />

      <CredentialsRevealModal
        orderId={order.id}
        isOpen={isRevealModalOpen}
        isSeller={isSeller}
        onClose={() => setIsRevealModalOpen(false)}
        onConfirmedRelease={() => {
          setIsRevealModalOpen(false);
          refreshPage();
        }}
        onOpenDispute={() => {
          setIsRevealModalOpen(false);
          setIsDisputeModalOpen(true);
        }}
      />

      <DisputeModal
        orderId={order.id}
        isOpen={isDisputeModalOpen}
        isCompleted={currentStatus === "completed"}
        onClose={() => setIsDisputeModalOpen(false)}
        onDisputeSubmitted={() => {
          setIsDisputeModalOpen(false);
          refreshPage();
        }}
      />

      <KonamiTransferChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
      />

      <EscrowReceiptModal
        order={order}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
}
