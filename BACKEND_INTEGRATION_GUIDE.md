# 🚀 Guia de Integração Backend - Ktirio AI

> Transformando o protótipo em aplicação funcional

---

## 📋 Índice

1. [Stack Recomendada](#stack-recomendada)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Autenticação](#autenticação)
4. [API Endpoints](#api-endpoints)
5. [Banco de Dados](#banco-de-dados)
6. [Geração de Imagens com IA](#geração-de-imagens-com-ia)
7. [Upload e Storage](#upload-e-storage)
8. [Sistema de Créditos](#sistema-de-créditos)
9. [Integração Stripe](#integração-stripe)
10. [Webhooks](#webhooks)
11. [Variáveis de Ambiente](#variáveis-de-ambiente)
12. [Deployment](#deployment)

---

## 1. Stack Recomendada

### Backend Framework
```typescript
// Opção 1: Next.js App Router (Recomendado)
- Framework: Next.js 14+
- API Routes: App Router (src/app/api/)
- Server Components: React Server Components
- Edge Runtime para melhor performance

// Opção 2: Node.js + Express
- Framework: Express.js
- TypeScript: ts-node
- ORM: Prisma
```

### Banco de Dados
```typescript
// Recomendado: PostgreSQL
- Database: PostgreSQL 15+
- ORM: Prisma
- Hosting: Supabase / Neon / Railway

// Alternativa: MongoDB
- Database: MongoDB Atlas
- ODM: Mongoose
```

### Autenticação
```typescript
// Opção 1: Clerk (Mais fácil)
- Auth Provider: Clerk
- Features: Social login, 2FA, sessions

// Opção 2: NextAuth.js
- Auth Library: NextAuth.js v5 (Auth.js)
- Providers: Google, GitHub, Email

// Opção 3: Supabase Auth
- Auth + DB em uma plataforma
```

### Storage
```typescript
// Para uploads de imagens
- AWS S3 / Cloudflare R2 / Vercel Blob
- CDN: Cloudflare / CloudFront
```

### IA para Geração de Imagens
```typescript
// Opções de APIs
1. Replicate (Recomendado - mais fácil)
2. Stability AI
3. OpenAI DALL-E
4. Midjourney API (via terceiros)
```

---

## 2. Estrutura do Projeto

### Opção A: Next.js App Router

```
ktirio-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── projects/
│   │   │   │   ├── route.ts              # GET /api/projects (list)
│   │   │   │   ├── [id]/route.ts         # GET/PATCH/DELETE /api/projects/:id
│   │   │   │   └── [id]/versions/route.ts
│   │   │   ├── generate/
│   │   │   │   ├── route.ts              # POST /api/generate
│   │   │   │   └── [id]/status/route.ts
│   │   │   ├── upload/
│   │   │   │   └── route.ts              # POST /api/upload
│   │   │   ├── user/
│   │   │   │   ├── profile/route.ts
│   │   │   │   ├── credits/route.ts
│   │   │   │   └── settings/route.ts
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/route.ts
│   │   │   │   ├── webhooks/route.ts
│   │   │   │   └── portal/route.ts
│   │   │   └── plans/route.ts
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (dashboard)/
│   │       ├── page.tsx                  # Gallery
│   │       ├── editor/[id]/page.tsx
│   │       ├── settings/page.tsx
│   │       └── pricing/page.tsx
│   ├── components/                        # Seus componentes atuais
│   ├── lib/
│   │   ├── auth.ts                       # Auth config
│   │   ├── db.ts                         # Prisma client
│   │   ├── stripe.ts                     # Stripe config
│   │   ├── replicate.ts                  # AI config
│   │   ├── storage.ts                    # S3/R2 config
│   │   └── utils.ts
│   └── types/
│       ├── api.ts
│       └── database.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env.local
└── package.json
```

---

## 3. Autenticação

### 3.1 Setup com Clerk (Mais Fácil)

#### Instalação
```bash
npm install @clerk/nextjs
```

#### src/app/layout.tsx
```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

#### Middleware (middleware.ts)
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/welcome',
  '/pricing',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

#### Obter usuário logado
```typescript
import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
  const user = await currentUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({
    id: user.id,
    email: user.emailAddresses[0].emailAddress,
    name: user.firstName + ' ' + user.lastName,
  })
}
```

### 3.2 Alternativa: NextAuth.js

#### Instalação
```bash
npm install next-auth@beta
```

#### src/lib/auth.ts
```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
```

---

## 4. API Endpoints

### 4.1 Projetos

#### GET /api/projects
```typescript
// src/app/api/projects/route.ts
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const folder = searchParams.get('folder') // 'favorites', 'archived', null

  const projects = await prisma.project.findMany({
    where: {
      userId,
      name: {
        contains: search,
        mode: 'insensitive',
      },
      ...(folder === 'favorites' && { isFavorite: true }),
      ...(folder === 'archived' && { isArchived: true }),
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      thumbnail: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return Response.json({
    projects: projects.map(p => ({
      id: p.id,
      name: p.name,
      thumbnail: p.thumbnail,
      date: p.updatedAt.toLocaleDateString('pt-BR'),
    })),
  })
}
```

#### POST /api/projects
```typescript
export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await request.json()

  // Verificar limite de projetos no plano
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { _count: { select: { projects: true } } },
  })

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const limits = {
    free: 1,
    starter: 5,
    professional: Infinity,
  }

  if (user._count.projects >= limits[user.plan as keyof typeof limits]) {
    return Response.json(
      { error: 'Project limit reached', plan: user.plan },
      { status: 403 }
    )
  }

  const project = await prisma.project.create({
    data: {
      name: name || 'Novo Projeto',
      userId: user.id,
    },
  })

  return Response.json({ project }, { status: 201 })
}
```

#### GET /api/projects/[id]
```typescript
// src/app/api/projects/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      user: { clerkId: userId },
    },
    include: {
      versions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!project) {
    return Response.json({ error: 'Project not found' }, { status: 404 })
  }

  return Response.json({ project })
}
```

### 4.2 Upload de Imagens

#### POST /api/upload
```typescript
// src/app/api/upload/route.ts
import { put } from '@vercel/blob'
import { auth } from '@clerk/nextauth/server'

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validar tipo e tamanho
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large' }, { status: 400 })
  }

  // Upload para Vercel Blob (ou S3)
  const blob = await put(`uploads/${userId}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  return Response.json({
    url: blob.url,
    size: file.size,
    type: file.type,
  })
}
```

### 4.3 Geração com IA

#### POST /api/generate
```typescript
// src/app/api/generate/route.ts
import Replicate from 'replicate'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId, prompt, imageUrl, style } = await request.json()

  // Verificar créditos
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user || user.credits < 1) {
    return Response.json(
      { error: 'Insufficient credits' },
      { status: 402 }
    )
  }

  // Deduzir crédito
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: { decrement: 1 } },
  })

  // Gerar imagem com Replicate
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt: `${style} interior design, ${prompt}`,
        image: imageUrl,
        num_outputs: 1,
        guidance_scale: 7.5,
      }
    }
  )

  // Salvar versão
  const version = await prisma.version.create({
    data: {
      projectId,
      imageUrl: output[0] as string,
      prompt,
      style,
    },
  })

  return Response.json({
    version,
    creditsRemaining: user.credits - 1,
  })
}
```

### 4.4 Sistema de Créditos

#### GET /api/user/credits
```typescript
// src/app/api/user/credits/route.ts
export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      credits: true,
      plan: true,
    },
  })

  const maxCredits = {
    free: 5,
    starter: 100,
    professional: 300,
  }

  return Response.json({
    current: user?.credits || 0,
    max: maxCredits[user?.plan as keyof typeof maxCredits] || 5,
    plan: user?.plan || 'free',
  })
}
```

---

## 5. Banco de Dados

### 5.1 Schema Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  name      String?
  avatar    String?

  // Plano e créditos
  plan      String   @default("free") // free, starter, professional
  credits   Int      @default(5)

  // Stripe
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?

  projects  Project[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clerkId])
  @@index([email])
}

model Project {
  id          String   @id @default(cuid())
  name        String
  thumbnail   String?

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  isFavorite  Boolean  @default(false)
  isArchived  Boolean  @default(false)

  versions    Version[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([userId, updatedAt])
}

model Version {
  id        String   @id @default(cuid())
  name      String   @default("Versão")
  imageUrl  String
  prompt    String?
  style     String?

  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([projectId])
  @@index([projectId, createdAt])
}

model CreditTransaction {
  id          String   @id @default(cuid())
  userId      String
  amount      Int      // Positivo = compra, Negativo = uso
  type        String   // purchase, generation, refund
  description String?

  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([userId, createdAt])
}
```

### 5.2 Migrações

```bash
# Inicializar Prisma
npx prisma init

# Criar migração
npx prisma migrate dev --name init

# Gerar client
npx prisma generate

# Seed do banco (opcional)
npx prisma db seed
```

### 5.3 Prisma Client

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 6. Geração de Imagens com IA

### 6.1 Replicate (Recomendado)

```bash
npm install replicate
```

```typescript
// src/lib/replicate.ts
import Replicate from 'replicate'

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function generateInteriorDesign({
  imageUrl,
  prompt,
  style,
}: {
  imageUrl: string
  prompt: string
  style: string
}) {
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt: `${style} interior design, ${prompt}, photorealistic, high quality, 4k`,
        image: imageUrl,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 25,
      }
    }
  )

  return output[0] as string
}
```

### 6.2 Alternativa: OpenAI DALL-E

```typescript
// src/lib/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateWithDallE(prompt: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  })

  return response.data[0].url
}
```

---

## 7. Upload e Storage

### 7.1 Vercel Blob (Mais fácil para Next.js)

```bash
npm install @vercel/blob
```

```typescript
// src/lib/storage.ts
import { put, del, list } from '@vercel/blob'

export async function uploadImage(file: File, userId: string) {
  const blob = await put(
    `users/${userId}/${Date.now()}-${file.name}`,
    file,
    {
      access: 'public',
      addRandomSuffix: true,
    }
  )

  return blob.url
}

export async function deleteImage(url: string) {
  await del(url)
}

export async function listUserImages(userId: string) {
  const { blobs } = await list({
    prefix: `users/${userId}/`,
  })

  return blobs
}
```

### 7.2 AWS S3

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
// src/lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await s3.send(command)

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export async function getPresignedUrl(key: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  })

  return await getSignedUrl(s3, command, { expiresIn: 3600 })
}
```

---

## 8. Sistema de Créditos

### 8.1 Lógica de Créditos

```typescript
// src/lib/credits.ts
import { prisma } from './db'

export async function deductCredit(userId: string, amount: number = 1) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        decrement: amount,
      },
    },
  })

  // Registrar transação
  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: -amount,
      type: 'generation',
      description: 'Geração de imagem',
    },
  })

  return user.credits
}

export async function addCredits(
  userId: string,
  amount: number,
  type: string = 'purchase'
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: amount,
      },
    },
  })

  await prisma.creditTransaction.create({
    data: {
      userId,
      amount,
      type,
      description: `Compra de ${amount} créditos`,
    },
  })

  return user.credits
}

export async function hasCredits(userId: string, required: number = 1) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  return user ? user.credits >= required : false
}
```

---

## 9. Integração Stripe

### 9.1 Setup

```bash
npm install stripe @stripe/stripe-js
```

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const plans = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    credits: 100,
  },
  professional: {
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    credits: 300,
  },
}
```

### 9.2 Criar Checkout Session

```typescript
// src/app/api/stripe/checkout/route.ts
import { stripe, plans } from '@/lib/stripe'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { planId, billingPeriod } = await request.json()

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  // Criar ou recuperar customer
  let customerId = user.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
        clerkId: userId,
      },
    })

    customerId = customer.id

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  // Criar checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plans[planId as keyof typeof plans].priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/upgrade/canceled`,
    metadata: {
      userId: user.id,
      planId,
    },
  })

  return Response.json({
    sessionId: session.id,
    url: session.url,
  })
}
```

### 9.3 Webhooks do Stripe

```typescript
// src/app/api/stripe/webhooks/route.ts
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return Response.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      await prisma.user.update({
        where: { id: session.metadata?.userId },
        data: {
          plan: session.metadata?.planId,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: session.line_items?.data[0].price?.id,
          stripeCurrentPeriodEnd: new Date(
            (session as any).current_period_end * 1000
          ),
        },
      })

      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice

      // Renovar créditos mensais
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      )

      const planCredits = {
        starter: 100,
        professional: 300,
      }

      const planId = subscription.metadata.planId as keyof typeof planCredits

      await prisma.user.update({
        where: { stripeCustomerId: invoice.customer as string },
        data: {
          credits: planCredits[planId],
        },
      })

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      await prisma.user.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: 'free',
          stripeSubscriptionId: null,
          stripePriceId: null,
        },
      })

      break
    }
  }

  return Response.json({ received: true })
}
```

---

## 10. Variáveis de Ambiente

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ktirio"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...

# Replicate (IA)
REPLICATE_API_TOKEN=r8_...

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# AWS S3 (alternativa)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=ktirio-uploads

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## 11. Conectar Frontend com Backend

### 11.1 Atualizar Gallery.tsx

```typescript
// src/components/Gallery.tsx
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function Gallery({ ... }: GalleryProps) {
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [credits, setCredits] = useState({ current: 0, max: 5 });
  const [isLoading, setIsLoading] = useState(true);

  // Buscar projetos
  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true);

      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(data.projects);
      } catch (error) {
        showError('Erro', 'Não foi possível carregar projetos');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Buscar créditos
  useEffect(() => {
    async function fetchCredits() {
      const res = await fetch('/api/user/credits');
      const data = await res.json();
      setCredits(data);
    }

    fetchCredits();
  }, []);

  const handleCreateProject = async () => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Novo Projeto' }),
      });

      if (res.status === 403) {
        // Limite de projetos atingido
        setUpgradeModalContext('projects');
        setUpgradeModalOpen(true);
        return;
      }

      const data = await res.json();
      onOpenProject(data.project.id);
    } catch (error) {
      showError('Erro', 'Não foi possível criar projeto');
    }
  };

  // Substituir mockProjects por projects do backend
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Usar créditos reais
  return (
    <div className="size-full flex gap-4 p-4">
      {/* ... */}
      <div className="bg-gray-100/70 border border-gray-200/80 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600 uppercase tracking-wider">Créditos</span>
          <Sparkles className="w-4 h-4 text-gray-500" />
        </div>
        <div className="mb-3">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-gray-900">{credits.current}</span>
            <span className="text-xs text-gray-500">/ {credits.max}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gray-900 h-1.5 rounded-full"
              style={{ width: `${(credits.current / credits.max) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* ... */}
    </div>
  );
}
```

### 11.2 Atualizar Editor.tsx

```typescript
// src/components/Editor.tsx
export default function Editor({ projectId, ... }: EditorProps) {
  const [project, setProject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Carregar projeto
  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;

      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();

      setProject(data.project);
      setVersions(data.project.versions);
    }

    fetchProject();
  }, [projectId]);

  // Upload de imagem
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.url;
  };

  // Gerar imagem
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showError('Prompt vazio', 'Por favor, descreva a cena.');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          prompt,
          imageUrl: project.thumbnail,
          style: 'modern',
        }),
      });

      if (res.status === 402) {
        // Sem créditos
        setShowCreditLimitModal(true);
        return;
      }

      const data = await res.json();

      setVersions([data.version, ...versions]);
      showSuccess('Imagem gerada!', `${data.creditsRemaining} créditos restantes`);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      showError('Erro', 'Não foi possível gerar imagem');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    // ... resto do componente
  );
}
```

---

## 12. Deployment

### 12.1 Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar environment variables no dashboard
```

### 12.2 Checklist de Deploy

- [ ] Configurar todas as variáveis de ambiente
- [ ] Migrar banco de dados de produção
- [ ] Configurar domínio customizado
- [ ] Configurar webhooks do Stripe para produção
- [ ] Testar fluxo de pagamento em modo live
- [ ] Configurar CORS se necessário
- [ ] Configurar rate limiting
- [ ] Configurar monitoring (Sentry, LogRocket)
- [ ] Configurar analytics
- [ ] Fazer backup do banco de dados

---

## 13. Próximos Passos

### Fase 1: Core (1-2 semanas)
- [ ] Setup de autenticação (Clerk)
- [ ] Setup de banco de dados (Prisma + PostgreSQL)
- [ ] CRUD de projetos
- [ ] Upload de imagens

### Fase 2: IA (1 semana)
- [ ] Integração com Replicate
- [ ] Sistema de geração de imagens
- [ ] Histórico de versões

### Fase 3: Monetização (1 semana)
- [ ] Integração Stripe
- [ ] Sistema de créditos
- [ ] Webhooks
- [ ] Planos e assinaturas

### Fase 4: Polish (1 semana)
- [ ] Testes
- [ ] Performance
- [ ] SEO
- [ ] Analytics

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Replicate Docs](https://replicate.com/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)

---

**Total estimado: 4-6 semanas para MVP funcional** 🚀
