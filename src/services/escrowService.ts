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
   * Seller submits account credentials. Sensitive payload is encrypted via AES-256-GCM.
   */
  async submitDelivery(payload: DeliverySubmissionPayload): Promise<void> {
    const { orderId, sellerId, konamiEmail, konamiPassword, backupCodes, transferInstructions, sellerIp } = payload;

    // Verify order and seller ownership
    const { data: order, error: orderError } = await this.supabase
      .from("orders")
      .select("id, seller_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found.");
    }

    if (order.seller_id !== sellerId) {
      throw new Error("Unauthorized. Only the assigned seller can deliver credentials.");
    }

    if (order.status !== "escrow_locked") {
      throw new Error(`Cannot deliver credentials when order is in '${order.status}' status. Escrow must be locked.`);
    }

    // Encrypt credentials
    const encryptedEmail = encryptCredential(konamiEmail);
    const encryptedPassword = encryptCredential(konamiPassword);
    const encryptedBackup = backupCodes ? encryptCredential(backupCodes) : null;

    // Save delivery
    const { error: deliveryError } = await this.supabase
      .from("account_deliveries")
      .upsert({
        order_id: orderId,
        encrypted_konami_email: encryptedEmail,
        encrypted_konami_password: encryptedPassword,
        encrypted_backup_codes: encryptedBackup,
        transfer_instructions: transferInstructions || null,
        seller_ip: sellerIp || null,
        delivered_at: new Date().toISOString(),
      });

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
  }

  /**
   * Strictly decrypts credentials for the verified buyer of this order.
   */
  async revealCredentials(orderId: string, buyerId: string): Promise<DecryptedCredentials> {
    const { data: order } = await this.supabase
      .from("orders")
      .select("buyer_id, status")
      .eq("id", orderId)
      .single();

    if (!order || order.buyer_id !== buyerId) {
      throw new Error("Unauthorized access to account credentials.");
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
    // Call the security definer stored procedure
    const { error } = await this.supabase.rpc("release_escrow_funds", {
      p_order_id: orderId,
      p_performed_by: buyerId,
    });

    if (error) {
      throw new Error(`Escrow release failed: ${error.message}`);
    }
  }

  /**
   * Opens an official dispute for an order.
   */
  async openDispute(orderId: string, openedBy: string, reason: string, description: string): Promise<void> {
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
      .update({ status: "disputed" })
      .eq("id", orderId);
  }
}
