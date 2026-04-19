// components/LiveClientUpdater.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const STATUS_MESSAGES: Record<string, { text: string; emoji: string }> = {
  confirme: { text: 'Un livreur a pris votre commande !', emoji: '🚴' },
  en_cours: { text: 'Votre colis est en route !', emoji: '📦' },
  livre: { text: 'Dañu ko jënd — C\'est livré !', emoji: '🎉' },
  annule: { text: 'Commande annulée', emoji: '❌' },
}

export default function LiveClientUpdater({ clientId }: { clientId?: string }) {
  const router = useRouter()
  const [toast, setToast] = useState<{ text: string; emoji: string } | null>(null)

  useEffect(() => {
    if (!clientId) return

    const supabase = createClient()

    const channel = supabase
      .channel('client-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status as string
          const msg = STATUS_MESSAGES[newStatus]
          if (msg) {
            setToast(msg)
            setTimeout(() => setToast(null), 4000)
          }
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, clientId])

  if (!toast) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top duration-300">
      <div className="bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-2xl shadow-slate-900/30 flex items-center gap-3 border border-slate-700/50">
        <span className="text-2xl flex-shrink-0">{toast.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">Mise à jour</p>
          <p className="text-sm font-bold text-white">{toast.text}</p>
        </div>
        <button
          onClick={() => setToast(null)}
          className="w-8 h-8 flex-shrink-0 bg-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
