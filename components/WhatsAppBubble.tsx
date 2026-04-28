'use client'

import { MessageCircle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function WhatsAppBubble() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Afficher la bulle après 3 secondes
    const timer = setTimeout(() => {
      if (!isDismissed) setIsVisible(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [isDismissed])

  if (isDismissed) {
    return (
      <a
        href="https://wa.me/221770000000?text=Bonjour,%20j'ai%20besoin%20d'aide%20pour%20une%20livraison"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#25D366]/30 transition-all hover:scale-110 active:scale-95"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 transition-all duration-500 origin-bottom-right ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
      {/* Tooltip Message */}
      <div className="bg-white text-slate-900 p-4 rounded-2xl rounded-br-sm shadow-2xl relative max-w-[200px] border border-slate-100">
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full p-1 shadow-sm transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
        <p className="text-sm font-medium leading-tight">
          Une question ?<br/>
          <span className="text-slate-500 text-xs">Notre équipe répond en moins de 5 min ⚡️</span>
        </p>
      </div>

      {/* Bouton WhatsApp */}
      <a
        href="https://wa.me/221770000000?text=Bonjour,%20j'ai%20besoin%20d'aide%20pour%20une%20livraison"
        target="_blank"
        rel="noopener noreferrer"
        className="relative group flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25"></div>
        <div className="w-16 h-16 bg-[#25D366] group-hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#25D366]/40 transition-all group-hover:scale-110 active:scale-95 z-10">
          <MessageCircle className="w-8 h-8" />
        </div>
      </a>
    </div>
  )
}
