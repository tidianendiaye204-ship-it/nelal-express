'use client'

import { MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react'
import { useState } from 'react'

interface WhatsAppQuickActionsProps {
  phone: string
  orderId: string
  type: 'pickup' | 'delivery'
}

export default function WhatsAppQuickActions({ phone, orderId, type }: WhatsAppQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const messages = type === 'pickup' ? [
    { label: 'Je suis en route', text: 'Bonjour, je suis le livreur Nelal. Je suis en route pour récupérer votre colis.' },
    { label: 'Je suis arrivé', text: 'Bonjour, je suis arrivé au point de ramassage.' },
    { label: 'Où êtes-vous ?', text: 'Bonjour, je suis arrivé mais je ne vous vois pas. Pouvez-vous me préciser votre position ?' },
  ] : [
    { label: 'Je suis en route', text: 'Bonjour, je suis le livreur Nelal. Je suis en route pour vous livrer votre colis.' },
    { label: 'Je suis arrivé', text: 'Bonjour, je suis devant votre porte pour la livraison Nelal.' },
    { label: 'Besoin du code', text: 'Bonjour, je suis arrivé. Pourriez-vous me préparer le code de confirmation à 4 chiffres svp ?' },
  ]

  const sendWhatsApp = (text: string) => {
    const cleanPhone = phone.replace(/\s+/g, '').replace('+', '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 bg-green-50 text-green-600 border border-green-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
      >
        <MessageSquare className="w-4 h-4" /> Messages Rapides
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-3 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-1">
              {messages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sendWhatsApp(msg.text)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-700">{msg.label}</span>
                  <Send className="w-3.5 h-3.5 text-slate-300 group-hover:text-green-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
