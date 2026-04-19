import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with SERVICE_ROLE key.
 * Used for bypass RLS and admin operations (Webhook, Cron jobs, Backend tasks).
 * WARNING: NEVER use this on the client-side (Client Components).
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin environment variables (URL or SERVICE_ROLE_KEY)");
  }

  return createSupabaseClient(
    supabaseUrl,
    supabaseServiceKey
  );
};
