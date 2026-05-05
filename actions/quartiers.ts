'use server'

import { createClient } from '@/utils/supabase/server'
import { Quartier } from '@/lib/types'

export async function searchQuartiers(query: string = ''): Promise<{ data: Quartier[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    let dbQuery = supabase
      .from('quartiers')
      .select('*, zone:zones(*)')
    
    if (query.trim().length > 0) {
      // Use or for better matching
      dbQuery = dbQuery.or(`nom.ilike.%${query}%,nom.ilike.%${query.replace(/ /g, '%')}%`)
    }
    
    // Sort by name or predefined logic
    dbQuery = dbQuery.order('nom', { ascending: true }).limit(50)

    const { data, error } = await dbQuery

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    console.error('Erreur searchQuartiers:', error)
    return { data: null, error: error.message }
  }
}
