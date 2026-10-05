import { EscrowState } from "@/types/database";
import { CheckCircle2, Clock, Shield, AlertTriangle } from "lucide-react";

export interface EscrowStatusStepperProps {
  state: EscrowState;
}

export function EscrowStatusStepper({ state }: EscrowStatusStepperProps) {
  const steps = [
    { id: "payment", label: "M-Pesa Payment" },
    { id: "escrow", label: "Funds in Escrow" },
    { id: "delivery", label: "Account Delivery" },
    { id: "inspection", label: "24h Inspection" },
    { id: "completed", label: "Funds Released" },
  ];

  let currentStepIndex = 0;
  let isDisputed = state === "disputed";

  switch (state) {
    case "pending":
    case "payment_initiated":
      currentStepIndex = 0;
      break;
    case "payment_received":
    case "waiting_for_seller":
      currentStepIndex = 1;
      break;
    case "seller_delivered":
      currentStepIndex = 2;
      break;
    case "buyer_reviewing":
      currentStepIndex = 3;
      break;
    case "completed":
      currentStepIndex = 4;
      break;
    case "disputed":
      currentStepIndex = 2;
      break;
    default:
      currentStepIndex = 0;
  }

  if (isDisputed) {
    return (
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-amber-200">Escrow Dispute Opened</h4>
          <p className="text-xs text-amber-300/80">
            Funds remain safely locked in escrow while platform moderators investigate evidence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-emerald-500 z-0 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isDone = index < currentStepIndex || (index === steps.length - 1 && currentStepIndex === steps.length - 1);
          const isCurrent = index === currentStepIndex && currentStepIndex !== steps.length - 1;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                  isDone
                    ? "bg-emerald-500 text-slate-950"
                    : isCurrent
                    ? "bg-brand-600 text-white ring-4 ring-brand-500/20"
                    : "bg-slate-800 border border-slate-700 text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-spin text-white" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium tracking-tight text-center ${
                  isDone || isCurrent ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
