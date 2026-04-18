// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { handleWhatsAppMessage } from '@/lib/conversation'
import { sendWhatsAppNotification } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

/**
 * RÉCEPTION DES MESSAGES (POST)
 * Format Green-API : JSON
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Green-API envoie différents types de webhooks
    // On ne traite que la réception de message texte
    if (body.typeWebhook !== 'incomingMessageReceived') {
      return NextResponse.json({ status: 'ignored' })
    }

    const chatId = body.senderData?.chatId // ex: 221770000000@c.us
    const text = body.messageData?.textMessageData?.textMessage
    
    if (!chatId || !text) {
      return NextResponse.json({ status: 'ignored' })
    }

    // Extraire le numéro pur (enlever @c.us et les préfixes éventuels)
    const waId = chatId.split('@')[0]

    console.log(`[Green-API Webhook] Message de ${waId}: ${text}`)

    // Traiter le message via notre moteur de conversation
    const responseText = await handleWhatsAppMessage(waId, text)

    // Renvoyer la réponse à l'utilisateur
    if (responseText) {
      // On peut renvoyer soit au waId (il sera formaté dans sendWhatsAppNotification)
      // soit directement au chatId
      await sendWhatsAppNotification(waId, responseText)
    }

    return NextResponse.json({ status: 'success' })

  } catch (error: any) {
    console.error('[Green-API Webhook Error]', error)
    // On renvoie 200 même en cas d'erreur métier pour que Green-API 
    // retire la notification de sa file d'attente
    return NextResponse.json({ error: error.message }, { status: 200 })
  }
}

/**
 * GET pour tester si l'URL est accessible
 */
export async function GET() {
  return new NextResponse('Green-API Webhook Active', { status: 200 })
}
