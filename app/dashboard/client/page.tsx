// app/dashboard/client/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/server'
import Link from 'next/link'
import LiveClientUpdater from '@/components/LiveClientUpdater'
import { Send, Package, Bike, CheckCircle, Clock, Phone, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'

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

  const stats = {
    total: orders?.length || 0,
    en_cours: orders?.filter(o => ['confirme', 'en_cours'].includes(o.status)).length || 0,
    livres: orders?.filter(o => o.status === 'livre').length || 0,
  }

  const activeOrders = orders?.filter(o => ['en_attente', 'confirme', 'en_cours'].includes(o.status)) || []
  const recentDelivered = orders?.filter(o => o.status === 'livre').slice(0, 3) || []

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = profile?.full_name?.split(' ')[0] || 'Client'

  return (
    <div className="max-w-2xl mx-auto pb-24 px-1">
      <LiveClientUpdater clientId={profile?.id} />

      {/* GREETING */}
      <div className="mb-6 px-2">
        <p className="text-slate-400 text-xs font-bold mb-0.5">{greeting} 👋</p>
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight leading-none">
          {firstName}
        </h1>
        <div className="h-1 w-6 bg-orange-500 mt-2 rounded-full"></div>
      </div>

      {/* HERO CTA — Envoyer un colis */}
      <Link
        href="/commander"
        className="block mx-2 mb-6 relative group overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -ml-12 -mb-12"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-display font-black text-base uppercase tracking-tight">
                Envoyer un colis
              </h3>
              <p className="text-slate-400 text-[10px] font-bold mt-0.5">
                Dakar · Banlieue · Intérieur du pays
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
            <ArrowRight className="w-4.5 h-4.5 text-white" />
          </div>
        </div>
      </Link>

      {/* STATS STRIP */}
      <div className="flex gap-2 mb-6 px-2">
        {[
          { label: 'Total', value: stats.total, icon: <Package className="w-4 h-4" />, color: 'text-slate-700 bg-slate-50' },
          { label: 'En cours', value: stats.en_cours, icon: <Bike className="w-4 h-4" />, color: 'text-orange-600 bg-orange-50', pulse: stats.en_cours > 0 },
          { label: 'Livrés', value: stats.livres, icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600 bg-green-50' },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              {stat.pulse && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              )}
            </div>
            <div className="font-display font-black text-xl text-slate-900 leading-none">{stat.value}</div>
            <div className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ACTIVE ORDERS */}
      {activeOrders.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 px-3">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              En cours ({activeOrders.length})
            </h2>
            <Link href="/dashboard/client/commandes?status=en_cours" className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              Tout voir
            </Link>
          </div>

          <div className="space-y-2 px-2">
            {activeOrders.slice(0, 3).map((order: any) => {
              const statusSteps = ['en_attente', 'confirme', 'en_cours', 'livre']
              const currentIdx = statusSteps.indexOf(order.status)
              const progress = Math.max(0, (currentIdx / (statusSteps.length - 1)) * 100)

              const statusInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
                en_attente: { label: 'En attente', color: 'text-amber-600 bg-amber-50', icon: <Clock className="w-3 h-3" /> },
                confirme: { label: 'Assigné', color: 'text-blue-600 bg-blue-50', icon: <Bike className="w-3 h-3" /> },
                en_cours: { label: 'En route', color: 'text-orange-600 bg-orange-50', icon: <Bike className="w-3 h-3" /> },
              }

              const info = statusInfo[order.status] || statusInfo.en_attente

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/client/commandes/${order.id}`}
                  className="block bg-white rounded-2xl border border-slate-100 p-4 shadow-sm active:scale-[0.98] hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest ${info.color}`}>
                          {info.icon} {info.label}
                        </span>
                      </div>
                      <h3 className="text-slate-900 font-bold text-sm truncate">{order.description}</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {order.zone_from?.name} <span className="text-orange-500">→</span> {order.zone_to?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-display font-black text-orange-600 text-sm">
                        {order.price.toLocaleString('fr-FR')} <span className="text-[8px]">F</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>

                  {/* Mini progress */}
                  <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Courier chip */}
                  {order.livreur && (
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                          <Bike className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{order.livreur.full_name}</span>
                      </div>
                      <a
                        href={`tel:${order.livreur.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center text-green-600 active:bg-green-100 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* EMPTY STATE (no orders at all) */}
      {stats.total === 0 && (
        <div className="mx-2 bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-2xl p-10 text-center border border-slate-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-orange-500" />
          </div>
          <h3 className="font-display font-black text-lg text-slate-900 uppercase tracking-tight mb-2">
            Bienvenue sur Nelal Express !
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Envoyez votre premier colis en quelques secondes. Dakar, banlieue et intérieur du pays.
          </p>
          <Link
            href="/commander"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" /> Envoyer mon premier colis
          </Link>
        </div>
      )}

      {/* RECENT DELIVERED */}
      {recentDelivered.length > 0 && (
        <section className="px-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Récemment livrés
            </h2>
            <Link href="/dashboard/client/commandes?status=livre" className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              Tout voir
            </Link>
          </div>

          <div className="space-y-1.5">
            {recentDelivered.map((order: any) => (
              <Link
                key={order.id}
                href={`/dashboard/client/commandes/${order.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-slate-50 px-4 py-3 group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{order.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' · '}{order.zone_to?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-500">{order.price.toLocaleString('fr-FR')} F</span>
                  <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
