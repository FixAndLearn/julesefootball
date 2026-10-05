"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle, RotateCcw } from "lucide-react";
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
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-6 shadow-inner">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white font-display mb-2">
        An Error Occurred
      </h1>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        Our system encountered an unexpected issue while communicating with backend services. All escrow funds and audit logs remain safe.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="primary" size="md" onClick={() => reset()}>
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Retry Action
        </Button>
        <Link href="/">
          <Button variant="outline" size="md">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
