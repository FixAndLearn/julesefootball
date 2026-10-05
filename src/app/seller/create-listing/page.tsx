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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

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

  // Basic Information (All initialized empty; suggestions remain visibly accessible below)
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

  // Real Squad Image File State (Strict real image upload - NO URL links permitted)
  const [imageUrl, setImageUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageFileSize, setImageFileSize] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Helper function to append players to keyPlayers list without erasing existing entries
  const handleAddPlayerSuggestion = (playerName: string) => {
    if (!keyPlayers.trim()) {
      setKeyPlayers(playerName);
    } else {
      const existing = keyPlayers
        .split(",")
        .map((p) => p.trim().toLowerCase());
      if (!existing.includes(playerName.toLowerCase())) {
        setKeyPlayers(`${keyPlayers.trim()}, ${playerName}`);
      }
    }
  };

  // Handle Real Image File Selection & Direct Upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadError("");

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError("Invalid file type. Please upload a real PNG, JPG, or WebP screenshot file from your device.");
      return;
    }

    // 10MB limit check
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        `File size too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 10MB.`
      );
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload squad image.");
      }

      setImageUrl(data.url);
      setImageFileName(file.name);
      setImageFileSize(file.size);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
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

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageFileName("");
    setImageFileSize(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      if (!imageUrl.trim()) {
        throw new Error("Please upload a real screenshot of your squad before publishing your listing.");
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
        image_urls: [imageUrl.trim()],
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
          Enter your squad information below. All suggestions remain permanently visible to guide you and can be clicked to quickly populate your fields without being stuck in the text inputs.
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

            <Link href="/setup">
              <Button type="button" variant="outline" size="sm" className="text-xs">
                View Setup Diagnostics (/setup)
              </Button>
            </Link>
          </div>
        </div>
      ) : error && (error.includes("foreign key constraint") || error.includes("listings_seller_id_fkey") || error.includes("profiles")) ? (
        <div className="mb-6 p-5 rounded-2xl bg-amber-950/70 border border-amber-600/80 text-amber-200 shadow-2xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-100">
                Seller Profile Sync & Database Policy Update
              </h3>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Your user account is now auto-provisioned in the seller profile ledger. Click <strong>Publish Listing</strong> again to complete publication. If you haven&apos;t run the latest migration, copy the updated SQL script to register the automatic profile triggers and RLS policies.
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
                  Copied Updated SQL to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Updated Setup SQL
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

            <Link href="/setup">
              <Button type="button" variant="outline" size="sm" className="text-xs">
                Run Diagnostics (/setup)
              </Button>
            </Link>
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
              <Sparkles className="w-3 h-3" /> Visible suggestions below
            </span>
          </h2>

          {/* Listing Title with Visible Suggested Formulas */}
          <div className="space-y-2">
            <Input
              label="Listing Title"
              placeholder="e.g. 3120 OVR Quick Counter Squad | 105 Messi + Booster Vieira | 850 Coins"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            
            {/* Always Visible Title Suggestion Box */}
            <div className="p-3 rounded-xl bg-pitch-card/70 border border-pitch-border/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suggested Listing Title Formula (High Click-Through):</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono bg-pitch-surface/80 px-2 py-1 rounded border border-pitch-border/50">
                [Total OVR] + [Playstyle] | [Top 1-2 Boosters/Epics] | [Coins or Division]
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[11px] text-slate-400">Click to use suggested template:</span>
                <button
                  type="button"
                  onClick={() => setTitle("3120 OVR Quick Counter Squad | 105 Messi + Booster Vieira | 850 Coins")}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                >
                  ⚡ 3120 OVR Quick Counter | 105 Messi + Vieira | 850 Coins
                </button>
                <button
                  type="button"
                  onClick={() => setTitle("3150 OVR Possession Game | Epic Rummenigge + Booster Gullit | Div 1")}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 hover:bg-brand-500/20 transition-all cursor-pointer"
                >
                  ⚡ 3150 OVR Possession | Epic Rummenigge + Gullit | Div 1
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price with Visible Price Benchmarks */}
            <div className="space-y-1.5">
              <Input
                label="Listing Price (KES)"
                type="number"
                placeholder="e.g. 4500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <div className="pt-1">
                <span className="block text-[11px] text-slate-400 mb-1">Suggested Price Tiers:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "KES 2,500", val: "2500" },
                    { label: "KES 4,500", val: "4500" },
                    { label: "KES 8,000", val: "8000" },
                    { label: "KES 15,000", val: "15000" },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => setPrice(chip.val)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                        price === chip.val
                          ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:border-amber-400/50"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
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
              <span className="block text-[10px] text-slate-400 mt-1">Default matchmaking server region</span>
            </div>
          </div>

          {/* Description with Visible Quality Checklist */}
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

            {/* Always Visible Description Guide */}
            <div className="p-3 rounded-xl bg-pitch-card/70 border border-pitch-border/80 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Suggested points to include (improves buyer confidence):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                <span className="flex items-center gap-1">✓ List 3-5 marquee Epic/Showtime players</span>
                <span className="flex items-center gap-1">✓ Note player skill resets or extra skills added</span>
                <span className="flex items-center gap-1">✓ Confirm clean account history (no bans/strikes)</span>
                <span className="flex items-center gap-1">✓ State Konami ID transfer readiness</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const outline = `• Squad Highlights: Top rated Booster & Epic players fully trained.\n• Resource Inventory: GP, eFootball Coins, and Contract Renewals ready.\n• Manager & Tactics: Main playstyle optimized with full team proficiency.\n• Transfer Handover: Konami ID credentials will be transferred safely via Escrow.`;
                  setDescription((prev) => (prev ? `${prev}\n\n${outline}` : outline));
                }}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer mt-1"
              >
                <span>+ Append suggested description outline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Team Strength & In-Game Resources */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>2. Team Strength & Balances</span>
            <span className="text-xs font-normal text-amber-400">Click any suggestion badge to fill</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* OVR Team Strength */}
            <div className="space-y-1.5">
              <Input
                label="Overall Team Strength (OVR)"
                type="number"
                placeholder="e.g. 3120"
                value={overallStrength}
                onChange={(e) => setOverallStrength(e.target.value)}
                required
              />
              <div className="pt-0.5">
                <span className="text-[10px] text-slate-400 block mb-1">Common OVRs:</span>
                <div className="flex flex-wrap gap-1">
                  {["3050", "3100", "3120", "3150", "3180"].map((ovr) => (
                    <button
                      key={ovr}
                      type="button"
                      onClick={() => setOverallStrength(ovr)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
                        overallStrength === ovr
                          ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:border-amber-400/50"
                      }`}
                    >
                      {ovr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* GP Balance */}
            <div className="space-y-1.5">
              <Input
                label="GP Balance"
                type="number"
                placeholder="e.g. 1500000"
                value={gpBalance}
                onChange={(e) => setGpBalance(e.target.value)}
              />
              <div className="pt-0.5">
                <span className="text-[10px] text-slate-400 block mb-1">Quick GP:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "500k", val: "500000" },
                    { label: "1.5M", val: "1500000" },
                    { label: "3M", val: "3000000" },
                  ].map((gp) => (
                    <button
                      key={gp.val}
                      type="button"
                      onClick={() => setGpBalance(gp.val)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:border-amber-400/50"
                    >
                      {gp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* eFootball Coins */}
            <div className="space-y-1.5">
              <Input
                label="eFootball Coins"
                type="number"
                placeholder="e.g. 850"
                value={coinBalance}
                onChange={(e) => setCoinBalance(e.target.value)}
              />
              <div className="pt-0.5">
                <span className="text-[10px] text-slate-400 block mb-1">Quick Coins:</span>
                <div className="flex flex-wrap gap-1">
                  {["250", "850", "1500", "3200"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCoinBalance(c)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:border-amber-400/50"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* eFootball Points */}
            <div className="space-y-1.5">
              <Input
                label="eFootball Points"
                type="number"
                placeholder="e.g. 12000"
                value={efootballPoints}
                onChange={(e) => setEfootballPoints(e.target.value)}
              />
              <div className="pt-0.5">
                <span className="text-[10px] text-slate-400 block mb-1">Quick Points:</span>
                <div className="flex flex-wrap gap-1">
                  {["5000", "12000", "25000"].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setEfootballPoints(pts)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:border-amber-400/50"
                    >
                      {pts}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Input
                label="Current Division"
                type="number"
                min={1}
                max={10}
                placeholder="e.g. 1"
                value={currentDivision}
                onChange={(e) => setCurrentDivision(e.target.value)}
              />
              <div className="flex gap-1 pt-0.5">
                {["1", "2", "3", "4"].map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => setCurrentDivision(div)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:border-amber-400/50"
                  >
                    Div {div}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Input
                label="Highest Division Ever"
                type="number"
                min={1}
                max={10}
                placeholder="e.g. 1"
                value={highestDivision}
                onChange={(e) => setHighestDivision(e.target.value)}
              />
              <div className="flex gap-1 pt-0.5">
                {["1", "2", "3"].map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => setHighestDivision(div)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-pitch-card border border-pitch-border text-slate-300 hover:border-amber-400/50"
                  >
                    Div {div}
                  </button>
                ))}
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

        {/* Section 3: Squad Composition & Tactics */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>3. Special Player Cards & Tactics</span>
            <span className="text-xs font-normal text-amber-400">Tap cards to append to your list</span>
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

          {/* Key Featured Player Names with Permanently Visible Suggestion Badges */}
          <div className="space-y-2">
            <Input
              label="Key Featured Player Names (Comma separated)"
              placeholder="e.g. 105 Messi Big Time, Vieira Booster, Rummenigge Epic, Gullit Booster"
              value={keyPlayers}
              onChange={(e) => setKeyPlayers(e.target.value)}
            />

            {/* Always Visible Suggestion Badges that never disappear and never clutter input text */}
            <div className="p-3 rounded-xl bg-pitch-card/70 border border-pitch-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggested Marquee Players (Click any badge to add to your list):
                </span>
                <span className="text-[10px] text-slate-400">Keeps your existing text intact</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "105 Big Time Messi",
                  "Booster Vieira",
                  "Epic Rummenigge",
                  "Booster Gullit",
                  "Epic Cruyff",
                  "Big Time Ronaldinho",
                  "Booster Maldini",
                  "Showtime Bellingham",
                  "Epic Cech",
                  "Booster Shevchenko",
                  "Booster Pirlo",
                  "Big Time Neymar",
                  "Epic Roberto Carlos",
                  "Booster Seedorf",
                  "Epic Puyol",
                  "Booster Kaka",
                ].map((player) => (
                  <button
                    key={player}
                    type="button"
                    onClick={() => handleAddPlayerSuggestion(player)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-pitch-surface border border-pitch-border text-slate-200 hover:text-amber-300 hover:border-amber-400/50 hover:bg-pitch-surface/80 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ {player}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Manager with Visible Meta Suggestions */}
            <div className="space-y-1.5">
              <Input
                label="Head Coach / Manager"
                placeholder="e.g. Pep Guardiola or G. Caputto"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
              <div className="pt-0.5">
                <span className="text-[10px] text-slate-400 block mb-1">Top Managers (Click to set):</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Pep Guardiola",
                    "G. Caputto",
                    "L. Scaloni",
                    "D. Deschamps",
                  ].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setManagerName(m)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
                        managerName === m
                          ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:border-amber-400/50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Formation with Visible Meta Suggestions */}
            <div className="space-y-1.5">
              <Input
                label="Formation"
                placeholder="e.g. 4-2-2-2 or 4-3-3"
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
              />
              <div className="pt-0.5">
                <span className="text-[10px] text-slate-400 block mb-1">Meta Formations (Click to set):</span>
                <div className="flex flex-wrap gap-1">
                  {["4-2-2-2", "4-3-3", "4-1-2-3", "4-2-1-3", "5-2-1-2"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormation(f)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
                        formation === f
                          ? "bg-amber-400 text-slate-950 font-bold border-amber-300"
                          : "bg-pitch-card border-pitch-border text-slate-300 hover:border-amber-400/50"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
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

        {/* Section 4: Konami ID & REAL SQUAD SCREENSHOT IMAGE (DIRECT FILE UPLOAD ONLY - ZERO LINKS) */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>4. Konami ID Security & Real Squad Screenshot</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Real Photo Upload Only
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

          {/* Real Squad Screenshot Upload Component (No Link Allowed) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Upload Real Squad Screenshot</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Direct image upload required • No external links
              </span>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Hidden File Input for Device/Gallery/Camera Image Selection */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {!imageUrl ? (
              /* Drag & Drop Real Image Upload Box */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-amber-400 bg-amber-500/10 shadow-xl"
                    : "border-pitch-border hover:border-amber-400/60 bg-pitch-card/60 hover:bg-pitch-card"
                }`}
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                    <p className="text-sm font-semibold text-slate-100">
                      Uploading real screenshot to secure escrow storage...
                    </p>
                    <p className="text-xs text-slate-400">
                      Processing high-resolution image file. Please wait...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">
                        Tap or drag & drop to upload your real squad screenshot
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Upload a clear screenshot showing your Starting XI formation, player ratings, and reserves from your mobile gallery or PC.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-medium text-slate-400 px-2.5 py-1 rounded bg-pitch-surface border border-pitch-border">
                        PNG, JPG, or WebP (Max 10MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="gold"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-2 font-semibold shadow-lg"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Select Real Screenshot from Device
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Real Uploaded Image Preview & Verification Card */
              <div className="bg-pitch-card border border-pitch-border rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-full sm:w-56 h-36 rounded-xl overflow-hidden border border-pitch-border bg-slate-950 shrink-0 shadow-md flex items-center justify-center p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Uploaded Real Squad Screenshot"
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Real Image File Stored & Verified</span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium truncate">
                      {imageFileName || "Squad_Screenshot.png"}
                    </p>

                    {imageFileSize && (
                      <p className="text-[11px] text-slate-400">
                        File Size: {(imageFileSize / (1024 * 1024)).toFixed(2)} MB • Stored in escrow media repository
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Upload Different Screenshot
                      </Button>

                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pitch-surface hover:bg-slate-800 text-slate-300 hover:text-white border border-pitch-border text-xs font-medium transition-all"
                        title="Inspect original uncompressed image"
                      >
                        <ExternalLink className="w-3 h-3 text-brand-400" />
                        <span>Inspect Full HD</span>
                      </a>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                        className="text-xs text-rose-400 hover:text-rose-300 hover:border-rose-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full font-bold text-base shadow-2xl py-3.5"
          isLoading={loading}
        >
          {isAuthenticated
            ? "Publish Account to Escrow Marketplace"
            : "Log In or Create Account to Publish"}
        </Button>
      </form>
    </div>
  );
}
