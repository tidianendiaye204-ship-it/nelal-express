// app/dashboard/client/commandes/page.tsx
import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import LiveClientUpdater from '@/components/LiveClientUpdater'
import { ChevronRight, Package, Clock, Bike, CheckCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CommandesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient()
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')

  const { status: filterStatus } = await searchParams

  let query = supabase
    .from('orders')
    .select(`
      *,
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type),
      livreur:profiles!orders_livreur_id_fkey(full_name)
    `)
    .eq('client_id', profile.id)
    .order('created_at', { ascending: false })

  if (filterStatus && filterStatus !== 'tous') {
    query = query.eq('status', filterStatus)
  }

  const { data: orders } = await query

  const statusFilters = [
    { key: 'tous', label: 'Tous', icon: <Package className="w-3.5 h-3.5" /> },
    { key: 'en_attente', label: 'En attente', icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'en_cours', label: 'En cours', icon: <Bike className="w-3.5 h-3.5" /> },
    { key: 'livre', label: 'Livrés', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { key: 'annule', label: 'Annulés', icon: <XCircle className="w-3.5 h-3.5" /> },
  ]

  const activeFilter = filterStatus || 'tous'

  return (
    <div className="max-w-2xl mx-auto pb-24 px-1">
      <LiveClientUpdater clientId={profile.id} />

      {/* HEADER */}
      <div className="mb-6 px-2">
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">
          Mes Commandes
        </h1>
        <div className="h-1 w-6 bg-orange-500 mt-2 rounded-full"></div>
        <p className="text-slate-500 text-xs mt-2">{orders?.length || 0} colis au total</p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 px-2 scrollbar-hide -mx-1">
        {statusFilters.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'tous' ? '/dashboard/client/commandes' : `/dashboard/client/commandes?status=${f.key}`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              activeFilter === f.key
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f.icon}
            {f.label}
          </Link>
        ))}
      </div>

      {/* ORDERS LIST */}
      {!orders?.length ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-100 mx-2">
          <div className="text-3xl mb-3 opacity-20">📭</div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Aucune commande</p>
          <p className="text-slate-400 text-xs mb-4">
            {activeFilter !== 'tous' ? 'Aucune commande avec ce statut' : 'Vous n\'avez pas encore envoyé de colis'}
          </p>
          <Link
            href="/dashboard/client/nouvelle-commande"
            className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20"
          >
            Envoyer un colis
          </Link>
        </div>
      ) : (
        <div className="space-y-2 px-2">
          {orders.map((order: any) => {
            const isCancelled = order.status === 'annule'
            const isDelivered = order.status === 'livre'

            return (
              <Link
                key={order.id}
                href={`/dashboard/client/commandes/${order.id}`}
                className={`block bg-white rounded-2xl border border-slate-100 p-4 shadow-sm active:scale-[0.98] transition-all group hover:shadow-md ${
                  isCancelled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest ${
                        STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
                      }`}>
                        {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                      </span>
                      {isDelivered && <span className="text-[10px]">✅</span>}
                    </div>

                    <h3 className="text-slate-900 font-bold text-sm truncate leading-tight">{order.description}</h3>

                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-medium">
                      <span>{order.zone_from?.name}</span>
                      <span className="text-orange-500 font-black">→</span>
                      <span>{order.zone_to?.name}</span>
                    </div>

                    <p className="text-[9px] text-slate-300 font-medium mt-1">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Right: Price + Arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-display font-black text-orange-600 text-sm leading-none">
                        {order.price.toLocaleString('fr-FR')} <span className="text-[8px]">F</span>
                      </div>
                      {order.livreur && (
                        <p className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-[80px]">
                          🚴 {order.livreur.full_name}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
