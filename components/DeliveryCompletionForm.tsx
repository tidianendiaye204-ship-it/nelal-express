'use client'

import { useState, useTransition } from 'react'
import { confirmDeliveryWithCode } from '@/actions/orders'
import { Camera, CheckCircle, AlertCircle, Loader2, Coins, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

interface DeliveryCompletionFormProps {
  order: any
}

export default function DeliveryCompletionForm({ order }: DeliveryCompletionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const [showArdoise, setShowArdoise] = useState(false)
  const [ardoiseVal, setArdoiseVal] = useState('')
  const [deliveryCode, setDeliveryCode] = useState('')
  
  // -- Photo State --
  const [isUploading, setIsUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const supabase = createClient()

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${order.id}-${Math.random()}.${fileExt}`
      const filePath = `deliveries/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('delivery-proofs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('delivery-proofs')
        .getPublicUrl(filePath)

      setPhotoUrl(publicUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      setUploadError('Erreur lors de l’envoi de la photo. Réessayez.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = () => {
    startTransition(async () => {
      const ardoise = showArdoise ? parseInt(ardoiseVal) || 0 : 0
      const res = await confirmDeliveryWithCode(order.id, deliveryCode, ardoise, order.price, photoUrl || undefined)
      setResult(res)
    })
  }

  if (result?.success) {
    return (
      <div className="w-full bg-green-500 text-white shadow-xl shadow-green-500/20 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 animate-in zoom-in duration-300">
        <CheckCircle className="w-5 h-5" /> Livraison validée !
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 mt-4 border-t border-slate-100 pt-4">
      
      {/* 1. PREUVE PHOTO (Obligatoire pour la confiance) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" /> Preuve de livraison (Photo)
        </label>
        
        {photoUrl ? (
          <div className="relative group overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
            <Image 
              src={photoUrl} 
              alt="Preuve" 
              width={400}
              height={300}
              className="w-full h-32 object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setPhotoUrl(null)}
                className="bg-white text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold"
              >
                Changer la photo
              </button>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-colors ${
              isUploading ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:border-orange-400'
            }`}>
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              ) : (
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
              )}
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                {isUploading ? 'Envoi en cours...' : 'Prendre une photo du colis'}
              </p>
            </div>
          </div>
        )}
        
        {uploadError && <p className="text-[9px] text-red-500 mt-2 font-bold">{uploadError}</p>}
      </div>

      {/* 2. SÉCURITÉ : CODE DE LIVRAISON */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Code de confirmation (4 chiffres)
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={deliveryCode}
          onChange={(e) => setDeliveryCode(e.target.value)}
          placeholder="Demandez le code au destinataire"
          className="w-full bg-white border border-orange-200 text-slate-900 rounded-xl px-4 py-3 text-lg font-black tracking-[0.5em] text-center focus:ring-2 focus:ring-orange-500 transition-all outline-none"
        />
      </div>

      {result?.error && (
        <div className="bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {result.error}
        </div>
      )}

      {/* 3. ARDOISE TOGGLE */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <Coins className={`w-4 h-4 ${showArdoise ? 'text-orange-500' : 'text-slate-400'}`} />
            <div>
              <p className="text-xs font-bold text-slate-800">Manque de monnaie ?</p>
              <p className="text-[9px] text-slate-500">Signaler une ardoise au vendeur</p>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${showArdoise ? 'bg-orange-500' : 'bg-slate-300'}`}>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showArdoise}
              onChange={(e) => setShowArdoise(e.target.checked)}
            />
            <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute ${showArdoise ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
        </label>

        {showArdoise && (
          <div className="mt-3 pt-3 border-t border-slate-200 animate-in slide-in-from-top-2">
            <input
              type="number"
              value={ardoiseVal}
              onChange={(e) => setArdoiseVal(e.target.value)}
              placeholder="Montant de l'ardoise (FCFA)"
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleUpdate}
        disabled={isPending || isUploading || !deliveryCode || deliveryCode.length < 4 || !photoUrl}
        className="w-full bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/20 py-4 rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Validation...</>
        ) : (
          <><CheckCircle className="w-4 h-4" /> Finaliser la livraison</>
        )}
      </button>
    </div>
  )
}
