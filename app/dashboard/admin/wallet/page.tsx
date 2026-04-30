// app/dashboard/admin/wallet/page.tsx
import { createClient, getProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ArrowLeft, History, AlertTriangle, CheckCircle } from 'lucide-react'
import CashCollectionButton from '@/components/CashCollectionButton'

export const dynamic = 'force-dynamic'

export default async function AdminWalletPage() {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all livreurs with their cash_held
  const { data: livreurs } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'livreur')
    .order('cash_held', { ascending: false })

  const totalCashHeld = (livreurs || []).reduce((sum, l) => sum + (l.cash_held || 0), 0) || 0
  const blockedCount = (livreurs || []).filter(l => (l.cash_held || 0) >= (l.max_cash_limit || 25000)).length || 0

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/admin" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase">Gestion du Cash</h1>
          <p className="text-slate-500 text-sm">Suivi des fonds encaissés par vos partenaires livreurs</p>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total à collecter</p>
          <p className="text-3xl font-display font-black leading-none mb-2">
            {totalCashHeld.toLocaleString('fr-FR')} <span className="text-sm font-normal opacity-60">FCFA</span>
          </p>
          <div className="flex items-center gap-2 text-green-400 text-[10px] font-bold">
             <CheckCircle className="w-3 h-3" /> Fonds sécurisés chez les partenaires
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Partenaires actifs</p>
          <p className="text-3xl font-display font-black text-slate-900 leading-none mb-2">
            {livreurs?.length || 0}
          </p>
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-bold">
            <Users className="w-3 h-3" /> Chiffre d&apos;affaires en attente
          </div>
        </div>

        <div className={`rounded-3xl p-6 border shadow-sm transition-colors ${
          blockedCount > 0 ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-100'
        }`}>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Partenaires bloqués</p>
          <p className={`text-3xl font-display font-black leading-none mb-2 ${
            blockedCount > 0 ? 'text-orange-600' : 'text-slate-900'
          }`}>
            {blockedCount}
          </p>
          <div className={`flex items-center gap-2 text-[10px] font-bold ${
            blockedCount > 0 ? 'text-orange-600 animate-pulse' : 'text-slate-400'
          }`}>
            <AlertTriangle className="w-3 h-3" /> {blockedCount > 0 ? 'Action requise ' : 'Aucun blocage actif'}
          </div>
        </div>
      </div>

      {/* DRIVER LIST */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-display font-black text-sm text-slate-900 uppercase tracking-tight">Portefeuilles Partenaires</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temps réel</span>
        </div>

        <div className="divide-y divide-slate-50">
          {!livreurs?.length ? (
            <div className="p-10 text-center text-slate-400">Aucun livreur enregistré.</div>
          ) : (
            livreurs.map((l) => {
              const isOverLimit = (l.cash_held || 0) >= (l.max_cash_limit || 25000)
              
              return (
                <div key={l.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isOverLimit ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 uppercase text-sm tracking-tight">{l.full_name}</h3>
                      <p className="text-xs text-slate-400">{l.phone}</p>
                      {isOverLimit && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[8px] font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-2.5 h-2.5" /> Compte bloqué (Seuil atteint)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cash détenu</p>
                      <p className={`font-display font-black text-xl leading-none ${
                        isOverLimit ? 'text-orange-600' : 'text-slate-900'
                      }`}>
                        {(l.cash_held || 0).toLocaleString('fr-FR')} <span className="text-xs">F</span>
                      </p>
                    </div>

                    <CashCollectionButton livreurId={l.id} currentBalance={l.cash_held || 0} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-8 bg-blue-50 rounded-2xl p-5 border border-blue-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
          <History className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-blue-900 mb-1">Comment ça marche ?</p>
          <p className="text-[10px] text-blue-700 leading-relaxed">
            Lorsque vous recevez physiquement l&apos;argent collecté par un partenaire, cliquez sur &quot;Collecter&quot;. 
            Cela remettra sa balance à zéro ou déduira le montant saisi, lui permettant de reprendre de nouvelles commandes s&apos;il était bloqué.
          </p>
        </div>
      </div>
    </div>
  )
}
