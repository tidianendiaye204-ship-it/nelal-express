import { createClient, getProfile } from '@/utils/supabase/server'
import Link from 'next/link'
import LiveClientUpdater from '@/components/LiveClientUpdater'
import ClientWalletCard from '@/components/ClientWalletCard'
import { 
  Send, Package, Bike, CheckCircle, 
  Clock, Phone, ChevronRight, Sparkles, 
  ArrowRight, ShieldCheck, MapPin, MessageSquare,
  Zap, Info, ListTodo
} from 'lucide-react'
import Image from 'next/image'

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
    <div className="max-w-xl mx-auto pb-24 px-1">
      <LiveClientUpdater clientId={profile?.id} />

      {/* 1. GREETING & WALLET */}
      <div className="mb-6 px-3 pt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight mb-0.5">{greeting} 👋</p>
            <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight leading-none">
              {firstName}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <ClientWalletCard balance={stats.balance} />
      </div>

      {/* 2. PRIMARY ACTION - "LE CLIENT DOIT SAVOIR QUOI FAIRE" */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-3">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Une livraison ?</h2>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        
        <Link
          href="/commander"
          className="block mx-2 relative group overflow-hidden bg-slate-900 rounded-[2rem] p-6 shadow-2xl shadow-slate-900/10 active:scale-[0.98] transition-all"
        >
          {/* Animated Background effects */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500 opacity-20 rounded-full blur-3xl -mr-24 -mt-24 group-hover:opacity-30 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-2xl -ml-16 -mb-16"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform group-hover:rotate-6 transition-transform">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-display font-black text-lg uppercase tracking-tight leading-tight mb-1">
                  Envoyer un colis
                </h3>
                <p className="text-slate-400 text-xs font-medium leading-tight">
                  Demandez un livreur en 30 secondes<br/>
                  <span className="text-orange-400 font-bold">Dakar & Ndioum</span>
                </p>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </Link>
      </section>

      {/* 3. HOW IT WORKS (ONBOARDING) */}
      {stats.total < 3 && (
        <section className="mb-8 px-3">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-500" /> Comment ça marche ?
            </h3>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Commandez', desc: 'Remplissez les détails du colis et l\'adresse.', icon: <ListTodo className="w-4 h-4" /> },
                { step: 2, title: 'Prise en charge', desc: 'Un partenaire accepte et arrive pour le ramassage.', icon: <Bike className="w-4 h-4" /> },
                { step: 3, title: 'Suivi & Code', desc: 'Suivez le trajet et donnez le code au livreur à la fin.', icon: <ShieldCheck className="w-4 h-4" /> },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-orange-500 shadow-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-tight leading-none mb-1">{item.title}</h4>
                    <p className="text-[9px] text-slate-500 font-medium leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. TRACKING CENTRAL (Active Orders) */}
      {activeOrders.length > 0 && (
        <section className="mb-8 px-2">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              En cours ({activeOrders.length})
            </h2>
            <Link href="/dashboard/client/commandes" className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              Historique
            </Link>
          </div>

          <div className="space-y-4">
            {activeOrders.map((order: any) => {
              const statusInfo: Record<string, { label: string; text: string; color: string; icon: React.ReactNode }> = {
                en_attente: { 
                  label: 'Recherche...', 
                  text: 'Nous cherchons un partenaire disponible autour de vous.', 
                  color: 'bg-amber-100 text-amber-700', 
                  icon: <Clock className="w-4 h-4" /> 
                },
                confirme: { 
                  label: 'Partenaire trouvé', 
                  text: 'Le livreur arrive pour récupérer le colis.', 
                  color: 'bg-blue-100 text-blue-700', 
                  icon: <Zap className="w-4 h-4" /> 
                },
                en_cours: { 
                  label: 'Livraison en cours', 
                  text: 'Le colis a été récupéré et est en route vers sa destination.', 
                  color: 'bg-orange-100 text-orange-700', 
                  icon: <Bike className="w-4 h-4" /> 
                },
              }
              const info = statusInfo[order.status] || statusInfo.en_attente

              return (
                <div key={order.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${info.color} mb-3`}>
                          {info.icon} {info.label}
                        </div>
                        <h3 className="text-slate-900 font-black text-lg truncate leading-tight mb-1 uppercase tracking-tight">{order.description}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{order.zone_from?.name}</span>
                          <ChevronRight className="w-3 h-3" />
                          <span className="truncate max-w-[150px] text-orange-500">{order.zone_to?.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-[100px]">
                        <div className="bg-orange-500 text-white px-4 py-3 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400 w-full">
                          <p className="text-[7px] font-black uppercase tracking-widest opacity-80 mb-1">Code Secret</p>
                          <p className="text-2xl font-display font-black tracking-widest leading-none">{order.delivery_code}</p>
                        </div>
                        <p className="text-[7px] font-black text-orange-600 uppercase tracking-tight text-center leading-tight">
                          🔑 À donner au livreur <br/> pour valider
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                      {info.text}
                    </p>

                    {order.livreur ? (
                      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-black text-sm">
                          {order.livreur.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Livreur assigné</p>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{order.livreur.full_name}</p>
                        </div>
                        <a
                          href={`tel:${order.livreur.phone}`}
                          className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-90 transition-transform"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Assignation en cours...</p>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    href={`/dashboard/client/commandes/${order.id}`}
                    className="flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-t border-slate-100"
                  >
                    Détails complets <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 5. HISTORY (RECENT DELIVERED) */}
      {recentDelivered.length > 0 && (
        <section className="px-3">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Récemment Livrés</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          <div className="space-y-3">
            {recentDelivered.map((order: any) => (
              <Link
                key={order.id}
                href={`/dashboard/client/commandes/${order.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 group active:scale-[0.98] transition-all hover:border-slate-300"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{order.description}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' · '}{order.zone_to?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-xs font-black text-slate-400">{order.price.toLocaleString('fr-FR')} F</p>
                   <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. SUPPORT FLOAT */}
      <div className="mt-12 px-4">
        <div className="bg-blue-600 rounded-[2rem] p-6 text-white text-center relative overflow-hidden shadow-xl shadow-blue-500/20">
           <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mt-12"></div>
           <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-80" />
           <h4 className="font-display font-black text-base uppercase mb-1">Besoin d&apos;assistance ?</h4>
           <p className="text-blue-100 text-[10px] mb-4 opacity-80">Notre équipe est disponible sur WhatsApp pour vous aider 7j/7.</p>
           <a 
            href={`https://wa.me/${process.env.ADMIN_WHATSAPP_PHONE?.replace('+', '') || '221711165368'}?text=Bonjour, j'ai besoin d'aide avec Nelal Express.`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
           >
            <Phone className="w-4 h-4 rotate-12" /> Contacter le support
           </a>
        </div>
      </div>
    </div>
  )
}
