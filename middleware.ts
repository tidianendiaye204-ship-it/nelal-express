// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. EXCLUSIONS TOTALES (Zéro log, zéro check auth)
  if (
    pathname === '/' || 
    pathname.startsWith('/api/whatsapp') || 
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/t/')
  ) {
    return 
  }

  // Utilise le helper standard pour rafraîchir la session et obtenir la réponse
  const supabaseResponse = await updateSession(request)

  // 2. PROTECTION DES ROUTES & REDIRECTIONS
  // On recréé un client temporaire pour checker l'auth (car updateSession ne retourne pas le client)
  // Note: C'est safe car updateSession a déjà rafraîchi les cookies dans supabaseResponse
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        }
    }
  })

  const isAuthPage = pathname.startsWith('/auth')
  const isDashboardPage = pathname.startsWith('/dashboard')

  if (isAuthPage || isDashboardPage) {
    const { data: { user } } = await supabase.auth.getUser()

    // Protéger les routes dashboard
    if (isDashboardPage && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Rediriger vers dashboard si déjà connecté
    if (isAuthPage && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      
      const role = profile?.role || 'client'
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
