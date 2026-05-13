// lib/chatbot/engine.ts
// ─────────────────────────────────────────────────────────
// Moteur de conversation WhatsApp propulsé par Claude AI
// Gère l'état de chaque conversation et crée les commandes
// ─────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

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
}

interface OrderData {
  client_name:      string
  zone_from_id:     string
  zone_from_name:   string
  zone_to_id:       string
  zone_to_name:     string
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
  | 'ask_zone_to'
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
    return { phone: data.phone, step: data.step, data: data.data }
  }

  return { phone, step: 'start', data: {} }
}

// ── Sauvegarder la session ────────────────────────────────
async function saveSession(session: Session) {
  await getSupabase()
    .from('chatbot_sessions')
    .upsert({
      phone:      session.phone,
      step:       session.step,
      data:       session.data,
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

// ── Trouver une zone dans la DB ───────────────────────────
async function findZone(query: string) {
  console.log(`[Chatbot] findZone appelé avec: "${query}"`)
  const { data: zones, error: zonesError } = await getSupabase()
    .from('zones')
    .select('id, name, type, tarif_base')

  if (zonesError) {
    console.error('[Chatbot] Erreur récupération zones:', zonesError)
    return null
  }
  if (!zones) return null
  console.log(`[Chatbot] ${zones.length} zones récupérées`)

    console.log('[Chatbot] Appel à Claude AI...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        system: `Tu es un assistant expert de la géographie du Sénégal. 
  Ton rôle est d'associer la zone ou le quartier cité par l'utilisateur à l'une de nos zones de livraison.

  Voici les zones disponibles : ${JSON.stringify(zones.map((z: any) => ({ id: z.id, name: z.name })))}

  Règles de matching :
  1. Sois indulgent sur l'orthographe et les accents.
  2. Si l'utilisateur cite un quartier spécifique qui appartient à une zone plus large dans la liste, choisis cette zone.
  3. Réponds UNIQUEMENT avec le JSON suivant : {"zone_id": "ID", "zone_name": "NOM_ZONE_TROUVÉE"}.
  4. Si vraiment aucune zone ne correspond, réponds {"zone_id": null}.
  Ne donne aucune explication, juste le JSON.`,
        messages: [{ role: 'user', content: `L'utilisateur a écrit : "${query}"` }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[Chatbot] Erreur API Anthropic:', response.status, errText)
      return null
    }

    const result = await response.json()
    console.log('[Chatbot] Réponse reçue de Claude:', result)

    if (!result.content || !result.content[0]) {
      console.error('[Chatbot] Format de réponse Claude invalide:', result)
      return null
    }

    try {
      let text = result.content[0].text.trim()
    
    // Nettoyage au cas où Claude ajoute des balises Markdown ```json ... ```
    if (text.includes('```')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim()
    }
    
    console.log(`[Chatbot] Matching zone pour "${query}":`, text)
    
    const parsed = JSON.parse(text)
    if (!parsed.zone_id) return null
    
    const zone = zones.find((z: any) => z.id === parsed.zone_id)
    return zone ? { ...zone, matched_name: parsed.zone_name } : null
  } catch (err) {
    console.error('[Chatbot] Erreur parsing réponse Claude:', err, result)
    return null
  }
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
      const zone = await findZone(message)
      if (!zone) {
        return `⚠️ Je n'ai pas trouvé la zone *"${message}"*.\n\nVeuillez réessayer avec un quartier de Dakar ou une ville du Sénégal.`
      }
      session.data.zone_from_id   = zone.id
      session.data.zone_from_name = zone.name
      session.step = 'ask_zone_to'
      await saveSession(session)
      return `✅ Départ : *${zone.name}*\n\n` + MSG.ask_zone_to
    }

    case 'ask_zone_to': {
      const zone = await findZone(message)
      if (!zone) {
        return `⚠️ Je n'ai pas trouvé la zone *"${message}"*.\n\nVeuillez réessayer.`
      }
      session.data.zone_to_id   = zone.id
      session.data.zone_to_name = zone.name
      session.data.price        = zone.tarif_base
      session.step = 'ask_description'
      await saveSession(session)
      return `✅ Destination : *${zone.name}*\n💰 Tarif estimé : *${zone.tarif_base.toLocaleString('fr-FR')} FCFA*\n\n` + MSG.ask_description
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
📍 Départ : ${session.data.zone_from_name}
📍 Destination : ${session.data.zone_to_name}
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
