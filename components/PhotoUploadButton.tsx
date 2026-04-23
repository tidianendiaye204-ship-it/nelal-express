'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Camera, Loader2, Check } from 'lucide-react'
import { compressImage } from '@/lib/utils/image'

interface PhotoUploadButtonProps {
  onUploadComplete: (url: string) => void
  orderId: string
  label?: string
  bucket?: string
}

export default function PhotoUploadButton({ 
  onUploadComplete, 
  orderId, 
  label = 'Prendre une photo',
  bucket = 'colis-photos'
}: PhotoUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const supabase = createClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const originalFile = event.target.files?.[0]
      if (!originalFile) return

      setUploading(true)

      // 1. Compression côté client (évite les erreurs mémoire et réduit le temps d'upload)
      const compressedBlob = await compressImage(originalFile, 1200, 1200, 0.75)
      
      const fileName = `${orderId}-${Date.now()}.jpg`
      const filePath = `uploads/${fileName}`

      // 2. Upload au bucket
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg'
        })

      if (uploadError) throw uploadError

      // 3. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setUploaded(true)
      onUploadComplete(publicUrl)
    } catch (error: any) {
      console.error('Upload error:', error)
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-center px-10">{label}</span>
            <span className="text-[8px] opacity-50 font-medium italic">Haute qualité recommandée</span>
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
