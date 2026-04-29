// actions/users.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('[Update Role Error]', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/admin/livreurs')
  return { success: true }
}
