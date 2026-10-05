"use client";

import { Button } from "@/components/ui/Button";
import { Check, Copy, Eye, KeyRound, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

export interface CredentialsRevealModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmedRelease: () => void;
  onOpenDispute: () => void;
}

export function CredentialsRevealModal({
  orderId,
  isOpen,
  onClose,
  onConfirmedRelease,
  onOpenDispute,
}: CredentialsRevealModalProps) {
  const [credentials, setCredentials] = useState<{
    konamiEmail: string;
    konamiPassword: string;
    backupCodes: string | null;
    transferInstructions: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState("");

  const fetchCredentials = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/escrow/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reveal credentials");
      setCredentials(data.credentials);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRelease = async () => {
    setReleasing(true);
    setError("");
    try {
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to release escrow funds");
      onConfirmedRelease();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReleasing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-pitch-surface border border-pitch-border rounded-2xl shadow-2xl p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-pitch-border/60 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Account Credentials Vault</h3>
            <p className="text-xs text-slate-400">Authenticated Decryption</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!credentials && (
          <div className="text-center py-6">
            <p className="text-xs text-slate-300 mb-4">
              Click below to securely decrypt and retrieve your Konami ID login credentials.
            </p>
            <Button variant="primary" size="md" onClick={fetchCredentials} isLoading={loading}>
              <Eye className="w-4 h-4 mr-1.5" />
              Decrypt & Reveal Credentials
            </Button>
          </div>
        )}

        {credentials && (
          <div className="space-y-4">
            {/* Konami Email */}
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase">Konami ID / Email</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(credentials.konamiEmail, "email")}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "email" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-sm font-mono text-slate-100 font-semibold select-all">{credentials.konamiEmail}</p>
            </div>

            {/* Konami Password */}
            <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase">Password</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(credentials.konamiPassword, "password")}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  {copiedField === "password" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "password" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-sm font-mono text-slate-100 font-semibold select-all">{credentials.konamiPassword}</p>
            </div>

            {/* Backup Codes */}
            {credentials.backupCodes && (
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-400 uppercase">2FA Backup Codes</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credentials.backupCodes!, "backup")}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    {copiedField === "backup" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "backup" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-300 select-all">{credentials.backupCodes}</p>
              </div>
            )}

            {/* Instructions */}
            {credentials.transferInstructions && (
              <div className="p-3 rounded-xl bg-pitch-card/60 border border-pitch-border text-xs text-slate-300">
                <span className="font-semibold block text-slate-200 mb-1">Seller Instructions:</span>
                <p className="whitespace-pre-line">{credentials.transferInstructions}</p>
              </div>
            )}

            {/* Security Caution Box */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 space-y-1">
              <span className="font-semibold block text-amber-200">Security Recommendation:</span>
              <p>Log in immediately, update the account password, and link your own email address to the Konami ID before confirming release.</p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="gold" size="lg" className="w-full" onClick={handleRelease} isLoading={releasing}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                I Have Verified Account (Release Funds)
              </Button>
              <button
                type="button"
                onClick={onOpenDispute}
                className="text-xs text-rose-400 hover:text-rose-300 py-1 text-center font-medium"
              >
                Account does not match? Open an Escrow Dispute
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
