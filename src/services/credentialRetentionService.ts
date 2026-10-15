import { SupabaseClient } from "@supabase/supabase-js";

/**
 * CredentialRetentionService
 *
 * ARCHITECTURAL CONTEXT & DATA PROTECTION DISCLOSURE:
 * 1. Statutory Alignment:
 *    Under Section 39 and Section 30(1)(e) of the Kenya Data Protection Act, 2019,
 *    and Regulations 19 & 20 of the Data Protection (General) Regulations, 2021,
 *    personal data must not be kept longer than necessary for the purpose collected,
 *    and must follow a documented retention schedule.
 *
 * 2. Database Nullification vs. Secure Erasure:
 *    Setting ciphertext columns to NULL in `account_deliveries` removes active application access.
 *    However, this does NOT constitute physical disk erasure or cryptographic shredding.
 *    - Under PostgreSQL MVCC, dead row versions remain on heap pages until `VACUUM` runs.
 *    - Space reclaimed by `VACUUM` is marked for reuse; bytes are not zero-filled.
 *    - PostgreSQL Write-Ahead Logs (WAL) and cloud provider backups retain records until
 *      backup retention windows naturally expire.
 *
 * 3. Default Safe State:
 *    Automated deletion is SAFELY DISABLED by default. It requires explicit configuration
 *    via CREDENTIAL_RETENTION_ENABLED="true" and CREDENTIAL_RETENTION_DAYS=<days> once
 *    business leadership and Kenyan legal counsel have approved a formal retention schedule.
 */

export interface RetentionPurgeResult {
  enabled: boolean;
  retentionDays?: number;
  ordersEvaluated: number;
  ordersPurged: number;
  message: string;
}

export class CredentialRetentionService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Evaluates orders eligible for credential nullification based on counsel-approved retention policy.
   * Safely disabled unless explicitly configured in environment.
   */
  async executeRetentionPurge(): Promise<RetentionPurgeResult> {
    const isEnabled = process.env.CREDENTIAL_RETENTION_ENABLED === "true";
    const retentionDaysStr = process.env.CREDENTIAL_RETENTION_DAYS;
    const retentionDays = retentionDaysStr ? parseInt(retentionDaysStr, 10) : 0;

    // Safety guard: Must be explicitly enabled with a valid positive duration
    if (!isEnabled || !retentionDays || retentionDays <= 0) {
      return {
        enabled: false,
        ordersEvaluated: 0,
        ordersPurged: 0,
        message:
          "Credential retention automated purge is safely disabled pending business owner and Kenyan legal counsel approval of the formal retention schedule.",
      };
    }

    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

    // Query eligible completed or refunded orders where credentials have not been purged yet
    const { data: eligibleDeliveries, error: fetchError } = await this.supabase
      .from("account_deliveries")
      .select("id, order_id, order:orders(id, status, updated_at)")
      .is("purged_at", null)
      .limit(100);

    if (fetchError) {
      console.error("Failed to query deliveries for retention purge:", fetchError.message);
      throw new Error("Failed to evaluate deliveries for retention purge.");
    }

    if (!eligibleDeliveries || eligibleDeliveries.length === 0) {
      return {
        enabled: true,
        retentionDays,
        ordersEvaluated: 0,
        ordersPurged: 0,
        message: "No unpurged credential deliveries found for evaluation.",
      };
    }

    let purgedCount = 0;

    for (const delivery of eligibleDeliveries) {
      const order = delivery.order as any;
      if (!order) continue;

      // Only purge credentials for terminal orders whose final status was updated before the cutoff
      const isTerminal = order.status === "completed" || order.status === "refunded" || order.status === "cancelled";
      const isPastCutoff = order.updated_at && new Date(order.updated_at) < new Date(cutoffDate);

      if (isTerminal && isPastCutoff) {
        const { error: updateError } = await this.supabase
          .from("account_deliveries")
          .update({
            encrypted_konami_email: null,
            encrypted_konami_password: null,
            encrypted_backup_codes: null,
            transfer_instructions: null,
            purged_at: new Date().toISOString(),
          })
          .eq("id", delivery.id);

        if (!updateError) {
          purgedCount++;
        } else {
          console.error(`Failed to nullify delivery ${delivery.id}:`, updateError.message);
        }
      }
    }

    // Log the retention execution event to audit_logs without logging credentials
    if (purgedCount > 0) {
      try {
        await this.supabase.from("audit_logs").insert({
          action: "CREDENTIAL_RETENTION_PURGE",
          resource_type: "account_deliveries",
          changes: {
            retention_days: retentionDays,
            orders_purged: purgedCount,
            executed_at: new Date().toISOString(),
          },
        });
      } catch (logErr) {
        console.error("Failed to record retention purge audit log:", (logErr as Error)?.message || "Unknown error");
      }
    }

    return {
      enabled: true,
      retentionDays,
      ordersEvaluated: eligibleDeliveries.length,
      ordersPurged: purgedCount,
      message: `Evaluated ${eligibleDeliveries.length} orders; successfully purged credentials for ${purgedCount} orders past the ${retentionDays}-day retention threshold.`,
    };
  }
}
