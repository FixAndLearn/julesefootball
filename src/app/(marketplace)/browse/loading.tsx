import { Skeleton } from "@/components/ui/Skeleton";

export default function BrowseLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filter Skeleton */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-pitch-surface border border-pitch-border space-y-5">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Listings Cards Grid Skeleton */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-pitch-border bg-pitch-card overflow-hidden p-3 space-y-3"
              >
                {/* Screenshot thumbnail skeleton */}
                <Skeleton className="w-full aspect-[16/9] rounded-xl" />

                {/* Title & badge */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-4/5" />
                </div>

                {/* Stats row */}
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>

                {/* Price and CTA */}
                <div className="border-t border-pitch-border/60 pt-3 flex justify-between items-center">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
