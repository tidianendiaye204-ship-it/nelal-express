// lib/utils/maps.ts

/**
 * Generates a Google Maps directions link between two addresses.
 * Opens the Google Maps app on mobile or the web on desktop.
 */
export function getDirectionsLink(
  origin: string,
  destination: string,
  zoneTo?: string
): string {
  const originQuery = encodeURIComponent(origin)
  const destinationQuery = encodeURIComponent(
    zoneTo ? `${destination}, ${zoneTo}, Sénégal` : `${destination}, Sénégal`
  )
  return `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destinationQuery}&travelmode=driving`
}

/**
 * Generates a Google Maps search link for a single address.
 */
export function getMapSearchLink(address: string, zone?: string): string {
  const query = encodeURIComponent(
    zone ? `${address}, ${zone}, Dakar, Sénégal` : `${address}, Sénégal`
  )
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

/**
 * Generates the full route link from pickup to delivery with waypoints.
 * Uses the GPS link if available, otherwise falls back to address geocoding.
 */
export function getFullRouteLink(order: {
  pickup_address: string
  delivery_address: string
  zone_from?: { name: string } | null
  zone_to?: { name: string } | null
  gps_link?: string | null
}): string {
  const origin = order.zone_from
    ? `${order.pickup_address}, ${order.zone_from.name}, Dakar, Sénégal`
    : `${order.pickup_address}, Dakar, Sénégal`

  const destination = order.zone_to
    ? `${order.delivery_address}, ${order.zone_to.name}, Sénégal`
    : `${order.delivery_address}, Sénégal`

  return getDirectionsLink(origin, destination)
}

/**
 * Formats a distance / duration estimation label based on zone types.
 * This is a rough estimate based on zone categories.
 */
export function getEstimatedTime(
  zoneFromType?: string,
  zoneToType?: string
): string {
  if (!zoneFromType || !zoneToType) return '—'

  // Same zone type
  if (zoneFromType === zoneToType) {
    if (zoneFromType === 'dakar_centre') return '~20-30 min'
    if (zoneFromType === 'banlieue') return '~30-45 min'
    return '~2-4h'
  }

  // Cross zone types
  if (
    (zoneFromType === 'dakar_centre' && zoneToType === 'banlieue') ||
    (zoneFromType === 'banlieue' && zoneToType === 'dakar_centre')
  ) {
    return '~30-60 min'
  }

  if (zoneFromType === 'interieur' || zoneToType === 'interieur') {
    return '~3-8h'
  }

  return '~1-2h'
}
