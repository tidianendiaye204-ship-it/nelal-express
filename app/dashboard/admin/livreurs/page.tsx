// app/dashboard/admin/livreurs/page.tsx
import { createClient } from '@/lib/supabase/server'
import { createLivreur } from '@/actions/orders'
import { redirect } from 'next/navigation'
import { UserPlus, Phone, MapPin, Bike, MessageCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

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
    <div className="max-w-6xl mx-auto px-2 md:px-0 pb-24">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase leading-none">Flotte Livreurs</h1>
        <div className="h-1 w-8 bg-slate-900 mt-2 rounded-full"></div>
        <p className="text-slate-500 text-xs font-bold mt-2 tracking-wide">
          {livreurs?.length || 0} livreur(s) opérationnel(s)
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
                <div key={l.id} className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-5 relative z-10">
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20 flex-shrink-0">
                        {l.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-base truncate">{l.full_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {l.zone?.name || 'Toutes zones'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 py-3 md:py-0 border-y md:border-y-0 border-slate-50">
                      <div className="bg-green-50 px-4 py-2 rounded-xl flex-1 md:flex-none text-center">
                        <div className="font-display font-black text-green-600 text-xl leading-none">{l.livres}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-green-500 mt-1">Livrées</div>
                      </div>
                      <div className="bg-blue-50 px-4 py-2 rounded-xl flex-1 md:flex-none text-center relative">
                        {l.en_cours > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                          </span>
                        )}
                        <div className="font-display font-black text-blue-600 text-xl leading-none">{l.en_cours}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-blue-500 mt-1">Actives</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-1.5 flex-shrink-0 justify-end md:justify-center">
                      <a href={`tel:${l.phone}`} className="flex-1 md:flex-none w-auto md:w-11 h-11 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all outline-none">
                        <Phone className="w-4 h-4" />
                      </a>
                      <a 
                        href={`https://wa.me/${l.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${l.full_name}, c'est l'administration Nelal Express.`)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none w-auto md:w-11 h-11 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl flex items-center justify-center text-[#25D366] active:scale-95 transition-all outline-none"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
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
