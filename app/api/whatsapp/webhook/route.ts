import { NextRequest, NextResponse } from 'next/server'
import { handleWhatsAppMessage } from '@/lib/conversation'
import { sendWhatsAppNotification } from '@/lib/whatsapp'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * RÉCEPTION DES WEBHOOKS (Meta Cloud API & Green-API)
 */
export async function POST(req: NextRequest) {
  const adminSupabase = createAdminClient()
  try {
    const body = await req.json()

    // --- LOGGING ---
    try {
      await adminSupabase.from('whatsapp_logs').insert({
        type_webhook: body.object || body.typeWebhook || 'unknown',
        payload: body,
        wa_id: 'webhook-received'
      })
    } catch (logErr) {
      console.error('[Logging Error]', logErr)
    }

    // --- CAS A : META CLOUD API ---
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0]
      const change = entry?.changes?.[0]
      const value = change?.value
      
      if (value?.messages?.[0]) {
        const message = value.messages[0]
        const waId = message.from
        const text = message.text?.body

        if (waId && text) {
          const responseText = await handleWhatsAppMessage(waId, text)
          if (responseText) {
            await sendWhatsAppNotification(waId, responseText)
          }
        }
      }
      return NextResponse.json({ status: 'success' })
    }

    // --- CAS B : GREEN-API (Ancien système) ---
    const type = body.typeWebhook
    if (type === 'incomingMessageReceived') {
      const chatId = body.senderData?.chatId
      const text = body.messageData?.textMessageData?.textMessage || body.messageData?.extendedTextMessageData?.text
      
      if (chatId && text) {
        const waId = chatId.split('@')[0]
        const responseText = await handleWhatsAppMessage(waId, text)
        if (responseText) {
          await sendWhatsAppNotification(waId, responseText)
        }
      }
    }

    if (type === 'outgoingMessageReceived' && !body.sendByApi) {
      const waId = body.chatId?.split('@')[0]
      if (waId) {
        await adminSupabase.from('conversations').update({ state: 'PAUSED' }).eq('wa_id', waId)
      }
    }

    return NextResponse.json({ status: 'success' })

  } catch (error: any) {
    console.error('[Webhook Error]', error.message)
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}

/**
 * VÉRIFICATION DU WEBHOOK (Requis par Meta)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('[Webhook] Meta Verification Success')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Verification Failed', { status: 403 })
}
