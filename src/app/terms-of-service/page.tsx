import { Navbar, Footer } from '@/components/landing'

export const metadata = {
  title: 'Terms of Service | VidiOfficialID',
  description: 'Syarat dan Ketentuan penggunaan layanan VidiOfficialID - Platform video testimoni untuk UMKM Indonesia.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Syarat dan Ketentuan
            </h1>
            <p className="text-gray-600">
              Terakhir diperbarui: 31 Desember 2024
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Persetujuan Syarat
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Dengan mengakses atau menggunakan layanan VidiOfficialID di vidi.official.id, 
                Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak 
                setuju dengan syarat-syarat ini, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Deskripsi Layanan
              </h2>
              <p className="text-gray-600 leading-relaxed">
                VidiOfficialID adalah platform yang membantu pelaku usaha mengumpulkan, 
                mengelola, dan menampilkan video testimoni dari pelanggan mereka. Layanan 
                ini mencakup pembuatan link undangan, perekaman video, penyimpanan, dan 
                pengelolaan video testimoni.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Layanan Bersifat Berbatas Waktu
              </h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl mb-4">
                <h3 className="font-bold text-red-800 mb-2">
                  Penting: Ketentuan Penyimpanan
                </h3>
                <p className="text-red-700">
                  Layanan penyimpanan video kami bersifat BERBATAS WAKTU. Semua file video 
                  dan data terkait akan dihapus secara otomatis setelah melewati batas waktu 
                  yang ditentukan sesuai paket layanan yang Anda pilih.
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Ketentuan penyimpanan meliputi:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li>Paket Gratis: Video disimpan maksimal 30 hari</li>
                <li>Paket Berbayar: Durasi penyimpanan sesuai paket yang dipilih</li>
                <li>Kami tidak bertanggung jawab atas kehilangan file setelah batas waktu</li>
                <li>Pengguna wajib mengunduh atau membackup video penting sebelum kedaluwarsa</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. File yang Melewati Batas Waktu
              </h2>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl">
                <p className="text-gray-700">
                  File video testimoni yang telah melewati batas waktu penyimpanan akan 
                  <strong> DIHAPUS SECARA PERMANEN </strong> dari sistem kami. Penghapusan 
                  ini bersifat otomatis dan tidak dapat dibatalkan. Kami tidak menyimpan 
                  backup file yang sudah dihapus.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Kewajiban Pengguna
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Sebagai pengguna layanan kami, Anda setuju untuk:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li>Memberikan informasi yang akurat dan lengkap saat pendaftaran</li>
                <li>Menjaga kerahasiaan kredensial akun Anda</li>
                <li>Tidak menggunakan layanan untuk tujuan ilegal atau melanggar hukum</li>
                <li>Tidak mengunggah konten yang melanggar hak cipta, mengandung kekerasan, 
                    pornografi, atau konten tidak pantas lainnya</li>
                <li>Memastikan Anda memiliki izin dari orang yang tampil dalam video</li>
                <li>Mem-backup file penting sebelum batas waktu penyimpanan</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Batasan Tanggung Jawab
              </h2>
              <div className="bg-gray-100 rounded-xl p-6">
                <p className="text-gray-700 font-medium mb-4">
                  PENGGUNA TIDAK BOLEH MENUNTUT PEMILIK LAYANAN ATAS:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Kehilangan data atau file setelah batas waktu penyimpanan</li>
                  <li>Gangguan layanan atau downtime yang tidak terduga</li>
                  <li>Kerugian bisnis yang timbul dari penggunaan layanan</li>
                  <li>Kerusakan atau kehilangan data akibat peretasan atau serangan siber</li>
                  <li>Kerugian tidak langsung, insidental, atau konsekuensial</li>
                </ul>
              </div>
              <p className="text-gray-600 leading-relaxed mt-4">
                Layanan kami disediakan &quot;sebagaimana adanya&quot; tanpa jaminan apa pun, baik 
                tersurat maupun tersirat. Kami tidak menjamin bahwa layanan akan selalu 
                tersedia, bebas dari kesalahan, atau memenuhi kebutuhan spesifik Anda.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Hak Kekayaan Intelektual
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Semua konten, fitur, dan fungsionalitas layanan VidiOfficialID (termasuk 
                tetapi tidak terbatas pada desain, teks, grafik, logo, ikon, gambar, klip 
                audio, dan perangkat lunak) adalah milik VidiOfficialID dan dilindungi oleh 
                undang-undang hak cipta Indonesia dan internasional.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                Video testimoni yang diunggah melalui platform kami tetap menjadi hak milik 
                pembuat konten asli atau pemilik bisnis yang mengumpulkan testimoni tersebut.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Penghentian Layanan
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Kami berhak untuk menghentikan atau menangguhkan akses Anda ke layanan kami 
                kapan saja, dengan atau tanpa pemberitahuan, untuk alasan apa pun, termasuk 
                pelanggaran Syarat dan Ketentuan ini.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                Anda dapat menghentikan penggunaan layanan kapan saja dengan menonaktifkan 
                akun Anda. Setelah penghentian, data Anda akan dihapus sesuai dengan 
                Kebijakan Privasi kami.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Pembayaran dan Pengembalian Dana
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Untuk layanan berbayar:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li>Pembayaran dilakukan di muka untuk periode layanan yang dipilih</li>
                <li>Pengembalian dana hanya berlaku dalam 7 hari pertama setelah pembayaran</li>
                <li>Pengembalian dana tidak berlaku jika layanan sudah digunakan secara aktif</li>
                <li>Kami berhak mengubah harga layanan dengan pemberitahuan 30 hari sebelumnya</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Perubahan Syarat dan Ketentuan
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Kami dapat mengubah Syarat dan Ketentuan ini dari waktu ke waktu. Perubahan 
                akan berlaku segera setelah dipublikasikan di halaman ini. Penggunaan 
                berkelanjutan Anda atas layanan setelah perubahan dipublikasikan dianggap 
                sebagai penerimaan Anda terhadap syarat-syarat yang direvisi.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Hukum yang Berlaku
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik 
                Indonesia. Setiap perselisihan yang timbul dari atau terkait dengan syarat-syarat 
                ini akan diselesaikan secara eksklusif melalui pengadilan yang berwenang di 
                Indonesia.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. Hubungi Kami
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan 
                hubungi kami:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@vidi.official.id<br />
                  <strong>WhatsApp:</strong> +62 812 8383 5553<br />
                  <strong>Website:</strong> https://vidi.official.id/contact-us
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-gray-900 text-white rounded-xl p-8 text-center">
                <p className="text-lg">
                  Dengan menggunakan VidiOfficialID, Anda menyatakan telah membaca, memahami, 
                  dan menyetujui Syarat dan Ketentuan ini.
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
