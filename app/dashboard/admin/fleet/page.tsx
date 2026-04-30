import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FleetMonitor from '../../../../components/FleetMonitor'
import { ShieldAlert, Map as MapIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FleetPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'agent') redirect('/dashboard')

  // Fetch initial data
  const [
    { data: livreurs },
    { data: activeOrders }
  ] = await Promise.all([
    supabase.from('profiles').select('*, zone:zones(name)').eq('role', 'livreur'),
    supabase.from('orders')
      .select(`
        *,
        client:profiles!orders_client_id_fkey(full_name, phone),
        livreur:profiles!orders_livreur_id_fkey(full_name, phone),
        zone_from:zones!orders_zone_from_id_fkey(name, type),
        zone_to:zones!orders_zone_to_id_fkey(name, type)
      `)
      .in('status', ['confirme', 'en_cours'])
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-display font-black text-4xl text-slate-900 uppercase italic tracking-tighter leading-none">
            Fleet <span className="text-orange-500">Monitor</span>
          </h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <MapIcon className="w-3.5 h-3.5 text-orange-500" /> Supervision de la flotte en temps réel
          </p>
        </div>
      </div>

      <FleetMonitor 
        initialLivreurs={livreurs || []} 
        initialOrders={activeOrders || []} 
      />
    </div>
  )
}
