"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, Phone, ShieldCheck, User, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard/buyer";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!emailConfirmationSent || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [emailConfirmationSent, resendCooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms of service and escrow rules.");
      setLoading(false);
      return;
    }

    // Normalize phone number to strict international E.164 format (+254XXXXXXXXX)
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized.isValid) {
      setError("Please enter a valid phone number (e.g., 0794400365 or +254794400365).");
      setLoading(false);
      return;
    }

    const internationalPhone = normalized.international;

    try {
      // Always enforce the canonical custom domain for email redirects (never vercel.app)
      const canonicalAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.efootballmarket.co.ke";
      const emailRedirectTo = `${canonicalAppUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`;

      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username.toLowerCase().trim(),
            phone_number: internationalPhone,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Insert profile row with international phone
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          username: username.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          phone_number: internationalPhone,
          country: "KEN",
          is_verified_seller: false,
          available_balance: 0.0,
          escrow_balance: 0.0,
        });

        // Assign default buyer role
        await supabase.from("user_roles").upsert({
          user_id: authData.user.id,
          role_id: "buyer",
        });

        // Dispatch instant automated WhatsApp notification to Brian Okibo (+254794400365)
        try {
          fetch("/api/auth/register-alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: username.toLowerCase().trim(),
              email,
              phoneNumber: internationalPhone,
            }),
          }).catch(() => {});
        } catch {
          // Non-blocking
        }
      }

      // Mandate 6-digit email OTP verification before dashboard access (scam prevention)
      setEmailConfirmationSent(true);
      setLoading(false);
      return;
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const token = (codeToVerify || code).trim();
    if (token.length < 6 || token.length > 8) {
      setError("Please enter the complete verification code from your email.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const supabase = createClient();
      let { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (verifyErr) {
        // Fallback to email OTP type
        const fallback = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });
        data = fallback.data;
        verifyErr = fallback.error;
      }

      if (verifyErr) {
        throw new Error(verifyErr.message || "Invalid or expired verification code. Please check and try again.");
      }

      if (data?.session) {
        router.push(redirect);
        router.refresh();
      } else {
        await supabase.auth.signInWithPassword({ email, password });
        router.push(redirect);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Code verification failed. Please check the code and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    setResendMessage("");

    try {
      const supabase = createClient();
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: "https://www.efootballmarket.co.ke/auth/callback",
        },
      });

      if (resendErr) {
        throw new Error(resendErr.message);
      }

      setResendMessage("A new verification code has been dispatched to your email!");
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

  if (emailConfirmationSent) {
    return (
      <div className="w-full max-w-md bg-pitch-surface border border-pitch-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-white font-display">Enter Verification Code</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter the verification code sent to <strong className="text-amber-400 font-mono font-semibold">{email}</strong>.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resendMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resendMessage}</span>
          </div>
        )}

        {/* Dynamic 8-Digit OTP Box Input */}
        <div className="py-2">
          <OtpCodeInput
            value={code}
            length={8}
            onChange={(val) => {
              setCode(val);
              setError("");
            }}
            onComplete={handleVerifyCode}
            disabled={verifying}
            autoFocus={true}
          />
        </div>

        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={() => handleVerifyCode()}
          isLoading={verifying}
          disabled={code.length < 6 || verifying}
          className="w-full font-bold shadow-lg"
        >
          Verify Code &amp; Start Trading
        </Button>

        {/* Resend & App Launcher Controls */}
        <div className="flex flex-col gap-3 pt-2 text-xs border-t border-pitch-border/60">
          <div className="flex items-center justify-between text-slate-400">
            <span>Didn&apos;t get the code?</span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || resending}
              className="text-amber-400 hover:text-amber-300 font-semibold disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {resending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Code"}
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
                setEmailConfirmationSent(false);
                setCode("");
                setError("");
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-2xl space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display">Create Your Account</h1>
        <p className="text-xs text-slate-400 mt-1">
          Join the verified eFootball trading network with institutional escrow
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Tap Google Registration */}
      <GoogleSignInButton redirect={redirect} label="Sign up with Google" />

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-pitch-border/80 w-full" />
        <span className="bg-pitch-surface px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          Or register with email
        </span>
        <div className="border-t border-pitch-border/80 w-full" />
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            autoComplete="given-name"
            placeholder="e.g. John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            autoComplete="family-name"
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Username"
          autoComplete="username"
          placeholder="e.g. pesmaster254"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

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

        <Input
          label="Phone Number (WhatsApp & M-Pesa Escrow)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0794400365 or +254 794 400 365"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          leftIcon={<Phone className="w-4 h-4 text-emerald-400" />}
          helperText="Auto-formats to international standard (+254) for WhatsApp & Lipa Na M-Pesa"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
        </div>

        <label className="flex items-start gap-2 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 rounded bg-pitch-card border-pitch-border text-brand-600 focus:ring-brand-500"
          />
          <span className="text-xs text-slate-400">
            I agree to the <Link href="/terms" className="text-brand-400 hover:underline">Terms of Service</Link>, <Link href="/escrow-guarantee" className="text-brand-400 hover:underline">Escrow Rules</Link>, and acknowledge that all transactions are permanently audited.
          </span>
        </label>

        <Button type="submit" variant="primary" size="lg" className="w-full font-semibold" isLoading={loading}>
          Create Production Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-pitch-border/60 pt-4">
        Already have an account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-brand-400 hover:underline font-semibold">
          Log In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
