'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function LiveTracker({ orderId }: { orderId: string }) {
  const supabase = createClient()

  useEffect(() => {
    // 1. Écoute temps réel sur la table orders pour cet ID
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          // On peut forcer un rechargement de la page si besoin
          window.location.reload()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  return (
    <div className="flex items-center gap-1.5">
       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
       <span className="text-[9px] font-black text-slate-400 tracking-tighter uppercase">Direct</span>
    </div>
  )
}
