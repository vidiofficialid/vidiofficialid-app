import Image from 'next/image'
import Link from 'next/link'
import { Navbar, Footer } from '@/components/landing'
import { Button } from '@/components/ui/button'
import { Target, Eye, Heart, Users, Zap, Shield } from 'lucide-react'

export const metadata = {
  title: 'About Us | VidiOfficialID',
  description: 'Learn about VidiOfficialID - the video testimonial platform designed to help Indonesian SMEs grow with authentic customer stories.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                  Tentang <span className="text-amber-500">VidiOfficialID</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  VidiOfficialID adalah platform video testimoni yang dirancang khusus untuk 
                  membantu pelaku UMKM Indonesia mengumpulkan testimoni pelanggan dengan cara 
                  yang mudah, cepat, dan profesional.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  Melalui satu tautan sederhana, pelanggan dapat langsung merekam testimoni 
                  video dari perangkat mereka tanpa perlu instalasi aplikasi tambahan.
                </p>
                <Link href="/register">
                  <Button className="bg-gray-900 text-white px-8 py-4 text-lg hover:bg-amber-500 hover:text-gray-900 shadow-lg">
                    Mulai Gratis Sekarang
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 shadow-2xl">
                  <Image
                    src="/logo.svg"
                    alt="VidiOfficialID Logo"
                    width={400}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Vision */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-white">
                <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-gray-900" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Visi Kami</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Menjadi platform video testimoni nomor satu di Indonesia yang membantu 
                  jutaan UMKM membangun kepercayaan dan meningkatkan penjualan melalui 
                  kekuatan cerita pelanggan yang otentik.
                </p>
              </div>

              {/* Mission */}
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-10">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Misi Kami</h2>
                <ul className="space-y-3 text-gray-900">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-gray-900 rounded-full mt-2" />
                    Menyederhanakan proses pengumpulan video testimoni
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-gray-900 rounded-full mt-2" />
                    Memberdayakan UMKM dengan alat pemasaran digital yang powerful
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-gray-900 rounded-full mt-2" />
                    Membangun ekosistem kepercayaan dalam bisnis Indonesia
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why VidiOfficialID */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Mengapa Memilih VidiOfficialID?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Kami memahami tantangan UMKM Indonesia dalam membangun kepercayaan online
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Mudah Digunakan',
                  description: 'Tidak perlu keahlian teknis. Kirim link, terima video. Sesederhana itu.',
                },
                {
                  icon: Users,
                  title: 'Untuk UMKM Indonesia',
                  description: 'Dirancang khusus dengan memahami kebutuhan pelaku usaha lokal.',
                },
                {
                  icon: Shield,
                  title: 'Aman & Terpercaya',
                  description: 'Data Anda dilindungi dengan standar keamanan tinggi.',
                },
                {
                  icon: Heart,
                  title: 'Dukungan Penuh',
                  description: 'Tim support yang siap membantu Anda kapan saja.',
                },
                {
                  icon: Target,
                  title: 'Hasil Profesional',
                  description: 'Video testimoni berkualitas tinggi yang siap dibagikan.',
                },
                {
                  icon: Eye,
                  title: 'Transparan',
                  description: 'Tidak ada biaya tersembunyi. Anda tahu persis apa yang didapat.',
                },
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100"
                  >
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-900">
          <div className="container mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Siap Meningkatkan Kepercayaan Bisnis Anda?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Bergabung dengan ribuan UMKM Indonesia yang sudah menggunakan VidiOfficialID
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="bg-amber-400 text-gray-900 px-8 py-4 text-lg hover:bg-amber-300 shadow-lg">
                  Daftar Gratis
                </Button>
              </Link>
              <Link href="/contact-us">
                <Button variant="outline" className="border-2 border-white text-white px-8 py-4 text-lg hover:bg-white hover:text-gray-900">
                  Hubungi Kami
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
