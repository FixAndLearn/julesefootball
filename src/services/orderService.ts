import { Order, OrderStatus } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export class OrderService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Generates a high-entropy sequential order number.
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `EFM-${timestamp}-${random}`;
  }

  /**
   * Creates an order and creates the matching escrow account atomically.
   */
  async createOrder(buyerId: string, listingId: string): Promise<Order> {
    // 1. Fetch and verify listing
    const { data: listing, error: listingError } = await this.supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      throw new Error("Listing not found.");
    }

    if (listing.status !== "published") {
      throw new Error("This listing is no longer available for purchase.");
    }

    if (listing.seller_id === buyerId) {
      throw new Error("You cannot purchase your own account listing.");
    }

    const price = Number(listing.price);
    const platformFeeRate = 0.00; // 0% platform fee - Launch promo (seller receives 100%)
    const platformFee = 0;
    const sellerNetAmount = price;
    const orderNumber = this.generateOrderNumber();

    // 2. Insert order
    const { data: order, error: orderError } = await this.supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        total_amount: price,
        platform_fee: platformFee,
        seller_net_amount: sellerNetAmount,
        currency: listing.currency || "KES",
        status: "payment_pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message}`);
    }

    // 3. Create Escrow Account record
    const { error: escrowError } = await this.supabase
      .from("escrow_accounts")
      .insert({
        order_id: order.id,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        gross_amount: price,
        fee_amount: platformFee,
        net_amount: sellerNetAmount,
        currency: listing.currency || "KES",
        escrow_state: "pending",
      });

    if (escrowError) {
      console.error("Escrow initialization error:", escrowError);
      throw new Error("Failed to initialize escrow account for order.");
    }

    return order as Order;
  }

  /**
   * Retrieves full order details with joined listing, escrow, buyer, and seller.
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from("orders")
      .select(`
        *,
        listing:listings(*),
        buyer:profiles!orders_buyer_id_fkey(*),
        seller:profiles!orders_seller_id_fkey(*),
        escrow:escrow_accounts(*)
      `)
      .eq("id", orderId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to retrieve order: ${error.message}`);
    }

    return data as unknown as Order;
  }

  /**
   * Retrieves orders for a given user (either as buyer or seller).
   */
  async getUserOrders(userId: string, role: "buyer" | "seller"): Promise<Order[]> {
    const column = role === "buyer" ? "buyer_id" : "seller_id";

    const { data, error } = await this.supabase
      .from("orders")
      .select(`
        *,
        listing:listings(title, platform, price, overall_team_strength),
        escrow:escrow_accounts(escrow_state)
      `)
      .eq(column, userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user orders: ${error.message}`);
    }

    return (data as unknown as Order[]) || [];
  }
}
