// actions/orders.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { buildMessage } from '@/lib/whatsapp'
// Note: Notification functions are imported dynamically inside actions to prevent client-side bundling issues.
import { incrementOrAddRepere } from '@/actions/reperes'
import type { OrderStatus, PaymentMethod, OrderType, Order } from '@/lib/types'

import { calculateDynamicPrice, type ParcelSize } from '@/lib/utils/pricing'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nelal-express.vercel.app'

// ── CLIENT ──────────────────────────────────────────────

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const zone_from_id = formData.get('zone_from_id') as string
  const zone_to_id = formData.get('zone_to_id') as string
  const isExpress = formData.get('is_express') === '1'
  const parcel_size = (formData.get('parcel_size') as ParcelSize) || 'petit'

  // Récupérer les tarifs des deux zones
  const { data: zones } = await supabase
    .from('zones')
    .select('id, tarif_base')
    .in('id', [zone_from_id, zone_to_id])

  // Tarif de base par défaut
  const basePrice = zones && zones.length > 0 
    ? Math.max(...zones.map(z => z.tarif_base)) 
    : 2000
    
  // Calcul dynamique
  const price = calculateDynamicPrice({
    zoneFromId: zone_from_id,
    zoneToId: zone_to_id,
    isExpress,
    parcelSize: parcel_size,
    basePrice
  })

  const deliveryCode = Math.floor(1000 + Math.random() * 9000)

  const { data: order, error } = await supabase.from('orders').insert({
    client_id: user.id,
    zone_from_id,
    zone_to_id,
    parcel_size,
    type: formData.get('type') as OrderType,
    description: formData.get('description') as string,
    pickup_address: formData.get('pickup_address') as string || 'Non spécifié',
    delivery_address: formData.get('delivery_address') as string || 'Non spécifié',
    gps_link: (formData.get('gps_link') as string) || null,
    recipient_name: formData.get('recipient_name') as string,
    recipient_phone: formData.get('recipient_phone') as string,
    address_landmark: (formData.get('address_landmark') as string) || null,
    payment_method: formData.get('payment_method') as PaymentMethod,
    price,
    delivery_code: deliveryCode,
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
  const acceptUrl = `${BASE_URL}/dashboard/livreur/disponibles`
  const ref = order.id.slice(0, 8).toUpperCase()

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
    acceptUrl,
  }

  // ─── 🔔 WEB PUSH (gratuit, fonctionne même app fermée) ───────────
  const { sendPushToRole, sendPushToLivreursInZone } = await import('@/lib/web-push')

  // Push à tous les admins
  sendPushToRole('admin', {
    title: '🚨 Nouvelle commande !',
    body: `📦 ${order.description} — ${order.zone_from?.name || ''} → ${order.zone_to?.name || ''} — ${order.price.toLocaleString('fr-FR')} FCFA`,
    url: `/dashboard/admin`,
    tag: `new-order-${ref}`,
  }).catch(err => console.error('[Push Admin Error]', err))

  // Push aux livreurs de la zone de départ
  if (order.zone_from_id) {
    sendPushToLivreursInZone(order.zone_from_id, {
      title: '🔔 Course dispo !',
      body: `📦 ${order.description} — ${order.zone_from?.name || ''} → ${order.zone_to?.name || ''} — ${order.price.toLocaleString('fr-FR')} FCFA`,
      url: `/dashboard/livreur/disponibles`,
      tag: `new-order-livreur-${ref}`,
    }).catch(err => console.error('[Push Livreur Error]', err))
  }

  // ─── 📱 WHATSAPP (quand Twilio sera configuré) ───────────────────
  const { sendWhatsAppNotification } = await import('@/lib/whatsapp')
  const msgAdmin = buildMessage('new_order_admin', msgData)

  // 1. Notify Admins via WhatsApp
  const { data: admins } = await supabase.from('profiles').select('phone').eq('role', 'admin')
  const fallbackPhone = process.env.ADMIN_WHATSAPP_PHONE

  let adminPhones: string[] = []
  if (admins && admins.length > 0) {
    adminPhones = admins.map(a => a.phone).filter(Boolean)
  }
  
  // Toujours ajouter le numéro de fallback s'il existe et n'est pas déjà dans la liste
  if (fallbackPhone && !adminPhones.includes(fallbackPhone)) {
    adminPhones.push(fallbackPhone)
  }

  for (const phone of adminPhones) {
    try {
      await sendWhatsAppNotification(phone, msgAdmin)
    } catch (err) {
      console.error(`[WhatsApp Admin Error] Failed to notify ${phone}:`, err)
    }
  }

  // 2. Notify Livreurs via WhatsApp (tous les livreurs de la zone)
  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id, phone')
    .eq('role', 'livreur')
    .eq('zone_id', order.zone_from_id)
    // On retire la restriction de temps pour s'assurer qu'ils reçoivent la notif sur leur tel
    // .gte('last_seen_at', fiveMinsAgo)
    
  if (livreurs && livreurs.length > 0) {
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
  const parcel_size = (formData.get('parcel_size') as ParcelSize) || 'petit'

  const price = calculateDynamicPrice({
    zoneFromId: zone_from_id,
    zoneToId: zone_to_id,
    quartierFromId: quartier_depart_id,
    quartierToId: quartier_arrivee_id,
    isExpress,
    parcelSize: parcel_size,
    basePrice: Math.max(qDepart?.frais_livraison_base || 0, qArrivee?.frais_livraison_base || 0)
  })

  const deliveryCode = Math.floor(1000 + Math.random() * 9000)

  const { data: order, error } = await supabase.from('orders').insert({
    client_id: user.id,
    quartier_depart_id,
    quartier_arrivee_id,
    zone_from_id, // Backward compatibility
    zone_to_id,   // Backward compatibility
    parcel_size,
    pickup_address: qDepart?.nom,
    delivery_address: qArrivee?.nom,
    type: 'particulier', // Par défaut
    description: formData.get('description') as string,
    recipient_name: formData.get('recipient_name') as string,
    recipient_phone: formData.get('recipient_phone') as string,
    address_landmark: (formData.get('pickup_repere') as string) || null,
    payment_method: formData.get('payment_method') as PaymentMethod,
    price,
    delivery_code: deliveryCode,
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
      const { sendWhatsAppNotification } = await import('@/lib/whatsapp')
      await sendWhatsAppNotification(order.client.phone, msg)
    }
  }

  revalidatePath('/dashboard/livreur')
  return { success: true }
}

export async function completeDelivery(orderId: string, ardoise: number, totalExpected: number, photoUrl?: string, signatureUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Calcul du cash réellement mis en poche = totalExpected + l'ardoise (l'argent supplémentaire gardé)
  const encaissementReel = totalExpected + ardoise
  const statusToSet: OrderStatus = ardoise > 0 ? 'livre_partiel' : 'livre'

  // Si paiement en cash, on met à jour le portefeuille (wallet) du livreur
  const { data: orderOriginal } = await supabase.from('orders').select('payment_method').eq('id', orderId).single()
  
  if (orderOriginal?.payment_method === 'cash') {
    // 1. On incrémente le cash_held dans le profil du livreur
    const { data: profile } = await supabase.from('profiles').select('cash_held').eq('id', user.id).single()
    const newCashHeld = (profile?.cash_held || 0) + encaissementReel
    await supabase.from('profiles').update({ cash_held: newCashHeld }).eq('id', user.id)

    // 2. Si ardoise, on crédite le solde du client (la monnaie que l'agence lui doit)
    if (ardoise > 0) {
      const { data: orderWithClient } = await supabase.from('orders').select('client_id').eq('id', orderId).single()
      if (orderWithClient?.client_id) {
        const { data: clientProfile } = await supabase.from('profiles').select('balance').eq('id', orderWithClient.client_id).single()
        const newBalance = (clientProfile?.balance || 0) + ardoise
        await supabase.from('profiles').update({ balance: newBalance }).eq('id', orderWithClient.client_id)
      }
    }
  }

  await supabase.from('orders').update({ 
    status: statusToSet,
    ardoise_livreur: ardoise > 0 ? ardoise : 0,
    encaissement_reel: encaissementReel,
    delivery_photo_url: photoUrl,
    recipient_signature_url: signatureUrl
  }).eq('id', orderId)

  await supabase.from('order_status_history').insert({
    order_id: orderId, 
    status: statusToSet, 
    note: ardoise > 0 ? `Livraison avec ardoise (${ardoise} F) par manque de monnaie` : 'Livraison validée par signature', 
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
    
    const { sendWhatsAppNotification } = await import('@/lib/whatsapp')
    await sendWhatsAppNotification(order.client.phone, finalMsg)
  }

  return { success: true }
}

/**
 * Validate delivery with the 4-digit code provided by the recipient
 */
export async function confirmDeliveryWithCode(orderId: string, inputCode: string, ardoise: number, totalExpected: number, photoUrl?: string, signatureUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // 1. Récupérer le code attendu
  const { data: order } = await supabase
    .from('orders')
    .select('delivery_code')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Commande introuvable' }
  
  // 2. Vérification du code
  if (order.delivery_code?.toString() !== inputCode.trim()) {
    return { error: 'Code de confirmation incorrect. Demandez le code au destinataire.' }
  }

  // 3. Procéder à la finalisation
  return await completeDelivery(orderId, ardoise, totalExpected, photoUrl, signatureUrl)
}

/**
 * Update the pickup photo as proof of collection
 */
export async function updatePickupPhoto(orderId: string, photoUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('orders')
    .update({ 
      pickup_photo_url: photoUrl,
      status: 'en_cours' 
    })
    .eq('id', orderId)

  if (error) return { error: error.message }

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'en_cours',
    note: 'Colis récupéré avec photo preuve au départ',
    created_by: user.id,
  })

  revalidatePath(`/suivi/${orderId}`)
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
    const { sendWhatsAppNotification } = await import('@/lib/whatsapp')
    await sendWhatsAppNotification(order.client.phone, msg)
    
  }

  // Push notification au livreur assigné
  const { sendPushToUser } = await import('@/lib/web-push')
  const ref = orderId.slice(0, 8).toUpperCase()
  sendPushToUser(livreurId, {
    title: '🚀 Nouvelle course assignée !',
    body: `Le colis #${ref} vous a été attribué. Cliquez pour voir les détails.`,
    url: `/dashboard/livreur`,
    tag: `assign-${ref}`,
  }).catch(err => console.error('[Push Assign Error]', err))

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function createLivreur(formData: FormData) {
  try {
    const supabase = await createClient()

    // 1. Vérifier que c'est bien l'Admin qui fait ça
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user || authError) return { error: 'Non connecté ou session expirée' }
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Seul un administrateur peut créer un livreur' }

    // 2. Créer l'admin client (Service Role)
    let adminAuthClient;
    try {
      adminAuthClient = createAdminClient()
    } catch (e: any) {
      console.error('[Admin Client Error]', e.message)
      return { error: "Configuration serveur incomplète : Clé SERVICE_ROLE manquante sur Vercel." }
    }

    // 3. Créer l'utilisateur dans l'Auth Supabase
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const zone_id = formData.get('zone_id') as string

    const { data: newUser, error: createError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name,
        phone,
        role: 'livreur'
      },
      email_confirm: true,
    })

    if (createError) {
      console.error('[CreateLivreur Auth Error]', createError.message)
      return { error: `Erreur Auth: ${createError.message}` }
    }

    if (!newUser?.user) return { error: "L'utilisateur a été créé mais aucune donnée n'a été retournée." }

    // 4. Mettre à jour sa zone et son rôle dans la table `profiles`
    // Note: Le trigger `handle_new_user` a déjà créé le profil, on met juste à jour les champs spécifiques
    const { error: updateError } = await adminAuthClient.from('profiles').update({
      role: 'livreur',
      zone_id: zone_id || null,
      full_name: full_name, // Au cas où le trigger n'a pas pris le metadata
      phone: phone
    }).eq('id', newUser.user.id)

    if (updateError) {
      console.error('[CreateLivreur Profile Error]', updateError.message)
      return { error: `Erreur Profil: ${updateError.message}` }
    }

    revalidatePath('/dashboard/admin/livreurs')
    return { success: true }
  } catch (err: any) {
    console.error('[CreateLivreur Global Error]', err.message)
    return { error: "Une erreur critique est survenue lors de la création." }
  }
}

