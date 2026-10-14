import { createClient } from "@supabase/supabase-js";

/**
 * Service Role Supabase client for administrative tasks, storage, and secure ledger functions.
 * NEVER expose this client to browser components.
 */
export function hasServiceRoleKey(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key.includes("placeholder")) return false;
  // A publishable key (sb_publishable_...) is an anon client key, NEVER a service role key
  if (key.startsWith("sb_publishable_")) return false;
  // Valid service role keys start with sb_secret_ or are JWTs containing "service_role"
  if (key.startsWith("sb_secret_")) return true;
  if (key.startsWith("ey")) {
    try {
      const payloadBase64 = key.split(".")[1];
      if (payloadBase64) {
        const decoded = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
        return decoded.role === "service_role";
      }
    } catch {
      return false;
    }
  }
  return false;
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
