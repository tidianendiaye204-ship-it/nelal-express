import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for Client Components (browser-side).
 * Support both new (PUBLISHABLE) and legacy (ANON) key names.
 */
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables (URL or Key)");
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
};
