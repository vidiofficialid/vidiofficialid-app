import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VidiOfficialID',
  description: 'Turn real customer stories into simple, powerful videos that help your small business grow.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  )
}
