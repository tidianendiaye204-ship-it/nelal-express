// app/dashboard/client/nouvelle-commande/page.tsx
import { createClient } from '@/lib/supabase/server'
import { createOrder } from '@/actions/orders'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ZONE_TYPE_LABELS } from '@/lib/types'

export default async function NouvelleCommandePage() {
  const supabase = await createClient()

  const { data: zones } = await supabase
    .from('zones')
    .select('*')
    .order('type')
    .order('name')

  const zonesByType = {
    dakar_centre: zones?.filter(z => z.type === 'dakar_centre') || [],
    banlieue: zones?.filter(z => z.type === 'banlieue') || [],
    interieur: zones?.filter(z => z.type === 'interieur') || [],
  }

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createOrder(formData)
    if (result?.success) redirect('/dashboard/client')
}

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/client" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
          ←
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase">Commander</h1>
          <p className="text-slate-500 text-xs mt-0.5">Rapide et simple</p>
        </div>
      </div>

      <form action={handleCreate} className="space-y-4">
        {/* ROUTE VISUAL */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex flex-col items-center py-2">
              <div className="w-3 h-3 rounded-full border-2 border-orange-500 bg-white"></div>
              <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Départ</label>
                <select
                  name="zone_from_id"
                  required
                  className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">D'où part le colis ?</option>
                  {Object.entries(zonesByType).map(([type, typeZones]) => (
                    <optgroup key={type} label={ZONE_TYPE_LABELS[type as keyof typeof ZONE_TYPE_LABELS]}>
                      {typeZones.map(zone => (
                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="h-px bg-slate-50"></div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Destination</label>
                <select
                  name="zone_to_id"
                  required
                  className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Où va le colis ?</option>
                  {Object.entries(zonesByType).map(([type, typeZones]) => (
                    <optgroup key={type} label={ZONE_TYPE_LABELS[type as keyof typeof ZONE_TYPE_LABELS]}>
                      {typeZones.map(zone => (
                        <option key={zone.id} value={zone.id}>{zone.name} — {zone.tarif_base.toLocaleString('fr-FR')} F</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS CARD */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">📦</span>
              <h2 className="font-display font-black text-sm text-slate-800 uppercase tracking-tight">Le Colis</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Élite Express</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="is_express" className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
          
          <div>
            <textarea
              name="description"
              required
              rows={2}
              placeholder="Que livrons-nous ? (ex: 2 pizzas, sac de riz...)"
              className="w-full bg-slate-50 border-none text-slate-900 rounded-2xl px-5 py-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'particulier', label: '👤 Perso' },
              { value: 'vendeur', label: '🛒 Vendeur' },
            ].map((opt) => (
              <label key={opt.value} className="relative cursor-pointer group">
                <input type="radio" name="type" value={opt.value} defaultChecked={opt.value === 'particulier'} className="peer sr-only" />
                <div className="border-2 border-slate-50 peer-checked:border-orange-500 peer-checked:bg-orange-50 rounded-xl p-3 text-center transition-all">
                  <div className="font-bold text-xs text-slate-700">{opt.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* RECIPIENT CARD */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <span className="text-xl">👤</span>
            <h2 className="font-display font-black text-sm text-slate-800 uppercase tracking-tight">Destinataire</h2>
          </div>

          <div className="space-y-4">
            <input
              name="recipient_name"
              type="text"
              required
              placeholder="Nom de celui qui reçoit"
              className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-5 py-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <input
              name="recipient_phone"
              type="tel"
              required
              pattern="(?:\+221|00221)?7[05678]\d{7}"
              placeholder="Téléphone (77...)"
              className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-5 py-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        {/* PAYMENT CARD */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">💰</span>
            <h2 className="font-display font-black text-sm text-slate-800 uppercase tracking-tight">Paiement</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'wave', label: 'Wave' },
              { value: 'orange_money', label: 'Orange' },
              { value: 'cash', label: 'Cash' },
            ].map((opt) => (
              <label key={opt.value} className="relative cursor-pointer group">
                <input type="radio" name="payment_method" value={opt.value} defaultChecked={opt.value === 'wave'} className="peer sr-only" />
                <div className="border-2 border-slate-50 peer-checked:border-orange-500 peer-checked:bg-orange-50 rounded-xl p-3 text-center transition-all">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-700">{opt.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON - STICKY ON MOBILE */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 md:relative md:bg-transparent md:border-0 md:p-0 z-40">
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            Confirmer 🚀
          </button>
        </div>
      </form>
    </div>
  )

}
