// lib/web-push.ts
// Envoi de Push Notifications côté serveur via la librairie web-push (gratuit)

import webpush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!

// Configuration VAPID
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@nelal-express.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
} else {
  console.warn('[Push] VAPID keys missing. Push notifications will be disabled.')
}

interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  actions?: Array<{ action: string; title: string }>
}

/**
 * Envoie une notification push à un utilisateur spécifique (tous ses appareils)
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  // Import dynamique pour éviter les problèmes de dépendances circulaires
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subscriptions || subscriptions.length === 0) return

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        )
      } catch (error: any) {
        // Si le subscription est expiré ou invalide (410 Gone / 404), on le supprime
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          console.log(`[Push] Subscription expiré supprimé: ${sub.id}`)
        } else {
          console.error(`[Push] Erreur envoi à ${sub.id}:`, error.message)
        }
      }
    })
  )

  return results
}

/**
 * Envoie une notification push à tous les utilisateurs d'un rôle (admin, livreur)
 */
export async function sendPushToRole(role: string, payload: PushPayload) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Récupérer tous les users de ce rôle
  const { data: users } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', role)

  if (!users || users.length === 0) return

  // Envoyer à chacun
  await Promise.allSettled(
    users.map((user) => sendPushToUser(user.id, payload))
  )
}

/**
 * Envoie une notification push aux livreurs d'une zone spécifique
 */
export async function sendPushToLivreursInZone(zoneId: string, payload: PushPayload) {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'livreur')
    .eq('zone_id', zoneId)

  if (!livreurs || livreurs.length === 0) return

  await Promise.allSettled(
    livreurs.map((l) => sendPushToUser(l.id, payload))
  )
}
