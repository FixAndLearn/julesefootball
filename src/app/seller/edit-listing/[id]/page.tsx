"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Upload,
  UploadCloud,
  Zap,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Save,
  Eye,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Listing } from "@/types/database";

interface UploadedImage {
  url: string;
  fileName: string;
  size: number;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("android");
  const [gameVersion, setGameVersion] = useState("v4.0.0");
  const [region, setRegion] = useState("Global");
  const [status, setStatus] = useState("published");

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

  // Real Squad Images State
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
        setDescription(l.description || "");
        setPrice(String(l.price || ""));
        setPlatform(l.platform || "android");
        setGameVersion(l.game_version || "v4.0.0");
        setRegion(l.region || "Global");
        setStatus(l.status || "published");

        setAccountLevel(String(l.account_level || 1));
        setOverallStrength(String(l.overall_team_strength || ""));
        setGpBalance(String(l.gp_balance || ""));
        setCoinBalance(String(l.coin_balance || ""));
        setEfootballPoints(String(l.efootball_points || ""));
        setContractTickets(String(l.contract_renewal_tickets || ""));

        setEpicCount(String(l.epic_players_count || ""));
        setBigTimeCount(String(l.big_time_players_count || ""));
        setHighlightCount(String(l.highlight_players_count || ""));
        setFeaturedCount(String(l.featured_players_count || ""));
        setLegendCount(String(l.legend_players_count || ""));
        setKeyPlayers(Array.isArray(l.key_players_list) ? l.key_players_list.join(", ") : "");

        setManagerName(l.manager_name || "");
        setFormation(l.formation || "");
        setPrimaryPlaystyle(l.primary_playstyle || "quick_counter");
        setCurrentDivision(String(l.current_division || ""));
        setHighestDivision(String(l.highest_division || ""));

        setKonamiIdStatus(l.konami_id_status || "linked_changeable");
        setLinkedEmailStatus(l.linked_email_status || "transferable_full_access");

