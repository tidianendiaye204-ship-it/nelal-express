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
}

// ── Messages WhatsApp ────────────────────────────────────────────────────────

export function buildMessage(type: WaNotifType, data: OrderNotifData): string {
  const ref = data.orderId.slice(0, 8).toUpperCase()

  switch (type) {
    case 'new_order_admin':
      return `🚨 *Nouvelle commande Nelal !*

📦 ${data.description}
📍 ${data.zoneFrom} → ${data.zoneTo}
👤 Client : ${data.clientName} · ${data.clientPhone}
🎯 Livrer à : ${data.recipientName} · ${data.recipientPhone}
💰 ${data.price.toLocaleString('fr-FR')} FCFA · 💳 ${data.paymentMethod}

⚡ Action rapide :
👉 ${data.assignUrl}

────────────────
Réf : #${ref}`

    case 'new_order_livreur':
      return `🔔 *Course dispo dans ta zone !*

📦 ${data.description}
📍 ${data.zoneFrom} → ${data.zoneTo}
💰 ${data.price.toLocaleString('fr-FR')} FCFA

👉 Réponds "OK" pour la prendre ou clique ici : ${data.assignUrl}

Réf : #${ref}`

    case 'order_confirmed':
      return `✅ *Nelal Express — Commande confirmée*

Bonjour ${data.clientName} 👋

Votre commande *#${ref}* a été confirmée et un livreur a été assigné.

📦 *Colis :* ${data.description}
🚴 *Livreur :* ${data.livreurName || '—'}
📍 *Trajet :* ${data.zoneFrom} → ${data.zoneTo}
💰 *Montant :* ${data.price.toLocaleString('fr-FR')} FCFA

🔗 Suivre votre commande : ${data.trackingUrl}

Merci de faire confiance à Nelal Express 🙏`

    case 'order_picked_up':
      return `🚴 *Nelal Express — En route !*

Bonjour ${data.clientName},

Votre colis *#${ref}* a été pris en charge par ${data.livreurName}.

📞 Contacter le livreur : ${data.livreurPhone}
🔗 Suivre : ${data.trackingUrl}

Livraison en cours vers *${data.zoneTo}* 🗺️`

    case 'order_delivered':
      return `🎉 *Nelal Express — Livré !*

Bonjour ${data.clientName},

Votre colis *#${ref}* a été livré à *${data.recipientName}* avec succès ✅

💰 Montant : *${data.price.toLocaleString('fr-FR')} FCFA*

Merci pour votre confiance. N'hésitez pas à nous recommander ! 🙏
_Nelal Express — Dakar & Intérieur_`

    case 'order_cancelled':
      return `❌ *Nelal Express — Commande annulée*

Bonjour ${data.clientName},

Votre commande *#${ref}* a été annulée.

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

// ── Envoi via Meta WhatsApp Cloud API (Direct) ────────────────────────────────
export async function sendMetaWhatsAppMessage(
  to: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.warn('[WhatsApp Meta - DEV MODE] Meta keys missing. Logging instead.')
    console.log(`To: ${to}\nMessage: ${text}`)
    return { success: true }
  }

  try {
    const cleaned = to.replace(/\D/g, '')
    const international = cleaned.startsWith('221') ? cleaned : `221${cleaned}`

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: international,
          type: 'text',
          text: { body: text },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return { success: false, error: err.error?.message || 'Unknown error' }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ── Envoi via Twilio WhatsApp API ────────────────────────────────────────────
// (Gardé pour compatibilité existante)

export async function sendWhatsAppNotification(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
  const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM // ex: whatsapp:+14155238886

  // Mode développement : juste logger le message
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('[WhatsApp Notif - DEV MODE] Twilio keys missing. Message not sent via SMS.')
    console.warn(`To: ${phone}\nMessage:\n${message}`)
    return { success: true }
  }

  try {
    const cleaned = phone.replace(/\D/g, '')
    const international = cleaned.startsWith('221') ? cleaned : `221${cleaned}`

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_FROM!,
          To: `whatsapp:+${international}`,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return { success: false, error: err.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
