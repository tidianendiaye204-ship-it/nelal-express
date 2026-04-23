'use client'

import { useState, useTransition } from 'react'
import { confirmDeliveryWithCode } from '@/actions/orders'
import { CheckCircle, AlertCircle, Loader2, Coins, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import SignaturePad from './SignaturePad'
import PhotoUploadButton from './PhotoUploadButton'

interface DeliveryCompletionFormProps {
  order: any
}

export default function DeliveryCompletionForm({ order }: DeliveryCompletionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const [showArdoise, setShowArdoise] = useState(false)
  const [ardoiseVal, setArdoiseVal] = useState('')
  const [deliveryCode, setDeliveryCode] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  
  // -- Signature State --
  const [isUploading, setIsUploading] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const supabase = createClient()

  // Helper to convert base64 to File
  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const handleSignatureSave = async (dataUrl: string) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const file = dataURLtoFile(dataUrl, `sig-${order.id}.png`)
      const filePath = `signatures/${order.id}-${Date.now()}.png`

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath)

      setSignatureUrl(publicUrl)
    } catch (err: any) {
      console.error('Signature upload error:', err)
      setUploadError('Erreur lors de l’enregistrement de la signature.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = () => {
    startTransition(async () => {
      const ardoise = showArdoise ? parseInt(ardoiseVal) || 0 : 0
      const res = await confirmDeliveryWithCode(order.id, deliveryCode, ardoise, order.price, photoUrl || undefined, signatureUrl || undefined)
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
    <div className="w-full space-y-6 mt-6 border-t border-slate-100 pt-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">2</div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Finalisation de la livraison</h4>
      </div>
      
      {/* 1. SIGNATURE (Preuve de livraison) */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Signature du destinataire</p>
        <SignaturePad 
          onSave={handleSignatureSave} 
          onClear={() => setSignatureUrl(null)} 
        />
        {uploadError && <p className="text-[9px] text-red-500 mt-2 font-bold">{uploadError}</p>}
      </div>

      {/* 2. PREUVE PHOTO (Nouveau) */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 text-center">Photo de livraison obligatoire</p>
        <PhotoUploadButton 
          orderId={order.id} 
          onUploadComplete={(url) => setPhotoUrl(url)} 
          label="Prendre photo de livraison"
        />
      </div>

      {/* 3. SÉCURITÉ : CODE DE LIVRAISON */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 shadow-inner">
        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Code de confirmation (4 chiffres)
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={deliveryCode}
          onChange={(e) => setDeliveryCode(e.target.value)}
          placeholder="Entrez les 4 chiffres"
          className="w-full bg-white border-2 border-blue-200 text-blue-600 rounded-2xl px-4 py-4 text-3xl font-black tracking-[0.6em] text-center focus:border-blue-500 transition-all outline-none shadow-sm"
        />
        <p className="text-[9px] text-blue-400 mt-3 text-center font-bold">Demandez le code secret au client pour valider</p>
      </div>

      {result?.error && (
        <div className="bg-red-50 text-red-600 py-3 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 border border-red-100 animate-shake">
          <AlertCircle className="w-4 h-4" /> {result.error}
        </div>
      )}

      {/* 4. ARDOISE TOGGLE */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showArdoise ? 'bg-orange-100 text-orange-600' : 'bg-white text-slate-400 border border-slate-100'}`}>
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Manque de monnaie ?</p>
              <p className="text-[10px] text-slate-500 font-medium italic">Signaler une ardoise au vendeur</p>
            </div>
          </div>
          <div className={`w-12 h-7 rounded-full transition-colors relative flex items-center ${showArdoise ? 'bg-orange-500' : 'bg-slate-300'}`}>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showArdoise}
              onChange={(e) => setShowArdoise(e.target.checked)}
            />
            <span className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute ${showArdoise ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </label>

        {showArdoise && (
          <div className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2">
            <input
              type="number"
              value={ardoiseVal}
              onChange={(e) => setArdoiseVal(e.target.value)}
              placeholder="Montant manquant (FCFA)"
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-4 text-base font-bold focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleUpdate}
        disabled={isPending || isUploading || !deliveryCode || deliveryCode.length < 4 || !signatureUrl || !photoUrl}
        className="w-full bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/30 h-20 rounded-2xl font-black text-lg uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
      >
        {isPending || isUploading ? (
          <><Loader2 className="w-6 h-6 animate-spin" /> {isUploading ? 'ENREGISTREMENT...' : 'VALIDATION...'}</>
        ) : (
          <><CheckCircle className="w-6 h-6" /> VALIDER LA LIVRAISON</>
        )}
      </button>
    </div>
  )
}
