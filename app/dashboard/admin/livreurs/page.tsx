// app/dashboard/admin/livreurs/page.tsx
import { createClient } from '@/utils/supabase/server'
import { createLivreur } from '@/actions/orders'
import { redirect } from 'next/navigation'
import { UserPlus, Bike } from 'lucide-react'
import LivreurRow from '@/components/LivreurRow'

export const dynamic = 'force-dynamic'

export default async function AdminLivreursPage() {
  let statsByLivreur: any[] = []
  let zones: any[] = []
  let errorMsg: string | null = null

  try {
    const supabase = await createClient()

    const [
      { data: livreurs, error: lError },
      { data: zonesData, error: zError },
      { data: orderStats, error: oError }
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select(`
          *,
          zone:zones(name, type)
        `)
        .eq('role', 'livreur')
        .order('created_at', { ascending: false }),
      supabase
        .from('zones').select('*').order('type').order('name'),
      supabase
        .from('orders')
        .select('livreur_id, status, price')
        .not('livreur_id', 'is', null)
    ])

    if (lError) throw new Error(`Profiles: ${lError.message}`)
    if (zError) throw new Error(`Zones: ${zError.message}`)
    if (oError) throw new Error(`Orders: ${oError.message}`)

    zones = zonesData || []

    statsByLivreur = (livreurs || []).map(l => {
      const myOrders = orderStats?.filter(o => o.livreur_id === l.id) || []
      const livres = myOrders.filter(o => ['livre', 'livre_partiel'].includes(o.status))
      return {
        ...l,
        total: myOrders.length,
        livres: livres.length,
        en_cours: myOrders.filter(o => ['confirme', 'en_cours'].includes(o.status)).length,
        montant: livres.reduce((sum, o) => sum + (o.price || 0), 0),
      }
    })
  } catch (e: any) {
    console.error('[AdminLivreursPage] Critical Error:', e)
    errorMsg = e.message || 'Erreur lors du chargement des données'
  }

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createLivreur(formData)
    if (result?.success) redirect('/dashboard/admin/livreurs')
  }

  if (errorMsg) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100 m-4">
        <h2 className="text-red-600 font-black uppercase tracking-tight mb-2">Erreur de chargement</h2>
        <p className="text-red-500 text-xs font-medium">{errorMsg}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-0 pb-24">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">Flotte Livreurs</h1>
        <div className="h-1 w-8 bg-slate-900 mt-2 rounded-full"></div>
        <p className="text-slate-500 text-xs font-bold mt-2 tracking-wide">
          {statsByLivreur.length} livreur(s) opérationnel(s)
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 cursor-default">

        {/* LISTE LIVREURS */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {!statsByLivreur.length ? (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                <Bike className="w-8 h-8" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 uppercase tracking-tight">Aucun livreur</h3>
              <p className="text-slate-500 text-sm mt-1">Créez votre premier compte livreur ci-contre.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {statsByLivreur.map((l) => (
                <LivreurRow key={l.id} livreur={l as any} zones={zones || []} />
              ))}
            </div>
          )}
        </div>

        {/* FORMULAIRE AJOUT */}
        <div className="order-1 lg:order-2">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 lg:sticky lg:top-24 shadow-xl shadow-slate-900/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-black text-base text-slate-900 uppercase tracking-tight leading-tight">Nouveau Profil</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Création de compte</p>
              </div>
            </div>

            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom complet</label>
                <input
                  name="full_name" type="text" required placeholder="Ex: Modou Fall"
                  className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Téléphone</label>
                <input
                  name="phone" type="tel" required placeholder="77 XXX XX XX"
                  className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email (Connexion)</label>
                <input
                  name="email" type="email" required placeholder="livreur@nelal.sn"
                  className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
                <input
                  name="password" type="password" required minLength={8} placeholder="Min. 8 caractères"
                  className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assignation zone</label>
                <select
                  name="zone_id"
                  className="w-full bg-slate-50 border-none text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none appearance-none"
                >
                  <option value="">Agent volant (Toutes zones)</option>
                  {zones?.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-slate-900/20 active:scale-95 outline-none"
                >
                  Créer le compte →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
