// lib/conversation.ts
import { createAdminClient } from '@/lib/supabase/server'


export type BotState = 
  | 'IDLE' 
  | 'AWAITING_DEPART' 
  | 'AWAITING_ARRIVEE' 
  | 'AWAITING_NAME' 
  | 'AWAITING_PHONE' 
  | 'AWAITING_CONFIRMATION'
  | 'PAUSED' // État où le bot se tait pour laisser l'humain parler

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
    .maybeSingle()

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

  // 2. INTERCEPTION PRIORITAIRE (Reset / Reprise)
  const isGreeting = ['bonjour', 'salut', 'allo', 'hello', 'hey', 'hi', 'wesh', 'na ngade', 'coucou'].some(k => lowerText.includes(k))
  const isOrderIntent = ['commande', 'recommencer', 'reset', 'nouveau', 'livraison', 'envoi'].some(k => lowerText.includes(k))

  if (isOrderIntent || isGreeting) {
     if (state === 'PAUSED' || isOrderIntent) {
        // Si commande => Reset complet. Si bonjour => On reprend sans effacer les données.
        await updateConvo(waId, isOrderIntent ? 'AWAITING_DEPART' : 'IDLE', isOrderIntent ? {} : data)
        if (isOrderIntent) return "🔄 *Réinitialisation...*\n\n📍 C'est reparti ! Quel est le *quartier de départ* ?"
        return "👋 Bonjour ! Je suis de retour. Tapez *'commande'* pour envoyer un colis ou posez votre question."
     }
  }

  // 3. GESTION DU MODE PAUSE
  if (state === 'PAUSED') {
    return null 
  }

  // 4. Machine à états
  switch (state) {
    case 'IDLE': {
      if (['commande', 'colis', 'envoyer', 'livraison', 'nouveau', 'salut', 'bonjour'].some(k => lowerText.includes(k))) {
        await updateConvo(waId, 'AWAITING_DEPART', {})
        return "👋 *Bienvenue chez Nelal Express.*\n\nNous allons préparer votre demande de livraison ensemble.\n\n📍 Pour commencer, quel est le *quartier de départ* ?\n_(Exemple : Médina, Point E, Keur Massar...)_"
      }
      return "🤝 *Nelal Express* à votre service.\n\nTapez *'commande'* pour initier un nouvel envoi."
    }

    case 'AWAITING_DEPART': {
      const quartierFrom = await findQuartier(cleanText)
      if (!quartierFrom) {
        return `🧐 Nous ne parvenons pas à localiser le quartier "${cleanText}".\n\nPourriez-vous préciser ou corriger l'orthographe ?`
      }
      await updateConvo(waId, 'AWAITING_ARRIVEE', { 
        ...data, 
        quartierDepart: quartierFrom.nom,
        quartierDepartId: quartierFrom.id 
      })
      return `✅ *Départ enregistré* : ${quartierFrom.nom}.\n\n🎯 Quelle est la *destination* du colis ?`
    }

    case 'AWAITING_ARRIVEE': {
      const quartierTo = await findQuartier(cleanText)
      if (!quartierTo) {
        return `🧐 Nous ne parvenons pas à localiser le quartier "${cleanText}".\n\nVeuillez préciser le quartier de destination.`
      }
      await updateConvo(waId, 'AWAITING_NAME', { 
        ...data, 
        quartierArrivee: quartierTo.nom,
        quartierArriveeId: quartierTo.id 
      })
      return `👤 Très bien. Quel est le *nom complet* du destinataire ?`
    }

    case 'AWAITING_NAME': {
      await updateConvo(waId, 'AWAITING_PHONE', { ...data, recipientName: cleanText })
      return `📞 Merci. Quel est le *numéro WhatsApp* du destinataire ?\n_(Format : 77XXXXXXX)_`
    }

    case 'AWAITING_PHONE': {
      const cleaned = cleanText.replace(/[\s+\-.]/g, '')
      const phoneMatch = cleaned.match(/^(?:221)?(70|75|76|77|78)\d{7}$/)
      
      if (!phoneMatch) {
        return "⚠️ Le format du numéro semble incorrect.\n\nVeuillez saisir un numéro sénégalais valide (ex: 771234567)."
      }
      
      const phone = cleaned.slice(-9)
      await updateConvo(waId, 'AWAITING_CONFIRMATION', { ...data, recipientPhone: phone })
      
      return `📝 *RÉSUMÉ DE VOTRE COMMANDE*\n` +
             `────────────────────\n` +
             `🏠 *Départ* : ${data.quartierDepart || '-'}\n` +
             `🎯 *Arrivée* : ${data.quartierArrivee || '-'}\n` +
             `👤 *Destinataire* : ${data.recipientName || '-'} (${phone})\n` +
             `────────────────────\n\n` +
             `Confirmez-vous l'envoi de ce colis ?\n\n` +
             `👉 Répondez *OUI* pour valider ou *NON* pour annuler.`
    }

    case 'AWAITING_CONFIRMATION': {
      if (lowerText === 'oui' || lowerText === 'ok' || lowerText === 'valider') {
        try {
          const result = await createBotOrder(waId, data)
          if (!result || !result.order) throw new Error('Order creation failed')

          const { order, trackingToken } = result
          await updateConvo(waId, 'IDLE', {})
          
          return `✨ *COMMANDE VALIDÉE AVEC SUCCÈS !*\n\n` +
                 `Votre demande a été prise en charge par notre équipe.\n\n` +
                 `🆔 Référence : *NEL-${order.id.slice(0, 4).toUpperCase()}*\n` +
                 `🔐 Code de sécurité : *${order.delivery_code}*\n\n` +
                 `⚠️ *Important* : Communiquez le code de sécurité au destinataire. Il sera indispensable pour valider la livraison.\n\n` +
                 `📍 *Suivi en temps réel* :\n` +
                 `https://nelal-express.vercel.app/t/${trackingToken}\n\n` +
                 `Merci de faire confiance à *Nelal Express* ! 🌍`
        } catch (err: any) {
          console.error('[Bot Order Error]', err)
          return "❌ Nous rencontrons une difficulté technique temporaire. Veuillez nous excuser et réessayer dans quelques instants."
        }
      } else if (lowerText === 'non' || lowerText === 'annuler') {
        await updateConvo(waId, 'IDLE', {})
        return "🚫 *Commande annulée.*\n\nNous restons à votre disposition si vous changez d'avis. À bientôt !"
      }
      return "Veuillez répondre par *OUI* ou par *NON*."
    }

    default:
      await updateConvo(waId, 'IDLE', {})
      return "Oups, je me suis un peu perdu. Recommençons ! Tapez *'commande'*."
  }
}

