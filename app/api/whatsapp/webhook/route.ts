// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { handleWhatsAppMessage } from '@/lib/conversation'
import { sendMetaWhatsAppMessage } from '@/lib/whatsapp'

/**
 * WEBHOOK DE VÉRIFICATION (GET)
 * Requis par Meta pour valider l'URL du webhook.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('--- WEBHOOK VERIFIED ---')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Verification failed', { status: 403 })
}

/**
 * RÉCEPTION DES MESSAGES (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Vérifier s'il s'agit d'un message WhatsApp
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    
    if (value?.messaging_product !== 'whatsapp') {
      return NextResponse.json({ status: 'ignored' })
    }

    const message = value.messages?.[0]
    if (!message || message.type !== 'text') {
      return NextResponse.json({ status: 'ignored' })
    }

    const waId = message.from // ex: 221770000000
    const text = message.text.body

    console.log(`[WhatsApp Webhook] Message de ${waId}: ${text}`)

    // Traiter le message via notre moteur de conversation
    const responseText = await handleWhatsAppMessage(waId, text)

    // Renvoyer la réponse à l'utilisateur
    if (responseText) {
      await sendMetaWhatsAppMessage(waId, responseText)
    }

    return NextResponse.json({ status: 'success' })
  } catch (error: any) {
    console.error('[WhatsApp Webhook Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
