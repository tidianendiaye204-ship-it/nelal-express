// actions/wallet.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Admin action to collect cash from a livreur and reset their wallet.
 * This clears the 'cash_held' balance for that livreur.
 */
export async function collectCash(livreurId: string, amountToCollect: number) {
  const supabase = await createClient()
  
  // 1. Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }
  
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (adminProfile?.role !== 'admin') return { error: 'Seul un administrateur peut collecter des fonds' }

  // 2. Fetch current livreur wallet
  const { data: livreurProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('full_name, cash_held')
    .eq('id', livreurId)
    .single()

  if (fetchError || !livreurProfile) return { error: 'Livreur introuvable' }

  const currentCash = livreurProfile.cash_held || 0
  
  if (amountToCollect > currentCash) {
    return { error: `Le montant à collecter (${amountToCollect}) est supérieur au cash détenu par le livreur (${currentCash})` }
  }

  // 3. Update wallet using Admin Client to bypass RLS
  const newBalance = currentCash - amountToCollect
  
  const adminSupabase = createAdminClient()
  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ cash_held: newBalance })
    .eq('id', livreurId)

  if (updateError) return { error: updateError.message }

  // 4. Log the transaction in the history (reusing order_status_history or a dedicated table)
  // For now, we simulate a system message or logging
  console.log(`[CASH COLLECTION] Admin ${user.id} collected ${amountToCollect} F from ${livreurProfile.full_name} (${livreurId})`)

  revalidatePath('/dashboard/admin/wallet')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/livreur') // So the blocking state updates immediately
  
  return { success: true, newBalance }
}
