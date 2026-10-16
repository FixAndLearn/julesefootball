"use client";

import React, { useState } from "react";
import { MessageCircle, X, ShieldCheck, Send, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";

export function WhatsAppSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("M-Pesa Payment or STK Push Help");

  // Official verified support line: 0794400365
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254794400365";

  const topics = [
    { label: "M-Pesa STK Push / Payment Issue", query: "Hello eFootballMarket Support, I need help with an M-Pesa STK push or payment verification." },
    { label: "Escrow Release & Konami ID Help", query: "Hello eFootballMarket Support, I have a question regarding Konami ID credentials and escrow release." },
    { label: "Verify a Seller / Report an Issue", query: "Hello eFootballMarket Support, I want to verify a seller's credibility or report an issue." },
    { label: "Talk to Brian Okibo (CEO)", query: "Hello eFootballMarket, I would like to speak to executive support regarding an order." },
  ];

  const handleLaunchWhatsApp = (text?: string) => {
    const messageToSend = text || customMessage || topics.find((t) => t.label === selectedTopic)?.query || "Hello eFootballMarket Support!";
    const encoded = encodeURIComponent(messageToSend);
    const url = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-5 right-4 sm:right-6 z-40 select-none">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] sm:w-[360px] rounded-3xl bg-pitch-surface/95 border border-pitch-border shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 flex flex-col">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 via-pitch-card to-slate-900 border-b border-pitch-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">eFootball Escrow Support</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-300 font-semibold">Online (Replies in &lt;5 mins)</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 text-xs">
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Need direct assistance with an M-Pesa transaction or Konami ID transfer? Our verified support team is available on WhatsApp.
            </p>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Your Inquiry Topic:
              </span>
              {topics.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleLaunchWhatsApp(item.query)}
                  className="w-full text-left p-2.5 rounded-xl bg-pitch-card border border-pitch-border hover:border-emerald-500/60 hover:bg-slate-800/80 transition-all flex items-center justify-between group"
                >
                  <span className="text-slate-200 group-hover:text-emerald-300 transition-colors font-medium text-xs">
                    {item.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>

            {/* Custom Query Box */}
            <div className="pt-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Or type a custom message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLaunchWhatsApp()}
                  className="w-full bg-slate-900 border border-pitch-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 pr-9 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => handleLaunchWhatsApp()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-slate-900/90 border-t border-pitch-border/60 text-center">
            <span className="text-[10px] text-slate-400">
              🔒 Official Escrow Hotline — Safaricom M-Pesa Integrated
            </span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl shadow-emerald-950/80 border border-emerald-400/50 hover:scale-105 transition-all duration-200 group active:scale-95"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
        </span>
        <MessageCircle className="w-4 h-4 fill-white group-hover:rotate-6 transition-transform" />
        <span className="text-[11px] sm:text-xs">💬 Need Help / Verify a Trade</span>
      </button>
    </div>
  );
}
