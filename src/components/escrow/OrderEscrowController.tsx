"use client";

import { CredentialsDeliveryForm } from "@/components/escrow/CredentialsDeliveryForm";
import { CredentialsRevealModal } from "@/components/escrow/CredentialsRevealModal";
import { DisputeModal } from "@/components/escrow/DisputeModal";
import { EscrowStatusStepper } from "@/components/escrow/EscrowStatusStepper";
import { MpesaPaymentModal } from "@/components/payments/MpesaPaymentModal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { EscrowState, Order, OrderStatus } from "@/types/database";
import { AlertCircle, CheckCircle2, KeyRound, Lock, Send, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
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

  const isBuyer = currentUserId === order.buyer_id;
  const isSeller = currentUserId === order.seller_id;
  const escrowState = (order.escrow?.escrow_state || "pending") as EscrowState;

  const [stepLogin, setStepLogin] = useState(false);
  const [stepPassword, setStepPassword] = useState(false);
  const [stepEmail, setStepEmail] = useState(false);
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
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === "completed") {
            clearInterval(interval);
            router.refresh();
          }
        }
      } catch (e) {
        // quiet fallback
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [order.id, order.status, router]);

  const refreshPage = () => {
    router.refresh();
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleConfirmAndRelease = async () => {
    if (!stepLogin || !stepPassword || !stepEmail) {
      setReleaseError("Please tick all 3 checkpoints verifying you have logged in, changed the password, and linked your own email.");
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
      <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">
          Transaction Lifecycle & Escrow State
        </h3>
        <EscrowStatusStepper state={escrowState} />
      </div>

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

      {/* Stage 2: Escrow Locked (Seller must deliver credentials) */}
      {order.status === "escrow_locked" && (
        <div>
          {isSeller ? (
            <CredentialsDeliveryForm orderId={order.id} onDelivered={refreshPage} />
          ) : (
            <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Payment Secured in Escrow</h3>
                  <p className="text-xs text-slate-400">
                    Seller has been alerted to provide Konami ID credentials within 12 hours.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card text-xs text-slate-300">
                Your payment of <strong>{formatCurrency(order.total_amount, order.currency)}</strong> is locked securely. The seller cannot withdraw funds until you confirm full access to the account.
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

              {/* Step 3: Security Transfer Checklist */}
              <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">3</span>
                  Security Transfer Checklist
                </h4>
                <p className="text-xs text-slate-400">
                  Ensure full account ownership before approving fund release:
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={stepLogin}
                      onChange={(e) => setStepLogin(e.target.checked)}
                      className="w-4 h-4 rounded border-pitch-border text-brand-500 focus:ring-brand-500/20"
                    />
                    <span>I have logged into the eFootball account and verified squad details</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={stepPassword}
                      onChange={(e) => setStepPassword(e.target.checked)}
                      className="w-4 h-4 rounded border-pitch-border text-brand-500 focus:ring-brand-500/20"
                    />
                    <span>I have updated the Konami ID password to my own private password</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={stepEmail}
                      onChange={(e) => setStepEmail(e.target.checked)}
                      className="w-4 h-4 rounded border-pitch-border text-brand-500 focus:ring-brand-500/20"
                    />
                    <span>I have linked my own email address and unlinked the seller</span>
                  </label>
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
                  disabled={!stepLogin || !stepPassword || !stepEmail}
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
        </div>
      )}

      {/* Stage 5: Disputed */}
      {order.status === "disputed" && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-700/60 flex items-center justify-center text-amber-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-200">Escrow Dispute in Progress</h3>
              <p className="text-xs text-amber-300/80">Platform support moderator is reviewing evidence.</p>
            </div>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Funds remain locked in escrow until the dispute is resolved. You can communicate with the moderator in the order chat below.
          </p>
        </div>
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
    </div>
  );
}
