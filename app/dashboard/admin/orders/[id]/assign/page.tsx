import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { assignLivreur } from '@/actions/orders'
import { MapPin, Bike, Package, Check, ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AssignOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // 1. Infos Commande
  const { data: order } = await supabase
    .from('orders')
    .select(` *, client:profiles!orders_client_id_fkey(full_name, phone), zone_from:zones!orders_zone_from_id_fkey(name), zone_to:zones!orders_zone_to_id_fkey(name) `)
    .eq('id', resolvedParams.id).single()

  if (!order || order.status !== 'en_attente') {
    redirect('/dashboard/admin') // Déjà assignée ou n'existe pas
  }

  // 2. Fetch Livreurs
  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id, full_name, phone, zone_id, last_seen_at, zone:zones!profiles_zone_id_fkey(name)')
    .eq('role', 'livreur')

  // 3. Commandes actives pour calculer la charge
  const { data: activeOrders } = await supabase
    .from('orders')
    .select('livreur_id')
    .not('livreur_id', 'is', null)
    .in('status', ['confirme', 'en_cours'])

  // 4. Enrichir et trier les livreurs
  const now = Date.now()
  const FIVE_MINS = 5 * 60 * 1000

  const enrichedLivreurs = (livreurs || []).map(l => {
    const activeCount = (activeOrders || []).filter(o => o.livreur_id === l.id).length || 0
    const isOnline = l.last_seen_at ? (now - new Date(l.last_seen_at).getTime() < FIVE_MINS) : false
    const isSameZone = l.zone_id === order.zone_from_id

    return {
      ...l,
      activeCount,
      isOnline,
      isSameZone
    }
  }).sort((a, b) => {
    // 1. En ligne en premier
    if (a.isOnline && !b.isOnline) return -1
    if (!a.isOnline && b.isOnline) return 1
    // 2. Même zone en deuxième
    if (a.isSameZone && !b.isSameZone) return -1
    if (!a.isSameZone && b.isSameZone) return 1
    // 3. Moins de charge en priorité
    return a.activeCount - b.activeCount
  })

  // Action Serveur local pour l'assignation
  async function handleAssign(formData: FormData) {
    'use server'
    const livreurId = formData.get('livreur_id') as string
    if (livreurId) {
      await assignLivreur(order.id, livreurId)
      redirect('/dashboard/admin')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 pt-4">
      {/* HEADER COMMANDE */}
      <div className="bg-white rounded-[2rem] border border-orange-100 p-6 md:p-8 shadow-xl shadow-orange-500/5 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-slate-900 tracking-tight leading-none">Assignation de Commande</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Réf: {order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-500"><MapPin className="w-4 h-4" /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ramassage</p>
                  <p className="font-bold text-slate-800 text-sm">{order.zone_from?.name || 'Toutes zones'}</p>
                  <p className="text-xs text-slate-500">{order.pickup_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-500"><Check className="w-4 h-4" /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Livraison</p>
                  <p className="font-bold text-slate-800 text-sm">{order.zone_to?.name || 'Toutes zones'}</p>
                  <p className="text-xs text-slate-500">{order.delivery_address}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Détails Colis</p>
              <p className="text-sm font-bold text-slate-900 line-clamp-2">{order.description}</p>
              <div className="mt-3 font-display font-black text-orange-600 text-2xl">
                {order.price.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH LIVREURS */}
      <h2 className="font-display font-black text-sm text-slate-900 tracking-tight uppercase mb-4 flex items-center gap-2">
        <Bike className="w-4 h-4 text-orange-500" />
        Livreurs Disponibles ({enrichedLivreurs.length})
      </h2>

      <div className="space-y-3">
        {enrichedLivreurs.map(livreur => (
          <div key={livreur.id} className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${livreur.isOnline ? 'border-green-100 shadow-sm hover:shadow-md' : 'border-slate-100 opacity-60 grayscale-[50%]'}`}>
            
            <div className="flex items-center gap-4 flex-1">
              {/* Status Dot & Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black text-lg">
                  {livreur.full_name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${livreur.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}>
                  {livreur.isOnline && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 truncate flex items-center gap-2">
                  {livreur.full_name}
                  {livreur.isSameZone && livreur.isOnline && (
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                      📍 Dans la zone
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-black uppercase tracking-widest">
                  <span className={livreur.isOnline ? 'text-green-600' : 'text-slate-400'}>
                    {livreur.isOnline ? 'EN LIGNE' : 'HORS LIGNE'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 truncate max-w-[100px]">
                    {(Array.isArray(livreur.zone) ? livreur.zone[0]?.name : (livreur.zone as any)?.name) || 'Toutes zones'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions & Stats */}
            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
              <div className="flex flex-col items-center px-4">
                <div className={`font-display font-black text-xl leading-none ${livreur.activeCount > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                  {livreur.activeCount}
                </div>
                <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1 text-center">Colis<br/>en cours</div>
              </div>

              <form action={handleAssign}>
                <input type="hidden" name="livreur_id" value={livreur.id} />
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                    livreur.isOnline
                      ? livreur.isSameZone
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                        : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-500 shadow-transparent'
                  }`}
                >
                  Assigner
                </button>
              </form>
            </div>

          </div>
        ))}

        {enrichedLivreurs.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold mb-1">Aucun livreur disponible</p>
            <p className="text-xs text-slate-400">Ajoutez des livreurs depuis la flotte.</p>
          </div>
        )}
      </div>
    </div>
  )
}
