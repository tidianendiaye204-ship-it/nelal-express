// app/dashboard/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { assignLivreur, updateOrderStatus } from '@/actions/orders'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import { Package, Clock, Bike, CheckCircle, Wallet, MapPin, User } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      livreur:profiles!orders_livreur_id_fkey(full_name, phone),
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type)
    `)
    .order('created_at', { ascending: false })

  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .eq('role', 'livreur')

  const stats = {
    total: orders?.length || 0,
    en_attente: orders?.filter(o => o.status === 'en_attente').length || 0,
    en_cours: orders?.filter(o => ['confirme', 'en_cours'].includes(o.status)).length || 0,
    livres: orders?.filter(o => o.status === 'livre').length || 0,
    revenus: orders?.filter(o => o.status === 'livre').reduce((sum: number, o: any) => sum + o.price, 0) || 0,
  }

  return (
    <div className="max-w-6xl mx-auto px-2 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">Admin</h1>
          <div className="h-1 w-6 bg-orange-500 mt-2 rounded-full"></div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live System</span>
          </div>
        </div>
      </div>

      {/* STATS - Compact Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-10">
        {[
          { label: 'Total', value: stats.total, icon: <Package className="w-5 h-5" />, color: 'bg-slate-50 text-slate-900', border: 'border-slate-100' },
          { label: 'En attente', value: stats.en_attente, icon: <Clock className="w-5 h-5" />, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
          { label: 'En cours', value: stats.en_cours, icon: <Bike className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { label: 'Livrées', value: stats.livres, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
          { label: 'Revenus', value: `${stats.revenus.toLocaleString('fr-FR')} F`, icon: <Wallet className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border ${stat.border} p-4 shadow-sm hover:shadow-md transition-all group`}>
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div className="font-display font-black text-lg text-slate-900 leading-none">{stat.value}</div>
            <div className="text-slate-400 text-[6px] font-black uppercase tracking-widest mt-1.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* COMMANDES EN ATTENTE */}
      {stats.en_attente > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-black text-[10px] text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Besoin d'un livreur ({stats.en_attente})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {orders?.filter(o => o.status === 'en_attente').map((order: any) => (
              <div key={order.id} className="bg-white border border-orange-100 rounded-2xl p-5 shadow-lg shadow-orange-500/5 hover:border-orange-200 transition-all">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">
                      URGENT
                    </div>
                    <div className="font-display font-black text-orange-600 text-sm leading-none">
                      {order.price.toLocaleString('fr-FR')} <span className="text-[8px]">F</span>
                    </div>
                  </div>

                  <h3 className="text-slate-800 font-black text-xs mb-3 line-clamp-2 uppercase tracking-tight">
                    {order.description}
                  </h3>

                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-[9px]">
                      <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 font-bold truncate uppercase tracking-tight">{order.zone_from?.name} → {order.zone_to?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
                        <User className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 font-bold truncate uppercase tracking-tight">{order.client?.full_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-50">
                    {livreurs && livreurs.length > 0 ? (
                      <form action={async (formData: FormData) => {
                        'use server'
                        const livreurId = formData.get('livreur_id') as string
                        if (livreurId) await assignLivreur(order.id, livreurId)
                      }} className="flex gap-2">
                        <select
                          name="livreur_id"
                          required
                          className="flex-1 bg-slate-50 border border-slate-100 text-slate-700 rounded-lg px-3 py-1.5 text-[10px] font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all appearance-none uppercase"
                        >
                          <option value="">Livreur...</option>
                          {livreurs.map((l: any) => (
                            <option key={l.id} value={l.id}>{l.full_name}</option>
                          ))}
                        </select>
                        <button type="submit"
                          className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all shadow-md shadow-orange-500/10 active:scale-95">
                          Assigner
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-1.5 bg-slate-50 rounded-lg text-slate-400 text-[8px] font-black uppercase tracking-widest">
                        Aucun livreur
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TOUTES LES COMMANDES */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] ml-1">Historique Global</h2>
          <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full">
            {orders?.length || 0} colis
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Colis</th>
                  <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Itinéraire</th>
                  <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Acteurs</th>
                  <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                  <th className="px-4 py-3 text-right text-[8px] font-black text-slate-400 uppercase tracking-widest">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="text-slate-800 font-bold text-[10px] mb-0.5 uppercase truncate max-w-[120px]">
                        {order.description}
                      </p>
                      <p className="text-[6px] font-black text-slate-400 uppercase tracking-tight">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[9px] font-bold text-slate-600 truncate max-w-[80px]">{order.zone_from?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full border border-slate-300"></span>
                          <span className="text-[9px] font-bold text-slate-600 truncate max-w-[80px]">{order.zone_to?.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 bg-blue-50 rounded-md flex items-center justify-center text-blue-500">
                            <User className="w-2.5 h-2.5" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 truncate max-w-[80px]">{order.client?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 bg-orange-50 rounded-md flex items-center justify-center text-orange-500">
                            <Bike className="w-2.5 h-2.5" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 truncate max-w-[80px]">{order.livreur?.full_name || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-display font-black text-slate-900 text-xs">
                        {order.price.toLocaleString('fr-FR')} F
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
