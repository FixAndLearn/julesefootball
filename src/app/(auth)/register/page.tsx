"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
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

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username.toLowerCase().trim(),
            phone_number: phoneNumber,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Insert profile row
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          username: username.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
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
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
            placeholder="e.g. John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Username"
          placeholder="e.g. pesmaster254"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Safaricom Phone Number (for M-Pesa Escrow)"
          type="text"
          placeholder="0712345678 or 254712345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
          helperText="Required for instant M-Pesa STK push and seller balance withdrawals"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••••••"
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
