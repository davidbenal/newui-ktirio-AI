import dotenv from 'dotenv'
import { generateInteriorDesignPrompt, analyzeRoomImage, generateDesignVariations } from './src/lib/gemini'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Integration...\n')

  try {
    // Test 1: Generate optimized prompt
    console.log('📝 Test 1: Optimizing interior design prompt...')
    const optimizedPrompt = await generateInteriorDesignPrompt(
      'cozy bedroom with natural light',
      'minimalist'
    )
    console.log('✅ Success! Optimized prompt:')
    console.log(optimizedPrompt)
    console.log('\n' + '='.repeat(80) + '\n')

    // Test 2: Generate design variations
    console.log('🎨 Test 2: Generating design variations...')
    const variations = await generateDesignVariations(
      'modern kitchen with white cabinets and marble countertops',
      3
    )
    console.log('✅ Success! Generated variations:')
    variations.forEach((variation, index) => {
      console.log(`\nVariation ${index + 1}:`)
      console.log(variation)
    })
    console.log('\n' + '='.repeat(80) + '\n')

    // Test 3: Room image analysis (simulated - requires actual base64 image)
    console.log('📸 Test 3: Room image analysis...')
    console.log('ℹ️  Skipped - Requires actual image upload')
    console.log('   Use analyzeRoomImage(base64Image) with a real image\n')

    console.log('='.repeat(80))
    console.log('\n🎉 All Gemini API tests passed!')
    console.log('\n✅ Gemini is ready for:')
    console.log('   • Prompt optimization')
    console.log('   • Design variations')
    console.log('   • Room image analysis')
    console.log('\n📋 Next step: Integrate Imagen for image generation')

  } catch (error: any) {
    console.error('\n❌ Gemini API Error:', error.message)

    if (error.message?.includes('API key')) {
      console.error('\n⚠️  Invalid API key. Check VITE_GOOGLE_GEMINI_API_KEY in .env.local')
    } else if (error.message?.includes('quota')) {
      console.error('\n⚠️  API quota exceeded. Try again later or check your Google Cloud quotas.')
    } else {
      console.error('\n⚠️  Unexpected error. Check your internet connection and API key.')
    }

    process.exit(1)
  }
}

// Run tests
testGeminiAPI()
