// actions/orders.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendWhatsAppNotification, buildMessage } from '@/lib/whatsapp'
import { incrementOrAddRepere } from '@/actions/reperes'
import type { OrderStatus, PaymentMethod, OrderType } from '@/lib/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nelal-express.vercel.app'

// ── CLIENT ──────────────────────────────────────────────

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const zone_from_id = formData.get('zone_from_id') as string
  const zone_to_id = formData.get('zone_to_id') as string
  const isExpress = formData.get('is_express') === '1'

  // Récupérer les tarifs des deux zones
  const { data: zones } = await supabase
    .from('zones')
    .select('id, tarif_base')
    .in('id', [zone_from_id, zone_to_id])

  // Le prix est le maximum entre le tarif de départ et d'arrivée + express
  let price = zones && zones.length > 0 
    ? Math.max(...zones.map(z => z.tarif_base)) 
    : 2000
  
  // Majoration express
  if (isExpress) price += 1000

  const { data: order, error } = await supabase.from('orders').insert({
    client_id: user.id,
    zone_from_id,
    zone_to_id,
    type: formData.get('type') as OrderType,
    description: formData.get('description') as string,
    pickup_address: formData.get('pickup_address') as string || 'Non spécifié',
    delivery_address: formData.get('delivery_address') as string || 'Non spécifié',
    gps_link: (formData.get('gps_link') as string) || null,
    recipient_name: formData.get('recipient_name') as string,
    recipient_phone: formData.get('recipient_phone') as string,
    address_landmark: (formData.get('address_landmark') as string) || null,
    payment_method: formData.get('payment_method') as PaymentMethod,
    notes: (formData.get('notes') as string) || null,
    price,
  }).select().single()

  if (error) return { error: error.message }

  // 🌍 Crowdsourcing : On alimente l'algorithme avec les repères saisis par le client
  const pickupRepere = formData.get('pickup_repere') as string
  const deliveryRepere = formData.get('delivery_repere') as string
  
  if (pickupRepere) {
    // Fire and forget (ne bloque pas la réponse client)
    incrementOrAddRepere(zone_from_id, pickupRepere).catch(console.error)
  }
  if (deliveryRepere) {
    incrementOrAddRepere(zone_to_id, deliveryRepere).catch(console.error)
  }

  // 🌍 Notifications : On prévient les admins et les livreurs dispos (sans bloquer la requête HTTP)
  notifyAdminsOnOrder(order.id).catch(console.error)

  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/admin')
  return { success: true, orderId: order.id }
}

async function notifyAdminsOnOrder(orderId: string) {
  const supabase = await createClient()
  
  // Retrieve the full order with relations
  const { data: order } = await supabase
    .from('orders')
    .select(`*, client:profiles!orders_client_id_fkey(full_name, phone), zone_from:zones!orders_zone_from_id_fkey(name), zone_to:zones!orders_zone_to_id_fkey(name)`)
    .eq('id', orderId).single()
    
  if (!order) return

  // Format tracking links
  const assignUrl = `${BASE_URL}/dashboard/admin/orders/${order.id}/assign`

  const msgData = {
    orderId: order.id,
    clientName: order.client?.full_name || 'Client',
    clientPhone: order.client?.phone || '',
    recipientName: order.recipient_name,
    recipientPhone: order.recipient_phone,
    description: order.description,
    zoneFrom: order.zone_from?.name || '',
    zoneTo: order.zone_to?.name || '',
    price: order.price,
    paymentMethod: order.payment_method,
    assignUrl,
  }

  const msgAdmin = buildMessage('new_order_admin', msgData)

  // 1. Notify Admins
  const { data: admins } = await supabase.from('profiles').select('phone').eq('role', 'admin')
  const fallbackPhone = process.env.ADMIN_WHATSAPP_PHONE

  let adminPhones: string[] = []
  if (admins && admins.length > 0) {
    adminPhones = admins.map(a => a.phone).filter(Boolean)
  } else if (fallbackPhone) {
    adminPhones.push(fallbackPhone)
  }

  for (const phone of adminPhones) {
    await sendWhatsAppNotification(phone, msgAdmin)
  }

  // 2. Notify Livreurs (in zone and online recently)
  // last_seen_at > 5 mins ago
  const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString()
  
  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id, phone')
    .eq('role', 'livreur')
    .eq('zone_id', order.zone_from_id)
    .gte('last_seen_at', fiveMinsAgo)
    
  if (livreurs && livreurs.length > 0) {
    // Verification: they shouldn't have active orders
    const livreurIds = livreurs.map(l => l.id)
    const { data: activeOrders } = await supabase
      .from('orders')
      .select('livreur_id')
      .in('livreur_id', livreurIds)
      .in('status', ['confirme', 'en_cours'])
      
    const busyLivreurIds = activeOrders?.map(o => o.livreur_id) || []
    const availableLivreurs = livreurs.filter(l => !busyLivreurIds.includes(l.id))
    
    const msgLivreur = buildMessage('new_order_livreur', msgData)
    for (const livreur of availableLivreurs) {
      if (livreur.phone) {
        await sendWhatsAppNotification(livreur.phone, msgLivreur)
      }
    }
  }
}

