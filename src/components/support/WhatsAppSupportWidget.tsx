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
    { label: "Tournament Registration & Fixtures", query: "Hello eFootball Kenya Support, I need help with tournament registration or match schedules." },
    { label: "Match Dispute & Score Verification", query: "Hello eFootball Kenya Support, I have a score conflict or match screenshot to submit." },
    { label: "Report Scammer / Fair Play Violation", query: "Hello eFootball Kenya Support, I want to report suspicious player activity or an imposter." },
    { label: "Talk to Brian Okibo (Desk Lead)", query: "Hello eFootball Kenya, I would like to speak to community lead Brian Okibo." },
  ];

  const handleLaunchWhatsApp = (text?: string) => {
    const messageToSend = text || customMessage || topics.find((t) => t.label === selectedTopic)?.query || "Hello eFootball Kenya Support!";
    const encoded = encodeURIComponent(messageToSend);
    const url = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] sm:w-[360px] rounded-3xl bg-[#111827] border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#1F2937] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#22C55E]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#F8FAFC] leading-tight">eFootball Community Desk</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
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
              Need direct assistance with tournament brackets, dispute resolution, or fair play safety? The community helpdesk is available on WhatsApp.
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
                  className="w-full text-left p-2.5 rounded-xl bg-[#1F2937] border border-slate-800 hover:border-[#22C55E]/60 hover:bg-slate-800/80 transition-all flex items-center justify-between group"
                >
                  <span className="text-slate-200 group-hover:text-emerald-300 transition-colors font-medium text-xs">
                    {item.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#22C55E] transition-transform group-hover:translate-x-0.5" />
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
                  className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 pr-9 focus:outline-none focus:border-[#22C55E]"
                />
                <button
                  type="button"
                  onClick={() => handleLaunchWhatsApp()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-[#22C55E] hover:text-emerald-300 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-[#0B1220] border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-400">
              🔒 Official Community Line: 0794400365 • Nairobi, Kenya
            </span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-2xl shadow-black/80 border border-emerald-400/50 hover:scale-105 transition-all duration-200 group"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-900" />
        </span>
        <MessageCircle className="w-4 h-4 fill-current group-hover:rotate-6 transition-transform" />
        <span className="hidden sm:inline">WhatsApp Community Support</span>
      </button>
    </div>
  );
}
