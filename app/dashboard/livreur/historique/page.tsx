import { createClient, getProfile } from '@/utils/supabase/server'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import {
  Bike, CheckCircle, Wallet, ArrowLeft,
  MapPin, Clock, Package, Search,
  TrendingUp, Calendar, Camera
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function LivreurHistoryPage() {
  const supabase = await createClient()
  const profile = await getProfile()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      zone_from:zones!orders_zone_from_id_fkey(name),
      zone_to:zones!orders_zone_to_id_fkey(name)
    `)
    .eq('livreur_id', profile?.id)
    .in('status', ['livre', 'livre_partiel', 'annule'])
    .order('created_at', { ascending: false })

  // Stats calculation
  const deliveredOrders = orders?.filter(o => ['livre', 'livre_partiel'].includes(o.status)) || []
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + (o.price || 0), 0)
  const deliveredCount = deliveredOrders.length

  // Group by date
  const groupedOrders: Record<string, any[]> = {}
  orders?.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!groupedOrders[date]) groupedOrders[date] = []
    groupedOrders[date].push(order)
  })

  return (
    <div className="max-w-xl mx-auto pb-20 px-1">
      
      {/* HEADER */}
      <div className="px-4 pt-6 mb-8 flex items-center justify-between">
        <Link 
          href="/dashboard/livreur" 
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-black text-lg text-slate-900 uppercase tracking-tight">Mon Historique</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-8">
        <div className="bg-slate-900 rounded-[2rem] p-5 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-8 -mt-8"></div>
           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Gagné</p>
           <p className="text-2xl font-display font-black leading-none">{totalEarnings.toLocaleString('fr-FR')} <span className="text-[10px] opacity-40">F</span></p>
        </div>
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Livraisons</p>
           <p className="text-2xl font-display font-black text-slate-900 leading-none">{deliveredCount}</p>
        </div>
      </div>

      {/* SEARCH (UI ONLY FOR NOW) */}
      <div className="px-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une livraison..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* LIST GROUPED BY DATE */}
      <div className="px-2 space-y-10">
        {!orders?.length ? (
          <div className="bg-white rounded-[2rem] p-10 text-center border border-slate-100">
             <div className="text-3xl mb-4 opacity-20">📜</div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed text-center">
                Aucun historique disponible.<br/>Lancez-vous dans votre première mission !
             </p>
          </div>
        ) : (
          Object.entries(groupedOrders).map(([date, dayOrders]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-6 ml-3">
                 <Calendar className="w-3.5 h-3.5 text-slate-300" />
                 <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{date}</h2>
                 <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              <div className="space-y-4">
                {dayOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm group hover:border-orange-200 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-2">
                           <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                             {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                           </span>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-tight">{order.description}</h3>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-display font-black text-slate-900 leading-none">{order.price.toLocaleString('fr-FR')} <span className="text-[8px]">F</span></p>
                        {order.ardoise > 0 && (
                          <p className="text-[7px] font-black text-orange-500 uppercase tracking-widest mt-1">Ardoise: {order.ardoise}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[9px] text-slate-500 font-bold mb-4">
                       <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                          <span className="truncate">{order.zone_from?.name}</span>
                       </div>
                       <div className="w-4 h-px bg-slate-100 shrink-0"></div>
                       <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                          <span className="truncate">{order.zone_to?.name}</span>
                       </div>
                    </div>

                    {order.delivery_proof_url && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Camera className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Preuve photo enregistrée</span>
                         </div>
                         <a 
                          href={order.delivery_proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-slate-50 hover:bg-slate-100 text-slate-900 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors"
                         >
                            Voir
                         </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
