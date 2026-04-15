// app/dashboard/layout.tsx
import { getProfile } from '@/lib/supabase/server'
import { signOut } from '@/actions/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import MobileNav from '@/components/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')

  const navLinks = {
    client: [
      { href: '/dashboard/client', label: '🏠 Accueil' },
      { href: '/dashboard/client/nouvelle-commande', label: '➕ Commander' },
    ],
    livreur: [
      { href: '/dashboard/livreur', label: '🚴 Livraisons' },
    ],
    admin: [
      { href: '/dashboard/admin', label: '📊 Stats' },
      { href: '/dashboard/admin/livreurs', label: '👥 Livreurs' },
      { href: '/dashboard/admin/zones', label: '🗺️ Zones' },
    ],
  }

  const role = profile.role as 'client' | 'livreur' | 'admin'
  const links = navLinks[role] || navLinks.client

  const roleBadge = {
    client: { label: 'Client', color: 'bg-blue-500/10 text-blue-400' },
    livreur: { label: 'Livreur', color: 'bg-orange-500/10 text-orange-400' },
    admin: { label: 'Admin', color: 'bg-purple-500/10 text-purple-400' },
  }[role]

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col md:flex-row">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-72 bg-[#0F172A] min-h-screen flex-col sticky left-0 top-0 z-10 shadow-2xl">
        {/* Logo */}
        <div className="px-8 py-8 border-b border-slate-800/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-hover:rotate-12 transition-transform">
              <span className="text-white font-display font-black text-xl">N</span>
            </div>
            <span className="font-display font-black text-white text-xl tracking-tight">Nelal Express</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="px-6 py-8">
          <div className="bg-slate-800/40 rounded-[2rem] p-5 border border-slate-700/30 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-base font-bold truncate leading-tight">{profile.full_name}</div>
                <div className="mt-1 inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {roleBadge.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all text-sm font-bold group"
            >
              <span className="text-xl transition-transform group-hover:scale-110">{link.label.split(' ')[0]}</span>
              <span className="tracking-tight">{link.label.split(' ').slice(1).join(' ')}</span>
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-6 py-8 border-t border-slate-800/50">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold group"
            >
              <span className="group-hover:rotate-12 transition-transform text-xl">🚪</span>
              <span>Déconnexion</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white/50 backdrop-blur-2xl px-6 py-6 flex items-center justify-between sticky top-0 z-30 border-b border-white/20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-active:scale-90 transition-transform">
            <span className="text-white font-display font-black text-lg">N</span>
          </div>
          <span className="font-display font-black text-slate-900 text-xl tracking-tighter">Nelal Express</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm font-black text-xs uppercase tracking-tighter">
            {profile.full_name.charAt(0)}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <MobileNav links={links} />

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-12 pb-24 md:pb-12 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
