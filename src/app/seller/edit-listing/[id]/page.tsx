"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  UploadCloud,
  Zap,
  AlertCircle,
  Loader2,
  Camera,
  Save,
  Eye,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Listing } from "@/types/database";
import { watermarkSquadImage } from "@/lib/utils/watermark";
import { calculateEscrowCommission } from "@/lib/utils/commission";

interface UploadedImage {
  url: string;
  fileName: string;
  size: number;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, loading: authLoading, displayName } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Streamlined Essential Listing Fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("android");
  const [overallStrength, setOverallStrength] = useState("");
  const [coinBalance, setCoinBalance] = useState("");
  const [managerName, setManagerName] = useState("");
  const [status, setStatus] = useState("published");

  // Real Squad Images State (Up to 5 HD screenshots)
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Load existing listing
  useEffect(() => {
    if (!id) return;

    async function loadListing() {
      try {
        setInitialLoading(true);
        setError("");
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();

        if (!res.ok || !data.listing) {
          throw new Error(data.error || "Failed to load listing.");
        }

        const l: Listing = data.listing;

        // Check ownership if user is already loaded
        if (user && l.seller_id !== user.id) {
          setError("You do not have permission to edit this listing.");
          setInitialLoading(false);
          return;
        }

        setTitle(l.title || "");
        setPrice(String(l.price || ""));
        setPlatform(l.platform || "android");
        setOverallStrength(String(l.overall_team_strength || ""));
        setCoinBalance(String(l.coin_balance ?? 0));
        setManagerName(l.manager_name || "");
        setStatus(l.status || "published");

        if (l.images && l.images.length > 0) {
          setImages(
            l.images.map((img) => ({
              url: img.image_url,
              fileName: "Squad Screenshot",
              size: 0,
            }))
          );
        }
      } catch (err: any) {
        setError(err.message || "Could not fetch listing details.");
      } finally {
        setInitialLoading(false);
      }
    }

    loadListing();
  }, [id, user]);

  // Upload handler for up to 5 HD screenshots
  const handleFilesUpload = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError("");

    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      setUploadError("Maximum 5 squad images allowed. Please remove an image first to upload another.");
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, remainingSlots);
    if (Array.from(fileList).length > remainingSlots) {
      setUploadError(`Only ${remainingSlots} more image(s) could be added (maximum 5 screenshots allowed).`);
    }

    setUploadingImages(true);

    try {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      const newUploaded: UploadedImage[] = [];

      for (const file of filesToUpload) {
        if (!validTypes.includes(file.type.toLowerCase())) {
          throw new Error(`"${file.name}" is not supported. Please upload a real PNG, JPG, or WebP screenshot.`);
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds 10MB limit.`);
        }

        // Apply high-fidelity watermark to protect screenshots while preserving HD quality (quality 0.98)
        let processedFile = file;
        try {
          processedFile = await watermarkSquadImage(file, {
            sellerUsername: displayName || "Trader",
            websiteUrl: "efootballmarket.co.ke",
          });
        } catch (wmErr) {
          console.warn("Watermark note:", wmErr);
        }

        const formData = new FormData();
        formData.append("file", processedFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        newUploaded.push({
          url: data.url,
          fileName: file.name,
          size: file.size,
        });
      }

      setImages((prev) => [...prev, ...newUploaded]);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image(s). Please try again.");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setUploadError("");
  };

  const handleSetPrimaryCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!title.trim()) {
        throw new Error("Please enter a listing title for your eFootball squad.");
      }

      if (!price || Number(price) < 100) {
        throw new Error("Listing price must be at least 100 KES.");
      }

      if (!overallStrength || Number(overallStrength) < 2000) {
        throw new Error("Overall Team Strength (OVR) is required and must be at least 2000 (e.g. 3120).");
      }

      if (images.length === 0) {
        throw new Error("Please retain at least one real squad screenshot (up to 5 images allowed) in HD quality.");
      }

      const coins = coinBalance ? Number(coinBalance) : 0;
      const coach = managerName.trim();
      const finalDescription = `${title.trim()} - Verified ${platform.replace(/_/g, " ")} eFootball account with ${overallStrength} OVR collective strength, ${coins.toLocaleString()} eFootball coins${coach ? `, managed by ${coach}` : ""}. Full Safaricom Till 1572931 escrow protection with 24-hour buyer inspection window.`;

      const payload = {
        title: title.trim(),
        description: finalDescription,
        price: Number(price),
        platform,
        overall_team_strength: Number(overallStrength),
        coin_balance: coins,
        manager_name: coach || null,
        status,
        image_urls: images.map((img) => img.url),
      };

      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update listing. Please verify your details.");
      }

      setSuccessMessage("Listing updated successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/listings/${id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to update listing.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete/archive this listing? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete listing.");
      }

      router.push("/dashboard/seller");
    } catch (err: any) {
      setError(err.message || "Failed to delete listing.");
      setDeleting(false);
    }
  };

  if (initialLoading || authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading listing details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Navigation & Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/listings/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listing</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/listings/${id}`}>
            <Button variant="secondary" size="sm">
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Edit eFootball Account Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Update squad attributes, pricing, head coach, and HD squad screenshots (up to 5 photos).
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Streamlined Card: Squad Details */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-pitch-border/60 pb-3">
            <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Squad Information</span>
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-pitch-card border border-pitch-border rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="published">Published</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* 1. Listing Title */}
          <div className="space-y-1.5">
            <Input
              label="Listing Title"
              placeholder="e.g. 3200 OVR Squad | 105 Messi + Booster Vieira | 850 Coins"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 2. Grid of Core Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price (KES) */}
            <div className="space-y-1.5">
              <Input
                label="Listing Price (KES)"
                type="number"
                placeholder="e.g. 4500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <div className="pt-0.5 flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Quick set:</span>
                <button
                  type="button"
                  onClick={() => setPrice("2500")}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                    price === "2500"
                      ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                      : "bg-pitch-card border-pitch-border text-slate-300 hover:border-amber-400/50"
                  }`}
                >
                  KES 2,500
                </button>
                <button
                  type="button"
                  onClick={() => setPrice("4500")}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                    price === "4500"
                      ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                      : "bg-pitch-card border-pitch-border text-slate-300 hover:border-amber-400/50"
                  }`}
                >
                  KES 4,500
                </button>
              </div>

              {Number(price) > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Escrow Commission (5% based on value):</span>
                    <span className="font-semibold text-amber-400">
                      KES {calculateEscrowCommission(Number(price)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-emerald-800/40 pt-1">
                    <span>Your Net M-Pesa Payout:</span>
                    <span className="text-emerald-300 font-mono">
                      KES {(Number(price) - calculateEscrowCommission(Number(price))).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tiered fee: KES 50 (min) to KES 500 (max) platform custody &amp; inspection protection.
                  </p>
                </div>
              )}
            </div>

            {/* Gaming Platform */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Gaming Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="android">Android Mobile</option>
                <option value="ios">iOS Mobile</option>
                <option value="pc_steam">PC / Steam</option>
                <option value="playstation_4">PlayStation 4</option>
                <option value="playstation_5">PlayStation 5</option>
                <option value="xbox_one">Xbox One</option>
                <option value="xbox_series_x">Xbox Series X/S</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Select the device OS this squad is played on.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Overall Team Strength (OVR) */}
            <div className="space-y-1">
              <Input
                label="Overall Team Strength (OVR)"
                type="number"
                placeholder="e.g. 3120"
                value={overallStrength}
                onChange={(e) => setOverallStrength(e.target.value)}
                required
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                <span>Quick:</span>
                <button
                  type="button"
                  onClick={() => setOverallStrength("3120")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  3120
                </button>
                <button
                  type="button"
                  onClick={() => setOverallStrength("3150")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  3150
                </button>
                <button
                  type="button"
                  onClick={() => setOverallStrength("3200")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  3200
                </button>
              </div>
            </div>

            {/* Number of eFootball Coins */}
            <div className="space-y-1">
              <Input
                label="Number of eFootball Coins"
                type="number"
                placeholder="e.g. 850"
                value={coinBalance}
                onChange={(e) => setCoinBalance(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                <span>Quick:</span>
                <button
                  type="button"
                  onClick={() => setCoinBalance("0")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setCoinBalance("500")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  500
                </button>
                <button
                  type="button"
                  onClick={() => setCoinBalance("1500")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  1500
                </button>
              </div>
            </div>

            {/* Head Coach / Manager */}
            <div className="space-y-1">
              <Input
                label="Head Coach / Manager"
                placeholder="e.g. Pep Guardiola or L. Roman"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                <span>Quick:</span>
                <button
                  type="button"
                  onClick={() => setManagerName("Pep Guardiola")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  Guardiola
                </button>
                <button
                  type="button"
                  onClick={() => setManagerName("L. Roman")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  L. Roman
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Real Squad Screenshots (HD Quality, Up to 5 Images) */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-pitch-border/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Squad Screenshots (HD Quality)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload up to 5 real in-game screenshots (Starting XI, Substitutes, Reserves &amp; Trainer). Full HD resolution is maintained.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-emerald-400 shrink-0">
              {images.length}/5 Uploaded
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Drag & Drop Upload Zone */}
          {images.length < 5 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                isDragOver
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700/80 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900"
              }`}
            >
              {uploadingImages ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-300 font-medium">Processing &amp; uploading screenshots in HD...</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white">
                    Click to browse or drag &amp; drop squad screenshots here
                  </p>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG, or WebP up to 10MB each • Full HD quality preserved
                  </p>
                </>
              )}
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Image Thumbnails Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={img.url}
                  className={`group relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 border ${
                    idx === 0 ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-800"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Squad screenshot ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Cover Badge */}
                  {idx === 0 ? (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-slate-950 font-black text-[9px] flex items-center gap-1 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Cover</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryCover(idx)}
                      className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 hover:bg-emerald-600 text-white hover:text-slate-950 font-bold text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Set Cover
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-600/90 text-white hover:bg-rose-500 transition-colors shadow-md"
                    title="Remove screenshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/listings/${id}`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving || uploadingImages}
            isLoading={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-950/40"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
