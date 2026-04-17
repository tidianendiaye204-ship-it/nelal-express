// components/MobileNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLink {
  href: string
  label: string
  icon?: React.ReactNode
  badge?: number
}

export default function MobileNav({ links, activeBadge }: { links: NavLink[]; activeBadge?: number }) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl flex items-stretch justify-around z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] border-t border-slate-100 pb-safe">
      {links.map((link, index) => {
        const isActive = pathname === link.href || 
          (link.href !== '/dashboard/client' && pathname.startsWith(link.href))

        // Show badge on the "Commandes" tab (index 1 for client)
        const showBadge = index === 1 && (activeBadge ?? 0) > 0

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 min-w-[64px] transition-all duration-200 ${
              isActive
                ? 'text-orange-500'
                : 'text-slate-400 active:text-slate-600'
            }`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
            )}

            <span className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              {link.icon}
              {/* Notification badge */}
              {showBadge && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-black text-white leading-none px-1">{activeBadge}</span>
                </span>
              )}
            </span>

            <span className={`text-[9px] font-bold leading-none mt-0.5 transition-all ${
              isActive ? 'text-orange-500 font-black' : 'text-slate-400'
            }`}>
              {link.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
