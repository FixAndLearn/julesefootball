"use client";

import React, { useState } from "react";
import { ShieldCheck, Smartphone, Lock, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";

export function EscrowSteps3D() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      num: "01",
      icon: Smartphone,
      title: "Buy Now via M-Pesa",
      description: "Trigger Safaricom M-Pesa STK Push directly to your phone. Confirm your PIN in complete privacy.",
      tag: "Instant STK",
      glowColor: "from-emerald-500 to-teal-400",
    },
    {
      num: "02",
      icon: Lock,
      title: "Funds Held in Escrow",
      description: "Payment is safely locked in non-custodial smart escrow. The seller cannot touch funds until delivery.",
      tag: "Non-Custodial",
      glowColor: "from-brand-500 to-indigo-400",
    },
    {
      num: "03",
      icon: KeyRound,
      title: "Encrypted Delivery",
      description: "Seller submits Konami ID email and password, encrypted via military-grade AES-256 for your eyes only.",
      tag: "AES-256 Secret",
      glowColor: "from-amber-500 to-orange-400",
    },
    {
      num: "04",
      icon: CheckCircle2,
      title: "Inspect & Release",
      description: "Take 24 hours to verify full squad players, change security passwords, and release settlement when 100% satisfied.",
      tag: "Buyer Guarantee",
      glowColor: "from-sky-500 to-blue-400",
    },
  ];

  return (
    <section className="py-24 border-t border-pitch-border/60 bg-gradient-to-b from-pitch via-pitch-surface/40 to-[#070b12] relative overflow-hidden">
      {/* 3D Ambient background lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-bold mb-4 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Non-Custodial Vault</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            How <span className="bg-gradient-to-r from-emerald-400 via-sky-300 to-brand-400 bg-clip-text text-transparent">3D Escrow Protection</span> Secures Your Trade
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Never risk direct peer-to-peer transfers. Your money stays shielded in escrow until you log in and bind your personal email to the Konami ID.
          </p>
        </div>

        {/* 3D Tiered Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = activeStep === idx;

            return (
              <div
                key={step.num}
                onMouseEnter={() => setActiveStep(idx)}
                onMouseLeave={() => setActiveStep(null)}
                style={{
                  transform: isHovered
                    ? "translateY(-12px) rotateX(8deg) rotateY(-4deg) scale(1.02)"
                    : "translateY(0px) rotateX(0deg) rotateY(0deg) scale(1)",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease",
                }}
                className={`p-6 rounded-3xl bg-pitch-surface/90 border transition-all duration-300 relative flex flex-col justify-between ${
                  isHovered
                    ? "border-amber-400/80 shadow-[0_20px_40px_rgba(0,0,0,0.7)] shadow-brand-500/10"
                    : "border-pitch-border/80 shadow-xl shadow-black/40"
                }`}
              >
                {/* 3D Floating Top Badges */}
                <div style={{ transform: "translateZ(30px)" }} className="flex items-center justify-between mb-6">
                  {/* Glowing 3D Number Block */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 shadow-md ${
                      isHovered
                        ? `bg-gradient-to-tr ${step.glowColor} text-slate-950 scale-110 shadow-lg`
                        : "bg-pitch-card border border-pitch-border text-slate-300"
                    }`}
                  >
                    {step.num}
                  </div>

                  {/* Step Tag */}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-slate-900/80 border border-pitch-border">
                    {step.tag}
                  </span>
                </div>

                {/* Content with 3D Depth */}
                <div style={{ transform: "translateZ(20px)" }} className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white font-display">{step.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                </div>

                {/* Bottom Step Indicator Bar */}
                <div style={{ transform: "translateZ(15px)" }} className="pt-4 border-t border-pitch-border/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Step {idx + 1} of 4</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          dot === idx ? "bg-amber-400 scale-125" : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
