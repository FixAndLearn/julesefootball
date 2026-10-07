"use client";

import { MpesaPaymentModal } from "@/components/payments/MpesaPaymentModal";
import { Button } from "@/components/ui/Button";
import { detectProhibitedOffPlatformContent } from "@/lib/security/chatFilter";
import { formatCurrency } from "@/lib/utils";
import { Message, OrderStatus } from "@/types/database";
import {
  AlertTriangle,
  Lock,
  Send,
  Shield,
  Smartphone,
  X,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export interface OrderChatBoxProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  orderId?: string;
  orderNumber?: string;
  orderStatus?: OrderStatus | string;
  isBuyer?: boolean;
  totalAmount?: number;
  currency?: string;
  onPaymentSuccess?: () => void;
}

export function OrderChatBox({
  conversationId,
  currentUserId,
  initialMessages,
  orderId,
  orderNumber,
  orderStatus,
  isBuyer = false,
  totalAmount,
  currency = "KES",
  onPaymentSuccess,
}: OrderChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputContent, setInputContent] = useState("");
  const [sending, setSending] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<{
    message: string;
    category?: string;
  } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPendingPayment = orderStatus === "payment_pending";

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time synchronization: poll messages every 3000ms
  const pollMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (
              data.messages.length !== prev.length ||
              (data.messages.length > 0 &&
                data.messages[data.messages.length - 1]?.id !== prev[prev.length - 1]?.id)
            ) {
              return data.messages;
            }
            return prev;
          });
        }
      }
    } catch {
      // Non-blocking background sync
    }
  }, [conversationId]);

  useEffect(() => {
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [pollMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || sending) return;

    // 1. Client-Side Payment Gate Check: Block message if order is unpaid
    if (isPendingPayment) {
      setSecurityAlert({
        message: isBuyer
          ? "🔒 Escrow Payment Gate: You must trigger and complete the Lipa Na M-Pesa STK Push before messaging the seller."
          : "🔒 Communication Locked: Waiting for buyer to settle payment into escrow before messaging is enabled.",
      });
      return;
    }

    const content = inputContent.trim();

    // 2. Client-Side Anti-Circumvention Shield (WhatsApp, Telegram, Links, Phone numbers)
    const filterCheck = detectProhibitedOffPlatformContent(content);
    if (filterCheck.isBlocked) {
      // Wipe the input directly (instant delete requirement)
      setInputContent("");
      setSecurityAlert({
        message:
          filterCheck.userWarningMessage ||
          "⚠️ Prohibited: Sharing off-platform contacts (WhatsApp, Telegram, links, phone numbers) is strictly not allowed and deleted directly.",
        category: filterCheck.matchedCategory,
      });
      return;
    }

    setSending(true);
    setSecurityAlert(null);
    setInputContent("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content,
          messageType: "text",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Server rejected message (anti-circumvention or payment gate)
        setSecurityAlert({
          message:
            data.userWarningMessage ||
            data.error ||
            "Message was blocked by security audit.",
          category: data.category,
        });
        return;
      }

      if (data.success && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-pitch-surface border border-pitch-border rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-pitch-border bg-pitch-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isPendingPayment ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
            }`}
          />
          <h3 className="text-xs uppercase font-bold text-slate-200 tracking-wider">
            {isPendingPayment ? "Order Chat (Locked)" : "Order Secure Messaging"}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Anti-Fraud Audited
        </span>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isSystem = msg.message_type === "system";

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="inline-block text-[11px] text-slate-400 bg-pitch-card/90 border border-pitch-border px-3.5 py-1.5 rounded-full shadow-sm leading-relaxed max-w-sm">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
                  isMe
                    ? "bg-brand-600 text-white rounded-br-none"
                    : "bg-pitch-card border border-pitch-border text-slate-200 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Anti-Circumvention / Payment Warning Banner */}
      {securityAlert && (
        <div className="mx-3 my-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start justify-between gap-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Security Warning: Prohibited Activity</p>
              <p className="text-[11px] text-rose-200/95 leading-relaxed mt-0.5">
                {securityAlert.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSecurityAlert(null)}
            className="text-rose-400 hover:text-white p-1 rounded-lg shrink-0"
            aria-label="Dismiss warning"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input or Locked Gate Footer */}
      {isPendingPayment ? (
        <div className="p-4 border-t border-pitch-border bg-pitch-card/90 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-amber-200">
                {isBuyer ? "Payment Required Before Messaging" : "Buyer Payment Pending"}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isBuyer
                  ? "You must trigger and complete the Lipa Na M-Pesa STK Push payment before messaging the seller."
                  : "Messaging will unlock automatically once the buyer completes the Lipa Na M-Pesa STK Push into escrow."}
              </p>
            </div>
          </div>

          {isBuyer && orderId && totalAmount && (
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full text-xs font-bold shadow-md"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1.5" />
              Pay {formatCurrency(totalAmount, currency)} via M-Pesa STK Push Now
            </Button>
          )}
        </div>
      ) : (
        <div className="border-t border-pitch-border bg-pitch-card/60">
          {/* Quick Handover Helper Chips */}
          <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {isBuyer ? (
              <>
                <button
                  type="button"
                  onClick={() => setInputContent("Please send the Konami login verification code")}
                  className="whitespace-nowrap px-2 py-0.5 rounded-md bg-pitch border border-pitch-border text-slate-300 hover:text-white hover:border-brand-500/50 transition-colors"
                >
                  🔑 Request Login Code
                </button>
                <button
                  type="button"
                  onClick={() => setInputContent("I requested email change, please send the confirmation code")}
                  className="whitespace-nowrap px-2 py-0.5 rounded-md bg-pitch border border-pitch-border text-slate-300 hover:text-white hover:border-brand-500/50 transition-colors"
                >
                  📧 Request Email Change Code
                </button>
                <button
                  type="button"
                  onClick={() => setInputContent("I have updated both password and email to my own!")}
                  className="whitespace-nowrap px-2 py-0.5 rounded-md bg-pitch border border-pitch-border text-slate-300 hover:text-white hover:border-brand-500/50 transition-colors"
                >
                  ✅ Updated Both!
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setInputContent("Checking my email for the Konami code now...")}
                  className="whitespace-nowrap px-2 py-0.5 rounded-md bg-pitch border border-pitch-border text-slate-300 hover:text-white hover:border-brand-500/50 transition-colors"
                >
                  ⏳ Checking Email for Code...
                </button>
                <button
                  type="button"
                  onClick={() => setInputContent("Your Konami verification code is: ")}
                  className="whitespace-nowrap px-2 py-0.5 rounded-md bg-pitch border border-pitch-border text-slate-300 hover:text-white hover:border-brand-500/50 transition-colors"
                >
                  🔢 Send Code
                </button>
                <button
                  type="button"
                  onClick={() => setInputContent("Please link your email in Konami settings and let me know")}
                  className="whitespace-nowrap px-2 py-0.5 rounded-md bg-pitch border border-pitch-border text-slate-300 hover:text-white hover:border-brand-500/50 transition-colors"
                >
                  📩 Link Your Email
                </button>
              </>
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 pt-1.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputContent}
              onChange={(e) => {
                setInputContent(e.target.value);
                if (securityAlert) setSecurityAlert(null);
              }}
              placeholder="Type message or 2FA verification code..."
              className="flex-1 rounded-xl bg-pitch border border-pitch-border px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={sending}
              disabled={!inputContent.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Payment Modal for Quick Pay */}
      {orderId && (
        <MpesaPaymentModal
          orderId={orderId}
          orderNumber={orderNumber || ""}
          amount={totalAmount || 0}
          currency={currency}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            if (onPaymentSuccess) {
              onPaymentSuccess();
            } else {
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
}
