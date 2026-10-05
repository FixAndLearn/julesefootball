"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export interface DisputeModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onDisputeSubmitted: () => void;
}

export function DisputeModal({ orderId, isOpen, onClose, onDisputeSubmitted }: DisputeModalProps) {
  const [reason, setReason] = useState("credentials_invalid");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/escrow/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit dispute");

      onDisputeSubmitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-pitch-surface border border-pitch-border rounded-2xl shadow-2xl p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-pitch-border/60 pb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Open Escrow Dispute</h3>
            <p className="text-xs text-slate-400">Order Funds Frozen Until Resolution</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="credentials_invalid">Credentials Invalid / Cannot Log In</option>
              <option value="wrong_account_details">Account Details Do Not Match Listing</option>
              <option value="missing_players_or_coins">Missing Listed Epic Players or Coins</option>
              <option value="account_recovered_by_seller">Account Password Changed or Recovered</option>
              <option value="seller_unresponsive">Seller Unresponsive</option>
              <option value="other">Other Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Detailed Explanation</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain clearly what went wrong so platform moderators can review..."
              className="w-full rounded-lg bg-pitch-card border border-pitch-border p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <Button type="submit" variant="danger" size="md" className="w-full" isLoading={loading}>
            Submit Dispute to Moderation Queue
          </Button>
        </form>
      </div>
    </div>
  );
}
