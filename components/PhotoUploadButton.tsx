'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, Check } from 'lucide-react'

interface PhotoUploadButtonProps {
  onUploadComplete: (url: string) => void
  orderId: string
}

export default function PhotoUploadButton({ onUploadComplete, orderId }: PhotoUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const supabase = createClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${orderId}-${Math.random()}.${fileExt}`
      const filePath = `pickups/${fileName}`

      // Upload au bucket 'colis-photos'
      const { error: uploadError } = await supabase.storage
        .from('colis-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('colis-photos')
        .getPublicUrl(filePath)

      setUploaded(true)
      onUploadComplete(publicUrl)
    } catch (error: any) {
      alert('Erreur lors de l\'envoi de la photo : ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full">
      <label className={`
        flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all
        ${uploaded ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}
      `}>
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Téléchargement...</span>
          </div>
        ) : uploaded ? (
          <div className="flex flex-col items-center gap-2">
            <Check className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Photo enregistrée</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Camera className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-center px-10">Prendre une photo du colis au ramassage</span>
            <span className="text-[8px] opacity-50 font-medium">Requis pour preuve de départ</span>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleUpload}
          disabled={uploading || uploaded}
        />
      </label>
    </div>
  )
}
