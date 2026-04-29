// app/dashboard/admin/livreurs/page.tsx
import { createClient } from '@/utils/supabase/server'
import { Bike } from 'lucide-react'
import LivreurRow from '@/components/LivreurRow'
import AddLivreurForm from '@/components/AddLivreurForm'

export const dynamic = 'force-dynamic'

export default async function AdminLivreursPage() {
  const supabase = await createClient()

  // On récupère tout séparément (plus robuste que les joins SQL complexes en cas d'erreur de cache)
  // On récupère les livreurs ET les agents pour la gestion d'équipe
  const [
    { data: staff, error: lError },
    { data: zones, error: zError },
    { data: orderStats, error: oError }
  ] = await Promise.all([
    supabase.from('profiles')
      .select('*')
      .in('role', ['livreur', 'agent', 'admin'])
      .order('created_at', { ascending: false }),
    supabase.from('zones').select('*').order('type').order('name'),
    supabase.from('orders').select('livreur_id, status, price').not('livreur_id', 'is', null)
  ])

  if (lError || zError || oError) {
    const msg = lError?.message || zError?.message || oError?.message
    return <div className="p-10 text-red-500 bg-red-50 rounded-3xl m-8 border border-red-100 text-center font-bold">Erreur de données Supabase: {msg}</div>
  }

  // Mapping manuel des stats et zones
  const statsByStaff = (staff || []).map(l => {
    const z = zones?.find(zf => zf.id === l.zone_id)
    const myOrders = orderStats?.filter(o => o.livreur_id === l.id) || []
    const livres = myOrders.filter(o => ['livre', 'livre_partiel'].includes(o.status))
    return {
      ...l,
      zone: z ? { name: z.name, type: z.type } : null,
      total: myOrders.length,
      livres: livres.length,
      en_cours: myOrders.filter(o => ['confirme', 'en_cours'].includes(o.status)).length,
      montant: livres.reduce((sum, o) => sum + (o.price || 0), 0),
    }
  })


  return (
    <div className="max-w-6xl mx-auto px-2 md:px-0 pb-24">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">Gestion d&apos;Équipe</h1>
        <div className="h-1 w-8 bg-orange-500 mt-2 rounded-full"></div>
        <p className="text-slate-500 text-xs font-bold mt-2 tracking-wide">
          {statsByStaff.length} membre(s) dans l&apos;équipe (Livreurs & Agents)
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 cursor-default">

        {/* LISTE EQUIPE */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {!statsByStaff.length ? (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                <Bike className="w-8 h-8" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 uppercase tracking-tight">Aucun membre</h3>
              <p className="text-slate-500 text-sm mt-1">Créez votre premier membre d&apos;équipe ci-contre.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {statsByStaff.map((l) => (
                <LivreurRow key={l.id} livreur={l as any} zones={zones || []} />
              ))}
            </div>
          )}
        </div>

        {/* FORMULAIRE AJOUT */}
        <div className="order-1 lg:order-2">
          <AddLivreurForm zones={zones || []} />
        </div>
      </div>
    </div>
  )
}
