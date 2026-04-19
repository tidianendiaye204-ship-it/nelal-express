import { createClient, getProfile } from '@/utils/supabase/server'
import LiveOrderUpdater from '@/components/LiveOrderUpdater'
import StatusUpdateButton from '@/components/StatusUpdateButton'
import DeliveryCompletionForm from '@/components/DeliveryCompletionForm'
import { getWhatsAppDirectLink } from '@/lib/utils/phone'
import { getFullRouteLink, getMapSearchLink, getEstimatedTime } from '@/lib/utils/maps'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import {
  Bike, CheckCircle, Wallet, Phone, MessageCircle,
  MapPin, Navigation, Clock, Package,
  ChevronRight, TrendingUp, Award, Map, Zap
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

  const totalEarnings = allOrders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0
  const totalCount = allOrders?.length || 0

  const { count: availableCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'en_attente')
    .is('livreur_id', null)

  return (
    <div className="max-w-xl mx-auto pb-24 px-1">
      <LiveOrderUpdater livreurId={profile?.id} />

      {/* HEADER : GREETING & DAILY STATS */}
      <div className="px-3 pt-4 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Performance Journée</p>
            <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight leading-none uppercase">
              Tableau de Bord
            </h1>
          </div>
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
            <Bike className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2rem] p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
            <TrendingUp className="w-5 h-5 mb-3 opacity-60" />
            <p className="text-3xl font-display font-black leading-none mb-1">
              {todayEarnings.toLocaleString('fr-FR')} <span className="text-sm font-normal opacity-60">F</span>
            </p>
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Gains du jour</p>
              <p className="text-[7px] font-bold opacity-40">Total: {totalEarnings.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
            <Award className="w-5 h-5 mb-3 text-orange-500" />
            <div>
              <p className="text-2xl font-display font-black text-slate-900 leading-none mb-1">
                {todayCount}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Courses finies</p>
                <p className="text-[7px] font-bold text-slate-300">Total: {totalCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MISSIONS DISPONIBLES BADGE */}
      {(availableCount || 0) > 0 && (
        <Link
          href="/dashboard/livreur/disponibles"
          className="mx-3 mb-8 flex items-center justify-between bg-green-500 text-white p-5 rounded-[2rem] shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-black text-sm uppercase tracking-tight">
                {(availableCount || 0)} mission{(availableCount || 0) > 1 ? 's' : ''} en attente
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-80 animate-pulse">
                Touchez pour accepter →
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 relative z-10" />
        </Link>
      )}

      {/* ACTIVE MISSIONS FOCUS */}
      <div className="px-3 mb-4 flex items-center gap-2">
         <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
         <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Prioritaire</h2>
      </div>

      {!orders?.length ? (
        <div className="mx-3 bg-slate-50 border border-slate-100 border-dashed rounded-[2.5rem] py-16 text-center">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <Package className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-black text-xs uppercase tracking-tight mb-2">Aucune mission en cours</h3>
            <p className="text-slate-400 text-[10px] max-w-[200px] mx-auto mb-6">Allez dans l&apos;onglet disponibles pour trouver du travail !</p>
            <Link 
              href="/dashboard/livreur/disponibles"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
             >
                Chercher des missions
            </Link>
        </div>
      ) : (
        <div className="space-y-6 px-2 mb-10">
          {orders.map((order: any) => {
            const estimatedTime = getEstimatedTime(order.zone_from?.type, order.zone_to?.type)
            const pickupMapLink = order.gps_link || getMapSearchLink(order.pickup_address, order.zone_from?.name)
            const deliveryMapLink = getMapSearchLink(order.delivery_address, order.zone_to?.name)
            const isPickupDone = order.status === 'en_cours'

            return (
              <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden outline outline-4 outline-transparent hover:outline-orange-500/5 transition-all">
                {/* Status Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                   <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                     {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                   </div>
                   <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                     <Clock className="w-3 h-3" /> {estimatedTime}
                   </div>
                </div>

                <div className="p-6">
                   <div className="flex items-start justify-between mb-6">
                     <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight leading-tight flex-1 mr-4">
                       {order.description}
                     </h3>
                     <div className="text-right">
                        <p className="text-2xl font-display font-black text-orange-600 leading-none">
                          {order.price.toLocaleString('fr-FR')} <span className="text-[10px]">F</span>
                        </p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {order.payment_method === 'cash' ? 'Cash' : 'Digital'}
                        </p>
                     </div>
                   </div>

                   {/* PROGRESS STEPPER */}
                   <div className="flex items-center gap-2 mb-8 px-2 relative">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                      <div className="flex-1 flex flex-col items-center gap-2 relative z-10">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${isPickupDone ? 'bg-green-500 border-white text-white shadow-lg shadow-green-500/20' : 'bg-orange-500 border-white text-white shadow-lg shadow-orange-500/20'}`}>
                           {isPickupDone ? <CheckCircle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                         </div>
                         <span className="text-[7px] font-black uppercase tracking-tight text-slate-400">Ramassage</span>
                      </div>
                      <div className={`flex-1 flex flex-col items-center gap-2 relative z-10 ${!isPickupDone ? 'opacity-30' : ''}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${isPickupDone ? 'bg-orange-500 border-white text-white' : 'bg-white border-slate-100 text-slate-300'}`}>
                           <MapPin className="w-4 h-4" />
                         </div>
                         <span className="text-[7px] font-black uppercase tracking-tight text-slate-400">Livraison</span>
                      </div>
                   </div>

                   {/* LOCATION CARDS */}
                   <div className="space-y-4 mb-8">
                     {/* Step Location */}
                     <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 relative group">
                        <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           {isPickupDone ? <MapPin className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                           {isPickupDone ? 'Destination de Livraison' : 'Lieu de Ramassage'}
                        </p>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">
                          {isPickupDone ? order.zone_to?.name : order.zone_from?.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                          {isPickupDone ? order.delivery_address : order.pickup_address}
                        </p>
                        
                        {/* Action Bar */}
                        <div className="flex gap-2">
                          <a 
                            href={isPickupDone ? deliveryMapLink : pickupMapLink}
                            target="_blank" rel="noopener noreferrer"
                            className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 flex-1 justify-center active:scale-95 transition-transform"
                          >
                            <Map className="w-4 h-4 text-orange-500" /> Itinéraire
                          </a>
                          <a 
                            href={`tel:${isPickupDone ? order.recipient_phone : order.client?.phone}`}
                            className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 flex-1 justify-center active:scale-95 transition-transform"
                          >
                            <Phone className="w-4 h-4 text-blue-500" /> Appeler
                          </a>
                        </div>
                     </div>
                   </div>

                   {/* DYNAMIC ACTION BUTTON */}
                   <div className="pt-2">
                      {order.status === 'confirme' ? (
                        <div className="animate-in slide-in-from-bottom-4">
                           <StatusUpdateButton
                            orderId={order.id}
                            nextStatus="en_cours"
                            note="Prise en charge effectuée"
                            label="J'AI RÉCUPÉRÉ LE COLIS"
                            variant="pickup"
                          />
                        </div>
                      ) : (
                        <div className="animate-in zoom-in-95">
                           <DeliveryCompletionForm order={order} />
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* RECENT HISTORY LINK */}
      <div className="px-3">
        <Link 
          href="/dashboard/livreur/historique" 
          className="flex items-center justify-between bg-white border border-slate-100 p-5 rounded-[2rem] text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
              <Clock className="w-5 h-5 opacity-60" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Historique récent</span>
          </div>
          <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
