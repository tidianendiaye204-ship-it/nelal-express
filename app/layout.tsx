// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Nelal Express — Livraison Dakar & Intérieur',
  description: 'Service de livraison organisé entre Dakar, sa banlieue et les villes de l\'intérieur du Sénégal.',
  manifest: '/manifest.json',
  themeColor: '#F97316',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nelal Express',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-dm bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
