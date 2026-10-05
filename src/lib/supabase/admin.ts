import { createClient } from "@supabase/supabase-js";

/**
 * Service Role Supabase client for administrative tasks, webhooks, and secure ledger functions.
 * NEVER expose this client to browser components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
