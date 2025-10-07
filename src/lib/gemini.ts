import { GoogleGenerativeAI } from '@google/generative-ai'

// Support both Vite (import.meta.env) and Node.js (process.env)
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_GOOGLE_GEMINI_API_KEY
  }
  return process.env.VITE_GOOGLE_GEMINI_API_KEY
}

const genAI = new GoogleGenerativeAI(getApiKey() || '')

/**
 * Gera descrição de design de interiores usando Gemini
 */
export async function generateInteriorDesignPrompt(userPrompt: string, style: string = 'modern') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const enhancedPrompt = `
You are an expert interior designer. Generate a detailed, vivid description for an AI image generator based on this request:

Style: ${style}
User request: ${userPrompt}

Create a photorealistic description including:
- Room type and layout
- Color palette
- Furniture and decor
- Lighting atmosphere
- Materials and textures
- Specific design elements for ${style} style

Keep it concise (max 150 words) and optimized for image generation.
`

    const result = await model.generateContent(enhancedPrompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error('Gemini prompt generation error:', error)
    throw new Error('Failed to generate design prompt')
  }
}

/**
 * Analisa imagem de ambiente usando Gemini Vision
 */
export async function analyzeRoomImage(imageBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' })

    const prompt = `
Analyze this interior room image and provide:

1. Room type (living room, bedroom, etc.)
2. Current design style
3. Key furniture and elements
4. Color palette
5. Improvement suggestions

Format as JSON with keys: roomType, style, elements, colors, suggestions
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      },
    ])

    const response = result.response
    const text = response.text()

    try {
      return JSON.parse(text)
    } catch {
      return { analysis: text }
    }
  } catch (error) {
    console.error('Gemini image analysis error:', error)
    throw new Error('Failed to analyze image')
  }
}

/**
 * Gera variações de design usando Gemini
 */
export async function generateDesignVariations(baseDescription: string, count: number = 3) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Based on this interior design description:
"${baseDescription}"

Generate ${count} creative variations with different:
- Color schemes
- Furniture arrangements
- Decorative elements
- Lighting concepts

Return as JSON array with keys: title, description, keyChanges
`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    try {
      return JSON.parse(text)
    } catch {
      return [{ title: 'Variation', description: text, keyChanges: [] }]
    }
  } catch (error) {
    console.error('Gemini variations error:', error)
    throw new Error('Failed to generate variations')
  }
}
