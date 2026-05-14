// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Outfit, Inter } from 'next/font/google'
import './globals.css'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'


const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '600', '700', '800', '900'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

const appUrl = 'https://www.nelalexpress.com';

export const metadata: Metadata = {
  title: 'Nelal Express — Livraison Élite au Sénégal',
  description: 'Le standard de l\'excellence logistique à Dakar et dans les régions. Livraison rapide, sécurisée et professionnelle.',
  manifest: '/manifest.json',
  metadataBase: new URL(appUrl),
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
    url: appUrl,
    siteName: 'Nelal Express',
    locale: 'fr_SN',
    type: 'website',
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Nelal Express — Livraison Élite au Sénégal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nelal Express',
    description: 'Le standard de l\'excellence logistique au Sénégal.',
    images: [`${appUrl}/og-image.png`],
  },
  other: {
    'fb:app_id': '1418781620266257',
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
    <html lang="fr" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=block" />
      </head>
      <body className="font-inter bg-slate-50 text-slate-900 antialiased">
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
