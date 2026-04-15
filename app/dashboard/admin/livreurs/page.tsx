// app/dashboard/admin/livreurs/page.tsx
import { createClient } from '@/lib/supabase/server'
import { createLivreur } from '@/actions/orders'
import { redirect } from 'next/navigation'

export default async function AdminLivreursPage() {
  const supabase = await createClient()

  const { data: livreurs } = await supabase
    .from('profiles')
    .select(`
      *,
      zone:zones(name, type)
    `)
    .eq('role', 'livreur')
    .order('created_at', { ascending: false })

  const { data: zones } = await supabase
    .from('zones').select('*').order('type').order('name')

  // Stats livraisons par livreur
  const { data: orderStats } = await supabase
    .from('orders')
    .select('livreur_id, status')
    .not('livreur_id', 'is', null)

  const statsByLivreur = (livreurs || []).map(l => {
    const myOrders = orderStats?.filter(o => o.livreur_id === l.id) || []
    return {
      ...l,
      total: myOrders.length,
      livres: myOrders.filter(o => o.status === 'livre').length,
      en_cours: myOrders.filter(o => ['confirme', 'en_cours'].includes(o.status)).length,
    }
  })

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createLivreur(formData)
    if (result?.success) redirect('/dashboard/admin/livreurs')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-900">Gestion des livreurs</h1>
        <p className="text-slate-500 text-sm mt-1">{livreurs?.length || 0} livreur(s) enregistré(s)</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* LISTE LIVREURS */}
        <div className="lg:col-span-2">
          {!statsByLivreur.length ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <div className="text-3xl mb-2">🚴</div>
              <p className="text-slate-500 text-sm">Aucun livreur enregistré. Créez-en un ci-contre.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {statsByLivreur.map((l) => (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg flex-shrink-0">
                      {l.full_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800">{l.full_name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-3 mt-0.5">
                        <span>📞 {l.phone}</span>
                        {l.zone && <span>🗺️ {l.zone.name}</span>}
                      </div>
                    </div>

                    <div className="flex gap-4 text-center flex-shrink-0">
                      <div>
                        <div className="font-display font-bold text-slate-900 text-lg">{l.livres}</div>
                        <div className="text-xs text-slate-400">Livrées</div>
                      </div>
                      <div>
                        <div className="font-display font-bold text-orange-500 text-lg">{l.en_cours}</div>
                        <div className="text-xs text-slate-400">En cours</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FORMULAIRE AJOUT */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
            <h2 className="font-display font-bold text-lg text-slate-800 mb-5">Ajouter un livreur</h2>

            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nom complet *</label>
                <input
                  name="full_name" type="text" required placeholder="Prénom Nom"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Téléphone *</label>
                <input
                  name="phone" type="tel" required placeholder="77 XXX XX XX"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email *</label>
                <input
                  name="email" type="email" required placeholder="livreur@email.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Mot de passe *</label>
                <input
                  name="password" type="password" required minLength={8} placeholder="Min. 8 caractères"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Zone principale</label>
                <select
                  name="zone_id"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="">Toutes les zones</option>
                  {zones?.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-display font-bold text-sm transition-colors"
              >
                Créer le livreur →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
