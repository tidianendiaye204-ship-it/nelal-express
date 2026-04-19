// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const pathname = request.nextUrl.pathname

  // 1. EXCLUSIONS TOTALES (Zéro log, zéro check auth)
  // On place ici tout ce qui doit être public et ultra-rapide
  if (
    pathname === '/' || 
    pathname.startsWith('/api/whatsapp') || 
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/t/') // Liens de suivi public
  ) {
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

    // On ne fait getUser() QUE si on n'est PAS sur une route d'authentification 
    // ou si on a besoin de protéger le dashboard
    const isAuthPage = pathname.startsWith('/auth')
    const isDashboardPage = pathname.startsWith('/dashboard')

    if (!isAuthPage && !isDashboardPage) {
      return supabaseResponse
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Si erreur réseau critique (fetch failed), on loggue et on laisse passer 
    // pour éviter le crash "Application Error"
    if (userError) {
      console.error('Middleware Auth Check Error:', userError)
      return supabaseResponse 
    }

    // Protéger les routes dashboard
    if (isDashboardPage && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Rediriger vers dashboard si déjà connecté sur login/signup
    if (isAuthPage && user) {
      let role = 'client'
      try {
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle() // Utilise maybeSingle pour éviter le crash si profil absent
        
        if (profile?.role) role = profile.role
      } catch (e) {
        console.error('Middleware Profile Fetch error:', e)
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
