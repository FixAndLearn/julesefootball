"use client";

import { CredentialsDeliveryForm } from "@/components/escrow/CredentialsDeliveryForm";
import { CredentialsRevealModal } from "@/components/escrow/CredentialsRevealModal";
import { DisputeModal } from "@/components/escrow/DisputeModal";
import { EscrowStatusStepper } from "@/components/escrow/EscrowStatusStepper";
import { EscrowReceiptModal } from "@/components/escrow/EscrowReceiptModal";
import { DisputeEvidenceLocker } from "@/components/escrow/DisputeEvidenceLocker";
import { KonamiTransferChecklistModal, EscrowHandoverGuideCard } from "@/components/escrow/KonamiTransferChecklistModal";
import { MpesaPaymentModal } from "@/components/payments/MpesaPaymentModal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { EscrowState, Order, OrderStatus } from "@/types/database";
import { AlertCircle, AlertTriangle, CheckCircle2, FileText, KeyRound, Lock, Send, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
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
  const escrowState = (order.escrow?.escrow_state || "pending") as EscrowState;

  const [stepLogin, setStepLogin] = useState(false);
  const [stepPassword, setStepPassword] = useState(false);
  const [stepEmail, setStepEmail] = useState(false);
  const [step2FA, setStep2FA] = useState(false);
  const [stepUnlink, setStepUnlink] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [releasingFunds, setReleasingFunds] = useState(false);
  const [releaseError, setReleaseError] = useState("");

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
            if (payload.new && payload.new.status !== order.status) {
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
          () => {
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
  }, [order.id, order.status, router]);

  // If order is payment_pending, poll gently every 4s to catch payments automatically
  useEffect(() => {
    if (order.status !== "payment_pending") return;

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
            refreshPage();
          }
        }
      } catch (e) {
        // quiet fallback
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [order.id, order.status, router]);

  const refreshPage = () => {
    router.refresh();
    setTimeout(() => {
      window.location.reload();
    }, 400);
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
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Transaction Lifecycle &amp; Escrow State
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChecklistModalOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-bold transition-colors cursor-pointer bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-xl shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Handover Guide &amp; Rules</span>
            </button>
            {order.status !== "payment_pending" && order.status !== "cancelled" && (
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(true)}
                className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 font-bold transition-colors cursor-pointer bg-pitch-card border border-pitch-border px-2.5 py-1 rounded-xl"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Official Receipt (PDF)</span>
              </button>
            )}
          </div>
        </div>
        <EscrowStatusStepper state={escrowState} />
      </div>

      {/* Universal Escrow Exchange Guide Card (Available from Beginning) */}
      <EscrowHandoverGuideCard onOpenGuide={() => setIsChecklistModalOpen(true)} />

      {/* Stage 1: Payment Pending (Buyer STK Push Trigger) */}
      {order.status === "payment_pending" && (
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">M-Pesa Payment Awaiting Settlement</h3>
              <p className="text-xs text-slate-400">
                Amount: <strong className="text-emerald-400">{formatCurrency(order.total_amount, order.currency)}</strong>
              </p>
            </div>
          </div>

          {isBuyer ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Click below to trigger an automated Lipa Na M-Pesa STK Push directly to your Safaricom mobile handset.
              </p>
              <Button
                variant="gold"
                size="lg"
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Pay via M-Pesa STK Push
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-400">
              Waiting for buyer to complete M-Pesa payment. You will receive an immediate notification once funds are locked into escrow.
            </div>
          )}
        </div>
      )}

      {/* Stage 2: Escrow Locked (Seller delivering credentials via form or chat) */}
      {order.status === "escrow_locked" && (
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
      {order.status === "seller_delivered" && (
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
      {order.status === "completed" && (
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-3">
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
          <div className="pt-2">
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
      {order.status === "disputed" && (
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
