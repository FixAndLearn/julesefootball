"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, getPlatformLabel, getPlaystyleLabel } from "@/lib/utils";
import { formatWhatsAppPhone, normalizePhoneNumber } from "@/lib/utils/phone";
import { Platform, Playstyle, WantedRequest } from "@/types/database";
import {
  Target,
  PlusCircle,
  MessageCircle,
  ShieldCheck,
  Zap,
  Filter,
  CheckCircle2,
  X,
  Smartphone,
  Sparkles,
  Search,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function WantedBoardPage() {
  const [requests, setRequests] = useState<WantedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Request Form State
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [reqTitle, setReqTitle] = useState("");
  const [reqDescription, setReqDescription] = useState("");
  const [reqMinOvr, setReqMinOvr] = useState("3100");
  const [reqPlatform, setReqPlatform] = useState<Platform>("android");
  const [reqPlaystyle, setReqPlaystyle] = useState<Playstyle>("quick_counter");
  const [reqBudget, setReqBudget] = useState("");
  const [reqKeyPlayers, setReqKeyPlayers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url =
        platformFilter !== "all"
          ? `/api/wanted?platform=${encodeURIComponent(platformFilter)}`
          : "/api/wanted";
      const res = await fetch(url);
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.warn("Failed to fetch wanted requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [platformFilter]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!reqTitle || !reqBudget) {
      setFormError("Title and budget are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wanted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyerName || "Verified Buyer",
          buyer_phone: buyerPhone ? normalizePhoneNumber(buyerPhone).international : "+254794400365",
          title: reqTitle,
          description: reqDescription,
          min_overall_rating: parseInt(reqMinOvr, 10) || 3000,
          preferred_platform: reqPlatform,
          target_playstyle: reqPlaystyle,
          budget_kes: parseInt(reqBudget, 10),
          key_players_wanted: reqKeyPlayers
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post request");
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setReqTitle("");
        setReqDescription("");
        setReqBudget("");
        setReqKeyPlayers("");
        fetchRequests();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.key_players_wanted?.some((p) => p.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/60 via-pitch-card to-slate-900 border border-amber-500/30 p-6 sm:p-10 mb-10 overflow-hidden shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Wanted Squads • Cash Ready in Kenya</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Buyers Requesting eFootball Accounts
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Have a high OVR account or specific Epic cards? Connect directly with ready Kenyan buyers with M-Pesa funds on standby. Every deal is locked through Till <strong className="text-emerald-400">1572931</strong> escrow!
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="gold"
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="font-bold shadow-xl active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Post Account Request
            </Button>
            <Link href="/seller/create-listing">
              <Button variant="outline" size="lg" className="w-full text-xs font-semibold">
                Sell Squad Directly
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* Platform Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Platforms" },
            { id: "android", label: "Android" },
            { id: "ios", label: "iOS (Apple)" },
            { id: "pc_steam", label: "Steam / PC" },
            { id: "playstation_5", label: "PlayStation" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlatformFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                platformFilter === tab.id
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-pitch-surface border border-pitch-border text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search wanted players or OVR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-pitch-surface border border-pitch-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-pitch-surface border border-pitch-border animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-pitch-surface border border-pitch-border rounded-3xl p-8 space-y-4">
          <Target className="w-12 h-12 text-slate-500 mx-auto stroke-[1.5]" />
          <h3 className="text-lg font-bold text-white">No active requests for this filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Be the first buyer to post a request or check back shortly as Kenyan gamers post new squad desires.
          </p>
          <Button variant="gold" size="sm" onClick={() => setIsModalOpen(true)}>
            Post a Wanted Request
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-pitch-surface border border-pitch-border hover:border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="brand" size="sm">
                    {getPlatformLabel(req.preferred_platform)}
                  </Badge>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-300">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Min OVR {req.min_overall_rating}+</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                {/* Target Playstyle & Key Players */}
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-300">Playstyle:</span>
                    <span className="text-slate-200">{getPlaystyleLabel(req.target_playstyle)}</span>
                  </div>

                  {req.key_players_wanted && req.key_players_wanted.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {req.key_players_wanted.map((player, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-pitch-card border border-pitch-border text-[10px] font-semibold text-amber-300"
                        >
                          ⭐ {player}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with Budget & Contact CTA */}
              <div className="mt-6 pt-4 border-t border-pitch-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Buyer Budget</span>
                    <span className="text-lg font-extrabold text-emerald-400 font-display">
                      {formatCurrency(req.budget_kes, "KES")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Requested by</span>
                    <span className="text-xs font-bold text-slate-200">{req.buyer_name}</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${formatWhatsAppPhone(req.buyer_phone || "254794400365")}?text=${encodeURIComponent(
                    `Hello ${req.buyer_name}, I saw your request on eFootballMarket: "${req.title}". I have a squad available! Let's complete the trade via Escrow (Till 1572931): https://www.efootballmarket.co.ke`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>I Have This Squad (WhatsApp Buyer)</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Escrow Guarantee Safety Banner */}
      <div className="mt-12 bg-gradient-to-r from-emerald-950/40 via-pitch-card to-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Safe Trading Protocol for Wanted Deals</h4>
            <p className="text-xs text-slate-300">
              Never send credentials or money directly on WhatsApp. Always create a listing and process payment through Lipa Na M-Pesa Till <strong>1572931</strong>.
            </p>
          </div>
        </div>
        <Link href="/seller/create-listing" className="shrink-0">
          <Button variant="gold" size="sm" className="w-full text-xs font-bold">
            Create Protected Listing
          </Button>
        </Link>
      </div>

      {/* Post Wanted Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-pitch-surface border border-pitch-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-pitch-border bg-pitch-card/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Post Desired Account Request</h3>
                  <p className="text-xs text-slate-400">Kenyan sellers will pitch matching squads to you.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 overflow-y-auto space-y-4">
              {submitSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                  <h4 className="text-sm font-bold">Request Posted Live!</h4>
                  <p className="text-xs">Sellers can now reach out with matching eFootball accounts.</p>
                </div>
              ) : (
                <>
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Your Name / Nickname"
                      placeholder="e.g. Brian O."
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                    />
                    <Input
                      label="Your Phone / WhatsApp"
                      placeholder="e.g. +254 794 400 365"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <Input
                    label="Request Title"
                    placeholder="e.g. Looking for 3120+ OVR with Blitz Curler Son + Vieira"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Platform</label>
                      <select
                        value={reqPlatform}
                        onChange={(e) => setReqPlatform(e.target.value as Platform)}
                        className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="android">Android</option>
                        <option value="ios">iOS (Apple)</option>
                        <option value="pc_steam">Steam / PC</option>
                        <option value="playstation_5">PlayStation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Playstyle</label>
                      <select
                        value={reqPlaystyle}
                        onChange={(e) => setReqPlaystyle(e.target.value as Playstyle)}
                        className="w-full bg-pitch-card border border-pitch-border rounded-lg px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="quick_counter">Quick Counter</option>
                        <option value="possession">Possession</option>
                        <option value="long_ball_counter">Long Ball Counter</option>
                        <option value="out_wide">Out Wide</option>
                      </select>
                    </div>

                    <Input
                      label="Min OVR Rating"
                      type="number"
                      placeholder="3100"
                      value={reqMinOvr}
                      onChange={(e) => setReqMinOvr(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Maximum Cash Budget (KES)"
                    type="number"
                    placeholder="e.g. 3500"
                    value={reqBudget}
                    onChange={(e) => setReqBudget(e.target.value)}
                    required
                  />

                  <Input
                    label="Key Epics / Players Wanted (Comma separated)"
                    placeholder="e.g. Blitz Curler Son, 105 Messi, Vieira, Gullit"
                    value={reqKeyPlayers}
                    onChange={(e) => setReqKeyPlayers(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Specific Requirements</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Prefer clean email link with at least 500 spare coins. Ready to buy today."
                      value={reqDescription}
                      onChange={(e) => setReqDescription(e.target.value)}
                      className="w-full bg-pitch-card border border-pitch-border rounded-lg p-3 text-xs text-slate-200"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full font-bold"
                      isLoading={submitting}
                    >
                      Publish Wanted Request
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
