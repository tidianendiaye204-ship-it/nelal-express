// actions/profile.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  if (!full_name || full_name.trim().length < 2) {
    return { error: 'Le nom doit contenir au moins 2 caractères' }
  }

  if (!phone || phone.trim().length < 9) {
    return { error: 'Numéro de téléphone invalide' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: full_name.trim(), phone: phone.trim() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/client/profil')
  revalidatePath('/dashboard/client')
  return { success: true }
}
