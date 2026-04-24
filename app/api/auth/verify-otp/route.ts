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
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('phone', international)
      .maybeSingle()

    // Aussi chercher avec le format sans préfixe (ex: 770000000)
    let profile = existingProfile
    if (!profile) {
      const shortPhone = international.replace(/^221/, '')
      const { data: altProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('phone', shortPhone)
        .maybeSingle()
      profile = altProfile
    }

    let userId: string
    let role: string

    if (profile) {
      // Utilisateur existant → on le connecte
      userId = profile.id
      role = profile.role || 'client'
    } else {
      // Nouvel utilisateur → on le crée
      const fakeEmail = `${international}@phone.nelal.sn`
      const randomPassword = crypto.randomUUID()

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: fakeEmail,
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

      // Mettre à jour le profil avec le bon numéro
      await supabase.from('profiles').update({
        phone: international,
        full_name: otpRecord.full_name || `Client ${international.slice(-4)}`,
        role: 'client',
      }).eq('id', userId)
    }

    // 4. Générer un lien magique pour connecter l'utilisateur
    // On récupère l'email de l'utilisateur pour générer le lien
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    
    if (!userData?.user?.email) {
      return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 })
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nelal-express.vercel.app'}/dashboard/${role}`,
      }
    })

    if (linkError || !linkData) {
      console.error('[OTP Magic Link Error]', linkError)
      return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 })
    }

    // Nettoyer les anciens codes
    await supabase.from('otp_codes').delete().eq('phone', international)

    return NextResponse.json({
      success: true,
      role,
      // Le token_hash + hashed_token permettent la connexion côté client
      verification_url: linkData.properties?.action_link,
      hashed_token: linkData.properties?.hashed_token,
      redirect: `/dashboard/${role}`,
    })

  } catch (error: any) {
    console.error('[Verify OTP Error]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
