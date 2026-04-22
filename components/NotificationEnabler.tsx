'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, ShieldAlert } from 'lucide-react'
import { subscribeToPush, isPushSubscribed } from '@/lib/push-notifications'

export default function NotificationEnabler() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (!('Notification' in window)) {
      setPermission('unsupported')
      return
    }

    setPermission(Notification.permission)
    
    isPushSubscribed().then(setIsSubscribed)
  }, [])

  async function handleEnable() {
    setLoading(true)
    try {
      const sub = await subscribeToPush()
      if (sub) {
        setIsSubscribed(true)
        setPermission('granted')
      }
    } catch (error) {
      console.error('Failed to subscribe', error)
    } finally {
      setLoading(false)
    }
  }

  if (permission === 'unsupported') return null

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Notifications Actives</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-orange-500/5 border border-orange-500/10 p-4 rounded-2xl">
      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
        <Bell className="w-5 h-5 text-orange-500" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">Alertes en temps réel</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Activez les notifications pour recevoir les nouvelles commandes même si l&apos;application est fermée.</p>
      </div>
      <button
        onClick={handleEnable}
        disabled={loading}
        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
      >
        {loading ? 'Activation...' : 'Activer'}
      </button>
    </div>
  )
}
