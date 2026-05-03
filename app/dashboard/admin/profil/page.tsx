// app/dashboard/admin/profil/page.tsx
import { getProfile } from '@/utils/supabase/server'
import { signOut } from '@/actions/auth'
import { updateProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, Mail, Shield, LogOut, ChevronRight, Edit3, BarChart3, Users, Map } from 'lucide-react'

export default async function AdminProfilPage() {
  const profile = await getProfile()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'agent')) redirect('/auth/login')

  return (
    <div className="max-w-2xl mx-auto pb-24 px-1">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center text-white font-display font-black text-3xl shadow-xl shadow-purple-500/20 mb-4">
          {profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight">{profile.full_name}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          {profile.role === 'admin' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100">
              <Shield className="w-3 h-3" /> Administrateur
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Shield className="w-3 h-3" /> Agent Dispatch
            </span>
          )}
        </div>
      </div>

      {/* EDIT PROFILE CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Edit3 className="w-4.5 h-4.5" />
          </div>
          <h2 className="font-display font-black text-sm text-slate-900 uppercase tracking-tight">Mes informations</h2>
        </div>

        <form action={async (formData: FormData) => {
          'use server'
          const res = await updateProfile(formData)
          if (res?.error) {
            console.error('Profile update error:', res.error)
            // We can't use alert() in a server component directly, but we can throw to error boundary
            // Or better, we just log it. Since this is an inline action in a server component without state.
            // A quick fix to show error:
            throw new Error(res.error)
          }
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
                className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all"
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
                className="w-full bg-slate-50 border border-slate-100 text-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all"
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
          href="/dashboard/admin"
          className="flex items-center justify-between px-5 py-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Tableau de bord</p>
              <p className="text-[10px] text-slate-400 font-medium">Statistiques globales</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
        
        <Link
          href="/dashboard/admin/livreurs"
          className="flex items-center justify-between px-5 py-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Gestion des Livreurs</p>
              <p className="text-[10px] text-slate-400 font-medium">Contrôle des accès et rôles</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/dashboard/admin/zones"
          className="flex items-center justify-between px-5 py-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Zones & Tarifs</p>
              <p className="text-[10px] text-slate-400 font-medium">Configuration de la plateforme</p>
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
        Nelal Express v1.0 — Admin Panel 🇸🇳
      </p>
    </div>
  )
}
