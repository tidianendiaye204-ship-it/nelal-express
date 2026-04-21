import { createClient, getProfile } from '@/utils/supabase/server'
import LiveOrderUpdater from '@/components/LiveOrderUpdater'
import ClientLocationSync from '@/components/ClientLocationSync'
import StatusUpdateButton from '@/components/StatusUpdateButton'
import DeliveryCompletionForm from '@/components/DeliveryCompletionForm'
import { getMapSearchLink, getEstimatedTime } from '@/lib/utils/maps'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import {
  MapPin, Clock, Package,
  ChevronRight, TrendingUp, Award, Map, Zap
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LivreurDashboard() {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'livreur') {
    redirect('/auth/login')
  }

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

  // Stats du jour (livraisons réussies aujourd'hui)
  const today = new Date().toISOString().split('T')[0]
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('price, status')
    .eq('livreur_id', profile?.id)
    .gte('created_at', today)
    .in('status', ['livre', 'livre_partiel'])

  const todayEarnings = todayOrders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0
  const todayCount = todayOrders?.length || 0

  // Stats Globales (Total)
  const { data: allOrders } = await supabase
    .from('orders')
    .select('price, status')
    .eq('livreur_id', profile?.id)
    .in('status', ['livre', 'livre_partiel'])

  const { count: availableCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'en_attente')
    .is('livreur_id', null)

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4">
      <LiveOrderUpdater livreurId={profile?.id} />
      <ClientLocationSync livreurId={profile?.id || ''} hasActiveOrders={(orders?.length || 0) > 0} />
      
      <div className="grid lg:grid-cols-3 gap-8 pt-4">
        {/* LEFT COLUMN: ACTIVE MISSIONS */}
        <div className="lg:col-span-2 space-y-8">
          {/* ACTIVE MISSIONS FOCUS */}
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {(orders?.length || 0) > 1 ? `Batch en cours (${orders?.length})` : 'Mission Prioritaire'}
                </h2>
             </div>
             {(orders?.length || 0) > 1 && (
                <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-slate-700">
                   Optimisation Batch Multi-Colis
                </div>
             )}
          </div>

          {!orders?.length ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[3rem] py-24 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                  <Package className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-slate-900 font-black text-base uppercase tracking-tight mb-2 italic">Prêt pour une mission ?</h3>
                <p className="text-slate-400 text-xs max-w-[250px] mx-auto mb-8 font-medium">Consultez la liste des colis en attente pour commencer à gagner de l&apos;argent.</p>
                <Link 
                  href="/dashboard/livreur/disponibles"
                  className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-transform"
                 >
                    <Zap className="w-4 h-4 text-orange-500" /> Voir les missions
                </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order: any) => {
                const estimatedTime = getEstimatedTime(order.zone_from?.type, order.zone_to?.type)
                const pickupMapLink = order.gps_link || getMapSearchLink(order.pickup_address, order.zone_from?.name)
                const deliveryMapLink = getMapSearchLink(order.delivery_address, order.zone_to?.name)
                const isPickupDone = order.status === 'en_cours'

                return (
                  <div key={order.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/30 overflow-hidden group">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                         {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                       </div>
                       <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                         <Clock className="w-3.5 h-3.5" /> {estimatedTime}
                       </div>
                    </div>

                    <div className="p-8">
                       <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                         <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Colis à livrer</p>
                            <h3 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight leading-tight">
                              {order.description}
                            </h3>
                         </div>
                         <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shrink-0">
                            <div className="flex items-baseline justify-end gap-1 text-orange-600">
                              <span className="text-3xl font-display font-black leading-none">
                                {order.price.toLocaleString('fr-FR')}
                              </span>
                              <span className="text-sm font-black italic">F</span>
                            </div>
                            <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1 text-right">
                              {order.payment_method === 'cash' ? '💵 Espèces' : '💳 Digital'}
                            </p>
                         </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6 mb-8">
                         <div className={`rounded-3xl p-6 border transition-all ${!isPickupDone ? 'bg-orange-50 border-orange-200 shadow-lg shadow-orange-500/10' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <Package className="w-4 h-4" /> Ramassage
                            </p>
                            <p className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">{order.zone_from?.name}</p>
                            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">{order.pickup_address}</p>
                            <div className="flex gap-2">
                              <a href={pickupMapLink} target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 flex-1 justify-center active:scale-95 transition-transform"><Map className="w-4 h-4 text-orange-500" /> GPS</a>
                              <a href={`tel:${order.client?.phone}`} className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 flex-1 justify-center active:scale-95 transition-transform"><Phone className="w-4 h-4 text-blue-500" /> Appel</a>
                            </div>
                         </div>

                         <div className={`rounded-3xl p-6 border transition-all ${isPickupDone ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/10' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <MapPin className="w-4 h-4" /> Livraison
                            </p>
                            <p className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">{order.zone_to?.name}</p>
                            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">{order.delivery_address}</p>
                            <div className="flex gap-2">
                              <a href={deliveryMapLink} target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 flex-1 justify-center active:scale-95 transition-transform"><Map className="w-4 h-4 text-orange-500" /> GPS</a>
                              <a href={`tel:${order.recipient_phone}`} className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 flex-1 justify-center active:scale-95 transition-transform"><Phone className="w-4 h-4 text-blue-500" /> Appel</a>
                            </div>
                         </div>
                       </div>

                       <div className="pt-4">
                          {order.status === 'confirme' ? (
                             <StatusUpdateButton orderId={order.id} nextStatus="en_cours" note="Prise en charge effectuée" label="DÉBUTER LA LIVRAISON (COLIS RÉCUPÉRÉ)" variant="pickup" />
                          ) : (
                             <DeliveryCompletionForm order={order} />
                          )}
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: WALLET, PERFORMANCE & HISTORY */}
        <div className="space-y-6">
          {/* WALLET STATUS */}
          {(profile?.cash_held || 0) > 0 && (
            <div className={`p-8 rounded-[2.5rem] border flex flex-col gap-6 shadow-xl ${
              (profile.cash_held || 0) >= (profile.max_cash_limit || 25000)
                ? 'bg-red-600 border-red-500 text-white shadow-red-500/20'
                : 'bg-white border-slate-100 shadow-slate-200/40'
            }`}>
              <div className="flex items-center justify-between">
                <Wallet className={`w-10 h-10 opacity-40 ${profile.cash_held >= (profile.max_cash_limit || 25000) ? 'text-white' : 'text-slate-900'}`} />
                {(profile.cash_held || 0) >= (profile.max_cash_limit || 25000) && (
                  <span className="bg-white text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">BLOQUÉ</span>
                )}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${profile.cash_held >= (profile.max_cash_limit || 25000) ? 'text-white/60' : 'text-slate-400'}`}>Fonds encaissés</p>
                <p className={`text-4xl font-display font-black leading-none ${profile.cash_held >= (profile.max_cash_limit || 25000) ? 'text-white' : 'text-slate-900'}`}>
                  {profile.cash_held.toLocaleString('fr-FR')} <span className="text-sm font-normal">F</span>
                </p>
              </div>
              <p className={`text-[10px] font-medium leading-relaxed ${profile.cash_held >= (profile.max_cash_limit || 25000) ? 'text-white/80' : 'text-slate-500'}`}>
                {(profile.cash_held || 0) >= (profile.max_cash_limit || 25000) 
                  ? 'Versez vos fonds par Wave pour débloquer votre compte.' 
                  : 'N&apos;oubliez pas de verser vos fonds régulièrement.'}
              </p>
            </div>
          )}

          {/* PERFORMANCE JOURNÉE */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Performance Journée</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl">
                <TrendingUp className="w-5 h-5 mb-4 text-orange-500" />
                <p className="text-2xl font-display font-black text-slate-900 leading-none mb-1">{todayEarnings.toLocaleString('fr-FR')} F</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Gains</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl">
                <Award className="w-5 h-5 mb-4 text-blue-500" />
                <p className="text-2xl font-display font-black text-slate-900 leading-none mb-1">{todayCount}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Courses</p>
              </div>
            </div>
          </section>

          {/* MISSIONS DISPONIBLES BADGE */}
          {(availableCount || 0) > 0 && (
            <Link
              href="/dashboard/livreur/disponibles"
              className="block group bg-green-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
              <Zap className="w-10 h-10 mb-6 opacity-30" />
              <p className="font-display font-black text-lg uppercase tracking-tight mb-1">
                {(availableCount || 0)} missions dispo
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
                Prendre une mission <ChevronRight className="w-4 h-4" />
              </p>
            </Link>
          )}

          {/* HISTORY LINK */}
          <Link 
            href="/dashboard/livreur/historique" 
            className="flex items-center justify-between bg-slate-900 p-8 rounded-[2.5rem] text-white hover:bg-slate-800 transition-colors group shadow-xl shadow-slate-900/20"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">Historique Complet</span>
            </div>
            <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
