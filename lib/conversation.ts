// lib/conversation.ts
import { createAdminClient } from '@/lib/supabase/server'


export type BotState = 
  | 'IDLE' 
  | 'AWAITING_DEPART' 
  | 'AWAITING_ARRIVEE' 
  | 'AWAITING_NAME' 
  | 'AWAITING_PHONE' 
  | 'AWAITING_CONFIRMATION'

interface ConversationData {
  quartierDepart?: string
  quartierDepartId?: string
  quartierArrivee?: string
  quartierArriveeId?: string
  recipientName?: string
  recipientPhone?: string
}

async function findQuartier(name: string) {
  const supabase = createAdminClient()
  // Utilisation de la recherche floue pg_trgm (similitude > 0.3)
  const { data } = await supabase
    .rpc('search_quartiers', { search_query: name })
  
  // Fallback sur ILIKE si RPC non dispo ou pas de match flou
  if (!data) {
    const { data: fallback } = await supabase
      .from('quartiers')
      .select('id, nom')
      .ilike('nom', `%${name}%`)
      .limit(1)
      .single()
    return fallback
  }
  return data
}

export async function handleWhatsAppMessage(waId: string, text: string) {
  const supabase = createAdminClient()
  const cleanText = text.trim()
  const lowerText = cleanText.toLowerCase()

  // 1. Récupérer ou créer la conversation
  let { data: convo } = await supabase
    .from('conversations')
    .select('*')
    .eq('wa_id', waId)
    .single()

  if (!convo) {
    const { data: newConvo } = await supabase
      .from('conversations')
      .insert({ wa_id: waId, state: 'IDLE', data: {} })
      .select()
      .single()
    convo = newConvo
  }

  const state = convo?.state as BotState
  const data = (convo?.data || {}) as ConversationData

  // 2. Machine à états
  switch (state) {
    case 'IDLE': {
      if (['commande', 'colis', 'envoyer', 'livraison', 'nouveau', 'salut', 'bonjour'].some(k => lowerText.includes(k))) {
        await updateConvo(waId, 'AWAITING_DEPART', {})
        return "📍 Bonjour ! C'est parti pour votre commande. Quel est le *quartier de départ* ? (Ex: Médina, Point E, Keur Massar...)"
      }
      return "Bonjour ! Tapez *'commande'* pour envoyer un colis. 📦"
    }

    case 'AWAITING_DEPART': {
      const quartierFrom = await findQuartier(cleanText)
      if (!quartierFrom) {
        return `🤔 Je ne reconnais pas le quartier "${cleanText}". Pouvez-vous reformuler ? (Ex: Médina, Point E, Keur Massar...)`
      }
      await updateConvo(waId, 'AWAITING_ARRIVEE', { 
        ...data, 
        quartierDepart: quartierFrom.nom,
        quartierDepartId: quartierFrom.id 
      })
      return `📍 Reçu : Départ de *${quartierFrom.nom}*.\n\nQuelle est la *destination* ?`
    }

    case 'AWAITING_ARRIVEE': {
      const quartierTo = await findQuartier(cleanText)
      if (!quartierTo) {
        return `🤔 Je ne reconnais pas le quartier "${cleanText}". Pouvez-vous reformuler ?`
      }
      await updateConvo(waId, 'AWAITING_NAME', { 
        ...data, 
        quartierArrivee: quartierTo.nom,
        quartierArriveeId: quartierTo.id 
      })
      return `👤 Parfait. Quel est le *Nom complet* du destinataire ?`
    }

    case 'AWAITING_NAME': {
      await updateConvo(waId, 'AWAITING_PHONE', { ...data, recipientName: cleanText })
      return `📞 Quel est le *numéro WhatsApp* du destinataire ? (Format: 77XXXXXXX)`
    }

    case 'AWAITING_PHONE': {
      const phoneMatch = cleanText.replace(/\s/g, '').match(/^(70|75|76|77|78)\d{7}$/)
      if (!phoneMatch) {
        return "⚠️ Format invalide. Veuillez saisir un numéro sénégalais valide à 9 chiffres (ex: 771234567)."
      }
      const phone = phoneMatch[0]
      await updateConvo(waId, 'AWAITING_CONFIRMATION', { ...data, recipientPhone: phone })
      
      return `📦 *RÉCAPITULATIF* :\n\n` +
             `🏠 Départ : ${data.quartierDepart || 'Non détecté'}\n` +
             `🎯 Arrivée : ${data.quartierArrivee || 'Non détecté'}\n` +
             `👤 Destinataire : ${data.recipientName || 'Non précisé'} (${phone})\n\n` +
             `Confirmez-vous cette commande ? (Répondez *OUI* ou *NON*)`
    }

    case 'AWAITING_CONFIRMATION': {
      if (lowerText === 'oui' || lowerText === 'ok') {
        try {
          // 1. Création de la commande
          const { order, trackingToken } = await createBotOrder(waId, data)
          
          await updateConvo(waId, 'IDLE', {})
          
          return `✅ *COMMANDE CONFIRMÉE !*\n\n` +
                 `📦 Votre commande a été enregistrée.\n` +
                 `🔢 Code de suivi : *NEL-${order.id.slice(0, 4).toUpperCase()}*\n` +
                 `🔐 Code de livraison : *${order.delivery_code}* (À donner au livreur).\n\n` +
                 `🔗 Suivez votre colis ici :\n` +
                 `https://nelal-express.vercel.app/t/${trackingToken}\n\n` +
                 `Un livreur vous contactera pour la récupération.`
        } catch (err: any) {
          console.error('[Bot Order Error]', err)
          return "❌ Désolé, une erreur est survenue lors de la création de la commande. Veuillez réessayer plus tard."
        }
      } else if (lowerText === 'non' || lowerText === 'annuler') {
        await updateConvo(waId, 'IDLE', {})
        return "Commande annulée. N'hésitez pas si vous avez besoin d'autre chose ! 😊"
      }
      return "Veuillez répondre par *OUI* ou *NON* pour confirmer."
    }

    default:
      await updateConvo(waId, 'IDLE', {})
      return "Oups, je me suis un peu perdu. Recommençons ! Tapez *'commande'*."
  }
}

