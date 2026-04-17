// app/dashboard/livreur/page.tsx
import { createClient, getProfile } from '@/lib/supabase/server'
import LiveOrderUpdater from '@/components/LiveOrderUpdater'
import StatusUpdateButton from '@/components/StatusUpdateButton'
import DeliveryCompletionForm from '@/components/DeliveryCompletionForm'
import { getWhatsAppDirectLink } from '@/lib/utils/phone'
import { getFullRouteLink, getMapSearchLink, getEstimatedTime } from '@/lib/utils/maps'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import {
  Bike, CheckCircle, Wallet, Phone, MessageCircle,
  MapPin, Navigation, Route, Clock, Package,
  AlertTriangle, ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LivreurDashboard() {
  const supabase = await createClient()
  const profile = await getProfile()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type)
    `)
    .eq('livreur_id', profile?.id)
    .in('status', ['confirme', 'en_cours'])
    .order('created_at', { ascending: false })

  const { data: historique } = await supabase
    .from('orders')
    .select(`
      *,
      zone_from:zones!orders_zone_from_id_fkey(name),
      zone_to:zones!orders_zone_to_id_fkey(name)
    `)
    .eq('livreur_id', profile?.id)
    .in('status', ['annule', 'livre', 'livre_partiel'])
    .order('created_at', { ascending: false })
    .limit(20)

  // Pour les stats globales sans limite
  const { data: allStatsOrders } = await supabase
    .from('orders')
    .select('id, status, price')
    .eq('livreur_id', profile?.id)

  // Count available orders for the badge
  const { count: availableCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'en_attente')
    .is('livreur_id', null)

  const totalEarnings = allStatsOrders?.filter(o => ['livre', 'livre_partiel'].includes(o.status)).reduce((sum: number, o: any) => sum + (o.price || 0), 0) || 0
  const deliveredCount = allStatsOrders?.filter(o => ['livre', 'livre_partiel'].includes(o.status)).length || 0

  return (
    <div className="max-w-2xl mx-auto pb-10 px-1">
      {/* Real-time listener */}
      <LiveOrderUpdater livreurId={profile?.id} />

      <div className="mb-6 px-2">
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">Mes Missions</h1>
        <div className="h-1 w-6 bg-orange-500 mt-2 rounded-full"></div>
        <p className="text-slate-500 text-xs mt-2">Gérez vos ramassages et livraisons en temps réel</p>
      </div>

      {/* AVAILABLE ORDERS CTA */}
      {(availableCount || 0) > 0 && (
        <Link
          href="/dashboard/livreur/disponibles"
          className="mx-2 mb-6 block bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-tight">
                  {availableCount} mission{(availableCount || 0) > 1 ? 's' : ''} disponible{(availableCount || 0) > 1 ? 's' : ''}
                </p>
                <p className="text-green-100 text-[8px] font-bold uppercase tracking-widest">
                  Touchez pour accepter →
                </p>
              </div>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
        </Link>
      )}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-2 mb-8 px-2">
        {[
          { label: 'En cours', value: orders?.length || 0, icon: <Bike className="w-5 h-5" />, color: 'text-orange-600' },
          { label: 'Livrées', value: deliveredCount, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600' },
          { label: 'Gains', value: `${totalEarnings.toLocaleString('fr-FR')} FCFA`, icon: <Wallet className="w-5 h-5" />, color: 'text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
            <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
            <div className="font-display font-black text-sm text-slate-900 leading-none">{stat.value}</div>
            <div className="text-slate-400 text-[6px] font-black uppercase tracking-widest mt-1.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ACTIVE MISSIONS */}
      <h2 className="font-display font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4 ml-3">
        À effectuer ({orders?.length || 0})
      </h2>

      {!orders?.length ? (
        <div className="mx-2 bg-slate-50 rounded-[1.5rem] p-10 text-center border border-slate-100 mb-8">
          <div className="text-3xl mb-3 opacity-20">🎉</div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Aucune course en cours</p>
          <Link
            href="/dashboard/livreur/disponibles"
            className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20"
          >
            Voir les missions disponibles
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mb-10 px-2">
          {orders.map((order: any) => {
            const estimatedTime = getEstimatedTime(order.zone_from?.type, order.zone_to?.type)
            const routeLink = getFullRouteLink(order)
            const pickupMapLink = order.gps_link || getMapSearchLink(order.pickup_address, order.zone_from?.name)
            const deliveryMapLink = getMapSearchLink(order.delivery_address, order.zone_to?.name)

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-md relative overflow-hidden">
                {order.status === 'en_cours' && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                )}
                <div className="flex flex-col gap-4 relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                          {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                        </span>
                        <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {estimatedTime}
                        </span>
                      </div>
                      <h3 className="text-slate-900 font-black text-sm leading-tight mb-1 truncate uppercase tracking-tight">{order.description}</h3>
                    </div>
                    <div className="font-display font-black text-orange-600 text-lg leading-none ml-3 bg-orange-50 px-3 py-2 rounded-xl">
                      {order.price.toLocaleString('fr-FR')} <span className="text-[10px]">F</span>
                    </div>
                  </div>

                  {/* FULL ROUTE BUTTON */}
                  <a
                    href={routeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-600"
                  >
                    <Route className="w-4 h-4" /> Ouvrir l&apos;itinéraire complet
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>

                  {/* ITINERARY DETAILS */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* Pickup */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full border-2 border-orange-500 inline-block"></span>
                        1. Ramassage
                      </p>
                      <p className="text-sm font-bold text-slate-800">{order.zone_from?.name}</p>
                      <p className="text-xs text-slate-700 font-medium">{order.pickup_address}</p>
                      {order.address_landmark && (
                        <p className="text-[10px] text-orange-600 font-bold mt-1 flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5" /> {order.address_landmark}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 mt-2">Client: {order.client?.full_name}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <a href={`tel:${order.client?.phone}`}
                          className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 hover:bg-slate-50 transition-colors">
                          <Phone className="w-3 h-3" /> Appeler
                        </a>
                        <a href={pickupMapLink} target="_blank" rel="noopener noreferrer"
                          className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 hover:bg-blue-100 transition-colors">
                          <MapPin className="w-3 h-3" /> {order.gps_link ? 'GPS' : 'Carte'}
                        </a>
                        <a href={getWhatsAppDirectLink(order.client?.phone || '', `Bonjour ${order.client?.full_name}, c'est votre livreur Nelal Express. Je suis en route pour récupérer le colis.`)}
                          target="_blank" rel="noopener noreferrer"
                          className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 hover:bg-green-100 transition-colors">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                        2. Livraison
                      </p>
                      <p className="text-sm font-bold text-slate-800">{order.zone_to?.name}</p>
                      <p className="text-xs text-slate-700 font-medium">{order.delivery_address}</p>
                      <p className="text-xs text-slate-600 mt-2">Destinataire: {order.recipient_name}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <a href={`tel:${order.recipient_phone}`}
                          className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 hover:bg-slate-50 transition-colors">
                          <Phone className="w-3 h-3" /> Appeler Dest.
                        </a>
                        <a href={deliveryMapLink} target="_blank" rel="noopener noreferrer"
                          className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 hover:bg-slate-200 transition-colors">
                          <MapPin className="w-3 h-3" /> Carte
                        </a>
                        <a href={getWhatsAppDirectLink(order.recipient_phone, `Bonjour ${order.recipient_name}, c'est le livreur Nelal Express. J'arrive avec votre colis.`)}
                          target="_blank" rel="noopener noreferrer"
                          className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 hover:bg-green-100 transition-colors">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Info */}
                  <div className="flex items-center gap-2">
                    <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Wallet className="w-2.5 h-2.5" />
                      {order.payment_method === 'wave' ? 'Wave' : order.payment_method === 'orange_money' ? 'Orange Money' : 'Cash à la livraison'}
                    </span>
                    {order.notes && (
                      <span className="bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Note
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                      <p className="text-[8px] font-black text-yellow-600 uppercase tracking-widest mb-1">Note du client</p>
                      <p className="text-xs text-yellow-800 font-medium">{order.notes}</p>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="pt-2">
                    {order.status === 'confirme' && (
                      <StatusUpdateButton
                        orderId={order.id}
                        nextStatus="en_cours"
                        note="Prise en charge"
                        label="J'ai récupéré le colis"
                        variant="pickup"
                      />
                    )}

                    {order.status === 'en_cours' && (
                      <DeliveryCompletionForm order={order} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* HISTORY */}
      {!!historique?.length && (
        <section className="px-2">
          <h2 className="font-display font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
            Récent ({historique.length})
          </h2>
          <div className="space-y-2">
            {historique.map((order: any) => (
              <div key={order.id} className={`bg-white rounded-xl border border-slate-100 p-3 flex items-center justify-between ${
                order.status === 'annule' ? 'opacity-50' : 'opacity-70'
              }`}>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-bold text-[10px] truncate uppercase">{order.description}</p>
                  <p className="text-[6px] font-black text-slate-400 uppercase tracking-tight">
                    {order.zone_from?.name} → {order.zone_to?.name}
                  </p>
                  <p className="text-[6px] font-bold text-slate-300 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-[10px] font-black text-slate-900">{order.price.toLocaleString('fr-FR')} F</div>
                  <span className={`text-[6px] font-black uppercase tracking-widest ${
                    ['livre', 'livre_partiel'].includes(order.status) ? 'text-green-500' : 'text-red-400'
                  }`}>
                    {['livre', 'livre_partiel'].includes(order.status) ? 'LIVRÉ' : 'ANNULÉ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
