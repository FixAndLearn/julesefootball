import { Skeleton } from "@/components/ui/Skeleton";

export default function OrderLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full animate-in fade-in duration-300 space-y-6">
      {/* Header status skeleton */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Main Escrow Status Card Skeleton */}
      <div className="p-6 rounded-2xl bg-pitch-card border border-pitch-border space-y-5">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
