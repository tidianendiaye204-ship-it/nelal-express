// app/dashboard/admin/livreurs/page.tsx
import { createClient } from '@/utils/supabase/server'
import { createLivreur } from '@/actions/orders'
import { redirect } from 'next/navigation'
import { UserPlus, Bike } from 'lucide-react'
import LivreurRow from '@/components/LivreurRow'

export const dynamic = 'force-dynamic'

export default async function AdminLivreursPage() {
  const supabase = await createClient()

  // On récupère tout séparément (pas de join complexe)
  const [
    { data: livreurs, error: lError },
    { data: zones, error: zError },
    { data: orderStats, error: oError }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'livreur'),
    supabase.from('zones').select('*'),
    supabase.from('orders').select('livreur_id, status, price')
  ])

  if (lError || zError || oError) {
    const msg = lError?.message || zError?.message || oError?.message
    return <div className="p-10 text-red-500">Erreur DB: {msg}</div>
  }

  const statsByLivreur = (livreurs || []).map(l => {
    const z = zones?.find(zf => zf.id === l.zone_id)
    const myOrders = orderStats?.filter(o => o.livreur_id === l.id) || []
    return {
      ...l,
      zone_name: z?.name || 'Toutes zones',
      total: myOrders.length,
      livres: myOrders.filter(o => o.status === 'livre').length,
    }
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Liste des Livreurs ({statsByLivreur.length})</h1>
      <div className="space-y-2">
        {statsByLivreur.map(l => (
          <div key={l.id} className="p-4 bg-white border rounded-xl flex justify-between">
            <div>
              <p className="font-bold">{l.full_name}</p>
              <p className="text-xs text-slate-500">{l.phone} - {l.zone_name}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{l.livres} livrées</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
