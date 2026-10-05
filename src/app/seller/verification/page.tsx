"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle2, ShieldCheck, Upload, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SellerVerificationPage() {
  const router = useRouter();
  const [frontDocUrl, setFrontDocUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingVerification, setExistingVerification] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/seller/verification");
        return;
      }

      const { data } = await supabase
        .from("seller_verifications")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setExistingVerification(data);
      }
    }
    loadStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/seller/verification");
        return;
      }

      const { error: insertError } = await supabase
        .from("seller_verifications")
        .insert({
          seller_id: user.id,
          id_document_front_url: frontDocUrl,
          selfie_with_id_url: selfieUrl,
          status: "pending",
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(true);
      setExistingVerification({ status: "pending" });
    } catch (err: any) {
      setError(err.message || "Failed to submit verification request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <Link
        href="/dashboard/seller"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Seller Dashboard</span>
      </Link>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Seller KYC Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Verified sellers receive the trusted badge, higher search ranking, and instant buyer confidence.
        </p>
      </div>

      {existingVerification && (
        <div className="p-5 rounded-2xl bg-pitch-surface border border-pitch-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Current Status:</span>
            <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
              {existingVerification.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {existingVerification.status === "approved"
              ? "Your seller identity has been verified. You now enjoy the verified seller badge."
              : existingVerification.status === "pending"
              ? "Your identification documents are currently in the compliance review queue."
              : "Please resubmit clear documentation below."}
          </p>
        </div>
      )}

      {(!existingVerification || existingVerification.status === "rejected" || existingVerification.status === "resubmission_required") && (
        <form onSubmit={handleSubmit} className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>KYC documents submitted successfully. Verification takes up to 24 hours.</span>
            </div>
          )}

          <Input
            label="Government ID / Passport Image URL"
            placeholder="https://storage.supabase.co/..."
            value={frontDocUrl}
            onChange={(e) => setFrontDocUrl(e.target.value)}
            helperText="Clear front photograph of national ID, passport, or driver's license."
            required
          />

          <Input
            label="Selfie Photograph with ID URL"
            placeholder="https://storage.supabase.co/..."
            value={selfieUrl}
            onChange={(e) => setSelfieUrl(e.target.value)}
            helperText="Hold your ID next to your face clearly showing your facial features."
            required
          />

          <Button type="submit" variant="gold" size="lg" className="w-full font-semibold" isLoading={loading}>
            Submit KYC for Approval
          </Button>
        </form>
      )}
    </div>
  );
}
