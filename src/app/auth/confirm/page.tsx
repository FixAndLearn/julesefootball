"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard/buyer";
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state change from hash fragment or session
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setStatus("success");
        setTimeout(() => {
          router.push(redirect);
          router.refresh();
        }, 1200);
      }
    });

    // Check if session is already active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("success");
        setTimeout(() => {
          router.push(redirect);
          router.refresh();
        }, 1200);
      } else {
        // If after 3 seconds no session found, route to login with verified notice
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(redirect)}&verified=1`);
        }, 3000);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [redirect, router]);

  return (
    <div className="w-full max-w-md bg-pitch-surface border border-pitch-border rounded-2xl p-8 shadow-2xl text-center space-y-4">
      {status === "verifying" ? (
        <>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">Verifying Your Email</h2>
          <p className="text-xs text-slate-400">
            Confirming your registration credentials. You will be redirected to your dashboard in a moment...
          </p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">Email Verified!</h2>
          <p className="text-xs text-slate-400">
            Welcome to eFootballMarket! Redirecting you now...
          </p>
        </>
      )}
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Verifying confirmation...</div>}>
        <AuthConfirmContent />
      </Suspense>
    </div>
  );
}
