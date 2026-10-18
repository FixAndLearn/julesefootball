"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard/buyer";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [resending, setResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (!codeSent || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [codeSent, resendCooldown]);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please provide your account email address.");
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const canonicalAppUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin || "https://www.efootballmarket.co.ke";
      const redirectTo = `${canonicalAppUrl}/auth/callback?redirect=/reset-password`;

      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setCodeSent(true);
      setResendCooldown(45);
      setInfoMessage("A password reset link and recovery code have been dispatched to your email!");
    } catch (err: any) {
      setError(err.message || "Failed to dispatch recovery email. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecoveryCode = async (codeToVerify?: string) => {
    const token = (codeToVerify || recoveryCode).trim();
    if (token.length < 6 || token.length > 8) {
      setError("Please enter the complete 6 to 8-digit recovery code from your email.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "recovery",
      });

      if (verifyErr) {
        throw new Error(verifyErr.message || "Invalid or expired recovery code. Please try again.");
      }

      // Successfully verified recovery code - redirect to password reset page
      router.push("/reset-password");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Recovery code verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    setInfoMessage("");

    try {
      const canonicalAppUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin || "https://www.efootballmarket.co.ke";
      const redirectTo = `${canonicalAppUrl}/auth/callback?redirect=/reset-password`;

      const supabase = createClient();
      const { error: resendErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resendErr) {
        throw new Error(resendErr.message);
      }

      setInfoMessage("A fresh recovery code has been dispatched to your email!");
      setResendCooldown(45);
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const handleOpenEmailApp = () => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (isAndroid) {
      window.location.href = "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_EMAIL;end";
    } else if (isIOS) {
      window.location.href = "message://";
      setTimeout(() => {
        window.location.href = "https://mail.google.com";
      }, 1000);
    } else {
      window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full max-w-md bg-pitch-surface border border-pitch-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-inner">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display">Reset Your Password</h1>
        <p className="text-xs text-slate-400 mt-1">
          Enter your registered Gmail to receive a password recovery link or code
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {!codeSent ? (
        /* Step 1: Request Email */
        <form onSubmit={handleSendResetEmail} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-pitch-border/80 text-xs text-slate-300 leading-relaxed">
            We will send a secure password reset link and code to your email. You can either tap the link in your email or enter the code below.
          </div>

          <Input
            label="Registered Email Address"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" size="lg" className="w-full font-semibold" isLoading={loading}>
            Send Password Recovery Link
          </Button>

          <div className="text-center pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      ) : (
        /* Step 2: Code Verification or Direct Email Link */
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-pitch-border text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-white">Check your Gmail inbox</p>
            <p className="text-slate-400">
              We sent a password reset message to <span className="text-amber-300 font-mono">{email}</span>. You can either tap the link in the email or type the code below:
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block text-center">
              Enter Recovery Code
            </label>
            <OtpCodeInput
              value={recoveryCode}
              onChange={(val) => {
                setRecoveryCode(val);
                setError("");
              }}
              onComplete={(completedCode) => handleVerifyRecoveryCode(completedCode)}
              length={8}
              disabled={verifying}
            />
          </div>

          <Button
            type="button"
            onClick={() => handleVerifyRecoveryCode()}
            variant="primary"
            size="lg"
            className="w-full font-bold"
            isLoading={verifying}
            disabled={recoveryCode.length < 6}
          >
            Verify Code &amp; Change Password
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleOpenEmailApp}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Launch Mail App</span>
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || resending}
              className={`font-medium ${
                resendCooldown > 0 || resending
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-amber-400 hover:text-amber-300 hover:underline"
              }`}
            >
              {resending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Code"}
            </button>
          </div>

          <div className="text-center pt-2 border-t border-pitch-border/60">
            <button
              type="button"
              onClick={() => {
                setCodeSent(false);
                setRecoveryCode("");
                setError("");
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Change Email Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading recovery...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
