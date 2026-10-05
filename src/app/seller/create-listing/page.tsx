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
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function CreateListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Basic Information (All initialized empty - placeholders serve as guidance hints only)
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

  // Squad Image Upload State
  const [imageUrl, setImageUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageFileSize, setImageFileSize] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Handle Image File Selection & Direct Upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadError("");

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError("Invalid file type. Please upload a PNG, JPG, or WebP screenshot.");
      return;
    }

    // 10MB limit check
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.`
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
      if (!title.trim()) {
        throw new Error("Please enter a descriptive listing title.");
      }

      if (!price || Number(price) <= 0) {
        throw new Error("Please specify a valid listing price in KES.");
      }

      if (!overallStrength || Number(overallStrength) < 2000) {
        throw new Error("Overall Team Strength (OVR) is required and must be at least 2000.");
      }

      if (!imageUrl.trim()) {
        throw new Error("Please upload a squad screenshot image before submitting your listing.");
      }

      const playersList = keyPlayers
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        platform,
        game_version: gameVersion,
        region,
        account_level: accountLevel ? Number(accountLevel) : 1,
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
        current_division: currentDivision ? Number(currentDivision) : 10,
        highest_division: highestDivision ? Number(highestDivision) : 10,
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
        throw new Error(data.error || "Failed to create listing");
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
          Specify exact account metrics and upload real squad screenshots. Every field starts blank so you can enter your exact squad details without pre-filled sample text.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>1. Basic Listing Information</span>
            <span className="text-xs font-normal text-slate-400">Placeholders indicate suggested formats</span>
          </h2>

          <Input
            label="Listing Title"
            placeholder="e.g. 3120 OVR Quick Counter Squad | 105 Messi + Booster Vieira | 850 Coins"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            helperText="Include key highlights like total team strength, marquee epics, or coin balances"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Listing Price (KES)"
              type="number"
              placeholder="e.g. 4500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              helperText="Set your desired payout in Kenyan Shillings"
            />

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
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Account Description & Squad Details</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your account achievements, standout players, training progress, skill allocations, and handover guidelines..."
              className="w-full rounded-lg bg-pitch-card border border-pitch-border p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              required
            />
          </div>
        </div>

        {/* Section 2: Team Strength & In-Game Resources */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>2. Team Strength & Balances</span>
            <span className="text-xs font-normal text-slate-400">Enter your live account numbers</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Overall Team Strength (OVR)"
              type="number"
              placeholder="e.g. 3120"
              value={overallStrength}
              onChange={(e) => setOverallStrength(e.target.value)}
              required
              helperText="Min. 2000 OVR"
            />

            <Input
              label="GP Balance"
              type="number"
              placeholder="e.g. 1500000"
              value={gpBalance}
              onChange={(e) => setGpBalance(e.target.value)}
              helperText="In-game GP currency"
            />

            <Input
              label="eFootball Coins"
              type="number"
              placeholder="e.g. 850"
              value={coinBalance}
              onChange={(e) => setCoinBalance(e.target.value)}
              helperText="Purchased / earned coins"
            />

            <Input
              label="eFootball Points"
              type="number"
              placeholder="e.g. 12000"
              value={efootballPoints}
              onChange={(e) => setEfootballPoints(e.target.value)}
              helperText="Redeemable point balance"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Current Division"
              type="number"
              min={1}
              max={10}
              placeholder="e.g. 1"
              value={currentDivision}
              onChange={(e) => setCurrentDivision(e.target.value)}
              helperText="1 (Highest) to 10"
            />
            <Input
              label="Highest Division Ever"
              type="number"
              min={1}
              max={10}
              placeholder="e.g. 1"
              value={highestDivision}
              onChange={(e) => setHighestDivision(e.target.value)}
              helperText="Career best division"
            />
            <Input
              label="Contract Renewal Tickets"
              type="number"
              placeholder="e.g. 10"
              value={contractTickets}
              onChange={(e) => setContractTickets(e.target.value)}
              helperText="Available renewal tickets"
            />
            <Input
              label="Account Level"
              type="number"
              placeholder="e.g. 45"
              value={accountLevel}
              onChange={(e) => setAccountLevel(e.target.value)}
              helperText="User profile level"
            />
          </div>
        </div>

        {/* Section 3: Squad Composition & Tactics */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>3. Special Player Cards & Tactics</span>
            <span className="text-xs font-normal text-slate-400">Card breakdown for buyers</span>
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

          <Input
            label="Key Featured Player Names (Comma separated)"
            placeholder="e.g. Messi 105 Big Time, Vieira Booster, Rummenigge Epic, Ronaldinho 102"
            value={keyPlayers}
            onChange={(e) => setKeyPlayers(e.target.value)}
            helperText="Separate multiple player card names with commas"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Head Coach / Manager"
              placeholder="e.g. Pep Guardiola, G. Caputto, or L. Scaloni"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
            />

            <Input
              label="Formation"
              placeholder="e.g. 4-2-2-2, 4-3-3, or 4-1-2-3"
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
            />

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
            </div>
          </div>
        </div>

        {/* Section 4: Security, Konami ID & Squad Image Upload */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3 flex items-center justify-between">
            <span>4. Konami ID Linking & Squad Screenshot</span>
            <span className="text-xs font-normal text-slate-400">Authentic proof for buyer trust</span>
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
                <option value="unlinked">Konami ID Unlinked (Buyer Can Bind)</option>
                <option value="linked_immutable">Konami ID Linked (Fixed Email)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Linked Email Transferability</label>
              <select
                value={linkedEmailStatus}
                onChange={(e) => setLinkedEmailStatus(e.target.value)}
                className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="transferable_full_access">Full Access (Primary Email Handed to Buyer)</option>
                <option value="buyer_email_bindable">Buyer Email Bindable (Assisted Handover)</option>
              </select>
            </div>
          </div>

          {/* Squad Screenshot Upload Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-200">
                Squad Screenshot Image <span className="text-brand-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowManualUrl(!showManualUrl)}
                className="text-[11px] text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showManualUrl ? "Upload image file instead" : "Or enter image URL"}</span>
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {!imageUrl ? (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-brand-400 bg-brand-500/10 shadow-lg"
                    : "border-pitch-border hover:border-slate-500 bg-pitch-card/60 hover:bg-pitch-card"
                }`}
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-3">
                    <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
                    <p className="text-sm font-medium text-slate-200">
                      Uploading squad screenshot to secure storage...
                    </p>
                    <p className="text-xs text-slate-400">
                      Please wait while your image is verified and stored.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        Click to upload squad screenshot or drag & drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG, or WebP up to 10MB. Clear view of Starting XI & bench recommended.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-2"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Image Uploaded Preview Card */
              <div className="bg-pitch-card border border-pitch-border rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden border border-pitch-border bg-pitch-surface shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Squad Screenshot Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-300">
                        Squad Screenshot Successfully Attached
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 truncate">
                      {imageFileName || "Squad Screenshot"}
                    </p>

                    {imageFileSize && (
                      <p className="text-[11px] text-slate-400">
                        Size: {(imageFileSize / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Replace Image
                      </Button>
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

            {/* Optional Manual URL Fallback Input */}
            {showManualUrl && (
              <div className="pt-2">
                <Input
                  label="Or enter direct image URL"
                  placeholder="https://images.example.com/squad-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  helperText="Direct HTTPS link to public screenshot"
                />
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
          Publish Account to Escrow Marketplace
        </Button>
      </form>
    </div>
  );
}
