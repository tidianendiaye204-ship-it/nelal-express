import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nelalexpress.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/'],
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
