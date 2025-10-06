# 🤖 Google Gemini API Setup

## What is Gemini Used For?

In Ktirio AI, Gemini handles **text-based AI operations**:

✅ **Prompt Optimization**: Enhance user prompts for better interior design results
✅ **Image Analysis**: Extract room details from uploaded photos (room type, style, colors)
✅ **Design Variations**: Generate multiple prompt variations for different design options

**Note**: We'll use **Imagen** (also via Gemini API) for actual image generation, which you'll provide reference code for later.

---

## Step 1: Get Gemini API Key (2 minutes)

1. Go to: **https://aistudio.google.com/app/apikey**

2. Sign in with your Google account

3. Click **"Create API Key"**

4. Select a project or create new one:
   - Project name: **"Ktirio AI"**
   - Click **"Create API key in new project"**

5. Copy the API key (starts with `AIzaSy...`)

---

## Step 2: Add to Environment Variables

Open `.env.local` and update:

```bash
# GOOGLE GEMINI AI
VITE_GOOGLE_GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE
```

Replace `AIzaSy_YOUR_KEY_HERE` with your actual API key.

---

## Step 3: Verify Gemini Library Configuration

The Gemini library is already configured in [src/lib/gemini.ts](src/lib/gemini.ts):

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || '')

export async function generateInteriorDesignPrompt(
  userPrompt: string,
  style: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
    You are an expert interior designer. Optimize this prompt for AI image generation:

    User request: "${userPrompt}"
    Design style: ${style}

    Create a detailed, vivid prompt that includes:
    - Room type and layout
    - Color palette
    - Materials and textures
    - Lighting conditions
    - Furniture and decor details

    Return ONLY the optimized prompt, no explanations.
  `

  const result = await model.generateContent(prompt)
  return result.response.text()
}
```

---

## Available Functions

### 1. `generateInteriorDesignPrompt()`

**Purpose**: Optimize user prompts for better AI image generation

**Usage**:
```typescript
import { generateInteriorDesignPrompt } from '@/lib/gemini'

const optimized = await generateInteriorDesignPrompt(
  'modern living room',
  'minimalist'
)

// Result: "A spacious minimalist living room featuring clean lines and neutral tones. White walls with floor-to-ceiling windows allowing natural light to flood the space. A sleek gray sectional sofa with geometric cushions centered on a large white area rug..."
```

### 2. `analyzeRoomImage()`

**Purpose**: Extract details from uploaded room photos

**Usage**:
```typescript
import { analyzeRoomImage } from '@/lib/gemini'

// Convert image to base64
const base64Image = await fileToBase64(imageFile)

const analysis = await analyzeRoomImage(base64Image)

// Result: "This is a living room with traditional architecture. The space features exposed wooden beams, neutral beige walls, and hardwood flooring. Current furniture includes a brown leather sofa and rustic coffee table..."
```

### 3. `generateDesignVariations()`

**Purpose**: Create multiple design variations from a base description

**Usage**:
```typescript
import { generateDesignVariations } from '@/lib/gemini'

const variations = await generateDesignVariations(
  'modern kitchen with white cabinets',
  3
)

// Returns array of 3 different variations:
// [
//   "Modern minimalist kitchen with glossy white cabinets...",
//   "Contemporary kitchen featuring matte white cabinets with gold hardware...",
//   "Scandinavian-inspired kitchen with textured white cabinets..."
// ]
```

---

## Integration with Image Generation Workflow

Here's how Gemini fits into the complete workflow:

```typescript
// Complete image generation workflow
async function generateDesign(userPrompt: string, style: string, roomImage?: File) {
  // 1. If user uploaded a room photo, analyze it first
  let roomContext = ''
  if (roomImage) {
    const base64 = await fileToBase64(roomImage)
    roomContext = await analyzeRoomImage(base64)
  }

  // 2. Optimize the user's prompt with Gemini
  const optimizedPrompt = await generateInteriorDesignPrompt(
    roomContext ? `${userPrompt} (Current room: ${roomContext})` : userPrompt,
    style
  )

  // 3. Generate image using Imagen (you'll provide this code later)
  const imageUrl = await generateImageWithImagen(optimizedPrompt)

  // 4. Save to Firestore
  await createVersion({
    projectId,
    imageUrl,
    prompt: optimizedPrompt,
    style
  })

  return imageUrl
}
```

---

## Testing Gemini API

Create a test file to verify everything works:

```typescript
// test-gemini.ts
import { generateInteriorDesignPrompt } from './src/lib/gemini'

async function testGemini() {
  console.log('🧪 Testing Gemini API...\n')

  try {
    const result = await generateInteriorDesignPrompt(
      'cozy bedroom',
      'bohemian'
    )

    console.log('✅ Gemini API is working!\n')
    console.log('Optimized prompt:')
    console.log(result)
  } catch (error) {
    console.error('❌ Gemini API error:', error)
  }
}

testGemini()
```

Run test:
```bash
npx tsx test-gemini.ts
```

Expected output:
```
🧪 Testing Gemini API...

✅ Gemini API is working!

Optimized prompt:
A cozy bohemian-style bedroom featuring warm, earthy tones and natural textures. The space includes a low-profile wooden bed frame with layered textiles in rich terracotta, mustard yellow, and deep burgundy. Macramé wall hangings and woven tapestries adorn the walls...
```

---

## API Limits and Pricing

### Free Tier:
- **60 requests per minute**
- **1,500 requests per day**
- **$0** cost

### Paid Tier (if you exceed free tier):
- **Gemini Pro**: $0.00025 / 1K characters input, $0.0005 / 1K characters output
- **Gemini Pro Vision**: $0.00025 / image

For Ktirio AI usage, free tier should be sufficient for development and testing.

---

## Error Handling

```typescript
try {
  const optimized = await generateInteriorDesignPrompt(userPrompt, style)
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Invalid Gemini API key')
    // Show error to user: "Please configure your Gemini API key"
  } else if (error.message.includes('quota')) {
    console.error('Gemini API quota exceeded')
    // Show error: "AI service temporarily unavailable. Please try again later."
  } else {
    console.error('Gemini API error:', error)
    // Fallback: use original prompt without optimization
  }
}
```

---

## Next Steps

After configuring Gemini:

1. ✅ Get Gemini API key
2. ✅ Add to `.env.local`
3. ✅ Test with example prompt
4. ➡️ **Provide Imagen reference code** for image generation
5. ➡️ Integrate complete workflow in Editor component

**Ready for Imagen setup?** When you provide the reference code and documentation, I'll integrate it into the project.

---

## Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **API Key Management**: https://aistudio.google.com/app/apikey
- **Imagen Documentation**: (you'll provide this)
