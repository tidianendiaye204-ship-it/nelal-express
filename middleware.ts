// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si les clés sont manquantes, on laisse passer pour éviter de bloquer l'app (Vercel Build ou config manquante)
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Récupérer l'utilisateur de manière fiable sans timeout strict
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Middleware getUser error:', userError)
    }

    const pathname = request.nextUrl.pathname

    // Routes publiques directes (on ne fait rien de spécial)
    if (pathname === '/') {
      return supabaseResponse
    }

    // Protéger les routes dashboard
    if (pathname.startsWith('/dashboard') && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Rediriger vers dashboard si déjà connecté
    if ((pathname === '/auth/login' || pathname === '/auth/signup') && user) {
      let role = 'client'
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role) {
          role = profile.role
        } else if (profileError) {
          console.error('Middleware profile fetch error:', profileError)
          // Si on a l'utilisateur mais pas de profil, on utilise les métadonnées
          role = user.user_metadata?.role || 'client'
        }
      } catch (profileErr) {
        console.error('Middleware profile critical error:', profileErr)
      }

      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    }
  } catch (e) {
    console.error('Middleware Error:', e)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
