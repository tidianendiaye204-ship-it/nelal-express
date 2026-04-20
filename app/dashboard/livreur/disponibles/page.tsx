// app/dashboard/livreur/disponibles/page.tsx
import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AcceptOrderButton from '@/components/AcceptOrderButton'
import LiveOrderUpdater from '@/components/LiveOrderUpdater'
import { getMapSearchLink, getEstimatedTime } from '@/lib/utils/maps'
import { MapPin, Navigation, Clock, Package, Wallet, ArrowDown } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DisponiblesPage() {
  const supabase = await createClient()
  const profile = await getProfile()

  if (!profile || profile.role !== 'livreur') redirect('/auth/login')

  const cashHeld = profile.cash_held || 0
  const maxLimit = profile.max_cash_limit || 25000
  const isBlocked = cashHeld >= maxLimit

  if (isBlocked) {
    return (
      <div className="max-w-2xl mx-auto pb-24 px-4 text-center py-20 flex flex-col items-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
          <Wallet className="w-10 h-10" />
        </div>
        <h1 className="font-display font-black text-2xl text-slate-900 uppercase tracking-tight mb-2">Compte Bloqué</h1>
        <p className="text-slate-500 text-sm max-w-xs mb-8">
          Vous avez accumulé <span className="text-red-600 font-bold">{cashHeld.toLocaleString('fr-FR')} F</span> de cash. 
          Veuillez reverser les fonds à l&apos;agence pour débloquer votre compte.
        </p>
        <Link href="/dashboard/livreur" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
          Retour au tableau de bord
        </Link>
      </div>
    )
  }

  // Fetch all available orders (en_attente, no livreur assigned)
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type)
    `)
    .eq('status', 'en_attente')
    .is('livreur_id', null)
    .order('created_at', { ascending: false })

  // Optionally prioritize orders in the livreur's zone
  const myZoneOrders = orders?.filter(o => o.zone_from_id === profile.zone_id) || []
  const otherOrders = orders?.filter(o => o.zone_from_id !== profile.zone_id) || []

  return (
    <div className="max-w-2xl mx-auto pb-24 px-1">
      {/* Real-time listener */}
      <LiveOrderUpdater showAll />

      <div className="mb-6 px-2">
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">
          Missions Disponibles
        </h1>
        <div className="h-1 w-6 bg-green-500 mt-2 rounded-full"></div>
        <p className="text-slate-500 text-xs mt-2">Acceptez une mission et gagnez de l&apos;argent</p>
      </div>

      {/* Live indicator */}
      <div className="mx-2 mb-6 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <p className="text-green-700 text-[10px] font-black uppercase tracking-widest">
          Mises à jour en temps réel · {(orders?.length || 0)} mission{(orders?.length || 0) > 1 ? 's' : ''} disponible{(orders?.length || 0) > 1 ? 's' : ''}
        </p>
      </div>

      {/* MY ZONE ORDERS (Priority) */}
      {myZoneOrders.length > 0 && (
        <section className="mb-8 px-2">
          <h2 className="font-display font-black text-[10px] text-orange-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            Dans votre zone ({myZoneOrders.length})
          </h2>
          <div className="space-y-4">
            {myZoneOrders.map((order: any) => (
              <OrderCard key={order.id} order={order} isPriority />
            ))}
          </div>
        </section>
      )}

      {/* OTHER ORDERS */}
      {otherOrders.length > 0 && (
        <section className="px-2">
          <h2 className="font-display font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
            {myZoneOrders.length > 0 ? 'Autres zones' : 'Toutes les missions'} ({otherOrders.length})
          </h2>
          <div className="space-y-4">
            {otherOrders.map((order: any) => (
              <OrderCard key={order.id} order={order} isPriority={false} />
            ))}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {!orders?.length && (
        <div className="mx-2 bg-slate-50 rounded-[1.5rem] p-10 text-center border border-slate-100">
          <div className="text-4xl mb-3 opacity-20">📭</div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
            Aucune mission disponible
          </p>
          <p className="text-slate-400 text-xs">
            Les nouvelles commandes apparaîtront ici automatiquement
          </p>
        </div>
      )}
    </div>
  )
}

// ── Order Card Component ──────────────────────────
function OrderCard({ order, isPriority }: { order: any; isPriority: boolean }) {
  const estimatedTime = getEstimatedTime(order.zone_from?.type, order.zone_to?.type)
  const pickupMapLink = order.gps_link || getMapSearchLink(order.pickup_address, order.zone_from?.name)
  const deliveryMapLink = getMapSearchLink(order.delivery_address, order.zone_to?.name)

  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-md transition-all relative overflow-hidden ${
      isPriority ? 'border-orange-200 shadow-orange-500/5' : 'border-slate-200'
    }`}>
      {isPriority && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {isPriority && (
                <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">
                  Votre zone
                </span>
              )}
              <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> {estimatedTime}
              </span>
            </div>
            <h3 className="text-slate-900 font-black text-sm leading-tight break-words uppercase tracking-tight">
              {order.description}
            </h3>
            <p className="text-slate-400 text-[8px] font-bold mt-1">
              {new Date(order.created_at).toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display font-black text-orange-600 text-xl leading-none bg-orange-50 px-3 py-2.5 rounded-xl flex flex-col items-end">
              <span className="leading-none">{order.price.toLocaleString('fr-FR')}</span>
              <span className="text-[8px] font-black uppercase tracking-tighter mt-1 opacity-60">FCFA</span>
            </div>
          </div>
        </div>

        {/* Route Visualization */}
        <div className="space-y-1 mb-4">
          {/* Pickup */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <span className="w-3 h-3 rounded-full border-2 border-orange-500 bg-white flex-shrink-0"></span>
                <div className="w-0.5 h-8 bg-orange-200 mt-1"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ramassage</p>
                <p className="text-sm font-bold text-slate-800">{order.zone_from?.name}</p>
                <p className="text-xs text-slate-600 font-medium truncate">{order.pickup_address}</p>
                {order.address_landmark && (
                  <p className="text-[10px] text-orange-600 font-bold mt-1 flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5" /> {order.address_landmark}
                  </p>
                )}
              </div>
              <a
                href={pickupMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <MapPin className="w-3 h-3" /> Carte
              </a>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center py-0.5">
            <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
          </div>

          {/* Delivery */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Livraison</p>
                <p className="text-sm font-bold text-slate-800">{order.zone_to?.name}</p>
                <p className="text-xs text-slate-600 font-medium truncate">{order.delivery_address}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Destinataire: <span className="font-bold text-slate-700">{order.recipient_name}</span>
                </p>
              </div>
              <a
                href={deliveryMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-200 transition-colors"
              >
                <MapPin className="w-3 h-3" /> Carte
              </a>
            </div>
          </div>
        </div>

        {/* Payment & Type info */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
            <Wallet className="w-2.5 h-2.5" />
            {order.payment_method === 'wave' ? 'Wave' : order.payment_method === 'orange_money' ? 'Orange Money' : 'Cash'}
          </span>
          <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
            <Package className="w-2.5 h-2.5" />
            {order.type === 'particulier' ? 'Particulier' : 'Vendeur'}
          </span>
        </div>

        {/* Accept Button */}
        <AcceptOrderButton orderId={order.id} />
      </div>
    </div>
  )
}
