'use client'

import { useState, useMemo } from 'react'
import { createOrder } from '@/actions/orders'
import { useRouter } from 'next/navigation'
import { ZONE_TYPE_LABELS } from '@/lib/types'
import {
  Package, User, Wallet, Navigation, MapPin, CheckCircle,
  MessageCircle, ArrowRight, Copy, Zap, Info
} from 'lucide-react'

export default function OrderForm({ zonesByType }: { zonesByType: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gpsLink, setGpsLink] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Dynamic pricing state
  const [selectedZoneFrom, setSelectedZoneFrom] = useState('')
  const [selectedZoneTo, setSelectedZoneTo] = useState('')
  const [isExpress, setIsExpress] = useState(false)

  // Flatten zones for lookup
  const allZones = useMemo(() => [
    ...(zonesByType.dakar_centre || []),
    ...(zonesByType.banlieue || []),
    ...(zonesByType.interieur || []),
  ], [zonesByType])

  // Calculate price dynamically
  const estimatedPrice = useMemo(() => {
    if (!selectedZoneFrom || !selectedZoneTo) return null
    const zoneFrom = allZones.find((z: any) => z.id === selectedZoneFrom)
    const zoneTo = allZones.find((z: any) => z.id === selectedZoneTo)
    if (!zoneFrom || !zoneTo) return null

    let price = Math.max(zoneFrom.tarif_base, zoneTo.tarif_base)
    if (isExpress) price += 1000
    return price
  }, [selectedZoneFrom, selectedZoneTo, isExpress, allZones])

  // Check if inter-regional
  const isInterRegional = useMemo(() => {
    if (!selectedZoneFrom || !selectedZoneTo) return false
    const zoneFrom = allZones.find((z: any) => z.id === selectedZoneFrom)
    const zoneTo = allZones.find((z: any) => z.id === selectedZoneTo)
    return zoneFrom?.type === 'interieur' || zoneTo?.type === 'interieur'
  }, [selectedZoneFrom, selectedZoneTo, allZones])

  const trackingUrl = createdOrderId
    ? `${window.location.origin}/suivi/${createdOrderId}`
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── SUCCESS STATE ───────────────────────────────
  if (createdOrderId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-lg text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-500">
            <CheckCircle className="w-10 h-10" />
          </div>
        </div>

        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 uppercase tracking-tight">Commande Créée !</h2>
          <p className="text-slate-500 text-sm mt-2">Votre colis est en attente de prise en charge.</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lien de suivi</p>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
            <input
              readOnly
              value={trackingUrl}
              className="flex-1 bg-transparent border-none text-[10px] font-medium text-slate-600 focus:ring-0 truncate"
            />
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-orange-500"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Suivez mon colis Nelal Express ici : ${trackingUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4" /> Partager sur WhatsApp
          </a>
        </div>

        <button
          onClick={() => router.push('/dashboard/client')}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          Retour au tableau de bord <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const handleGetLocation = () => {
    setIsLocating(true)
    setError('')

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.")
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`
        setGpsLink(link)
        setIsLocating(false)
      },
      (err) => {
        setIsLocating(false)
        if (err.code === 1) {
          setError("Veuillez autoriser l'accès à votre position.")
        } else {
          setError("Impossible de récupérer votre position.")
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    // Build addresses from quartier + repère
    const pickupQuartier = formData.get('pickup_quartier') as string
    const pickupRepere = formData.get('pickup_repere') as string
    const deliveryQuartier = formData.get('delivery_quartier') as string
    const deliveryRepere = formData.get('delivery_repere') as string

    // Set constructed addresses
    formData.set('pickup_address', pickupQuartier)
    formData.set('delivery_address', deliveryQuartier)
    formData.set('address_landmark', pickupRepere || '')

    // Store delivery landmark in notes (prefixed)
    const existingNotes = formData.get('notes') as string || ''
    if (deliveryRepere) {
      formData.set('notes', deliveryRepere + (existingNotes ? ` | Note: ${existingNotes}` : ''))
    }

    // Pass express flag
    formData.set('is_express', isExpress ? '1' : '0')

    try {
      const result = await createOrder(formData)
      if (result?.success && result.orderId) {
        setCreatedOrderId(result.orderId)
        setLoading(false)
      } else if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch {
      setError('Une erreur est survenue lors de la création de la commande.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
          {error}
        </div>
      )}

      {/* ═══ ITINÉRAIRE ═══ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
            <MapPin className="w-4 h-4" />
          </div>
          <h2 className="font-display font-black text-sm text-slate-800 uppercase tracking-tight">Itinéraire</h2>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center py-2">
            <div className="w-3 h-3 rounded-full border-2 border-orange-500 bg-white"></div>
            <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          </div>

          <div className="flex-1 space-y-5">
            {/* DÉPART */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Zone de départ
              </label>
              <select
                name="zone_from_id"
                required
                value={selectedZoneFrom}
                onChange={(e) => setSelectedZoneFrom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Où se trouve le colis ?</option>
                {Object.entries(zonesByType).map(([type, typeZones]: [string, any]) => (
                  <optgroup key={type} label={ZONE_TYPE_LABELS[type as keyof typeof ZONE_TYPE_LABELS]}>
                    {typeZones.map((zone: any) => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <input
                type="text"
                name="pickup_quartier"
                required
                placeholder="Quartier (ex: Pikine Icotaf, Parcelles U15...)"
                className="w-full mt-2 bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all"
              />

              <div className="relative mt-2">
                <input
                  type="text"
                  name="pickup_repere"
                  placeholder="Repère connu (ex: Face à Touba Gaz, Marché Zinc...)"
                  className="w-full bg-white border border-slate-100 text-slate-700 rounded-xl pl-4 pr-20 py-2.5 text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {gpsLink && (
                    <a
                      href={gpsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Voir sur la carte"
                    >
                      <Navigation className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                    title="Position GPS"
                  >
                    {isLocating ? (
                      <span className="w-3 h-3 border-2 border-slate-400 border-t-orange-500 rounded-full animate-spin"></span>
                    ) : (
                      <MapPin className={`w-3 h-3 ${gpsLink ? 'text-orange-500' : ''}`} />
                    )}
                  </button>
                </div>
              </div>
              <input type="hidden" name="gps_link" value={gpsLink} />
            </div>

            <div className="h-px bg-slate-50"></div>

            {/* DESTINATION */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Zone de destination
              </label>
              <select
                name="zone_to_id"
                required
                value={selectedZoneTo}
                onChange={(e) => setSelectedZoneTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Où va le colis ?</option>
                {Object.entries(zonesByType).map(([type, typeZones]: [string, any]) => (
                  <optgroup key={type} label={ZONE_TYPE_LABELS[type as keyof typeof ZONE_TYPE_LABELS]}>
                    {typeZones.map((zone: any) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} — {zone.tarif_base.toLocaleString('fr-FR')} F
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <input
                type="text"
                name="delivery_quartier"
                required
                placeholder="Quartier (ex: Médina Rue 11, Keur Massar Cité Gorgui...)"
                className="w-full mt-2 bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all"
              />

              <input
                type="text"
                name="delivery_repere"
                placeholder="Repère connu (ex: Derrière la mosquée, Station Total...)"
                className="w-full mt-2 bg-white border border-slate-100 text-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Inter-regional info */}
        {isInterRegional && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-700">Livraison inter-régionale</p>
              <p className="text-[10px] text-blue-600 mt-0.5">
                Les colis vers l&apos;intérieur transitent par un point de relais (gare routière). Délai estimé : 24-48h.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ COLIS ═══ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Package className="w-4 h-4" />
            </div>
            <h2 className="font-display font-black text-sm text-slate-800 uppercase tracking-tight">Le Colis</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsExpress(!isExpress)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              isExpress
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            Express {isExpress && '+1000 F'}
          </button>
        </div>

        <textarea
          name="description"
          required
          rows={2}
          placeholder="Que livrons-nous ? (ex: 2 pizzas, sac de riz, documents...)"
          className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all resize-none"
        />

        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'particulier', label: '👤 Perso', desc: 'Envoi personnel' },
            { value: 'vendeur', label: '🛒 Vendeur', desc: 'Commande client' },
          ].map((opt) => (
            <label key={opt.value} className="relative cursor-pointer group">
              <input type="radio" name="type" value={opt.value} defaultChecked={opt.value === 'particulier'} className="peer sr-only" />
              <div className="border-2 border-slate-100 peer-checked:border-orange-500 peer-checked:bg-orange-50 rounded-xl p-3 text-center transition-all">
                <div className="font-bold text-xs text-slate-700">{opt.label}</div>
                <div className="text-[8px] text-slate-400 mt-0.5">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <textarea
          name="notes"
          rows={1}
          placeholder="Instructions spéciales (optionnel)"
          className="w-full bg-white border border-slate-100 text-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all resize-none"
        />
      </div>

      {/* ═══ DESTINATAIRE ═══ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <User className="w-4 h-4" />
          </div>
          <h2 className="font-display font-black text-sm text-slate-800 uppercase tracking-tight">Destinataire</h2>
        </div>

        <input
          name="recipient_name"
          type="text"
          required
          placeholder="Nom de celui qui reçoit"
          className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all"
        />
        <input
          name="recipient_phone"
          type="tel"
          required
          placeholder="Téléphone (77 XXX XX XX)"
          className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all"
        />
      </div>

      {/* ═══ PAIEMENT ═══ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
            <Wallet className="w-4 h-4" />
          </div>
          <h2 className="font-display font-black text-sm text-slate-800 uppercase tracking-tight">Paiement</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'wave', label: '💙 Wave', desc: 'Paiement mobile' },
            { value: 'orange_money', label: '🟠 Orange', desc: 'Orange Money' },
            { value: 'cash', label: '💵 Cash', desc: 'À la livraison' },
          ].map((opt) => (
            <label key={opt.value} className="relative cursor-pointer group">
              <input type="radio" name="payment_method" value={opt.value} defaultChecked={opt.value === 'wave'} className="peer sr-only" />
              <div className="border-2 border-slate-100 peer-checked:border-orange-500 peer-checked:bg-orange-50 rounded-xl p-3 text-center transition-all">
                <div className="text-xs font-bold text-slate-700">{opt.label}</div>
                <div className="text-[7px] text-slate-400 mt-0.5 font-medium">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ═══ PRICE RECAP + SUBMIT ═══ */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 md:relative md:bg-transparent md:border-0 md:p-0 z-40 safe-area-inset-bottom">
        {/* Price display */}
        {estimatedPrice !== null && (
          <div className="bg-slate-900 rounded-xl px-5 py-3 mb-3 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Estimation</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-display font-black text-xl text-white leading-none">
                  {estimatedPrice.toLocaleString('fr-FR')}
                </span>
                <span className="text-orange-400 text-xs font-bold">FCFA</span>
              </div>
            </div>
            <div className="text-right space-y-0.5">
              {isExpress && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-[9px] font-bold">Express +1 000 F</span>
                </div>
              )}
              <p className="text-[8px] text-slate-500 font-medium">Tarif zone inclus</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-2xl font-display font-black text-base shadow-xl shadow-orange-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
              Envoi en cours...
            </>
          ) : (
            <>
              Confirmer l&apos;envoi
              {estimatedPrice !== null && (
                <span className="bg-white/20 px-2.5 py-1 rounded-lg text-sm">
                  {estimatedPrice.toLocaleString('fr-FR')} F
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
