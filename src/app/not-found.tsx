import { Button } from "@/components/ui/Button";
import { ArrowLeft, SearchX, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 mb-6 shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white font-display mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        The listing, order, or resource you requested does not exist or may have been securely transferred or archived.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/browse">
          <Button variant="primary" size="md">
            Browse Accounts
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="md">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
