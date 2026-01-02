import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hubungi Kami - VidiOfficialID',
  description:
    'Hubungi tim VidiOfficialID untuk pertanyaan tentang layanan video testimonial. Kami siap membantu UMKM Indonesia mengembangkan bisnis dengan social proof.',
  keywords: ['hubungi VidiOfficialID', 'kontak video testimonial', 'bantuan UMKM', 'layanan pelanggan'],
  openGraph: {
    title: 'Hubungi Kami - VidiOfficialID',
    description: 'Ada pertanyaan? Tim kami siap membantu Anda memulai perjalanan video testimonial.',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
