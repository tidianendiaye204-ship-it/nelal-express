// public/push-sw.js
// Service Worker dédié aux Push Notifications
// Ce fichier tourne en arrière-plan même quand l'app est fermée

self.addEventListener('push', function (event) {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (e) {
    data = {
      title: 'Nelal Express',
      body: event.data.text(),
      url: '/dashboard',
    }
  }

  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: data.tag || 'nelal-notif-' + Date.now(),
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/dashboard',
    },
    actions: data.actions || [],
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Nelal Express', options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Si un onglet Nelal est déjà ouvert, on le focus
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      // Sinon on ouvre un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
