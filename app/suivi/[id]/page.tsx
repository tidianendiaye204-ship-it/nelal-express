// app/suivi/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'

import Link from 'next/link'
import { STATUS_LABELS } from '@/lib/types'
import LiveTrackingMap from '@/components/LiveTrackingMap'

export const dynamic = 'force-dynamic'

export default async function SuiviPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      livreur:profiles!orders_livreur_id_fkey(full_name, phone, lat, lng),
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type),
      history:order_status_history(status, note, created_at)
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
        <p className="text-slate-400 max-w-xs mb-8">
          Désolé, nous ne trouvons aucune commande avec la référence : <br/>
          <span className="text-orange-400 font-mono text-sm">{id}</span>
        </p>
        <Link href="/" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const steps = [
    { key: 'en_attente', label: 'Commande reçue', icon: '📥', desc: 'Votre commande a été enregistrée' },
    { key: 'confirme', label: 'Livreur assigné', icon: '🚴', desc: 'Un livreur a été assigné à votre commande' },
    { key: 'en_cours', label: 'En route', icon: '🛣️', desc: 'Votre colis est en chemin' },
    { key: 'livre', label: 'Livré ✅', icon: '🎉', desc: 'Votre colis a été livré' },
  ]

  const statusOrder = ['en_attente', 'confirme', 'en_cours', 'livre']
  const currentStep = statusOrder.indexOf(order.status)
  const isCancelled = order.status === 'annule'
  const isDelivered = order.status === 'livre' || order.status === 'livre_partiel'

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-dm">
      {/* NAV */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-bold text-xs">N</span>
          </div>
          <span className="font-display font-bold text-white">Nelal Express</span>
        </Link>
        <span className="text-slate-400 text-sm">Suivi de commande</span>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">

        <div className="text-center mb-12">
          <h1 className="font-display font-black text-3xl lg:text-5xl uppercase italic tracking-tighter">Suivi de commande</h1>
          <p className="text-slate-500 text-sm lg:text-base mt-2 font-medium opacity-80">{order.description}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: INFOS & TIMELINE */}
          <div className="space-y-6">
            {/* INFOS CARDS */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-sm">
              <div className="grid sm:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Expédition</div>
                    <div className="text-white font-black text-base uppercase leading-tight">{order.zone_from?.name}</div>
                    <div className="text-slate-500 text-xs mt-1 leading-relaxed">{order.pickup_address}</div>
                    {order.address_landmark && (
                      <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-400 text-[10px] px-2 py-1 rounded-lg mt-2 font-bold italic">
                        📍 {order.address_landmark}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Destinataire</div>
                    <div className="text-white font-black text-base uppercase leading-tight">{order.recipient_name}</div>
                    <div className="text-slate-500 text-xs mt-1">{order.recipient_phone}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Destination</div>
                    <div className="text-white font-black text-base uppercase leading-tight">{order.zone_to?.name}</div>
                    <div className="text-slate-500 text-xs mt-1 leading-relaxed">{order.delivery_address}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Montant à régler</div>
                    <div className="text-orange-500 font-display font-black text-2xl tracking-tight leading-none">
                      {order.price.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
                    </div>
                  </div>
                </div>
              </div>

              {order.livreur && (
                <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 font-black text-xl">
                      {order.livreur.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-600 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Coursier Nelal</div>
                      <div className="text-white font-black text-base uppercase tracking-tight">{order.livreur.full_name}</div>
                    </div>
                  </div>
                  <a
                    href={`tel:${order.livreur.phone}`}
                    className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    📞 Appeler
                  </a>
                </div>
              )}
            </div>

            {/* TIMELINE */}
            {isCancelled ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-10 text-center">
                <div className="text-5xl mb-4">❌</div>
                <h3 className="font-display font-black text-red-500 text-2xl uppercase italic">Commande annulée</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">Nous regrettons de vous informer que cette livraison a été annulée par l&apos;expéditeur ou l&apos;administrateur.</p>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 lg:p-10">
                <h3 className="font-display font-black text-xs text-slate-600 uppercase tracking-[0.3em] mb-10">
                  Progression de la livraison
                </h3>
                <div className="space-y-0">
                  {steps.map((step, index) => {
                    const isDone = currentStep > index
                    const isCurrent = currentStep === index

                    return (
                      <div key={step.key} className="flex gap-6 group">
                        {/* Indicateur */}
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-500 border-2 ${
                            isDone ? 'bg-green-500/20 border-green-500 text-green-500' :
                            isCurrent ? 'bg-orange-500/20 border-orange-500 text-white animate-pulse shadow-lg shadow-orange-500/20' :
                            'bg-slate-800/50 border-slate-700 text-slate-600'
                          }`}>
                            {isDone ? '✓' : step.icon}
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`w-0.5 h-12 my-1 transition-colors duration-500 ${isDone ? 'bg-green-500/30' : 'bg-slate-800'}`} />
                          )}
                        </div>

                        {/* Texte */}
                        <div className="pb-10 pt-1.5 flex-1">
                          <div className={`font-black text-base uppercase tracking-tight leading-none mb-1 ${
                            isCurrent ? 'text-orange-500' :
                            isDone ? 'text-green-500' :
                            'text-slate-600'
                          }`}>
                            {step.label}
                          </div>
                          <div className="text-slate-500 text-[11px] font-medium leading-relaxed opacity-80">{step.desc}</div>

                          {isCurrent && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>
                              <span className="text-orange-500 text-[9px] font-black uppercase tracking-widest">En cours</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: MAP & HISTORY */}
          <div className="space-y-6 lg:sticky lg:top-8">
            {/* LIVE TRACKING MAP */}
            {!isCancelled && !isDelivered && (
              <div className="rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-display font-black text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    Livreur en mouvement
                  </h3>
                </div>
                <LiveTrackingMap 
                  livreurId={order.livreur?.id}
                  initialLat={order.livreur?.lat}
                  initialLng={order.livreur?.lng}
                />
              </div>
            )}

            {/* HISTORIQUE DÉTAILLÉ */}
            {order.history && order.history.length > 0 && (
              <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
                <h3 className="font-display font-black text-[10px] text-slate-700 uppercase tracking-[0.2em] mb-6">
                  Journal d&apos;activité
                </h3>
                <div className="space-y-5">
                  {[...order.history].reverse().map((h: any) => (
                    <div key={h.created_at} className="flex items-start gap-4 group">
                      <div className="w-1 h-1 bg-slate-700 rounded-full mt-2 group-hover:bg-orange-500 transition-colors" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 text-xs font-bold uppercase tracking-tight">
                            {STATUS_LABELS[h.status as keyof typeof STATUS_LABELS] || h.status}
                          </span>
                          <span className="text-slate-700 font-mono text-[9px]">
                            {new Date(h.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {h.note && <div className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">{h.note}</div>}
                        <div className="text-slate-700 text-[9px] font-medium mt-1">
                          {new Date(h.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHARE / WHATSAPP */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-[2.5rem] p-8 text-center sm:text-left sm:flex items-center justify-between gap-6">
              <div className="mb-4 sm:mb-0">
                <h4 className="text-green-500 font-black text-sm uppercase leading-none mb-1">Partagez l&apos;accès</h4>
                <p className="text-green-500/50 text-[10px] font-medium">Envoyez ce lien sur WhatsApp.</p>
              </div>
              <a
                href={`https://wa.me/?text=Suivez%20ma%20commande%20Nelal%20Express%20ici%20%3A%20${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nelalexpress.com'}/suivi/${order.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                📲 Partager
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
