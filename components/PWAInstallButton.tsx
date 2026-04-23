'use client'

import { usePWAInstall } from '@/hooks/usePWAInstall'
import { Download, Share, PlusSquare, Smartphone } from 'lucide-react'
import { useState } from 'react'

export default function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, handleInstall } = usePWAInstall()
  const [showIOSPopup, setShowIOSPopup] = useState(false)

  // Si déjà installé ou si l'API PWA n'est pas dispo (et pas iOS), on n'affiche rien
  if (isInstalled || (!isInstallable && !isIOS)) return null

  return (
    <div className="w-full">
      <button
        onClick={() => isIOS ? setShowIOSPopup(true) : handleInstall()}
        className="group relative w-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-white/10 shadow-xl active:scale-[0.98] transition-all"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
        
        <div className="relative flex items-center gap-5 text-left">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-6 transition-transform">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="text-white font-black text-lg uppercase tracking-tight leading-none mb-1">Installer l&apos;Application</h4>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-80">Plus rapide · Sans navigateur · Notifications</p>
          </div>
          <div className="ml-auto w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <Download className="w-5 h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Modal d'instructions pour iOS */}
      {showIOSPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Share className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic text-center mb-6">Installation iPhone</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
                <p className="text-sm text-slate-600 font-medium">Appuyez sur le bouton de partage <Share className="inline h-4 w-4 mx-1 text-slate-900" /> en bas de Safari.</p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
                <p className="text-sm text-slate-600 font-medium">Choisissez <span className="font-bold">&quot;Sur l&apos;écran d&apos;accueil&quot;</span> <PlusSquare className="inline h-4 w-4 mx-1 text-slate-900" /> dans la liste.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowIOSPopup(false)}
              className="w-full mt-10 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              C&apos;est compris !
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
