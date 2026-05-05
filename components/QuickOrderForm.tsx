'use client'

import { useState, useMemo } from 'react'
import QuartierCombobox from './QuartierCombobox'
import RepereAutocomplete from './RepereAutocomplete'
import { Quartier } from '@/lib/types'
import { createQuickOrder } from '@/actions/orders'
import { calculateDynamicPrice, type ParcelSize } from '@/lib/utils/pricing'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function QuickOrderForm() {
  const router = useRouter()
  const [depart, setDepart] = useState<Quartier | null>(null)
  const [arrivee, setArrivee] = useState<Quartier | null>(null)
  const [isExpress, setIsExpress] = useState(false)
  const [parcelSize, setParcelSize] = useState<ParcelSize>('petit')
  const [showModal, setShowModal] = useState(false)
  
  // Submit state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [trackingToken, setTrackingToken] = useState<string | null>(null)
  const [pickupRepereVal, setPickupRepereVal] = useState('')
  const [deliveryRepereVal, setDeliveryRepereVal] = useState('')
  
  // Modal state
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
      <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
          <span className="material-symbols-rounded text-5xl">check_circle</span>
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">Commande Validée !</h2>
          <p className="text-slate-500 mt-2">Le livreur a été notifié.</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`📦 *Nelal Express — Suivi de Colis*\n\nVotre commande a été validée ! Suivez son trajet en temps réel ici :\n👉 ${trackingUrl}\n\nMerci de nous faire confiance. 🇸🇳`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <span className="material-symbols-rounded text-lg">share</span> Partager le lien WhatsApp
          </a>
        </div>
        <button
          onClick={() => router.push('/dashboard/client')}
          className="w-full py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors"
        >
          Retour à mes commandes
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto relative">
      <div className="bg-white rounded-[2rem] shadow-xl p-6 sm:p-8 border border-slate-100">
        {error && !showModal && (
          <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        <div className="space-y-6 relative">
          
          <div className="absolute left-6 top-16 bottom-16 w-0.5 bg-slate-100 flex flex-col justify-center items-center z-0">
             <div className="bg-white p-1 rounded-full"><span className="material-symbols-rounded text-[10px] text-slate-300">route</span></div>
          </div>

          <div className="relative z-10 space-y-4">
            <QuartierCombobox
              label="Départ"
              placeholder="Ex: Médina..."
              value={depart}
              onChange={setDepart}
            />
            {depart?.zone_id && (
              <div className="pl-14">
                <RepereAutocomplete
                  name="pickup_repere"
                  zoneId={depart.zone_id}
                  placeholder="Repère d'enlèvement (optionnel)"
                  onValueChange={setPickupRepereVal}
                  className="bg-slate-50/50"
                />
              </div>
            )}
          </div>

          <div className="relative z-10 space-y-4">
            <QuartierCombobox
              label="Arrivée"
              placeholder="Ex: Keur Massar..."
              value={arrivee}
              onChange={setArrivee}
              icon={<span className="material-symbols-rounded text-lg text-orange-500">location_on</span>}
            />
            {arrivee?.zone_id && (
              <div className="pl-14">
                <RepereAutocomplete
                  name="delivery_repere"
                  zoneId={arrivee.zone_id}
                  placeholder="Repère de livraison (optionnel)"
                  onValueChange={setDeliveryRepereVal}
                  className="bg-slate-50/50"
                />
              </div>
            )}
          </div>
        </div>

        {/* PARCEL SIZE SELECTOR */}
        <div className="mt-8 pt-6 border-t border-slate-100">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Type de colis</label>
           <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'petit', label: 'Petit', icon: 'drafts', desc: 'Doc, Plats' },
                { id: 'moyen', label: 'Moyen', icon: 'package_2', desc: 'Carton, Sac' },
                { id: 'gros', label: 'Gros', icon: 'inventory_2', desc: 'Valise, 50kg' },
              ].map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setParcelSize(size.id as ParcelSize)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    parcelSize === size.id 
                      ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' 
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <span className="material-symbols-rounded text-base">{size.icon}</span>
                  <span className="text-[10px] font-black uppercase leading-tight">{size.label}</span>
                  <span className="text-[7px] font-medium opacity-60 leading-none">{size.desc}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            {(depart?.id !== arrivee?.id) && (
              <button
                onClick={() => setIsExpress(!isExpress)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  isExpress ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span className="material-symbols-rounded text-xs">bolt</span> Express
              </button>
            )}
          </div>
          <div className="text-right">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total estimé</div>
             <div className="font-display font-black text-2xl text-slate-900 leading-none mt-1">
               {estimatedPrice ? `${estimatedPrice.toLocaleString('fr-FR')} F` : '---'}
             </div>
          </div>
        </div>

        <button
          onClick={openConfirmation}
          className="w-full mt-6 bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
        >
          Continuer <span className="material-symbols-rounded text-lg">arrow_forward</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-5">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-xl text-slate-900 mb-6">Derniers détails</h3>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Que voulez-vous livrer ou ACHETER ?"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <p className="text-[8px] text-slate-400 px-1 font-medium italic">
                  Ex: &quot;Acheter 2 kg de riz&quot;, &quot;Livrer mes clés&quot;, etc.
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={valeurColis}
                    onChange={(e) => setValeurColis(e.target.value)}
                    placeholder="Prix de l'article (si Nelal Pay)"
                    className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 py-3 text-sm font-black text-orange-600 focus:border-orange-500 outline-none transition-all pl-10"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 font-black text-xs">F</div>
                </div>
                <p className="text-[7px] text-orange-400 px-1 font-black uppercase tracking-widest">
                  {valeurColis && parseInt(valeurColis) > 0 ? "Activé : Nelal Express collectera ce montant pour vous" : "Laissez vide si vous payez déjà l'article"}
                </p>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nom du destinataire"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Téléphone (71 XXX XX XX)"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Moyen de paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'wave', label: 'Wave / Orange' },
                    { val: 'cash', label: 'Cash à l\'arrivée' }
                  ].map(opt => (
                    <label key={opt.val} className="relative cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value={opt.val}
                        checked={paymentMethod === opt.val}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="peer sr-only" 
                      />
                      <div className="border-2 border-slate-100 peer-checked:border-orange-500 peer-checked:bg-orange-50 text-slate-600 peer-checked:text-orange-600 rounded-xl py-2 px-3 text-center transition-all">
                        <span className="text-xs font-bold">{opt.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? (
                  <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>Confirmer la commande - {estimatedPrice?.toLocaleString('fr-FR')} F</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
