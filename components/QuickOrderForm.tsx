'use client'

import { useState, useMemo } from 'react'
import QuartierCombobox from './QuartierCombobox'
import RepereAutocomplete from './RepereAutocomplete'
import { Quartier } from '@/lib/types'
import { createQuickOrder } from '@/actions/orders'
import { calculateDynamicPrice, type ParcelSize } from '@/lib/utils/pricing'
import { useRouter } from 'next/navigation'
import { X, Zap, Truck, Package, ArrowRight, CheckCircle, Info, MapPin, Loader2 } from 'lucide-react'

export default function QuickOrderForm() {
  const router = useRouter()
  const [depart, setDepart] = useState<Quartier | null>(null)
  const [arrivee, setArrivee] = useState<Quartier | null>(null)
  const [isExpress, setIsExpress] = useState(false)
  const [parcelSize, setParcelSize] = useState<ParcelSize>('petit')
  const [showModal, setShowModal] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [trackingToken, setTrackingToken] = useState<string | null>(null)
  const [pickupRepereVal, setPickupRepereVal] = useState('')
  const [deliveryRepereVal, setDeliveryRepereVal] = useState('')
  
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [description, setDescription] = useState('')
  const [valeurColis, setValeurColis] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wave')

  const estimatedPrice = useMemo(() => {
    if (!depart || !arrivee) return null
    return calculateDynamicPrice({
      zoneFromId: depart.zone_id,
      zoneToId: arrivee.zone_id,
      quartierFromId: depart.id,
      quartierToId: arrivee.id,
      isExpress,
      parcelSize,
      basePrice: Math.max(depart.frais_livraison_base, arrivee.frais_livraison_base)
    })
  }, [depart, arrivee, isExpress, parcelSize])

  const openConfirmation = () => {
    if (!depart || !arrivee) {
      setError("Veuillez sélectionner les quartiers de départ et d'arrivée.")
      return
    }
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depart || !arrivee) return
    
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('quartier_depart_id', depart.id)
    formData.append('quartier_arrivee_id', arrivee.id)
    formData.append('pickup_repere', pickupRepereVal)
    formData.append('delivery_repere', deliveryRepereVal)
    formData.append('recipient_name', recipientName)
    formData.append('recipient_phone', recipientPhone.replace(/\s/g, ''))
    formData.append('description', description)
    formData.append('payment_method', paymentMethod)
    formData.append('is_express', isExpress ? '1' : '0')
    formData.append('parcel_size', parcelSize)
    formData.append('valeur_colis', valeurColis || '0')
    formData.append('type', valeurColis && parseInt(valeurColis) > 0 ? 'vendeur' : 'particulier')

    try {
      const result = await createQuickOrder(formData)
      if (result?.success && result.orderId) {
        setOrderId(result.orderId)
        setTrackingToken(result.token || null)
        setShowModal(false)
      } else if (result?.error) {
        setError(result.error)
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  if (orderId) {
    const trackingUrl = trackingToken 
      ? `${window.location.origin}/t/${trackingToken}`
      : `${window.location.origin}/suivi/${orderId}`
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 mx-auto shadow-sm">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase">Commande Envoyée !</h2>
          <p className="text-slate-400 text-xs font-bold mt-2">Votre livreur est en route.</p>
        </div>
        <div className="space-y-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`📦 *Nelal Express — Suivi de Colis*\n\nVotre commande a été validée ! Suivez son trajet en temps réel ici :\n👉 ${trackingUrl}\n\nMerci de nous faire confiance. 🇸🇳`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
          >
            Partager sur WhatsApp
          </a>
          <button
            onClick={() => router.push('/dashboard/client')}
            className="w-full py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            Tableau de Bord
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto relative group">
      {/* Background glow effect */}
      <div className="absolute -inset-4 bg-orange-500/5 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      
      <div className="relative bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-white/50">
        {error && !showModal && (
          <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-10 relative">
          
          <div className="absolute left-6 top-16 bottom-16 w-px bg-slate-100 flex flex-col justify-center items-center z-0">
             <div className="bg-white p-1.5 rounded-full border border-slate-100 shadow-sm"><Package className="w-3 h-3 text-slate-300" /></div>
          </div>

          <div className="relative z-10 space-y-4">
            <QuartierCombobox
              label="Point de Départ"
              placeholder="Ex: Médina..."
              value={depart}
              onChange={setDepart}
            />
            {depart?.zone_id && (
              <div className="pl-14 animate-in slide-in-from-left-4 duration-500">
                <RepereAutocomplete
                  name="pickup_repere"
                  zoneId={depart.zone_id}
                  placeholder="Boutique, Mosquée, Pharmacie..."
                  onValueChange={setPickupRepereVal}
                  className="bg-slate-50 border-transparent rounded-2xl"
                />
              </div>
            )}
          </div>

          <div className="relative z-10 space-y-4">
            <QuartierCombobox
              label="Point d'Arrivée"
              placeholder="Ex: Keur Massar..."
              value={arrivee}
              onChange={setArrivee}
              icon={<MapPin className="w-4 h-4 text-orange-500" />}
            />
            {arrivee?.zone_id && (
              <div className="pl-14 animate-in slide-in-from-left-4 duration-500">
                <RepereAutocomplete
                  name="delivery_repere"
                  zoneId={arrivee.zone_id}
                  placeholder="Adresse précise ou repère..."
                  onValueChange={setDeliveryRepereVal}
                  className="bg-slate-50 border-transparent rounded-2xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* PARCEL SIZE SELECTOR */}
        <div className="mt-10 pt-8 border-t border-slate-50">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block ml-1">Type de colis</label>
           <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'petit', label: 'Petit', icon: <Package className="w-4 h-4" />, desc: 'Plats, Plis' },
                { id: 'moyen', label: 'Moyen', icon: <Package className="w-5 h-5" />, desc: 'Sac, Carton' },
                { id: 'gros', label: 'Gros', icon: <Package className="w-6 h-6" />, desc: 'Valise, 50kg' },
              ].map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setParcelSize(size.id as ParcelSize)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-500 group ${
                    parcelSize === size.id 
                      ? 'border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-500/5 -translate-y-1' 
                      : 'border-slate-50 bg-white hover:border-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    parcelSize === size.id ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:rotate-6'
                  }`}>
                    {size.icon}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[9px] font-black uppercase tracking-tight ${parcelSize === size.id ? 'text-orange-600' : 'text-slate-900'}`}>{size.label}</span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">{size.desc}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div 
            onClick={() => setIsExpress(!isExpress)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all duration-500 border-2 ${
              isExpress ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-slate-50 border-slate-50 text-slate-500'
            }`}
          >
            <Zap className={`w-4 h-4 ${isExpress ? 'text-white' : 'text-slate-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Express</span>
          </div>
          <div className="text-right flex-1">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Prix Estimé</div>
             <div className={`font-display font-black text-2xl transition-colors ${estimatedPrice ? 'text-slate-900' : 'text-slate-200'}`}>
               {estimatedPrice ? `${estimatedPrice.toLocaleString('fr-FR')} F` : '---'}
             </div>
          </div>
        </div>

        <button
          onClick={openConfirmation}
          className="w-full mt-8 bg-slate-900 hover:bg-orange-500 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-slate-900/10 group/btn"
        >
          Commander Maintenant <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Confirmation Modal (Premium Redesign) */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 sm:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-20 sm:slide-in-from-bottom-10 duration-500">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-2xl text-slate-900 mb-2 uppercase tracking-tighter italic">Finalisez votre <span className="text-orange-500">Envoi</span></h3>
            <p className="text-slate-400 text-xs font-bold mb-8">Plus que quelques secondes pour valider.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                  {error === 'Non connecté' ? (
                    <div className="flex flex-col gap-3">
                      <span>Vous devez être connecté pour commander.</span>
                      <button type="button" onClick={() => router.push('/auth/login')} className="bg-red-600 text-white px-4 py-2 rounded-xl inline-block w-max mx-auto hover:bg-red-700 transition-colors">Se connecter</button>
                    </div>
                  ) : (
                    error
                  )}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contenu du colis</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: 2kg de riz, vêtement, déjeuner..."
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Valeur si Nelal Pay (Optionnel)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={valeurColis}
                      onChange={(e) => setValeurColis(e.target.value)}
                      placeholder="Somme à encaisser"
                      className="w-full bg-orange-50/30 border-2 border-orange-100 rounded-2xl px-5 py-4 text-lg font-black text-orange-600 focus:border-orange-500 outline-none transition-all pl-12"
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400 font-black text-sm">F</div>
                  </div>
                  <p className="text-[8px] text-orange-400/60 mt-1 font-bold italic px-1">
                    {valeurColis && parseInt(valeurColis) > 0 ? "Le livreur récupérera cet argent pour vous." : "Laissez vide si l'article est déjà payé."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinataire</label>
                     <input
                      type="text" required value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nom complet"
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                   </div>
                   <input
                      type="tel" required value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="Téléphone (7X XXX XX XX)"
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Mode de Paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'wave', label: 'Wave / Orange' },
                    { val: 'cash', label: 'Cash' }
                  ].map(opt => (
                    <label key={opt.val} className="relative cursor-pointer group/opt">
                      <input 
                        type="radio" name="payment" value={opt.val}
                        checked={paymentMethod === opt.val}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="peer sr-only" 
                      />
                      <div className="border-2 border-slate-100 peer-checked:border-orange-500 peer-checked:bg-orange-50 text-slate-500 peer-checked:text-orange-600 rounded-2xl py-3 px-4 text-center transition-all group-hover/opt:border-slate-200">
                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-orange-500 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] disabled:opacity-70 group/confirm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Valider Commande <CheckCircle className="w-4 h-4 group-hover/confirm:scale-125 transition-transform" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
