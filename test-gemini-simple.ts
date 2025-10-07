import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config({ path: '.env.local' })

const apiKey = process.env.VITE_GOOGLE_GEMINI_API_KEY

console.log('🔑 API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')

if (!apiKey) {
  console.error('❌ No API key found')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)

async function test() {
  try {
    console.log('\n🧪 Testing with gemini-pro model...')
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent('Say hello in one word')
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Success!')
    console.log('Response:', text)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error('\nFull error:', error)
  }
}

test()
