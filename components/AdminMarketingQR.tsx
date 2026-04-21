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
  const [format, setFormat] = useState<'business' | 'square' | 'story'>('business')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

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

  // 4. DIMENSIONS HELPERS
  const cardStyles = {
    business: 'w-[850px] h-[480px] rounded-[2.5rem]',
    square: 'w-[600px] h-[600px] rounded-[3rem]',
    story: 'w-[500px] h-[888px] rounded-[3rem]'
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* ── EDITOR PANEL ── */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl p-6 shadow-xl border border-slate-100 sticky top-4 no-print transition-all">
        <h2 className="font-display font-black text-xl text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" /> Éditeur de Carte
        </h2>

        <div className="space-y-6">
          {/* FORMAT SELECTOR */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format de la carte</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'business', label: 'Pro', desc: '85x55' },
                { id: 'square', label: 'Carré', desc: 'Sticker' },
                { id: 'story', label: 'Story', desc: 'WhatsApp' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as any)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    format === f.id ? 'border-orange-500 bg-orange-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase">{f.label}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* THEME SELECTOR */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Thème Visuel</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{theme === 'dark' ? 'Premium / Réseaux' : 'Éco / Impression'}</p>
             </div>
             <div className="flex bg-white p-1 rounded-xl shadow-inner border border-slate-100">
                <button onClick={() => setTheme('dark')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${theme === 'dark' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>Dark</button>
                <button onClick={() => setTheme('light')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${theme === 'light' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400'}`}>Light</button>
             </div>
          </div>

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
          className={`print-card ${cardStyles[format]} flex ${format === 'business' ? 'flex-row' : 'flex-col'} overflow-hidden shadow-2xl relative shrink-0 transition-all duration-500 ${
            theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white border border-slate-200'
          }`}
        >
          {/* Decorative accents */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-yellow-500"></div>
          {theme === 'dark' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-blue-500 to-transparent"></div>}
          
          {/* Glows (Dark only) */}
          {theme === 'dark' && (
            <>
              <div className="absolute -top-40 -left-20 w-[400px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full"></div>
              <div className="absolute -bottom-40 right-40 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full"></div>
            </>
          )}

          {/* LEFT/TOP CONTENT */}
          <div className={`p-12 flex flex-col justify-between relative z-10 ${format === 'business' ? 'flex-1 pr-6' : 'h-1/2 w-full pb-6'}`}>
            <div>
              <div className="mb-4">
                <div className={`font-display font-black tracking-tighter leading-none uppercase italic ${format === 'business' ? 'text-5xl' : 'text-4xl'} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
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

              <div className={`font-display font-black text-xl leading-tight mb-4 uppercase tracking-tight italic ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                {slogan}
              </div>

              {format === 'business' && (
                <ul className="space-y-4">
                  {[
                    'Scannez le QR code',
                    'WhatsApp s\'ouvre direct',
                    'On prend en charge ! 💨'
                  ].map((step, i) => (
                    <li key={i} className={`flex items-center gap-4 text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-orange-500 ${theme === 'dark' ? 'bg-white/5 border border-white/20' : 'bg-slate-100 border border-slate-200'}`}>
                        {i + 1}
                      </div>
                      {step}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {(format === 'business' || format === 'square') && (
              <div className="mt-8">
                <div className={`space-y-1 mb-6 font-bold text-[11px] uppercase tracking-wide italic ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <div>{zones}</div>
                  {format === 'business' && <div>{zones2}</div>}
                </div>

                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
                    <Smartphone className="w-5 h-5 text-orange-500" />
                    <span className={`font-display font-black text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{phone}</span>
                  </div>
                  {format === 'business' && (
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-4">
                      <span>💙 Wave</span>
                      <span>🟠 Orange Money</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT/BOTTOM CONTENT (QR) */}
          <div className={`bg-white/5 border-white/5 p-12 flex flex-col items-center justify-center gap-6 relative z-10 text-center ${
            format === 'business' ? 'w-[300px] border-l' : 'flex-1 border-t w-full'
          }`}>
            <div className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Scanner pour commander</div>
            
            <div className={`p-5 rounded-[2.5rem] shadow-2xl relative ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-white'}`}>
              <QRCodeSVG 
                value={waUrl} 
                size={format === 'business' ? 160 : 200}
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

            <div className="space-y-4">
              <div className="space-y-1">
                <div className={`font-black text-sm uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Ouvre WhatsApp</div>
                <div className="text-slate-500 text-[11px] font-medium leading-tight">remplis les infos<br/>et envoie ! 🚛</div>
              </div>

              <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                WhatsApp Direct
              </div>
            </div>
          </div>
        </div>

        {/* PRINT STYLES */}
        <style jsx global>{`
          @media print {
            @page {
              size: auto;
              margin: 10mm;
            }
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
              transform: translate(-50%, -50%) ${format === 'story' ? 'scale(0.6)' : 'scale(0.8)'};
              background: ${theme === 'dark' ? '#0F172A' : 'white'} !important;
              color: ${theme === 'dark' ? 'white' : 'black'} !important;
              box-shadow: none !important;
              border: ${theme === 'light' ? '1px solid #ddd' : 'none'} !important;
              border-radius: 20px !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            #marketing-card .text-orange-500 {
              color: #F97316 !important;
            }
            #marketing-card .bg-orange-500 {
              background-color: #F97316 !important;
            }
            /* Hide decorative glows in print to save ink if needed */
            #marketing-card div[class*="blur"] {
              opacity: 0.2 !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
