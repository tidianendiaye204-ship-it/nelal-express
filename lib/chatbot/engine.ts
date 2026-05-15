// lib/chatbot/engine.ts
// ─────────────────────────────────────────────────────────
// Moteur de conversation WhatsApp (Algorithme Local + Cache)
// Gère l'état de chaque conversation et crée les commandes
// ─────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { findZoneWithSuggestions, getQuartiersForZone, findQuartier } from './find-zone'

// Client Supabase avec service role (accès total)
let _supabase: any = null
function getSupabase() {
  if (_supabase) return _supabase
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Supabase URL and Service Role Key are required")
  }

  _supabase = createClient(url, key)
  return _supabase
}

// ── Types ──────────────────────────────────────────────────
interface Session {
  phone: string
  step: ConversationStep
  data: Partial<OrderData>
  temp_suggestions?: any[]
}

interface OrderData {
  client_name:      string
  zone_from_id:     string
  zone_from_name:   string
  quartier_depart_id?: string
  quartier_depart_name?: string
  zone_to_id:       string
  zone_to_name:     string
  quartier_arrivee_id?: string
  quartier_arrivee_name?: string
  description:      string
  recipient_name:   string
  recipient_phone:  string
  payment_method:   string
  type:             string
  price:            number
}

type ConversationStep =
  | 'start'
  | 'ask_type'
  | 'ask_zone_from'
  | 'ask_zone_from_suggest'
  | 'ask_quartier_from'
  | 'ask_zone_to'
  | 'ask_zone_to_suggest'
  | 'ask_quartier_to'
  | 'ask_description'
  | 'ask_recipient_name'
  | 'ask_recipient_phone'
  | 'ask_payment'
  | 'confirm'
  | 'done'

// ── Messages du bot ────────────────────────────────────────
const MSG = {
  welcome: `🚀 *Bienvenue sur Nelal Express !*

Je suis votre assistant de livraison. Je vais vous aider à créer votre commande en quelques étapes.

Tapez *COMMANDE* pour commencer 📦
Tapez *AIDE* pour voir les options`,

  ask_type: `📦 Vous êtes :

*1* — Particulier (envoi personnel)
*2* — Vendeur en ligne (commande e-commerce)

Répondez avec 1 ou 2`,

  ask_zone_from: `📍 *Quelle est votre zone de départ ?*

Tapez le nom de votre quartier ou zone.
Exemple : _Pikine_, _Plateau_, _Médina_, _Parcelles_...`,

  ask_zone_to: `📍 *Quelle est la zone de destination ?*

Tapez la ville ou le quartier de livraison.
Exemple : _Rufisque_, _Ndioum_, _Saint-Louis_, _Touba_...`,

  ask_description: `📝 *Décrivez votre colis*

Que contient le colis ?
Exemple : _Habits, médicaments, carton alimentaire, chaussures..._`,

  ask_recipient_name: `👤 *Nom complet du destinataire ?*

La personne qui va recevoir le colis.`,

  ask_recipient_phone: `📞 *Numéro de téléphone du destinataire ?*

Le numéro sur lequel on peut appeler à la livraison.`,

  ask_payment: `💳 *Mode de paiement ?*

*1* — 💙 Wave
*2* — 🟠 Orange Money
*3* — 💵 Cash à la livraison

Répondez avec 1, 2 ou 3`,

  cancel: `❌ Commande annulée. 

Tapez *COMMANDE* quand vous voulez recommencer.`,

  error: `⚠️ Je n'ai pas bien compris. Pouvez-vous reformuler ?`,

  help: `ℹ️ *Nelal Express — Aide*

*COMMANDE* → Créer une nouvelle commande
*ANNULER* → Annuler la commande en cours
*AIDE* → Afficher ce message

📞 Besoin d'aide humaine : 77 036 26 16`,
}

// ── Récupérer ou créer une session ───────────────────────
async function getSession(phone: string): Promise<Session> {
  const { data } = await getSupabase()
    .from('chatbot_sessions')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()

  if (data) {
    return { 
      phone: data.phone, 
      step: data.step, 
      data: data.data || {}, 
      temp_suggestions: data.data?.temp_suggestions || [] 
    }
  }

  return { phone, step: 'start', data: {} }
}

// ── Sauvegarder la session ────────────────────────────────
async function saveSession(session: Session) {
  // On stocke les suggestions temporaires dans le JSONB 'data' pour éviter de modifier le schéma SQL
  const dataToSave = {
    ...session.data,
    temp_suggestions: session.temp_suggestions || []
  }

  await getSupabase()
    .from('chatbot_sessions')
    .upsert({
      phone:      session.phone,
      step:       session.step,
      data:       dataToSave,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'phone' })
}

// ── Supprimer la session ──────────────────────────────────
async function deleteSession(phone: string) {
  await getSupabase()
    .from('chatbot_sessions')
    .delete()
    .eq('phone', phone)
}

