// app/dashboard/livreur/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/server'
import { updateOrderStatus } from '@/actions/orders'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'

import { getWhatsAppDirectLink } from '@/lib/utils/phone'

export default async function LivreurDashboard() {
  const supabase = await createClient()
  const profile = await getProfile()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      zone_from:zones!orders_zone_from_id_fkey(name),
      zone_to:zones!orders_zone_to_id_fkey(name)
    `)
    .eq('livreur_id', profile?.id)
    .not('status', 'in', '("annule","livre")')
    .order('created_at', { ascending: false })

  const { data: historique } = await supabase
    .from('orders')
    .select(`
      *,
      zone_from:zones!orders_zone_from_id_fkey(name),
      zone_to:zones!orders_zone_to_id_fkey(name)
    `)
    .eq('livreur_id', profile?.id)
    .in('status', ['annule', 'livre'])
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight uppercase">Livraisons</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez vos courses du jour</p>
      </div>

      {/* STATS - App style */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'En cours', value: orders?.length || 0, emoji: '🚴', color: 'bg-orange-50 text-orange-600' },
          { label: 'Livrées', value: historique?.filter(o => o.status === 'livre').length || 0, emoji: '✅', color: 'bg-green-50 text-green-600' },
          { label: 'Total', value: `${(historique?.filter(o => o.status === 'livre').reduce((sum: number, o: any) => sum + o.price, 0) || 0).toLocaleString('fr-FR')} F`, emoji: '💰', color: 'bg-blue-50 text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="text-lg mb-1">{stat.emoji}</div>
            <div className="font-display font-black text-lg text-slate-900 leading-none">{stat.value}</div>
            <div className="text-slate-400 text-[8px] font-black uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* COMMANDES ACTIVES */}
      <h2 className="font-display font-black text-sm text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">À effectuer</h2>

      {!orders?.length ? (
        <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 mb-10">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">Tout est à jour !</p>
        </div>
      ) : (
        <div className="space-y-4 mb-12">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                      {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                    </span>
                    <h3 className="text-slate-900 font-black text-xl leading-tight mb-2">{order.description}</h3>
                  </div>
                  <div className="font-display font-black text-orange-600 text-xl">{order.price.toLocaleString('fr-FR')} F</div>
                </div>

                {/* ROUTE */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <div className="w-0.5 h-4 bg-slate-200"></div>
                    <div className="w-2 h-2 rounded-full border-2 border-orange-500 bg-white"></div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-700 truncate uppercase">{order.zone_from?.name}</div>
                    <div className="text-xs font-black text-slate-700 truncate uppercase">{order.zone_to?.name}</div>
                  </div>
                </div>

                {/* CONTACTS - Big buttons for thumbs */}
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${order.recipient_phone}`} className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
                    <span>📞</span> Appeler
                  </a>
                  <a 
                    href={getWhatsAppDirectLink(order.recipient_phone, `Bonjour ${order.recipient_name}, c'est le livreur Nelal Express.`)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    <span>💬</span> WhatsApp
                  </a>
                </div>

                {/* ACTION */}
                <div className="pt-2">
                  {order.status === 'confirme' && (
                    <form action={async () => {
                      'use server'
                      await updateOrderStatus(order.id, 'en_cours', 'Prise en charge')
                    }}>
                      <button type="submit"
                        className="w-full bg-orange-500 text-white py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                        Commencer la course 🚀
                      </button>
                    </form>
                  )}

                  {order.status === 'en_cours' && (
                    <form action={async () => {
                      'use server'
                      await updateOrderStatus(order.id, 'livre', 'Livraison confirmée')
                    }}>
                      <button type="submit"
                        className="w-full bg-green-500 text-white py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all">
                        Terminer la course ✅
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORIQUE */}
      {!!historique?.length && (
        <section>
          <h2 className="font-display font-black text-sm text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Récent</h2>
          <div className="space-y-3">
            {historique.map((order: any) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between opacity-60">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-bold text-sm truncate">{order.description}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{order.zone_from?.name} → {order.zone_to?.name}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xs font-black text-slate-900">{order.price.toLocaleString('fr-FR')} F</div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-green-500">LIVRÉ</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
