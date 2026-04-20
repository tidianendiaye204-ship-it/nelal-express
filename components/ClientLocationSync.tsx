'use client'

import { useLiveLocation } from '@/hooks/useLiveLocation'

export default function ClientLocationSync({ livreurId, hasActiveOrders }: { livreurId: string; hasActiveOrders: boolean }) {
  useLiveLocation(livreurId, hasActiveOrders)
  return null // Invisible component
}
