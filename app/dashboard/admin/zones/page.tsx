// app/dashboard/admin/zones/page.tsx
import { createClient } from '@/lib/supabase/server'
import { updateZoneTarif } from '@/actions/orders'
import { ZONE_TYPE_LABELS, type ZoneType } from '@/lib/types'

export default async function AdminZonesPage() {
  const supabase = await createClient()

  const { data: zones } = await supabase
    .from('zones').select('*').order('type').order('name')

  const zonesByType: Record<ZoneType, typeof zones> = {
    dakar_centre: zones?.filter(z => z.type === 'dakar_centre') || [],
    banlieue: zones?.filter(z => z.type === 'banlieue') || [],
    interieur: zones?.filter(z => z.type === 'interieur') || [],
  }

  const typeColors: Record<ZoneType, string> = {
    dakar_centre: 'border-blue-200 bg-blue-50',
    banlieue: 'border-orange-200 bg-orange-50',
    interieur: 'border-purple-200 bg-purple-50',
  }

  const typeBadge: Record<ZoneType, string> = {
    dakar_centre: 'bg-blue-100 text-blue-700',
    banlieue: 'bg-orange-100 text-orange-700',
    interieur: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-900">Gestion des zones</h1>
        <p className="text-slate-500 text-sm mt-1">Modifiez les tarifs par zone de livraison.</p>
      </div>

      <div className="space-y-8">
        {(Object.entries(zonesByType) as [ZoneType, any[]][]).map(([type, typeZones]) => (
          <div key={type}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeBadge[type]}`}>
                {ZONE_TYPE_LABELS[type]}
              </span>
              <span className="text-slate-400 text-sm">{typeZones.length} zones</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {typeZones.map((zone) => (
                <div key={zone.id} className={`border rounded-2xl p-4 ${typeColors[type]}`}>
                  <div className="font-semibold text-slate-800 text-sm mb-3">{zone.name}</div>

                  <form action={async (formData: FormData) => {
                    'use server'
                    const tarif = parseInt(formData.get('tarif') as string)
                    if (!isNaN(tarif)) await updateZoneTarif(zone.id, tarif)
                  }} className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <input
                        name="tarif"
                        type="number"
                        defaultValue={zone.tarif_base}
                        min={500}
                        step={500}
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">F</span>
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
                    >
                      Sauver
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
