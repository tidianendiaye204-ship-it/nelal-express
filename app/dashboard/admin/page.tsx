// app/dashboard/admin/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminOrderTable from '@/components/AdminOrderTable'
import { 
  Truck, Users, ArrowUpRight, 
  ShieldAlert, TrendingUp, HandCoins,
  CheckCircle, Clock
} from 'lucide-react'
import NotificationEnabler from '@/components/NotificationEnabler'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { data: orders },
    { data: livreurs },
    { data: allOrdersForStats }
  ] = await Promise.all([
    supabase.from('orders')
      .select(`
        *,
        client:profiles!orders_client_id_fkey(full_name, phone),
        livreur:profiles!orders_livreur_id_fkey(full_name, phone),
        zone_from:zones!orders_zone_from_id_fkey(name, type),
        zone_to:zones!orders_zone_to_id_fkey(name, type)
      `)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('profiles').select('*').eq('role', 'livreur'),
    supabase.from('orders').select('price, status, payment_method')
  ])

  const stats = {
    pending: allOrdersForStats?.filter(o => o.status === 'en_attente').length || 0,
    active: allOrdersForStats?.filter(o => o.status === 'en_cours' || o.status === 'confirme').length || 0,
    totalDelivered: allOrdersForStats?.filter(o => o.status === 'livre' || o.status === 'livre_partiel').length || 0,
    totalLivreurs: livreurs?.length || 0,
    totalRevenue: allOrdersForStats?.filter(o => o.status === 'livre' || o.status === 'livre_partiel')
      .reduce((acc, o) => acc + (o.price || 0), 0) || 0,
    cashWithLivreurs: livreurs?.reduce((acc, l) => acc + (l.cash_held || 0), 0) || 0,
    pendingCashCollection: allOrdersForStats?.filter(o => 
      (o.status === 'confirme' || o.status === 'en_cours') && o.payment_method === 'cash'
    ).reduce((acc, o) => acc + (o.price || 0), 0) || 0
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-display font-black text-4xl text-slate-900 uppercase italic tracking-tighter leading-none">
            Centre de <span className="text-orange-500">Contrôle</span>
          </h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-500" /> Administration Nelal Express
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <Link href="/dashboard/admin/livreurs" className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Livreurs</Link>
          <Link href="/dashboard/admin/zones" className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Tarification</Link>
          <Link href="/dashboard/admin/marketing" className="px-5 py-2.5 bg-white shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-orange-500 transition-colors">Marketing</Link>
        </div>
      </div>

      <NotificationEnabler />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attente', val: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'bg-orange-500', bg: 'bg-orange-50' },
          { label: 'En Cours', val: stats.active, icon: <Truck className="w-5 h-5" />, color: 'bg-blue-500', bg: 'bg-blue-50' },
          { label: 'Livreurs', val: stats.totalLivreurs, icon: <Users className="w-5 h-5" />, color: 'bg-purple-500', bg: 'bg-purple-50' },
          { label: 'Missions', val: stats.totalDelivered, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-500', bg: 'bg-green-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${s.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            <div className={`w-10 h-10 ${s.color} text-white rounded-xl flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-${s.color.split('-')[1]}-500/20`}>{s.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{s.label}</p>
            <p className="text-3xl font-display font-black text-slate-900 mt-1 relative z-10">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="font-display font-black text-xl uppercase italic tracking-tighter">Flux Financier <span className="text-orange-500">Global</span></h3>
            <TrendingUp className="w-6 h-6 text-orange-500" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
             <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CA Total</p><p className="text-3xl font-display font-black text-white">{stats.totalRevenue.toLocaleString()} F</p></div>
             <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Chez Livreurs</p><p className="text-3xl font-display font-black text-orange-500">{stats.cashWithLivreurs.toLocaleString()} F</p></div>
             <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">En Attente</p><p className="text-3xl font-display font-black text-blue-400">{stats.pendingCashCollection.toLocaleString()} F</p></div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center"><HandCoins className="w-6 h-6 text-slate-400" /></div>
              <h4 className="font-display font-black text-sm uppercase tracking-tight">Encaissements</h4>
           </div>
           <p className="text-xs font-bold text-slate-600 mb-6 italic">Passif livreurs : <span className="text-orange-600 font-black">{stats.cashWithLivreurs.toLocaleString()} F</span></p>
           <Link href="/dashboard/admin/livreurs" className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">Gérer <ArrowUpRight className="w-4 h-4 text-orange-500" /></Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="font-display font-black text-xl text-slate-900 uppercase italic tracking-tighter">Centre de <span className="text-orange-500">Missions</span></h2>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">50 Dernières</span>
        </div>
        <AdminOrderTable initialOrders={orders || []} livreurs={livreurs || []} />
      </div>
    </div>
  )
}
