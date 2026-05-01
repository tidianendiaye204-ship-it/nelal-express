// next.config.ts
import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: true, // Désactivé temporairement pour corriger les erreurs sw.js
  workboxOptions: {
    disableDevLogs: true,
  },
})

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'nelal-express.vercel.app', 'nelalexpress.com', 'www.nelalexpress.com'],
    },
  },
}

export default withPWA(nextConfig)
