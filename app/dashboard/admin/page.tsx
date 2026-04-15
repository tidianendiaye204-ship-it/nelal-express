// app/dashboard/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { assignLivreur, updateOrderStatus } from '@/actions/orders'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'

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
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight uppercase">Tableau de Bord</h1>
          <p className="text-slate-500 text-base mt-1">Gestion centrale de Nelal Express 🚀</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live System</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {[
          { label: 'Total', value: stats.total, emoji: '📦', color: 'bg-slate-50 text-slate-900', border: 'border-slate-100' },
          { label: 'En attente', value: stats.en_attente, emoji: '⏳', color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
          { label: 'En cours', value: stats.en_cours, emoji: '🚴', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { label: 'Livrées', value: stats.livres, emoji: '✅', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
          { label: 'Revenus', value: `${stats.revenus.toLocaleString('fr-FR')} F`, emoji: '💰', color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-3xl border ${stat.border} p-5 shadow-sm hover:shadow-md transition-all group`}>
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
              {stat.emoji}
            </div>
            <div className="font-display font-black text-2xl text-slate-900 leading-none">{stat.value}</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* COMMANDES EN ATTENTE */}
      {stats.en_attente > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-black text-xl text-orange-600 uppercase tracking-tight flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              Besoin d'un livreur ({stats.en_attente})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders?.filter(o => o.status === 'en_attente').map((order: any) => (
              <div key={order.id} className="bg-white border-2 border-orange-100 rounded-[2rem] p-6 shadow-lg shadow-orange-500/5 hover:border-orange-300 transition-all">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      URGENT
                    </div>
                    <div className="font-display font-black text-orange-600 text-xl">
                      {order.price.toLocaleString('fr-FR')} F
                    </div>
                  </div>

                  <h3 className="text-slate-800 font-bold text-base mb-4 line-clamp-2 min-h-[3rem]">
                    {order.description}
                  </h3>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-xs">📍</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-[10px] font-bold uppercase leading-none mb-1">Trajet</p>
                        <p className="text-slate-700 font-bold truncate">{order.zone_from?.name} → {order.zone_to?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-xs">👤</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-[10px] font-bold uppercase leading-none mb-1">Client</p>
                        <p className="text-slate-700 font-bold truncate">{order.client?.full_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    {livreurs && livreurs.length > 0 ? (
                      <form action={async (formData: FormData) => {
                        'use server'
                        const livreurId = formData.get('livreur_id') as string
                        if (livreurId) await assignLivreur(order.id, livreurId)
                      }} className="flex gap-2">
                        <select
                          name="livreur_id"
                          required
                          className="flex-1 bg-slate-50 border-2 border-slate-50 text-slate-700 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all appearance-none"
                        >
                          <option value="">Choisir livreur...</option>
                          {livreurs.map((l: any) => (
                            <option key={l.id} value={l.id}>{l.full_name}</option>
                          ))}
                        </select>
                        <button type="submit"
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95">
                          Assigner
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-2 bg-slate-50 rounded-xl text-slate-400 text-[10px] font-bold uppercase tracking-widest">
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

      {/* TOUTES LES COMMANDES */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-black text-xl text-slate-800 uppercase tracking-tight">Historique Global</h2>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
            {orders?.length || 0} commandes
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colis & Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Itinéraire</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acteurs</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-slate-800 font-bold text-sm mb-1 group-hover:text-orange-600 transition-colors truncate max-w-[180px]">
                        {order.description}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span className="text-xs font-bold text-slate-600">{order.zone_from?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full border border-slate-300"></span>
                          <span className="text-xs font-bold text-slate-600">{order.zone_to?.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center text-[10px]">👤</div>
                          <span className="text-xs font-bold text-slate-700">{order.client?.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-orange-50 rounded-md flex items-center justify-center text-[10px]">🚴</div>
                          <span className="text-xs font-bold text-slate-700">{order.livreur?.full_name || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-display font-black text-slate-900 text-base">
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
