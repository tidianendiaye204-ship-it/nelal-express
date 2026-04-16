// app/dashboard/livreur/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/server'
import { updateOrderStatus } from '@/actions/orders'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import { getWhatsAppDirectLink } from '@/lib/utils/phone'
import { Bike, CheckCircle, Wallet, Phone, MessageCircle } from 'lucide-react'

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
    .in('status', ['confirme', 'en_cours'])
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
    <div className="max-w-2xl mx-auto pb-10 px-1">
      <div className="mb-6 px-2">
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">Mes Missions</h1>
        <div className="h-1 w-6 bg-orange-500 mt-2 rounded-full"></div>
        <p className="text-slate-500 text-xs mt-2">Gérez vos ramassages et livraisons</p>
      </div>

      {/* STATS - App style */}
      <div className="grid grid-cols-3 gap-2 mb-8 px-2">
        {[
          { label: 'En cours', value: orders?.length || 0, icon: <Bike className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
          { label: 'Livrées', value: historique?.filter(o => o.status === 'livre').length || 0, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
          { label: 'Total', value: `${(historique?.filter(o => o.status === 'livre').reduce((sum: number, o: any) => sum + o.price, 0) || 0).toLocaleString('fr-FR')} F`, icon: <Wallet className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
            <div className="mb-2">{stat.icon}</div>
            <div className="font-display font-black text-sm text-slate-900 leading-none">{stat.value}</div>
            <div className="text-slate-400 text-[6px] font-black uppercase tracking-widest mt-1.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* COMMANDES ACTIVES */}
      <h2 className="font-display font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4 ml-3">À effectuer</h2>

      {!orders?.length ? (
        <div className="mx-2 bg-slate-50 rounded-[1.5rem] p-10 text-center border border-slate-100 mb-8">
          <div className="text-3xl mb-3 opacity-20">🎉</div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aucune course pour le moment !</p>
        </div>
      ) : (
        <div className="space-y-4 mb-10 px-2">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-md active:scale-[0.98] transition-all relative overflow-hidden">
              {order.status === 'en_cours' && (
                 <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
              )}
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest mb-2 ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                      {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                    </span>
                    <h3 className="text-slate-900 font-black text-sm leading-tight mb-1 truncate uppercase tracking-tight">{order.description}</h3>
                  </div>
                  <div className="font-display font-black text-orange-600 text-lg leading-none ml-3 bg-orange-50 px-3 py-2 rounded-xl">
                    {order.price.toLocaleString('fr-FR')} <span className="text-[10px]">F</span>
                  </div>
                </div>

                {/* ITINÉRAIRE CLAIR */}
                <div className="grid grid-cols-1 gap-3 py-2">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full border-2 border-orange-500 inline-block"></span> 
                      1. Ramassage
                    </p>
                    <p className="text-sm font-bold text-slate-800">{order.zone_from?.name}</p>
                    <p className="text-xs text-slate-600 mt-1">Client: {order.client?.full_name}</p>
                    <div className="flex gap-2 mt-2">
                      <a href={`tel:${order.client?.phone}`} className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1"><Phone className="w-3 h-3" /> Appeler Client</a>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span> 
                      2. Livraison
                    </p>
                    <p className="text-sm font-bold text-slate-800">{order.zone_to?.name}</p>
                    <p className="text-xs text-slate-600 mt-1">Destinataire: {order.recipient_name}</p>
                    <div className="flex gap-2 mt-2">
                      <a href={`tel:${order.recipient_phone}`} className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1"><Phone className="w-3 h-3" /> Appeler Dest.</a>
                      <a href={getWhatsAppDirectLink(order.recipient_phone, `Bonjour ${order.recipient_name}, c'est le livreur Nelal Express. J'arrive avec votre colis.`)} target="_blank" rel="noopener noreferrer" className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1"><MessageCircle className="w-3 h-3" /> WhatsApp</a>
                    </div>
                  </div>
                </div>

                {/* ACTION */}
                <div className="pt-2">
                  {order.status === 'confirme' && (
                    <form action={async () => {
                      'use server'
                      await updateOrderStatus(order.id, 'en_cours', 'Prise en charge')
                    }}>
                      <button type="submit"
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
                        J'ai récupéré le colis
                      </button>
                    </form>
                  )}

                  {order.status === 'en_cours' && (
                    <form action={async () => {
                      'use server'
                      await updateOrderStatus(order.id, 'livre', 'Livraison confirmée')
                    }}>
                      <button type="submit"
                        className="w-full bg-green-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Confirmer la livraison
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
        <section className="px-2">
          <h2 className="font-display font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Récent</h2>
          <div className="space-y-2">
            {historique.map((order: any) => (
              <div key={order.id} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center justify-between opacity-70">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-bold text-[10px] truncate uppercase">{order.description}</p>
                  <p className="text-[6px] font-black text-slate-400 uppercase tracking-tight">{order.zone_from?.name} → {order.zone_to?.name}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-[10px] font-black text-slate-900">{order.price.toLocaleString('fr-FR')} F</div>
                  <span className="text-[6px] font-black uppercase tracking-widest text-green-500">LIVRÉ</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
