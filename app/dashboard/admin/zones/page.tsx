// app/dashboard/admin/zones/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ZONE_TYPE_LABELS, type ZoneType } from '@/lib/types'
import ZoneTarifForm from '@/components/ZoneTarifForm'
import { Map, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminZonesPage() {
  const supabase = await createClient()

  const { data: zones } = await supabase
    .from('zones').select('*').order('type').order('name')

  const zonesByType: Record<ZoneType, typeof zones> = {
    dakar_centre: zones?.filter(z => z.type === 'dakar_centre') || [],
    banlieue: zones?.filter(z => z.type === 'banlieue') || [],
    interieur: zones?.filter(z => z.type === 'interieur') || [],
  }

  const typeConfig: Record<ZoneType, { border: string, bg: string, tagBg: string, tagText: string }> = {
    dakar_centre: {
      border: 'border-blue-100 focus-within:border-blue-300',
      bg: 'bg-white hover:bg-blue-50/30',
      tagBg: 'bg-blue-50',
      tagText: 'text-blue-600',
    },
    banlieue: {
      border: 'border-orange-100 focus-within:border-orange-300',
      bg: 'bg-white hover:bg-orange-50/30',
      tagBg: 'bg-orange-50',
      tagText: 'text-orange-600',
    },
    interieur: {
      border: 'border-purple-100 focus-within:border-purple-300',
      bg: 'bg-white hover:bg-purple-50/30',
      tagBg: 'bg-purple-50',
      tagText: 'text-purple-600',
    },
  }

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-0 pb-24">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">Zones & Tarifs</h1>
        <div className="h-1 w-8 bg-slate-900 mt-2 rounded-full"></div>
        <p className="text-slate-500 text-xs font-bold mt-2 tracking-wide flex items-center gap-1.5">
          <Map className="w-3.5 h-3.5" />
          Configuration de la matrice de prix
        </p>
      </div>

      <div className="space-y-12">
        {(Object.entries(zonesByType) as [ZoneType, any[]][]).map(([type, typeZones]) => {
          if (!typeZones.length) return null
          const config = typeConfig[type]

          return (
            <div key={type}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-5 px-1 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-black text-sm text-slate-900 uppercase tracking-widest">
                    {ZONE_TYPE_LABELS[type]}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${config.tagBg} ${config.tagText}`}>
                    {typeZones.length} zones
                  </span>
                </div>
                {type === 'interieur' && (
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-orange-500" /> Relais obligatoire
                  </span>
                )}
              </div>

              {/* Zones Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {typeZones.map((zone) => (
                  <div key={zone.id} className={`border rounded-[1.5rem] p-4 transition-all duration-300 ${config.border} ${config.bg} shadow-sm hover:shadow-md`}>
                    <div className="font-bold text-slate-900 text-sm mb-3 ml-1 tracking-tight truncate">
                      {zone.name}
                    </div>
                    <ZoneTarifForm zone={zone} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