async function createBotOrder(waId: string, data: ConversationData) {
  const supabase = createAdminClient()
  
  // 1. Gérer le profil (Chercher par téléphone d'abord)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', waId)
    .maybeSingle()
    
  let clientId = profile?.id

  // Si pas de profil, on essaie d'en créer un "Ghost" sans UUID Auth
  if (!clientId) {
    const { data: newProfile, error: profError } = await supabase
      .from('profiles')
      .insert({
        full_name: 'Client WhatsApp',
        phone: waId,
        role: 'client'
      })
      .select('id')
      .single()
    
    if (profError) {
      console.warn('[Profile Create Warning] Impossible de créer le profil, on continue sans client_id:', profError.message)
      // Si on ne peut pas créer de profil, on peut choisir soit d'échouer, 
      // soit de laisser client_id à null si la table orders le permet.
    } else {
      clientId = newProfile.id
    }
  }

  // 2. Récupérer les zones des quartiers pour le calcul automatique
  const { data: qDepart } = await supabase.from('quartiers').select('zone_id').eq('id', data.quartierDepartId).maybeSingle()
  const { data: qArrivee } = await supabase.from('quartiers').select('zone_id').eq('id', data.quartierArriveeId).maybeSingle()

  // 3. Créer la commande
  const deliveryCode = Math.floor(1000 + Math.random() * 9000)
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      client_id: clientId, 
      quartier_depart_id: data.quartierDepartId,
      quartier_arrivee_id: data.quartierArriveeId,
      zone_from_id: qDepart?.zone_id || null,
      zone_to_id: qArrivee?.zone_id || null,
      pickup_address: data.quartierDepart || 'Non spécifié', // Ajouté car souvent obligatoire
      delivery_address: data.quartierArrivee || 'Non spécifié', // Ajouté car souvent obligatoire
      description: `Commande WhatsApp (${data.quartierDepart} → ${data.quartierArrivee})`,
      recipient_name: data.recipientName || 'Destinataire',
      recipient_phone: data.recipientPhone,
      delivery_code: deliveryCode,
      status: 'en_attente',
      type: 'particulier',
      payment_method: 'cash', // OBLIGATOIRE en BDD (enum: cash, wave, orange_money)
      price: 2000 
    })
    .select('id, delivery_code')
    .single()

  if (orderError) {
    console.error('[Supabase Order Insert Error DETAIL]', JSON.stringify(orderError, null, 2))
    throw orderError
  }

  // 4. Générer token de suivi
  const token = Math.random().toString(36).substring(2, 10).toUpperCase()
  await supabase.from('tracking_tokens').insert({
    token,
    order_id: order.id
  })

  return { order, trackingToken: token }
}

export async function updateConvo(waId: string, state: BotState, data: ConversationData) {
  const supabase = createAdminClient()
  await supabase
    .from('conversations')
    .update({ state, data, updated_at: new Date().toISOString() })
    .eq('wa_id', waId)
}
