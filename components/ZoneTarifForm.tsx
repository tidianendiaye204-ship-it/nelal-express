// components/ZoneTarifForm.tsx
'use client'

import { useState } from 'react'
import { updateZoneTarif } from '@/actions/orders'
import { CheckCircle, Save } from 'lucide-react'

export default function ZoneTarifForm({ zone }: { zone: any }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const tarif = parseInt(formData.get('tarif') as string)
    const local = parseInt(formData.get('local') as string)

    await updateZoneTarif(zone.id, { 
      tarif_base: !isNaN(tarif) ? tarif : undefined,
      tarif_local: !isNaN(local) ? local : undefined 
    })
    
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Tarif de Base (Longue Distance) */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <div className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base</div>
          <input
            name="tarif"
            type="number"
            defaultValue={zone.tarif_base}
            min={500}
            step={500}
            className="w-full bg-slate-50 border border-slate-100 text-slate-800 font-bold rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 pr-10 outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">F</span>
        </div>
      </div>

      {/* Tarif Local (Intra-Zone) */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <div className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Local</div>
          <input
            name="local"
            type="number"
            defaultValue={zone.tarif_local || 1000}
            min={500}
            step={100}
            className="w-full bg-slate-50 border border-slate-100 text-slate-800 font-bold rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 pr-10 outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">F</span>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-md active:scale-95 outline-none flex-shrink-0 ${
            success 
              ? 'bg-green-500 text-white shadow-green-500/20' 
              : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/10'
          }`}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Save className="w-4.5 h-4.5" />
          )}
        </button>
      </div>
    </form>
  )
}
