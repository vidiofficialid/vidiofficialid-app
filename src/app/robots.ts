import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://vidi.official.id'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/editor-blog',
          '/editor-blog/*',
          '/api/',
          '/api/*',
          '/auth/',
          '/auth/*',
          '/record/',
          '/record/*',
          '/_next/',
          '/_next/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/editor-blog',
          '/editor-blog/*',
          '/editor-blog/login',
          '/api/',
          '/api/*',
          '/auth/',
          '/auth/*',
          '/record/',
          '/record/*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
