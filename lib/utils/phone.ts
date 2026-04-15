/**
 * Vérifie si un numéro de téléphone sénégalais est valide.
 * Formats acceptés : +22177xxxxxxx, 0022177xxxxxxx, 77xxxxxxx, 78xxxxxxx, 76xxxxxxx, 75xxxxxxx, 70xxxxxxx
 */
export function isValidSenegalPhone(phone: string): boolean {
  // Supprime les espaces, tirets et points
  const cleanPhone = phone.replace(/[\s\-\.]/g, '')
  
  // Regex pour les numéros de mobile au Sénégal (Orange, Free, Expresso, Promobile)
  const regex = /^(?:\+221|00221)?(7[05678]\d{7})$/
  
  return regex.test(cleanPhone)
}

/**
 * Formate un numéro sénégalais au format international standard (+221...)
 * Utile pour l'API WhatsApp / Twilio
 */
export function formatSenegalPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\.]/g, '')
  const match = cleanPhone.match(/^(?:\+221|00221)?(7[05678]\d{7})$/)
  
  if (!match) return cleanPhone // Retourne tel quel si invalide
  
  return `+221${match[1]}`
}

/**
 * Génère un lien direct "Click to Chat" WhatsApp pour contacter un livreur ou client
 */
export function getWhatsAppDirectLink(phone: string, text: string = ''): string {
  const formattedPhone = formatSenegalPhone(phone).replace('+', '')
  const encodedText = encodeURIComponent(text)
  return `https://wa.me/${formattedPhone}?text=${encodedText}`
}
