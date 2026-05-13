// app/t/[token]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { STATUS_LABELS } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import LiveTracker from '@/components/LiveTracker'
import CustomCursor from '@/components/CustomCursor'

export const dynamic = 'force-dynamic'

export default async function PublicTrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient()
  const { token } = await params
  
  // Clean token to avoid whitespace issues
  const cleanToken = token.trim()

  // 1. Récupérer l'ID de commande via le token (Case-insensitive)
  const { data: trackData, error: trackError } = await supabase
    .from('tracking_tokens')
    .select('order_id')
    .ilike('token', cleanToken)
    .single()

  if (trackError || !trackData) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-8 text-center font-inter relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-orange-500/10 border border-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                <span className="material-symbols-rounded text-4xl text-orange-500">link_off</span>
            </div>
            <h1 className="font-display font-black text-3xl uppercase tracking-tighter">Lien Invalide</h1>
            <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                Désolé, ce lien de suivi n&apos;est plus actif ou n&apos;existe pas. Vérifiez le lien partagé par votre agent.
            </p>
            <Link href="/" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95">
                Retour à l&apos;accueil
            </Link>
        </div>
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
    <div className="min-h-screen bg-[#020617] text-white font-inter pb-20 selection:bg-orange-500/30">
      <CustomCursor />
      
      {/* HEADER PREMIUM */}
      <div className="bg-[#020617]/40 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="font-display font-black text-xl tracking-tighter uppercase">Nelal<span className="text-orange-500">Express</span></span>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">
            ID #{order.id.slice(0, 6).toUpperCase()}
        </div>
      </div>

      <main className="max-w-xl mx-auto p-6 space-y-6">
        
        {/* STATUT LIVE CARD */}
        <section className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start mb-10">
                <div className="space-y-3">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Statut du colis</span>
                   <div className="flex items-center gap-3">
                       <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                       </span>
                       <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                         {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                       </h2>
                   </div>
                </div>
                <div className="text-right">
                   <LiveTracker orderId={order.id} />
                </div>
            </div>

            {/* BARRE DE PROGRESSION PREMIUM */}
            <div className="relative flex justify-between px-2">
                <div className="absolute top-4 left-4 right-4 h-[2px] bg-white/5 -z-0"></div>
                <div 
                    className="absolute top-4 left-4 h-[2px] bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-1000 -z-0"
                    style={{ width: `calc(${(currentIdx / 3) * 100}% - 32px)` }}
                ></div>

                {steps.map((step, i) => (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl border transition-all duration-500 flex items-center justify-center ${
                            i <= currentIdx 
                            ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-110' 
                            : 'bg-[#020617] border-white/10 text-slate-600'
                        }`}>
                            <span className="material-symbols-rounded text-xl">
                              {step.icon}
                            </span>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${i <= currentIdx ? 'text-orange-500' : 'text-slate-600'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </section>

        {/* INFOS LIVREUR PREMIUM */}
        {order.livreur ? (
            <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white border border-white/5 shadow-2xl flex items-center justify-between group">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🚴
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Votre Partenaire Livreur</div>
                        <div className="font-display font-black text-xl tracking-tight">{order.livreur.full_name}</div>
                    </div>
                </div>
                <a href={`tel:${order.livreur.phone}`} className="bg-white text-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl hover:bg-orange-500 hover:text-white transition-all active:scale-90">
                    <span className="material-symbols-rounded">call</span>
                </a>
            </section>
        ) : (
            <section className="bg-blue-500/10 border border-blue-500/20 rounded-[2rem] p-6 text-blue-400 flex items-center gap-5">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center animate-pulse">
                    <span className="material-symbols-rounded">search</span>
                </div>
                <div className="text-xs font-black uppercase tracking-widest">Assignation du livreur en cours...</div>
            </section>
        )}

        {/* DÉTAILS TRAJET */}
        <section className="bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/5 space-y-8">
            <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                    <span className="material-symbols-rounded text-2xl">route</span>
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Itinéraire Logistique</div>
                   <div className="font-display font-black text-xl uppercase tracking-tight">
                     {order.quartier_depart?.nom} <span className="text-orange-500 mx-2">→</span> {order.quartier_arrivee?.nom}
                   </div>
                </div>
            </div>
            
            {order.pickup_photo_url && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-rounded text-xs text-orange-500">photo_camera</span> Preuve de ramassage sécurisée
                    </div>
                    <div className="relative group overflow-hidden rounded-3xl border border-white/10">
                        <Image 
                            src={order.pickup_photo_url} 
                            alt="Preuve de ramassage" 
                            width={500}
                            height={400}
                            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                </div>
            )}
        </section>

        {/* SÉCURITÉ FOOTER */}
        <div className="pt-10 text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/5 px-6 py-3 rounded-full">
                <span className="material-symbols-rounded text-sm text-green-500">verified</span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Authentifié par Nelal Express 🇸🇳</span>
            </div>
            <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em]">Propulsé par la Technologie & le Terroir</p>
        </div>

      </main>
    </div>
  )
}
