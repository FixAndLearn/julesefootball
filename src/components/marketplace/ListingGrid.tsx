import { EmptyState } from "@/components/ui/EmptyState";
import { Listing } from "@/types/database";
import { SearchX } from "lucide-react";
import { ListingCard } from "./ListingCard";

export interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
}

export function ListingGrid({ listings, isLoading = false }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-pitch-surface/60 border border-pitch-border rounded-2xl p-4 animate-pulse space-y-4"
          >
            <div className="aspect-[16/10] bg-slate-800 rounded-xl" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-10 bg-slate-800/60 rounded-xl" />
            <div className="h-6 bg-slate-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No listings found"
        description="No eFootball accounts matched your exact criteria or the marketplace has no published listings right now."
        actionLabel="Reset Search Filters"
        actionHref="/browse"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
