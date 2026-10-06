"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Trophy,
  Upload,
  UploadCloud,
  Zap,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Loader2,
  Sparkles,
  Camera,
  Check,
  Database,
  Copy,
  ExternalLink,
  Plus,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface UploadedImage {
  url: string;
  fileName: string;
  size: number;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = async () => {
    try {
      const res = await fetch("/api/setup-database/sql");
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 4000);
    } catch {
      // fallback
    }
  };

  // Basic Information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("android");
  const [gameVersion, setGameVersion] = useState("v4.0.0");
  const [region, setRegion] = useState("Global");

  // Account Strength & Balances
  const [accountLevel, setAccountLevel] = useState("");
  const [overallStrength, setOverallStrength] = useState("");
  const [gpBalance, setGpBalance] = useState("");
  const [coinBalance, setCoinBalance] = useState("");
  const [efootballPoints, setEfootballPoints] = useState("");
  const [contractTickets, setContractTickets] = useState("");

  // Special Player Cards & Tactics
  const [epicCount, setEpicCount] = useState("");
  const [bigTimeCount, setBigTimeCount] = useState("");
  const [highlightCount, setHighlightCount] = useState("");
  const [featuredCount, setFeaturedCount] = useState("");
  const [legendCount, setLegendCount] = useState("");
  const [keyPlayers, setKeyPlayers] = useState("");

  const [managerName, setManagerName] = useState("");
  const [formation, setFormation] = useState("");
  const [primaryPlaystyle, setPrimaryPlaystyle] = useState("quick_counter");
  const [currentDivision, setCurrentDivision] = useState("");
  const [highestDivision, setHighestDivision] = useState("");

  // Security & Konami ID Status
  const [konamiIdStatus, setKonamiIdStatus] = useState("linked_changeable");
  const [linkedEmailStatus, setLinkedEmailStatus] = useState("transferable_full_access");

  // Real Squad Images State (Supports up to 5 images in original quality)
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Upload handler for up to 5 images
  const handleFilesUpload = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError("");

    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      setUploadError("Maximum 5 squad images allowed. Please remove an existing image first to upload another.");
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, remainingSlots);
    if (Array.from(fileList).length > remainingSlots) {
      setUploadError(`Only ${remainingSlots} more image(s) could be added (maximum 5 images allowed).`);
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

        const formData = new FormData();
        formData.append("file", file);

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
        throw new Error("Please upload at least one real squad screenshot (up to 5 images allowed) in real quality.");
      }

      const playersList = keyPlayers
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const finalDescription = description.trim()
        ? description.trim()
        : `${title.trim()} - eFootball account with ${overallStrength} OVR team strength. Includes marquee cards: ${keyPlayers.trim() || "elite squad players"}. Verified for instant escrow transfer.`;

      const parseDiv = (v: string) => {
        const n = Number(v);
        if (isNaN(n) || n < 1 || n > 10) return 10;
        return n;
      };

      const payload = {
        title: title.trim(),
        description: finalDescription,
        price: Number(price),
        platform,
        game_version: gameVersion,
        region,
        account_level: accountLevel ? Math.max(1, Number(accountLevel)) : 1,
        overall_team_strength: Number(overallStrength),
        gp_balance: gpBalance ? Number(gpBalance) : 0,
        coin_balance: coinBalance ? Number(coinBalance) : 0,
        efootball_points: efootballPoints ? Number(efootballPoints) : 0,
        contract_renewal_tickets: contractTickets ? Number(contractTickets) : 0,
        epic_players_count: epicCount ? Number(epicCount) : 0,
        big_time_players_count: bigTimeCount ? Number(bigTimeCount) : 0,
        highlight_players_count: highlightCount ? Number(highlightCount) : 0,
        featured_players_count: featuredCount ? Number(featuredCount) : 0,
        legend_players_count: legendCount ? Number(legendCount) : 0,
        key_players_list: playersList,
        manager_name: managerName.trim() || undefined,
        formation: formation.trim() || undefined,
        primary_playstyle: primaryPlaystyle,
        current_division: parseDiv(currentDivision),
        highest_division: parseDiv(highestDivision),
        konami_id_status: konamiIdStatus,
        linked_email_status: linkedEmailStatus,
        image_urls: images.map((img) => img.url),
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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
          Post your squad with real screenshot quality (up to 5 photos). Simple 1 or 2 examples are provided below to guide how to fill each field.
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
                You can draft your listing metrics below, but to publish it to buyers and link it to your M-Pesa phone number for instant escrow release, please log in or create an account.
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

      {error && (error.includes("Could not find the table") || error.includes("schema cache") || error.includes("Database Tables Not Found")) ? (
        <div className="mb-6 p-5 rounded-2xl bg-amber-950/70 border border-amber-600/80 text-amber-200 shadow-2xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-100">
                Supabase Database Tables Not Initialized Yet
              </h3>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Your Supabase project is connected, but the <strong>&apos;public.listings&apos;</strong> table has not been created yet.
                You just need to execute the migration script once in your Supabase SQL Editor.
              </p>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={handleCopySql}
              className="text-xs font-semibold shadow-md"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-slate-950" />
                  Copied Schema SQL to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Setup SQL to Clipboard
                </>
              )}
            </Button>

            <a
              href="https://supabase.com/dashboard/project/_/sql/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="button" variant="secondary" size="sm" className="text-xs font-medium">
                <ExternalLink className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Open Supabase SQL Editor
              </Button>
            </a>
          </div>
        </div>
      ) : error ? (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>1. Basic Listing Information</span>
            <span className="text-xs font-normal text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 1-2 examples provided
            </span>
          </h2>

          {/* Listing Title with 2 Clean Examples */}
          <div className="space-y-2">
            <Input
              label="Listing Title"
              placeholder="e.g. 3120 OVR Quick Counter Squad | 105 Messi + Booster Vieira | 850 Coins"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Clean 2 Examples Box */}
            <div className="p-3 rounded-xl bg-pitch-card/70 border border-pitch-border/80 space-y-1.5">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Examples of how to write the title:
              </span>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setTitle("3120 OVR Quick Counter | 105 Messi + Booster Vieira | 850 Coins")}
                  className="text-xs px-3 py-1 rounded-lg bg-pitch-surface border border-pitch-border text-slate-200 hover:text-amber-300 hover:border-amber-400/60 transition-all text-left"
                >
                  <strong>Example 1:</strong> 3120 OVR Quick Counter | 105 Messi + Booster Vieira | 850 Coins
                </button>
                <button
                  type="button"
                  onClick={() => setTitle("3150 OVR Possession Game | Epic Rummenigge + Gullit | Div 1")}
                  className="text-xs px-3 py-1 rounded-lg bg-pitch-surface border border-pitch-border text-slate-200 hover:text-amber-300 hover:border-amber-400/60 transition-all text-left"
                >
                  <strong>Example 2:</strong> 3150 OVR Possession Game | Epic Rummenigge + Gullit | Div 1
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price with 2 Clean Examples */}
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
                <span className="text-[11px] text-slate-400">Examples:</span>
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
            </div>

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
              <span className="block text-[10px] text-slate-400 mt-1">Platform where squad was created</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="Global">Global</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
              </select>
              <span className="block text-[10px] text-slate-400 mt-1">Matchmaking server region</span>
            </div>
          </div>

          {/* Description with Clean 1-Click Example Outline */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">Account Description & Squad Details</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your account achievements, standout players, training progress, skill allocations, and handover guidelines..."
              className="w-full rounded-lg bg-pitch-card border border-pitch-border p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              required
            />

            <div className="p-2.5 rounded-xl bg-pitch-card/70 border border-pitch-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-slate-300">
                <strong>Example:</strong> Outline mentioning key epics, resources, and Konami ID transfer readiness.
              </span>
              <button
                type="button"
                onClick={() => {
                  const outline = `• Squad Highlights: Top rated Booster & Epic players fully trained.\n• Resource Inventory: GP, eFootball Coins, and Contract Renewals ready.\n• Manager & Tactics: Main playstyle optimized with full team proficiency.\n• Transfer Handover: Konami ID credentials will be transferred safely via Escrow.`;
                  setDescription((prev) => (prev ? `${prev}\n\n${outline}` : outline));
                }}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>+ Use example description</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Team Strength & In-Game Resources */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>2. Team Strength & Balances</span>
            <span className="text-xs font-normal text-amber-400">1-2 examples per field</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* OVR Team Strength */}
            <div className="space-y-1">
              <Input
                label="Overall Team Strength (OVR)"
                type="number"
                placeholder="e.g. 3120"
                value={overallStrength}
                onChange={(e) => setOverallStrength(e.target.value)}
                required
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Examples:</span>
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
              </div>
            </div>

            {/* GP Balance */}
            <div className="space-y-1">
              <Input
                label="GP Balance"
                type="number"
                placeholder="e.g. 1500000"
                value={gpBalance}
                onChange={(e) => setGpBalance(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Examples:</span>
                <button
                  type="button"
                  onClick={() => setGpBalance("1500000")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  1.5M
                </button>
                <button
                  type="button"
                  onClick={() => setGpBalance("3000000")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  3M
                </button>
              </div>
            </div>

            {/* eFootball Coins */}
            <div className="space-y-1">
              <Input
                label="eFootball Coins"
                type="number"
                placeholder="e.g. 850"
                value={coinBalance}
                onChange={(e) => setCoinBalance(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Examples:</span>
                <button
                  type="button"
                  onClick={() => setCoinBalance("850")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  850
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

            {/* eFootball Points */}
            <div className="space-y-1">
              <Input
                label="eFootball Points"
                type="number"
                placeholder="e.g. 12000"
                value={efootballPoints}
                onChange={(e) => setEfootballPoints(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Examples:</span>
                <button
                  type="button"
                  onClick={() => setEfootballPoints("12000")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  12k
                </button>
                <button
                  type="button"
                  onClick={() => setEfootballPoints("25000")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  25k
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Input
                label="Current Division"
                type="number"
                min={1}
                max={10}
                placeholder="e.g. 1"
                value={currentDivision}
                onChange={(e) => setCurrentDivision(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Examples:</span>
                <button
                  type="button"
                  onClick={() => setCurrentDivision("1")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  Div 1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentDivision("2")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  Div 2
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Input
                label="Highest Division Ever"
                type="number"
                min={1}
                max={10}
                placeholder="e.g. 1"
                value={highestDivision}
                onChange={(e) => setHighestDivision(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Examples:</span>
                <button
                  type="button"
                  onClick={() => setHighestDivision("1")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  Div 1
                </button>
                <button
                  type="button"
                  onClick={() => setHighestDivision("2")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  Div 2
                </button>
              </div>
            </div>

            <Input
              label="Contract Tickets"
              type="number"
              placeholder="e.g. 10"
              value={contractTickets}
              onChange={(e) => setContractTickets(e.target.value)}
              helperText="Available 10-day/60-day tickets"
            />

            <Input
              label="Account Level"
              type="number"
              placeholder="e.g. 45"
              value={accountLevel}
              onChange={(e) => setAccountLevel(e.target.value)}
              helperText="In-game profile level"
            />
          </div>
        </div>

        {/* Section 3: Special Player Cards & Tactics */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>3. Special Player Cards & Tactics</span>
            <span className="text-xs font-normal text-amber-400">1-2 examples per field</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Input
              label="Epic Cards"
              type="number"
              placeholder="e.g. 8"
              value={epicCount}
              onChange={(e) => setEpicCount(e.target.value)}
            />
            <Input
              label="Big Time Cards"
              type="number"
              placeholder="e.g. 4"
              value={bigTimeCount}
              onChange={(e) => setBigTimeCount(e.target.value)}
            />
            <Input
              label="Highlight Cards"
              type="number"
              placeholder="e.g. 15"
              value={highlightCount}
              onChange={(e) => setHighlightCount(e.target.value)}
            />
            <Input
              label="Featured Cards"
              type="number"
              placeholder="e.g. 20"
              value={featuredCount}
              onChange={(e) => setFeaturedCount(e.target.value)}
            />
            <Input
              label="Legend Cards"
              type="number"
              placeholder="e.g. 10"
              value={legendCount}
              onChange={(e) => setLegendCount(e.target.value)}
            />
          </div>

          {/* Key Featured Player Names with 2 Clean Examples */}
          <div className="space-y-2">
            <Input
              label="Key Featured Player Names (Comma separated)"
              placeholder="e.g. 105 Messi Big Time, Vieira Booster, Rummenigge Epic, Gullit Booster"
              value={keyPlayers}
              onChange={(e) => setKeyPlayers(e.target.value)}
            />

            <div className="p-3 rounded-xl bg-pitch-card/70 border border-pitch-border/80 space-y-1.5">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Examples of how to write player names:
              </span>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setKeyPlayers("105 Big Time Messi, Booster Vieira, Epic Rummenigge")}
                  className="text-xs px-3 py-1 rounded-lg bg-pitch-surface border border-pitch-border text-slate-200 hover:text-amber-300 hover:border-amber-400/60 transition-all text-left"
                >
                  <strong>Example 1:</strong> 105 Big Time Messi, Booster Vieira, Epic Rummenigge
                </button>
                <button
                  type="button"
                  onClick={() => setKeyPlayers("Booster Gullit, Epic Cruyff, Big Time Ronaldinho")}
                  className="text-xs px-3 py-1 rounded-lg bg-pitch-surface border border-pitch-border text-slate-200 hover:text-amber-300 hover:border-amber-400/60 transition-all text-left"
                >
                  <strong>Example 2:</strong> Booster Gullit, Epic Cruyff, Big Time Ronaldinho
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Manager with 2 Clean Examples */}
            <div className="space-y-1">
              <Input
                label="Head Coach / Manager"
                placeholder="e.g. Pep Guardiola or G. Caputto"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Examples:</span>
                <button
                  type="button"
                  onClick={() => setManagerName("Pep Guardiola")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  Pep Guardiola
                </button>
                <button
                  type="button"
                  onClick={() => setManagerName("G. Caputto")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  G. Caputto
                </button>
              </div>
            </div>

            {/* Formation with 2 Clean Examples */}
            <div className="space-y-1">
              <Input
                label="Formation"
                placeholder="e.g. 4-2-2-2 or 4-3-3"
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Examples:</span>
                <button
                  type="button"
                  onClick={() => setFormation("4-2-2-2")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  4-2-2-2
                </button>
                <button
                  type="button"
                  onClick={() => setFormation("4-3-3")}
                  className="px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:text-amber-300"
                >
                  4-3-3
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Playstyle</label>
              <select
                value={primaryPlaystyle}
                onChange={(e) => setPrimaryPlaystyle(e.target.value)}
                className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="quick_counter">Quick Counter</option>
                <option value="possession">Possession Game</option>
                <option value="long_ball_counter">Long Ball Counter</option>
                <option value="out_wide">Out Wide</option>
                <option value="long_ball">Long Ball</option>
              </select>
              <span className="block text-[10px] text-slate-400 mt-1">Playstyle team rating 88+</span>
            </div>
          </div>
        </div>

        {/* Section 4: Konami ID & REAL QUALITY SQUAD SCREENSHOTS (UP TO 5 IMAGES) */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>4. Konami ID Security & Real Squad Screenshots (Up to 5)</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Real Quality • Up to 5 Images
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Konami ID Status</label>
              <select
                value={konamiIdStatus}
                onChange={(e) => setKonamiIdStatus(e.target.value)}
                className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="linked_changeable">Konami ID Linked (Email Changeable)</option>
                <option value="unlinked">Konami ID Unlinked (Buyer Can Bind Directly)</option>
                <option value="linked_immutable">Konami ID Linked (Fixed Email Handover)</option>
              </select>
              <span className="block text-[10px] text-slate-400 mt-1">
                Changeable email accounts provide the fastest escrow release
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Linked Email Transferability</label>
              <select
                value={linkedEmailStatus}
                onChange={(e) => setLinkedEmailStatus(e.target.value)}
                className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="transferable_full_access">Full Access (Primary Email Given to Buyer)</option>
                <option value="buyer_email_bindable">Buyer Email Bindable (Assisted Transfer)</option>
              </select>
              <span className="block text-[10px] text-slate-400 mt-1">
                Ensures buyer gains permanent access upon release
              </span>
            </div>
          </div>

          {/* Real Squad Screenshots Gallery & Upload (Up to 5 images in original quality) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Real Squad Screenshots</span>
                  <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload up to 5 real screenshots from your device in their original HD quality ({images.length}/5 uploaded)
                </p>
              </div>

              {images.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Images
                </Button>
              )}
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Hidden Multi-file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              multiple
              className="hidden"
            />

            {/* Uploaded Images Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <div
                    key={img.url + index}
                    className="relative rounded-2xl overflow-hidden border border-pitch-border bg-pitch-card group shadow-md"
                  >
                    {/* Full real quality preview */}
                    <div className="aspect-[4/3] w-full bg-slate-950 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Primary Badge or Set Primary Action */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                      {index === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] shadow-md flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-slate-950" />
                          Cover
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-slate-300 text-[10px] font-semibold border border-white/10">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="p-2 bg-pitch-surface/90 border-t border-pitch-border/60 flex items-center justify-between gap-1">
                      {index !== 0 ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryCover(index)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
                        >
                          Make Cover
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Primary Photo</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete this image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Slot to add more if under 5 */}
                {images.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-pitch-border hover:border-amber-500/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-pitch-surface/40 hover:bg-pitch-surface transition-all aspect-[4/3]"
                  >
                    <Plus className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">Add Image</span>
                    <span className="text-[10px] text-slate-500">({images.length}/5)</span>
                  </div>
                )}
              </div>
            )}

            {/* Empty Upload Dropzone */}
            {images.length === 0 && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-pitch-border hover:border-slate-600 bg-pitch-card/40 hover:bg-pitch-card/70"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-pitch-surface border border-pitch-border flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-md">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {uploadingImages ? "Uploading in original quality..." : "Click or drag & drop squad screenshots here"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Upload up to 5 real screenshots in PNG, JPG, or WebP format (up to 10MB each)
                  </p>
                  <p className="text-[11px] text-emerald-400 pt-1 font-medium">
                    ✓ Real quality preserved without blurriness or lossy downscaling
                  </p>
                </div>

                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  disabled={uploadingImages}
                  className="mt-4 text-xs font-semibold"
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Uploading Real Quality...
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 mr-1.5" />
                      Choose From Device (Up to 5)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-pitch-border/60">
          <Link href="/dashboard/seller">
            <Button type="button" variant="secondary" size="md">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={loading || uploadingImages}
            className="w-full sm:w-auto font-bold px-8 shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing Listing to Marketplace...
              </>
            ) : (
              "Publish Listing with Escrow Guarantee"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
