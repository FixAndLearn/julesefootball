"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { MiddlemanDeal } from "@/app/api/middleman/route";
import { HowToEscrowJsonLd } from "@/components/seo/JsonLd";
import { AdBanner } from "@/components/common/AdBanner";
import {
  Handshake,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Clock,
  Lock,
  Search,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Share2,
  Link2,
  Check,
} from "lucide-react";

function MiddlemanContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"create" | "generator" | "track">("create");

  // Create Deal Form
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [dealTitle, setDealTitle] = useState("");
  const [dealDescription, setDealDescription] = useState("");
  const [dealAmount, setDealAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdDeal, setCreatedDeal] = useState<MiddlemanDeal | null>(null);
  const [formError, setFormError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Generator State
  const [genTitle, setGenTitle] = useState("");
  const [genAmount, setGenAmount] = useState("");
  const [genSellerPhone, setGenSellerPhone] = useState("");
  const [genBuyerPhone, setGenBuyerPhone] = useState("");
  const [copiedInviteText, setCopiedInviteText] = useState(false);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState(false);

  // Track Deal
  const [searchCode, setSearchCode] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedDeals, setTrackedDeals] = useState<MiddlemanDeal[] | null>(null);
  const [trackError, setTrackError] = useState("");

  const searchDealByCode = async (codeToSearch: string) => {
    if (!codeToSearch) return;
    setTrackingLoading(true);
    setTrackError("");
    try {
      const isPhone = codeToSearch.replace(/[^0-9]/g, "").length >= 9;
      const url = isPhone
        ? `/api/middleman?phone=${encodeURIComponent(codeToSearch)}`
        : `/api/middleman?code=${encodeURIComponent(codeToSearch)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.deals && data.deals.length > 0) {
        setTrackedDeals(data.deals);
      } else {
        setTrackError("No active escrow contract found with this code or phone.");
        setTrackedDeals([]);
      }
    } catch {
      setTrackError("Error searching for deal.");
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    const qCode = searchParams.get("code");
    const qTitle = searchParams.get("title");
    const qAmount = searchParams.get("amount");
    const qSeller = searchParams.get("seller") || searchParams.get("seller_phone");
    const qBuyer = searchParams.get("buyer") || searchParams.get("buyer_phone");
    const qTab = searchParams.get("tab");

    if (qCode) {
      setSearchCode(qCode);
      setActiveTab("track");
      searchDealByCode(qCode);
    } else if (qTitle || qAmount || qSeller || qBuyer) {
      if (qTitle) {
        setDealTitle(qTitle);
        setGenTitle(qTitle);
      }
      if (qAmount) {
        setDealAmount(qAmount);
        setGenAmount(qAmount);
      }
      if (qSeller) {
        setSellerPhone(qSeller);
        setGenSellerPhone(qSeller);
      }
      if (qBuyer) {
        setBuyerPhone(qBuyer);
        setGenBuyerPhone(qBuyer);
      }
      if (qTab === "generator") {
        setActiveTab("generator");
      } else {
        setActiveTab("create");
      }
    } else if (qTab === "generator") {
      setActiveTab("generator");
    }
  }, [searchParams]);

  const numAmount = Number(dealAmount) || 0;
  const escrowFee = numAmount > 0 ? Math.max(50, Math.min(350, Math.round(numAmount * 0.05))) : 0;
  const totalPayable = numAmount + escrowFee;

  const appBaseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.efootballmarket.co.ke";
  const effectiveGenTitle = genTitle || dealTitle || "";
  const effectiveGenAmount = genAmount || dealAmount || "";
  const displayAmount = effectiveGenAmount ? `KES ${Number(effectiveGenAmount).toLocaleString()}` : "Agreed Price";
  const generatedInviteUrl = `${appBaseUrl}/middleman?title=${encodeURIComponent(effectiveGenTitle || "eFootball Deal")}${effectiveGenAmount ? `&amount=${encodeURIComponent(effectiveGenAmount)}` : ""}${genSellerPhone ? `&seller=${encodeURIComponent(genSellerPhone)}` : ""}${genBuyerPhone ? `&buyer=${encodeURIComponent(genBuyerPhone)}` : ""}`;

  const generatedWhatsAppGroupMessage =
    `🔒 *OFFICIAL ESCROW TRADE CONTRACT*\n\n` +
    `🎮 *Squad / Item:* ${effectiveGenTitle || "eFootball Account"}\n` +
    `💰 *Agreed Price:* ${displayAmount}\n` +
    `🛡️ *Escrow Vault:* Safaricom Till 1572931 (EFootballMarket)\n` +
    `👤 *Escrow Officer:* Brian Okibo (+254 794 400 365)\n\n` +
    `⚠️ *Protection Policy:* Funds remain locked until the buyer inspects squad players, coins, and changes Konami ID credentials.\n\n` +
    `👉 *Open & Lock Contract:* ${generatedInviteUrl}`;

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!buyerPhone || !sellerPhone || !dealTitle || !dealAmount) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/middleman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyerName || "Verified Buyer",
          buyer_phone: normalizePhoneNumber(buyerPhone).international,
          seller_name: sellerName || "Verified Seller",
          seller_phone: normalizePhoneNumber(sellerPhone).international,
          deal_title: dealTitle,
          deal_description: dealDescription,
          item_amount_kes: numAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create escrow contract");
      }

      setCreatedDeal(data.deal);
    } catch (err: any) {
      setFormError(err.message || "Failed to create deal.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");

    if (!searchCode) return;

    setTrackingLoading(true);
    try {
      const isPhone = searchCode.replace(/[^0-9]/g, "").length >= 9;
      const url = isPhone
        ? `/api/middleman?phone=${encodeURIComponent(searchCode)}`
        : `/api/middleman?code=${encodeURIComponent(searchCode)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.deals && data.deals.length > 0) {
        setTrackedDeals(data.deals);
      } else {
        setTrackError("No active escrow contract found with this code or phone.");
        setTrackedDeals([]);
      }
    } catch (err: any) {
      setTrackError("Error searching for deal.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const copyDealText = (deal: MiddlemanDeal) => {
    const text = `🤝 *eFootballMarket Safe Escrow Deal [${deal.deal_code}]*\n🎮 *Account*: ${deal.deal_title}\n💰 *Escrow Amount*: KES ${deal.item_amount_kes}\n🛡️ *Funds Locked In*: Till 1572931 (EFootballMarket)\n👤 *Escrow Officer*: Brian Okibo (0794400365)\n🔗 *Track Contract*: https://www.efootballmarket.co.ke/middleman?code=${deal.deal_code}`;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <HowToEscrowJsonLd />

      {/* Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950/60 via-pitch-card to-slate-900 border border-emerald-500/40 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Safe Escrow for WhatsApp & Facebook Trades
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Met an eFootball trader in a private WhatsApp group or on social media? Stop arguing over who sends first. Lock the money into <strong>Safaricom Till 1572931</strong>, verify the Konami ID credentials, and complete the deal securely.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safaricom Escrow Protected
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Smartphone className="w-4 h-4 text-amber-400" /> M-Pesa Till 1572931
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
              <UserCheck className="w-4 h-4 text-indigo-400" /> Officer: Brian Okibo (+254 794 400 365)
            </span>
          </div>
        </div>
      </div>

      {/* 4-Step Institutional Workflow Roadmap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
              1
            </span>
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Agreement</span>
          </div>
          <h4 className="text-xs font-bold text-white">Create Contract</h4>
          <p className="text-[11px] text-[#94A3B8] leading-normal">
            Enter trade title, price, and WhatsApp numbers. Unique contract code is generated.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-xs font-bold border border-[#22C55E]/40">
              2
            </span>
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">M-Pesa Vault</span>
          </div>
          <h4 className="text-xs font-bold text-white">Buyer Pays Till 1572931</h4>
          <p className="text-[11px] text-[#94A3B8] leading-normal">
            Buyer pays Safaricom Till 1572931. Officer Brian Okibo locks funds into neutral holding.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold border border-amber-500/40">
              3
            </span>
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Handover</span>
          </div>
          <h4 className="text-xs font-bold text-white">24h Inspection</h4>
          <p className="text-[11px] text-[#94A3B8] leading-normal">
            Seller submits Konami ID. Buyer logs in, tests squad, changes email & activates 2FA.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/40">
              4
            </span>
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Settlement</span>
          </div>
          <h4 className="text-xs font-bold text-white">Payout Released</h4>
          <p className="text-[11px] text-[#94A3B8] leading-normal">
            Buyer approves delivery or 24 hours lapse. Seller receives direct M-Pesa payout.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-pitch-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "create"
              ? "bg-emerald-600 text-white shadow-lg"
              : "bg-pitch-surface border border-pitch-border text-slate-300 hover:text-white"
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Create Escrow Contract</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("generator")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === "generator"
              ? "bg-slate-800 text-white shadow-sm border border-slate-700"
              : "bg-pitch-surface border border-pitch-border text-slate-300 hover:text-white"
          }`}
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp Deal Link</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("track")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "track"
              ? "bg-emerald-600 text-white shadow-lg"
              : "bg-pitch-surface border border-pitch-border text-slate-300 hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Track Deal Status</span>
        </button>
      </div>

      {/* Tab 1: Create Deal */}
      {activeTab === "create" && (
        <div>
          {createdDeal ? (
            /* Created Contract Summary Screen */
            <div className="bg-pitch-surface border border-emerald-500/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-pitch-border pb-5">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    Escrow Contract Generated
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-2 font-display">
                    Deal Code: {createdDeal.deal_code}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Account: <strong>{createdDeal.deal_title}</strong>
                  </p>
                </div>

                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => copyDealText(createdDeal)}
                  className="font-bold shrink-0"
                >
                  <Copy className="w-4 h-4 mr-1.5" />
                  {copiedCode ? "Copied Deal!" : "Copy Contract Info"}
                </Button>
              </div>

              {/* Deal Breakdown Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-pitch-card border border-pitch-border space-y-1">
                  <span className="text-xs text-slate-400">Seller Payout</span>
                  <p className="text-xl font-bold text-white font-display">
                    {formatCurrency(createdDeal.item_amount_kes, "KES")}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    Seller: {createdDeal.seller_name} ({createdDeal.seller_phone})
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-pitch-card border border-pitch-border space-y-1">
                  <span className="text-xs text-slate-400">Escrow Security Fee (5%)</span>
                  <p className="text-xl font-bold text-amber-400 font-display">
                    {formatCurrency(createdDeal.escrow_fee_kes, "KES")}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    Includes Konami 2FA verification & dispute cover
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                  <span className="text-xs text-emerald-300">Total Payable to Till</span>
                  <p className="text-2xl font-black text-emerald-400 font-display">
                    {formatCurrency(createdDeal.total_amount_kes, "KES")}
                  </p>
                  <span className="text-[11px] text-emerald-200 block font-semibold">
                    Buy Goods Till: 1572931
                  </span>
                </div>
              </div>

              {/* Step-by-Step Execution Guide */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>How This Trade is Executed Safely</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-300 pt-1">
                  <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                    <strong className="text-emerald-400 block mb-1">1. Buyer Pays Till</strong>
                    Buyer sends KES {createdDeal.total_amount_kes} to Till <strong>1572931</strong>.
                  </div>
                  <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                    <strong className="text-emerald-400 block mb-1">2. Funds Locked</strong>
                    Officer Brian Okibo verifies funds are locked in Escrow.
                  </div>
                  <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                    <strong className="text-emerald-400 block mb-1">3. Konami Handover</strong>
                    Seller delivers email/pass. Buyer changes email & enables 2FA.
                  </div>
                  <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                    <strong className="text-emerald-400 block mb-1">4. Payout to Seller</strong>
                    Buyer confirms ownership &rarr; KES {createdDeal.item_amount_kes} sent to seller M-Pesa.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `🤝 *eFootballMarket Safe Escrow Deal [${createdDeal.deal_code}]*\n🎮 *Account*: ${createdDeal.deal_title}\n💰 *Escrow Amount*: KES ${createdDeal.item_amount_kes}\n🛡️ *Funds Locked In*: Till 1572931 (EFootballMarket)\n👤 *Escrow Officer*: Brian Okibo (0794400365)\n🔗 *Track Contract*: https://www.efootballmarket.co.ke/middleman?code=${createdDeal.deal_code}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Send Contract to WhatsApp Group / Counterparty</span>
                </a>

                <a
                  href={`https://wa.me/254794400365?text=${encodeURIComponent(
                    `Hello Brian Okibo, I created a Middleman Escrow deal [${createdDeal.deal_code}] for "${createdDeal.deal_title}". Total: KES ${createdDeal.total_amount_kes}. Ready to pay to Till 1572931.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-all"
                >
                  <span>Notify Officer Brian (0794400365)</span>
                </a>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCreatedDeal(null)}
                  className="w-full sm:w-auto text-xs"
                >
                  Create Another Deal
                </Button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form
              onSubmit={handleCreateDeal}
              className="bg-pitch-surface border border-pitch-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="border-b border-pitch-border pb-4">
                <h3 className="text-lg font-bold text-white font-display">
                  Initiate a Private Middleman Escrow Deal
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Input details agreed with your counterparty. A neutral contract will be created instantly.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Counterparty Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  1. Participants Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-pitch-card border border-pitch-border space-y-3">
                    <span className="text-xs font-bold text-emerald-400 block">Buyer (Sending M-Pesa)</span>
                    <Input
                      label="Buyer Name"
                      placeholder="e.g. Dennis K."
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                    />
                    <Input
                      label="Buyer Safaricom Phone"
                      placeholder="e.g. +254 712 345 678"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-pitch-card border border-pitch-border space-y-3">
                    <span className="text-xs font-bold text-amber-400 block">Seller (Handing over Konami ID)</span>
                    <Input
                      label="Seller Name"
                      placeholder="e.g. Eric M."
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                    />
                    <Input
                      label="Seller Safaricom Phone"
                      placeholder="e.g. +254 798 765 432"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Deal Specifics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  2. Deal Details & Agreed Amount
                </h4>

                <Input
                  label="Account / Squad Name"
                  placeholder="e.g. 3120 OVR Quick Counter with 105 Messi & Blitz Curler Son"
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Agreed Price to Seller (KES)"
                    type="number"
                    placeholder="e.g. 2500"
                    value={dealAmount}
                    onChange={(e) => setDealAmount(e.target.value)}
                    required
                  />

                  {/* Live Calculation Preview */}
                  <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border flex flex-col justify-center">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Agreed Seller Price:</span>
                      <strong className="text-white">KES {numAmount}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mt-1">
                      <span>Escrow Protection Fee (5%):</span>
                      <strong className="text-amber-400">KES {escrowFee}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-t border-slate-700 pt-1 mt-1">
                      <span>Total to Till 1572931:</span>
                      <span className="text-base font-extrabold">KES {totalPayable}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Special Transfer Conditions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Seller agreed to provide first email creation proof and test match access."
                    value={dealDescription}
                    onChange={(e) => setDealDescription(e.target.value)}
                    className="w-full bg-pitch-card border border-pitch-border rounded-lg p-3 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full font-bold shadow-xl"
                  isLoading={loading}
                >
                  <Handshake className="w-5 h-5 mr-2" />
                  Generate Protected Escrow Contract
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab: WhatsApp Group Link Generator */}
      {activeTab === "generator" && (
        <div className="bg-pitch-surface border border-emerald-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-pitch-border/80 pb-4">
            <h3 className="text-xl font-bold text-white font-display">
              Generate 1-Click WhatsApp Escrow Contract Invite
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Drop a formatted escrow invitation into your WhatsApp gaming groups or send it directly to a buyer/seller. When they tap the link, the contract opens pre-filled and ready to lock funds via <strong>Safaricom Till 1572931</strong>!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Squad / Deal Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={genTitle}
                  onChange={(e) => setGenTitle(e.target.value)}
                  placeholder="e.g. 3120 OVR Epic Neymar + Rummenigge Account"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Agreed Price (KES) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="number"
                  value={genAmount}
                  onChange={(e) => setGenAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Seller Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={genSellerPhone}
                    onChange={(e) => setGenSellerPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-3.5 py-2 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Buyer Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={genBuyerPhone}
                    onChange={(e) => setGenBuyerPhone(e.target.value)}
                    placeholder="0798765432"
                    className="w-full px-3.5 py-2 rounded-xl bg-pitch-card border border-pitch-border text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(generatedWhatsAppGroupMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Share Directly to WhatsApp</span>
                </a>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedInviteUrl);
                    setCopiedInviteUrl(true);
                    setTimeout(() => setCopiedInviteUrl(false), 3000);
                  }}
                  className="w-full sm:w-auto text-xs"
                >
                  {copiedInviteUrl ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 mr-1" />}
                  {copiedInviteUrl ? "Copied Link!" : "Copy Link"}
                </Button>
              </div>
            </div>

            {/* Live Message Preview Card */}
            <div className="p-5 rounded-2xl bg-pitch-card border border-pitch-border space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  WhatsApp Preview (Formatted for Kenyan Gaming Groups)
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-pitch-border text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed select-all">
                  {generatedWhatsAppGroupMessage}
                </div>
              </div>

              <Button
                type="button"
                variant="gold"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedWhatsAppGroupMessage);
                  setCopiedInviteText(true);
                  setTimeout(() => setCopiedInviteText(false), 3000);
                }}
                className="w-full font-bold text-xs mt-2"
              >
                {copiedInviteText ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-slate-950" />
                    Copied WhatsApp Message!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copy Formatted Group Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Track Existing Deal */}
      {activeTab === "track" && (
        <div className="bg-pitch-surface border border-pitch-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <form onSubmit={handleTrackDeal} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter Deal Code (e.g. EFM-78241) or Phone Number..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="gold" size="md" isLoading={trackingLoading}>
              <Search className="w-4 h-4 mr-1.5" />
              Search Deal
            </Button>
          </form>

          {trackError && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs text-center">
              {trackError}
            </div>
          )}

          {trackedDeals && trackedDeals.length > 0 && (
            <div className="space-y-4 pt-2">
              {trackedDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-5 rounded-2xl bg-pitch-card border border-pitch-border space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold text-amber-400">{deal.deal_code}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{deal.deal_title}</h4>
                    </div>
                    <Badge variant={deal.status === "completed" ? "success" : "brand"} size="sm">
                      {deal.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Buyer</span>
                      <strong>{deal.buyer_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Seller</span>
                      <strong>{deal.seller_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Escrow Amount</span>
                      <strong className="text-emerald-400">KES {deal.item_amount_kes}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Till Number</span>
                      <strong>{deal.till_number}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AdSense / Escrow Sponsored Unit */}
      <AdBanner slot="middleman_deal_bottom" format="horizontal" />
    </div>
  );
}

export default function MiddlemanPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading escrow contract room...</p>
        </div>
      }
    >
      <MiddlemanContent />
    </Suspense>
  );
}
