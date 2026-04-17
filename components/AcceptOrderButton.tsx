// components/AcceptOrderButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { acceptOrder } from '@/actions/livreur'
import { Bike, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function AcceptOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  const handleAccept = () => {
    startTransition(async () => {
      const res = await acceptOrder(orderId)
      setResult(res)
    })
  }

  if (result?.success) {
    return (
      <div className="w-full bg-green-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse">
        <CheckCircle className="w-4 h-4" /> Mission acceptée !
      </div>
    )
  }

  if (result?.error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold text-center mb-2 flex items-center justify-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" /> {result.error}
        </div>
        <button
          onClick={handleAccept}
          disabled={isPending}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Bike className="w-4 h-4" /> Réessayer
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleAccept}
      disabled={isPending}
      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-orange-500/40"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> Acceptation...
        </>
      ) : (
        <>
          <Bike className="w-4 h-4" /> Accepter cette mission
        </>
      )}
    </button>
  )
}
