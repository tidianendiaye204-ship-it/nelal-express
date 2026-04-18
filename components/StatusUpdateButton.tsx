// components/StatusUpdateButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus, updatePickupPhoto } from '@/actions/orders'
import { Loader2, CheckCircle, Package, AlertCircle } from 'lucide-react'
import PhotoUploadButton from './PhotoUploadButton'
import type { OrderStatus } from '@/lib/types'

interface StatusUpdateButtonProps {
  orderId: string
  nextStatus: OrderStatus
  note: string
  label: string
  variant: 'pickup' | 'deliver'
}

export default function StatusUpdateButton({ orderId, nextStatus, note, label, variant }: StatusUpdateButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  const handleUpdate = () => {
    startTransition(async () => {
      let res
      if (variant === 'pickup' && photoUrl) {
        res = await updatePickupPhoto(orderId, photoUrl)
      } else {
        res = await updateOrderStatus(orderId, nextStatus, note)
      }
      setResult(res)
    })
  }

  if (result?.success) {
    return (
      <div className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${
        variant === 'deliver' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
      }`}>
        <CheckCircle className="w-4 h-4" /> 
        {variant === 'deliver' ? 'Livraison confirmée !' : 'Colis récupéré !'}
      </div>
    )
  }

  if (result?.error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 text-red-600 py-2 rounded-xl text-xs font-bold text-center mb-2 flex items-center justify-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" /> {result.error}
        </div>
        <button onClick={handleUpdate} disabled={isPending}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all">
          Réessayer
        </button>
      </div>
    )
  }

  const styles = {
    pickup: 'bg-slate-900 text-white shadow-lg shadow-slate-900/20',
    deliver: 'bg-green-500 text-white shadow-lg shadow-green-500/20',
  }

  const icons = {
    pickup: <Package className="w-4 h-4" />,
    deliver: <CheckCircle className="w-4 h-4" />,
  }

  return (
    <div className="space-y-4">
      {variant === 'pickup' && !result?.success && (
        <PhotoUploadButton orderId={orderId} onUploadComplete={setPhotoUrl} />
      )}
      <button
        onClick={handleUpdate}
        disabled={isPending || (variant === 'pickup' && !photoUrl)}
        className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${styles[variant]}`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Mise à jour...
          </>
        ) : (
          <>
            {icons[variant]} {variant === 'pickup' && !photoUrl ? 'Uploader une photo d\'abord' : label}
          </>
        )}
      </button>
    </div>
  )
}
