// app/dashboard/layout.tsx
import { getProfile } from '@/utils/supabase/server'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/actions/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import { RealtimeProvider, RealtimeBadge } from '@/components/RealtimeNotifications'
import { Home, PlusCircle, Bike, BarChart3, Wallet, Users, Map, LogOut, Package, User, ClipboardList } from 'lucide-react'
import UserAvatarMenu from '@/components/UserAvatarMenu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')

  // Count active orders for client badge
  let activeBadge = 0
  if (profile.role === 'client') {
    const supabase = await createClient()
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', profile.id)
      .in('status', ['en_attente', 'confirme', 'en_cours'])
    activeBadge = count || 0
  }

  const navLinks = {
    client: [
      { href: '/dashboard/client', label: 'Accueil', icon: <Home className="w-5 h-5" /> },
      { href: '/dashboard/client/commandes', label: 'Commandes', icon: <ClipboardList className="w-5 h-5" /> },
      { href: '/commander', label: 'Envoyer', icon: <PlusCircle className="w-5 h-5" /> },
      { href: '/dashboard/client/profil', label: 'Profil', icon: <User className="w-5 h-5" /> },
    ],
    livreur: [
      { href: '/dashboard/livreur', label: 'Missions', icon: <Bike className="w-5 h-5" /> },
      { href: '/dashboard/livreur/disponibles', label: 'Disponibles', icon: <Package className="w-5 h-5" /> },
    ],
    admin: [
      { href: '/dashboard/admin', label: 'Statistiques', icon: <BarChart3 className="w-5 h-5" /> },
      { href: '/dashboard/admin/wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
      { href: '/dashboard/admin/livreurs', label: 'Livreurs', icon: <Users className="w-5 h-5" /> },
      { href: '/dashboard/admin/zones', label: 'Zones', icon: <Map className="w-5 h-5" /> },
    ],
  }

  const role = profile.role as 'client' | 'livreur' | 'admin'
  const links = navLinks[role] || navLinks.client

  const roleBadge = {
    client: { label: 'Client', color: 'bg-blue-500/10 text-blue-400' },
    livreur: { label: 'Livreur', color: 'bg-orange-500/10 text-orange-400' },
    admin: { label: 'Admin', color: 'bg-purple-500/10 text-purple-400' },
  }[role] || { label: 'Utilisateur', color: 'bg-slate-500/10 text-slate-400' }

  return (
    <RealtimeProvider role={role} userId={profile.id}>
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
            <div className="flex items-center gap-4">
              <UserAvatarMenu profile={profile} align="left" />
              <div className="flex-1 min-w-0">
                <div className="text-white text-base font-bold truncate leading-tight">{profile.full_name || 'Utilisateur'}</div>
                <div className={`mt-1 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${roleBadge.color} border-current/20`}>
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
              <span className="transition-transform group-hover:scale-110">{link.icon}</span>
              <span className="tracking-tight">{link.label}</span>
              {(link.href === '/dashboard/admin' || link.href === '/dashboard/livreur/disponibles') && (
                <RealtimeBadge />
              )}
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
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Déconnexion</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white/95 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-white font-display font-black text-base">N</span>
          </div>
          <span className="font-display font-black text-slate-900 text-lg tracking-tight">Nelal Express</span>
        </Link>
        <UserAvatarMenu profile={profile} align="right" />
      </div>

      {/* MOBILE BOTTOM NAV */}
      <MobileNav links={links} activeBadge={activeBadge} />

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-12 pb-20 md:pb-12 overflow-y-auto">
        {children}
        </main>
      </div>
    </RealtimeProvider>
  )
}