export async function createQuickOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const quartier_depart_id = formData.get('quartier_depart_id') as string
  const quartier_arrivee_id = formData.get('quartier_arrivee_id') as string
  const isExpress = formData.get('is_express') === '1'

  // Fetch the quartiers to get the base price and mapping zones
  const { data: quartiers } = await supabase
    .from('quartiers')
    .select('id, frais_livraison_base, zone_id, nom')
    .in('id', [quartier_depart_id, quartier_arrivee_id])

  if (!quartiers || quartiers.length < 2) {
    return { error: 'Quartiers introuvables.' }
  }

  const qDepart = quartiers.find(q => q.id === quartier_depart_id)
  const qArrivee = quartiers.find(q => q.id === quartier_arrivee_id)

  const zone_from_id = qDepart?.zone_id
  const zone_to_id = qArrivee?.zone_id

  let price = Math.max(qDepart?.frais_livraison_base || 0, qArrivee?.frais_livraison_base || 0)
  if (isExpress) price += 1000

  const { data: order, error } = await supabase.from('orders').insert({
    client_id: user.id,
    quartier_depart_id,
    quartier_arrivee_id,
    zone_from_id, // Backward compatibility
    zone_to_id,   // Backward compatibility
    pickup_address: qDepart?.nom,
    delivery_address: qArrivee?.nom,
    type: 'particulier', // Par défaut
    description: formData.get('description') as string,
    recipient_name: formData.get('recipient_name') as string,
    recipient_phone: formData.get('recipient_phone') as string,
    address_landmark: (formData.get('pickup_repere') as string) || null,
    payment_method: formData.get('payment_method') as PaymentMethod,
    price,
  }).select().single()

  if (error) return { error: error.message }

  const pickupRepere = formData.get('pickup_repere') as string
  const deliveryRepere = formData.get('delivery_repere') as string
  
  if (pickupRepere && zone_from_id) {
    incrementOrAddRepere(zone_from_id, pickupRepere).catch(console.error)
  }
  if (deliveryRepere && zone_to_id) {
    incrementOrAddRepere(zone_to_id, deliveryRepere).catch(console.error)
  }

  notifyAdminsOnOrder(order.id).catch(console.error)

  revalidatePath('/dashboard/client')
  revalidatePath('/dashboard/admin')
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

  revalidatePath(`/suivi/${orderId}`)
  revalidatePath('/dashboard/livreur')
  revalidatePath('/dashboard/admin')

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

export async function completeDelivery(orderId: string, ardoise: number, totalExpected: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Calcul du cash réellement mis en poche = totalExpected + l'ardoise (l'argent supplémentaire gardé)
  // Ou plutôt : encaissement = totalExpected - ardoise si client n'a pas payé, 
  // Mais la logique de l'ardoise c'est : Client donne 10.000, Prix 7.000, livreur rend 2.000 au lieu de 3.000. 
  // Le livreur a pris 8.000. L'ardoise est 1.000. Encaissement = 8.000.
  const encaissementReel = totalExpected + ardoise
  const statusToSet: OrderStatus = ardoise > 0 ? 'livre_partiel' : 'livre'

  await supabase.from('orders').update({ 
    status: statusToSet,
    ardoise_livreur: ardoise > 0 ? ardoise : 0,
    encaissement_reel: encaissementReel
  }).eq('id', orderId)

  await supabase.from('order_status_history').insert({
    order_id: orderId, 
    status: statusToSet, 
    note: ardoise > 0 ? `Livraison avec ardoise (${ardoise} F) par manque de monnaie` : 'Livraison sans ardoise', 
    created_by: user.id,
  })

  revalidatePath(`/suivi/${orderId}`)
  revalidatePath('/dashboard/livreur')
  revalidatePath('/dashboard/admin')

  // Notification WhatsApp
  const { data: order } = await supabase
    .from('orders')
    .select(`*, client:profiles!orders_client_id_fkey(full_name, phone), livreur:profiles!orders_livreur_id_fkey(full_name, phone), zone_from:zones!orders_zone_from_id_fkey(name), zone_to:zones!orders_zone_to_id_fkey(name)`)
    .eq('id', orderId).single()

  if (order) {
    const msg = buildMessage('order_delivered', {
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
    
    // Si ardoise, on ajoute une ligne perso au message
    let finalMsg = msg
    if (ardoise > 0) {
      finalMsg += `\n\n📌 *Note* : Un manque de monnaie de ${ardoise} FCFA a été signalé par le livreur. Ce montant a été crédité en votre faveur sur votre compte Nelal Express.`
    }
    
    await sendWhatsAppNotification(order.client.phone, finalMsg)
  }

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

  // 1. Vérifier que c'est bien l'Admin qui fait ça
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Seul un administrateur peut créer un livreur' }

  // 2. Créer un client "Super-Admin" qui a les droits de forcer la création d'un compte
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. Créer l'utilisateur dans l'Auth Supabase
  const { data, error } = await adminAuthClient.auth.admin.createUser({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    user_metadata: {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      role: 'livreur'
    },
    email_confirm: true,
  })

  if (error) return { error: error.message }

  // 4. Mettre à jour sa zone et son rôle dans la table `profiles`
  await adminAuthClient.from('profiles').update({
    role: 'livreur',
    zone_id: (formData.get('zone_id') as string) || null,
  }).eq('id', data?.user?.id)

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
