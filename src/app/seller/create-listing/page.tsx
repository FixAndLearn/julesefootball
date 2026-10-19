"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  UploadCloud,
  Zap,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Sparkles,
  Camera,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { watermarkSquadImage } from "@/lib/utils/watermark";

interface UploadedImage {
  url: string;
  fileName: string;
  size: number;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, displayName } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Streamlined Essential Listing Fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("android");
  const [overallStrength, setOverallStrength] = useState("");
  const [coinBalance, setCoinBalance] = useState("");
  const [managerName, setManagerName] = useState("");

  // Real Squad Images State (Up to 5 HD screenshots)
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

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

        // Apply high-fidelity watermark to protect seller screenshots while preserving HD quality
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!isAuthenticated && !authLoading) {
        router.push("/login?redirect=/seller/create-listing");
        return;
      }

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
        throw new Error("Please upload at least one real squad screenshot (up to 5 images allowed) in HD quality.");
      }

      const coins = coinBalance ? Number(coinBalance) : 0;
      const coach = managerName.trim();
      const finalDescription = `${title.trim()} - Verified ${platform.replace(/_/g, " ")} eFootball account with ${overallStrength} OVR collective strength, ${coins.toLocaleString()} eFootball coins${coach ? `, managed by ${coach}` : ""}. Full Safaricom Till 1572931 escrow protection with 24-hour buyer inspection window.`;

      const payload = {
        title: title.trim(),
        description: finalDescription,
        price: Number(price),
        platform,
        game_version: "v4.0.0",
        region: "Global",
        account_level: 1,
        overall_team_strength: Number(overallStrength),
        gp_balance: 0,
        coin_balance: coins,
        efootball_points: 0,
        contract_renewal_tickets: 0,
        epic_players_count: 0,
        big_time_players_count: 0,
        highlight_players_count: 0,
        featured_players_count: 0,
        legend_players_count: 0,
        key_players_list: [],
        manager_name: coach || undefined,
        formation: null,
        primary_playstyle: "quick_counter",
        current_division: 10,
        highest_division: 10,
        konami_id_status: "linked_changeable",
        linked_email_status: "transferable_full_access",
        image_urls: images.map((img) => img.url),
        allows_swap: false,
        swap_preferences: null,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?redirect=/seller/create-listing");
          return;
        }
        throw new Error(data.error || "Failed to create listing. Please check your entered values.");
      }

      router.push(`/listings/${data.listing.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header & Back Link */}
      <div className="mb-6">
        <Link
          href="/dashboard/seller"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Seller Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          Create eFootball Account Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Post your squad with verified HD screenshots (up to 5 photos) for instant escrow listing.
        </p>
      </div>

      {/* Contextual Auth Guidance for Guests */}
      {!isAuthenticated && !authLoading && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                Seller Account Required to Publish & Receive M-Pesa Payouts
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                To receive automated Safaricom M-Pesa payouts into Till 1572931 upon buyer delivery, please log in or create an account.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login?redirect=/seller/create-listing">
              <Button variant="secondary" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/register?redirect=/seller/create-listing">
              <Button variant="gold" size="sm" className="font-semibold shadow-md">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Streamlined Card: Squad Details */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-pitch-border/60 pb-3">
            <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Squad Information</span>
            </h2>
            <span className="text-[11px] text-slate-400">All essential details</span>
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
                    <span>Escrow Fee (0% Promo):</span>
                    <span className="font-semibold text-emerald-400">KES 0</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-emerald-800/40 pt-1">
                    <span>Your M-Pesa Payout:</span>
                    <span className="text-emerald-300 font-mono">KES {Number(price).toLocaleString()}</span>
                  </div>
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

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || uploadingImages}
            isLoading={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-950/40 min-h-[48px]"
          >
            {loading ? "Publishing Squad..." : "Publish eFootball Listing &rarr;"}
          </Button>
          <p className="text-center text-[11px] text-slate-500 mt-2.5">
            By publishing, you agree to Safaricom Till 1572931 escrow terms and Konami account handover rules.
          </p>
        </div>
      </form>
    </div>
  );
}
