// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Error silencing to prevent server-side cookie setting crashes
          }
        },
      },
    }
  )
}

export async function getProfile() {
  const supabase = await createClient()
  
  try {
    const userPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 3000)
    )

    const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any
    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, zone:zones(*)')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // Return a minimal profile if the db record is missing but user is authed
      // to avoid infinite redirect loops
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Utilisateur',
        role: user.user_metadata?.role || 'client'
      }
    }

    return profile
  } catch (err) {
    console.error('getProfile Critical Error:', err)
    return null
  }
}
