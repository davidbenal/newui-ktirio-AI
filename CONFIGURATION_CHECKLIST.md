# 🎯 Configuration Checklist - Ktirio AI

## ✅ Completed

- [x] Firebase Client SDK configured
- [x] Firestore operations library ([src/lib/firestore.ts](src/lib/firestore.ts))
- [x] Storage utilities ([src/lib/storage.ts](src/lib/storage.ts))
- [x] Custom hooks created:
  - [x] [useFirebaseUser.ts](src/hooks/useFirebaseUser.ts) - Auto-sync Clerk → Firestore
  - [x] [useProjects.ts](src/hooks/useProjects.ts) - Project management
  - [x] [useImageUpload.ts](src/hooks/useImageUpload.ts) - Image uploads
- [x] Integration example ([src/examples/GalleryWithFirebase.tsx](src/examples/GalleryWithFirebase.tsx))
- [x] Security rules created ([firestore.rules](firestore.rules), [storage.rules](storage.rules))
- [x] Old Prisma/PostgreSQL setup removed

---

## 🔄 Next Steps (In Order)

### 1. Configure Clerk Authentication (⏱️ 10 min)

**Why:** Enable user login and sync with Firestore

**Steps:**
```bash
# 1. Create account
https://dashboard.clerk.com/sign-up

# 2. Create application
- Name: "Ktirio AI"
- Sign-in methods: Email + Google OAuth

# 3. Copy keys to .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Integration:**
```typescript
// src/main.tsx or src/App.tsx
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
)
```

**Test:** Login should auto-create user in Firestore with 5 credits

---

### 2. Deploy Firebase Security Rules (⏱️ 2 min)

**Why:** Protect data access in production

**Option A: Via Console**
```bash
# Firestore Rules
1. Open: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/rules
2. Copy content from firestore.rules
3. Click "Publish"

# Storage Rules
4. Open: https://console.firebase.google.com/project/ktirio-ai-4540c/storage/rules
5. Copy content from storage.rules
6. Click "Publish"
```

**Option B: Via CLI** (if Firebase CLI installed)
```bash
firebase deploy --only firestore:rules,storage
```

**Test:** Try accessing another user's project (should fail)

---

### 3. Create Firestore Indexes (⏱️ 5 min)

**Why:** Enable complex queries (filters + sorting)

**Required Indexes:**
```bash
# Open: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/indexes

# Index 1: User projects with filters
Collection: projects
Fields: userId (Ascending), isFavorite (Ascending), updatedAt (Descending)

# Index 2: Project versions
Collection: versions
Fields: projectId (Ascending), createdAt (Descending)

# Index 3: Credit transactions
Collection: creditTransactions
Fields: userId (Ascending), createdAt (Descending)

# Index 4: Archived projects
Collection: projects
Fields: userId (Ascending), isArchived (Ascending), updatedAt (Descending)
```

**Alternative:** Wait for Firestore to show index creation links in browser console when queries fail

---

### 4. Configure Google Gemini AI (⏱️ 5 min)

**Why:** Optimize prompts and analyze images

**Steps:**
```bash
# 1. Get API key
https://aistudio.google.com/app/apikey

# 2. Add to .env.local
VITE_GOOGLE_GEMINI_API_KEY=AIzaSy...

# 3. Verify gemini.ts imports it
# (already configured in src/lib/gemini.ts)
```

**Functions available:**
- `generateInteriorDesignPrompt()` - Optimize user prompt
- `analyzeRoomImage()` - Extract room details from photo
- `generateDesignVariations()` - Create prompt variations

**Test:**
```typescript
import { generateInteriorDesignPrompt } from '@/lib/gemini'

const optimized = await generateInteriorDesignPrompt(
  'modern living room',
  'minimalist'
)
console.log(optimized)
```

---

### 5. Configure DALL-E (OpenAI) (⏱️ 10 min)

**Why:** Generate interior design images

**Steps:**
```bash
# 1. Get API key
https://platform.openai.com/api-keys

# 2. Add to .env.local
VITE_OPENAI_API_KEY=sk-proj-...

# 3. Install OpenAI SDK
npm install openai
```

**Create:** [src/lib/openai.ts](src/lib/openai.ts)
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side use
})

export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  })

  return response.data[0].url || ''
}
```

**Complete workflow:**
```typescript
// 1. Optimize prompt with Gemini
const optimized = await generateInteriorDesignPrompt(userPrompt, style)

// 2. Generate image with DALL-E
const imageUrl = await generateImage(optimized)

// 3. Upload to Firebase Storage
const savedUrl = await uploadImage(imageFile, userId, 'versions')

// 4. Deduct credits
await deductCredits(userId, 1, 'Image generation')
```

---

### 6. Configure Stripe (⏱️ 15 min)

**Why:** Handle payments for credit purchases

**Steps:**
```bash
# 1. Create account
https://dashboard.stripe.com/register

# 2. Get API keys (Test mode)
https://dashboard.stripe.com/test/apikeys

# 3. Add to .env.local
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
```

