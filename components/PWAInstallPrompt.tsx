'use client'

import { useState, useEffect } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { Download, Share, PlusSquare, X, ArrowUp } from 'lucide-react'

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, handleInstall } = usePWAInstall()
  const [isVisible, setIsVisible] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé le prompt dans cette session
    const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed')
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Petit délai pour ne pas agresser l'utilisateur dès le chargement
    const timer = setTimeout(() => {
      if (!isInstalled && (isInstallable || isIOS)) {
        setIsVisible(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isInstallable, isInstalled, isIOS])

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  if (!isVisible || isInstalled || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-8 md:max-w-md">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 shadow-2xl ring-1 ring-white/10">
        {/* Dégradé de fond subtil */}
        <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-orange-500/10 blur-3xl" />

        {/* Bouton fermer */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white transition-all z-10"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative flex items-start gap-4 pr-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <Download className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-white">Nelal Express</h3>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              Installez l&apos;application pour une expérience plus rapide et recevoir vos notifications.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {isIOS ? (
                <button
                  onClick={() => setShowIOSInstructions(true)}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:scale-95"
                >
                  Comment installer ?
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
                onClick={handleDismiss}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>

        {/* Instructions spécifiques iOS */}
        {showIOSInstructions && (
          <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
              📱 Instructions pour iPhone / iPad
            </p>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white text-xs">1</span>
              <span>Appuyez sur le bouton <strong className="text-white">Partager</strong> <ArrowUp className="inline h-4 w-4 mx-0.5 text-orange-400" /> en bas de Safari.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white text-xs">2</span>
              <span>Faites défiler et appuyez sur <strong className="text-white">&quot;Sur l&apos;écran d&apos;accueil&quot;</strong> <PlusSquare className="inline h-4 w-4 mx-0.5 text-orange-400" />.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white text-xs">3</span>
              <span>Appuyez sur <strong className="text-white">&quot;Ajouter&quot;</strong> en haut à droite.</span>
            </div>
            <div className="mt-2 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <p className="text-[11px] text-orange-300 font-medium">
                ⚠️ L&apos;installation ne fonctionne que sur <strong>Safari</strong>. Si vous utilisez Chrome ou un autre navigateur, ouvrez d&apos;abord le lien dans Safari.
              </p>
            </div>
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="w-full rounded-lg bg-white/5 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              Compris ✓
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
