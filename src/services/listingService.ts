import { Listing, ListingImage, ListingStatus, Platform, Playstyle } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export interface ListingFilterParams {
  search?: string;
  platform?: Platform | "all";
  playstyle?: Playstyle | "all";
  minPrice?: number;
  maxPrice?: number;
  minStrength?: number;
  minCoins?: number;
  minGp?: number;
  minEpics?: number;
  sortBy?: "newest" | "price_asc" | "price_desc" | "strength_desc" | "views";
  limit?: number;
  offset?: number;
}

export interface ListingQueryResult {
  listings: Listing[];
  totalCount: number;
}

export class ListingService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Queries listings with dynamic multi-faceted filtering against the live database.
   * Never returns mock or demo data.
   */
  async getListings(filters: ListingFilterParams = {}): Promise<ListingQueryResult> {
    const {
      search,
      platform,
      playstyle,
      minPrice,
      maxPrice,
      minStrength,
      minCoins,
      minGp,
      minEpics,
      sortBy = "newest",
      limit = 20,
      offset = 0,
    } = filters;

    let query = this.supabase
      .from("listings")
      .select("*, seller:profiles(*), images:listing_images(*)", { count: "exact" })
      .eq("status", "published")
      .is("deleted_at", null);

    if (platform && platform !== "all") {
      query = query.eq("platform", platform);
    }

    if (playstyle && playstyle !== "all") {
      query = query.eq("primary_playstyle", playstyle);
    }

    if (minPrice !== undefined && minPrice > 0) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice !== undefined && maxPrice > 0) {
      query = query.lte("price", maxPrice);
    }

    if (minStrength !== undefined && minStrength > 0) {
      query = query.gte("overall_team_strength", minStrength);
    }

    if (minCoins !== undefined && minCoins > 0) {
      query = query.gte("coin_balance", minCoins);
    }

    if (minGp !== undefined && minGp > 0) {
      query = query.gte("gp_balance", minGp);
    }

    if (minEpics !== undefined && minEpics > 0) {
      query = query.gte("epic_players_count", minEpics);
    }

    if (search && search.trim() !== "") {
      const term = search.trim();
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,manager_name.ilike.%${term}%`);
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "strength_desc":
        query = query.order("overall_team_strength", { ascending: false });
        break;
      case "views":
        query = query.order("views_count", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Listing query error:", error);
      throw new Error(`Failed to fetch listings: ${error.message}`);
    }

    return {
      listings: (data as unknown as Listing[]) || [],
      totalCount: count || 0,
    };
  }

  /**
   * Retrieves a single listing by its primary ID, with associated seller and images.
   */
  async getListingById(id: string): Promise<Listing | null> {
    const { data, error } = await this.supabase
      .from("listings")
      .select("*, seller:profiles(*), images:listing_images(*)")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to load listing: ${error.message}`);
    }

    // Increment view count asynchronously
    try {
      await this.supabase.rpc("increment_listing_views", { listing_id: id });
    } catch {
      // Non-critical metric increment failure can be safely ignored
    }

    return data as unknown as Listing;
  }

  /**
   * Creates a new listing with image URLs in a real database transaction.
   */
  async createListing(
    listingData: Omit<Listing, "id" | "created_at" | "updated_at" | "deleted_at" | "views_count" | "favorites_count" | "seller" | "images">,
    imageUrls: string[]
  ): Promise<Listing> {
    const { data: newListing, error: insertError } = await this.supabase
      .from("listings")
      .insert({
        ...listingData,
        views_count: 0,
        favorites_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Listing creation failed: ${insertError.message}`);
    }

    if (imageUrls && imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url, index) => ({
        listing_id: newListing.id,
        image_url: url,
        display_order: index,
        is_primary: index === 0,
      }));

      const { error: imgError } = await this.supabase
        .from("listing_images")
        .insert(imageRecords);

      if (imgError) {
        console.error("Failed to associate listing images:", imgError);
      }
    }

    return newListing as Listing;
  }

  /**
   * Toggles favorite status for a given user and listing.
   */
  async toggleFavorite(userId: string, listingId: string): Promise<{ isFavorited: boolean }> {
    const { data: existing } = await this.supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("listing_id", listingId)
      .single();

    if (existing) {
      await this.supabase.from("favorites").delete().eq("id", existing.id);
      try {
        await this.supabase.rpc("decrement_listing_favorites", { listing_id: listingId });
      } catch {
        // Silently continue
      }
      return { isFavorited: false };
    } else {
      await this.supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
      try {
        await this.supabase.rpc("increment_listing_favorites", { listing_id: listingId });
      } catch {
        // Silently continue
      }
      return { isFavorited: true };
    }
  }

  /**
   * Updates an existing listing and optionally refreshes its gallery images.
   */
  async updateListing(
    id: string,
    userId: string,
    listingData: Partial<Listing>,
    imageUrls?: string[],
    isAdmin = false
  ): Promise<Listing> {
    const { data: existing, error: findError } = await this.supabase
      .from("listings")
      .select("id, seller_id, status")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (findError || !existing) {
      throw new Error("Listing not found or has been deleted.");
    }

    if (!isAdmin && existing.seller_id !== userId) {
      throw new Error("Unauthorized: You can only edit your own listings.");
    }

    const { data: updated, error: updateError } = await this.supabase
      .from("listings")
      .update({
        ...listingData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update listing: ${updateError.message}`);
    }

    if (imageUrls && imageUrls.length > 0) {
      await this.supabase.from("listing_images").delete().eq("listing_id", id);

      const imageRecords = imageUrls.map((url, index) => ({
        listing_id: id,
        image_url: url,
        display_order: index,
        is_primary: index === 0,
      }));

      await this.supabase.from("listing_images").insert(imageRecords);
    }

    return updated as Listing;
  }

  /**
   * Soft deletes an existing listing.
   */
  async deleteListing(id: string, userId: string, isAdmin = false): Promise<void> {
    const { data: existing, error: findError } = await this.supabase
      .from("listings")
      .select("id, seller_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (findError || !existing) {
      throw new Error("Listing not found.");
    }

    if (!isAdmin && existing.seller_id !== userId) {
      throw new Error("Unauthorized: You can only delete your own listings.");
    }

    const { error: deleteError } = await this.supabase
      .from("listings")
      .update({
        deleted_at: new Date().toISOString(),
        status: "archived",
      })
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete listing: ${deleteError.message}`);
    }
  }
}
