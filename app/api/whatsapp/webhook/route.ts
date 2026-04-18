// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { handleWhatsAppMessage, updateConvo } from '@/lib/conversation'
import { sendWhatsAppNotification } from '@/lib/whatsapp'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * RÉCEPTION DES WEBHOOKS GREEN-API
 * Stabilisé avec imports top-level pour éviter les ECONNRESET sur Vercel Edge
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const type = body.typeWebhook

    // CAS 1 : RÉCEPTION DE MESSAGE (Client -> Bot)
    if (type === 'incomingMessageReceived') {
      const chatId = body.senderData?.chatId
      const text = body.messageData?.textMessageData?.textMessage
      
      if (chatId && text) {
        const waId = chatId.split('@')[0]
        console.log(`[Bot] Incoming: ${waId} -> ${text}`)
        
        try {
          const responseText = await handleWhatsAppMessage(waId, text)
          if (responseText) {
            await sendWhatsAppNotification(waId, responseText)
          }
        } catch (botError: any) {
          console.error('[Bot Logic Error]', botError?.message || botError)
        }
      }
    }

    // CAS 2 : ENVOI DE MESSAGE (Humain -> Client)
    // On met en pause le bot si l'admin parle manuellement
    if (type === 'outgoingMessageReceived') {
      const chatId = body.chatId
      if (chatId) {
        const waId = chatId.split('@')[0]
        console.log(`[Bot] Human takeover: ${waId}. Bot Paused.`)
        
        try {
          const adminSupabase = createAdminClient()
          await adminSupabase
            .from('conversations')
            .update({ state: 'PAUSED' })
            .eq('wa_id', waId)
        } catch (dbError: any) {
          console.error('[DB Pause Error]', dbError?.message || dbError)
        }
      }
    }

    return NextResponse.json({ status: 'success' })

  } catch (error: any) {
    console.error('[Webhook Global Error]', error?.message || error)
    // Retourne 200 pour éviter que Green-API ne boucle sur l'erreur
    return NextResponse.json({ status: 'error', message: error?.message }, { status: 200 })
  }
}

/**
 * GET pour vérification de l'Url
 */
export async function GET() {
  return new NextResponse('Green-API Webhook is Active', { status: 200 })
}
