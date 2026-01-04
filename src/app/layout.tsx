import type { Metadata, Viewport } from 'next'
import './globals.css'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'

const siteUrl = 'https://vidi.official.id'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

export async function generateMetadata(): Promise<Metadata> {
  // Default values
  const defaultTitle = 'VidiOfficialID - Layanan Video Testimonial untuk Pelaku Usaha Indonesia'
  const defaultDesc = 'vidi.official.id solusi untuk usaha Anda mendapatkan video testimonial dari konsumen. Dengan teknologi aplikasi website terkini, pengguna tidak perlu download aplikasi cukup buka link di browser Chrome atau Safari dari Smartphone anda.'

  let title = defaultTitle
  let description = defaultDesc
  let keywords = [
    'membuat video testimonial produk',
    'cara membuat video testimonial',
    'video testimonial produk',
    'layanan video testimonial',
    'video testimonial',
    'social proof produk / jasa',
    'digital marketing usaha',
    'testimonial pelanggan',
    'review video',
    'UMKM Indonesia',
    'marketing produk',
    'marketing jasa',
    'bukti sosial',
    'testimoni video',
    'platform testimonial',
    'customer reviews Indonesia',
    'website yang membantu membuat video testimoni',
  ]
  let ogImages: { url: string }[] | undefined = undefined
  let twitterImages: string[] | undefined = undefined

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('page_name', 'home')
      .single()

    const seo = data as any

    if (seo) {
      if (seo.title) title = seo.title
      if (seo.description) description = seo.description
      if (seo.keywords) {
        keywords = seo.keywords.split(',').map((k: string) => k.trim())
      }

      if (seo.og_image_custom_mode && seo.og_image) {
        ogImages = [{ url: seo.og_image }]
      }

      if (seo.twitter_image_custom_mode && seo.twitter_image) {
        twitterImages = [seo.twitter_image]
      }
    }
  } catch (e) {
    console.error('Error loading SEO settings for layout:', e)
  }

  return {
    // Basic Meta Tags
    title: {
      default: title,
      template: '%s | VidiOfficialID',
    },
    description: description,
    keywords: keywords,
    authors: [{ name: 'VidiOfficial', url: siteUrl }],
    creator: 'VidiOfficial',
    publisher: 'VidiOfficial',

    // Robots & Indexing
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Canonical & Alternates
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: '/',
      languages: {
        'id-ID': '/',
      },
    },

    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: siteUrl,
      siteName: 'VidiOfficialID',
      title: title,
      description: description,
      // If ogImages is defined (custom mode), it overrides default file-based generation.
      // If undefined, Next.js generates it from opengraph-image.tsx
      images: ogImages,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      creator: '@vidiofficialid',
      images: twitterImages,
    },

    // App & Icons
    applicationName: 'VidiOfficialID',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'VidiOfficialID',
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },

    // Icons - menggunakan favicon statis dari /public
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },

    // Manifest
    manifest: '/manifest.json',

    // Verification
    verification: {
      google: 'googled0c1f92aa7c74e92',
    },

    // Category
    category: 'technology',

    // Other
    other: {
      'msapplication-TileColor': '#FDC435',
      'theme-color': '#FDC435',
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#FDC435',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'VidiOfficialID',
              url: 'https://vidi.official.id',
              logo: 'https://vidi.official.id/logo_vidiofficial.png',
              description:
                'Platform video testimonial untuk UMKM Indonesia. Solusi digital marketing dengan social proof dari pelanggan nyata.',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                url: 'https://vidi.official.id/contact-us',
              },
            }),
          }}
        />
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'VidiOfficialID',
              url: 'https://vidi.official.id',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web Browser',
              browserRequirements: 'Requires JavaScript, Chrome recommended',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'IDR',
              },
              description:
                'Aplikasi web untuk mengumpulkan video testimonial pelanggan. Tanpa download, langsung akses via browser.',
            }),
          }}
        />
        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'VidiOfficialID',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'IDR',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5',
                ratingCount: '1',
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
