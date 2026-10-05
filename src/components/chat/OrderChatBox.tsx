"use client";

import { Button } from "@/components/ui/Button";
import { Message } from "@/types/database";
import { Send, Shield, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export interface OrderChatBoxProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export function OrderChatBox({ conversationId, currentUserId, initialMessages }: OrderChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputContent, setInputContent] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || sending) return;

    setSending(true);
    const content = inputContent.trim();
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

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-pitch-surface border border-pitch-border rounded-2xl flex flex-col h-[480px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-pitch-border bg-pitch-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-xs uppercase font-bold text-slate-200 tracking-wider">
            Order Secure Messaging
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Audited for Escrow
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
                <span className="inline-block text-[11px] text-slate-400 bg-pitch-card/80 border border-pitch-border px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                  isMe
                    ? "bg-brand-600 text-white rounded-br-none"
                    : "bg-pitch-card border border-pitch-border text-slate-200 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-pitch-border bg-pitch-card/60 flex items-center gap-2">
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Type a message regarding this order..."
          className="flex-1 rounded-xl bg-pitch border border-pitch-border px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
        />
        <Button type="submit" variant="primary" size="sm" isLoading={sending} disabled={!inputContent.trim()}>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}
