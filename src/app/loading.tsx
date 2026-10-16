import { Trophy } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[50vh] w-full">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#111827] border border-[#1F2937] flex items-center justify-center text-[#FBBF24] shadow-md animate-pulse">
          <Trophy className="w-6 h-6 text-[#FBBF24]" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-[#22C55E]/30 animate-ping pointer-events-none" />
      </div>
      <p className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase">
        Loading...
      </p>
    </div>
  );
}
