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
  const [phone, setPhone] = useState('71 116 53 68')
  const [waMessage, setWaMessage] = useState(`Salam ! Je veux commander via Nelal Express 🚀

📦 Colis :
📍 Départ :
📍 Destination :
👤 Destinataire :
📞 Tel :
💳 Paiement : Wave / Orange / Cash`)

  const [selectedLivreurId, setSelectedLivreurId] = useState('')
  const [format, setFormat] = useState<'large' | 'a5'>('a5')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. AUTOMATIC UPDATES WHEN LIVREUR SELECTED
  useEffect(() => {
    if (selectedLivreurId === 'default') {
      setServiceName('NELAL EXPRESS')
      setPhone('71 116 53 68')
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

  // 4. DIMENSIONS HELPERS (mm for print, px for preview base)
  const formatData = {
    a5: { label: 'Flyer A5 (Top)', desc: '148x210mm', w: 148, h: 210, qrSize: 220, rounded: '3rem', layout: 'col' },
    large: { label: 'Carte Visite', desc: '105x74mm', w: 105, h: 74, qrSize: 180, rounded: '2rem', layout: 'row' }
  }

  // Dynamic Font Scaling Logic
  const getFontSize = (text: string, base: number, min: number = 14) => {
    const len = text.length
    if (len < 10) return base
    const scaled = Math.max(min, base - (len - 10) * 0.5)
    return scaled
  }


  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <div className="animate-pulse text-slate-400 font-black text-xs uppercase tracking-widest">Initialisation de l&apos;outil...</div>
      </div>
    )
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choix du format idéal</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(formatData) as Array<keyof typeof formatData>).map((fid) => (
                <button
                  key={fid}
                  onClick={() => setFormat(fid)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    format === fid ? 'border-orange-500 bg-orange-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className="text-xs font-black uppercase text-center leading-tight">{formatData[fid].label}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{formatData[fid].desc}</span>
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
      <div className="flex-1 w-full flex flex-col items-center gap-6 overflow-hidden">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 no-print flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-green-500" /> Prévisualisation Adaptative
        </div>

        {/* RESPONSIVE CONTAINER FOR SCALE */}
        <div className="w-full flex justify-center py-4">
          <div className={`relative transition-all duration-500 flex items-center justify-center min-h-[600px]`}>
            {/* THE CARD */}
            <div 
              id="marketing-card"
              style={{
                width: `${formatData[format].w}mm`,
                height: `${formatData[format].h}mm`,
                borderRadius: formatData[format].rounded
              }}
              className={`print-card flex flex-col overflow-hidden shadow-2xl shrink-0 transition-all duration-500 scale-[0.5] sm:scale-[0.8] md:scale-90 lg:scale-100 ${
                theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white border border-slate-200'
              }`}
            >
          {/* Decorative accents */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-transparent"></div>
          {theme === 'dark' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-blue-500 to-transparent"></div>}
          
          {/* Glows (Dark only) */}
          {theme === 'dark' && (
            <>
              <div className="absolute -top-40 -left-20 w-[400px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full"></div>
              <div className="absolute -bottom-40 right-40 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full"></div>
            </>
          )}

          {/* ── TOP SECTION: SERVICE NAME ── */}
          <div className={`pt-12 px-10 pb-6 w-full text-center border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
            <div 
              style={{ fontSize: getFontSize(serviceName, format === 'a5' ? 36 : 24, 18) + 'px' }}
              className={`font-display font-black tracking-tighter leading-[1.2] uppercase italic break-words ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              {serviceName}
            </div>
            <div className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
              Service de livraison · Sénégal 🇸🇳
            </div>
          </div>

          {/* ── MIDDLE SECTION: VALUE PROP ── */}
          <div className="flex-1 px-10 py-8 w-full flex flex-col items-center justify-center gap-6">
            <div 
              style={{ fontSize: getFontSize(slogan, format === 'a5' ? 20 : 14, 12) + 'px' }}
              className={`font-display font-black leading-tight uppercase tracking-tight italic opacity-90 max-w-[90%] mx-auto ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}
            >
              {slogan}
            </div>

            <div className={`h-0.5 w-16 bg-orange-500/30 rounded-full`}></div>

            <div className={`font-bold uppercase tracking-widest italic text-center space-y-1 ${format === 'a5' ? 'text-sm' : 'text-[9px]'} ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className="flex items-center justify-center gap-2">📍 {zones}</div>
              <div className="flex items-center justify-center gap-2">🚌 {zones2}</div>
            </div>
          </div>

          {/* ── BOTTOM SECTION: CONTACT & QR ── */}
          <div className={`p-8 w-full flex flex-col items-center gap-6 border-t ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            
            {/* Phone Badge */}
            <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <Smartphone className="w-5 h-5 text-orange-500" />
                <span className={`font-display font-black tracking-tighter ${format === 'a5' ? 'text-3xl' : 'text-xl'} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{phone}</span>
            </div>

            {/* QR Code with fixed size based on format */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-orange-500 text-[9px] font-black uppercase tracking-[0.3em]">Scanner & Communiquer</div>
              <div className={`p-4 rounded-[2rem] shadow-xl relative ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-white'}`}>
                <QRCodeSVG 
                  value={waUrl} 
                  size={format === 'a5' ? 180 : 140}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/icon.svg",
                    x: undefined,
                    y: undefined,
                    height: 35,
                    width: 35,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className={`font-black uppercase tracking-tight ${format === 'a5' ? 'text-lg' : 'text-xs'} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Ouvrir WhatsApp direct</div>
              <div className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                Service client Nelal
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* PRINT STYLES */}
        <style jsx global>{`
          @media print {
            @page {
              size: auto;
              margin: 15mm;
            }
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            body * {
              visibility: hidden;
              overflow: visible !important;
            }
            /* Reset container for print */
            #__next, main, .max-w-7xl, .flex, .flex-1, .w-full {
              display: block !important;
              visibility: visible !important;
              position: static !important;
              margin: 0 !important;
              padding: 0 !important;
              width: auto !important;
              height: auto !important;
            }
            .no-print, .no-print * {
              display: none !important;
            }
            #marketing-card {
              visibility: visible !important;
              display: flex !important;
              position: relative !important;
              margin: 0 auto !important;
              transform: none !important;
              left: auto !important;
              top: auto !important;
              box-shadow: none !important;
              border: ${theme === 'light' ? '0.5pt solid #ddd' : 'none'} !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            #marketing-card * {
              visibility: visible !important;
            }
            #marketing-card .text-orange-500 { color: #F97316 !important; }
            #marketing-card .bg-orange-500 { background-color: #F97316 !important; }
            #marketing-card svg { display: block !important; }
          }
        `}</style>
      </div>
    </div>
  )
}
