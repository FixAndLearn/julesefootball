"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Send, CheckCircle2, Shield, Bell, Sparkles, AlertCircle, RefreshCw, Unlink, ExternalLink } from "lucide-react";

export interface SellerTelegramCardProps {
  userId: string;
  initialTelegramUsername?: string | null;
  initialTelegramChatId?: string | null;
}

export function SellerTelegramCard({
  userId,
  initialTelegramUsername,
  initialTelegramChatId,
}: SellerTelegramCardProps) {
  const [telegramUsername, setTelegramUsername] = useState<string | null>(initialTelegramUsername || null);
  const [isLinked, setIsLinked] = useState<boolean>(Boolean(initialTelegramChatId || initialTelegramUsername));
  const [testingPing, setTestingPing] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "efootballmaket_bot";
  const groupUrl = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || "https://t.me/efootballmarket254";
  const deepLink = `https://t.me/${botUsername}?start=link_${userId}`;

  const handleTestPing = async () => {
    setTestingPing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/telegram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: "success", message: "🚀 Instant ping delivered! Check your Telegram app." });
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to deliver ping." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "Network error sending test ping." });
    } finally {
      setTestingPing(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("Are you sure you want to disconnect Telegram push alerts?")) return;
    setUnlinking(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/telegram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLinked(false);
        setTelegramUsername(null);
        setFeedback({ type: "success", message: "Telegram alerts unlinked successfully." });
      } else {
        setFeedback({ type: "error", message: data.error || "Could not unlink." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "Network error unlinking Telegram." });
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className="bg-pitch-surface/95 border border-sky-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white font-display">
                Telegram Instant Push Alerts &amp; Community
              </h3>
              {isLinked ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected {telegramUsername ? `(${telegramUsername})` : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                  <Bell className="w-3 h-3" />
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Get instant sub-second alerts right on your phone when a buyer orders your squad, submits a price offer, or messages you in escrow.
            </p>
          </div>
        </div>

        {/* Community Group Pill */}
        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all shrink-0 self-start sm:self-center"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Join Group (@efootballmarket254)</span>
        </a>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Action Row */}
      <div className="mt-5 pt-4 border-t border-pitch-border/60 flex flex-wrap items-center gap-3">
        {isLinked ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestPing}
              disabled={testingPing}
              className="text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testingPing ? "animate-spin" : ""}`} />
              {testingPing ? "Sending Ping..." : "Send Test Ping"}
            </Button>
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Reconnect Bot</span>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnlink}
              disabled={unlinking}
              className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 ml-auto"
            >
              <Unlink className="w-3.5 h-3.5 mr-1" />
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              <span>Connect Telegram Alerts (1-Tap)</span>
            </a>
            <span className="text-[11px] text-slate-400">
              ⚡ Taps open Telegram Bot. Simply press <b>START</b> to connect immediately!
            </span>
          </>
        )}
      </div>
    </div>
  );
}