async function createBotOrder(waId: string, data: ConversationData) {
  const supabase = createAdminClient()
  
  // 1. Gérer le profil (Ghost Profile si nouveau)
  let { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', waId)
    .single()
    
  if (!profile) {
    // Note: Dans un vrai système, on utiliserait le nom WhatsApp s'il est dispo
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(), // Utiliser l'id de la table conversations ou aléatoire si pas lié à auth.users
        full_name: 'Client WhatsApp',
        phone: waId,
        role: 'client'
      })
      .select('id')
      .single()
    profile = newProfile
  }

  // 2. Récupérer les zones des quartiers
  const { data: qDepart } = await supabase.from('quartiers').select('zone_id').eq('id', data.quartierDepartId).single()
  const { data: qArrivee } = await supabase.from('quartiers').select('zone_id').eq('id', data.quartierArriveeId).single()

  // 3. Créer la commande
  const deliveryCode = Math.floor(1000 + Math.random() * 9000)
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      client_id: profile!.id,
      quartier_depart_id: data.quartierDepartId,
      quartier_arrivee_id: data.quartierArriveeId,
      zone_from_id: qDepart?.zone_id,
      zone_to_id: qArrivee?.zone_id,
      description: `Commande WhatsApp (${data.quartierDepart} → ${data.quartierArrivee})`,
      recipient_name: data.recipientName,
      recipient_phone: data.recipientPhone,
      delivery_code: deliveryCode,
      status: 'en_attente',
      type: 'particulier',
      price: 2000 // Fixe par défaut pour le bot, ajustable par l'admin
    })
    .select('id, delivery_code')
    .single()

  if (orderError) throw orderError

  // 4. Générer token de suivi
  const token = Math.random().toString(36).substring(2, 10).toUpperCase()
  await supabase.from('tracking_tokens').insert({
    token,
    order_id: order.id
  })

  return { order, trackingToken: token }
}

async function updateConvo(waId: string, state: BotState, data: ConversationData) {
  const supabase = createAdminClient()
  await supabase
    .from('conversations')
    .update({ state, data, updated_at: new Date().toISOString() })
    .eq('wa_id', waId)
}
