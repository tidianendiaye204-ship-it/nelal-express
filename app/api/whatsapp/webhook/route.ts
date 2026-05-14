// app/api/whatsapp/webhook/route.ts
// ─────────────────────────────────────────────────────────
// Webhook Twilio — reçoit les messages WhatsApp entrants
// et renvoie la réponse du chatbot
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { processMessage } from '@/lib/chatbot/engine'

export const dynamic = 'force-dynamic'

// Twilio envoie les messages en POST avec form-data
export async function POST(req: NextRequest) {
  try {
    // Twilio envoie les données en x-www-form-urlencoded
    const text = await req.text()
    const params = new URLSearchParams(text)
    
    const body = params.get('Body')
    const from = params.get('From')

    if (!body || !from) {
      console.error('[Chatbot] Webhook: Body ou From manquant dans la requête')
      return new NextResponse('Missing fields', { status: 400 })
    }

    // Extraire le numéro propre (sans "whatsapp:")
    const phone = from.replace('whatsapp:', '').replace('+', '')

    console.log(`[Chatbot] Message de ${phone}: "${body}"`)

    // Traiter le message
    const replyText = await processMessage(phone, body)

    console.log(`[Chatbot] Envoi réponse (${replyText.length} chars)`)

    // Répondre en TwiML (format Twilio) - Strictement AUCUN espace avant le XML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>${escapeXml(replyText)}</Body></Message></Response>`

    console.log(`[Chatbot] Webhook terminé avec succès pour ${phone}`)

    return new NextResponse(twiml, {
      status: 200,
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      },
    })

  } catch (error: any) {
    console.error('[Chatbot] Erreur webhook:', error)

    // En cas d'erreur on répond quand même à l'utilisateur
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>⚠️ Une erreur est survenue. Réessayez dans un instant ou appelez le 77 036 26 16.</Body>
  </Message>
</Response>`

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}

// Twilio vérifie parfois avec GET
export async function GET() {
  return new NextResponse('Nelal Express WhatsApp Bot — OK', { status: 200 })
}

// Échapper les caractères XML
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
