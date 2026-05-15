import { createClient } from '@supabase/supabase-js'
import { Zone, Quartier } from '@/lib/types'
import { findZoneByText, getZoneSuggestions } from './zone-matcher'

// Cache simple des zones pour éviter de requêter Supabase trop souvent
let cachedZones: Zone[] | null = null
let lastCacheUpdate: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Récupère les zones depuis Supabase avec cache
 */
async function getZones(): Promise<Zone[]> {
  const now = Date.now()
  
  if (cachedZones && (now - lastCacheUpdate < CACHE_DURATION)) {
    return cachedZones
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Supabase URL and Service Role Key are required for chatbot")
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('zones').select('*')

  if (error) {
    console.error('[Chatbot] Erreur récupération zones:', error)
    return cachedZones || []
  }

  cachedZones = data || []
  lastCacheUpdate = now
  return cachedZones
}

/**
 * Trouve une zone par texte (Chatbot)
 */
export async function findZone(query: string): Promise<Zone | null> {
  const zones = await getZones()
  return findZoneByText(query, zones)
}

/**
 * Trouve une zone avec suggestions si non trouvée
 */
export async function findZoneWithSuggestions(query: string): Promise<{ 
  found: Zone | null, 
  suggestions: Zone[] 
}> {
  const zones = await getZones()
  const found = findZoneByText(query, zones)
  
  if (found) return { found, suggestions: [] }
  
  const suggestions = getZoneSuggestions(query, zones)
  return { found: null, suggestions }
}

/**
 * Récupère les quartiers d'une zone spécifique
 */
export async function getQuartiersForZone(zoneId: string): Promise<Quartier[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key)
  const { data } = await supabase
    .from('quartiers')
    .select('*')
    .eq('zone_id', zoneId)
    .order('nom')

  return data || []
}

/**
 * Trouve un quartier par texte dans une zone donnée
 */
export async function findQuartier(query: string, zoneId: string): Promise<Quartier | null> {
  const quartiers = await getQuartiersForZone(zoneId)
  const normQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  
  // Match exact ou contient
  return quartiers.find(q => 
    q.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normQuery)
  ) || null
}
