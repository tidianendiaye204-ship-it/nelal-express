// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'

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
  title: 'Nelal Express — Livraison Élite au Sénégal',
  description: 'Le standard de l\'excellence logistique à Dakar et dans les régions. Livraison rapide, sécurisée et professionnelle.',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nelal-express.vercel.app'),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Nelal Express — Livraison Élite au Sénégal',
    description: 'Le standard de l\'excellence logistique à Dakar et dans les régions.',
    url: '/',
    siteName: 'Nelal Express',
    locale: 'fr_SN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nelal Express — Livraison Élite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nelal Express',
    description: 'Le standard de l\'excellence logistique au Sénégal.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nelal Express',
  },
}

export const viewport: Viewport = {
  themeColor: '#F97316',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-dm bg-slate-50 text-slate-900 antialiased">
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
