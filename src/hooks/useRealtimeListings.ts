"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Listing } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export interface UseRealtimeListingsOptions {
  initialListings?: Listing[];
  filters?: {
    search?: string;
    platform?: string;
    playstyle?: string;
    minStrength?: number;
    minCoins?: number;
    minEpics?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  };
  sortBy?: string;
  limit?: number;
  autoRefreshIntervalMs?: number;
}

export function useRealtimeListings(options: UseRealtimeListingsOptions = {}) {
  const {
    initialListings = [],
    filters,
    sortBy,
    limit = 24,
    autoRefreshIntervalMs = 7000,
  } = options;

  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [newListingAlert, setNewListingAlert] = useState<Listing | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initialListings when props change (e.g. server navigations)
  useEffect(() => {
    setListings(initialListings);
  }, [initialListings]);

  // Check if a listing satisfies the active filters
  const satisfiesFilters = useCallback(
    (listing: Listing) => {
      if (!filters) return true;
      if (filters.platform && filters.platform !== "all" && listing.platform !== filters.platform) {
        return false;
      }
      if (filters.playstyle && filters.playstyle !== "all" && listing.primary_playstyle !== filters.playstyle) {
        return false;
      }
      if (filters.minStrength && (listing.overall_team_strength || 0) < filters.minStrength) {
        return false;
      }
      if (filters.minCoins && (listing.coin_balance || 0) < filters.minCoins) {
        return false;
      }
      if (filters.minEpics && (listing.epic_players_count || 0) < filters.minEpics) {
        return false;
      }
      if (filters.minPrice && (listing.price || 0) < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && (listing.price || 0) > filters.maxPrice) {
        return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const titleMatch = listing.title?.toLowerCase().includes(q);
        const descMatch = listing.description?.toLowerCase().includes(q);
        const managerMatch = listing.manager_name?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !managerMatch) return false;
      }
      return true;
    },
    [filters]
  );

  // Build query string for API polling
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (filters?.search) params.set("search", filters.search);
    if (filters?.platform && filters.platform !== "all") params.set("platform", filters.platform);
    if (filters?.playstyle && filters.playstyle !== "all") params.set("playstyle", filters.playstyle);
    if (filters?.minStrength) params.set("minStrength", String(filters.minStrength));
    if (filters?.minCoins) params.set("minCoins", String(filters.minCoins));
    if (filters?.minEpics) params.set("minEpics", String(filters.minEpics));
    if (filters?.minPrice) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
    const activeSortBy = sortBy || filters?.sortBy;
    if (activeSortBy) params.set("sortBy", activeSortBy);
    return params.toString();
  }, [filters, limit, sortBy]);

  // Fetch fresh listings silently in the background
  const syncListings = useCallback(async () => {
    try {
      const qs = buildQueryString();
      const res = await fetch(`/api/listings?${qs}`, {
        cache: "no-store",
      });

      if (!res.ok) return;
      const data = await res.json();
      const fetched: Listing[] = data.listings || [];

      setListings((prev) => {
        // Check if there are newly added or removed listings
        const prevIds = prev.map((l) => l.id).join(",");
        const nextIds = fetched.map((l) => l.id).join(",");

        if (prevIds !== nextIds) {
          // Detect brand new listing
          const oldIdSet = new Set(prev.map((l) => l.id));
          const newlyAdded = fetched.find((l) => !oldIdSet.has(l.id));

          if (newlyAdded && prev.length > 0) {
            setNewListingAlert(newlyAdded);
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            alertTimeoutRef.current = setTimeout(() => {
              setNewListingAlert(null);
            }, 6000);
          }

          setLastUpdated(new Date());
          return fetched;
        }

        // Check if any prices or statuses changed
        const hasFieldChanges = fetched.some((item, idx) => {
          const old = prev[idx];
          return old && (old.price !== item.price || old.status !== item.status);
        });

        if (hasFieldChanges) {
          setLastUpdated(new Date());
          return fetched;
        }

        return prev;
      });
    } catch {
      // Non-blocking background sync
    }
  }, [buildQueryString]);

  // Primary: Supabase Realtime WebSocket Connection
  useEffect(() => {
    let supabase: ReturnType<typeof createClient> | null = null;
    let channel: any = null;

    try {
      supabase = createClient();
      channel = supabase
        .channel(`realtime:public:listings:${Math.random().toString(36).slice(2, 7)}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "listings",
          },
          async (payload) => {
            // Instant notification on any DB change
            setIsLiveConnected(true);

            if (payload.eventType === "INSERT") {
              // Immediately fetch the hydrated listing with images and seller profile
              try {
                if (supabase && payload.new?.id) {
                  const { data } = await supabase
                    .from("listings")
                    .select("*, seller:profiles(*), images:listing_images(*)")
                    .eq("id", payload.new.id)
                    .single();

                  if (data && data.status === "published" && !data.deleted_at) {
                    const typedListing = data as Listing;

                    // Always announce newly published listing in alert banner
                    setNewListingAlert(typedListing);
                    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
                    alertTimeoutRef.current = setTimeout(() => {
                      setNewListingAlert(null);
                    }, 6000);

                    // If matches current view filters, inject at top of list
                    if (satisfiesFilters(typedListing)) {
                      setListings((prev) => {
                        if (prev.some((l) => l.id === typedListing.id)) return prev;
                        return [typedListing, ...prev];
                      });
                    }
                  }
                }
              } catch {
                // Trigger fallback sync
                syncListings();
              }
            } else if (payload.eventType === "UPDATE") {
              const updated = payload.new;
              if (updated.status !== "published" || updated.deleted_at) {
                // If account was bought (sold) or delisted, remove from active grid
                setListings((prev) => prev.filter((l) => l.id !== updated.id));
              } else {
                // Refresh updated listing
                syncListings();
              }
            } else if (payload.eventType === "DELETE") {
              setListings((prev) => prev.filter((l) => l.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsLiveConnected(true);
          }
        });
    } catch {
      setIsLiveConnected(false);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel).catch(() => {});
      }
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [syncListings]);

  // Secondary: Resilient heartbeat auto-refresh (only when browser tab is visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncListings();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        syncListings();
      }
    }, autoRefreshIntervalMs);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncListings, autoRefreshIntervalMs]);

  const dismissAlert = () => {
    setNewListingAlert(null);
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
  };

  return {
    listings,
    newListingAlert,
    dismissAlert,
    isLiveConnected,
    lastUpdated,
    syncListings,
  };
}
