import { createClient, getProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, TrendingUp, 
  Calendar, Clock, CheckCircle2, 
  ArrowUpRight, Coins, History
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LivreurPortefeuillePage() {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || (profile.role !== 'livreur' && profile.role !== 'agent')) redirect('/auth/login')

  // 1. Récupérer l'historique complet des livraisons réussies
  const { data: deliveredOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('livreur_id', profile.id)
    .in('status', ['livre', 'livre_partiel'])
    .order('created_at', { ascending: false })

  // 2. Calculs des gains
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  
  // Début de semaine (Lundi)
  const firstDayOfWeek = new Date(now)
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  firstDayOfWeek.setDate(diff)
  const weekStr = firstDayOfWeek.toISOString().split('T')[0]

  const stats = {
    today: deliveredOrders?.filter(o => o.created_at.startsWith(todayStr)).reduce((sum, o) => sum + (o.price || 0), 0) || 0,
    week: deliveredOrders?.filter(o => o.created_at >= weekStr).reduce((sum, o) => sum + (o.price || 0), 0) || 0,
    total: deliveredOrders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0,
    count: deliveredOrders?.length || 0,
    cashHeld: profile.cash_held || 0,
    maxLimit: profile.max_cash_limit || 25000
  }

  const isOverLimit = stats.cashHeld >= stats.maxLimit

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 pt-8">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/livreur" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase">Mon Portefeuille</h1>
          <p className="text-slate-500 text-sm italic">Suivi de vos gains et encaissements</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* CASH HELD CARD */}
        <div className={`p-8 rounded-[2.5rem] border flex flex-col gap-6 shadow-xl transition-all ${
          isOverLimit 
            ? 'bg-red-600 border-red-500 text-white shadow-red-500/20' 
            : 'bg-slate-900 border-slate-800 text-white shadow-slate-900/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-orange-400" />
            </div>
            {isOverLimit && (
              <span className="bg-white text-red-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Seuil Atteint</span>
            )}
          </div>
          <div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Argent liquide en main</p>
            <p className="text-4xl font-display font-black leading-none">
              {stats.cashHeld.toLocaleString('fr-FR')} <span className="text-sm font-normal opacity-60">F</span>
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
              <span>Limite autorisée</span>
              <span>{stats.maxLimit.toLocaleString('fr-FR')} F</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${isOverLimit ? 'bg-white' : 'bg-orange-500'}`}
                style={{ width: `${Math.min(100, (stats.cashHeld / stats.maxLimit) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* EARNINGS SUMMARY */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display font-black text-sm text-slate-900 uppercase">Résumé des Gains</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Aujourd&apos;hui</p>
                <p className="text-xl font-display font-black text-slate-900 leading-none">{stats.today.toLocaleString('fr-FR')} F</p>
              </div>
              <Calendar className="w-5 h-5 text-slate-200" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cette Semaine</p>
                <p className="text-xl font-display font-black text-slate-900 leading-none">{stats.week.toLocaleString('fr-FR')} F</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-200" />
            </div>
          </div>
        </div>
      </div>

      {/* RECENT HISTORY */}
      <section>
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            <History className="w-4 h-4" />
          </div>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historique de Livraison</h2>
        </div>

        <div className="space-y-3">
          {!deliveredOrders?.length ? (
            <div className="bg-slate-50 border border-slate-100 border-dashed rounded-3xl py-12 text-center">
              <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucune livraison enregistrée</p>
            </div>
          ) : (
            deliveredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-xs tracking-tight">{order.description}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-display font-black text-slate-900 leading-none">+{order.price.toLocaleString('fr-FR')} F</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Reçu</span>
                    <ArrowUpRight className="w-2.5 h-2.5 text-green-500" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
