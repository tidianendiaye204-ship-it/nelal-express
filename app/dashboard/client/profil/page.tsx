// app/dashboard/client/profil/page.tsx
import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/utils/supabase/server'
import { signOut } from '@/actions/auth'
import { updateProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, Mail, Package, LogOut, ChevronRight, Shield, Edit3 } from 'lucide-react'

export default async function ProfilPage() {
  const supabase = await createClient()
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')

  // Stats
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, price, created_at')
    .eq('client_id', profile.id)
    .order('created_at', { ascending: false })

  const stats = {
    total: orders?.length || 0,
    livres: (orders || []).filter(o => o.status === 'livre').length || 0,
    depenses: (orders || []).filter(o => o.status === 'livre').reduce((sum, o) => sum + (o.price || 0), 0) || 0,
  }


  return (
    <div className="max-w-2xl mx-auto pb-24 px-1">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center text-white font-display font-black text-3xl shadow-xl shadow-orange-500/20 mb-4">
          {profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight">{profile.full_name}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
            <Shield className="w-3 h-3" /> Client
          </span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'Colis envoyés', value: stats.total, color: 'text-slate-900' },
          { label: 'Livrés', value: stats.livres, color: 'text-green-600' },
          { label: 'Dépensés', value: `${stats.depenses.toLocaleString('fr-FR')} F`, color: 'text-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
            <div className={`font-display font-black text-xl leading-none ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-400 text-[7px] font-black uppercase tracking-widest mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* EDIT PROFILE CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
            <Edit3 className="w-4.5 h-4.5" />
          </div>
          <h2 className="font-display font-black text-sm text-slate-900 uppercase tracking-tight">Mes informations</h2>
        </div>

        <form action={async (formData: FormData) => {
          'use server'
          await updateProfile(formData)
        }} className="space-y-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="full_name"
                type="text"
                defaultValue={profile.full_name}
                required
                className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="phone"
                type="tel"
                defaultValue={profile.phone}
                required
                className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="email"
                disabled
                value={profile.email || ''}
                className="w-full bg-slate-50/50 border border-slate-50 text-slate-400 rounded-xl pl-10 pr-4 py-3 text-sm font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10 mt-2"
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>

      {/* QUICK LINKS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 mb-4">
        <Link
          href="/dashboard/client/commandes"
          className="flex items-center justify-between px-5 py-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Historique des commandes</p>
              <p className="text-[10px] text-slate-400 font-medium">{stats.total} colis au total</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* LOGOUT */}
      <form action={signOut}>
        <button
          type="submit"
          className="w-full bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </form>

      {/* VERSION */}
      <p className="text-center text-[10px] text-slate-300 font-medium mt-6">
        Nelal Express v1.0 — Livraison Élite 🇸🇳
      </p>
    </div>
  )
}
