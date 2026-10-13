import { Button } from "@/components/ui/Button";
import { SearchX, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto py-16">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 mb-6 shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white font-display mb-2">
        Page or Squad Not Found
      </h1>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        The listing, order, or squad you requested does not exist or may have already been sold and transferred under escrow.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <Link href="/browse">
          <Button variant="primary" size="md">
            Browse Live Accounts
          </Button>
        </Link>
        <Link href="/wanted">
          <Button variant="gold" size="md">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Wanted Squad Board
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="md">
            Return Home
          </Button>
        </Link>
      </div>

      <div className="p-4 rounded-xl bg-pitch-card/60 border border-pitch-border text-xs text-slate-400">
        Looking for a specific player (e.g. 2015 Messi, Rummenigge, Vieira)? Post a request on the Wanted Board to get contacted directly by sellers.
      </div>
    </div>
  );
}
