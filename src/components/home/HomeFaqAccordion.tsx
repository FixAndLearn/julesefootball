"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  badge?: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does Safaricom M-Pesa Escrow (Till 1572931) protect my money?",
    answer:
      "When you purchase an account or hire our middleman service, your funds are deposited directly into our official Safaricom Lipa Na M-Pesa Till Number 1572931. The money is held securely in escrow and is NOT released to the seller until you receive the Konami ID credentials, log in on your device, and verify the squad during your mandatory 24-hour inspection window.",
    badge: "Buyer Protection",
  },
  {
    question: "What happens during the mandatory 24-Hour Buyer Inspection Window?",
    answer:
      "Once the seller submits login credentials, your 24-hour countdown begins. You log in to eFootball Mobile, verify the team OVR, Epic booster players, coin/GP balance, and link your own email. If the squad does not match the listing or you encounter any security issues, you can click 'Open Dispute' to freeze funds instantly for manual administrator review.",
    badge: "Security Standard",
  },
  {
    question: "What is Bring-Your-Own-Deal Middleman Escrow?",
    answer:
      "If you negotiate an eFootball trade outside on WhatsApp, TikTok, or Facebook groups, you can protect yourselves from getting scammed by bringing the deal to our Middleman desk. The buyer deposits the agreed price to Till 1572931, the seller hands over credentials through our secure portal, and payout is sent to the seller only after both parties confirm satisfaction.",
    badge: "P2P Escrow",
  },
  {
    question: "How are eFootball tournament prizes disbursed?",
    answer:
      "All competitive knockout tournaments hosted on eFootballMarket have guaranteed prize pools. Once match brackets finish and scores are confirmed with match screenshots, winnings are sent directly to the champion's and runner-up's Safaricom M-Pesa numbers within 15 minutes by desk lead Brian Okibo (0794400365).",
    badge: "Instant Payouts",
  },
  {
    question: "What is eFootballMarket's relationship with Konami Digital Entertainment?",
    answer:
      "eFootballMarket is an independent Kenyan peer-to-peer escrow intermediary and community organization. We are not endorsed by, sponsored by, or affiliated with Konami Digital Entertainment. As noted in Konami's official terms of service, buying, selling, and sharing game account credentials is prohibited by the game publisher and may risk account termination.",
    badge: "Legal Notice",
  },
];

export function HomeFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all ${
              isOpen
                ? "bg-[#111827] border-slate-700 shadow-xl"
                : "bg-[#0F172A]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#111827]/60"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-[#22C55E] flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                  0{idx + 1}
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
                    {faq.question}
                  </h4>
                  {faq.badge && (
                    <span className="inline-block text-[10px] uppercase font-bold text-slate-400 mt-1">
                      {faq.badge}
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#22C55E]" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 animate-in fade-in duration-200">
                <p className="mt-2">{faq.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
