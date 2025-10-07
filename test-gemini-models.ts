import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config({ path: '.env.local' })

const apiKey = process.env.VITE_GOOGLE_GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

async function testModels() {
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-pro',
  ]

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n🧪 Testando: ${modelName}...`)
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent('Diga olá em uma palavra')
      const response = await result.response
      const text = response.text()
      
      console.log(`✅ ${modelName} FUNCIONA!`)
      console.log(`   Resposta: "${text}"`)
      break // Para no primeiro que funcionar
      
    } catch (error: any) {
      console.log(`❌ ${modelName} - ${error.message.split('\n')[0]}`)
    }
  }
}

testModels()
