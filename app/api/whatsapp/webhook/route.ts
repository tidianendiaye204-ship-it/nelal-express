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
  const adminSupabase = createAdminClient()
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    const type = body.typeWebhook

    // LOGGING DE DEBUG (Aide à comprendre pourquoi le bot ne répond pas)
    try {
      await adminSupabase.from('whatsapp_logs').insert({
        type_webhook: type,
        payload: body,
        wa_id: body.senderData?.chatId?.split('@')[0] || body.chatId?.split('@')[0] || 'N/A'
      })
    } catch (logErr) {
      console.error('[Logging Error] Could not write to whatsapp_logs:', logErr)
    }

    // CAS 1 : RÉCEPTION DE MESSAGE (Client -> Bot)
    if (type === 'incomingMessageReceived') {
      const chatId = body.senderData?.chatId
      const senderName = body.senderData?.senderName || 'Inconnu'
      
      // Extraction du texte (Gère les messages simples ET enrichis avec preview)
      const text = 
        body.messageData?.textMessageData?.textMessage || 
        body.messageData?.extendedTextMessageData?.text ||
        ''

      if (chatId && text) {
        const waId = chatId.split('@')[0]
        console.log(`[Bot] Incoming from ${senderName} (${waId}): "${text}"`)
        
        try {
          const responseText = await handleWhatsAppMessage(waId, text)
          if (responseText) {
            const sendResult = await sendWhatsAppNotification(waId, responseText)
            if (!sendResult.success) {
              console.error(`[Bot] Failed to send reply to ${waId}:`, sendResult.error)
            }
          }
        } catch (botError: any) {
          console.error(`[Bot Logic Error] for ${waId}:`, botError?.message || botError)
          // Optionnel : Notification d'erreur au client ?
          // await sendWhatsAppNotification(waId, "⚠️ Une erreur technique est survenue. Nos équipes sont prévenues.")
        }
      } else {
        console.log(`[Bot] Ignored incoming webhook: missing text or chatId. Type: ${body.messageData?.typeMessage}`)
      }
    }

    // CAS 2 : RÉCEPTION DE MESSAGE SORTANT (Humain ou Bot -> Client)
    // On ne met en pause le bot QUE si le message vient physiquement du téléphone (Manual Takeover)
    if (type === 'outgoingMessageReceived') {
      const chatId = body.chatId
      const isApiMessage = body.sendByApi === true // Green-API indique si ça vient de l'API

      if (chatId && !isApiMessage) {
        const waId = chatId.split('@')[0]
        console.log(`[Bot] Manual takeover detected for ${waId}. Bot PAUSED.`)
        
        try {
          const adminSupabase = createAdminClient()
          await adminSupabase
            .from('conversations')
            .update({ 
              state: 'PAUSED',
              updated_at: new Date().toISOString()
            })
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
