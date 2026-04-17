export async function requestNotificationPermission() {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  
  if (Notification.permission === 'granted') return true
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendBrowserNotification(title: string, body: string, url?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  
  const notif = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'nelal-new-order',
    silent: false, // Default system sound
  })
  
  if (url) {
    notif.onclick = () => {
      window.open(url, '_blank')
    }
  }
}
