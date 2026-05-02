import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wallet, TrendingUp, History, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientWalletPage() {
  const supabase = await createClient()
  const profile = await getProfile()
  if (!profile || profile.role !== 'client') redirect('/auth/login')

  // Calculate wallet balance based on delivered orders with 'vendeur' type
  const { data: orders } = await supabase
    .from('orders')
    .select('id, description, status, price, valeur_colis, created_at')
    .eq('client_id', profile.id)
    .eq('type', 'vendeur')
    .order('created_at', { ascending: false })

  const deliveredOrders = (orders || []).filter(o => o.status === 'livre')
  
  // Total money collected from the buyers
  const totalCollected = deliveredOrders.reduce((sum, o) => sum + (o.valeur_colis || 0), 0)
  
  // Total delivery fees Nelal Express is taking from this money (if seller pays from collection)
  // Or maybe the buyer pays the delivery directly to Nelal? Let's assume seller pays delivery from collected amount for now.
  const totalFees = deliveredOrders.reduce((sum, o) => sum + (o.price || 0), 0)

  // Net balance
  const netBalance = totalCollected - totalFees

  return (
    <div className="max-w-2xl mx-auto pb-24 px-1">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/client/profil" className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight leading-none">Mon Portefeuille</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Nelal Pay (Vendeurs)</p>
        </div>
      </div>

      {/* BALANCE CARD */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Solde Disponible</span>
          </div>
          <div className="font-display font-black text-4xl tracking-tight mb-6">
            {netBalance.toLocaleString('fr-FR')} <span className="text-xl text-slate-400 font-bold">F</span>
          </div>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-orange-500/20">
            Demander un retrait
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest">Fonds Collectés</span>
          </div>
          <div className="font-display font-black text-xl text-slate-900">
            {totalCollected.toLocaleString('fr-FR')} F
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <History className="w-4 h-4 text-orange-500" />
            <span className="text-[9px] font-black uppercase tracking-widest">Frais Livraison</span>
          </div>
          <div className="font-display font-black text-xl text-slate-900">
            {totalFees.toLocaleString('fr-FR')} F
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
        <h2 className="font-display font-black text-lg text-slate-900 mb-4">Missions Nelal Pay Récentes</h2>
        <div className="space-y-4">
          {deliveredOrders.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm font-medium">
              Aucune commande vendeur livrée pour le moment.
            </div>
          ) : (
            deliveredOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{order.description}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right pl-4">
                  <p className="text-sm font-black text-emerald-600">+{order.valeur_colis?.toLocaleString('fr-FR')} F</p>
                  <p className="text-[10px] text-orange-500 font-bold">-{order.price?.toLocaleString('fr-FR')} F</p>
                </div>
              </div>
            ))
          )}
        </div>
        {deliveredOrders.length > 5 && (
          <button className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors py-2">
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
