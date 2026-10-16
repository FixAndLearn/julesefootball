import { Button } from "@/components/ui/Button";
import { Compass, Home, Newspaper, Trophy } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1F2937] flex items-center justify-center text-[#FBBF24] mb-6 shadow-md">
        <Compass className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F2937] border border-[#374151] text-xs font-semibold text-[#FBBF24] mb-4">
        <span>Error 404</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] font-display mb-3 tracking-tight">
        Page Not Found
      </h1>

      <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
        The community page, tournament bracket, or news bulletin you requested does not exist or may have been moved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 w-full">
        <Link href="/tournaments">
          <Button
            variant="primary"
            size="md"
            className="bg-[#22C55E] hover:bg-[#16a34a] text-[#0B1220] font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm min-h-[44px] flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 stroke-[2.5]" />
            <span>Explore Tournaments</span>
          </Button>
        </Link>

        <Link href="/news">
          <Button
            variant="secondary"
            size="md"
            className="bg-[#111827] border border-[#1F2937] hover:border-slate-500 text-[#F8FAFC] text-xs px-4 py-2.5 rounded-xl min-h-[44px] flex items-center gap-2"
          >
            <Newspaper className="w-4 h-4 text-[#94A3B8]" />
            <span>Community News</span>
          </Button>
        </Link>

        <Link href="/">
          <Button
            variant="secondary"
            size="md"
            className="bg-[#1F2937] border border-[#374151] hover:border-slate-400 text-[#F8FAFC] text-xs px-4 py-2.5 rounded-xl min-h-[44px] flex items-center gap-2"
          >
            <Home className="w-4 h-4 text-[#94A3B8]" />
            <span>Home</span>
          </Button>
        </Link>
      </div>

      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] text-xs text-[#94A3B8] w-full">
        <span>Need community help or tournament assistance? Reach out on WhatsApp: </span>
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
