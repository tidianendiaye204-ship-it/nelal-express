// app/t/[token]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'

import Link from 'next/link'
import Image from 'next/image'
import LiveTracker from '@/components/LiveTracker'

export const dynamic = 'force-dynamic'

export default async function PublicTrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient()
  const { token } = await params

  // 1. Récupérer l'ID de commande via le token
  const { data: trackData, error: trackError } = await supabase
    .from('tracking_tokens')
    .select('order_id')
    .ilike('token', token)
    .single()

  if (trackError || !trackData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Lien invalide</h1>
        <p className="text-slate-500 mb-6">Désolé, ce lien de suivi n&apos;est plus actif ou n&apos;existe pas.</p>
        <Link href="/" className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm">
          Retour à Nelal Express
        </Link>
      </div>
    )
  }

  // 2. Charger les infos de la commande
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      livreur:profiles!livreur_id(full_name, phone),
      quartier_depart:quartiers!quartier_depart_id(nom),
      quartier_arrivee:quartiers!quartier_arrivee_id(nom)
    `)
    .eq('id', trackData.order_id)
    .single()

  if (!order) return null

  const steps = [
    { key: 'en_attente', label: 'Pris en compte', icon: 'inventory_2' },
    { key: 'confirme', label: 'Assigné', icon: 'order_approve' },
    { key: 'en_cours', label: 'En route', icon: 'local_shipping' },
    { key: 'livre', label: 'Livré', icon: 'verified' },
  ]

  const currentIdx = steps.findIndex(s => s.key === order.status)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* HEADER LÉGER */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="font-bold text-lg tracking-tighter">Nelal Express</span>
        </div>
        <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-600 tracking-wider">
            #{order.id.slice(0, 4).toUpperCase()}
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-4">
        
        {/* STATUT LIVE */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Statut Actuel</h2>
                   <div className={`inline-flex items-center gap-2 ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]} px-3 py-1 rounded-full text-xs font-bold`}>
                       <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                       </span>
                       {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                   </div>
                </div>
                <div className="text-right italic">
                   <LiveTracker orderId={order.id} />
                </div>
            </div>

            {/* BARRE DE PROGRESSION */}
            <div className="relative flex justify-between">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 -z-0"></div>
                <div 
                    className="absolute top-4 left-0 h-0.5 bg-orange-500 transition-all duration-1000 -z-0"
                    style={{ width: `${(currentIdx / 3) * 100}%` }}
                ></div>

                {steps.map((step, i) => (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                            i <= currentIdx ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-slate-100 text-slate-300'
                        }`}>
                            <span className="material-symbols-rounded text-base">
                              {step.icon}
                            </span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${i <= currentIdx ? 'text-orange-600' : 'text-slate-300'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </section>

        {/* INFOS LIVREUR */}
        {order.livreur ? (
            <section className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
                        🚴
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">Votre Livreur</div>
                        <div className="font-bold">{order.livreur.full_name}</div>
                    </div>
                </div>
                <a href={`tel:${order.livreur.phone}`} className="bg-orange-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-90 transition-transform">
                    📞
                </a>
            </section>
        ) : (
            <section className="bg-blue-500 rounded-3xl p-5 text-white shadow-lg flex items-center gap-4">
                <div className="animate-pulse w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">🔍</div>
                <div className="text-sm font-medium">Recherche d&apos;un livreur disponible...</div>
            </section>
        )}

        {/* DÉTAILS TRAJET */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                    <span className="material-symbols-rounded text-lg text-slate-400">location_on</span>
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trajet</div>
                   <div className="text-sm font-bold">{order.quartier_depart?.nom} → {order.quartier_arrivee?.nom}</div>
                </div>
            </div>
            
            {order.pickup_photo_url && (
                <div className="mt-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="material-symbols-rounded text-xs">photo_camera</span> Photo de prise en charge
                    </div>
                    <Image 
                        src={order.pickup_photo_url} 
                        alt="Preuve de ramassage" 
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-2xl border"
                        unoptimized
                    />
                </div>
            )}
        </section>

        {/* SÉCURITÉ */}
        <div className="px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-slate-200/50 px-4 py-2 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Service sécurisé par Nelal Express 🇸🇳
            </div>
        </div>

      </main>
    </div>
  )
}
