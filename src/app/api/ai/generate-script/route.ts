import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Force Node.js runtime (not Edge) for compatibility with @google/generative-ai
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Model options - fallback list
const GEMINI_MODELS = [
  'gemini-2.0-flash',      // Newest, fast
  'gemini-1.5-flash-latest', // Latest flash
  'gemini-1.5-pro-latest',   // Latest pro
  'gemini-pro',              // Stable legacy
]

interface ScriptRequest {
  // 5 pertanyaan utama
  problemToSolve: string      // Masalah/kebutuhan yang diselesaikan
  differentiation: string     // Alasan memilih produk/jasa
  expectedExperience: string  // Pengalaman yang diharapkan
  expectedBenefit: string     // Manfaat/dampak yang diharapkan
  targetRecommendation: string // Kepada siapa merekomendasikan
  
  // Opsi tambahan
  duration: 15 | 20 | 25      // Durasi script dalam detik
  brandName: string           // Nama brand/produk
  stylePreference?: 'formal' | 'santai' | 'emosional' // Gaya bahasa
}

export async function POST(request: NextRequest) {
  try {
    // Check API Key first
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      )
    }

    // Initialize Gemini AI inside the handler
    const genAI = new GoogleGenerativeAI(apiKey)
    
    const body: ScriptRequest = await request.json()
    
    // Validasi input
    if (!body.problemToSolve || !body.differentiation || !body.expectedExperience || 
        !body.expectedBenefit || !body.targetRecommendation) {
      return NextResponse.json(
        { error: 'Semua pertanyaan wajib diisi' },
        { status: 400 }
      )
    }

    if (!body.duration || ![15, 20, 25].includes(body.duration)) {
      return NextResponse.json(
        { error: 'Durasi harus 15, 20, atau 25 detik' },
        { status: 400 }
      )
    }

    // Hitung estimasi jumlah kata berdasarkan durasi
    // Rata-rata orang bicara 120-150 kata per menit = 2-2.5 kata per detik
    const wordCount = {
      15: '30-40',
      20: '40-55',
      25: '55-70'
    }[body.duration]

    // Tentukan gaya bahasa
    const styleGuide = {
      formal: 'Gunakan bahasa Indonesia baku dan profesional. Hindari bahasa gaul.',
      santai: 'Gunakan bahasa Indonesia sehari-hari yang ramah dan casual. Boleh sedikit informal.',
      emosional: 'Gunakan bahasa yang menyentuh emosi, bercerita dengan perasaan. Gunakan kata-kata yang membangkitkan empati.'
    }[body.stylePreference || 'santai']

    // Build prompt untuk Gemini
    const prompt = `Kamu adalah copywriter profesional Indonesia yang ahli membuat script video testimonial yang autentik dan meyakinkan.

KONTEKS PRODUK/JASA: ${body.brandName || 'Produk/Jasa'}

INFORMASI DARI PEMILIK BISNIS:
1. Masalah/kebutuhan yang diselesaikan: "${body.problemToSolve}"
2. Alasan konsumen memilih produk ini: "${body.differentiation}"
3. Pengalaman yang diharapkan saat menggunakan: "${body.expectedExperience}"
4. Manfaat/dampak yang diharapkan: "${body.expectedBenefit}"
5. Target rekomendasi: "${body.targetRecommendation}"

REQUIREMENT SCRIPT:
- Durasi: ${body.duration} detik (sekitar ${wordCount} kata)
- Gaya: ${styleGuide}
- Format: Script untuk video testimonial yang akan diucapkan oleh konsumen
- Script harus terdengar natural dan autentik, BUKAN seperti iklan
- Gunakan perspektif orang pertama ("Saya", "Aku")
- Mulai dengan hook yang menarik (masalah awal atau keraguan)
- Tengah: ceritakan pengalaman dan perubahan yang dirasakan
- Akhir: rekomendasi natural untuk target audience

STRUKTUR SCRIPT (${body.duration} detik):
${body.duration === 15 ? `
- Hook (3-4 detik): Masalah singkat
- Experience (6-7 detik): Pengalaman & manfaat
- CTA (4-5 detik): Rekomendasi
` : body.duration === 20 ? `
- Hook (4-5 detik): Masalah/keraguan awal
- Experience (8-10 detik): Pengalaman detail & manfaat
- CTA (5-6 detik): Rekomendasi dengan alasan
` : `
- Hook (5-6 detik): Masalah/keraguan awal dengan konteks
- Experience (12-14 detik): Cerita pengalaman lengkap & manfaat konkret
- CTA (6-8 detik): Rekomendasi kuat dengan target spesifik
`}

Berikan HANYA script saja tanpa keterangan tambahan. Script harus siap dibaca langsung.`

    // Try generating with available models (with fallback)
    let generatedScript = ''
    let lastError = null
    
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Trying model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        generatedScript = result.response.text()
        console.log(`Success with model: ${modelName}`)
        break // Success, exit loop
      } catch (modelError) {
        console.error(`Model ${modelName} failed:`, modelError)
        lastError = modelError
        continue // Try next model
      }
    }

    if (!generatedScript) {
      throw lastError || new Error('Semua model AI gagal')
    }

    // Clean up script (hapus quotes jika ada)
    const cleanScript = generatedScript
      .replace(/^["']|["']$/g, '')
      .replace(/^\*\*.*\*\*\n?/gm, '') // Hapus bold headers
      .trim()

    return NextResponse.json({
      success: true,
      script: cleanScript,
      metadata: {
        duration: body.duration,
        estimatedWords: wordCount,
        style: body.stylePreference || 'santai'
      }
    })

  } catch (error) {
    console.error('AI Script Generation Error:', error)
    
    // Check if it's a Gemini API error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      if (errorMessage.includes('api_key') || errorMessage.includes('api key')) {
        return NextResponse.json(
          { error: 'API Key tidak valid. Periksa konfigurasi GEMINI_API_KEY.' },
          { status: 500 }
        )
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Kuota API habis. Coba lagi nanti.' },
          { status: 429 }
        )
      }
      
      if (errorMessage.includes('blocked') || errorMessage.includes('safety')) {
        return NextResponse.json(
          { error: 'Konten tidak dapat diproses. Coba ubah kata-kata Anda.' },
          { status: 400 }
        )
      }

      // Return actual error message for debugging
      return NextResponse.json(
        { error: `Gagal generate script: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Gagal generate script. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
