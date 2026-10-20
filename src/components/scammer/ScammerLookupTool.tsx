"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ScammerRecord {
  id: string;
  phone: string;
  handle?: string;
  alias: string;
  status: "blacklisted" | "suspect";
  fraudType: string;
  reportedDate: string;
  notes: string;
}

// Known community blacklist records (verified fraudulent handles)
const BLACKLIST_DATABASE: ScammerRecord[] = [];

export function ScammerLookupTool() {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{
    searched: boolean;
    found: boolean;
    record?: ScammerRecord;
    queryCleaned?: string;
  }>({ searched: false, found: false });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim().toLowerCase().replace(/\s+/g, "");
    if (!cleanQuery) return;

    // Normalize phone number (e.g. +254... to 07...)
    let normalized = cleanQuery;
    if (normalized.startsWith("+254")) {
      normalized = "0" + normalized.slice(4);
    } else if (normalized.startsWith("254")) {
      normalized = "0" + normalized.slice(3);
    }

    const matched = BLACKLIST_DATABASE.find((item) => {
      const matchPhone = item.phone.includes(normalized) || normalized.includes(item.phone);
      const matchHandle = item.handle && item.handle.toLowerCase().includes(cleanQuery);
      return matchPhone || matchHandle;
    });

    if (matched) {
      setSearchResult({
        searched: true,
        found: true,
        record: matched,
        queryCleaned: query.trim(),
      });
    } else {
      setSearchResult({
        searched: true,
        found: false,
        queryCleaned: query.trim(),
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Bar Input */}
      <form onSubmit={handleLookup} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Kenyan phone (07... / 01... / +254...) or WhatsApp/Telegram handle..."
            className="w-full pl-12 pr-32 py-3.5 sm:py-4 rounded-2xl bg-[#0B1220] border-2 border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 text-sm shadow-inner min-h-[52px]"
          />
          <div className="absolute inset-y-1.5 right-1.5 flex items-center">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-1.5 min-h-[44px]"
            >
              <Search className="w-4 h-4" />
              <span>Verify</span>
            </button>
          </div>
        </div>
      </form>

      {/* Search Result Display */}
      {searchResult.searched && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {searchResult.found && searchResult.record ? (
            /* 🚨 Blacklist Match (Scammer Detected) */
            <div className="p-6 rounded-2xl bg-rose-950/60 border-2 border-rose-500/80 shadow-2xl text-white space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    🚨
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                      CONFIRMED SCAMMER BLACKLISTED
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white mt-1">
                      {searchResult.record.alias} ({searchResult.record.phone})
                    </h4>
                  </div>
                </div>
                <span className="text-xs text-rose-300 font-mono hidden sm:inline">
                  Reported: {searchResult.record.reportedDate}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3.5 rounded-xl border border-rose-900/60">
                <div>
                  <span className="text-rose-300 font-bold block mb-0.5">Fraud MO / Tactic:</span>
                  <span className="text-slate-200">{searchResult.record.fraudType}</span>
                </div>
                <div>
                  <span className="text-rose-300 font-bold block mb-0.5">Known Handle / Tag:</span>
                  <span className="text-slate-200">{searchResult.record.handle || "None documented"}</span>
                </div>
              </div>

              <p className="text-xs text-rose-200 leading-relaxed">
                <strong>Warning:</strong> {searchResult.record.notes} DO NOT send money to this number or share your Konami ID credentials.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={`https://wa.me/254794400365?text=Hello%20Brian%2C%20I%20spotted%20blacklisted%20number%20${searchResult.record.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>Report Further Evidence to Admin</span>
                </a>
                <Link
                  href="/middleman"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700"
                >
                  Use Official Middleman Escrow Instead
                </Link>
              </div>
            </div>
          ) : (
            /* ✅ Clean Search (No Records Found) */
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 shadow-xl text-white space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[#22C55E] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-[10px] font-bold text-emerald-300">
                    NO BLACKLIST ENTRIES FOUND
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                    "{searchResult.queryCleaned}" is not on our published blacklist
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                While this number has not been previously reported for fraud, <strong>scammers frequently change SIM cards and WhatsApp profiles</strong>. Never pay directly through personal M-Pesa. Always lock your trade in our Safaricom Lipa Na M-Pesa Till 1572931 Escrow with a 24-hour buyer inspection window.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/middleman"
                  className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Lock Trade in Middleman Escrow</span>
                </Link>
                <a
                  href={`https://wa.me/254794400365?text=Hello%20Brian%2C%20I%20would%20like%20to%20verify%20a%20trader%20with%20phone%20${encodeURIComponent(
                    searchResult.queryCleaned || ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Request Manual Admin Background Check &rarr;</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
