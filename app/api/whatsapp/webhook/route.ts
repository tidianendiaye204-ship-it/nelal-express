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
    
    // CAS 1 : RÉCEPTION DE MESSAGE (Client -> Bot)
    if (body.typeWebhook === 'incomingMessageReceived') {
      const chatId = body.senderData?.chatId
      const text = body.messageData?.textMessageData?.textMessage
      
      if (!chatId || !text) return NextResponse.json({ status: 'ignored' })

      const waId = chatId.split('@')[0]
      console.log(`[Bot] Incoming from ${waId}: ${text}`)

      const responseText = await handleWhatsAppMessage(waId, text)

      if (responseText) {
        await sendWhatsAppNotification(waId, responseText)
      }
    }

    // CAS 2 : ENVOI DE MESSAGE (Humain / Instance -> Client)
    // Si l'administrateur répond manuellement depuis son téléphone, on met le bot en PAUSE
    if (body.typeWebhook === 'outgoingMessageReceived') {
      const chatId = body.chatId // Format: 221... @c.us
      if (chatId) {
        const waId = chatId.split('@')[0]
        console.log(`[Bot] Human takeover detected for ${waId}. Pausing bot.`)
        // On met à jour l'état de la conversation à PAUSED
        // On récupère les data existantes d'abord
        const { handleWhatsAppMessage, updateConvo } = await import('@/lib/conversation')
        await updateConvo(waId, 'PAUSED', {}) 
      }
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
