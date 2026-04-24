'use client'

import { useState, useEffect } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { Download, X } from 'lucide-react'

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, handleInstall } = usePWAInstall()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed')
    if (wasDismissed) return

    const timer = setTimeout(() => {
      if (!isInstalled && (isInstallable || isIOS)) {
        setIsVisible(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isInstallable, isInstalled, isIOS])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  if (!isVisible || isInstalled) return null

  // Sur iOS : afficher une flèche vers le bouton partage de Safari
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] pb-safe">
        {/* Flèche qui pointe vers le bas (bouton partage Safari) */}
        <div className="mx-4 mb-3 relative">
          <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl ring-1 ring-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <p className="text-white text-sm font-bold flex-1">
              Appuyez sur
              <span className="inline-flex items-center mx-1.5 px-2 py-0.5 bg-white/10 rounded-lg">
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </span>
              puis <strong className="text-orange-400">&quot;Écran d&apos;accueil&quot;</strong>
            </p>
            <button onClick={handleDismiss} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-slate-400 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Flèche vers le bas */}
          <div className="flex justify-center">
            <div className="w-4 h-4 bg-slate-900 rotate-45 -mt-2"></div>
          </div>
        </div>
      </div>
    )
  }

  // Sur Android/Desktop : bouton d'installation direct
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-8 md:max-w-sm">
      <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl ring-1 ring-white/10 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <p className="text-white text-sm font-bold flex-1">Installer Nelal Express</p>
        <button
          onClick={handleInstall}
          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide active:scale-95 transition-transform shrink-0"
        >
          Installer
        </button>
        <button onClick={handleDismiss} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-slate-400 shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
