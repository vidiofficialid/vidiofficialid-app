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
        temperature: 0.8,
        maxOutputTokens: 1024, // Increased for complete response
        topP: 0.95,
        topK: 40,
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

    // Durasi sebagai referensi saja, bukan batasan ketat
    const durationGuide = {
      15: 'singkat (sekitar 3-5 kalimat)',
      20: 'sedang (sekitar 5-7 kalimat)', 
      25: 'lengkap (sekitar 7-10 kalimat)'
    }[body.duration || 20]

    const styleGuide = {
      formal: 'Gunakan bahasa Indonesia baku dan profesional.',
      santai: 'Gunakan bahasa Indonesia sehari-hari yang ramah, casual, dan natural seperti ngobrol dengan teman.',
      emosional: 'Gunakan bahasa yang menyentuh emosi, bercerita dengan perasaan yang dalam dan autentik.'
    }[body.stylePreference || 'santai']

    const prompt = `Kamu adalah copywriter profesional Indonesia yang ahli membuat script video testimonial.

TUGAS: Buat script video testimonial yang LENGKAP dan NATURAL untuk produk/jasa berikut.

PRODUK/JASA: ${body.brandName || 'Produk/Jasa ini'}

INFORMASI KUNCI:
1. Masalah yang diselesaikan: ${body.problemToSolve}
2. Keunggulan produk: ${body.differentiation}
3. Pengalaman pengguna: ${body.expectedExperience}
4. Manfaat yang didapat: ${body.expectedBenefit}
5. Target rekomendasi: ${body.targetRecommendation}

PANDUAN GAYA:
- Panjang: ${durationGuide}
- Gaya bahasa: ${styleGuide}

STRUKTUR SCRIPT:
1. PEMBUKA (Hook): Mulai dengan masalah/keraguan awal yang relatable
2. CERITA: Bagaimana menemukan dan mencoba produk/jasa ini
3. PENGALAMAN: Ceritakan pengalaman nyata menggunakannya
4. HASIL: Manfaat konkret yang dirasakan
5. REKOMENDASI: Ajakan natural untuk target audience

ATURAN PENTING:
- Tulis dari sudut pandang orang pertama (Saya/Aku)
- Harus terdengar NATURAL seperti orang sungguhan bercerita, BUKAN seperti iklan
- Script harus LENGKAP dengan pembuka, isi, dan penutup
- Jangan gunakan bullet point atau numbering
- Langsung tulis script-nya saja tanpa keterangan apapun

SCRIPT:`

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
      return NextResponse.json(
        { 
          error: `Semua model AI gagal. Error terakhir: ${lastError?.message || 'Unknown'}`,
          triedModels: GEMINI_MODELS
        },
        { status: 500 }
      )
    }

    // Clean up script
    const cleanScript = generatedScript
      .replace(/^["']|["']$/g, '')
      .replace(/^\*\*.*\*\*\n?/gm, '')
      .replace(/^Script:?\s*/i, '')
      .replace(/^SCRIPT:?\s*/i, '')
      .trim()

    return NextResponse.json({
      success: true,
      script: cleanScript,
      metadata: {
        duration: body.duration,
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
