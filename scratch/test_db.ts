
import { createClient } from './utils/supabase/server'

async function test() {
  try {
    const supabase = await createClient()
    const { data: livreurs, error: lError } = await supabase
      .from('profiles')
      .select(`
        *,
        zone:zones(name, type)
      `)
      .eq('role', 'livreur')
    
    if (lError) {
      console.error('Livreurs error:', lError)
    } else {
      console.log('Livreurs count:', livreurs?.length)
      if (livreurs && livreurs.length > 0) {
        console.log('First livreur:', JSON.stringify(livreurs[0], null, 2))
      }
    }

    const { data: zones, error: zError } = await supabase
      .from('zones').select('*')
    
    if (zError) {
      console.error('Zones error:', zError)
    } else {
      console.log('Zones count:', zones?.length)
    }
  } catch (e) {
    console.error('Catch error:', e)
  }
}

test()
