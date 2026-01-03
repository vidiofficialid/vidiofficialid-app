import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Fetch available models from Google AI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch models' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Filter only models that support generateContent
    const chatModels = data.models?.filter((m: { supportedGenerationMethods?: string[] }) => 
      m.supportedGenerationMethods?.includes('generateContent')
    ) || []

    // Format response
    const formattedModels = chatModels.map((model: { 
      name: string
      displayName?: string
      description?: string
      inputTokenLimit?: number
      outputTokenLimit?: number
    }) => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description?.substring(0, 100),
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit,
    }))

    return NextResponse.json({
      success: true,
      totalModels: formattedModels.length,
      models: formattedModels,
      recommendation: 'Gunakan model dengan "flash" untuk response cepat dan hemat token'
    })

  } catch (error) {
    console.error('List models error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
