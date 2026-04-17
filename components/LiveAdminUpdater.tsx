// components/LiveAdminUpdater.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_MESSAGES: Record<string, { text: string; emoji: string }> = {
  en_attente: { text: '🚨 Nouvelle commande en attente !', emoji: '🔔' },
  confirme: { text: 'Un livreur a été assigné', emoji: '🚴' },
  en_cours: { text: 'Une commande est en route', emoji: '🛣️' },
  livre: { text: 'Une commande a été livrée', emoji: '✅' },
  annule: { text: 'Une commande a été annulée', emoji: '❌' },
}

export default function LiveAdminUpdater() {
  const router = useRouter()
  const [toast, setToast] = useState<{ text: string; emoji: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          // On INSERT, it's typically a new order waiting (en_attente)
          if (payload.eventType === 'INSERT') {
            const status = payload.new.status as string
            const msg = ADMIN_MESSAGES[status] || ADMIN_MESSAGES['en_attente']
            setToast(msg)
            setTimeout(() => setToast(null), 5000)
          } 
          // On UPDATE, it's a status change
          else if (payload.eventType === 'UPDATE') {
            const oldStatus = payload.old?.status
            const newStatus = payload.new?.status as string
            
            if (oldStatus !== newStatus) {
              const msg = ADMIN_MESSAGES[newStatus]
              if (msg) {
                setToast(msg)
                setTimeout(() => setToast(null), 4000)
              }
            }
          }
          
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  if (!toast) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top fade-in duration-300">
      <div className="bg-[#0F172A] text-white rounded-2xl px-6 py-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex items-center gap-4 border border-slate-700/50 min-w-[300px]">
        <div className="text-2xl flex-shrink-0 animate-bounce">{toast.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400 mb-0.5">Live Alert System</p>
          <p className="text-sm font-bold text-white whitespace-nowrap">{toast.text}</p>
        </div>
        <button
          onClick={() => setToast(null)}
          className="w-8 h-8 flex-shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
