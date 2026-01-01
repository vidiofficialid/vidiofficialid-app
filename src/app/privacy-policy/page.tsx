import { Navbar, Footer } from '@/components/landing'

export const metadata = {
  title: 'Privacy Policy | VidiOfficialID',
  description: 'Privacy Policy - Kebijakan privasi VidiOfficialID menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Kebijakan Privasi
            </h1>
            <p className="text-gray-600">
              Terakhir diperbarui: 31 Desember 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Pendahuluan
              </h2>
              <p className="text-gray-600 leading-relaxed">
                VidiOfficialID (&quot;kami&quot;, &quot;kita&quot;, atau &quot;Layanan&quot;) berkomitmen untuk melindungi 
                privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, 
                menggunakan, mengungkapkan, dan melindungi informasi pribadi Anda saat Anda 
                menggunakan layanan kami di vidi.official.id.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Informasi yang Kami Kumpulkan
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan 
                layanan kami:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Informasi Akun</h3>
                  <p className="text-gray-600">
                    Nama, alamat email, nomor telepon/WhatsApp, dan informasi bisnis yang Anda 
                    berikan saat mendaftar.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Konten Video</h3>
                  <p className="text-gray-600">
                    Video testimoni yang diunggah oleh pelanggan Anda melalui platform kami.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Data Penggunaan</h3>
                  <p className="text-gray-600">
                    Informasi tentang bagaimana Anda berinteraksi dengan layanan kami, termasuk 
                    halaman yang dikunjungi dan fitur yang digunakan.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies</h3>
                  <p className="text-gray-600">
                    Kami menggunakan cookies untuk menyimpan preferensi dan meningkatkan 
                    pengalaman pengguna.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Bagaimana Kami Menggunakan Informasi
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Menyediakan, mengoperasikan, dan memelihara layanan kami</li>
                <li>Mengirim notifikasi penting tentang akun Anda</li>
                <li>Merespons pertanyaan dan memberikan dukungan pelanggan</li>
                <li>Menganalisis penggunaan untuk meningkatkan layanan</li>
                <li>Mendeteksi dan mencegah penipuan atau penyalahgunaan</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Hak Pengguna atas Data
              </h2>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl">
                <h3 className="font-bold text-gray-900 mb-2">
                  Data Pribadi Anda Dapat Dihapus
                </h3>
                <p className="text-gray-700">
                  Anda memiliki hak untuk meminta penghapusan data pribadi Anda dari sistem kami 
                  kapan saja. Hubungi kami melalui halaman Contact Us atau kirim email ke 
                  privacy@vidi.official.id untuk mengajukan permintaan penghapusan data.
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed mt-4">
                Hak Anda meliputi:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li>Hak untuk mengakses data pribadi Anda</li>
                <li>Hak untuk memperbarui atau memperbaiki data Anda</li>
                <li>Hak untuk menghapus data Anda dari sistem kami</li>
                <li>Hak untuk membatasi pemrosesan data Anda</li>
                <li>Hak untuk mengunduh salinan data Anda</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Penggunaan Cookies
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Website kami menggunakan cookies untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li>Menjaga sesi login Anda tetap aktif</li>
                <li>Menyimpan preferensi tampilan Anda</li>
                <li>Menganalisis traffic website untuk peningkatan layanan</li>
                <li>Menyediakan fitur keamanan</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                Anda dapat mengatur browser Anda untuk menolak cookies, namun hal ini mungkin 
                membatasi beberapa fungsionalitas layanan kami.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Keamanan Data
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi informasi 
                pribadi Anda dari akses, pengubahan, pengungkapan, atau penghancuran yang tidak sah. 
                Ini termasuk enkripsi data, akses terbatas, dan audit keamanan berkala.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Berbagi Informasi dengan Pihak Ketiga
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Kami tidak menjual, memperdagangkan, atau menyewakan informasi pribadi Anda 
                kepada pihak ketiga. Kami mungkin berbagi informasi dengan penyedia layanan 
                tepercaya yang membantu kami mengoperasikan website dan layanan kami, selama 
                pihak tersebut setuju untuk menjaga kerahasiaan informasi tersebut.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Retensi Data
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Kami menyimpan data pribadi Anda selama akun Anda aktif atau selama diperlukan 
                untuk menyediakan layanan kepada Anda. Data video testimoni disimpan sesuai 
                dengan ketentuan layanan yang berlaku dan dapat dihapus sesuai permintaan.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Perubahan Kebijakan Privasi
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan 
                memberi tahu Anda tentang perubahan dengan memposting Kebijakan Privasi baru 
                di halaman ini dan memperbarui tanggal &quot;Terakhir diperbarui&quot;.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Hubungi Kami
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin 
                mengajukan permintaan terkait data pribadi Anda, silakan hubungi kami:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@vidi.official.id<br />
                  <strong>WhatsApp:</strong> +62 812 8383 5553<br />
                  <strong>Website:</strong> https://vidi.official.id/contact-us
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
