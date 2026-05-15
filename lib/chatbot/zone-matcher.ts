import { Zone } from '@/lib/types'

/**
 * Normalise une chaîne de caractères :
 * - Bas de casse
 * - Suppression des accents
 * - Suppression des caractères spéciaux
 */
export function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]/g, ' ')      // Garde alphanumérique + espaces
    .replace(/\s+/g, ' ')           // Un seul espace
    .trim()
}

/**
 * Dictionnaire d'alias pour les zones sénégalaises communes
 */
const ZONE_ALIASES: Record<string, string[]> = {
  'Plateau / Centre-ville': ['plateau', 'centre', 'centre ville', 'dakar plateau'],
  'Médina': ['medina', 'madina', 'tilene'],
  'Yoff / Almadies': ['yoff', 'almadies', 'almadie', 'aeroport'],
  'Les Mamelles / Ouakam': ['ouakam', 'mamelles', 'mamelle'],
  'Pikine': ['pikine', 'piki', 'bountou pikine'],
  'Guédiawaye': ['guediawaye', 'gediawaye', 'guediaway', 'guedj'],
  'Parcelles Assainies': ['parcelles', 'assainies', 'parcel', 'parcelle', 'pa'],
  'Thiaroye': ['thiaroye', 'tiaroye', 'tiare'],
  'Yeumbeul': ['yeumbeul', 'yeumbel', 'yeumbeul'],
  'Mbao': ['mbao', 'zac mbao', 'fass mbao'],
  'Rufisque': ['rufisque', 'rufisk', 'tengueth'],
  'Keur Massar': ['keur massar', 'keurmassar', 'massar'],
  'Malika': ['malika', 'malika sur mer'],
  'Saint-Louis': ['saint louis', 'st louis', 'ndar', 'saint-louis'],
  'Ndioum': ['ndioum', 'ndiom', 'dioum'],
  'Podor': ['podor'],
  'Matam': ['matam'],
  'Thiès': ['thies', 'thiesse'],
  'Touba': ['touba', 'tuba'],
  'Kaolack': ['kaolack', 'kaolak', 'koalack'],
  'Ziguinchor': ['ziguinchor', 'ziginchor', 'zig'],
}

/**
 * Algorithme local de matching pour les zones
 */
export function findZoneByText(query: string, zones: Zone[]): Zone | null {
  const normQuery = normalizeText(query)
  if (!normQuery) return null

  // 1. Correspondance exacte sur le nom normalisé
  const exact = zones.find(z => normalizeText(z.name) === normQuery)
  if (exact) return exact

  // 2. Recherche via les alias
  for (const [zoneName, aliases] of Object.entries(ZONE_ALIASES)) {
    if (aliases.includes(normQuery)) {
      const matched = zones.find(z => z.name === zoneName)
      if (matched) return matched
    }
  }

  // 3. Le nom de la zone contient la saisie
  const contains = zones.find(z => normalizeText(z.name).includes(normQuery))
  if (contains) return contains

  // 4. La saisie contient le nom de la zone (ex: "je suis à Pikine")
  const inputContains = zones.find(z => normQuery.includes(normalizeText(z.name)))
  if (inputContains) return inputContains

  // 5. La saisie commence par les 4 premières lettres d'une zone
  if (normQuery.length >= 4) {
    const startsWith = zones.find(z => normalizeText(z.name).startsWith(normQuery.slice(0, 4)))
    if (startsWith) return startsWith
  }

  return null
}

/**
 * Retourne des suggestions si aucune zone n'est trouvée
 */
export function getZoneSuggestions(query: string, zones: Zone[]): Zone[] {
  const normQuery = normalizeText(query)
  if (!normQuery) return []

  const suggestions = zones
    .filter(z => {
      const normName = normalizeText(z.name)
      // Score simple basé sur l'inclusion ou le début de chaîne
      return normName.includes(normQuery) || normQuery.includes(normName) || normName.startsWith(normQuery.slice(0, 3))
    })
    .slice(0, 3)

  return suggestions
}
