"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { Lock, Mail, Phone, ShieldCheck, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

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

      // If Supabase requires email confirmation, attempt immediate auto-login in case auto-confirm is active
      if (authData.user && !authData.session) {
        const { data: directLogin } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (directLogin?.session) {
          router.push(redirect);
          router.refresh();
          return;
        }

        setEmailConfirmationSent(true);
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmailApp = () => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (isAndroid) {
      // Launch default native Android email app directly without web login prompt
      window.location.href = "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_EMAIL;end";
    } else if (isIOS) {
      // iOS Mail / Gmail scheme
      window.location.href = "message://";
      setTimeout(() => {
        window.location.href = "https://mail.google.com";
      }, 1000);
    } else {
      window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
    }
  };

  const handleInstantSignIn = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data?.session) {
        router.push(redirect);
        router.refresh();
        return;
      }

      router.push(`/login?redirect=${encodeURIComponent(redirect)}&email=${encodeURIComponent(email)}`);
    } catch {
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    } finally {
      setLoading(false);
    }
  };

  if (emailConfirmationSent) {
    return (
      <div className="w-full max-w-lg bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
          <Mail className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Account Registered!</h2>
          <p className="text-sm text-slate-300 mt-2">
            Verification link sent to <strong className="text-white font-semibold">{email}</strong>.
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Tap the button below to launch your email app, or sign in directly if your account is verified.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-300 space-y-2 text-left">
          <span className="font-bold text-amber-300 block">Fast Setup:</span>
          <p>1. Open your mail app and tap the confirmation link.</p>
          <p>2. Or tap &quot;Log In to Dashboard&quot; below to enter immediately.</p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleOpenEmailApp}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Open Email App</span>
            </button>
            <button
              type="button"
              onClick={handleInstantSignIn}
              disabled={loading}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Log In to Dashboard</span>
            </button>
          </div>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="text-center text-xs text-slate-400 hover:text-slate-200 transition-colors pt-1"
          >
            Prefer regular sign-in? Go to Login page →
          </Link>
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
