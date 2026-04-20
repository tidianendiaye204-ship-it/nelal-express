'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useLiveLocation(livreurId?: string, hasActiveOrders?: boolean) {
  const supabase = createClient()
  const lastUpdateRef = useRef<number>(0)
  const UPDATE_INTERVAL = 3 * 60 * 1000 // 3 minutes

  useEffect(() => {
    if (!livreurId || !hasActiveOrders || !navigator.geolocation) return

    const success = async (position: GeolocationPosition) => {
      const now = Date.now()
      
      // Throttle updates
      if (now - lastUpdateRef.current < UPDATE_INTERVAL) return

      const { latitude: lat, longitude: lng } = position.coords
      
      try {
        await supabase
          .from('profiles')
          .update({
            lat,
            lng,
            last_location_at: new Date().toISOString()
          })
          .eq('id', livreurId)
        
        lastUpdateRef.current = now
        console.log('[LiveLocation] Position updated:', { lat, lng })
      } catch (err) {
        console.error('[LiveLocation] Failed to update position:', err)
      }
    }

    const error = (err: GeolocationPositionError) => {
      console.warn('[LiveLocation] Geolocation error:', err.message)
    }

    const watchId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })

    return () => navigator.geolocation.clearWatch(watchId)
  }, [livreurId, hasActiveOrders])
}
