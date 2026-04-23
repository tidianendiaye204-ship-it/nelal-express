'use client'

import { updatePickupPhoto } from '@/actions/orders'
import PhotoUploadButton from './PhotoUploadButton'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

interface PickupPhotoHandlerProps {
  orderId: string
}

export default function PickupPhotoHandler({ orderId }: PickupPhotoHandlerProps) {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
        <CheckCircle className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-tight">Photo de ramassage enregistrée</span>
      </div>
    )
  }

  return (
    <PhotoUploadButton 
      orderId={orderId} 
      onUploadComplete={async (url) => {
        await updatePickupPhoto(orderId, url)
        setDone(true)
      }} 
      label="Prendre photo du colis au départ" 
    />
  )
}
