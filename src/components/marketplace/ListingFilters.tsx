"use client";

import { Button } from "@/components/ui/Button";
import { Filter, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ListingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [platform, setPlatform] = useState(searchParams.get("platform") || "all");
  const [playstyle, setPlaystyle] = useState(searchParams.get("playstyle") || "all");
  const [minStrength, setMinStrength] = useState(searchParams.get("minStrength") || "");
  const [minCoins, setMinCoins] = useState(searchParams.get("minCoins") || "");
  const [minEpics, setMinEpics] = useState(searchParams.get("minEpics") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (platform && platform !== "all") params.set("platform", platform);
    if (playstyle && playstyle !== "all") params.set("playstyle", playstyle);
    if (minStrength) params.set("minStrength", minStrength);
    if (minCoins) params.set("minCoins", minCoins);
    if (minEpics) params.set("minEpics", minEpics);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy);

    router.push(`/browse?${params.toString()}`);
  };

  const resetFilters = () => {
    setPlatform("all");
    setPlaystyle("all");
    setMinStrength("");
    setMinCoins("");
    setMinEpics("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    router.push("/browse");
  };

  return (
    <div className="bg-pitch-surface/90 border border-pitch-border rounded-2xl p-5 shadow-lg space-y-5">
      <div className="flex items-center justify-between border-b border-pitch-border/60 pb-3">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Filter className="w-4 h-4 text-brand-400" />
          <span>Filter Accounts</span>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Platform */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Gaming Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="all">All Platforms</option>
          <option value="android">Android Mobile</option>
          <option value="ios">iOS Mobile</option>
          <option value="pc_steam">PC / Steam</option>
          <option value="playstation_4">PlayStation 4</option>
          <option value="playstation_5">PlayStation 5</option>
          <option value="xbox_one">Xbox One</option>
          <option value="xbox_series_x">Xbox Series X/S</option>
        </select>
      </div>

      {/* Tactical Playstyle */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Playstyle</label>
        <select
          value={playstyle}
          onChange={(e) => setPlaystyle(e.target.value)}
          className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="all">All Playstyles</option>
          <option value="quick_counter">Quick Counter</option>
          <option value="possession">Possession Game</option>
          <option value="long_ball_counter">Long Ball Counter</option>
          <option value="out_wide">Out Wide</option>
          <option value="long_ball">Long Ball</option>
        </select>
      </div>

      {/* Minimum Team Strength OVR */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Min Team Strength (OVR)</label>
        <select
          value={minStrength}
          onChange={(e) => setMinStrength(e.target.value)}
          className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">Any Strength</option>
          <option value="2800">2800+ OVR</option>
          <option value="2950">2950+ OVR</option>
          <option value="3050">3050+ OVR</option>
          <option value="3100">3100+ OVR</option>
          <option value="3150">3150+ OVR (Elite)</option>
        </select>
      </div>

      {/* Minimum Epic Players */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Min Epic Players Count</label>
        <input
          type="number"
          placeholder="e.g. 5"
          value={minEpics}
          onChange={(e) => setMinEpics(e.target.value)}
          className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Price Range (KES)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min KES"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-pitch-card border border-pitch-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
          <input
            type="number"
            placeholder="Max KES"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-pitch-card border border-pitch-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Sort Listings By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="newest">Newest Listed</option>
          <option value="strength_desc">Highest Team Strength (OVR)</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>

      <Button variant="primary" size="sm" className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );
}
