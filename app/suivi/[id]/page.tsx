// app/suivi/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { STATUS_LABELS } from '@/lib/types'

export default async function SuiviPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      livreur:profiles!orders_livreur_id_fkey(full_name, phone),
      zone_from:zones!orders_zone_from_id_fkey(name, type),
      zone_to:zones!orders_zone_to_id_fkey(name, type),
      history:order_status_history(status, note, created_at)
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const steps = [
    { key: 'en_attente', label: 'Commande reçue', icon: '📥', desc: 'Votre commande a été enregistrée' },
    { key: 'confirme', label: 'Livreur assigné', icon: '🚴', desc: 'Un livreur a été assigné à votre commande' },
    { key: 'en_cours', label: 'En route', icon: '🛣️', desc: 'Votre colis est en chemin' },
    { key: 'livre', label: 'Livré ✅', icon: '🎉', desc: 'Votre colis a été livré' },
  ]

  const statusOrder = ['en_attente', 'confirme', 'en_cours', 'livre']
  const currentStep = statusOrder.indexOf(order.status)
  const isCancelled = order.status === 'annule'

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

      <div className="max-w-lg mx-auto px-4 py-10">

        {/* REF */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2 mb-4">
            <span className="text-slate-400 text-xs">Référence</span>
            <span className="text-orange-400 font-display font-bold text-sm tracking-widest">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl">Suivi de commande</h1>
          <p className="text-slate-400 text-sm mt-1">{order.description}</p>
        </div>

        {/* INFOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500 text-xs mb-1">Départ</div>
              <div className="text-white font-medium">{order.zone_from?.name}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Destination</div>
              <div className="text-white font-medium">{order.zone_to?.name}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Destinataire</div>
              <div className="text-white font-medium">{order.recipient_name}</div>
              <div className="text-slate-400 text-xs">{order.recipient_phone}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Montant</div>
              <div className="text-orange-400 font-display font-bold">
                {order.price.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          </div>

          {order.livreur && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-500 text-xs mb-1">Votre livreur</div>
                <div className="text-white font-medium text-sm">{order.livreur.full_name}</div>
              </div>
              <a
                href={`tel:${order.livreur.phone}`}
                className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
              >
                📞 Appeler
              </a>
            </div>
          )}
        </div>

        {/* TIMELINE */}
        {isCancelled ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">❌</div>
            <h3 className="font-display font-bold text-red-400 text-lg">Commande annulée</h3>
            <p className="text-slate-400 text-sm mt-1">Cette commande a été annulée.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-sm text-slate-400 uppercase tracking-wider mb-6">
              Progression
            </h3>
            <div className="space-y-0">
              {steps.map((step, index) => {
                const isDone = currentStep > index
                const isCurrent = currentStep === index
                const isPending = currentStep < index

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Indicateur */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${
                        isDone ? 'bg-green-500/20 border-2 border-green-500' :
                        isCurrent ? 'bg-orange-500/20 border-2 border-orange-500 ring-4 ring-orange-500/10' :
                        'bg-slate-800 border-2 border-slate-700'
                      }`}>
                        {isDone ? '✓' : step.icon}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isDone ? 'bg-green-500/40' : 'bg-slate-800'}`} />
                      )}
                    </div>

                    {/* Texte */}
                    <div className="pb-8 pt-1.5 flex-1">
                      <div className={`font-semibold text-sm ${
                        isCurrent ? 'text-orange-400' :
                        isDone ? 'text-green-400' :
                        'text-slate-500'
                      }`}>
                        {step.label}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">{step.desc}</div>

                      {isCurrent && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
                          <span className="text-orange-400/70 text-xs">Statut actuel</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* HISTORIQUE DÉTAILLÉ */}
        {order.history && order.history.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-4">
            <h3 className="font-display font-semibold text-xs text-slate-500 uppercase tracking-wider mb-4">
              Historique
            </h3>
            <div className="space-y-3">
              {[...order.history].reverse().map((h: any) => (
                <div key={h.created_at} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-300 text-xs font-medium">
                      {STATUS_LABELS[h.status as keyof typeof STATUS_LABELS] || h.status}
                    </span>
                    {h.note && <span className="text-slate-500 text-xs"> — {h.note}</span>}
                    <div className="text-slate-600 text-xs">
                      {new Date(h.created_at).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHARE / WHATSAPP */}
        <div className="mt-6 text-center">
          <a
            href={`https://wa.me/?text=Suivez%20ma%20commande%20Nellal%20Express%20ici%20%3A%20${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nellal-express.vercel.app'}/suivi/${order.id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            📲 Partager sur WhatsApp
          </a>
        </div>

      </div>
    </div>
  )
}
