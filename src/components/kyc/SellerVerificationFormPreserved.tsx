"use client";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  UploadCloud,
  AlertCircle,
  Camera,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

/**
 * PRESERVED SELLER KYC CODE (SAFELY STORED)
 * Temporarily disabled while awaiting official government certification.
 * Can be rendered at any time when KYC goes live.
 */
export function SellerVerificationFormPreserved() {
  const router = useRouter();
  const frontDocInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [frontDocUrl, setFrontDocUrl] = useState("");
  const [frontDocName, setFrontDocName] = useState("");
  const [uploadingFront, setUploadingFront] = useState(false);

  const [selfieUrl, setSelfieUrl] = useState("");
  const [selfieName, setSelfieName] = useState("");
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  const [loading, setLoading] = useState(false);
  const [existingVerification, setExistingVerification] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  const handleUploadFile = async (
    file: File,
    type: "front" | "selfie"
  ) => {
    if (!file) return;
    setError("");

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError("Please select a valid real image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit. Please choose a smaller photo.");
      return;
    }

    if (type === "front") setUploadingFront(true);
    else setUploadingSelfie(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image file.");
      }

      if (type === "front") {
        setFrontDocUrl(data.url);
        setFrontDocName(file.name);
      } else {
        setSelfieUrl(data.url);
        setSelfieName(file.name);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      if (type === "front") setUploadingFront(false);
      else setUploadingSelfie(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!frontDocUrl) {
        throw new Error("Please upload a real photo of your Government ID or Passport.");
      }
      if (!selfieUrl) {
        throw new Error("Please upload a real selfie photo holding your ID.");
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
    <div className="space-y-6">
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

      {(!existingVerification ||
        existingVerification.status === "rejected" ||
        existingVerification.status === "resubmission_required") && (
        <form
          onSubmit={handleSubmit}
          className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-6"
        >
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

          {/* Document 1: Government ID Photo */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>1. Government ID / Passport Photo</span>
              <span className="text-rose-400">*</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Upload a clear photo of the front side of your national ID, passport, or driver&apos;s license.
            </p>

            <input
              type="file"
              ref={frontDocInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file, "front");
              }}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {!frontDocUrl ? (
              <div
                onClick={() => frontDocInputRef.current?.click()}
                className="border-2 border-dashed border-pitch-border hover:border-amber-400/60 bg-pitch-card/60 hover:bg-pitch-card rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                {uploadingFront ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                    <span className="text-xs text-slate-300">Uploading ID document...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <UploadCloud className="w-7 h-7 text-amber-400" />
                    <p className="text-xs font-semibold text-slate-200">
                      Click to upload front of Government ID
                    </p>
                    <span className="text-[10px] text-slate-400">PNG, JPG, or WebP up to 10MB</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-pitch-card border border-pitch-border rounded-xl p-3 flex items-center gap-3">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-pitch-border bg-pitch-surface shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={frontDocUrl} alt="ID Document Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ID Document Attached</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{frontDocName || "government_id.jpg"}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => frontDocInputRef.current?.click()}
                    disabled={uploadingFront}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFrontDocUrl("");
                      setFrontDocName("");
                      if (frontDocInputRef.current) frontDocInputRef.current.value = "";
                    }}
                    disabled={uploadingFront}
                    className="text-xs text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Document 2: Selfie Holding ID Photo */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>2. Selfie Photo with ID</span>
              <span className="text-rose-400">*</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Hold your ID card next to your face with all information and your facial features clearly visible.
            </p>

            <input
              type="file"
              ref={selfieInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file, "selfie");
              }}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {!selfieUrl ? (
              <div
                onClick={() => selfieInputRef.current?.click()}
                className="border-2 border-dashed border-pitch-border hover:border-amber-400/60 bg-pitch-card/60 hover:bg-pitch-card rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                {uploadingSelfie ? (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2">
                    <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                    <span className="text-xs text-slate-300">Uploading selfie photo...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <UploadCloud className="w-7 h-7 text-amber-400" />
                    <p className="text-xs font-semibold text-slate-200">
                      Click to upload selfie photograph with ID
                    </p>
                    <span className="text-[10px] text-slate-400">PNG, JPG, or WebP up to 10MB</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-pitch-card border border-pitch-border rounded-xl p-3 flex items-center gap-3">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-pitch-border bg-pitch-surface shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selfieUrl} alt="Selfie with ID Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selfie Photo Attached</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{selfieName || "selfie_with_id.jpg"}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => selfieInputRef.current?.click()}
                    disabled={uploadingSelfie}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelfieUrl("");
                      setSelfieName("");
                      if (selfieInputRef.current) selfieInputRef.current.value = "";
                    }}
                    disabled={uploadingSelfie}
                    className="text-xs text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full font-semibold shadow-xl"
            isLoading={loading}
          >
            Submit Real KYC Photos for Approval
          </Button>
        </form>
      )}
    </div>
  );
}
