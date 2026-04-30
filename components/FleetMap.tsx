'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Profile } from '@/lib/types'

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface FleetMapProps {
  livreurs: any[]
  orders: any[]
}

export default function FleetMap({ livreurs, orders }: FleetMapProps) {
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    // Load Leaflet in the client
    import('leaflet').then(mod => {
      setL(mod)
    })
  }, [])

  const getIcon = (type: 'bike-free' | 'bike-busy' | 'pickup' | 'delivery') => {
    if (!L) return undefined
    
    let iconUrl = ''
    switch(type) {
      case 'bike-free': iconUrl = 'https://cdn-icons-png.flaticon.com/512/3198/3198336.png'; break; // Greenish/Normal
      case 'bike-busy': iconUrl = 'https://cdn-icons-png.flaticon.com/512/3198/3198348.png'; break; // Red/Busy
      case 'pickup': iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png'; break; // Target
      case 'delivery': iconUrl = 'https://cdn-icons-png.flaticon.com/512/1216/1216733.png'; break; // Home/Destination
    }

    return L.icon({
      iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }

  // Filter out livreurs without coordinates
  const livreursWithPos = livreurs.filter(l => l.lat && l.lng)

  return (
    <div className="w-full h-full min-h-[500px] rounded-[2rem] overflow-hidden relative z-0">
      <MapContainer 
        center={[14.6937, -17.4441]} // Dakar
        zoom={13} 
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* LIVREURS */}
        {livreursWithPos.map(l => (
          <Marker 
            key={l.id} 
            position={[parseFloat(l.lat), parseFloat(l.lng)]} 
            icon={getIcon(l.status === 'free' ? 'bike-free' : 'bike-busy')}
          >
            <Popup>
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-tight leading-none text-slate-900">{l.full_name}</p>
                <p className={`text-[8px] font-bold uppercase ${l.status === 'free' ? 'text-green-500' : 'text-orange-500'}`}>
                  {l.status === 'free' ? 'Disponible' : `En cours (${l.activeOrdersCount} colis)`}
                </p>
                <p className="text-[8px] text-slate-400">Tel: {l.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ORDERS (Points de ramassage/livraison) */}
        {orders.map(o => (
          // In a real app, we might want to show both pickup and delivery if they have GPS
          // For now let's assume we use zone centers or specific addresses if they had coords
          // Since the database currently mostly has zone IDs and text addresses, 
          // a full fleet map would need Geocoding. 
          // For this demo, we'll focus on Livreurs positions.
          null
        ))}
      </MapContainer>
    </div>
  )
}