export async function updateZoneTarif(zoneId: string, tarifBase: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('zones').update({ tarif_base: tarifBase }).eq('id', zoneId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/zones')
  return { success: true }
}
export async function updateLivreur(livreurId: string, formData: FormData) {
  const supabase = await createClient()

  // 1. Check Admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Accès refusé' }

  // 2. Update profiles table
  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const zone_id = formData.get('zone_id') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      phone,
      zone_id: zone_id || null
    })
    .eq('id', livreurId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/livreurs')
  revalidatePath('/dashboard/admin/marketing')
  return { success: true }
}

export async function adminUpdateOrder(orderId: string, updates: Partial<Order>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Accès réservé aux administrateurs' }

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId)
  if (error) return { error: error.message }

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: updates.status || 'modified',
    note: `Modification administrative par ${profile.full_name}.`,
    created_by: user.id
  })

  revalidatePath('/dashboard/admin')
  revalidatePath(`/suivi/${orderId}`)
  return { success: true }
}

export async function adminCancelOrder(orderId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Accès réservé aux administrateurs' }

  const { error } = await supabase.from('orders').update({ status: 'annule' }).eq('id', orderId)
  if (error) return { error: error.message }

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'annule',
    note: `ANNULATION ADMIN : ${reason} (par ${profile.full_name})`,
    created_by: user.id
  })

  revalidatePath('/dashboard/admin')
  revalidatePath(`/suivi/${orderId}`)
  return { success: true }
}

export async function adminConfirmCashReceipt(livreurId: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Accès réservé aux administrateurs' }

  const { data: livreur } = await supabase.from('profiles').select('cash_held').eq('id', livreurId).single()
  if (!livreur) return { error: 'Livreur introuvable' }

  const newCashHeld = Math.max(0, (livreur.cash_held || 0) - amount)
  const { error } = await supabase.from('profiles').update({ cash_held: newCashHeld }).eq('id', livreurId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/livreurs')
  return { success: true }
}
