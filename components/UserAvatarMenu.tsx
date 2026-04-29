'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User, Shield, Phone, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/lib/types'
import { signOut } from '@/actions/auth'

interface UserAvatarMenuProps {
  profile: Profile
  align?: 'left' | 'right'
}

export default function UserAvatarMenu({ profile, align = 'left' }: UserAvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const firstLetter = profile.full_name?.charAt(0).toUpperCase() || '?'
  
  const roleBadge = {
    client: { label: 'Client', color: 'bg-blue-500/10 text-blue-400' },
    livreur: { label: 'Livreur', color: 'bg-orange-500/10 text-orange-400' },
    admin: { label: 'Admin', color: 'bg-purple-500/10 text-purple-400' },
    agent: { label: 'Agent', color: 'bg-emerald-500/10 text-emerald-400' },
  }[profile.role] || { label: 'Utilisateur', color: 'bg-slate-500/10 text-slate-400' }

  const profileLink = {
    client: '/dashboard/client/profil',
    livreur: '/dashboard/livreur/profil',
    admin: '/dashboard/admin/profil',
    agent: '/dashboard/admin/profil',
  }[profile.role] || '/dashboard'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center"
      >
        <div className={`
          flex items-center justify-center text-white font-black shadow-lg transition-all active:scale-90
          ${align === 'left' 
            ? 'w-12 h-12 text-xl rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600' 
            : 'w-9 h-9 text-xs rounded-xl bg-gradient-to-br from-orange-500 to-orange-700'}
        `}>
          {firstLetter}
        </div>
        
        {/* Pulsing indicator if needed or just hover effect */}
        <div className="absolute inset-0 rounded-2xl bg-orange-500/20 scale-0 group-hover:scale-125 transition-transform duration-500 blur-xl -z-10" />
      </button>

      <div className={`
        absolute z-[100] w-72 bg-[#0F172A] border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-200 ease-out
        ${align === 'left' 
          ? 'left-full ml-4 top-0 origin-left' 
          : 'right-0 mt-4 top-full origin-top-right'}
        ${isOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}
      `}>
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] -z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[50px] -z-10" />

          {/* User Info Header */}
          <div className="p-6 border-b border-slate-800/50 bg-slate-800/30 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner">
                {firstLetter}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-black text-lg truncate leading-tight">
                  {profile.full_name}
                </div>
                <div className={`mt-1 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${roleBadge.color} border-current/20`}>
                  {roleBadge.label}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium tracking-tight">{profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-3">
            <Link 
              href={profileLink}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <User className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-white tracking-tight">Mon Profil</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Paramètres du compte</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            {(profile.role === 'admin' || profile.role === 'agent') && (
              <Link 
                href="/dashboard/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700/50 mt-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <Shield className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-white tracking-tight">Administration</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gestion plateforme</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            <div className="my-3 px-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-800/50" />
            </div>

            <form action={signOut} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group text-left border border-transparent hover:border-red-500/20"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                  <LogOut className="w-5 h-5 text-red-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-black tracking-tight">Déconnexion</div>
                  <div className="text-[10px] text-red-400/50 font-bold uppercase tracking-wider">Quitter la session</div>
                </div>
              </button>
            </form>
          </div>
      </div>
    </div>
  )
}
