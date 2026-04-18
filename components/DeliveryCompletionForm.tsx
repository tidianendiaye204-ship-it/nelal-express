// components/DeliveryCompletionForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { confirmDeliveryWithCode } from '@/actions/orders'
import { CheckCircle, AlertCircle, Loader2, Coins, ShieldCheck } from 'lucide-react'

interface DeliveryCompletionFormProps {
  order: any
}

export default function DeliveryCompletionForm({ order }: DeliveryCompletionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const [showArdoise, setShowArdoise] = useState(false)
  const [ardoiseVal, setArdoiseVal] = useState('')
  const [deliveryCode, setDeliveryCode] = useState('')

  const handleUpdate = () => {
    startTransition(async () => {
      const ardoise = showArdoise ? parseInt(ardoiseVal) || 0 : 0
      const res = await confirmDeliveryWithCode(order.id, deliveryCode, ardoise, order.price)
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
      {/* SÉCURITÉ : CODE DE LIVRAISON */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <label className="block text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1.5">
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
        <p className="text-[9px] text-orange-700/70 mt-2 font-medium leading-tight text-center">
          Ce code a été envoyé au destinataire par WhatsApp.
        </p>
      </div>

      {result?.error && (
        <div className="bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {result.error}
        </div>
      )}

      {/* ARDOISE TOGGLE */}
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
            <label className="block text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1.5 ml-1">
              Montant de l&apos;ardoise (FCFA)
            </label>
            <div className="relative">
              <input
                type="number"
                value={ardoiseVal}
                onChange={(e) => setArdoiseVal(e.target.value)}
                placeholder="Ex: 1000"
                min="0"
                step="500"
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">F</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1.5 leading-tight">
              Saisissez l&apos;argent supplémentaire que vous avez gardé par manque de monnaie. 
              Ce montant sera déduit de votre compte.
            </p>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleUpdate}
        disabled={isPending || !deliveryCode || deliveryCode.length < 4 || (showArdoise && !ardoiseVal)}
        className="w-full bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/20 py-4 rounded-xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100"
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
