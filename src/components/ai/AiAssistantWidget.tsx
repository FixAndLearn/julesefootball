"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  KeyRound,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_TOPICS = [
  { label: "M-Pesa Escrow (Till 1572931)", query: "How does the Safaricom M-Pesa Till 1572931 escrow process work from start to finish?" },
  { label: "Anti-Googling Rule", query: "Why is an account with Google Play linked prohibited, and how do I verify it in-game?" },
  { label: "Change Konami Email", query: "How do I change the registered email and password on my.konami.net?" },
  { label: "Seller Not Sending 2FA Codes", query: "What should I do if the seller delivered credentials but is not sending the 2-step OTP verification code in chat?" },
  { label: "Post-Release Dispute", query: "How does raising a dispute after funds are released work, and how does the seller payout freeze?" },
  { label: "Bargaining & Make Offer", query: "How do I bargain a price and make an offer to the seller?" },
  { label: "Talk to Brian Okibo (CEO)", query: "How do I contact CEO Brian Okibo for urgent human assistance?" },
];

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your 24/7 eFootball AI Escrow Coach.\n\nI can assist you with:\n1. Safaricom M-Pesa Escrow (Till 1572931) safety.\n2. Verifying zero Google Play link (Anti-Googling rule).\n3. Step-by-step Konami ID email and 2FA transfer.\n4. Negotiating bargains and submitting offers.\n5. Handling disputes and freezing funds.\n\nTap a quick question below or type your inquiry in English or Swahili!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const data = await res.json();
      const replyText =
        data?.reply ||
        "I am ready to help you with eFootball escrow, M-Pesa payments, Anti-Googling rules, or Konami ID transfers. How can I assist you right now?";

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "Network glitch occurred, but you can always reach CEO Brian Okibo directly on WhatsApp at +254 794 400 365 or browse verified accounts safely with Till 1572931 escrow.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Chat history reset! Ask me anything about eFootball trading, M-Pesa Till 1572931 escrow, Konami ID transfers, or bargaining.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-20 md:bottom-5 left-4 sm:left-6 z-40 select-none font-sans">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`absolute bottom-16 left-0 rounded-3xl bg-pitch-surface/95 border border-pitch-border shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 flex flex-col transition-all duration-300 ${
            isExpanded
              ? "w-[92vw] sm:w-[500px] h-[85vh] max-h-[750px]"
              : "w-[90vw] sm:w-[380px] h-[75vh] max-h-[580px]"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-pitch-card to-amber-950/60 border-b border-pitch-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white leading-tight">eFootball Escrow AI</p>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-300">
                    Online 24/7
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Automated Support & Escrow Coach</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>



          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-none"
                      : "bg-pitch-card border border-pitch-border text-slate-200 rounded-tl-none space-y-1.5"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-[11px] sm:text-xs">
                    {msg.content}
                  </p>
                  <span
                    className={`block text-[9px] ${
                      msg.role === "user" ? "text-emerald-200/70 text-right" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-2.5 rounded-2xl bg-pitch-card border border-pitch-border flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-300" />
                  <span className="ml-1">AI Coach is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Escalation Footer */}
          <div className="p-3 bg-slate-900/90 border-t border-pitch-border/60 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about M-Pesa, Anti-Googling, Konami ID..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
                className="flex-1 bg-pitch-card border border-pitch-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-all shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Safaricom Till 1572931</span>
              <a
                href="https://wa.me/254794400365"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Talk to Brian Okibo (CEO)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-2xl shadow-amber-950/80 border border-amber-300/60 hover:scale-105 transition-all duration-200 group active:scale-95 cursor-pointer"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
        </span>
        <Bot className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
        <span className="text-[11px] sm:text-xs">Ask AI Escrow Coach</span>
      </button>
    </div>
  );
}
