import { SupabaseClient } from "@supabase/supabase-js";

export interface PlatformMetrics {
  totalListingsCount: number;
  activeListingsCount: number;
  completedOrdersCount: number;
  totalVolumeKes: number;
  verifiedSellersCount: number;
}

export interface SellerAnalytics {
  activeListings: number;
  soldListings: number;
  pendingDeliveryCount: number;
  availableBalance: number;
  escrowBalance: number;
  completedSales: number;
  averageRating: number;
}

export class AnalyticsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Retrieves live platform overview statistics calculated from the production database.
   * Returns exact zero values when the database is empty.
   */
  async getPlatformOverview(): Promise<PlatformMetrics> {
    const [listingsRes, activeListingsRes, completedOrdersRes, verifiedSellersRes, volumeRes] = await Promise.all([
      this.supabase.from("listings").select("id", { count: "exact", head: true }),
      this.supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "published"),
      this.supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "completed"),
      this.supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_verified_seller", true),
      this.supabase.from("orders").select("total_amount").eq("status", "completed"),
    ]);

    let totalVolume = 0;
    if (volumeRes.data && volumeRes.data.length > 0) {
      totalVolume = volumeRes.data.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    }

    return {
      totalListingsCount: listingsRes.count || 0,
      activeListingsCount: activeListingsRes.count || 0,
      completedOrdersCount: completedOrdersRes.count || 0,
      totalVolumeKes: totalVolume,
      verifiedSellersCount: verifiedSellersRes.count || 0,
    };
  }

  /**
   * Computes individual seller live performance metrics directly from database rows.
   */
  async getSellerAnalytics(sellerId: string): Promise<SellerAnalytics> {
    const [profileRes, activeListingsRes, soldListingsRes, pendingDeliveryRes] = await Promise.all([
      this.supabase.from("profiles").select("available_balance, escrow_balance, completed_sales_count, seller_rating").eq("id", sellerId).single(),
      this.supabase.from("listings").select("id", { count: "exact", head: true }).eq("seller_id", sellerId).eq("status", "published"),
      this.supabase.from("listings").select("id", { count: "exact", head: true }).eq("seller_id", sellerId).eq("status", "sold"),
      this.supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", sellerId).eq("status", "escrow_locked"),
    ]);

    const profile = profileRes.data;

    return {
      activeListings: activeListingsRes.count || 0,
      soldListings: soldListingsRes.count || 0,
      pendingDeliveryCount: pendingDeliveryRes.count || 0,
      availableBalance: profile?.available_balance || 0,
      escrowBalance: profile?.escrow_balance || 0,
      completedSales: profile?.completed_sales_count || 0,
      averageRating: profile?.seller_rating || 0,
    };
  }
}
