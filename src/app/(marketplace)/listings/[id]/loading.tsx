import { Skeleton } from "@/components/ui/Skeleton";

export default function ListingDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Top back navigation skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Gallery & Squad Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Gallery Screenshot Skeleton */}
          <div className="rounded-2xl border border-pitch-border bg-pitch-card overflow-hidden p-2">
            <Skeleton className="w-full aspect-[16/9] rounded-xl" />
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-20 h-14 rounded-lg shrink-0" />
              ))}
            </div>
          </div>

          {/* Quick Stats Grid Skeleton */}
          <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-xl bg-pitch-card border border-pitch-border space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Squad Details & Highlights Skeleton */}
          <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Escrow Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border space-y-5">
            {/* Price block */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-44" />
            </div>

            {/* Escrow badge */}
            <Skeleton className="h-14 w-full rounded-xl" />

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>

            {/* Seller profile card */}
            <div className="border-t border-pitch-border/60 pt-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
