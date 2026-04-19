// actions/livreur.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendWhatsAppNotification, buildMessage } from '@/lib/whatsapp'
import type { OrderStatus } from '@/lib/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nelal-express.vercel.app'

/**
 * Livreur accepts an available order (en_attente → confirme)
 * Self-assignment: the livreur claims the order themselves
 */
export async function acceptOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Verify livreur role & Cash held limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, cash_held, max_cash_limit')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'livreur') return { error: 'Accès refusé' }

  // Blocage si trop de cash en main
  const cashHeld = profile?.cash_held || 0
  const maxLimit = profile?.max_cash_limit || 25000
  if (cashHeld >= maxLimit) {
    return { 
      error: `Dépassement du plafond de cash (${cashHeld.toLocaleString('fr-FR')} F). Veuillez reverser les fonds à l'agence pour continuer.` 
    }
  }

  // Check order is still available (prevent race condition)
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, livreur_id')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Commande introuvable' }
  if (order.status !== 'en_attente') return { error: 'Cette commande a déjà été prise' }
  if (order.livreur_id) return { error: 'Un livreur est déjà assigné' }

  // Assign self and set status to confirme
  const { error: updateError } = await supabase
    .from('orders')
    .update({ livreur_id: user.id, status: 'confirme' })
    .eq('id', orderId)
    .eq('status', 'en_attente') // Extra safety

  if (updateError) return { error: updateError.message }

  // Log history
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'confirme',
    note: 'Livreur auto-assigné',
    created_by: user.id,
  })

  // Notify client via WhatsApp
  const { data: fullOrder } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey(full_name, phone),
      livreur:profiles!orders_livreur_id_fkey(full_name, phone),
      zone_from:zones!orders_zone_from_id_fkey(name),
      zone_to:zones!orders_zone_to_id_fkey(name)
    `)
    .eq('id', orderId)
    .single()

  if (fullOrder) {
    const msg = buildMessage('order_confirmed', {
      orderId: fullOrder.id,
      clientName: fullOrder.client.full_name,
      clientPhone: fullOrder.client.phone,
      recipientName: fullOrder.recipient_name,
      recipientPhone: fullOrder.recipient_phone,
      description: fullOrder.description,
      zoneFrom: fullOrder.zone_from.name,
      zoneTo: fullOrder.zone_to.name,
      livreurName: fullOrder.livreur?.full_name,
      livreurPhone: fullOrder.livreur?.phone,
      price: fullOrder.price,
      trackingUrl: `${BASE_URL}/suivi/${fullOrder.id}`,
    })
    await sendWhatsAppNotification(fullOrder.client.phone, msg)
  }

  revalidatePath('/dashboard/livreur')
  revalidatePath('/dashboard/livreur/disponibles')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/client')
  return { success: true }
}

/**
 * Livreur reports an issue on an order
 */
export async function reportIssue(orderId: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'incident',
    note,
    created_by: user.id,
  })

  revalidatePath('/dashboard/livreur')
  revalidatePath(`/suivi/${orderId}`)
  return { success: true }
}
