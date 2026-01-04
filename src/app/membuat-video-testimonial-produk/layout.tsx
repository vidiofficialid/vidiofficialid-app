import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Cara Membuat Video Testimonial Produk yang Menarik | VidiOfficialID',
    description:
        'Pelajari cara membuat video testimonial produk yang profesional dan meyakinkan. Platform VidiOfficialID membantu UMKM Indonesia mengumpulkan video testimonial pelanggan dengan mudah tanpa download aplikasi.',
    keywords: [
        'membuat video testimonial produk',
        'cara membuat video testimonial',
        'video testimonial produk',
        'video testimoni pelanggan',
        'social proof produk',
        'testimoni video umkm',
        'review video pelanggan',
        'video testimonial bisnis',
    ],
    openGraph: {
        title: 'Cara Membuat Video Testimonial Produk | VidiOfficialID',
        description:
            'Platform untuk membuat video testimonial produk dengan mudah. Tanpa download aplikasi, langsung dari browser.',
        url: 'https://vidi.official.id/membuat-video-testimonial-produk',
        type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Membuat Video Testimonial Produk | VidiOfficialID',
        description:
            'Cara membuat video testimonial produk yang menarik untuk bisnis Anda.',
    },
    alternates: {
        canonical: '/membuat-video-testimonial-produk',
    },
}

export default function MakeVideoTestimonialLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
