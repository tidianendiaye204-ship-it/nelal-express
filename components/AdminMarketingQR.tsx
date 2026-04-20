'use client'

import { useState, useMemo, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Printer, 
  RotateCcw, 
  Smartphone, 
  CheckCircle2, 
  Info,
  Users,
  Sparkles
} from 'lucide-react'

interface Livreur {
  id: string
  full_name: string
  phone: string
}

interface AdminMarketingQRProps {
  livreurs: Livreur[]
}

export default function AdminMarketingQR({ livreurs }: AdminMarketingQRProps) {
  // 1. STATE
  const [serviceName, setServiceName] = useState('NELAL EXPRESS')
  const [slogan, setSlogan] = useState('Livraison rapide · Dakar, Banlieue & Intérieur')
  const [zones, setZones] = useState('🏙 Dakar · Pikine · Guédiawaye · Rufisque · Keur Massar')
  const [zones2, setZones2] = useState('🚌 Saint-Louis · Ndioum · Touba · Thiès · Kaolack...')
  const [phone, setPhone] = useState('71 116 53 68/7')
  const [waMessage, setWaMessage] = useState(`Salam ! Je veux commander via Nelal Express 🚀

📦 Colis :
📍 Départ :
📍 Destination :
👤 Destinataire :
📞 Tel :
💳 Paiement : Wave / Orange / Cash`)

  const [selectedLivreurId, setSelectedLivreurId] = useState('')

  // 2. AUTOMATIC UPDATES WHEN LIVREUR SELECTED
  useEffect(() => {
    if (selectedLivreurId === 'default') {
      setServiceName('NELAL EXPRESS')
      setPhone('71 116 53 68/7')
      return
    }

    const livreur = livreurs.find(l => l.id === selectedLivreurId)
    if (livreur) {
      setServiceName(`NELAL - ${livreur.full_name.toUpperCase()}`)
      setPhone(livreur.phone)
    }
  }, [selectedLivreurId, livreurs])

  // 3. WHATSAPP LINK BUILDER (Robust)
  const waUrl = useMemo(() => {
    const cleaned = phone.replace(/\D/g, '')
    const intl = cleaned.startsWith('221') ? cleaned : '221' + cleaned
    return `https://wa.me/${intl}?text=${encodeURIComponent(waMessage)}`
  }, [phone, waMessage])

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* ── EDITOR PANEL ── */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl p-6 shadow-xl border border-slate-100 sticky top-4 no-print">
        <h2 className="font-display font-black text-xl text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" /> Éditeur de Carte
        </h2>

        <div className="space-y-4">
          {/* LIVREUR SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3 h-3" /> Partenaire Livreur
            </label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              value={selectedLivreurId}
              onChange={(e) => setSelectedLivreurId(e.target.value)}
            >
              <option value="default">-- Service Général --</option>
              {livreurs.map(l => (
                <option key={l.id} value={l.id}>{l.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom sur la carte</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slogan / Accroche</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone WhatsApp</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zones (Ligne 1)</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              value={zones}
              onChange={(e) => setZones(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zones (Ligne 2)</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              value={zones2}
              onChange={(e) => setZones2(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message pré-rempli</label>
            <textarea 
              rows={5}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-2">
            <button 
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/20"
            >
              <Printer className="w-4 h-4" /> Imprimer
            </button>
            <button 
              onClick={() => setSelectedLivreurId('default')}
              className="w-14 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              title="Réinitialiser"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
          <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-orange-800 leading-tight">
            <strong>Conseil :</strong> Imprimez sur du papier épais (250g+) et plastifiez les cartes pour une durabilité maximale dans les boutiques partenaires.
          </p>
        </div>
      </div>

      {/* ── PREVIEW PANEL ── */}
      <div className="flex-1 w-full overflow-x-auto pb-10 flex flex-col items-center gap-6">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 no-print flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-green-500" /> Prévisualisation Haute Fidélité
        </div>

        {/* THE CARD */}
        <div 
          id="marketing-card"
          className="print-card w-[860px] h-[460px] bg-[#0F172A] rounded-[2.5rem] flex overflow-hidden shadow-2xl relative shrink-0"
        >
          {/* Decorative accents */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-yellow-500"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-blue-500 to-transparent"></div>
          
          {/* Glows */}
          <div className="absolute -top-40 -left-20 w-[400px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-40 right-40 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full"></div>

          {/* LEFT CONTENT */}
          <div className="flex-1 p-12 pr-6 flex flex-col justify-between relative z-10">
            <div>
              <div className="mb-4">
                <div className="font-display font-black text-5xl text-white tracking-tighter leading-none uppercase italic">
                  {serviceName.includes('-') ? (
                    <>
                      {serviceName.split('-')[0]} 
                      <span className="text-orange-500">
                        {serviceName.split('-')[1]}
                      </span>
                    </>
                  ) : (
                    <>
                      NELAL <span className="text-orange-500">EX</span>PRESS
                    </>
                  )}
                </div>
                <div className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
                  Service de livraison · Sénégal 🇸🇳
                </div>
              </div>

              <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-transparent rounded-full mb-8"></div>

              <div className="font-display font-black text-xl text-white leading-tight mb-4 uppercase tracking-tight italic">
                {slogan}
              </div>

              <ul className="space-y-4">
                {[
                  'Scannez le QR code avec votre téléphone',
                  'WhatsApp s\'ouvre avec votre commande',
                  'On prend en charge et on livre ! 💨'
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-300 text-sm font-medium">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/20 flex items-center justify-center font-black text-[10px] text-orange-500">
                      {i + 1}
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <div className="space-y-1 mb-6 text-slate-500 font-bold text-[11px] uppercase tracking-wide italic">
                <div>{zones}</div>
                <div>{zones2}</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                  <Smartphone className="w-5 h-5 text-orange-500" />
                  <span className="font-display font-black text-xl text-white tracking-tight">{phone}</span>
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-4">
                  <span>💙 Wave</span>
                  <span>🟠 Orange Money</span>
                  <span>💵 Cash</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT (QR) */}
          <div className="w-[300px] bg-white/5 border-l border-white/5 p-12 flex flex-col items-center justify-center gap-6 relative z-10 text-center">
            <div className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em]">Scanner pour commander</div>
            
            <div className="bg-white p-5 rounded-[2rem] shadow-2xl relative">
              <QRCodeSVG 
                value={waUrl} 
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "https://nelal-express.vercel.app/icon-192x192.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-orange-500 rounded-tl-xl"></div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-orange-500 rounded-br-xl"></div>
            </div>

            <div className="space-y-1">
              <div className="text-white font-black text-sm uppercase tracking-tight">Ouvre WhatsApp</div>
              <div className="text-slate-500 text-[11px] font-medium leading-tight">remplis les infos<br/>et envoie ! 🚛</div>
            </div>

            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              WhatsApp Direct
            </div>
          </div>
        </div>

        {/* PRINT STYLES */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none !important;
            }
            #marketing-card, #marketing-card * {
              visibility: visible;
            }
            #marketing-card {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%) scale(0.9);
              background: white !important;
              color: black !important;
              box-shadow: none !important;
              border: 1px solid #ddd !important;
              border-radius: 20px !important;
            }
            #marketing-card * {
               color: black !important;
               border-color: #eee !important;
            }
            #marketing-card .text-orange-500 {
              color: #F97316 !important;
            }
            #marketing-card .bg-orange-500 {
              background-color: #F97316 !important;
            }
            /* Hide decorative glows in print */
            #marketing-card div[class*="blur"] {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
