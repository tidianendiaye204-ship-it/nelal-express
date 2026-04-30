'use client'

import { MessageSquare, Send, Phone, User } from 'lucide-react'
import { useState } from 'react'

interface AgentWhatsAppActionsProps {
  clientPhone?: string
  clientName?: string
  livreurPhone?: string
  livreurName?: string
  orderRef: string
}

export default function AgentWhatsAppActions({ 
  clientPhone, 
  clientName, 
  livreurPhone, 
  livreurName,
  orderRef
}: AgentWhatsAppActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sendWhatsApp = (phone: string, text: string) => {
    if (!phone) return
    const cleanPhone = phone.replace(/\s+/g, '').replace('+', '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const templates = {
    client: [
      { label: 'Relancer Client (Absent)', text: `Bonjour ${clientName || ''}, notre livreur est passé pour le colis #${orderRef} mais n'a pas pu vous joindre. Merci de nous recontacter.` },
      { label: 'Confirmation Adresse', text: `Bonjour ${clientName || ''}, nous avons besoin d'une précision sur l'adresse de livraison pour votre colis #${orderRef}.` },
    ],
    livreur: [
      { label: 'Urgence : Relance Livreur', text: `Salut ${livreurName || ''}, as-tu du nouveau pour le colis #${orderRef} ? Le client s'inquiète.` },
      { label: 'Changement Instruction', text: `Salut ${livreurName || ''}, il y a un changement d'instruction pour le colis #${orderRef}. Rappelle-moi dès que possible.` },
    ]
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Actions WhatsApp"
        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all border border-green-100"
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[110] bg-slate-900/10 backdrop-blur-[2px]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 w-64 z-[120] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 bg-slate-50 border-b border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions Rapides - #{orderRef}</p>
            </div>
            
            <div className="p-2 space-y-3 max-h-[300px] overflow-y-auto">
              {/* CLIENT SECTION */}
              {clientPhone && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <User className="w-3 h-3 text-blue-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">Client : {clientName}</span>
                  </div>
                  {templates.client.map((msg, i) => (
                    <button
                      key={`c-${i}`}
                      onClick={() => {
                        sendWhatsApp(clientPhone, msg.text)
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg transition-colors group text-left"
                    >
                      <span className="text-[10px] font-bold text-slate-700 leading-tight">{msg.label}</span>
                      <Send className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                    </button>
                  ))}
                  <a href={`tel:${clientPhone}`} className="w-full flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Phone className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Appeler</span>
                  </a>
                </div>
              )}

              <div className="border-t border-slate-50 my-1" />

              {/* LIVREUR SECTION */}
              {livreurPhone && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Phone className="w-3 h-3 text-orange-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">Livreur : {livreurName}</span>
                  </div>
                  {templates.livreur.map((msg, i) => (
                    <button
                      key={`l-${i}`}
                      onClick={() => {
                        sendWhatsApp(livreurPhone, msg.text)
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-orange-50 rounded-lg transition-colors group text-left"
                    >
                      <span className="text-[10px] font-bold text-slate-700 leading-tight">{msg.label}</span>
                      <Send className="w-3 h-3 text-slate-300 group-hover:text-orange-500" />
                    </button>
                  ))}
                  <a href={`tel:${livreurPhone}`} className="w-full flex items-center gap-2 p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                    <Phone className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Appeler</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
