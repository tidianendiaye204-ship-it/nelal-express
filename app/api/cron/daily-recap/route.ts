// app/api/cron/daily-recap/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppNotification } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

/**
 * CRON JOB : Envoi du récapitulatif quotidien aux vendeurs
 * Fréquence recommandée : Tous les jours à 20:00 (GMT)
 */
export async function GET(req: NextRequest) {
  // 1. Vérifier le secret (sécurité)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  try {
    // 2. Récupérer tous les vendeurs
    const { data: vendeurs } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('role', 'vendeur')

    if (!vendeurs || vendeurs.length === 0) {
      return NextResponse.json({ message: 'Aucun vendeur trouvé' })
    }

    const today = new Date().toISOString().split('T')[0]
    const results = []

    for (const vendeur of vendeurs) {
      // 3. Récupérer les commandes du jour pour ce vendeur
      const { data: orders } = await supabase
        .from('orders')
        .select('status, price')
        .eq('client_id', vendeur.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      if (!orders || orders.length === 0) continue

      const livrees = orders.filter(o => ['livre', 'livre_partiel'].includes(o.status))
      const enCours = orders.filter(o => ['en_attente', 'confirme', 'en_cours'].includes(o.status))
      const annulees = orders.filter(o => o.status === 'annule')
      
      const caDuJour = livrees.reduce((sum, o) => sum + (o.price || 0), 0)

      // 4. Construire le message
      const message = `📊 *Nelal Express — Bilan du ${new Date().toLocaleDateString('fr-FR')}*

Bonjour ${vendeur.full_name} ! Voici le résumé de vos activités du jour :

✅ *Livrés* : ${livrees.length} colis
🚴 *En cours* : ${enCours.length} colis
❌ *Annulés* : ${annulees.length} colis

💰 *Chiffre d'Affaire* : ${caDuJour.toLocaleString('fr-FR')} FCFA

Merci de votre confiance ! 🚀
_Nelal Express — Dakar & Intérieur_`

      if (vendeur.phone) {
        await sendWhatsAppNotification(vendeur.phone, message)
        results.push({ vendeur: vendeur.full_name, success: true })
      }
    }

    return NextResponse.json({ date: today, processed: results.length, details: results })
  } catch (error: any) {
    console.error('[Daily Recap Cron Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
