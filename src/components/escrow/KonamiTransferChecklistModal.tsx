"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, Circle, AlertTriangle, ExternalLink, X, Lock, Key, Smartphone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChecklistStep {
  id: string;
  title: string;
  instruction: string;
  criticalTip: string;
}

const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    id: "step_login",
    title: "1. Log in to my.konami.net in Incognito",
    instruction: "Open a private/incognito browser window and log in to the official Konami ID portal (my.konami.net) using the email and password delivered by the seller.",
    criticalTip: "Ensure the URL begins with https://my.konami.net to prevent phishing clones.",
  },
  {
    id: "step_email",
    title: "2. Change Konami ID Email to Your Own",
    instruction: "Navigate to Account Management -> 'View / Edit Email Address'. Enter your personal email address. Konami will send a 6-digit confirmation code to your inbox.",
    criticalTip: "Once you enter the 6-digit OTP code, the seller permanently loses login capability through their previous email.",
  },
  {
    id: "step_password",
    title: "3. Change Password & Security Question",
    instruction: "Update the password to a strong new combination (12+ characters with symbols) and update the secret security question.",
    criticalTip: "Do not use the same password that the seller originally provided.",
  },
  {
    id: "step_2fa",
    title: "4. Enable Two-Factor Authentication (2FA)",
    instruction: "Go to Security -> Two-Step Verification. Link your email or an Authenticator App (Google Authenticator / Authy).",
    criticalTip: "2FA ensures that even if anyone knew the past password, nobody can log in without your phone.",
  },
  {
    id: "step_unlink",
    title: "5. Unlink Google Play / Apple Game Center",
    instruction: "In Konami ID portal, check 'Linked External Accounts'. Ensure Google Play, Apple ID, PSN, or Game Center are disconnected or unlinked.",
    criticalTip: "This ensures the seller cannot launch the mobile game using a secondary social token.",
  },
  {
    id: "step_ingame",
    title: "6. Launch Game & Confirm Squad In-App",
    instruction: "Open eFootball Mobile on your phone -> Extras -> Support -> Data Transfer -> Transfer using Konami ID. Log in and verify all Epic Boosters, Division status, and Coin balances match the listing.",
    criticalTip: "If any player or currency is missing, click 'Open Dispute' immediately before the 24-hour window expires.",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function KonamiTransferChecklistModal({ isOpen, onClose }: Props) {
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / CHECKLIST_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-pitch-surface border border-pitch-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-pitch-border/80 bg-pitch-card/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Konami ID Account Transfer Checklist
              </h3>
              <p className="text-xs text-slate-400">
                Follow these 6 steps in order to lock 100% permanent ownership before releasing escrow.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-pitch-card/30 border-b border-pitch-border/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">
              Security Progress: {completedCount} / {CHECKLIST_STEPS.length}
            </span>
            {progressPercent === 100 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                100% Fully Secured!
              </span>
            )}
          </div>
          <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {CHECKLIST_STEPS.map((step) => {
            const isDone = Boolean(checkedSteps[step.id]);
            return (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isDone
                    ? "bg-emerald-950/20 border-emerald-500/50"
                    : "bg-pitch-card/50 border-pitch-border hover:border-slate-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 text-slate-400 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  <div className="space-y-1 flex-1">
                    <h4
                      className={`text-sm font-bold transition-colors ${
                        isDone ? "text-emerald-300 line-through opacity-80" : "text-white"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{step.instruction}</p>
                    <div className="flex items-start gap-1.5 pt-1 text-[11px] text-amber-300/90 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>{step.criticalTip}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-5 border-t border-pitch-border/80 bg-pitch-card/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://my.konami.net"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            <span>Open Official my.konami.net</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto font-bold"
          >
            {progressPercent === 100 ? "I'm Fully Secured (Close Checklist)" : "Got It, Continue Transfer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Trigger Button that can be placed in any banner or navigation
 */
export function KonamiTransferChecklistTrigger({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:text-emerald-200 hover:border-emerald-700 text-xs font-semibold transition-all shadow-md ${className}`}
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Buyer Security Checklist</span>
      </button>

      <KonamiTransferChecklistModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
