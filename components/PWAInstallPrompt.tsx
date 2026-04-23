'use client'

import { useState, useEffect } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { X, Download, Share, PlusSquare } from 'lucide-react'

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, handleInstall } = usePWAInstall()
  const [isVisible, setIsVisible] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Petit délai pour ne pas agresser l'utilisateur dès le chargement
    const timer = setTimeout(() => {
      if (!isInstalled && (isInstallable || isIOS)) {
        // Vérifier si l'utilisateur l'a fermé temporairement dans cette session
        const dismissed = sessionStorage.getItem('pwa-prompt-dismissed')
        if (!dismissed) {
          setIsVisible(true)
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isInstallable, isInstalled, isIOS])

  const dismissPrompt = () => {
    setIsVisible(false)
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  if (!isVisible || isInstalled) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-8 md:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 shadow-2xl ring-1 ring-white/10">
        {/* Dégradé de fond subtil */}
        <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <Download className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-syne text-lg font-bold text-white">Nelal Express</h3>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              Installez l&apos;application pour une expérience plus rapide et recevoir vos notifications de livraison.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {isIOS ? (
                <button
                  onClick={() => setShowIOSInstructions(true)}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:scale-95"
                >
                  Installer l&apos;App
                </button>
              ) : (
                <button
                  onClick={handleInstall}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:scale-95"
                >
                  Installer maintenant
                </button>
              )}
              
              <button
                onClick={dismissPrompt}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                Plus tard
              </button>
            </div>
          </div>

          <button
            onClick={dismissPrompt}
            className="rounded-full p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions spécifiques iOS */}
        {showIOSInstructions && (
          <div className="mt-5 space-y-4 border-t border-white/10 pt-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-bold text-white">1</span>
              <span>Appuyez sur le bouton de partage <Share className="inline h-4 w-4 mx-1" /> en bas de l&apos;écran.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-bold text-white">2</span>
              <span>Faites défiler et appuyez sur &quot;Sur l&apos;écran d&apos;accueil&quot; <PlusSquare className="inline h-4 w-4 mx-1" />.</span>
            </div>
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="w-full rounded-lg bg-white/5 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              Compris
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
