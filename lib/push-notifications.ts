// lib/push-notifications.ts
// Client-side : inscription aux Web Push Notifications via Service Worker

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

/**
 * Convertit une clé base64url en Uint8Array (requis par pushManager.subscribe)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Enregistre le Service Worker push et demande la permission de notifications.
 * Retourne le PushSubscription si réussi, null sinon.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined') return null
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Push notifications non supportées par ce navigateur')
    return null
  }

  try {
    // 1. Demander la permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('[Push] Permission refusée')
      return null
    }

    // 2. Enregistrer le service worker push dédié
    const registration = await navigator.serviceWorker.register('/push-sw.js', {
      scope: '/',
    })

    // Attendre que le SW soit actif
    await navigator.serviceWorker.ready

    // 3. Vérifier si déjà abonné
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // 4. Créer un nouvel abonnement
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      })
    }

    // 5. Envoyer le subscription au serveur
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    })

    console.log('[Push] ✅ Abonnement push enregistré')
    return subscription
  } catch (error) {
    console.error('[Push] Erreur inscription:', error)
    return null
  }
}

/**
 * Vérifie si l'utilisateur est déjà abonné aux push
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.getRegistration('/push-sw.js')
    if (!registration) return false
    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}

/**
 * Demande la permission de notification et s'abonne automatiquement.
 * Appelé au chargement du dashboard.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false

  if (Notification.permission === 'granted') {
    // Déjà autorisé → s'abonner silencieusement
    await subscribeToPush()
    return true
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      await subscribeToPush()
      return true
    }
  }

  return false
}

/**
 * Notification locale (fallback pour quand l'app est au premier plan)
 */
export function sendBrowserNotification(title: string, body: string, url?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const notif = new Notification(title, {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'nelal-notif-' + Date.now(),
    silent: false,
  })

  if (url) {
    notif.onclick = () => {
      window.open(url, '_blank')
    }
  }
}
