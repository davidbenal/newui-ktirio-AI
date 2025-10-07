import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

console.log('VITE_GOOGLE_GEMINI_API_KEY:', process.env.VITE_GOOGLE_GEMINI_API_KEY ? '✅ Loaded' : '❌ Not found')
console.log('First 10 chars:', process.env.VITE_GOOGLE_GEMINI_API_KEY?.substring(0, 10))
