'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter } from 'next/navigation'
import { sendBrowserNotification, requestNotificationPermission } from '@/lib/push-notifications'

const RealtimeContext = createContext<number>(0)

export function RealtimeProvider({ children, role, userId }: { children: React.ReactNode, role: string, userId: string }) {
  const [newOrders, setNewOrders] = useState(0)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    // Reset counter if admin visits orders (here admin main page)
    if (role === 'admin' && pathname === '/dashboard/admin') {
      setNewOrders(0)
    }
    // Ou si le livreur accède aux disponibles
    if (role === 'livreur' && pathname === '/dashboard/livreur/disponibles') {
      setNewOrders(0)
    }
  }, [pathname, role])

  useEffect(() => {
    if (!role || role === 'client') return

    const supabase = createClient()
    const channel = supabase
      .channel('new-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          if (role === 'admin') {
            setNewOrders(prev => prev + 1)
            try { new Audio('/notification.mp3').play() } catch (e) { console.error('Audio log', e) }
            sendBrowserNotification('🚨 Nouvelle commande', 'Une nouvelle commande a été ajoutée sur Nelal Express.')
            router.refresh()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const newStatus = payload.new?.status
          const oldStatus = payload.old?.status
          
          if (role === 'admin' && oldStatus !== newStatus) {
            router.refresh()
          }

          // Assignation d'un livreur spécifique
          if (role === 'livreur' && payload.new?.livreur_id === userId && newStatus === 'confirme' && oldStatus !== 'confirme') {
            try { new Audio('/notification.mp3').play() } catch (e) { console.error('Audio log', e) }
            sendBrowserNotification('🚀 Nouvelle course !', 'Une course vient de vous être assignée.')
            router.refresh()
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [role, userId, router])

  return (
    <RealtimeContext.Provider value={newOrders}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeBadge() {
  return useContext(RealtimeContext)
}

export function RealtimeBadge() {
  const count = useRealtimeBadge()
  if (count === 0) return null
  return (
    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-auto leading-none shadow-sm animate-in zoom-in duration-200">
      {count}
    </span>
  )
}

export function RealtimeBadgeAbsolute() {
  const count = useRealtimeBadge()
  if (count === 0) return null
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200 shadow-sm border border-white">
      <span className="text-[8px] font-black text-white leading-none px-1">{count}</span>
    </span>
  )
}
