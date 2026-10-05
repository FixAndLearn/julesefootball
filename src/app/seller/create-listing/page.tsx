"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, CheckCircle2, ShieldCheck, Trophy, Upload, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("android");
  const [gameVersion, setGameVersion] = useState("v4.0.0");
  const [region, setRegion] = useState("Global");

  const [accountLevel, setAccountLevel] = useState("45");
  const [overallStrength, setOverallStrength] = useState("3120");
  const [gpBalance, setGpBalance] = useState("1500000");
  const [coinBalance, setCoinBalance] = useState("850");
  const [efootballPoints, setEfootballPoints] = useState("12000");
  const [contractTickets, setContractTickets] = useState("10");

  const [epicCount, setEpicCount] = useState("8");
  const [bigTimeCount, setBigTimeCount] = useState("4");
  const [highlightCount, setHighlightCount] = useState("15");
  const [featuredCount, setFeaturedCount] = useState("20");
  const [legendCount, setLegendCount] = useState("10");
  const [keyPlayers, setKeyPlayers] = useState("Messi 105 Big Time, Vieira Booster, Rummenigge Epic, Ronaldinho 102");

  const [managerName, setManagerName] = useState("G. Caputto");
  const [formation, setFormation] = useState("4-2-2-2");
  const [primaryPlaystyle, setPrimaryPlaystyle] = useState("quick_counter");
  const [currentDivision, setCurrentDivision] = useState("1");
  const [highestDivision, setHighestDivision] = useState("1");

  const [konamiIdStatus, setKonamiIdStatus] = useState("linked_changeable");
  const [linkedEmailStatus, setLinkedEmailStatus] = useState("transferable_full_access");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const playersList = keyPlayers
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        title,
        description,
        price: Number(price),
        platform,
        game_version: gameVersion,
        region,
        account_level: Number(accountLevel),
        overall_team_strength: Number(overallStrength),
        gp_balance: Number(gpBalance),
        coin_balance: Number(coinBalance),
        efootball_points: Number(efootballPoints),
        contract_renewal_tickets: Number(contractTickets),
        epic_players_count: Number(epicCount),
        big_time_players_count: Number(bigTimeCount),
        highlight_players_count: Number(highlightCount),
        featured_players_count: Number(featuredCount),
        legend_players_count: Number(legendCount),
        key_players_list: playersList,
        manager_name: managerName,
        formation: formation,
        primary_playstyle: primaryPlaystyle,
        current_division: Number(currentDivision),
        highest_division: Number(highestDivision),
        konami_id_status: konamiIdStatus,
        linked_email_status: linkedEmailStatus,
        image_urls: [imageUrl],
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
          Specify exact account metrics and screenshots. Real database verification applies to all published listings.
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
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3">
            1. Basic Listing Information
          </h2>

          <Input
            label="Listing Title"
            placeholder="e.g. 3120 OVR Quick Counter Squad | 105 Messi + Booster Vieira | 850 Coins"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Listing Price (KES)"
              type="number"
              placeholder="e.g. 4500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
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
              placeholder="Describe your account achievements, standout players, training progress, and login guidelines..."
              className="w-full rounded-lg bg-pitch-card border border-pitch-border p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              required
            />
          </div>
        </div>

        {/* Section 2: Team Strength & In-Game Resources */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3">
            2. Team Strength & Balances
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Overall Team Strength (OVR)"
              type="number"
              placeholder="e.g. 3120"
              value={overallStrength}
              onChange={(e) => setOverallStrength(e.target.value)}
              required
            />

            <Input
              label="GP Balance"
              type="number"
              placeholder="e.g. 1500000"
              value={gpBalance}
              onChange={(e) => setGpBalance(e.target.value)}
              required
            />

            <Input
              label="eFootball Coins"
              type="number"
              placeholder="e.g. 850"
              value={coinBalance}
              onChange={(e) => setCoinBalance(e.target.value)}
              required
            />

            <Input
              label="eFootball Points"
              type="number"
              placeholder="e.g. 12000"
              value={efootballPoints}
              onChange={(e) => setEfootballPoints(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Current Division"
              type="number"
              min={1}
              max={10}
              value={currentDivision}
              onChange={(e) => setCurrentDivision(e.target.value)}
              required
            />
            <Input
              label="Highest Division Ever"
              type="number"
              min={1}
              max={10}
              value={highestDivision}
              onChange={(e) => setHighestDivision(e.target.value)}
              required
            />
            <Input
              label="Contract Renewal Tickets"
              type="number"
              value={contractTickets}
              onChange={(e) => setContractTickets(e.target.value)}
              required
            />
            <Input
              label="Account Level"
              type="number"
              value={accountLevel}
              onChange={(e) => setAccountLevel(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 3: Squad Composition & Tactics */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3">
            3. Special Player Cards & Tactics
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Input
              label="Epic Cards"
              type="number"
              value={epicCount}
              onChange={(e) => setEpicCount(e.target.value)}
            />
            <Input
              label="Big Time Cards"
              type="number"
              value={bigTimeCount}
              onChange={(e) => setBigTimeCount(e.target.value)}
            />
            <Input
              label="Highlight Cards"
              type="number"
              value={highlightCount}
              onChange={(e) => setHighlightCount(e.target.value)}
            />
            <Input
              label="Featured Cards"
              type="number"
              value={featuredCount}
              onChange={(e) => setFeaturedCount(e.target.value)}
            />
            <Input
              label="Legend Cards"
              type="number"
              value={legendCount}
              onChange={(e) => setLegendCount(e.target.value)}
            />
          </div>

          <Input
            label="Key Featured Player Names (Comma separated)"
            placeholder="e.g. Messi 105 Big Time, Vieira Booster, Rummenigge Epic"
            value={keyPlayers}
            onChange={(e) => setKeyPlayers(e.target.value)}
            helperText="Separate multiple card names with commas"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Head Coach / Manager"
              placeholder="e.g. G. Caputto or Pep Guardiola"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
            />

            <Input
              label="Formation"
              placeholder="e.g. 4-2-2-2 or 4-3-3"
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

        {/* Section 4: Security & Konami ID Status */}
        <div className="bg-pitch-surface border border-pitch-border rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 font-display border-b border-pitch-border/60 pb-3">
            4. Konami ID Linking & Transfer Safety
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
                <option value="transferable_full_access">Full Access (Primary Email Given to Buyer)</option>
                <option value="buyer_email_bindable">Buyer Email Bindable (Assisted Transfer)</option>
              </select>
            </div>
          </div>

          <Input
            label="Squad Screenshot Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            helperText="High-resolution image showing the starting XI squad and substitutes"
            required
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full font-bold text-base shadow-2xl"
          isLoading={loading}
        >
          Publish Account to Escrow Marketplace
        </Button>
      </form>
    </div>
  );
}
