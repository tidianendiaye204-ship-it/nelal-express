import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Support both new (PUBLISHABLE) and legacy (ANON) key names.
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables (URL or Key)");
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
};

/**
 * Helper to get the current user's profile from the database.
 * Used in Server Components and Layouts.
 */
export async function getProfile() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      if (userError) console.error('getProfile getUser error:', userError);
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, zone:zones(*)')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Return a minimal profile if the db record is missing but user is authed
      // to avoid infinite redirect loops
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Utilisateur',
        role: user.user_metadata?.role || 'client'
      };
    }

    return profile;
  } catch (err) {
    console.error('getProfile Critical Error:', err);
    return null;
  }
}
