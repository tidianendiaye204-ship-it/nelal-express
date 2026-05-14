// next.config.ts
import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development', // Désactivé uniquement en développement
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
