'use client'

import { usePWAInstall } from '@/hooks/usePWAInstall'
import { Download, Smartphone } from 'lucide-react'
import { useState } from 'react'

export default function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, handleInstall } = usePWAInstall()
  const [showIOSTip, setShowIOSTip] = useState(false)

  if (isInstalled || (!isInstallable && !isIOS)) return null

  return (
    <div className="w-full">
      <button
        onClick={() => isIOS ? setShowIOSTip(true) : handleInstall()}
        className="group relative w-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-white/10 shadow-xl active:scale-[0.98] transition-all"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
        
        <div className="relative flex items-center gap-5 text-left">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-6 transition-transform">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-black text-lg uppercase tracking-tight leading-none mb-1">Installer l&apos;App</h4>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-80">Accès rapide · Notifications</p>
          </div>
          <div className="ml-auto w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <Download className="w-5 h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Popup iOS : simple et direct */}
      {showIOSTip && (
        <div 
          className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-900/70 backdrop-blur-sm"
          onClick={() => setShowIOSTip(false)}
        >
          <div 
            className="bg-white rounded-t-[2rem] p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-xl">N</span>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Installer Nelal Express</h3>
                <p className="text-slate-400 text-xs font-medium">2 taps et c&apos;est fait !</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-black shrink-0">1</div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  Tapez sur
                  <span className="inline-flex items-center px-2 py-1 bg-slate-200 rounded-lg">
                    <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-black shrink-0">2</div>
                <p className="text-sm font-bold text-slate-700">
                  <span className="text-orange-500">&quot;Sur l&apos;écran d&apos;accueil&quot;</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowIOSTip(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-wide active:scale-95 transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
