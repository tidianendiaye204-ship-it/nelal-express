'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import FleetMap from './FleetMap'
import { Bike, Package, Filter, Users, MapPin } from 'lucide-react'
import { Profile, Order } from '@/lib/types'

interface FleetMonitorProps {
  initialLivreurs: Profile[]
  initialOrders: any[]
}

export default function FleetMonitor({ initialLivreurs, initialOrders }: FleetMonitorProps) {
  const [livreurs, setLivreurs] = useState<Profile[]>(initialLivreurs)
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [filter, setFilter] = useState<'all' | 'free' | 'busy'>('all')
  const supabase = createClient()

  // Real-time position updates
  useEffect(() => {
    const channel = supabase
      .channel('fleet-monitor')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: 'role=eq.livreur' },
        (payload) => {
          setLivreurs(current => 
            current.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l)
          )
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Simplest way is to refresh orders when something changes
          // In a real app we'd be more granular
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        client:profiles!orders_client_id_fkey(full_name, phone),
        livreur:profiles!orders_livreur_id_fkey(full_name, phone),
        zone_from:zones!orders_zone_from_id_fkey(name, type),
        zone_to:zones!orders_zone_to_id_fkey(name, type)
      `)
      .in('status', ['confirme', 'en_cours'])
    if (data) setOrders(data)
  }

  const enrichedLivreurs = useMemo(() => {
    return livreurs.map(l => {
      const activeOrders = orders.filter(o => o.livreur_id === l.id)
      return {
        ...l,
        activeOrdersCount: activeOrders.length,
        status: activeOrders.length > 0 ? 'busy' : 'free'
      }
    })
  }, [livreurs, orders])

  const filteredLivreurs = useMemo(() => {
    if (filter === 'all') return enrichedLivreurs
    return enrichedLivreurs.filter(l => l.status === filter)
  }, [enrichedLivreurs, filter])

  return (
    <div className="space-y-6">
      {/* FILTERS & STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-orange-500" />
            <h3 className="font-display font-black text-sm uppercase tracking-tight">Filtres Flotte</h3>
          </div>
          <div className="space-y-2">
            {[
              { id: 'all', label: 'Tous les livreurs', icon: <Users className="w-4 h-4" /> },
              { id: 'free', label: 'Livreurs Libres', icon: <div className="w-2 h-2 bg-green-500 rounded-full" /> },
              { id: 'busy', label: 'En Livraison', icon: <div className="w-2 h-2 bg-orange-500 rounded-full" /> },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden min-h-[500px]">
          <FleetMap livreurs={filteredLivreurs} orders={orders} />
        </div>
      </div>

      {/* QUICK LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
          <div className="flex items-center justify-between mb-8">
             <h4 className="font-display font-black text-lg uppercase italic tracking-tighter">Status <span className="text-orange-500">Live</span></h4>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Flux Temps Réel</span>
             </div>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Livreurs</span>
                <span className="text-2xl font-display font-black">{livreurs.length}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                <span className="text-[10px] font-black uppercase text-green-400">Libres</span>
                <span className="text-2xl font-display font-black text-green-500">{enrichedLivreurs.filter(l => l.status === 'free').length}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                <span className="text-[10px] font-black uppercase text-orange-400">Occupés</span>
                <span className="text-2xl font-display font-black text-orange-500">{enrichedLivreurs.filter(l => l.status === 'busy').length}</span>
             </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <h4 className="font-display font-black text-sm uppercase tracking-tight mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" /> Missions Actives ({orders.length})
           </h4>
           <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {orders.map(order => (
                <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-orange-200 transition-colors">
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1">{order.description}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{order.zone_from?.name} → {order.zone_to?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Livreur</p>
                    <p className="text-[10px] font-bold text-orange-600 uppercase">{order.livreur?.full_name || 'Non assigné'}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
