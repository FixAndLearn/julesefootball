"use client";

import { CredentialsDeliveryForm } from "@/components/escrow/CredentialsDeliveryForm";
import { CredentialsRevealModal } from "@/components/escrow/CredentialsRevealModal";
import { DisputeModal } from "@/components/escrow/DisputeModal";
import { EscrowStatusStepper } from "@/components/escrow/EscrowStatusStepper";
import { MpesaPaymentModal } from "@/components/payments/MpesaPaymentModal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { EscrowState, Order, OrderStatus } from "@/types/database";
import { AlertCircle, CheckCircle2, KeyRound, Lock, Send, ShieldAlert, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const refreshPage = () => {
    router.refresh();
    setTimeout(() => {
      window.location.reload();
    }, 400);
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

      {/* Stage 3: Seller Delivered (Buyer Reviewing & Inspection Window) */}
      {order.status === "seller_delivered" && (
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Credentials Delivered by Seller</h3>
                <p className="text-xs text-slate-400">24-Hour Inspection & Binding Window Active</p>
              </div>
            </div>
          </div>

          {isBuyer ? (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                The seller has securely submitted the Konami ID credentials. Access the encrypted vault below, log into eFootball, verify the players & GP, and bind your own email.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setIsRevealModalOpen(true)}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Decrypt & Reveal Account Credentials
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setIsDisputeModalOpen(true)}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Report Issue / Open Dispute
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-pitch-card text-xs text-slate-300">
                Credentials successfully delivered to buyer. Funds will be released into your available balance automatically upon buyer confirmation or when the 24h inspection window expires.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRevealModalOpen(true)}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  View Delivered Credentials
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
