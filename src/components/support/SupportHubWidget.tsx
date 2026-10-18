"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  MessageCircle,
  X,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Send,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  ExternalLink,
  PhoneCall,
  Coins,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface QuickCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  query: string;
}

const QUICK_CARDS: QuickCard[] = [
  {
    id: "escrow",
    title: "M-Pesa Escrow (Till 1572931)",
    description: "How money is secured in platform custody until you inspect the squad.",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    query: "How does the Safaricom M-Pesa Till 1572931 escrow process work from start to finish?",
  },
  {
    id: "antigoogle",
    title: "Anti-Googling Rule (Must Read)",
    description: "Why Google-linked accounts are strictly prohibited and how to check.",
    icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
    query: "Why is an account with Google Play linked prohibited, and how do I verify it in-game?",
  },
  {
    id: "konami",
    title: "Change Konami Email & 2FA",
    description: "Step-by-step guide to secure the Konami ID on my.konami.net.",
    icon: <KeyRound className="w-5 h-5 text-cyan-400" />,
    query: "How do I change the registered email and password on my.konami.net?",
  },
  {
    id: "otp",
    title: "Seller Not Sending 2FA Code",
    description: "What to do if the seller is slow or unresponsive in order chat.",
    icon: <HelpCircle className="w-5 h-5 text-purple-400" />,
    query: "What should I do if the seller delivered credentials but is not sending the 2-step OTP verification code in chat?",
  },
  {
    id: "dispute",
    title: "Raise Dispute After Release",
    description: "How to freeze seller payout if you detect an issue even after release.",
    icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
    query: "How does raising a dispute after funds are released work, and how does the seller payout freeze?",
  },
  {
    id: "bargain",
    title: "How to Bargain & Offer",
    description: "How to suggest discounts and agree on prices before payment.",
    icon: <Coins className="w-5 h-5 text-amber-300" />,
    query: "How do I bargain a price and make an offer to the seller?",
  },
];

const WHATSAPP_TOPICS = [
  {
    label: "M-Pesa STK Push / Payment Issue",
    query: "Hello Brian Okibo, I need assistance verifying an M-Pesa STK push or payment to Till 1572931 on eFootballMarket.",
  },
  {
    label: "Konami ID & Escrow Handover Help",
    query: "Hello eFootballMarket Support, I need help securing a Konami ID or completing the credentials transfer.",
  },
  {
    label: "Report a Seller or Raise Dispute",
    query: "Hello Brian, I would like to report an issue with an order and request an escrow investigation.",
  },
  {
    label: "Speak Directly to CEO Brian Okibo",
    query: "Hello Brian Okibo (CEO), I am reaching out for direct VIP assistance on eFootballMarket.",
  },
];

