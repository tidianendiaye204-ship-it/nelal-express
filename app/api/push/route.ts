// app/api/push/route.ts
// API pour sauvegarder / supprimer les abonnements push

import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST — Sauvegarder un push subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { subscription } = await request.json()

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 })
    }

    // Upsert : si l'endpoint existe déjà, on met à jour les clés
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        { onConflict: 'endpoint' }
      )

    if (error) {
      console.error('[Push API] Erreur upsert:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Push API] Erreur:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — Supprimer un push subscription (quand l'utilisateur se désinscrit)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint manquant' }, { status: 400 })
    }

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
