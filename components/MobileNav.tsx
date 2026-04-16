'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/actions/auth'
import { LogOut } from 'lucide-react'

interface NavLink {
  href: string
  label: string
  icon?: React.ReactNode
}

export default function MobileNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-2xl rounded-2xl flex items-center justify-around px-2 py-2 z-50 shadow-2xl border border-white/5">
      {links.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'text-white bg-orange-500 shadow-lg shadow-orange-500/10' 
                : 'text-slate-500'
            }`}
          >
            <span className={`${isActive ? 'scale-110' : 'scale-90 opacity-60'}`}>
              {link.icon}
            </span>
            <span className={`text-[6px] font-black uppercase tracking-widest leading-none ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {link.label}
            </span>
          </Link>
        )
      })}
      
      <form action={signOut}>
        <button type="submit" className="flex items-center justify-center w-10 h-10 text-slate-600 hover:text-red-400 active:scale-90 transition-all">
          <LogOut className="w-5 h-5" />
        </button>
      </form>
    </nav>
  )
}