export function SupportHubWidget() {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/auth");

  if (isAuthRoute) {
    return null;
  }

  const isListingDetailPage = Boolean(pathname?.startsWith("/listings/") && pathname !== "/listings");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "whatsapp">("ai");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // WhatsApp Tab State
  const [selectedWhatsAppTopic, setSelectedWhatsAppTopic] = useState(WHATSAPP_TOPICS[0].label);
  const [customWhatsAppText, setCustomWhatsAppText] = useState("");

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254794400365";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-coach",
      role: "assistant",
      content:
        "Hello! I am your 24/7 AI Escrow Coach.\n\nI can help you navigate safe account purchases, Konami ID transfers, Anti-Googling rules, bargaining, and payment verification.\n\nTap any topic card below or type your inquiry in English or Swahili!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === "ai") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, activeTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
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

      if (!res.ok) {
        throw new Error("Failed to receive AI response");
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I am here to guide you. Please choose a topic or contact CEO Brian Okibo on WhatsApp.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "I am momentarily operating in offline mode. For immediate support, please switch to the WhatsApp tab above to speak directly with Brian Okibo (+254 794 400 365).",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "reset-coach",
        role: "assistant",
        content:
          "Chat reset! Tap any topic card below or type your inquiry to get instant guidance on eFootball escrow, Konami IDs, and trading rules.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleLaunchWhatsApp = () => {
    const topicObj = WHATSAPP_TOPICS.find((t) => t.label === selectedWhatsAppTopic);
    const textToSend = customWhatsAppText.trim() || topicObj?.query || "Hello eFootballMarket Support!";
    const encoded = encodeURIComponent(textToSend);
    const url = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Single Trigger Button - Elevated on Mobile to avoid collision with BottomNav or Sticky Action Bar */}
      <div
        className={`fixed ${
          isListingDetailPage ? "bottom-[4.5rem]" : "bottom-20"
        } md:bottom-6 right-4 sm:right-6 z-40 select-none font-sans`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open eFootball Support and AI Coach"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white font-bold text-xs shadow-xl shadow-emerald-950/50 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="hidden sm:inline font-display tracking-wide">Support & AI Coach</span>
          <span className="inline sm:hidden font-display">Support</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Support Hub Window */}
      {isOpen && (
        <div
          className={`fixed inset-x-3 ${
            isListingDetailPage ? "bottom-[4.5rem]" : "bottom-20"
          } sm:inset-auto sm:bottom-20 sm:right-6 sm:w-[460px] h-[580px] max-h-[82vh] z-50 flex flex-col rounded-3xl bg-[#0F172A] border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 font-sans`}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-pitch-card to-emerald-950/60 border-b border-pitch-border flex items-center justify-between shrink-0">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "ai"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Coach</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("whatsapp")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "whatsapp"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp CEO</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {activeTab === "ai" && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear chat and restart"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Support Hub"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {activeTab === "ai" ? (
            /* TAB 1: AI ESCROW COACH */
            <div className="flex-1 flex flex-col min-h-0 bg-[#0B1220]/60">
              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
                {/* Assistant Welcome / Conversation */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                        msg.role === "user"
                          ? "bg-brand-600 text-white rounded-tr-none"
                          : "bg-pitch-surface/90 border border-pitch-border text-slate-200 rounded-tl-none space-y-1.5"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-[11px] sm:text-xs">
                        {msg.content}
                      </p>
                      <p className="text-[9px] text-slate-400 text-right mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}

                {/* If conversation just started or user reset, display the visual 1-tap topic cards */}
                {messages.length <= 2 && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                        Tap a Topic for Instant Answers:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {QUICK_CARDS.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => handleSendMessage(card.query)}
                          disabled={loading}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-pitch-card hover:bg-slate-800/80 border border-pitch-border hover:border-amber-500/40 text-left transition-all active:scale-95 group"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-110 transition-transform">
                            {card.icon}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors leading-tight">
                              {card.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 mt-0.5">
                              {card.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pitch-surface/60 border border-pitch-border text-slate-400 text-xs w-fit">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>AI Escrow Coach is preparing answer...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Topic Chips when messages > 2 */}
              {messages.length > 2 && (
                <div className="px-3 py-1.5 bg-slate-900/80 border-t border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0">Quick Topics:</span>
                  {QUICK_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSendMessage(card.query)}
                      disabled={loading}
                      className="px-2.5 py-1 rounded-full bg-pitch-card hover:bg-amber-500/20 border border-pitch-border hover:border-amber-500/40 text-[10px] text-slate-300 hover:text-amber-300 transition-all shrink-0 active:scale-95 whitespace-nowrap"
                    >
                      {card.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 bg-slate-900/90 border-t border-pitch-border shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about M-Pesa escrow, Konami ID, bargaining..."
                    disabled={loading}
                    className="flex-1 bg-pitch-surface border border-pitch-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* TAB 2: WHATSAPP CEO SUPPORT */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#0B1220]/80">
              {/* Executive Profile Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-pitch-surface to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-white leading-tight">Brian Okibo</h3>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-300">
                        CEO
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Platform Founder & Escrow Administrator</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-300 font-semibold">+254 794 400 365 (Online)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Topic */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Select Assistance Topic:
                </span>
                <div className="space-y-1.5">
                  {WHATSAPP_TOPICS.map((topic) => {
                    const isSelected = selectedWhatsAppTopic === topic.label;
                    return (
                      <button
                        key={topic.label}
                        type="button"
                        onClick={() => {
                          setSelectedWhatsAppTopic(topic.label);
                          setCustomWhatsAppText(topic.query);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                            : "bg-pitch-surface/60 border-pitch-border text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="font-semibold text-[11px] leading-tight">{topic.label}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isSelected ? "text-emerald-400 rotate-90" : "text-slate-500"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Details Preview / Edit */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Message Details (Optional Note):
                </span>
                <textarea
                  rows={3}
                  value={customWhatsAppText}
                  onChange={(e) => setCustomWhatsAppText(e.target.value)}
                  placeholder="Include your Order ID or phone number if you have an active transaction..."
                  className="w-full bg-pitch-surface border border-pitch-border rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 transition-colors resize-none"
                />
              </div>

              {/* Launch WhatsApp Button */}
              <button
                type="button"
                onClick={handleLaunchWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Launch WhatsApp (+254 794 400 365)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-normal">
                Direct WhatsApp assistance is monitored by Brian Okibo for order mediation, payment issues, and account security.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
