"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/tournaments";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-3xl p-8 shadow-xl space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#FBBF24] mx-auto mb-3 shadow-sm">
          <Trophy className="w-6 h-6 text-[#FBBF24]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#F8FAFC] font-display">Sign In to Community</h1>
        <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
          Access tournament registrations, match scoring, and player rankings
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-[#94A3B8]" />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-sm py-3 min-h-[44px] rounded-xl shadow-sm transition-all"
          isLoading={loading}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-[#94A3B8] border-t border-[#1F2937] pt-4">
        New to the Kenyan community?{" "}
        <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-[#22C55E] hover:underline font-bold">
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 bg-[#0B1220]">
      <Suspense fallback={<div className="text-[#94A3B8] text-sm">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
