// app/dashboard/client/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/server'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS, type Order } from '@/lib/types'
import { cancelOrder } from '@/actions/orders'
import { Send, Wallet, Package, Bike, CheckCircle, Clock, User, Phone, Star, MessageCircle, ExternalLink } from 'lucide-react'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const profile = await getProfile()
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nelal-express.vercel.app'

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type),
      livreur:profiles!orders_livreur_id_fkey(full_name, phone)
    `)
    .eq('client_id', profile?.id)
    .order('created_at', { ascending: false })

  const stats = {
    total: orders?.length || 0,
    en_cours: orders?.filter(o => ['confirme', 'en_cours'].includes(o.status)).length || 0,
    livres: orders?.filter(o => o.status === 'livre').length || 0,
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 px-1">
      <div className="mb-8 flex items-end justify-between px-2">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight uppercase leading-none">Activité</h1>
          <div className="h-1 w-8 bg-orange-500 mt-3 rounded-full"></div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Compte Élite</p>
          <p className="text-slate-900 font-bold text-sm">{profile?.full_name}</p>
        </div>
      </div>

      {/* QUICK ACTIONS - Ultra Compact */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <Link
          href="/dashboard/client/nouvelle-commande"
          className="relative group overflow-hidden bg-slate-900 rounded-2xl p-4 min-h-[100px] flex flex-col justify-between shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10 shadow-inner">
            <Send className="w-4 h-4 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-display font-black text-xs uppercase leading-tight tracking-tight">Envoyer</h3>
            <p className="text-slate-400 text-[6px] font-bold uppercase tracking-widest mt-0.5">Nouveau Colis</p>
          </div>
        </Link>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between shadow-sm min-h-[100px]">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-slate-900 font-display font-black text-xs uppercase leading-tight tracking-tight">Solde</h3>
            <p className="text-slate-400 text-[6px] font-bold uppercase tracking-widest mt-0.5">0 FCFA</p>
          </div>
        </div>
      </div>

      {/* STATS - Slimmer */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {[
          { label: 'Total', value: stats.total, icon: <Package className="w-4 h-4 text-slate-700" /> },
          { label: 'En cours', value: stats.en_cours, icon: <Bike className="w-4 h-4 text-orange-600" /> },
          { label: 'Livrées', value: stats.livres, icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
        ].map((stat) => (
          <div key={stat.label} className="flex-shrink-0 min-w-[85px] bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-all group">
            <div className="mb-1.5 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <div className="font-display font-black text-lg text-slate-900 leading-none">{stat.value}</div>
            <div className="text-slate-400 text-[6px] font-black uppercase tracking-widest mt-1.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ACTIVE ORDERS - Slim Cards */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-display font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Mes commandes</h2>
        {stats.en_cours > 0 && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>}
      </div>

      {!orders?.length ? (
        <div className="bg-slate-50 rounded-[2rem] p-12 text-center border border-slate-100">
          <div className="text-3xl mb-4 opacity-20">📭</div>
          <h3 className="font-display font-black text-[9px] text-slate-400 uppercase tracking-widest">Aucun colis en route</h3>
          <Link href="/dashboard/client/nouvelle-commande" className="mt-4 inline-block bg-orange-500 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20">
            Créer ma première commande
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const steps = [
              { key: 'en_attente', label: 'Reçu', icon: <Clock className="w-4 h-4" /> },
              { key: 'confirme', label: 'Assigné', icon: <User className="w-4 h-4" /> },
              { key: 'en_cours', label: 'Route', icon: <Bike className="w-4 h-4" /> },
              { key: 'livre', label: 'Livré', icon: <CheckCircle className="w-4 h-4" /> },
            ]
            
            const currentStepIndex = steps.findIndex(s => s.key === order.status)
            const isCancelled = order.status === 'annule'

            return (
              <div key={order.id} className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-sm transition-all active:scale-[0.98] ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-slate-900 font-black text-xs mb-0.5 uppercase truncate tracking-tight">{order.description}</h3>
                    <div className="flex items-center gap-1 text-[7px] font-black text-slate-400 uppercase tracking-widest">
                      <span>{order.zone_from?.name}</span>
                      <span className="text-orange-500">→</span>
                      <span>{order.zone_to?.name}</span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="font-display font-black text-orange-600 text-sm leading-none">
                      {order.price.toLocaleString('fr-FR')} <span className="text-[8px]">F</span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 items-end">
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(`Suivez mon colis Nelal Express ici : ${BASE_URL}/suivi/${order.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[7px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 w-fit"
                      >
                        <MessageCircle className="w-2.5 h-2.5" /> Partager
                      </a>
                      <Link 
                        href={`/suivi/${order.id}`}
                        className="text-[7px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 w-fit"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Suivre
                      </Link>
                      {order.status === 'en_attente' && (
                        <form action={async () => {
                          'use server'
                          await cancelOrder(order.id)
                        }}>
                          <button type="submit" className="text-[7px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1.5 rounded-lg hover:bg-red-100 transition-colors w-fit">
                            Annuler
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>

                {/* COMPACT TRACKER */}
                {!isCancelled ? (
                  <div className="relative pt-1 pb-3">
                    <div className="absolute top-3.5 left-0 w-full h-0.5 bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="relative flex justify-between">
                      {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex
                        const isCurrent = idx === currentStepIndex
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] transition-all duration-500 z-10 ${
                              isCompleted 
                                ? 'bg-orange-500 text-white shadow-sm' 
                                : 'bg-white border border-slate-50 text-slate-200'
                            } ${isCurrent ? 'ring-2 ring-orange-500/10' : ''}`}>
                              {isCompleted ? '✓' : step.icon}
                            </div>
                            <span className={`mt-1.5 text-[5px] font-black uppercase tracking-widest ${
                              isCompleted ? 'text-slate-800' : 'text-slate-200'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-1.5 text-center bg-red-50 rounded-lg">
                    <span className="text-red-500 text-[7px] font-black uppercase tracking-widest">Annulée</span>
                  </div>
                )}

                {/* COURIER MINI CARD */}
                {order.livreur && order.status !== 'livre' && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 text-orange-500">
                        <Bike className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[5px] font-black uppercase tracking-widest text-slate-400">Coursier</p>
                        <p className="text-[9px] font-bold text-slate-800 truncate">{order.livreur.full_name}</p>
                      </div>
                    </div>
                    <a href={`tel:${order.livreur.phone}`} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm active:bg-orange-500 active:text-white transition-colors text-slate-600">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* RATING MINI */}
                {order.status === 'livre' && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">Noter la course</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="w-6 h-6 bg-slate-50 rounded-md text-slate-300 hover:text-orange-400 flex items-center justify-center transition-colors">
                          <Star className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
