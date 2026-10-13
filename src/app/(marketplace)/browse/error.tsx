"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RotateCcw, Search, Sparkles } from "lucide-react";

export default function BrowseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Browse route error caught:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto mb-6 shadow-inner">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
        Unable to Load Listings
      </h2>
      <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
        A temporary connection glitch prevented us from retrieving marketplace accounts. Your account data and active escrow orders remain completely secure.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <Button variant="primary" size="md" onClick={() => reset()}>
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Retry Search
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => {
            window.location.href = "/browse";
          }}
        >
          <Search className="w-4 h-4 mr-1.5" />
          Clear All Filters
        </Button>
      </div>

      {/* Wanted Board Fallback */}
      <div className="p-5 rounded-2xl bg-pitch-card/80 border border-pitch-border text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Looking for specific players?</span>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Post what squad or Epics you need on our Wanted Board and verified sellers will bring options directly to you.
          </p>
        </div>
        <Link href="/wanted" className="shrink-0 w-full sm:w-auto">
          <Button variant="gold" size="sm" className="w-full">
            Wanted Board
          </Button>
        </Link>
      </div>
    </div>
  );
}
