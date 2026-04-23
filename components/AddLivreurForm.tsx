'use client'

import { useState, useTransition } from 'react'
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createLivreur } from '@/actions/orders'

interface Zone {
  id: string
  name: string
}

export default function AddLivreurForm({ zones }: { zones: Zone[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createLivreur(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
      }
    })
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 lg:sticky lg:top-24 shadow-xl shadow-slate-900/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-black text-base text-slate-900 uppercase tracking-tight leading-tight">Nouveau Profil</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Création de compte</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] font-bold text-red-600 leading-tight">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] font-bold text-green-600 leading-tight">Le livreur a été créé avec succès !</p>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom complet</label>
          <input
            name="full_name" type="text" required placeholder="Ex: Modou Fall"
            className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Téléphone</label>
          <input
            name="phone" type="tel" required placeholder="77 XXX XX XX"
            className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email (Connexion)</label>
          <input
            name="email" type="email" required placeholder="livreur@nelal.sn"
            className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
          <input
            name="password" type="password" required minLength={8} placeholder="Min. 8 caractères"
            className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assignation zone</label>
          <select
            name="zone_id"
            className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none appearance-none"
          >
            <option value="">Agent volant (Toutes zones)</option>
            {zones?.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-slate-900/20 active:scale-95 outline-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création...
              </>
            ) : (
              'Créer le compte →'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
