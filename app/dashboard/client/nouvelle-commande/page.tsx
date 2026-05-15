'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import OrderForm from './OrderForm'
import ZoneSearchInput from '@/components/ZoneSearchInput'
import QuartierSearchInput from '@/components/QuartierSearchInput'
import { Zone, Quartier } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { createOrder } from '@/actions/orders'
import { 
  Package, User, Wallet, Navigation, CheckCircle, 
  MessageCircle, ArrowRight, Zap, Truck, ArrowLeft,
  MapPin, ChevronDown
} from 'lucide-react'

const STEPS = [
  { id: 'route', title: 'Itinéraire', icon: <Navigation className="w-5 h-5" /> },
  { id: 'parcel', title: 'Colis', icon: <Package className="w-5 h-5" /> },
  { id: 'receiver', title: 'Destinataire', icon: <User className="w-5 h-5" /> },
  { id: 'confirm', title: 'Paiement', icon: <Wallet className="w-5 h-5" /> }
]

export default function NouvelleCommandePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [zones, setZones] = useState<Zone[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [loading, setLoading] = useState(true)

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedZoneFrom, setSelectedZoneFrom] = useState<Zone | null>(null)
  const [selectedZoneTo, setSelectedZoneTo] = useState<Zone | null>(null)

  const [formData, setFormData] = useState({
    zone_from_id: '',
    zone_to_id: '',
    quartier_depart_id: '',
    quartier_arrivee_id: '',
    description: '',
    is_express: false,
    parcel_size: 'petit' as 'petit' | 'moyen' | 'gros',
    receiver_name: '',
    receiver_phone: '',
    location_details: '',
    payment_method: 'cash'
  })

  useEffect(() => {
    async function fetchData() {
      const [{ data: zData }, { data: qData }] = await Promise.all([
        supabase.from('zones').select('*').order('type').order('name'),
        supabase.from('quartiers').select('*').order('nom')
      ])
      if (zData) setZones(zData)
      if (qData) setQuartiers(qData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const submission = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      submission.append(key, value?.toString() || '')
    })
    if (formData.is_express) submission.set('is_express', '1')

    try {
      const result = await createOrder(submission)
      if (result.error) {
        setError(result.error)
      } else if (result.orderId) {
        router.push(`/suivi/${result.orderId}`)
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const estimatedPrice = selectedZoneTo ? selectedZoneTo.tarif_base + (formData.is_express ? 1000 : 0) : 0

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement des zones...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/client" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase">Commander</h1>
          <p className="text-slate-500 text-xs mt-0.5">Rapide et simple</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {/* STEPPER HEADER */}
        <div className="flex items-center justify-between mb-12 px-2">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                idx <= currentStep ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 rotate-0' : 'bg-slate-100 text-slate-400 rotate-12 opacity-50'
              }`}>
                {step.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-3 transition-colors ${idx <= currentStep ? 'text-slate-900' : 'text-slate-300'}`}>
                {step.title}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={`absolute top-6 left-12 w-[calc(100vw/4)] md:w-24 h-0.5 -z-10 transition-colors ${idx < currentStep ? 'bg-orange-500' : 'bg-slate-100'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
          
          {/* STEP 1: ROUTE */}
          {currentStep === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="font-display font-black text-2xl uppercase italic tracking-tighter">Votre <span className="text-orange-500">Itinéraire</span></h2>
                <p className="text-slate-400 text-xs font-bold">Sélectionnez les zones de départ et d&apos;arrivée.</p>
              </div>
              
              <div className="space-y-10">
                <ZoneSearchInput 
                  zones={zones} 
                  name="zone_from_id" 
                  label="Départ (Zone)" 
                  placeholder="Tapez votre quartier..."
                  onSelect={(z) => {
                    setSelectedZoneFrom(z)
                    setFormData(p => ({ ...p, zone_from_id: z?.id || '', quartier_depart_id: '' }))
                  }}
                  defaultValue={formData.zone_from_id}
                />

                {formData.zone_from_id && quartiers.filter(q => q.zone_id === formData.zone_from_id).length > 0 && (
                  <QuartierSearchInput
                    quartiers={quartiers.filter(q => q.zone_id === formData.zone_from_id)}
                    name="quartier_depart_id"
                    label="Quartier de départ précis"
                    placeholder="Tapez le quartier de départ..."
                    onSelect={(q) => setFormData(p => ({ ...p, quartier_depart_id: q?.id || '' }))}
                    defaultValue={formData.quartier_depart_id}
                  />
                )}

                <ZoneSearchInput 
                  zones={zones} 
                  name="zone_to_id" 
                  label="Arrivée (Zone)" 
                  placeholder="Où livrer ?"
                  onSelect={(z) => {
                    setSelectedZoneTo(z)
                    setFormData(p => ({ ...p, zone_to_id: z?.id || '', quartier_arrivee_id: '' }))
                  }}
                  defaultValue={formData.zone_to_id}
                />

                {formData.zone_to_id && quartiers.filter(q => q.zone_id === formData.zone_to_id).length > 0 && (
                  <QuartierSearchInput
                    quartiers={quartiers.filter(q => q.zone_id === formData.zone_to_id)}
                    name="quartier_arrivee_id"
                    label="Quartier d&apos;arrivée précis"
                    placeholder="Tapez le quartier d'arrivée..."
                    onSelect={(q) => setFormData(p => ({ ...p, quartier_arrivee_id: q?.id || '' }))}
                    defaultValue={formData.quartier_arrivee_id}
                  />
                )}
              </div>

              {selectedZoneTo && (
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 animate-in zoom-in-95 duration-300">
                   <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-1">Tarif Estimé</p>
                   <p className="text-xl font-display font-black text-orange-600">{estimatedPrice.toLocaleString('fr-FR')} FCFA</p>
                </div>
              )}

              <button type="button" onClick={nextStep} disabled={!formData.zone_from_id || !formData.zone_to_id} className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-20">
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PARCEL */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="space-y-2">
                <h2 className="font-display font-black text-2xl uppercase italic tracking-tighter">Le <span className="text-orange-500">Colis</span></h2>
                <p className="text-slate-400 text-xs font-bold">Détails de l&apos;objet à transporter.</p>
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Que transportons-nous ?</label>
                 <textarea 
                   value={formData.description}
                   onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                   placeholder="Ex: Un sac de riz 25kg, des vêtements..."
                   className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none h-32 resize-none"
                 />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block ml-1">Type de colis</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'petit', label: 'Petit', desc: 'Doc, Plats', icon: <Package className="w-5 h-5" />, color: 'orange' },
                    { id: 'moyen', label: 'Moyen', desc: 'Carton, Sac', icon: <Package className="w-6 h-6" />, color: 'blue' },
                    { id: 'gros', label: 'Gros', desc: 'Valise, 50kg', icon: <Package className="w-7 h-7" />, color: 'indigo' }
                  ].map((size) => (
                    <div 
                      key={size.id}
                      onClick={() => setFormData(p => ({ ...p, parcel_size: size.id as any }))}
                      className={`relative p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 flex flex-col items-center text-center gap-3 group ${
                        formData.parcel_size === size.id 
                          ? 'border-orange-500 bg-orange-50/50 shadow-xl shadow-orange-500/10 -translate-y-1' 
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        formData.parcel_size === size.id ? 'bg-orange-500 text-white rotate-0' : 'bg-slate-50 text-slate-400 group-hover:rotate-6'
                      }`}>
                        {size.icon}
                      </div>
                      <div>
                        <p className={`text-[11px] font-black uppercase tracking-tight ${formData.parcel_size === size.id ? 'text-orange-600' : 'text-slate-900'}`}>{size.label}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{size.desc}</p>
                      </div>
                      {formData.parcel_size === size.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-in zoom-in">
                          <CheckCircle className="w-3 h-3 text-white" strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div 
                   onClick={() => setFormData(p => ({...p, is_express: !p.is_express}))} 
                   className={`p-5 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer relative overflow-hidden group ${
                     formData.is_express 
                       ? 'border-orange-500 bg-orange-50/50 shadow-lg' 
                       : 'border-slate-100 bg-white hover:border-slate-200'
                   }`}
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${formData.is_express ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <Zap className="w-4 h-4" />
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_express ? 'text-orange-600' : 'text-slate-900'}`}>Express</span>
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 leading-tight">Priorité maximale (+1.000 F)</p>
                   {formData.is_express && (
                     <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-orange-500/10 rounded-full blur-2xl" />
                   )}
                 </div>

                 <div className="p-5 rounded-[2rem] border-2 border-slate-100 bg-white opacity-60">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Standard</span>
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 leading-tight">Délai normal (2h - 4h)</p>
                 </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 rounded-2xl py-5 font-black text-xs uppercase tracking-widest">Retour</button>
                <button type="button" onClick={nextStep} disabled={!formData.description} className="flex-[2] bg-slate-900 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20">Continuer <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* STEP 3: RECEIVER */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="space-y-2">
                <h2 className="font-display font-black text-2xl uppercase italic tracking-tighter">Le <span className="text-orange-500">Destinataire</span></h2>
                <p className="text-slate-400 text-xs font-bold">Qui reçoit le colis ?</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" value={formData.receiver_name} 
                    onChange={e => setFormData(p => ({ ...p, receiver_name: e.target.value }))}
                    placeholder="Nom complet"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" value={formData.receiver_phone} 
                    onChange={e => setFormData(p => ({ ...p, receiver_phone: e.target.value }))}
                    placeholder="Téléphone (WhatsApp conseillé)"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 rounded-2xl py-5 font-black text-xs uppercase tracking-widest">Retour</button>
                <button type="button" onClick={nextStep} disabled={!formData.receiver_name || !formData.receiver_phone} className="flex-[2] bg-slate-900 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20">Continuer <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="space-y-2">
                <h2 className="font-display font-black text-2xl uppercase italic tracking-tighter">Récapitulatif <span className="text-orange-500">& Paiement</span></h2>
                <p className="text-slate-400 text-xs font-bold">Vérifiez les détails avant de confirmer.</p>
              </div>
              
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Colis</p>
                      <p className="text-xs font-bold text-slate-900">{formData.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                      <p className="text-xs font-bold text-slate-900">{formData.is_express ? '🚀 Express' : '🚚 Standard'}</p>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-slate-200">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Trajet</p>
                    <p className="text-[10px] font-bold text-slate-900">
                      {zones.find(z => z.id === formData.zone_from_id)?.name} → {zones.find(z => z.id === formData.zone_to_id)?.name}
                    </p>
                    {(formData.quartier_depart_id || formData.quartier_arrivee_id) && (
                      <p className="text-[9px] text-slate-400 mt-1 italic">
                        {quartiers.find(q => q.id === formData.quartier_depart_id)?.nom || '...'} ⟷ {quartiers.find(q => q.id === formData.quartier_arrivee_id)?.nom || '...'}
                      </p>
                    )}
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">Mode de Paiement</label>
                 <div className="grid grid-cols-2 gap-3">
                    {['cash', 'wave', 'orange_money'].map(method => (
                      <div 
                        key={method} 
                        onClick={() => setFormData(p => ({...p, payment_method: method}))}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center ${formData.payment_method === method ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-slate-50'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{method.replace('_', ' ')}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {error && <p className="p-4 bg-red-50 text-red-500 text-[10px] font-bold rounded-2xl border border-red-100">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={prevStep} className="flex-1 bg-slate-100 text-slate-500 rounded-2xl py-5 font-black text-xs uppercase tracking-widest">Retour</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-orange-500 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50">
                  {isSubmitting ? 'Envoi...' : `Confirmer — ${estimatedPrice.toLocaleString('fr-FR')} FCFA →`} <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  )
}
