"use client";

import { Button } from "@/components/ui/Button";
import { AlertCircle, Home, MessageCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors safely without exposing secrets
    console.error("Application error caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-rose-900/50 flex items-center justify-center text-rose-400 mb-6 shadow-md">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-800/60 text-xs font-semibold text-rose-300 mb-4">
        <span>System Notice</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display mb-3 tracking-tight">
        Something Went Wrong
      </h1>

      <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
        An unexpected error occurred while loading this page. You can try refreshing the page or returning home.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 w-full">
        <Button
          variant="primary"
          size="md"
          onClick={() => reset()}
          className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm min-h-[44px] flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>Try Again</span>
        </Button>

        <Link href="/">
          <Button
            variant="secondary"
            size="md"
            className="bg-[#111827] border border-[#1F2937] hover:border-slate-500 text-[#F8FAFC] text-xs px-4 py-2.5 rounded-xl min-h-[44px] flex items-center gap-2"
          >
            <Home className="w-4 h-4 text-[#94A3B8]" />
            <span>Community Home</span>
          </Button>
        </Link>
      </div>

      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] text-xs text-[#94A3B8] w-full flex items-center justify-center gap-2">
        <MessageCircle className="w-4 h-4 text-[#22C55E]" />
        <span>Need assistance? WhatsApp Support: </span>
        <a
          href="https://wa.me/254794400365"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#22C55E] hover:underline font-semibold"
        >
          0794400365
        </a>
      </div>
    </div>
  );
}
