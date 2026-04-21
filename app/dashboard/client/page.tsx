import { createClient, getProfile } from '@/utils/supabase/server'
import Link from 'next/link'
import LiveClientUpdater from '@/components/LiveClientUpdater'
import ClientWalletCard from '@/components/ClientWalletCard'
import { 
  Send, Package, Bike, CheckCircle, 
  Clock, Phone, ChevronRight, 
  ArrowRight, ShieldCheck, MessageSquare,
  Zap, Info, ListTodo
} from 'lucide-react'

export const dynamic = 'force-dynamic'

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
    .limit(10)

  const activeOrders = orders?.filter(o => ['en_attente', 'confirme', 'en_cours'].includes(o.status)) || []
  const recentDelivered = orders?.filter(o => o.status === 'livre' || o.status === 'livre_partiel').slice(0, 3) || []

  const stats = {
    total: orders?.length || 0,
    active: activeOrders.length,
    balance: profile?.balance || 0
  }

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = profile?.full_name?.split(' ')[0] || 'Client'

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4">
      <LiveClientUpdater clientId={profile?.id} />

      <div className="grid lg:grid-cols-3 gap-8 pt-4">
        {/* LEFT COLUMN: GREETING, WALLET, ACTIONS & ACTIVE ORDERS */}
        <div className="lg:col-span-2 space-y-8">
          {/* GREETING & WALLET */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight mb-0.5">{greeting} 👋</p>
                <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight leading-none uppercase italic">
                  {firstName}
                </h1>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <ClientWalletCard balance={stats.balance} />
          </div>

          {/* PRIMARY ACTION */}
          <section>
            <div className="flex items-center gap-2 mb-4 px-2">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Nouvelle Mission</h2>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            
            <Link
              href="/commander"
              className="block relative group overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform group-hover:rotate-6 transition-transform">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-display font-black text-xl uppercase tracking-tight leading-tight mb-1">
                      Envoyer un colis
                    </h3>
                    <p className="text-slate-400 text-xs font-medium leading-tight">
                      Livreur disponible en quelques minutes<br/>
                      <span className="text-orange-400 font-bold uppercase tracking-widest text-[10px]">Ouvert 7j/7 · 24h/24</span>
                    </p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          </section>

          {/* ACTIVE ORDERS */}
          {activeOrders.length > 0 && (
            <section className="animate-in slide-in-from-bottom-4 duration-500 pb-10">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Suivi en Direct ({activeOrders.length})
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {activeOrders.map((order: any) => {
                  const statusInfo: Record<string, { label: string; text: string; color: string; icon: React.ReactNode }> = {
                    en_attente: { 
                      label: 'Recherche...', 
                      text: 'Nous cherchons un partenaire disponible.', 
                      color: 'bg-amber-100 text-amber-700', 
                      icon: <Clock className="w-4 h-4" /> 
                    },
                    confirme: { 
                      label: 'Assigné', 
                      text: 'Le livreur arrive pour le ramassage.', 
                      color: 'bg-blue-100 text-blue-700', 
                      icon: <Zap className="w-4 h-4" /> 
                    },
                    en_cours: { 
                      label: 'En Route', 
                      text: 'Le colis est en route vers sa destination.', 
                      color: 'bg-orange-100 text-orange-700', 
                      icon: <Bike className="w-4 h-4" /> 
                    },
                  }
                  const info = statusInfo[order.status] || statusInfo.en_attente

                  return (
                    <div key={order.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${info.color} mb-3`}>
                              {info.icon} {info.label}
                            </div>
                            <h3 className="text-slate-900 font-black text-lg truncate leading-tight mb-1 uppercase tracking-tight italic">{order.description}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                              <span className="truncate">{order.zone_from?.name}</span>
                              <ChevronRight className="w-3 h-3" />
                              <span className="truncate text-orange-500">{order.zone_to?.name}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-700">
                              <p className="text-[7px] font-black uppercase tracking-widest opacity-80 mb-0.5">Code</p>
                              <p className="text-xl font-display font-black tracking-widest leading-none">{order.delivery_code}</p>
                            </div>
                          </div>
                        </div>

                        {order.livreur && (
                          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 shadow-sm">
                              {order.livreur.full_name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Livreur</p>
                              <p className="text-[10px] font-black text-slate-800 uppercase truncate">{order.livreur.full_name}</p>
                            </div>
                            <a href={`tel:${order.livreur.phone}`} className="w-8 h-8 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-95 transition-transform"><Phone className="w-4 h-4" /></a>
                          </div>
                        )}
                      </div>
                      <Link href={`/dashboard/client/commandes/${order.id}`} className="flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest border-t border-slate-100 transition-colors">Détails <ChevronRight className="w-3.5 h-3.5" /></Link>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: HISTORY, GUIDES & SUPPORT */}
        <div className="space-y-6">
          {/* HISTORY */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historique Récent</h2>
              <Link href="/dashboard/client/commandes" className="text-[9px] font-black text-orange-500 uppercase tracking-widest hover:underline">Voir tout</Link>
            </div>
            
            {recentDelivered.length > 0 ? (
              <div className="space-y-3">
                {recentDelivered.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/client/commandes/${order.id}`}
                    className="flex items-center justify-between bg-slate-50 rounded-2xl p-3 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-500/20">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-800 uppercase truncate">{order.description}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aucun colis archivé</p>
              </div>
            )}
          </section>

          {/* ONBOARDING / HELP */}
          <section className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-6">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" /> Guide Express
            </h3>
            <div className="space-y-5">
              {[
                { step: 1, title: 'Commandez', desc: 'Saisissez les infos du colis.', icon: <ListTodo className="w-4 h-4" /> },
                { step: 2, title: 'Prise en charge', desc: 'Un livreur accepte la mission.', icon: <Bike className="w-4 h-4" /> },
                { step: 3, title: 'Validation', desc: 'Donnez le code à la livraison.', icon: <ShieldCheck className="w-4 h-4" /> },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[10px] font-black text-blue-500 shadow-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-tight leading-none mb-1">{item.title}</h4>
                    <p className="text-[9px] text-blue-700/60 font-medium leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SUPPORT */}
          <section className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-500/20">
            <MessageSquare className="w-10 h-10 mb-4 opacity-50" />
            <h4 className="font-display font-black text-xl uppercase tracking-tighter italic mb-2">Besoin d&apos;Aide ?</h4>
            <p className="text-white/80 text-xs font-medium mb-6 leading-relaxed">Notre équipe support est disponible par WhatsApp pour vous assister.</p>
            <a 
              href={`https://wa.me/${process.env.ADMIN_WHATSAPP_PHONE?.replace('+', '') || '221711165368'}?text=Bonjour, j'ai besoin d'aide.`} 
              target="_blank" rel="noopener noreferrer"
              className="w-full py-4 bg-white text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <Phone className="w-4 h-4" /> Échanger en direct
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
