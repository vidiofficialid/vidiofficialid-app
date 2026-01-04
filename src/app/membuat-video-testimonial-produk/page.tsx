import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, Video, Users, Star, Zap, MessageSquare, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar, Footer } from '@/components/landing'

export default function MembuatVideoTestimonialProdukPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-cyan-50 py-20 px-4">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Cara <span className="text-amber-500">Membuat Video Testimonial Produk</span> yang Menarik
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Panduan lengkap membuat video testimonial produk untuk meningkatkan kepercayaan pelanggan dan penjualan bisnis Anda.
                                Dengan VidiOfficialID, proses menjadi lebih mudah tanpa perlu download aplikasi.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <Link href="/register">
                                    <Button className="group bg-amber-500 text-white px-8 py-4 h-auto hover:bg-amber-600 shadow-lg hover:shadow-xl text-lg">
                                        Mulai Gratis Sekarang
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Apa itu Video Testimonial */}
                <section className="py-16 px-4 bg-white">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                            Apa itu Video Testimonial Produk?
                        </h2>
                        <div className="prose prose-lg max-w-none text-gray-700">
                            <p>
                                <strong>Video testimonial produk</strong> adalah video yang berisi ulasan atau testimoni dari pelanggan yang sudah menggunakan produk atau jasa Anda.
                                Berbeda dengan review tertulis, video testimonial memberikan kesan yang lebih <em>personal dan autentik</em> karena calon pelanggan dapat melihat
                                ekspresi wajah dan mendengar langsung pengalaman pengguna.
                            </p>
                            <p>
                                Menurut penelitian, <strong>video testimonial dapat meningkatkan konversi hingga 80%</strong> dibandingkan dengan testimonial teks biasa.
                                Ini karena video memberikan <em>social proof</em> yang lebih kuat dan meyakinkan.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Manfaat Video Testimonial */}
                <section className="py-16 px-4 bg-gray-50">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                            Mengapa Harus Membuat Video Testimonial Produk?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: TrendingUp,
                                    title: 'Meningkatkan Konversi',
                                    description: 'Video testimonial terbukti meningkatkan tingkat konversi hingga 80% karena memberikan bukti sosial yang kuat.',
                                },
                                {
                                    icon: Users,
                                    title: 'Membangun Kepercayaan',
                                    description: 'Calon pelanggan lebih percaya pada review dari pelanggan nyata daripada iklan atau promosi biasa.',
                                },
                                {
                                    icon: Star,
                                    title: 'Diferensiasi Kompetitor',
                                    description: 'Bisnis dengan video testimonial terlihat lebih profesional dan terpercaya dibanding kompetitor.',
                                },
                                {
                                    icon: MessageSquare,
                                    title: 'Konten Marketing Gratis',
                                    description: 'Video testimonial dapat digunakan di website, sosial media, dan materi promosi lainnya.',
                                },
                                {
                                    icon: Zap,
                                    title: 'Mempercepat Keputusan',
                                    description: 'Calon pelanggan yang ragu-ragu akan lebih cepat memutuskan setelah melihat pengalaman positif orang lain.',
                                },
                                {
                                    icon: Video,
                                    title: 'SEO Friendly',
                                    description: 'Konten video dapat meningkatkan waktu kunjungan di website dan membantu peringkat SEO.',
                                },
                            ].map((benefit, index) => (
                                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                                        <benefit.icon className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                    <p className="text-gray-600">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Langkah-langkah Membuat Video Testimonial */}
                <section className="py-16 px-4 bg-white">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                            Cara Membuat Video Testimonial Produk dengan VidiOfficialID
                        </h2>
                        <div className="space-y-8">
                            {[
                                {
                                    step: 1,
                                    title: 'Daftar dan Buat Campaign',
                                    description: 'Daftar gratis di VidiOfficialID, lalu buat campaign untuk produk atau jasa yang ingin Anda kumpulkan testimoninya. Anda bisa menyesuaikan pertanyaan dan durasi video.',
                                },
                                {
                                    step: 2,
                                    title: 'Bagikan Link ke Pelanggan',
                                    description: 'Dapatkan link unik untuk campaign Anda. Bagikan link tersebut ke pelanggan via WhatsApp, email, atau sosial media. Pelanggan tidak perlu download aplikasi apapun.',
                                },
                                {
                                    step: 3,
                                    title: 'Pelanggan Rekam Video',
                                    description: 'Pelanggan cukup membuka link di browser smartphone mereka (Chrome atau Safari), lalu merekam video testimonial langsung. Proses mudah dan cepat.',
                                },
                                {
                                    step: 4,
                                    title: 'Terima Video di Dashboard',
                                    description: 'Semua video testimonial akan masuk ke dashboard Anda. Download, edit, dan gunakan untuk keperluan marketing bisnis Anda.',
                                },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-6 items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tips Membuat Video Testimonial */}
                <section className="py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold mb-12 text-center">
                            Tips Membuat Video Testimonial Produk yang Meyakinkan
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                'Minta pelanggan untuk menyebutkan masalah yang mereka hadapi sebelum menggunakan produk',
                                'Dorong pelanggan menjelaskan hasil spesifik yang mereka dapatkan',
                                'Pastikan pencahayaan dan audio video cukup baik',
                                'Buat pertanyaan panduan yang memudahkan pelanggan bercerita',
                                'Idealnya durasi video antara 30-90 detik',
                                'Minta pelanggan untuk bersikap natural dan tidak terlalu scripted',
                            ].map((tip, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-200">{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 px-4 bg-white">
                    <div className="container mx-auto max-w-4xl">
                        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                            Pertanyaan yang Sering Diajukan
                        </h2>
                        <div className="space-y-6">
                            {[
                                {
                                    question: 'Apakah pelanggan perlu download aplikasi untuk membuat video testimonial?',
                                    answer: 'Tidak. Dengan VidiOfficialID, pelanggan cukup membuka link di browser smartphone (Chrome atau Safari) dan langsung merekam video. Tidak perlu download aplikasi apapun.',
                                },
                                {
                                    question: 'Berapa lama durasi ideal video testimonial produk?',
                                    answer: 'Durasi ideal adalah 30-90 detik. Cukup singkat agar tidak membosankan, tapi cukup panjang untuk menyampaikan pengalaman dengan jelas.',
                                },
                                {
                                    question: 'Bagaimana cara meminta pelanggan membuat video testimonial?',
                                    answer: 'Anda bisa mengirim link campaign via WhatsApp, email, atau SMS setelah transaksi selesai. Berikan penjelasan singkat bahwa Anda menghargai feedback mereka dalam bentuk video.',
                                },
                                {
                                    question: 'Apakah VidiOfficialID gratis?',
                                    answer: 'Ya, VidiOfficialID menyediakan paket gratis yang bisa Anda gunakan untuk memulai. Daftar sekarang dan buat campaign pertama Anda.',
                                },
                            ].map((faq, index) => (
                                <div key={index} className="bg-gray-50 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                    <p className="text-gray-600">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 bg-gradient-to-br from-amber-400 to-amber-500">
                    <div className="container mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Siap Membuat Video Testimonial Produk?
                        </h2>
                        <p className="text-xl text-gray-800 mb-8">
                            Mulai kumpulkan video testimonial dari pelanggan Anda sekarang. Gratis, mudah, dan profesional.
                        </p>
                        <Link href="/register">
                            <Button className="group bg-gray-900 text-white px-10 py-5 h-auto hover:bg-gray-800 shadow-xl text-lg">
                                Daftar Gratis Sekarang
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            {/* FAQ Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'Apakah pelanggan perlu download aplikasi untuk membuat video testimonial?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Tidak. Dengan VidiOfficialID, pelanggan cukup membuka link di browser smartphone (Chrome atau Safari) dan langsung merekam video. Tidak perlu download aplikasi apapun.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Berapa lama durasi ideal video testimonial produk?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Durasi ideal adalah 30-90 detik. Cukup singkat agar tidak membosankan, tapi cukup panjang untuk menyampaikan pengalaman dengan jelas.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Bagaimana cara meminta pelanggan membuat video testimonial?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Anda bisa mengirim link campaign via WhatsApp, email, atau SMS setelah transaksi selesai. Berikan penjelasan singkat bahwa Anda menghargai feedback mereka dalam bentuk video.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Apakah VidiOfficialID gratis?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Ya, VidiOfficialID menyediakan paket gratis yang bisa Anda gunakan untuk memulai. Daftar sekarang dan buat campaign pertama Anda.',
                                },
                            },
                        ],
                    }),
                }}
            />

            {/* Article Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'Cara Membuat Video Testimonial Produk yang Menarik',
                        description: 'Panduan lengkap membuat video testimonial produk untuk meningkatkan kepercayaan pelanggan dan penjualan bisnis Anda.',
                        author: {
                            '@type': 'Organization',
                            name: 'VidiOfficialID',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'VidiOfficialID',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://vidi.official.id/logo_vidiofficial.png',
                            },
                        },
                        datePublished: new Date().toISOString(),
                        dateModified: new Date().toISOString(),
                    }),
                }}
            />

            <Footer />
        </div>
    )
}
