import { NextRequest, NextResponse } from 'next/server'

// Force Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Model options - will try in order (hemat token first)
// Based on available models from /api/ai/list-models
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',   // Paling hemat & cepat
  'gemini-2.0-flash',        // Fast and versatile
  'gemini-2.5-flash',        // Stable mid-size
  'gemini-2.5-flash-lite',   // Stable lite version
]

interface ScriptRequest {
  problemToSolve: string
  differentiation: string
  expectedExperience: string
  expectedBenefit: string
  targetRecommendation: string
  duration: 15 | 20 | 25
  brandName: string
  stylePreference?: 'formal' | 'santai' | 'emosional'
}

// Helper function to call Gemini API directly via REST
async function generateWithGemini(apiKey: string, modelName: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  
  // Extract text from response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('No text in response')
  }
  
  return text
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      )
    }

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

    const wordCount = {
      15: '30-40',
      20: '40-55',
      25: '55-70'
    }[body.duration]

    const styleGuide = {
      formal: 'Gunakan bahasa Indonesia baku dan profesional. Hindari bahasa gaul.',
      santai: 'Gunakan bahasa Indonesia sehari-hari yang ramah dan casual. Boleh sedikit informal.',
      emosional: 'Gunakan bahasa yang menyentuh emosi, bercerita dengan perasaan. Gunakan kata-kata yang membangkitkan empati.'
    }[body.stylePreference || 'santai']

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

    // Try each model until one works
    let generatedScript = ''
    let lastError: Error | null = null
    let successModel = ''
    
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Trying model: ${modelName}`)
        generatedScript = await generateWithGemini(apiKey, modelName, prompt)
        successModel = modelName
        console.log(`✅ Success with model: ${modelName}`)
        break
      } catch (modelError) {
        console.error(`❌ Model ${modelName} failed:`, modelError instanceof Error ? modelError.message : modelError)
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError))
        continue
      }
    }

    if (!generatedScript) {
      // Return more helpful error with list of tried models
      return NextResponse.json(
        { 
          error: `Semua model AI gagal. Error terakhir: ${lastError?.message || 'Unknown'}. Cek /api/ai/list-models untuk melihat model yang tersedia.`,
          triedModels: GEMINI_MODELS
        },
        { status: 500 }
      )
    }

    // Clean up script
    const cleanScript = generatedScript
      .replace(/^["']|["']$/g, '')
      .replace(/^\*\*.*\*\*\n?/gm, '')
      .trim()

    return NextResponse.json({
      success: true,
      script: cleanScript,
      metadata: {
        duration: body.duration,
        estimatedWords: wordCount,
        style: body.stylePreference || 'santai',
        model: successModel
      }
    })

  } catch (error) {
    console.error('AI Script Generation Error:', error)
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      if (errorMessage.includes('api_key') || errorMessage.includes('api key') || errorMessage.includes('invalid')) {
        return NextResponse.json(
          { error: 'API Key tidak valid. Periksa konfigurasi GEMINI_API_KEY.' },
          { status: 500 }
        )
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('resource exhausted')) {
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
