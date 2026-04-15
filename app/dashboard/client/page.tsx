// app/dashboard/client/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/server'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS, type Order } from '@/lib/types'
import { cancelOrder } from '@/actions/orders'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const profile = await getProfile()

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
    <div className="max-w-2xl mx-auto pb-24">
      <div className="mb-12 flex items-end justify-between px-2">
        <div>
          <h1 className="font-display font-black text-5xl text-slate-900 tracking-tighter uppercase leading-none">Activité</h1>
          <div className="h-1.5 w-12 bg-orange-500 mt-4 rounded-full"></div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Votre compte Élite</p>
          <p className="text-slate-900 font-bold text-lg">{profile?.full_name}</p>
        </div>
      </div>

      {/* QUICK ACTIONS - Premium Design */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <Link
          href="/dashboard/client/nouvelle-commande"
          className="relative group overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 min-h-[180px] flex flex-col justify-between shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-[40px] -mr-16 -mt-16"></div>
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">🚀</div>
          <div className="relative z-10">
            <h3 className="text-white font-display font-black text-lg uppercase leading-tight">Envoyer</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Nouveau Colis</p>
          </div>
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-between shadow-sm">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl text-orange-500">💳</div>
          <div>
            <h3 className="text-slate-900 font-display font-black text-lg uppercase leading-tight">Portefeuille</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Solde: 0 F</p>
          </div>
        </div>
      </div>

      {/* STATS - Glassmorphism */}
      <div className="grid grid-cols-3 gap-3 mb-12 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {[
          { label: 'Total', value: stats.total, icon: '📦' },
          { label: 'En cours', value: stats.en_cours, icon: '🚴' },
          { label: 'Livrées', value: stats.livres, icon: '✅' },
        ].map((stat) => (
          <div key={stat.label} className="flex-shrink-0 min-w-[120px] bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="text-xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <div className="font-display font-black text-2xl text-slate-900 leading-none">{stat.value}</div>
            <div className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mt-3">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ACTIVE ORDERS - With Live Tracker */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="font-display font-black text-sm text-slate-400 uppercase tracking-[0.2em]">Suivi en direct</h2>
        {stats.en_cours > 0 && <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>}
      </div>

      {!orders?.length ? (
        <div className="bg-slate-50 rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-6 opacity-30">📭</div>
          <h3 className="font-display font-black text-sm text-slate-400 mb-2 uppercase tracking-widest">Aucune commande active</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => {
            const steps = [
              { key: 'en_attente', label: 'Enregistré', icon: '📝' },
              { key: 'confirme', label: 'Assigné', icon: '👤' },
              { key: 'en_cours', label: 'En route', icon: '🚴' },
              { key: 'livre', label: 'Livré', icon: '✨' },
            ]
            
            const currentStepIndex = steps.findIndex(s => s.key === order.status)
            const isCancelled = order.status === 'annule'

            return (
              <div key={order.id} className={`bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 ${isCancelled ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-slate-900 font-black text-xl mb-1 uppercase tracking-tight">{order.description}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>{order.zone_from?.name}</span>
                      <span className="text-orange-500">→</span>
                      <span>{order.zone_to?.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-black text-orange-600 text-2xl leading-none">
                      {order.price.toLocaleString('fr-FR')} <span className="text-xs">F</span>
                    </div>
                    <div className="mt-2 inline-flex px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest">
                      {order.payment_method}
                    </div>
                  </div>
                </div>

                {/* PROGRESS TRACKER */}
                {!isCancelled ? (
                  <div className="relative pt-2 pb-8">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="relative flex justify-between">
                      {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex
                        const isCurrent = idx === currentStepIndex
                        return (
                          <div key={step.key} className="flex flex-col items-center group">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm transition-all duration-500 z-10 ${
                              isCompleted 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                : 'bg-white border-2 border-slate-100 text-slate-300'
                            } ${isCurrent ? 'scale-125 ring-4 ring-orange-500/10' : ''}`}>
                              {isCompleted ? '✓' : step.icon}
                            </div>
                            <span className={`absolute -bottom-6 whitespace-nowrap text-[8px] font-black uppercase tracking-widest transition-all ${
                              isCompleted ? 'text-slate-900' : 'text-slate-300'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center bg-red-50 rounded-2xl">
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Commande Annulée</span>
                  </div>
                )}

                {/* COURIER INFO & RATING - If assigned */}
                {order.livreur && order.status !== 'livre' && (
                  <div className="mt-12 p-4 bg-slate-50 rounded-[1.5rem] flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">🚴</div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Votre Coursier</p>
                        <p className="text-sm font-bold text-slate-800">{order.livreur.full_name}</p>
                      </div>
                    </div>
                    <a href={`tel:${order.livreur.phone}`} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:bg-orange-500 hover:text-white transition-all">📞</a>
                  </div>
                )}

                {/* RATING UI - Only for delivered orders */}
                {order.status === 'livre' && (
                  <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Notez votre expérience</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="w-10 h-10 bg-slate-50 rounded-xl hover:bg-orange-50 text-slate-300 hover:text-orange-500 transition-all text-xl">
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                {order.status === 'en_attente' && (
                  <div className="mt-8 pt-8 border-t border-slate-50">
                    <form action={async () => {
                      'use server'
                      await cancelOrder(order.id)
                    }}>
                      <button
                        type="submit"
                        className="w-full py-4 text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-colors"
                      >
                        Annuler la commande
                      </button>
                    </form>
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
