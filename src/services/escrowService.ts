import { decryptCredential, encryptCredential } from "@/lib/encryption/crypto";
import { AccountDelivery, EscrowAccount, EscrowState } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export interface DeliverySubmissionPayload {
  orderId: string;
  sellerId: string;
  konamiEmail: string;
  konamiPassword: string;
  backupCodes?: string;
  transferInstructions?: string;
  sellerIp?: string;
}

export interface DecryptedCredentials {
  konamiEmail: string;
  konamiPassword: string;
  backupCodes: string | null;
  transferInstructions: string | null;
  deliveredAt: string;
}

export class EscrowService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Helper to verify if a user has admin privileges via user_roles or profiles.
   */
  private async checkIsAdmin(userId: string): Promise<boolean> {
    try {
      const { data: userRoles } = await this.supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", userId)
        .in("role_id", ["admin", "super_admin"])
        .limit(1);

      if (userRoles && userRoles.length > 0) {
        return true;
      }
    } catch {
      // Ignore error if user_roles table is being queried
    }

    try {
      const { data: profile } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
        return true;
      }
    } catch {
      // Ignore if profiles doesn't have role column
    }

    return false;
  }

  /**
   * Seller submits account credentials. Sensitive payload is encrypted via AES-256-GCM.
   */
  async submitDelivery(payload: DeliverySubmissionPayload): Promise<void> {
    const { orderId, sellerId, konamiEmail, konamiPassword, backupCodes, transferInstructions, sellerIp } = payload;

    // Verify order exists
    const { data: order, error: orderError } = await this.supabase
      .from("orders")
      .select("id, seller_id, buyer_id, order_number, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found.");
    }

    // Verify ownership: seller or admin
    if (order.seller_id !== sellerId) {
      const isAdmin = await this.checkIsAdmin(sellerId);
      if (!isAdmin) {
        throw new Error("Unauthorized. Only the assigned seller can deliver credentials.");
      }
    }

    // Only allow delivery when escrow is locked or previously delivered (updating credentials)
    if (order.status !== "escrow_locked" && order.status !== "seller_delivered") {
      throw new Error(`Cannot deliver credentials when order is in '${order.status}' status. Escrow must be locked.`);
    }

    // Encrypt credentials
    const encryptedEmail = encryptCredential(konamiEmail);
    const encryptedPassword = encryptCredential(konamiPassword);
    const encryptedBackup = backupCodes ? encryptCredential(backupCodes) : null;

    // Save or update delivery in vault
    const { error: deliveryError } = await this.supabase
      .from("account_deliveries")
      .upsert(
        {
          order_id: orderId,
          encrypted_konami_email: encryptedEmail,
          encrypted_konami_password: encryptedPassword,
          encrypted_backup_codes: encryptedBackup,
          transfer_instructions: transferInstructions || null,
          seller_ip: sellerIp || null,
          delivered_at: new Date().toISOString(),
        },
        { onConflict: "order_id" }
      );

    if (deliveryError) {
      throw new Error(`Failed to save delivery credentials: ${deliveryError.message}`);
    }

    // 24-hour inspection window deadline
    const inspectionDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Update escrow state
    await this.supabase
      .from("escrow_accounts")
      .update({
        escrow_state: "seller_delivered",
        inspection_deadline: inspectionDeadline,
        delivered_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    // Update order status
    await this.supabase
      .from("orders")
      .update({
        status: "seller_delivered",
      })
      .eq("id", orderId);

    // Notify buyer that credentials are ready for inspection
    if (order.buyer_id) {
      try {
        await this.supabase.from("notifications").insert({
          recipient_id: order.buyer_id,
          type: "order_update",
          title: "Account Credentials Delivered!",
          message: `Seller has securely delivered the Konami ID credentials for order #${order.order_number}. Please inspect the account and confirm receipt within 24 hours.`,
          action_url: `/orders/${orderId}`,
          is_read: false,
        });
      } catch (notifErr) {
        console.warn("Failed to notify buyer:", notifErr);
      }
    }
  }

  /**
   * Strictly decrypts credentials for the buyer or seller of this order or admin.
   */
  async revealCredentials(orderId: string, requesterId: string): Promise<DecryptedCredentials> {
    const { data: order } = await this.supabase
      .from("orders")
      .select("id, buyer_id, seller_id, status")
      .eq("id", orderId)
      .single();

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.buyer_id !== requesterId && order.seller_id !== requesterId) {
      const isAdmin = await this.checkIsAdmin(requesterId);
      if (!isAdmin) {
        throw new Error("Unauthorized access to account credentials.");
      }
    }

    const { data: delivery, error } = await this.supabase
      .from("account_deliveries")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error || !delivery) {
      throw new Error("Credentials have not been delivered by the seller yet.");
    }

    return {
      konamiEmail: decryptCredential(delivery.encrypted_konami_email),
      konamiPassword: decryptCredential(delivery.encrypted_konami_password),
      backupCodes: delivery.encrypted_backup_codes ? decryptCredential(delivery.encrypted_backup_codes) : null,
      transferInstructions: delivery.transfer_instructions,
      deliveredAt: delivery.delivered_at,
    };
  }

  /**
   * Buyer confirms receipt and releases funds to seller.
   */
  async confirmAndRelease(orderId: string, buyerId: string): Promise<void> {
    const { data: order } = await this.supabase
      .from("orders")
      .select("id, buyer_id, seller_id, order_number, listing_id, status")
      .eq("id", orderId)
      .single();

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.buyer_id !== buyerId) {
      const isAdmin = await this.checkIsAdmin(buyerId);
      if (!isAdmin) {
        throw new Error("Unauthorized. Only the buyer can confirm release.");
      }
    }

    let rpcSucceeded = false;
    try {
      const { error: rpcError } = await this.supabase.rpc("release_escrow_funds", {
        p_order_id: orderId,
        p_performed_by: buyerId,
      });

      if (!rpcError) {
        rpcSucceeded = true;
      } else {
        console.warn("RPC release_escrow_funds failed, falling back to direct update:", rpcError.message);
      }
    } catch (e: any) {
      console.warn("RPC call threw error:", e?.message);
    }

    // Deduct escrow_balance from seller profile so it is not double counted
    if (rpcSucceeded) {
      const { data: escrow } = await this.supabase
        .from("escrow_accounts")
        .select("net_amount, seller_id")
        .eq("order_id", orderId)
        .single();

      if (escrow) {
        const { data: sellerProf } = await this.supabase
          .from("profiles")
          .select("escrow_balance")
          .eq("id", escrow.seller_id)
          .single();

        if (sellerProf && Number(sellerProf.escrow_balance) > 0) {
          const netAmount = Number(escrow.net_amount || 0);
          await this.supabase
            .from("profiles")
            .update({
              escrow_balance: Math.max(0, Number(sellerProf.escrow_balance) - netAmount),
              updated_at: new Date().toISOString(),
            })
            .eq("id", escrow.seller_id);
        }
      }
    } else {
      // Direct update fallback
      const { data: escrow } = await this.supabase
        .from("escrow_accounts")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (!escrow) {
        throw new Error("Escrow account not found for order.");
      }

      if (escrow.escrow_state !== "completed") {
        const netAmount = Number(escrow.net_amount || 0);

        const { data: sellerProf } = await this.supabase
          .from("profiles")
          .select("available_balance, escrow_balance, completed_sales_count")
          .eq("id", order.seller_id)
          .single();

        const currentAvail = Number(sellerProf?.available_balance || 0);
        const currentEscrow = Number(sellerProf?.escrow_balance || 0);
        const salesCount = Number(sellerProf?.completed_sales_count || 0);

        await this.supabase
          .from("profiles")
          .update({
            available_balance: currentAvail + netAmount,
            escrow_balance: Math.max(0, currentEscrow - netAmount),
            completed_sales_count: salesCount + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.seller_id);

        await this.supabase
          .from("escrow_accounts")
          .update({
            escrow_state: "completed",
            released_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", escrow.id);

        await this.supabase
          .from("orders")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (order.listing_id) {
          await this.supabase
            .from("listings")
            .update({
              status: "sold",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.listing_id);
        }
      }
    }

    // Set buyer_confirmed_at on account_deliveries
    await this.supabase
      .from("account_deliveries")
      .update({ buyer_confirmed_at: new Date().toISOString() })
      .eq("order_id", orderId);

    // Notify seller
    try {
      await this.supabase.from("notifications").insert({
        recipient_id: order.seller_id,
        type: "funds_released",
        title: "Order Completed & Funds Released!",
        message: `Buyer confirmed receipt for order #${order.order_number}. Payout has been transferred to your available balance.`,
        action_url: "/seller/earnings",
        is_read: false,
      });
    } catch (e) {
      console.warn("Failed to create seller notification:", e);
    }
  }

  /**
   * Opens an official dispute for an order.
   */
  async openDispute(orderId: string, openedBy: string, reason: string, description: string): Promise<void> {
    const { data: order } = await this.supabase
      .from("orders")
      .select("id, buyer_id, seller_id, order_number, status")
      .eq("id", orderId)
      .single();

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.buyer_id !== openedBy && order.seller_id !== openedBy) {
      const isAdmin = await this.checkIsAdmin(openedBy);
      if (!isAdmin) {
        throw new Error("Unauthorized to dispute this order.");
      }
    }

    const { error: disputeError } = await this.supabase
      .from("disputes")
      .insert({
        order_id: orderId,
        opened_by: openedBy,
        reason,
        description,
        status: "open",
      });

    if (disputeError) {
      throw new Error(`Failed to open dispute: ${disputeError.message}`);
    }

    await this.supabase
      .from("escrow_accounts")
      .update({ escrow_state: "disputed", disputed_at: new Date().toISOString() })
      .eq("order_id", orderId);

    await this.supabase
      .from("orders")
      .update({ status: "disputed", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    const otherPartyId = openedBy === order.buyer_id ? order.seller_id : order.buyer_id;
    if (otherPartyId) {
      try {
        await this.supabase.from("notifications").insert({
          recipient_id: otherPartyId,
          type: "order_update",
          title: "Escrow Dispute Opened",
          message: `A dispute was opened for order #${order.order_number}. Funds are held securely until reviewed by a moderator.`,
          action_url: `/orders/${orderId}`,
          is_read: false,
        });
      } catch (e) {
        console.warn("Failed to send dispute notification:", e);
      }
    }
  }
}
