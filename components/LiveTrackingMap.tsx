'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin, Navigation, Bike } from 'lucide-react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface LiveTrackingMapProps {
  orderId: string
  livreurId?: string
  initialLat?: number
  initialLng?: number
}

export default function LiveTrackingMap({ orderId, livreurId, initialLat, initialLng }: LiveTrackingMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  )
  const [L, setL] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    // Load Leaflet in the client
    import('leaflet').then(mod => {
      setL(mod)
    })

    if (!livreurId) return

    // Real-time listener for profile updates
    const channel = supabase
      .channel(`livreur-loc-${livreurId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${livreurId}`
        },
        (payload) => {
          const { lat, lng } = payload.new
          if (lat && lng) {
            setPosition([parseFloat(lat), parseFloat(lng)])
            console.log('[Map] Position updated from real-time:', { lat, lng })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [livreurId])

  if (!position && !initialLat) {
    return (
      <div className="w-full h-48 bg-slate-100 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-200">
        <Bike className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-6">
          En attente de la position du livreur...
        </p>
      </div>
    )
  }

  // Define icons once Leaflet is loaded
  const getIcon = (type: 'bike' | 'target') => {
    if (!L) return undefined
    return L.icon({
      iconUrl: type === 'bike' 
        ? 'https://cdn-icons-png.flaticon.com/512/3198/3198336.png' // Simple delivery bike icon
        : 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // target marker
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }

  return (
    <div className="w-full h-64 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 relative z-0">
      <MapContainer 
        center={position || [14.6937, -17.4441]} // Dakar defaults
        zoom={13} 
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {position && (
          <Marker position={position} icon={getIcon('bike')}>
            <Popup>
              <div className="text-[10px] font-bold uppercase tracking-tight">Le livreur est ici 🚴</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
