"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Strength checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      });

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?message=password-updated");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please request a fresh reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-pitch-surface border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Password Updated!</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Your account password has been safely changed. Your eFootballMarket account and escrow balance are secure.
          </p>
        </div>
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs">
          Redirecting you to sign in automatically...
        </div>
        <Link href="/login">
          <Button variant="primary" size="lg" className="w-full font-bold">
            Sign In with New Password
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-pitch-surface border border-pitch-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-3 shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display">Set New Password</h1>
        <p className="text-xs text-slate-400 mt-1">
          Choose a strong password to protect your eFootballMarket account
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        {/* Security Checklist */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-pitch-border/80 text-xs space-y-2">
          <p className="font-semibold text-slate-300">Password Requirements:</p>
          <div className="space-y-1.5 text-xs">
            <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-400" : "text-slate-500"}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? "text-emerald-400" : "text-slate-500"}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Contains at least one number</span>
            </div>
            <div className={`flex items-center gap-2 ${passwordsMatch ? "text-emerald-400" : "text-slate-500"}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Passwords match</span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold"
          isLoading={loading}
          disabled={!hasMinLength || !passwordsMatch}
        >
          Save New Password
        </Button>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
            Cancel &amp; Return to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading security...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