// ── Créer la commande dans Supabase ──────────────────────
async function createOrder(session: Session, clientPhone: string) {
  const d = session.data as OrderData

  // Récupérer ou créer le profil client
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('id')
    .eq('phone', clientPhone)
    .maybeSingle()

  if (!profile) {
    return { error: 'Profil client introuvable. Veuillez créer un compte sur notre app.' }
  }

  const paymentMap: Record<string, string> = {
    '1': 'wave', '2': 'orange_money', '3': 'cash'
  }

  const { data: order, error } = await getSupabase()
    .from('orders')
    .insert({
      client_id:       profile.id,
      zone_from_id:    d.zone_from_id,
      zone_to_id:      d.zone_to_id,
      quartier_depart_id: d.quartier_depart_id || null,
      quartier_arrivee_id: d.quartier_arrivee_id || null,
      type:            d.type === '1' ? 'particulier' : 'vendeur',
      description:     d.description,
      recipient_name:  d.recipient_name,
      recipient_phone: d.recipient_phone,
      payment_method:  paymentMap[d.payment_method] || 'wave',
      price:           d.price,
      status:          'en_attente',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { order }
}

// ── Moteur principal ──────────────────────────────────────
export async function processMessage(
  phone: string,
  message: string
): Promise<string> {

  const msg = message.trim().toLowerCase()
  const session = await getSession(phone)
  console.log(`[Chatbot] Session récupérée pour ${phone}: Etape=${session.step}`)

  // Commandes globales
  if (msg === 'aide' || msg === 'help') {
    return MSG.help
  }

  if (msg === 'annuler' || msg === 'cancel' || msg === 'stop') {
    await deleteSession(phone)
    return MSG.cancel
  }

  if ((msg === 'commande' || msg === 'commander' || msg === 'start') && session.step !== 'confirm') {
    await saveSession({ phone, step: 'ask_type', data: {} })
    return MSG.ask_type
  }

  // ── Machine d'état ────────────────────────────────────
  switch (session.step) {

    case 'start': {
      return MSG.welcome
    }

    case 'ask_type': {
      if (!['1', '2'].includes(msg)) return MSG.error + '\n\n' + MSG.ask_type
      session.data.type = msg
      session.step = 'ask_zone_from'
      await saveSession(session)
      return MSG.ask_zone_from
    }

    case 'ask_zone_from': {
      const { found, suggestions } = await findZoneWithSuggestions(message)
      if (found) {
        session.data.zone_from_id   = found.id
        session.data.zone_from_name = found.name
        
        // Check if zone has quartiers
        const qList = await getQuartiersForZone(found.id)
        if (qList.length > 0) {
          session.step = 'ask_quartier_from'
          session.temp_suggestions = qList
          await saveSession(session)
          let response = `✅ Zone : *${found.name}*\n\n📍 *Précisez le quartier de départ :*\n\n`
          qList.forEach((q, i) => { response += `*${i+1}* — ${q.nom}\n` })
          response += `*${qList.length + 1}* — Autre / Ignorer`
          return response
        }

        session.step = 'ask_zone_to'
        await saveSession(session)
        return `✅ Départ : *${found.name}*\n\n` + MSG.ask_zone_to
      }
      
      if (suggestions.length > 0) {
        session.temp_suggestions = suggestions
        session.step = 'ask_zone_from_suggest'
        await saveSession(session)
        let response = `Je n'ai pas trouvé précisément "${message}". Voulez-vous dire :\n\n`
        suggestions.forEach((s, i) => {
          response += `*${i+1}* — ${s.name}\n`
        })
        response += `*${suggestions.length + 1}* — Autre zone\n\nRépondez avec le chiffre correspondant.`
        return response
      }

      return `⚠️ Je n'ai pas trouvé la zone *"${message}"*.\n\nVeuillez réessayer avec un quartier de Dakar ou une ville du Sénégal.`
    }

    case 'ask_zone_from_suggest': {
      const index = parseInt(msg) - 1
      if (isNaN(index) || index < 0 || index > (session.temp_suggestions?.length || 0)) {
        return MSG.error + "\n\nVeuillez choisir un chiffre de la liste."
      }

      if (index === (session.temp_suggestions?.length || 0)) {
        session.step = 'ask_zone_from'
        session.temp_suggestions = []
        await saveSession(session)
        return MSG.ask_zone_from
      }

      const zone = session.temp_suggestions![index]
      session.data.zone_from_id   = zone.id
      session.data.zone_from_name = zone.name
      
      const qList = await getQuartiersForZone(zone.id)
      if (qList.length > 0) {
        session.step = 'ask_quartier_from'
        session.temp_suggestions = qList
        await saveSession(session)
        let response = `✅ Zone : *${zone.name}*\n\n📍 *Précisez le quartier de départ :*\n\n`
        qList.forEach((q, i) => { response += `*${i+1}* — ${q.nom}\n` })
        response += `*${qList.length + 1}* — Autre / Ignorer`
        return response
      }

      session.temp_suggestions = [] // Clear suggestions
      session.step = 'ask_zone_to'
      await saveSession(session)
      return `✅ Départ : *${zone.name}*\n\n` + MSG.ask_zone_to
    }

    case 'ask_quartier_from': {
      const index = parseInt(msg) - 1
      const qList = session.temp_suggestions || []
      
      // Si l'utilisateur tape un nom au lieu d'un chiffre
      if (isNaN(index)) {
        const foundQ = await findQuartier(message, session.data.zone_from_id!)
        if (foundQ) {
          session.data.quartier_depart_id = foundQ.id
          session.data.quartier_depart_name = foundQ.nom
          session.step = 'ask_zone_to'
          session.temp_suggestions = []
          await saveSession(session)
          return `✅ Quartier : *${foundQ.nom}*\n\n` + MSG.ask_zone_to
        }
      }

      if (!isNaN(index) && index >= 0 && index < qList.length) {
        const q = qList[index]
        session.data.quartier_depart_id = q.id
        session.data.quartier_depart_name = q.nom
        session.step = 'ask_zone_to'
        session.temp_suggestions = []
        await saveSession(session)
        return `✅ Quartier : *${q.nom}*\n\n` + MSG.ask_zone_to
      }

      // "Autre / Ignorer"
      session.step = 'ask_zone_to'
      session.temp_suggestions = []
      await saveSession(session)
      return MSG.ask_zone_to
    }

    case 'ask_zone_to': {
      const { found, suggestions } = await findZoneWithSuggestions(message)
      if (found) {
        session.data.zone_to_id   = found.id
        session.data.zone_to_name = found.name
        session.data.price        = found.tarif_base

        const qList = await getQuartiersForZone(found.id)
        if (qList.length > 0) {
          session.step = 'ask_quartier_to'
          session.temp_suggestions = qList
          await saveSession(session)
          let response = `✅ Destination : *${found.name}*\n\n📍 *Précisez le quartier de livraison :*\n\n`
          qList.forEach((q, i) => { response += `*${i+1}* — ${q.nom}\n` })
          response += `*${qList.length + 1}* — Autre / Ignorer`
          return response
        }

        session.step = 'ask_description'
        await saveSession(session)
        return `✅ Destination : *${found.name}*\n💰 Tarif estimé : *${found.tarif_base.toLocaleString('fr-FR')} FCFA*\n\n` + MSG.ask_description
      }

      if (suggestions.length > 0) {
        session.temp_suggestions = suggestions
        session.step = 'ask_zone_to_suggest'
        await saveSession(session)
        let response = `Je n'ai pas trouvé précisément "${message}". Voulez-vous dire :\n\n`
        suggestions.forEach((s, i) => {
          response += `*${i+1}* — ${s.name}\n`
        })
        response += `*${suggestions.length + 1}* — Autre zone\n\nRépondez avec le chiffre correspondant.`
        return response
      }

      return `⚠️ Je n'ai pas trouvé la zone *"${message}"*.\n\nVeuillez réessayer.`
    }

    case 'ask_zone_to_suggest': {
      const index = parseInt(msg) - 1
      if (isNaN(index) || index < 0 || index > (session.temp_suggestions?.length || 0)) {
        return MSG.error + "\n\nVeuillez choisir un chiffre de la liste."
      }

      if (index === (session.temp_suggestions?.length || 0)) {
        session.step = 'ask_zone_to'
        session.temp_suggestions = []
        await saveSession(session)
        return MSG.ask_zone_to
      }

      const zone = session.temp_suggestions![index]
      session.data.zone_to_id   = zone.id
      session.data.zone_to_name = zone.name
      session.data.price        = zone.tarif_base

      const qList = await getQuartiersForZone(zone.id)
      if (qList.length > 0) {
        session.step = 'ask_quartier_to'
        session.temp_suggestions = qList
        await saveSession(session)
        let response = `✅ Destination : *${zone.name}*\n\n📍 *Précisez le quartier de livraison :*\n\n`
        qList.forEach((q, i) => { response += `*${i+1}* — ${q.nom}\n` })
        response += `*${qList.length + 1}* — Autre / Ignorer`
        return response
      }

      session.temp_suggestions = [] // Clear suggestions
      session.step = 'ask_description'
      await saveSession(session)
      return `✅ Destination : *${zone.name}*\n💰 Tarif estimé : *${zone.tarif_base.toLocaleString('fr-FR')} FCFA*\n\n` + MSG.ask_description
    }

    case 'ask_quartier_to': {
      const index = parseInt(msg) - 1
      const qList = session.temp_suggestions || []
      
      if (isNaN(index)) {
        const foundQ = await findQuartier(message, session.data.zone_to_id!)
        if (foundQ) {
          session.data.quartier_arrivee_id = foundQ.id
          session.data.quartier_arrivee_name = foundQ.nom
          // Si le quartier a son propre tarif_base, on l'utilise
          if (foundQ.frais_livraison_base) {
            session.data.price = foundQ.frais_livraison_base
          }
          session.step = 'ask_description'
          session.temp_suggestions = []
          await saveSession(session)
          return `✅ Quartier : *${foundQ.nom}*\n💰 Tarif ajusté : *${(session.data.price || 0).toLocaleString('fr-FR')} FCFA*\n\n` + MSG.ask_description
        }
      }

      if (!isNaN(index) && index >= 0 && index < qList.length) {
        const q = qList[index]
        session.data.quartier_arrivee_id = q.id
        session.data.quartier_arrivee_name = q.nom
        if (q.frais_livraison_base) {
          session.data.price = q.frais_livraison_base
        }
        session.step = 'ask_description'
        session.temp_suggestions = []
        await saveSession(session)
        return `✅ Quartier : *${q.nom}*\n💰 Tarif ajusté : *${(session.data.price || 0).toLocaleString('fr-FR')} FCFA*\n\n` + MSG.ask_description
      }

      session.step = 'ask_description'
      session.temp_suggestions = []
      await saveSession(session)
      return MSG.ask_description
    }

    case 'ask_description': {
      if (message.length < 3) return MSG.error + '\n\n' + MSG.ask_description
      session.data.description = message
      session.step = 'ask_recipient_name'
      await saveSession(session)
      return MSG.ask_recipient_name
    }

    case 'ask_recipient_name': {
      if (message.length < 2) return MSG.error + '\n\n' + MSG.ask_recipient_name
      session.data.recipient_name = message
      session.step = 'ask_recipient_phone'
      await saveSession(session)
      return MSG.ask_recipient_phone
    }

    case 'ask_recipient_phone': {
      const cleaned = message.replace(/\D/g, '')
      if (cleaned.length < 8) {
        return `⚠️ Numéro invalide. Entrez un numéro sénégalais valide.\nExemple : _77 123 45 67_`
      }
      session.data.recipient_phone = cleaned
      session.step = 'ask_payment'
      await saveSession(session)
      return MSG.ask_payment
    }

    case 'ask_payment': {
      if (!['1', '2', '3'].includes(msg)) return MSG.error + '\n\n' + MSG.ask_payment
      session.data.payment_method = msg

      const payLabels: Record<string, string> = { '1': '💙 Wave', '2': '🟠 Orange Money', '3': '💵 Cash' }
      const typeLabel = session.data.type === '1' ? 'Particulier' : 'Vendeur en ligne'

      session.step = 'confirm'
      await saveSession(session)

      return `📋 *Récapitulatif de votre commande*

📦 Type : ${typeLabel}
📍 Départ : ${session.data.zone_from_name}${session.data.quartier_depart_name ? ' (' + session.data.quartier_depart_name + ')' : ''}
📍 Destination : ${session.data.zone_to_name}${session.data.quartier_arrivee_name ? ' (' + session.data.quartier_arrivee_name + ')' : ''}
📝 Colis : ${session.data.description}
👤 Destinataire : ${session.data.recipient_name}
📞 Tél. destinataire : ${session.data.recipient_phone}
💳 Paiement : ${payLabels[msg]}
💰 Montant : *${(session.data.price || 0).toLocaleString('fr-FR')} FCFA*

Tapez *OUI* pour confirmer ✅
Tapez *ANNULER* pour recommencer ❌`
    }

    case 'confirm': {
      if (msg === 'oui' || msg === 'yes' || msg === 'ok') {
        const result = await createOrder(session, phone)

        if (result.error) {
          await deleteSession(phone)
          return `⚠️ *Erreur lors de la création :* ${result.error}\n\nContactez-nous : 77 036 26 16`
        }

        const ref = result.order!.id.slice(0, 8).toUpperCase()
        await deleteSession(phone)

        return `🎉 *Commande créée avec succès !*

Votre référence : *NEL-${ref}*

✅ Un livreur sera assigné très prochainement.
📲 Vous recevrez une notification dès confirmation.

🔗 Suivre votre commande :
https://nelal-express.vercel.app/suivi/${result.order!.id}

Merci de faire confiance à *Nelal Express* ! 🙏🇸🇳`
      }

      if (msg === 'non' || msg === 'no' || msg === 'annuler') {
        await deleteSession(phone)
        return MSG.cancel
      }

      return `Tapez *OUI* pour confirmer ou *ANNULER* pour recommencer.`
    }

    default: {
      return MSG.welcome
    }
  }
}
