"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, ShieldCheck, AlertCircle, KeyRound, CheckCircle2, Sparkles, Wand2 } from "lucide-react";
import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard/buyer";
  const messageParam = searchParams.get("message");

  const [authMethod, setAuthMethod] = useState<"password" | "magic-link" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState(
    messageParam === "password-updated"
      ? "Password updated successfully. Please sign in with your new password."
      : ""
  );

  // OTP & Magic Link State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!otpSent || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, resendCooldown]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("email not confirmed") ||
          authError.message.toLowerCase().includes("unconfirmed")
        ) {
          // Auto-trigger 8-digit code dispatch and transition to OTP verification tab
          try {
            const canonicalAppUrl =
              process.env.NEXT_PUBLIC_APP_URL || window.location.origin || "https://www.efootballmarket.co.ke";
            await supabase.auth.resend({
              type: "signup",
              email: email.trim(),
              options: {
                emailRedirectTo: `${canonicalAppUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
              },
            });
          } catch {
            // Non-blocking
          }
          setAuthMethod("otp");
          setOtpSent(true);
          setResendCooldown(45);
          setInfoMessage("Your email is not verified yet. We dispatched a fresh 8-digit code to your email. Enter it below to activate your account.");
          return;
        }
        throw new Error(authError.message);
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please provide your email address to receive the magic link.");
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const canonicalAppUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin || "https://www.efootballmarket.co.ke";
      const emailRedirectTo = `${canonicalAppUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`;

      const supabase = createClient();
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo,
        },
      });

      if (magicError) {
        if (
          magicError.message.toLowerCase().includes("user not found") ||
          magicError.message.toLowerCase().includes("signups not allowed")
        ) {
          throw new Error("No account found with this email. Please create an account first.");
        }
        throw new Error(magicError.message);
      }

      setOtpSent(true);
      setResendCooldown(45);
      setInfoMessage("Magic link & code dispatched! Tap the 1-click link in your Gmail or enter the 8-digit code below.");
    } catch (err: any) {
      setError(err.message || "Could not dispatch magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please provide your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const canonicalAppUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin || "https://www.efootballmarket.co.ke";
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${canonicalAppUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (otpError) {
        if (
          otpError.message.toLowerCase().includes("user not found") ||
          otpError.message.toLowerCase().includes("signups not allowed")
        ) {
          throw new Error("No account found with this email. Please register first.");
        }
        throw new Error(otpError.message);
      }

      setOtpSent(true);
      setResendCooldown(45);
      setInfoMessage("An 8-digit login code has been dispatched to your email!");
    } catch (err: any) {
      setError(err.message || "Could not dispatch code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const token = (codeToVerify || otpCode).trim();
    if (token.length < 6 || token.length > 8) {
      setError("Please enter the complete verification code from your email.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const supabase = createClient();
      let { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "email",
      });

      if (verifyErr) {
        // Fallback to signup type in case user account was awaiting confirmation
        const signupFallback = await supabase.auth.verifyOtp({
          email: email.trim(),
          token,
          type: "signup",
        });

        if (!signupFallback.error) {
          data = signupFallback.data;
          verifyErr = null;
        }
      }

      if (verifyErr) {
        throw new Error(verifyErr.message || "Invalid or expired code. Please check your email and try again.");
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    setInfoMessage("");

    try {
      const canonicalAppUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin || "https://www.efootballmarket.co.ke";
      const supabase = createClient();
      const { error: resendErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${canonicalAppUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (resendErr) {
        throw new Error(resendErr.message);
      }

      setInfoMessage("A fresh code and login link have been dispatched to your email!");
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
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-3 shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display">Welcome Back</h1>
        <p className="text-xs text-slate-400 mt-1">
          Access your eFootballMarket escrow account &amp; orders
        </p>
      </div>

      {/* 1-Tap Google Sign-In */}
      <GoogleSignInButton redirect={redirect} label="Continue with Google" />

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-pitch-border/80 w-full" />
        <span className="bg-pitch-surface px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          Or sign in with email
        </span>
        <div className="border-t border-pitch-border/80 w-full" />
      </div>

      {/* Auth Method Selector Tabs */}
      <div className="grid grid-cols-3 p-1 bg-pitch-card rounded-xl border border-pitch-border/80 text-xs">
        <button
          type="button"
          onClick={() => {
            setAuthMethod("password");
            setError("");
          }}
          className={`flex items-center justify-center gap-1.5 py-2 font-semibold rounded-lg transition-all ${
            authMethod === "password"
              ? "bg-pitch-surface text-white shadow-sm border border-pitch-border/80"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Password</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod("magic-link");
            setError("");
          }}
          className={`flex items-center justify-center gap-1.5 py-2 font-semibold rounded-lg transition-all ${
            authMethod === "magic-link"
              ? "bg-pitch-surface text-brand-400 shadow-sm border border-brand-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Magic Link</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod("otp");
            setError("");
          }}
          className={`flex items-center justify-center gap-1.5 py-2 font-semibold rounded-lg transition-all ${
            authMethod === "otp"
              ? "bg-pitch-surface text-amber-400 shadow-sm border border-amber-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>OTP Code</span>
        </button>
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

      {authMethod === "password" ? (
        /* Password Login Form */
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link
                href={`/forgot-password?redirect=${encodeURIComponent(redirect)}`}
                className="text-xs text-amber-400 hover:text-amber-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full font-semibold" isLoading={loading}>
            Sign In with Password
          </Button>
        </form>
      ) : authMethod === "magic-link" && !otpSent ? (
        /* Magic Link Request Form */
        <form onSubmit={handleSendMagicLink} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-200 leading-relaxed">
            No password required. Enter your email and we will dispatch a secure 1-click magic link directly to your Gmail inbox.
          </div>

          <Input
            label="Account Email Address"
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
            Send 1-Click Magic Link
          </Button>
        </form>
      ) : authMethod === "otp" && !otpSent ? (
        /* OTP Request Form */
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            We will dispatch an 8-digit numeric verification code to your email. Enter it to sign in without entering a password.
          </div>

          <Input
            label="Account Email Address"
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
            Send 8-Digit Code
          </Button>
        </form>
      ) : (
        /* OTP / Magic Link Verification Step */
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-pitch-border text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-white">Email Dispatched</p>
            <p className="text-slate-400">
              We sent a message to <span className="text-amber-300 font-mono">{email}</span>. You can either tap the 1-click magic link in the email or enter the 8-digit code below:
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block text-center">
              Enter 8-Digit Code
            </label>
            <OtpCodeInput
              value={otpCode}
              onChange={(val) => {
                setOtpCode(val);
                setError("");
              }}
              onComplete={(completedCode) => handleVerifyOtp(completedCode)}
              length={8}
              disabled={verifying}
            />
          </div>

          <Button
            type="button"
            onClick={() => handleVerifyOtp()}
            variant="primary"
            size="lg"
            className="w-full font-bold"
            isLoading={verifying}
            disabled={otpCode.length < 6}
          >
            Verify &amp; Sign In
          </Button>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Didn&apos;t receive it?</span>
              <button
                type="button"
                onClick={handleResendOtp}
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
                  : "Resend Code / Link"}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
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
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                  setError("");
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Change Email
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-slate-400 border-t border-pitch-border/60 pt-4">
        Don&apos;t have an account yet?{" "}
        <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-brand-400 hover:underline font-semibold">
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
