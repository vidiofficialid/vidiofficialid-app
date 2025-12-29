import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VidiOfficialID - Video Testimonial Platform',
  description:
    'Turn real customer stories into simple, powerful videos that help your small business grow.',
  keywords:
    'video testimonial, testimonial platform, customer reviews, UMKM, small business, Indonesia',
  authors: [{ name: 'VidiOfficial' }],
  openGraph: {
    title: 'VidiOfficialID - Video Testimonial Platform',
    description:
      'Turn real customer stories into simple, powerful videos that help your small business grow.',
    url: 'https://vidi.official.id',
    siteName: 'VidiOfficial',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
