'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/actions/auth'

interface NavLink {
  href: string
  label: string
}

export default function MobileNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-around px-4 py-4 z-50 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border border-white/10">
      {links.map((link) => {
        const isActive = pathname === link.href
        const icon = link.label.split(' ')[0]
        const label = link.label.split(' ').slice(1).join(' ')

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-[1.5rem] transition-all duration-500 ${
              isActive 
                ? 'text-white bg-orange-500 shadow-lg shadow-orange-500/20' 
                : 'text-slate-500 hover:text-white'
            }`}
          >
            <span className={`text-xl transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100 opacity-70'}`}>
              {icon}
            </span>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {label}
            </span>
          </Link>
        )
      })}
      
      <form action={signOut}>
        <button type="submit" className="flex items-center justify-center w-12 h-12 text-slate-500 hover:text-red-400 transition-colors">
          <span className="text-xl">🚪</span>
        </button>
      </form>
    </nav>
  )
}
