import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://workout-manager-app.ahemdsoran.dev'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', // Disallow API routes if you have any
        '/_next/', // Disallow Next.js internal files
        '/private/', // Disallow any private routes you might add
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
