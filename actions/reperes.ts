// actions/reperes.ts
'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Searches for landmarks geographically bound to a specific zone.
 */
export async function searchReperes(zoneId: string, query: string) {
  if (!query || query.trim().length === 0) return { data: [] }
  if (!zoneId) return { data: [] }
  
  const supabase = await createClient()

  // ilike for case-insensitive partial matching
  const { data, error } = await supabase
    .from('reperes')
    .select('id, nom_repere, nb_livraisons_reussies')
    .eq('zone_id', zoneId)
    .ilike('nom_repere', `%${query.trim()}%`)
    .order('nb_livraisons_reussies', { ascending: false })
    .limit(5)

  if (error) {
    console.error("Erreur recherche repères:", error)
    return { data: [] }
  }

  return { data }
}

/**
 * Internal system function called during `completeDelivery`.
 * Enriches the crowdsourcing database safely.
 */
export async function incrementOrAddRepere(zoneId: string, nomRepere: string) {
  if (!nomRepere || nomRepere.trim().length <= 5) return // Filtre de pertinence (évite "maison", "ici", etc)
  if (!zoneId) return

  const supabase = await createClient()
  const cleanRepere = nomRepere.trim()

  // Vérifier si le repère existe déjà dans cette zone exacte (insensible à la casse)
  const { data: existant } = await supabase
    .from('reperes')
    .select('id, nb_livraisons_reussies')
    .eq('zone_id', zoneId)
    .ilike('nom_repere', cleanRepere)
    .single()

  if (existant) {
    // Si la livraison est réussie et le repère connu, on incrémente la fiabilité
    await supabase
      .from('reperes')
      .update({ nb_livraisons_reussies: (existant.nb_livraisons_reussies || 0) + 1 })
      .eq('id', existant.id)
  } else {
    // Sinon, on rajoute un tout nouveau point sur la carte
    // Info : On laisse geom vide pour l'instant (ajouté ultérieurement via app mobile si GPS dispo)
    await supabase
      .from('reperes')
      .insert({
        zone_id: zoneId,
        nom_repere: cleanRepere,
        nb_livraisons_reussies: 1
      })
  }
}
