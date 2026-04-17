// components/LiveOrderUpdater.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Invisible component that listens for real-time order changes via Supabase Realtime.
 * When an order is inserted or updated, it triggers a page refresh to reflect changes.
 * 
 * Usage: Place in any page that needs live updates on orders.
 */
export default function LiveOrderUpdater({ 
  livreurId,
  showAll = false 
}: { 
  livreurId?: string
  showAll?: boolean 
}) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Build the channel filter
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          ...(livreurId && !showAll ? { filter: `livreur_id=eq.${livreurId}` } : {}),
        },
        () => {
          // Refresh server component data
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, livreurId, showAll])

  // This component renders nothing — it's purely a side-effect listener
  return null
}
