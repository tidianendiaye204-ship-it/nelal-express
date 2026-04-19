// app/dashboard/client/commandes/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/server'
import { cancelOrder } from '@/actions/orders'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import { STATUS_LABELS } from '@/lib/types'
import LiveClientUpdater from '@/components/LiveClientUpdater'
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Navigation,
  Bike, CheckCircle, Clock, User, Wallet,
  ExternalLink, Share2, XCircle
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CommandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')

  const { id } = await params

  const host = (await headers()).get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const trackingUrl = `${protocol}://${host}/suivi/${id}`

  const { data: order, error } = await supabase
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
    .eq('client_id', profile.id)
    .single()

  if (error || !order) notFound()

  const steps = [
    { key: 'en_attente', label: 'Commande reçue', icon: <Clock className="w-4 h-4" />, desc: 'Votre commande a été enregistrée avec succès' },
    { key: 'confirme', label: 'Livreur assigné', icon: <User className="w-4 h-4" />, desc: 'Un livreur a été attribué à votre commande' },
    { key: 'en_cours', label: 'En route', icon: <Bike className="w-4 h-4" />, desc: 'Votre colis est en chemin vers la destination' },
    { key: 'livre', label: 'Livré', icon: <CheckCircle className="w-4 h-4" />, desc: 'Votre colis a été remis au destinataire' },
  ]

  const statusOrder = ['en_attente', 'confirme', 'en_cours', 'livre']
  const currentStep = statusOrder.indexOf(order.status)
  const isCancelled = order.status === 'annule'
  const isDelivered = order.status === 'livre'

  const statusColors: Record<string, string> = {
    en_attente: 'bg-amber-50 text-amber-600 border-amber-100',
    confirme: 'bg-blue-50 text-blue-600 border-blue-100',
    en_cours: 'bg-orange-50 text-orange-600 border-orange-100',
    livre: 'bg-green-50 text-green-600 border-green-100',
    annule: 'bg-red-50 text-red-500 border-red-100',
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 px-1">
      <LiveClientUpdater clientId={profile.id} />

      {/* BACK + HEADER */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <Link
          href="/dashboard/client/commandes"
          className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-lg text-slate-900 tracking-tight uppercase truncate">
            {order.description}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-slate-400">#{order.id.slice(0, 8).toUpperCase()}</span>
            <span className={`inline-flex px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border ${
              statusColors[order.status] || 'bg-slate-50 text-slate-500'
            }`}>
              {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
            </span>
          </div>
        </div>
      </div>

      {/* PROGRESS TRACKER */}
      {!isCancelled && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-3 mx-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Progression</h2>

            {/* Progress bar */}
            <div className="relative mb-6">
              <div className="absolute top-3 left-0 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStep
                  const isCurrent = idx === currentStep
                  return (
                    <div key={step.key} className="flex flex-col items-center" style={{ width: '60px' }}>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-500 z-10 ${
                        isCompleted
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-white border-2 border-slate-100 text-slate-300'
                      } ${isCurrent ? 'ring-4 ring-orange-500/10 scale-110' : ''}`}>
                        {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : step.icon}
                      </div>
                      <span className={`mt-2 text-[7px] font-black uppercase tracking-wider text-center leading-tight ${
                        isCompleted ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Current status message */}
            {!isDelivered ? (
              <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3 border border-orange-100">
                <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
                <p className="text-xs font-bold text-orange-700">
                  {steps[currentStep]?.desc || 'Commande en traitement'}
                </p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3 border border-green-100">
                <span className="text-lg">🎉</span>
                <div>
                  <p className="text-xs font-bold text-green-700">Dañu ko jënd — C&apos;est livré !</p>
                  <p className="text-[10px] text-green-600 font-medium mt-0.5">Votre colis a été remis avec succès</p>
                </div>
              </div>
            )}
          </div>

          {/* SECURITY CODE (A donner au livreur) */}
          {!isDelivered && (
            <div className="bg-slate-900 rounded-2xl p-5 shadow-xl shadow-slate-900/20 mx-2 mb-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Code de sécurité livraison</p>
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <p className="text-3xl font-mono font-black text-white tracking-[0.2em]">
                      {order.delivery_code || '----'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                      Donnez ce code au livreur uniquement <span className="text-orange-400 font-bold underline">après avoir reçu</span> votre colis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CANCELLED STATE */}
      {isCancelled && (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-5 mx-2 mb-3 text-center">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <h3 className="font-display font-black text-red-500 text-base">Commande annulée</h3>
          <p className="text-red-400 text-xs mt-1">Cette commande a été annulée</p>
        </div>
      )}

      {/* ITINERARY */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-3 mx-2">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" /> Itinéraire
        </h2>

        <div className="space-y-1">
          {/* Pickup */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-0.5">
                <span className="w-3 h-3 rounded-full border-2 border-orange-500 bg-white flex-shrink-0"></span>
                <div className="w-0.5 h-6 bg-orange-200 mt-1"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Départ</p>
                <p className="text-sm font-bold text-slate-800">{order.zone_from?.name}</p>
                <p className="text-xs text-slate-600 font-medium">{order.pickup_address}</p>
                {order.address_landmark && (
                  <p className="text-[10px] text-orange-600 font-bold mt-1 flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5" /> {order.address_landmark}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-0.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Destination</p>
                <p className="text-sm font-bold text-slate-800">{order.zone_to?.name}</p>
                <p className="text-xs text-slate-600 font-medium">{order.delivery_address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECIPIENT + LIVREUR */}
      <div className="grid grid-cols-1 gap-3 mx-2 mb-3">
        {/* Destinataire */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Destinataire</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{order.recipient_name}</p>
                <p className="text-xs text-slate-400 font-medium">{order.recipient_phone}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <a
                href={`tel:${order.recipient_phone}`}
                className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 active:bg-green-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${order.recipient_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${order.recipient_name}, votre colis Nelal Express est en route !`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 active:bg-green-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Livreur (if assigned) */}
        {order.livreur && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Votre livreur</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                  <Bike className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{order.livreur.full_name}</p>
                  <p className="text-xs text-slate-400 font-medium">{order.livreur.phone}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <a
                  href={`tel:${order.livreur.phone}`}
                  className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white active:bg-green-600 transition-colors shadow-md shadow-green-500/20"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${order.livreur.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, c'est au sujet de ma commande Nelal Express #${order.id.slice(0, 8).toUpperCase()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white active:opacity-90 transition-colors shadow-md shadow-green-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRICE & PAYMENT */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mx-2 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant</p>
            <p className="font-display font-black text-2xl text-orange-600 leading-none">
              {order.price.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Paiement</p>
            <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
              <Wallet className="w-3.5 h-3.5" />
              {order.payment_method === 'wave' ? 'Wave' : order.payment_method === 'orange_money' ? 'Orange Money' : 'Cash'}
            </span>
          </div>
        </div>
      </div>

      {/* HISTORY TIMELINE */}
      {order.history && order.history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mx-2 mb-3">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historique</h2>
          <div className="space-y-3">
            {[...order.history].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((h: any, idx: number) => (
              <div key={h.created_at + idx} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-orange-50" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">
                    {STATUS_LABELS[h.status as keyof typeof STATUS_LABELS] || h.status}
                  </p>
                  {h.note && <p className="text-[10px] text-slate-500 font-medium">{h.note}</p>}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(h.created_at).toLocaleString('fr-FR', {
                      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="space-y-2 mx-2">
        {/* Share tracking */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Suivez mon colis Nelal Express ici 📦 : ${trackingUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-green-500/20"
        >
          <Share2 className="w-4 h-4" /> Partager le suivi sur WhatsApp
        </a>

        {/* View public tracking */}
        <Link
          href={`/suivi/${order.id}`}
          className="w-full bg-slate-100 text-slate-700 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <ExternalLink className="w-4 h-4" /> Voir la page de suivi publique
        </Link>

        {/* Cancel (only if en_attente) */}
        {order.status === 'en_attente' && (
          <form action={async () => {
            'use server'
            await cancelOrder(id)
          }}>
            <button
              type="submit"
              className="w-full bg-white border border-red-100 text-red-500 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" /> Annuler cette commande
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
