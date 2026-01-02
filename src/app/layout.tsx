import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = 'https://vidi.official.id'

export const metadata: Metadata = {
  // Basic Meta Tags
  title: {
    default: 'VidiOfficialID - Layanan Video Testimonial untuk UMKM Indonesia',
    template: '%s | VidiOfficialID',
  },
  description:
    'vidi.official.id solusi untuk usaha Anda mendapatkan video testimonial dari konsumen. Dengan teknologi aplikasi website terkini, pengguna tidak perlu download aplikasi cukup buka link di browser Chrome.',
  keywords: [
    'layanan video testimonial',
    'video testimonial',
    'social proof produk UMKM',
    'digital marketing UMKM',
    'testimonial pelanggan',
    'review video',
    'UMKM Indonesia',
    'marketing UMKM',
    'bukti sosial',
    'testimoni video',
    'platform testimonial',
    'customer reviews Indonesia',
  ],
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
    title: 'VidiOfficialID - Layanan Video Testimonial untuk UMKM Indonesia',
    description:
      'vidi.official.id solusi untuk usaha Anda mendapatkan video testimonial dari konsumen. Dengan teknologi aplikasi website terkini, pengguna tidak perlu download aplikasi cukup buka link di browser Chrome.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VidiOfficialID - Platform Video Testimonial UMKM',
        type: 'image/png',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'VidiOfficialID - Layanan Video Testimonial untuk UMKM Indonesia',
    description:
      'vidi.official.id solusi untuk usaha Anda mendapatkan video testimonial dari konsumen. Tanpa download aplikasi, cukup buka di browser.',
    images: ['/og-image.png'],
    creator: '@vidiofficialid',
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
  
  // Icons - menggunakan dynamic generation dari icon.tsx dan apple-icon.tsx
  // favicon.svg juga tersedia di /public/favicon.svg
  
  // Manifest
  manifest: '/manifest.json',
  
  // Verification
  verification: {
    google: 'googled0c1f92aa7c74e92', // Verified via HTML file
  },
  
  // Category
  category: 'technology',
  
  // Other
  other: {
    'msapplication-TileColor': '#15EBB9',
    'theme-color': '#15EBB9',
  },
}

export const viewport: Viewport = {
  themeColor: '#15EBB9',
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
              logo: 'https://vidi.official.id/og-image.png',
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
