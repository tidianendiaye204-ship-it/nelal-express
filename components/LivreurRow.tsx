'use client'

import { useState, useTransition } from 'react'
import { 
  Phone, 
  MapPin, 
  MessageCircle, 
  Edit3, 
  X, 
  Save, 
  Loader2
} from 'lucide-react'
import { updateLivreur } from '@/actions/orders'

interface Zone {
  id: string
  name: string
  type: string
}

interface Livreur {
  id: string
  full_name: string
  phone: string
  cash_held: number
  zone_id: string | null
  zone?: { name: string; type: string }
  total: number
  livres: number
  en_cours: number
  montant: number
}

interface LivreurRowProps {
  livreur: Livreur
  zones: Zone[]
}

export default function LivreurRow({ livreur: l, zones }: LivreurRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [fullName, setFullName] = useState(l.full_name)
  const [phone, setPhone] = useState(l.phone)
  const [zoneId, setZoneId] = useState(l.zone_id || '')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append('full_name', fullName)
    formData.append('phone', phone)
    formData.append('zone_id', zoneId)

    startTransition(async () => {
      const res = await updateLivreur(l.id, formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsEditing(false)
      }
    })
  }

  if (isEditing) {
    return (
      <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Edit3 className="w-3 h-3 text-orange-500" /> Mode Édition
            </h3>
            <button 
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Nom complet</label>
              <input 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800 border-none text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Téléphone</label>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border-none text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Zone</label>
              <select 
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full bg-slate-800 border-none text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none appearance-none"
              >
                <option value="">Agent volant</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-[10px] text-red-400 font-bold">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button 
              type="submit"
              disabled={isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Enregistrer les modifications
            </button>
            <button 
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 bg-slate-800 text-slate-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-5 relative z-10">
        {/* Avatar & Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20 flex-shrink-0">
            {(l.full_name || 'L').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base truncate">{l.full_name}</h3>
              <button 
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-orange-500 transition-all"
                title="Modifier le profil"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400" />
                {l.zone?.name || 'Toutes zones'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 py-3 md:py-0 border-y md:border-y-0 border-slate-50">
          <div className="bg-green-50 px-3 py-2 rounded-xl flex-1 md:flex-none text-center min-w-[70px]">
            <div className="font-display font-black text-green-600 text-xl leading-none">{l.livres}</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-green-500 mt-1">Livrées</div>
          </div>
          <div className="bg-blue-50 px-3 py-2 rounded-xl flex-1 md:flex-none text-center relative min-w-[70px]">
            {l.en_cours > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
            )}
            <div className="font-display font-black text-blue-600 text-xl leading-none">{l.en_cours}</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-blue-500 mt-1">Actives</div>
          </div>
          <div className="bg-orange-50 px-3 py-2 rounded-xl flex-1 md:flex-none text-center min-w-[80px]">
            <div className="font-display font-black text-orange-600 text-lg leading-none">{(l.montant || 0).toLocaleString('fr-FR')}</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-orange-500 mt-1">FCFA</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-1.5 flex-shrink-0 justify-end md:justify-center">
          <a href={l.phone ? `tel:${l.phone}` : '#'} className="flex-1 md:flex-none w-auto md:w-11 h-11 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all outline-none shadow-sm">
            <Phone className="w-4 h-4" />
          </a>
          {l.phone && (
            <a 
              href={`https://wa.me/${l.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${l.full_name}, c'est l'administration Nelal Express.`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 md:flex-none w-auto md:w-11 h-11 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl flex items-center justify-center text-[#25D366] active:scale-95 transition-all outline-none shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
