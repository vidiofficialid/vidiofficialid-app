import Link from "next/link"
import Image from "next/image"
import { Users, Target, Zap, Heart } from "lucide-react"

export const metadata = {
  title: "About Us | VidiOfficialID",
  description: "Pelajari lebih lanjut tentang VidiOfficialID dan misi kami membantu bisnis kecil berkembang dengan video testimonial.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#FDC435] py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/logo.svg" alt="vidiofficial" width={60} height={60} />
          </Link>
          <Link href="/login">
            <button className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#FDC435] pt-12 pb-32 px-4 rounded-b-[80px]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            Tentang VidiOfficialID
          </h1>
          <p className="text-lg md:text-xl text-black/80">
            Kami membantu bisnis kecil mengumpulkan dan memanfaatkan video testimonial 
            untuk membangun kepercayaan dan mengembangkan bisnis mereka.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 -mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[32px] shadow-xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">
              Misi Kami
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-[#FDC435] rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">Memberdayakan Bisnis Kecil</h3>
                  <p className="text-gray-600">
                    Memberikan akses ke alat marketing profesional yang sebelumnya hanya tersedia untuk perusahaan besar.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-14 h-14 bg-[#FDC435] rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">Simplifikasi Proses</h3>
                  <p className="text-gray-600">
                    Menghilangkan kompleksitas teknis dalam pengumpulan video testimonial sehingga siapa pun bisa melakukannya.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-14 h-14 bg-[#FDC435] rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">Menghubungkan Pelanggan</h3>
                  <p className="text-gray-600">
                    Memfasilitasi koneksi autentik antara bisnis dan pelanggan mereka melalui cerita nyata.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-14 h-14 bg-[#FDC435] rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">Membangun Kepercayaan</h3>
                  <p className="text-gray-600">
                    Membantu bisnis membangun kredibilitas melalui bukti sosial yang kuat dan autentik.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-8">
            Cerita Kami
          </h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              VidiOfficialID lahir dari pengalaman langsung melihat betapa sulitnya bisnis kecil 
              untuk mendapatkan video testimonial yang berkualitas. Proses tradisional membutuhkan 
              peralatan mahal, keahlian teknis, dan waktu yang banyak.
            </p>
            <p>
              Kami percaya bahwa setiap bisnis, tidak peduli seberapa kecil, berhak memiliki akses 
              ke alat yang dapat membantu mereka tumbuh. Video testimonial adalah salah satu cara 
              paling efektif untuk membangun kepercayaan dengan calon pelanggan.
            </p>
            <p>
              Dengan VidiOfficialID, mengumpulkan video testimonial semudah mengirim link. 
              Pelanggan Anda dapat merekam testimonial langsung dari smartphone mereka, 
              dan Anda menerima video berkualitas tinggi dalam hitungan menit.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-[#FDC435] mb-2">500+</div>
              <div className="text-gray-600">Bisnis Terdaftar</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-[#FDC435] mb-2">2,000+</div>
              <div className="text-gray-600">Video Testimonial</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-[#FDC435] mb-2">98%</div>
              <div className="text-gray-600">Kepuasan Pengguna</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-[#FDC435] mb-2">3x</div>
              <div className="text-gray-600">Peningkatan Konversi</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#FDC435] rounded-t-[80px]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Siap Memulai?
          </h2>
          <p className="text-black/80 text-lg mb-8">
            Bergabunglah dengan ratusan bisnis yang sudah menggunakan VidiOfficialID 
            untuk mengumpulkan video testimonial dan mengembangkan bisnis mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Daftar Gratis
              </button>
            </Link>
            <Link href="/">
              <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Pelajari Lebih Lanjut
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FDC435] py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-black text-sm">
            © {new Date().getFullYear()} vidiofficialid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
