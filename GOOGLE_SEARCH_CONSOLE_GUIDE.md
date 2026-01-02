# 🔍 Panduan Mendaftarkan VidiOfficialID ke Google Search Console

## Daftar Isi
1. [Apa itu Google Search Console?](#apa-itu-google-search-console)
2. [Langkah-langkah Pendaftaran](#langkah-langkah-pendaftaran)
3. [Verifikasi Kepemilikan Website](#verifikasi-kepemilikan-website)
4. [Submit Sitemap](#submit-sitemap)
5. [Monitoring & Optimasi](#monitoring--optimasi)

---

## Apa itu Google Search Console?

Google Search Console (GSC) adalah layanan gratis dari Google yang membantu pemilik website:
- Memantau performa website di hasil pencarian Google
- Mengidentifikasi masalah indexing
- Submit sitemap untuk crawling yang lebih cepat
- Melihat keyword yang membawa traffic
- Memperbaiki masalah mobile usability dan Core Web Vitals

---

## Langkah-langkah Pendaftaran

### Step 1: Akses Google Search Console
1. Buka [https://search.google.com/search-console](https://search.google.com/search-console)
2. Login dengan akun Google (gunakan akun yang sama dengan yang digunakan untuk bisnis)

### Step 2: Tambahkan Property
1. Klik **"Add property"** atau **"Tambahkan properti"**
2. Pilih tipe property:
   - **Domain**: `vidi.official.id` (mencakup semua subdomain)
   - **URL prefix**: `https://vidi.official.id` (lebih mudah diverifikasi)

**Rekomendasi**: Gunakan **URL prefix** karena lebih mudah diverifikasi dengan file HTML atau meta tag.

---

## Verifikasi Kepemilikan Website

### Metode 1: HTML Tag (DIREKOMENDASIKAN)

1. Setelah memilih "URL prefix" dan memasukkan `https://vidi.official.id`
2. Google akan memberikan kode verifikasi seperti:
   ```
   <meta name="google-site-verification" content="xxxxxxxxxxxxxx" />
   ```
3. **Copy** kode verifikasi tersebut (hanya bagian `content`)
4. Buka file `src/app/layout.tsx` di project
5. Ganti `GOOGLE_SITE_VERIFICATION_CODE` dengan kode verifikasi Anda:
   ```typescript
   verification: {
     google: 'paste_kode_verifikasi_disini',
   },
   ```
6. Deploy perubahan ke Vercel
7. Kembali ke Google Search Console dan klik **"Verify"**

### Metode 2: HTML File

1. Download file HTML dari Google Search Console
2. Upload file ke folder `public/` di project
3. Deploy ke Vercel
4. Kembali ke Google Search Console dan klik **"Verify"**

### Metode 3: Domain (DNS Record)

1. Google akan memberikan TXT record
2. Tambahkan record di Cloudflare DNS:
   - Type: TXT
   - Name: @ (atau vidi.official.id)
   - Content: [kode dari Google]
3. Tunggu propagasi DNS (bisa memakan waktu hingga 24 jam)
4. Klik **"Verify"** di Google Search Console

---

## Submit Sitemap

Setelah website terverifikasi:

### Step 1: Akses Menu Sitemap
1. Di sidebar Google Search Console, pilih **"Sitemaps"**

### Step 2: Submit Sitemap
1. Di kolom "Add a new sitemap", masukkan:
   ```
   sitemap.xml
   ```
2. Klik **"Submit"**

### Step 3: Verifikasi Status
- Status **"Success"** berarti sitemap berhasil dibaca
- Jika **"Couldn't fetch"**, tunggu beberapa menit dan coba lagi

**Sitemap VidiOfficialID sudah dikonfigurasi secara otomatis di:**
- `https://vidi.official.id/sitemap.xml`

---

## Monitoring & Optimasi

### Dashboard Utama
- **Performance**: Lihat klik, impression, CTR, dan posisi rata-rata
- **Coverage**: Cek halaman yang terindex dan error
- **Experience**: Core Web Vitals dan mobile usability

### Tips Optimasi SEO untuk VidiOfficialID

1. **Target Keywords Utama:**
   - layanan video testimonial
   - social proof produk UMKM
   - digital marketing UMKM
   - testimonial pelanggan Indonesia
   - video review produk

2. **Monitor Keyword Performance:**
   - Cek menu Performance > Search Results
   - Filter by query untuk melihat keyword
   - Perhatikan CTR dan posisi rata-rata

3. **Perbaiki Error:**
   - Cek menu Coverage untuk halaman yang tidak terindex
   - Perbaiki error 404, 500, atau redirect loop

4. **Request Indexing:**
   - Gunakan URL Inspection tool
   - Submit halaman baru untuk di-crawl lebih cepat

---

## Checklist Setelah Setup

- [ ] Verifikasi kepemilikan website berhasil
- [ ] Submit sitemap.xml
- [ ] Cek tidak ada error di Coverage
- [ ] Setup email notification untuk issues
- [ ] Link dengan Google Analytics (opsional)

---

## Troubleshooting

### Sitemap Tidak Bisa Di-fetch
1. Pastikan sitemap accessible di `https://vidi.official.id/sitemap.xml`
2. Cek tidak ada error di console
3. Tunggu 24-48 jam dan coba submit ulang

### Halaman Tidak Terindex
1. Cek robots.txt tidak memblokir halaman
2. Pastikan halaman ada di sitemap
3. Submit URL secara manual via URL Inspection

### Verification Failed
1. Pastikan kode verifikasi sudah benar
2. Cek website sudah di-deploy
3. Clear cache browser dan coba lagi

---

## Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Search Console Training](https://developers.google.com/search/docs/fundamentals)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

---

*Dokumen ini dibuat pada 2 Januari 2026 untuk membantu setup SEO VidiOfficialID*
