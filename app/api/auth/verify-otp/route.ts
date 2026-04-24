// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Numéro et code requis' }, { status: 400 })
    }

    const cleaned = phone.replace(/\D/g, '')
    const international = cleaned.startsWith('221') ? cleaned : `221${cleaned}`

    const supabase = createAdminClient()

    // 1. Vérifier le code OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', international)
      .eq('code', code.trim())
      .eq('used', false)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: 'Code incorrect ou expiré' }, { status: 401 })
    }

    // Vérifier l'expiration
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabase.from('otp_codes').delete().eq('id', otpRecord.id)
      return NextResponse.json({ error: 'Code expiré. Redemandez un nouveau code.' }, { status: 401 })
    }

    // 2. Marquer le code comme utilisé
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id)

    // 3. Chercher un utilisateur existant avec ce numéro
    let profile = null
    
    // Chercher avec format international (221XXXXXXXXX)
    const { data: p1 } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('phone', international)
      .maybeSingle()
    profile = p1

    // Aussi chercher avec format court (7XXXXXXXX)
    if (!profile) {
      const shortPhone = international.replace(/^221/, '')
      const { data: p2 } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('phone', shortPhone)
        .maybeSingle()
      profile = p2
    }
    
    // Aussi chercher avec +221
    if (!profile) {
      const { data: p3 } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('phone', `+${international}`)
        .maybeSingle()
      profile = p3
    }

    let userId: string
    let userEmail: string
    let role: string

    if (profile) {
      // Utilisateur existant → récupérer son email
      userId = profile.id
      role = profile.role || 'client'
      
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      userEmail = userData?.user?.email || `${international}@phone.nelal.sn`
    } else {
      // Nouvel utilisateur → on le crée
      userEmail = `${international}@phone.nelal.sn`
      const randomPassword = crypto.randomUUID()

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: otpRecord.full_name || `Client ${international.slice(-4)}`,
          phone: international,
          role: 'client',
        }
      })

      if (createError || !newUser?.user) {
        console.error('[OTP Create User Error]', createError)
        return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
      }

      userId = newUser.user.id
      role = 'client'

      // Mettre à jour le profil
      await supabase.from('profiles').update({
        phone: international,
        full_name: otpRecord.full_name || `Client ${international.slice(-4)}`,
        role: 'client',
      }).eq('id', userId)
    }

    // 4. Générer un magic link et extraire le token
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    })

    if (linkError || !linkData) {
      console.error('[OTP Magic Link Error]', linkError)
      return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 })
    }

    // Nettoyer les anciens codes
    await supabase.from('otp_codes').delete().eq('phone', international)

    // 5. Retourner le token pour que le client puisse s'authentifier
    return NextResponse.json({
      success: true,
      role,
      email: userEmail,
      token_hash: linkData.properties?.hashed_token,
      redirect: `/dashboard/${role}`,
    })

  } catch (error: any) {
    console.error('[Verify OTP Error]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