        if (l.images && l.images.length > 0) {
          setImages(
            l.images.map((img) => ({
              url: img.image_url,
              fileName: `Squad Image`,
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

  const handleFilesUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      setUploadError("Maximum 5 screenshots allowed per listing.");
      return;
    }

    setUploadingImages(true);
    setUploadError("");

    try {
      const uploadPromises = files.map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`File "${file.name}" is not an image.`);
        }
        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds maximum allowed file size of 15MB.`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || `Upload failed for ${file.name}`);
        }

        const result = await res.json();
        return {
          url: result.url,
          fileName: file.name,
          size: file.size,
        };
      });

      const uploadedResults = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedResults]);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload screenshots.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!title.trim()) {
        throw new Error("Please enter a listing title.");
      }

      if (!price || Number(price) < 100) {
        throw new Error("Listing price must be at least 100 KES.");
      }

      if (!overallStrength || Number(overallStrength) < 2000) {
        throw new Error("Overall Team Strength (OVR) is required and must be at least 2000.");
      }

      if (images.length === 0) {
        throw new Error("Please retain at least one squad screenshot.");
      }

      const playersList = keyPlayers
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const parseDiv = (v: string) => {
        const n = Number(v);
        if (isNaN(n) || n < 1 || n > 10) return 10;
        return n;
      };

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        platform,
        game_version: gameVersion,
        region,
        status,
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

      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update listing.");
      }

      setSuccessMessage("Listing updated successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/listings/${id}`);
      }, 1200);
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
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading listing details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Navigation */}
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
              Preview Listing
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
            {deleting ? "Deleting..." : "Delete Listing"}
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
          Edit Account Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Update squad details, pricing, player cards, and screenshots for your account.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div>{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <div>{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-8">
        {/* Section 1: Screenshots */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Account Screenshots ({images.length}/5)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload up to 5 squad or player screenshots in original quality.
              </p>
            </div>
            {images.length < 5 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Add Image
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
          />

          {uploadError && (
            <p className="text-xs text-rose-400">{uploadError}</p>
          )}

          {/* Image Previews */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-pitch-border bg-slate-900"
              >
                <img
                  src={img.url}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-600/90 text-white opacity-80 hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/90 text-slate-950 rounded">
                    COVER
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Core Details */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-100 font-display">
            Basic Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Listing Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3140 OVR Full Epic Milan squad + 1500 Coins"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Price (KES) *
              </label>
              <Input
                type="number"
                min="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gaming Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-pitch-card border border-pitch-border text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="android">Android (Mobile)</option>
                <option value="ios">iOS (iPhone/iPad)</option>
                <option value="pc_steam">PC (Steam)</option>
                <option value="playstation_4">PlayStation 4</option>
                <option value="playstation_5">PlayStation 5</option>
                <option value="xbox_one">Xbox One</option>
                <option value="xbox_series_x">Xbox Series X|S</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-pitch-card border border-pitch-border text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="published">Published (Visible in Browse)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight standout players, managers, achievements, and transfer details..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-pitch-card border border-pitch-border text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Section 3: In-Game Stats & Resources */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-100 font-display">
            Squad Strength & In-Game Assets
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Team Strength (OVR) *
              </label>
              <Input
                type="number"
                min="2000"
                value={overallStrength}
                onChange={(e) => setOverallStrength(e.target.value)}
                placeholder="3120"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Coins Balance
              </label>
              <Input
                type="number"
                min="0"
                value={coinBalance}
                onChange={(e) => setCoinBalance(e.target.value)}
                placeholder="1200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                GP Balance
              </label>
              <Input
                type="number"
                min="0"
                value={gpBalance}
                onChange={(e) => setGpBalance(e.target.value)}
                placeholder="2500000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                eFootball Points
              </label>
              <Input
                type="number"
                min="0"
                value={efootballPoints}
                onChange={(e) => setEfootballPoints(e.target.value)}
                placeholder="15000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                Epics Count
              </label>
              <Input
                type="number"
                min="0"
                value={epicCount}
                onChange={(e) => setEpicCount(e.target.value)}
                placeholder="8"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-indigo-300 mb-1">
                Big Time Count
              </label>
              <Input
                type="number"
                min="0"
                value={bigTimeCount}
                onChange={(e) => setBigTimeCount(e.target.value)}
                placeholder="4"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                Highlight Cards
              </label>
              <Input
                type="number"
                min="0"
                value={highlightCount}
                onChange={(e) => setHighlightCount(e.target.value)}
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                Featured Cards
              </label>
              <Input
                type="number"
                min="0"
                value={featuredCount}
                onChange={(e) => setFeaturedCount(e.target.value)}
                placeholder="20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Legends Count
              </label>
              <Input
                type="number"
                min="0"
                value={legendCount}
                onChange={(e) => setLegendCount(e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Key Featured Players (comma-separated)
            </label>
            <Input
              value={keyPlayers}
              onChange={(e) => setKeyPlayers(e.target.value)}
              placeholder="e.g. Rummenigge, Messi 2015, Vieira, Gullit, Cech, Cruyff"
            />
          </div>
        </div>

        {/* Section 4: Tactics & Divisions */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-100 font-display">
            Tactics & Safety Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Playstyle
              </label>
              <select
                value={primaryPlaystyle}
                onChange={(e) => setPrimaryPlaystyle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-pitch-card border border-pitch-border text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="quick_counter">Quick Counter</option>
                <option value="possession">Possession Game</option>
                <option value="long_ball_counter">Long Ball Counter</option>
                <option value="out_wide">Out Wide</option>
                <option value="long_ball">Long Ball</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Division (1 - 10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={currentDivision}
                onChange={(e) => setCurrentDivision(e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Highest Division (1 - 10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={highestDivision}
                onChange={(e) => setHighestDivision(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Konami ID Status
              </label>
              <select
                value={konamiIdStatus}
                onChange={(e) => setKonamiIdStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-pitch-card border border-pitch-border text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="linked_changeable">Linked (Email changeable to buyer)</option>
                <option value="unlinked">Unlinked (Buyer binds directly)</option>
                <option value="linked_immutable">Linked (Fixed email)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Linked Email Status
              </label>
              <select
                value={linkedEmailStatus}
                onChange={(e) => setLinkedEmailStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-pitch-card border border-pitch-border text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="transferable_full_access">Transferable Full Access</option>
                <option value="buyer_email_bindable">Buyer Email Bindable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href={`/listings/${id}`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="gold" size="lg" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
