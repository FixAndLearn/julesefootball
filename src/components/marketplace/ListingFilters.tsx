"use client";

import { Button } from "@/components/ui/Button";
import {
  Filter,
  RotateCcw,
  Search,
  Zap,
  ShieldCheck,
  X,
  SlidersHorizontal,
  Coins,
  Trophy,
  UserCheck,
  Check,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function ListingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter Form State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [platform, setPlatform] = useState(searchParams.get("platform") || "all");
  const [minStrength, setMinStrength] = useState(searchParams.get("minStrength") || "");
  const [minCoins, setMinCoins] = useState(searchParams.get("minCoins") || "");
  const [manager, setManager] = useState(searchParams.get("manager") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

  // Mobile Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Sync state whenever URL searchParams change
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setPlatform(searchParams.get("platform") || "all");
    setMinStrength(searchParams.get("minStrength") || "");
    setMinCoins(searchParams.get("minCoins") || "");
    setManager(searchParams.get("manager") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSortBy(searchParams.get("sortBy") || "newest");
  }, [searchParams]);

  // Compute number of active filters
  const activeFiltersCount = [
    search.trim() ? 1 : 0,
    platform && platform !== "all" ? 1 : 0,
    minStrength ? 1 : 0,
    minCoins ? 1 : 0,
    manager.trim() ? 1 : 0,
    minPrice ? 1 : 0,
    maxPrice ? 1 : 0,
    sortBy && sortBy !== "newest" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const applyFilters = (customOverrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();

    const finalSearch = customOverrides.search !== undefined ? customOverrides.search : search;
    const finalPlatform = customOverrides.platform !== undefined ? customOverrides.platform : platform;
    const finalMinStrength = customOverrides.minStrength !== undefined ? customOverrides.minStrength : minStrength;
    const finalMinCoins = customOverrides.minCoins !== undefined ? customOverrides.minCoins : minCoins;
    const finalManager = customOverrides.manager !== undefined ? customOverrides.manager : manager;
    const finalMinPrice = customOverrides.minPrice !== undefined ? customOverrides.minPrice : minPrice;
    const finalMaxPrice = customOverrides.maxPrice !== undefined ? customOverrides.maxPrice : maxPrice;
    const finalSortBy = customOverrides.sortBy !== undefined ? customOverrides.sortBy : sortBy;

    if (finalSearch.trim()) params.set("search", finalSearch.trim());
    if (finalPlatform && finalPlatform !== "all") params.set("platform", finalPlatform);
    if (finalMinStrength) params.set("minStrength", finalMinStrength);
    if (finalMinCoins) params.set("minCoins", finalMinCoins);
    if (finalManager.trim()) params.set("manager", finalManager.trim());
    if (finalMinPrice) params.set("minPrice", finalMinPrice);
    if (finalMaxPrice) params.set("maxPrice", finalMaxPrice);
    if (finalSortBy && finalSortBy !== "newest") params.set("sortBy", finalSortBy);

    setIsMobileDrawerOpen(false);
    router.push(`/browse?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setPlatform("all");
    setMinStrength("");
    setMinCoins("");
    setManager("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setIsMobileDrawerOpen(false);
    router.push("/browse");
  };

  const toggleQuickFilter = (key: string, value: string) => {
    const currentVal = searchParams.get(key);
    if (currentVal === value) {
      applyFilters({ [key]: "" });
    } else {
      applyFilters({ [key]: value });
    }
  };

  const metaCoaches = ["Pep Guardiola", "Jürgen Klopp", "Xabi Alonso", "Fabio Capello", "Carlo Ancelotti", "Luis Enrique"];

  return (
    <>
      {/* =========================================================================
          1. MOBILE TOP SEARCH & QUICK PILLS (lg:hidden)
          Ensures account listings appear IMMEDIATELY on mobile without scrolling
          past a massive filter form!
      ========================================================================= */}
      <div className="lg:hidden space-y-3 mb-2">
        {/* Mobile Fast Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search meta squads, coaches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-9 pr-8 py-2.5 bg-pitch-surface border border-pitch-border rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  applyFilters({ search: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => applyFilters()}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs shrink-0"
          >
            Search
          </Button>

          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
              activeFiltersCount > 0
                ? "bg-amber-500/20 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30"
                : "bg-pitch-surface border-pitch-border text-slate-300 hover:border-slate-600"
            }`}
            title="Open all filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="ml-1 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Horizontal Quick-Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs select-none">
          {/* Filter Drawer Opener Pill */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 flex items-center gap-1.5 border transition-all ${
              activeFiltersCount > 0
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/20"
                : "bg-pitch-surface border-pitch-border text-slate-200 hover:border-slate-600"
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
          </button>

          {/* Quick 3200+ OVR (User Specified Minimum) */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("minStrength", "3200")}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 border transition-all ${
              minStrength === "3200"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/20"
                : "bg-pitch-surface border-pitch-border text-slate-300 hover:border-slate-600"
            }`}
          >
            ⚡ 3200+ OVR
          </button>

          {/* Quick 3250+ OVR */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("minStrength", "3250")}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 border transition-all ${
              minStrength === "3250"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/20"
                : "bg-pitch-surface border-pitch-border text-slate-300 hover:border-slate-600"
            }`}
          >
            🔥 3250+ OVR
          </button>

          {/* Quick 3300+ OVR */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("minStrength", "3300")}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 border transition-all ${
              minStrength === "3300"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/20"
                : "bg-pitch-surface border-pitch-border text-slate-300 hover:border-slate-600"
            }`}
          >
            🏆 3300+ OVR
          </button>

          {/* Quick Android */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("platform", "android")}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 border transition-all ${
              platform === "android"
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-pitch-surface border-pitch-border text-slate-300 hover:border-slate-600"
            }`}
          >
            Android
          </button>

          {/* Quick iOS */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("platform", "ios")}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 border transition-all ${
              platform === "ios"
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-pitch-surface border-pitch-border text-slate-300 hover:border-slate-600"
            }`}
          >
            iOS
          </button>

          {/* Quick 1,000+ Coins */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("minCoins", "1000")}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 border transition-all ${
              minCoins === "1000"
                ? "bg-amber-500 text-slate-950 border-amber-400"
                : "bg-pitch-surface border-pitch-border text-slate-300 hover:border-slate-600"
            }`}
          >
            🪙 1K+ Coins
          </button>

          {/* Quick Under 3K KES */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("maxPrice", "3000")}
            className={`px-3 py-1.5 rounded-full font-bold text-[11px] shrink-0 border transition-all ${
              maxPrice === "3000"
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-pitch-surface border-pitch-border text-slate-300 hover:border-slate-600"
            }`}
          >
            💰 Under 3K
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-full text-rose-400 hover:text-rose-300 text-[11px] font-bold shrink-0 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. DESKTOP SIDEBAR FILTERS (hidden lg:block)
          Matches all actual eFootball account listing features with 3200+ minimum
      ========================================================================= */}
      <div className="hidden lg:block bg-pitch-surface/90 border border-pitch-border rounded-3xl p-5 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-pitch-border/60 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Account Filters</span>
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          )}
        </div>

        {/* 1. Keyword / Title Search */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Search Squad Title / Keyword
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Blitz Curler, Vieira, Gullit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-9 pr-3 py-2 bg-pitch-card border border-pitch-border rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
            />
          </div>
        </div>

        {/* 2. Team Strength OVR (Minimum 3200+ Presets) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">
              Team Strength (OVR)
            </label>
            <span className="text-[10px] text-amber-400 font-mono font-bold">
              Min 3200+ Meta
            </span>
          </div>

          {/* Quick Presets: 3200+, 3250+, 3300+, 3350+ */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {["3200", "3250", "3300", "3350"].map((ovr) => (
              <button
                key={ovr}
                type="button"
                onClick={() => setMinStrength(minStrength === ovr ? "" : ovr)}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  minStrength === ovr
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                {ovr}+
              </button>
            ))}
          </div>

          <select
            value={minStrength}
            onChange={(e) => setMinStrength(e.target.value)}
            className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
          >
            <option value="">Any Strength</option>
            <option value="3150">3150+ OVR (Competitive)</option>
            <option value="3200">3200+ OVR (Meta Booster)</option>
            <option value="3250">3250+ OVR (Elite Division)</option>
            <option value="3300">3300+ OVR (God-Tier Squad)</option>
            <option value="3350">3350+ OVR (Top 100 Global)</option>
          </select>
        </div>

        {/* 3. Gaming Platform */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Gaming Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
          >
            <option value="all">All Platforms</option>
            <option value="android">Android Mobile</option>
            <option value="ios">iOS Mobile</option>
            <option value="pc_steam">PC / Steam</option>
            <option value="playstation_5">PlayStation 5</option>
            <option value="playstation_4">PlayStation 4</option>
            <option value="xbox_series_x">Xbox Series X/S</option>
            <option value="xbox_one">Xbox One</option>
          </select>
        </div>

        {/* 4. eFootball Coins Balance */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>eFootball Coins Balance</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </label>
          <select
            value={minCoins}
            onChange={(e) => setMinCoins(e.target.value)}
            className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
          >
            <option value="">Any Coins Balance</option>
            <option value="500">500+ Coins</option>
            <option value="1000">1,000+ Coins</option>
            <option value="2500">2,500+ Coins</option>
            <option value="5000">5,000+ Coins</option>
            <option value="10000">10,000+ Coins (Loaded)</option>
          </select>
        </div>

        {/* 5. Head Coach (Manager) */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Head Coach</label>
          <input
            type="text"
            placeholder="e.g. Pep Guardiola, Klopp, Xabi..."
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full px-3 py-2 bg-pitch-card border border-pitch-border rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 mb-2"
          />
          <div className="flex flex-wrap gap-1">
            {metaCoaches.slice(0, 4).map((coach) => (
              <button
                key={coach}
                type="button"
                onClick={() => setManager(manager === coach ? "" : coach)}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                  manager === coach
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {coach.split(" ").pop()}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Price Range (KES) */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Price Range (KES)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min KES"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-pitch-card border border-pitch-border rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            />
            <input
              type="number"
              placeholder="Max KES"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-pitch-card border border-pitch-border rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* 7. Sort By */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Sort Listings By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
          >
            <option value="newest">Newest Listed</option>
            <option value="strength_desc">Highest Team Strength (OVR)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="coins_desc">Most eFootball Coins</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        <Button
          variant="primary"
          size="md"
          className="w-full min-h-[44px] bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs shadow-md rounded-xl"
          onClick={() => applyFilters()}
        >
          Apply Filters
        </Button>
      </div>

      {/* =========================================================================
          3. MOBILE SLIDE-OVER / BOTTOM DRAWER MODAL
          Opens when user taps "Filters" on mobile, keeping screen clean by default
      ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-lg bg-[#070D18] border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-6 z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-[#0B1424] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Filter eFootball Accounts</h3>
                {activeFiltersCount > 0 && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount} Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-rose-400 font-semibold px-2 py-1"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Form Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Strength Presets 3200+ */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Minimum Collective Strength (OVR)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["3200", "3250", "3300", "3350"].map((ovr) => (
                    <button
                      key={ovr}
                      type="button"
                      onClick={() => setMinStrength(minStrength === ovr ? "" : ovr)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                        minStrength === ovr
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-300"
                      }`}
                    >
                      {ovr}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2.5 text-xs text-slate-200"
                >
                  <option value="all">All Platforms</option>
                  <option value="android">Android Mobile</option>
                  <option value="ios">iOS Mobile</option>
                  <option value="pc_steam">PC / Steam</option>
                  <option value="playstation_5">PlayStation 5</option>
                  <option value="playstation_4">PlayStation 4</option>
                  <option value="xbox_series_x">Xbox Series X/S</option>
                  <option value="xbox_one">Xbox One</option>
                </select>
              </div>

              {/* Coins */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">eFootball Coins</label>
                <select
                  value={minCoins}
                  onChange={(e) => setMinCoins(e.target.value)}
                  className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2.5 text-xs text-slate-200"
                >
                  <option value="">Any Coins Balance</option>
                  <option value="500">500+ Coins</option>
                  <option value="1000">1,000+ Coins</option>
                  <option value="2500">2,500+ Coins</option>
                  <option value="5000">5,000+ Coins</option>
                  <option value="10000">10,000+ Coins</option>
                </select>
              </div>

              {/* Coach */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Head Coach</label>
                <input
                  type="text"
                  placeholder="e.g. Pep Guardiola, Klopp, Xabi Alonso..."
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="w-full px-3 py-2 bg-pitch-card border border-pitch-border rounded-xl text-xs text-slate-200 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {metaCoaches.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setManager(manager === c ? "" : c)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border ${
                        manager === c
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      {c.split(" ").pop()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price Range (KES)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min KES"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="Max KES"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sort Listings By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-pitch-card border border-pitch-border rounded-xl px-3 py-2.5 text-xs text-slate-200"
                >
                  <option value="newest">Newest Listed</option>
                  <option value="strength_desc">Highest Team Strength (OVR)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="coins_desc">Most Coins</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-4 border-t border-pitch-border bg-pitch-surface flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={resetFilters}
                className="flex-1 text-xs font-bold"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => applyFilters()}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
