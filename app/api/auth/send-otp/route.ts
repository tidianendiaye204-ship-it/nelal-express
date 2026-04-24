// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendWhatsAppNotification } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const { phone, full_name } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })
    }

    // Nettoyer le numéro : garder uniquement les chiffres
    const cleaned = phone.replace(/\D/g, '')
    const international = cleaned.startsWith('221') ? cleaned : `221${cleaned}`

    if (international.length < 12) {
      return NextResponse.json({ error: 'Numéro invalide. Exemple: 77 123 45 67' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Générer un code OTP à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // Expire dans 5 minutes

    // 2. Supprimer les anciens codes pour ce numéro
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone', international)

    // 3. Stocker le nouveau code
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone: international,
        code,
        full_name: full_name || null,
        expires_at: expiresAt.toISOString(),
        used: false,
      })

    if (insertError) {
      console.error('[OTP Insert Error]', insertError)
      return NextResponse.json({ error: 'Erreur serveur. Réessayez.' }, { status: 500 })
    }

    // 4. Envoyer le code par WhatsApp
    const message = `🔐 *Nelal Express — Code de connexion*

Votre code : *${code}*

⏰ Ce code expire dans 5 minutes.
⚠️ Ne partagez jamais ce code avec personne.

_Nelal Express — Livraison Élite au Sénégal_`

    const result = await sendWhatsAppNotification(international, message)

    if (!result.success) {
      console.error('[OTP WhatsApp Error]', result.error)
      // On ne bloque pas — le code est quand même stocké
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Code envoyé par WhatsApp',
      // En dev, on peut retourner le code pour tester
      ...(process.env.NODE_ENV === 'development' ? { code } : {})
    })

  } catch (error: any) {
    console.error('[Send OTP Error]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