**Create Products:**
```bash
# Open: https://dashboard.stripe.com/test/products

Product 1: Starter Plan
- Price 1: $49/month (recurring) → Copy Price ID → STRIPE_PRICE_STARTER_MONTHLY
- Price 2: $470/year (recurring) → Copy Price ID → STRIPE_PRICE_STARTER_YEARLY

Product 2: Professional Plan
- Price 1: $89/month (recurring) → Copy Price ID → STRIPE_PRICE_PROFESSIONAL_MONTHLY
- Price 2: $854/year (recurring) → Copy Price ID → STRIPE_PRICE_PROFESSIONAL_YEARLY
```

**Install Stripe:**
```bash
npm install @stripe/stripe-js
```

**Integration** (already in [src/lib/stripe.ts](src/lib/stripe.ts)):
```typescript
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
)
```

**Webhook setup** (optional for now, needed for production):
```bash
# 1. Install Stripe CLI
https://stripe.com/docs/stripe-cli

# 2. Forward webhooks to localhost
stripe listen --forward-to localhost:5173/api/webhooks/stripe

# 3. Copy webhook secret to .env.local
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### 7. Test Complete User Flow (⏱️ 10 min)

**Test Scenario:**

**Step 1: Login**
```
1. Open app
2. Click "Login"
3. Sign in with Google or Email
4. Check Firestore Console → users collection → new user document
5. Verify: credits = 5, plan = 'free'
```

**Step 2: Create Project**
```
1. Click "New Project"
2. Enter name "Test Project"
3. Check Firestore → projects collection → new project
4. Verify: userId matches your user ID
```

**Step 3: Upload Image**
```
1. Click project
2. Upload room photo
3. Check Firebase Storage → projects/{userId}/ folder
4. Verify: image appears in UI
```

**Step 4: Generate Design** (after Gemini + DALL-E setup)
```
1. Enter prompt: "modern minimalist living room"
2. Click "Generate"
3. Check credits deducted: 5 → 4
4. Verify: new image in versions collection
```

**Step 5: Upgrade Plan** (after Stripe setup)
```
1. Click "Upgrade"
2. Select "Starter" plan
3. Complete test payment (use 4242 4242 4242 4242)
4. Verify: plan = 'starter', credits = 100
```

---

## 📋 Environment Variables Summary

**Required NOW:**
```bash
✅ VITE_FIREBASE_API_KEY=...
✅ VITE_FIREBASE_AUTH_DOMAIN=...
✅ VITE_FIREBASE_PROJECT_ID=...
✅ VITE_FIREBASE_STORAGE_BUCKET=...
✅ VITE_FIREBASE_MESSAGING_SENDER_ID=...
✅ VITE_FIREBASE_APP_ID=...
✅ VITE_FIREBASE_MEASUREMENT_ID=...

❌ VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
❌ CLERK_SECRET_KEY=sk_test_...
```

**Required for AI Features:**
```bash
❌ VITE_GOOGLE_GEMINI_API_KEY=...
❌ VITE_OPENAI_API_KEY=...
```

**Required for Payments:**
```bash
❌ VITE_STRIPE_PUBLISHABLE_KEY=...
❌ VITE_STRIPE_SECRET_KEY=...
❌ STRIPE_WEBHOOK_SECRET=... (production only)
❌ STRIPE_PRICE_STARTER_MONTHLY=...
❌ STRIPE_PRICE_STARTER_YEARLY=...
❌ STRIPE_PRICE_PROFESSIONAL_MONTHLY=...
❌ STRIPE_PRICE_PROFESSIONAL_YEARLY=...
```

---

## 🚀 Quick Start Command

```bash
# 1. Install remaining dependencies (if needed)
npm install @clerk/clerk-react openai @stripe/stripe-js

# 2. Configure environment variables
# Edit .env.local with your API keys

# 3. Start development server
npm run dev

# 4. Test in browser
http://localhost:5173
```

---

## 🆘 Troubleshooting

### Error: "Missing or insufficient permissions"
**Solution:** Deploy Firestore/Storage rules (Step 2)

### Error: "The query requires an index"
**Solution:** Create Firestore indexes (Step 3) or click the link in browser console

### Error: "No user found"
**Solution:** Verify Clerk is configured (Step 1) and ClerkProvider wraps app

### Error: "Invalid API key"
**Solution:** Check .env.local keys are correct and have VITE_ prefix

### Error: "Cannot read properties of undefined (reading 'user')"
**Solution:** Ensure useFirebaseUser is used inside ClerkProvider

---

## 📝 Development Notes

**Current Architecture:**
- **Frontend:** Vite + React + TypeScript
- **Auth:** Clerk (client-side)
- **Database:** Firestore (client SDK only)
- **Storage:** Firebase Storage
- **AI:** Gemini (text) + DALL-E (images)
- **Payments:** Stripe

**No Server Needed:**
- All operations use client SDKs
- Security via Firestore Rules
- Authentication via Clerk tokens

**Next Major Features:**
1. Image generation workflow
2. Version history management
3. Stripe subscription flow
4. Credit purchase system
5. Export functionality

---

## ✨ What's Ready to Use

You can already:
- ✅ Login users (once Clerk is configured)
- ✅ Auto-create Firestore user documents
- ✅ Create/read/update/delete projects
- ✅ Upload images to Firebase Storage
- ✅ Track user credits
- ✅ Filter projects (favorites, archived, search)

**Example Integration:** See [src/examples/GalleryWithFirebase.tsx](src/examples/GalleryWithFirebase.tsx)

---

**Next Step:** [Configure Clerk Authentication](#1-configure-clerk-authentication--10-min)
