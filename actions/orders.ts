// actions/orders.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendWhatsAppNotification, buildMessage } from '@/lib/whatsapp'
import type { OrderStatus, PaymentMethod, OrderType } from '@/lib/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nelal-express.vercel.app'

// ── CLIENT ──────────────────────────────────────────────

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const zone_from_id = formData.get('zone_from_id') as string
  const zone_to_id = formData.get('zone_to_id') as string

  // Récupérer les tarifs des deux zones
  const { data: zones } = await supabase
    .from('zones')
    .select('id, tarif_base')
    .in('id', [zone_from_id, zone_to_id])

  // Le prix est le maximum entre le tarif de départ et d'arrivée
  const price = zones && zones.length > 0 
    ? Math.max(...zones.map(z => z.tarif_base)) 
    : 2000

  const { data: order, error } = await supabase.from('orders').insert({
    client_id: user.id,
    zone_from_id,
    zone_to_id,
    type: formData.get('type') as OrderType,
    description: formData.get('description') as string,
    pickup_address: formData.get('pickup_address') as string,
    delivery_address: formData.get('delivery_address') as string,
    gps_link: formData.get('gps_link') as string,
    recipient_name: formData.get('recipient_name') as string,
    recipient_phone: formData.get('recipient_phone') as string,
    address_landmark: formData.get('address_landmark') as string,
    payment_method: formData.get('payment_method') as PaymentMethod,
    notes: formData.get('notes') as string,
    price,
  }).select().single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/client')
  return { success: true, orderId: order.id }
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('orders')
    .update({ status: 'annule' })
    .eq('id', orderId)
    .eq('client_id', user.id)
    .eq('status', 'en_attente')

  if (error) return { error: error.message }
  revalidatePath('/dashboard/client')
  return { success: true }
}

// ── LIVREUR ─────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  await supabase.from('orders').update({ status }).eq('id', orderId)
  await supabase.from('order_status_history').insert({
    order_id: orderId, status, note, created_by: user.id,
  })

  // Notification WhatsApp
  const { data: order } = await supabase
    .from('orders')
    .select(`*, client:profiles!orders_client_id_fkey(full_name, phone), livreur:profiles!orders_livreur_id_fkey(full_name, phone), zone_from:zones!orders_zone_from_id_fkey(name), zone_to:zones!orders_zone_to_id_fkey(name)`)
    .eq('id', orderId).single()

  if (order) {
    const notifType = status === 'en_cours' ? 'order_picked_up'
      : status === 'livre' ? 'order_delivered'
      : status === 'annule' ? 'order_cancelled' : null

    if (notifType) {
      const msg = buildMessage(notifType, {
        orderId: order.id,
        clientName: order.client.full_name,
        clientPhone: order.client.phone,
        recipientName: order.recipient_name,
        recipientPhone: order.recipient_phone,
        description: order.description,
        zoneFrom: order.zone_from.name,
        zoneTo: order.zone_to.name,
        livreurName: order.livreur?.full_name,
        livreurPhone: order.livreur?.phone,
        price: order.price,
        trackingUrl: `${BASE_URL}/suivi/${order.id}`,
      })
      await sendWhatsAppNotification(order.client.phone, msg)
    }
  }

  revalidatePath('/dashboard/livreur')
  return { success: true }
}

// ── ADMIN ────────────────────────────────────────────────

export async function assignLivreur(orderId: string, livreurId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  await supabase.from('orders')
    .update({ livreur_id: livreurId, status: 'confirme' })
    .eq('id', orderId)

  await supabase.from('order_status_history').insert({
    order_id: orderId, status: 'confirme',
    note: 'Livreur assigné', created_by: user.id,
  })

  // Notification WhatsApp au client
  const { data: order } = await supabase
    .from('orders')
    .select(`*, client:profiles!orders_client_id_fkey(full_name, phone), livreur:profiles!orders_livreur_id_fkey(full_name, phone), zone_from:zones!orders_zone_from_id_fkey(name), zone_to:zones!orders_zone_to_id_fkey(name)`)
    .eq('id', orderId).single()

  if (order) {
    const msg = buildMessage('order_confirmed', {
      orderId: order.id,
      clientName: order.client.full_name,
      clientPhone: order.client.phone,
      recipientName: order.recipient_name,
      recipientPhone: order.recipient_phone,
      description: order.description,
      zoneFrom: order.zone_from.name,
      zoneTo: order.zone_to.name,
      livreurName: order.livreur?.full_name,
      livreurPhone: order.livreur?.phone,
      price: order.price,
      trackingUrl: `${BASE_URL}/suivi/${order.id}`,
    })
    await sendWhatsAppNotification(order.client.phone, msg)
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function createLivreur(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    user_metadata: {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
    },
    email_confirm: true,
  })

  if (error) return { error: error.message }

  await supabase.from('profiles').update({
    role: 'livreur',
    zone_id: (formData.get('zone_id') as string) || null,
  }).eq('id', data.user.id)

  revalidatePath('/dashboard/admin/livreurs')
  return { success: true }
}

export async function updateZoneTarif(zoneId: string, tarifBase: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('zones').update({ tarif_base: tarifBase }).eq('id', zoneId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/zones')
  return { success: true }
}
