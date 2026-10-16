"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { Lock, Mail, Phone, Trophy, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/tournaments";

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
      setError("You must accept the Community Terms of Service and Privacy Policy.");
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
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
            username,
            phone_number: internationalPhone,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Automatically initialize or sync user profile
      if (authData.user) {
        try {
          const { error: profileError } = await supabase.from("profiles").upsert(
            {
              id: authData.user.id,
              username,
              full_name: `${firstName} ${lastName}`.trim(),
              phone_number: internationalPhone,
              role: "user",
              is_verified_seller: false,
              reputation_score: 100,
              total_sales_count: 0,
              successful_trades_count: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          if (profileError) {
            console.warn("Profile initial upsert note:", profileError.message);
          }
        } catch (profileErr) {
          console.warn("Profile setup caught:", profileErr);
        }

        // Send internal registration alert asynchronously
        try {
          fetch("/api/auth/register-alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: authData.user.id,
              email,
              username,
              fullName: `${firstName} ${lastName}`.trim(),
              phoneNumber: internationalPhone,
            }),
          }).catch(() => {});
        } catch (_) {}
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-3xl p-8 shadow-xl space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24] mx-auto mb-3 shadow-sm">
          <Trophy className="w-6 h-6 text-[#FBBF24]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#F8FAFC] font-display">Create Community Account</h1>
        <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
          Join Kenya&apos;s eFootball community to compete in 1v1 cups and track match rankings
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            autoComplete="given-name"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            autoComplete="family-name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Gamer Tag / Username"
          autoComplete="username"
          placeholder="pesmaster254"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="w-4 h-4 text-[#94A3B8]" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="player@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-[#94A3B8]" />}
          required
        />

        <Input
          label="Phone Number (WhatsApp & Match Coordination)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0794400365"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          leftIcon={<Phone className="w-4 h-4 text-[#22C55E]" />}
          helperText="Auto-formats to (+254) for official match communication"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-[#94A3B8]" />}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-[#94A3B8]" />}
            required
          />
        </div>

        <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 rounded bg-[#1F2937] border-[#374151] text-[#22C55E] focus:ring-[#22C55E] h-4 w-4"
          />
          <span className="text-xs text-[#94A3B8] leading-relaxed">
            I agree to the <Link href="/terms" className="text-[#22C55E] hover:underline font-semibold">Terms of Service</Link> and <Link href="/privacy" className="text-[#22C55E] hover:underline font-semibold">Privacy Policy</Link>.
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-sm py-3 min-h-[44px] rounded-xl shadow-sm transition-all"
          isLoading={loading}
        >
          Create Community Account
        </Button>
      </form>

      <div className="text-center text-xs text-[#94A3B8] border-t border-[#1F2937] pt-4">
        Already have a member account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-[#22C55E] hover:underline font-bold">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 bg-[#0B1220]">
      <Suspense fallback={<div className="text-[#94A3B8] text-sm">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
