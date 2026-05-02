import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.nelalexpress.com'
  
  return {
    rules: [
      {
        userAgent: 'facebookexternalhit',
        disallow: '',
      },
      {
        userAgent: 'Twitterbot',
        disallow: '',
      },
      {
        userAgent: 'WhatsApp',
        disallow: '',
      },
      {
        userAgent: '*',
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
