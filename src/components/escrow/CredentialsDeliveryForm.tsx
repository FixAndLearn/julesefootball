"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { useState } from "react";

export interface CredentialsDeliveryFormProps {
  orderId: string;
  onDelivered: () => void;
}

export function CredentialsDeliveryForm({ orderId, onDelivered }: CredentialsDeliveryFormProps) {
  const [konamiEmail, setKonamiEmail] = useState("");
  const [konamiPassword, setKonamiPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/escrow/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          konamiEmail: konamiEmail.trim(),
          konamiPassword: konamiPassword.trim(),
          backupCodes: backupCodes.trim() || undefined,
          transferInstructions: instructions.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to deliver credentials");
      }

      setSuccess(true);
      setTimeout(() => {
        onDelivered();
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3 border-b border-pitch-border/60 pb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Deliver Account Credentials</h3>
          <p className="text-xs text-slate-400">
            Credentials are encrypted with AES-256-GCM before entering the database.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Credentials encrypted & saved successfully! Updating order status...</span>
        </div>
      )}

      <Input
        label="Konami ID Email / Username"
        type="text"
        placeholder="konami-account@example.com or Username"
        value={konamiEmail}
        onChange={(e) => setKonamiEmail(e.target.value)}
        required
      />

      <Input
        label="Konami ID Password"
        type="password"
        placeholder="••••••••••••"
        value={konamiPassword}
        onChange={(e) => setKonamiPassword(e.target.value)}
        required
      />

      <Input
        label="2-Step Verification Backup Codes (Optional)"
        type="text"
        placeholder="e.g. 123456, 789012"
        value={backupCodes}
        onChange={(e) => setBackupCodes(e.target.value)}
        helperText="Provide if 2-Step Verification was enabled on the Konami ID."
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300">
          Special Transfer Instructions (Optional)
        </label>
        <textarea
          rows={3}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. Please log in on Android, unlink Google Play, and bind your own email in Konami settings."
          className="w-full rounded-lg bg-pitch-card border border-pitch-border p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      <Button type="submit" variant="gold" size="md" className="w-full" isLoading={loading || success}>
        {success ? "Delivered!" : "Encrypt & Deliver to Buyer"}
      </Button>
    </form>
  );
}
