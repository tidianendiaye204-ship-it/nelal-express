// lib/whatsapp.ts
// Utilitaire pour les notifications WhatsApp via l'API Twilio ou un lien direct

export type WaNotifType =
  | 'order_confirmed'
  | 'order_picked_up'
  | 'order_delivered'
  | 'order_cancelled'
  | 'new_order_admin'
  | 'new_order_livreur'

interface OrderNotifData {
  orderId: string
  clientName: string
  clientPhone: string
  recipientName: string
  recipientPhone: string
  description: string
  zoneFrom: string
  zoneTo: string
  livreurName?: string
  livreurPhone?: string
  price: number
  paymentMethod?: string
  trackingUrl?: string
  assignUrl?: string
  acceptUrl?: string
}

// ── Messages WhatsApp ────────────────────────────────────────────────────────

export function buildMessage(type: WaNotifType, data: OrderNotifData): string {
  switch (type) {
    case 'new_order_admin':
      return `🚨 *Nouvelle commande Nelal !*

📦 ${data.description}
📍 ${data.zoneFrom} → ${data.zoneTo}
👤 Client : ${data.clientName} · ${data.clientPhone}
🎯 Livrer à : ${data.recipientName} · ${data.recipientPhone}
💰 ${data.price.toLocaleString('fr-FR')} FCFA · 💳 ${data.paymentMethod}

⚡ Action rapide :
👉 ${data.assignUrl}`

    case 'new_order_livreur':
      return `🔔 *Course dispo dans ta zone !*

📦 ${data.description}
📍 ${data.zoneFrom} → ${data.zoneTo}
💰 ${data.price.toLocaleString('fr-FR')} FCFA

👉 Clique ici pour l'accepter : ${data.acceptUrl}`

    case 'order_confirmed': {
      const ref = data.orderId.split('-')[0].toUpperCase()
      return `✅ *Nelal Express — Commande confirmée*

Bonjour ${data.clientName} 👋

*Référence :* #${ref}

Votre commande a été confirmée et un livreur a été assigné.

📦 *Colis :* ${data.description}
🚴 *Livreur :* ${data.livreurName || '—'}
📍 *Trajet :* ${data.zoneFrom} → ${data.zoneTo}
💰 *Montant :* ${data.price.toLocaleString('fr-FR')} FCFA

🔗 Suivre votre commande : ${data.trackingUrl}

Merci de faire confiance à Nelal Express 🙏`
    }

    case 'order_picked_up':
      return `🚴 *Nelal Express — En route !*

Bonjour ${data.clientName},

Votre colis a été pris en charge par ${data.livreurName}.

📞 Contacter le livreur : ${data.livreurPhone}
🔗 Suivre : ${data.trackingUrl}

Livraison en cours vers *${data.zoneTo}* 🗺️`

    case 'order_delivered':
      return `🧾 *Nelal Express — Reçu de Livraison*
      
Bonjour ${data.clientName}, votre colis a bien été livré ! ✅

---
DÉTAILS DU REÇU :
📦 *Colis :* ${data.description}
🎯 *Destinataire :* ${data.recipientName}
📍 *Trajet :* ${data.zoneFrom} → ${data.zoneTo}
🚴 *Livreur :* ${data.livreurName}

MONTANT TOTAL :
💰 *${data.price.toLocaleString('fr-FR')} FCFA*
---

Merci pour votre confiance. À bientôt sur Nelal Express ! 🙏
_Document numérique — Fait à Dakar_`

    case 'order_cancelled':
      return `❌ *Nelal Express — Commande annulée*

Bonjour ${data.clientName},

Votre commande a été annulée.

Si vous avez des questions, contactez-nous directement.
_Nelal Express_`
  }
}

// ── Lien WhatsApp direct ────────────────────────────────────────────────────

export function whatsappLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const international = cleaned.startsWith('221') ? cleaned : `221${cleaned}`
  return `https://wa.me/${international}?text=${encodeURIComponent(message || 'Bonjour, c\'est le livreur Nelal Express.')}`
}

// ── Envoi via Green-API (WhatsApp Web Bridge) ───────────────────────────────
export async function sendWhatsAppNotification(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const ID_INSTANCE = process.env.GREEN_API_ID_INSTANCE
  const API_TOKEN_INSTANCE = process.env.GREEN_API_TOKEN_INSTANCE

  // Mode développement : juste logger le message si clés absentes
  if (!ID_INSTANCE || !API_TOKEN_INSTANCE) {
    console.warn('[WhatsApp Notif - DEV MODE] Green-API keys missing. Message not sent via API.')
    console.log(`To: ${phone}\nMessage:\n${message}`)
    return { success: true }
  }

  try {
    // Nettoyage du numéro : on veut seulement les chiffres ex: 221770000000
    const cleaned = phone.replace(/\D/g, '')
    const international = cleaned.startsWith('221') ? cleaned : `221${cleaned}`
    
    // Format Green-API pour un chat individuel
    const chatId = `${international}@c.us`

    const response = await fetch(
      `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          message: message,
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return { success: false, error: err.message || 'Error sending message' }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
