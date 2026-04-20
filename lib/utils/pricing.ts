export type ParcelSize = 'petit' | 'moyen' | 'gros'

export function calculateDynamicPrice(params: {
  zoneFromId?: string | null,
  zoneToId?: string | null,
  quartierFromId?: string | null,
  quartierToId?: string | null,
  isExpress?: boolean,
  parcelSize?: ParcelSize,
  basePrice?: number
}) {
  const { zoneFromId, zoneToId, quartierFromId, quartierToId, isExpress, parcelSize, basePrice } = params
  
  // 1. Same Quartier (Ultra-Local)
  if (quartierFromId && quartierToId && quartierFromId === quartierToId) {
    return 500 // Flat price for neighborhood, no express surcharge
  }

  let price = basePrice || 2000

  // 2. Same Zone (Local)
  if (zoneFromId && zoneToId && zoneFromId === zoneToId) {
    price = 1000
  }

  // 3. Parcel Size Surcharge
  if (parcelSize === 'moyen') price += 1000
  if (parcelSize === 'gros') price += 3000

  // 4. Express Surcharge (Only if not ultra-local)
  if (isExpress) price += 1000

  return price
}
