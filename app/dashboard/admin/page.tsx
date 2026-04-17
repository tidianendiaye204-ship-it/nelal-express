// app/dashboard/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { assignLivreur } from '@/actions/orders'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import LiveAdminUpdater from '@/components/LiveAdminUpdater'
import { Package, Clock, Bike, CheckCircle, Wallet, MapPin, User, Zap, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. STATS (optimized queries)
  const [{ count: totalOrders }, { count: inProgressOrders }, { count: deliveredOrders }, { data: deliveredPrices }] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['confirme', 'en_cours']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['livre', 'livre_partiel']),
    supabase.from('orders').select('price').in('status', ['livre', 'livre_partiel'])
  ])

  const revenus = deliveredPrices?.reduce((sum, o) => sum + (o.price || 0), 0) || 0

  // 2. PENDING ORDERS (Needs assignments)
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type)
    `)
    .eq('status', 'en_attente')
    .order('created_at', { ascending: true }) // Oldest first for assignments

  const en_attente = pendingOrders?.length || 0

  // 3. RECENT ORDERS (limit 50 for the table)
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      livreur:profiles!orders_livreur_id_fkey(full_name, phone),
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // 4. LIVREURS (for assignment dropdown)
  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .eq('role', 'livreur')

  return (
    <div className="max-w-6xl mx-auto px-1 pb-24">
      <LiveAdminUpdater />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2 md:px-0">
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">Administration</h1>
          <div className="h-1 w-8 bg-slate-900 mt-2 rounded-full"></div>
          <p className="text-slate-500 text-xs font-bold mt-2 tracking-wide">Centre de contrôle Nelal Express</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline-block">Système Actif</span>
          </div>
        </div>
      </div>

      {/* HERO STATS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 mb-8 md:mb-12 px-2 md:px-0">
        {[
          { label: 'Total Envois', value: totalOrders || 0, icon: <Package className="w-5 h-5" />, color: 'bg-slate-900 text-white', border: 'border-slate-800' },
          { label: 'En attente', value: en_attente, icon: <Clock className="w-5 h-5" />, color: 'bg-amber-500 text-white', border: 'border-amber-500 shadow-lg shadow-amber-500/20' },
          { label: 'En cours', value: inProgressOrders || 0, icon: <Bike className="w-5 h-5" />, color: 'bg-blue-500 text-white', border: 'border-blue-500 shadow-lg shadow-blue-500/20' },
          { label: 'Livrées', value: deliveredOrders || 0, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-500 text-white', border: 'border-green-500 shadow-lg shadow-green-500/20' },
          { label: 'Livreurs', value: livreurs?.length || 0, icon: <Users className="w-5 h-5 text-purple-600" />, color: 'bg-purple-50 text-purple-700', border: 'border-purple-100' },
          { label: 'CA Global', value: `${revenus.toLocaleString('fr-FR')} FCFA`, icon: <Wallet className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100 col-span-2 md:col-span-1' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-[2rem] border ${stat.border} ${stat.color} p-5 transition-transform hover:-translate-y-1 duration-300`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${stat.color.includes('bg-slate-900') || stat.color.includes('bg-amber-500') || stat.color.includes('bg-blue-500') || stat.color.includes('bg-green-500') ? 'bg-white/20' : 'bg-white'} backdrop-blur-md`}>
              {stat.icon}
            </div>
            <div className="font-display font-black text-2xl leading-none tracking-tight">{stat.value}</div>
            <div className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* URGENT ASSIGNMENTS */}
      {en_attente > 0 && (
        <section className="mb-12 px-2 md:px-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-black text-xs text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              Action Requise — Assignations ({en_attente})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingOrders?.map((order: any) => (
              <div key={order.id} className="bg-white rounded-3xl border border-orange-100 p-6 shadow-xl shadow-orange-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                  {/* Info part */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        À assigner
                      </div>
                      <div className="font-display font-black text-orange-600 text-lg">
                        {order.price.toLocaleString('fr-FR')} <span className="text-[10px]">FCFA</span>
                      </div>
                    </div>
                    
                    <h3 className="text-slate-900 font-bold text-sm mb-4 leading-tight">
                      {order.description}
                    </h3>
                    
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 text-[11px] font-bold uppercase tracking-tight truncate border-b border-slate-50 pb-1 mb-1">
                            {order.zone_from?.name}
                          </p>
                          <p className="text-slate-800 text-[11px] font-bold uppercase tracking-tight truncate">
                            {order.zone_to?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 flex-shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-600 text-[11px] font-bold uppercase tracking-tight truncate">{order.client?.full_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions part */}
                  <div className="md:w-48 flex flex-col justify-end pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 hidden md:block">Assigner un livreur</p>
                    {livreurs && livreurs.length > 0 ? (
                      <form action={async (formData: FormData) => {
                        'use server'
                        const livreurId = formData.get('livreur_id') as string
                        if (livreurId) await assignLivreur(order.id, livreurId)
                      }} className="flex flex-col gap-2">
                        <select
                          name="livreur_id"
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                        >
                          <option value="">Sélectionner...</option>
                          {livreurs.map((l: any) => (
                            <option key={l.id} value={l.id}>🚴 {l.full_name}</option>
                          ))}
                        </select>
                        <button type="submit"
                          className="w-full bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2">
                          <Zap className="w-3.5 h-3.5" /> Assigner
                        </button>
                      </form>
                    ) : (
                      <div className="w-full text-center py-3 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100">
                        Aucun livreur disponible
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RECENT HISTORIC */}
      <section className="px-2 md:px-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-black text-xs text-slate-400 uppercase tracking-[0.2em]">Historique Récent (50 derniers)</h2>
        </div>

        {/* Desktop Table (Hidden on small screens) */}
        <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Colis</th>
                <th className="px-6 py-4">Trajet</th>
                <th className="px-6 py-4">Intervenants</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-slate-900 font-bold text-[11px] mb-1 line-clamp-2 max-w-[200px]">
                      {order.description}
                    </p>
                    <p className="text-[9px] font-black text-slate-400">
                      {new Date(order.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]">{order.zone_from?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full border border-slate-300"></span>
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]">{order.zone_to?.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-50 text-blue-500 rounded flex items-center justify-center"><User className="w-2.5 h-2.5" /></div>
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{order.client?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-50 text-orange-500 rounded flex items-center justify-center"><Bike className="w-2.5 h-2.5" /></div>
                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{order.livreur?.full_name || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                      </span>
                      {(order.ardoise_livreur || 0) > 0 && (
                        <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          ARDOISE : {order.ardoise_livreur}F
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-display font-black text-slate-900 text-sm">
                      {order.price.toLocaleString('fr-FR')} F
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List (Visible only on small screens) */}
        <div className="lg:hidden space-y-3">
          {recentOrders?.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                    {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                  </span>
                  {(order.ardoise_livreur || 0) > 0 && (
                    <span className="font-black text-red-500 text-[8px]">
                      ❗ARDOISE {order.ardoise_livreur}F
                    </span>
                  )}
                </div>
                <span className="font-display font-black text-slate-900 text-sm">
                  {order.price.toLocaleString('fr-FR')} F
                </span>
              </div>
              <h3 className="text-slate-800 font-bold text-xs mb-3 line-clamp-2">
                {order.description}
              </h3>
              <div className="flex items-center justify-between text-[10px] pt-3 border-t border-slate-50">
                <span className="text-slate-400 font-medium">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-slate-600 font-bold uppercase truncate max-w-[150px]">
                  {order.zone_from?.name} → {order.zone_to?.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
