# 🔥 Setup Completo: Clerk + Firebase + Stripe + Gemini

## 📋 Stack Final

- **Autenticação**: Clerk
- **Banco de Dados**: Firebase Firestore
- **Storage**: Firebase Storage
- **IA**: Google Gemini (texto) + Imagen/DALL-E (geração de imagens)
- **Pagamentos**: Stripe

---

## 🚀 Setup Passo a Passo

### 1️⃣ Configurar Firebase (15 min)

#### 1.1 Criar Projeto Firebase
```bash
# 1. Acessar: https://console.firebase.google.com/
# 2. Clicar em "Adicionar projeto"
# 3. Nome: "Ktirio AI"
# 4. Desabilitar Google Analytics (opcional)
```

#### 1.2 Configurar Firestore Database
```bash
# 1. No console Firebase, ir em "Firestore Database"
# 2. Clicar em "Criar banco de dados"
# 3. Modo: Produção
# 4. Localização: us-central (ou mais próxima)
```

#### 1.3 Configurar Storage
```bash
# 1. No console Firebase, ir em "Storage"
# 2. Clicar em "Começar"
# 3. Modo: Produção
# 4. Localização: usar a mesma do Firestore
```

#### 1.4 Obter Credenciais Firebase
```bash
# 1. Ir em "Configurações do projeto" (⚙️)
# 2. Aba "Geral"
# 3. Em "Seus apps", clicar no ícone Web (</>)
# 4. Registrar app: "Ktirio AI Web"
# 5. Copiar o objeto firebaseConfig
# 6. Colar no .env.local (formato VITE_*)
```

#### 1.5 Obter Service Account (Admin SDK)
```bash
# 1. Ir em "Configurações do projeto" (⚙️)
# 2. Aba "Contas de serviço"
# 3. Clicar em "Gerar nova chave privada"
# 4. Baixar o arquivo JSON
# 5. Copiar valores para .env.local:
#    - project_id → FIREBASE_ADMIN_PROJECT_ID
#    - client_email → FIREBASE_ADMIN_CLIENT_EMAIL
#    - private_key → FIREBASE_ADMIN_PRIVATE_KEY (manter \\n)
```

#### 1.6 Deploy das Regras de Segurança

**Opção A: Via Firebase CLI (Recomendado)**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init

# Selecionar:
# - Firestore
# - Storage
# - Use existing project: Ktirio AI

# Deploy das regras
firebase deploy --only firestore:rules,storage
```

**Opção B: Via Console (Manual)**
```bash
# 1. Firestore > Regras
#    - Copiar conteúdo de firestore.rules
#    - Publicar

# 2. Storage > Regras
#    - Copiar conteúdo de storage.rules
#    - Publicar
```

---

### 2️⃣ Configurar Clerk (10 min)

```bash
# 1. Acessar: https://dashboard.clerk.com/
# 2. Criar conta / Login
# 3. Clicar em "Create Application"
# 4. Nome: "Ktirio AI"
# 5. Selecionar métodos de login:
#    ✅ Email
#    ✅ Google
#    ✅ GitHub (opcional)
# 6. Copiar as keys para .env.local
```

**Configurar Paths:**
```bash
# No Clerk Dashboard:
# Paths → Configure
# - Sign-in URL: /sign-in
# - Sign-up URL: /sign-up
# - After sign-in URL: /
# - After sign-up URL: /welcome
```

**Sync com Firebase:**
```bash
# No Clerk Dashboard:
# Webhooks → Add Endpoint
# URL: https://seu-dominio.com/api/webhooks/clerk
# Events:
#   ✅ user.created
#   ✅ user.updated
#   ✅ user.deleted
```

---

### 3️⃣ Configurar Google Gemini (5 min)

```bash
# 1. Acessar: https://aistudio.google.com/
# 2. Login com conta Google
# 3. Ir em "Get API key"
# 4. Criar API key
# 5. Copiar para .env.local
```

**Modelos Disponíveis:**
- `gemini-1.5-flash` - Rápido, texto (usar para prompts)
- `gemini-1.5-pro` - Mais poderoso, texto
- `gemini-1.5-pro-vision` - Análise de imagens

**Nota sobre Geração de Imagens:**
Gemini não gera imagens diretamente. Você precisa usar:
- **Opção 1**: Imagen API (Google Cloud) - Mais caro
- **Opção 2**: DALL-E API (OpenAI) - Recomendado
- **Opção 3**: Stable Diffusion (Replicate) - Melhor custo-benefício

---

### 4️⃣ Configurar Stripe (15 min)

#### 4.1 Criar Conta Stripe
```bash
# 1. Acessar: https://stripe.com/
# 2. Criar conta
# 3. Ativar modo Test
```

#### 4.2 Obter API Keys
```bash
# 1. Dashboard → Developers → API keys
# 2. Copiar:
#    - Publishable key → VITE_STRIPE_PUBLISHABLE_KEY
#    - Secret key → STRIPE_SECRET_KEY
```

#### 4.3 Criar Produtos e Preços

**Produto 1: Starter**
```bash
# Dashboard → Products → Add product
# Name: Ktirio AI - Starter
# Description: 100 créditos/mês, qualidade alta

# Price 1 (Mensal):
# - Amount: $49.00
# - Billing period: Monthly
# - Copiar Price ID → STRIPE_PRICE_STARTER_MONTHLY

# Add another price (Anual):
# - Amount: $470.00 (20% off)
# - Billing period: Yearly
# - Copiar Price ID → STRIPE_PRICE_STARTER_YEARLY
```

**Produto 2: Professional**
```bash
# Name: Ktirio AI - Professional
# Description: 300 créditos/mês, qualidade máxima

# Price 1 (Mensal):
# - Amount: $89.00
# - Billing period: Monthly
# - Copiar Price ID → STRIPE_PRICE_PROFESSIONAL_MONTHLY

# Price 2 (Anual):
# - Amount: $854.00 (20% off)
# - Billing period: Yearly
# - Copiar Price ID → STRIPE_PRICE_PROFESSIONAL_YEARLY
```

#### 4.4 Configurar Webhooks
```bash
# Dashboard → Developers → Webhooks → Add endpoint
# Endpoint URL: https://seu-dominio.com/api/webhooks/stripe
# Listen to: Events on your account

# Selecionar eventos:
# ✅ checkout.session.completed
# ✅ invoice.payment_succeeded
# ✅ invoice.payment_failed
# ✅ customer.subscription.deleted
# ✅ customer.subscription.updated

# Copiar Signing secret → STRIPE_WEBHOOK_SECRET
```

---

### 5️⃣ Configurar Geração de Imagens

#### Opção A: DALL-E 3 (OpenAI) - Recomendado

```bash
# 1. Criar conta: https://platform.openai.com/
# 2. Ir em API keys
# 3. Create new secret key
# 4. Adicionar ao .env.local:
OPENAI_API_KEY=sk-proj-...

# 5. Instalar SDK:
npm install openai
```

**Criar arquivo: src/lib/dalle.ts**
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateWithDALLE(prompt: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
  })

  return response.data[0].url!
}
```

#### Opção B: Imagen (Google Cloud)

```bash
# 1. Acessar: https://console.cloud.google.com/
# 2. Criar projeto ou usar existente
# 3. Ativar Vertex AI API
# 4. Criar Service Account
# 5. Baixar JSON key
```

**Custos (estimativa):**
- DALL-E 3: ~$0.04 por imagem (1024x1024)
- Imagen: ~$0.02 por imagem
- Stable Diffusion (Replicate): ~$0.005 por imagem

---

### 6️⃣ Estrutura de Dados Firestore

#### Collections:

**users/**
```typescript
{
  clerkId: string
  email: string
  name?: string
  avatar?: string
  plan: "free" | "starter" | "professional"
  credits: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  stripeCurrentPeriodEnd?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**projects/{projectId}**
```typescript
{
  userId: string
  name: string
  thumbnail?: string
  isFavorite: boolean
  isArchived: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**versions/{versionId}**
```typescript
{
  projectId: string
  name: string
  imageUrl: string
  prompt?: string
  style?: string
  createdAt: Timestamp
}
```

**creditTransactions/{transactionId}**
```typescript
{
  userId: string
  amount: number  // Positivo = compra, Negativo = uso
  type: "purchase" | "generation" | "refund" | "subscription"
  description?: string
  createdAt: Timestamp
}
```

---

### 7️⃣ Criar Índices Firestore

**Via Firebase Console:**
```bash
# Firestore → Indexes → Composite

# Index 1: projects (busca + ordenação)
# Collection: projects
# Fields:
#   - userId (Ascending)
#   - updatedAt (Descending)

# Index 2: versions (por projeto)
# Collection: versions
# Fields:
#   - projectId (Ascending)
#   - createdAt (Descending)

# Index 3: creditTransactions
# Collection: creditTransactions
# Fields:
#   - userId (Ascending)
#   - createdAt (Descending)
```

---

### 8️⃣ Testar Setup

#### 8.1 Verificar Firebase
```bash
# Teste 1: Firestore
firebase firestore:indexes

# Teste 2: Storage
firebase storage:get

# Teste 3: Regras
firebase deploy --only firestore:rules,storage --dry-run
```

#### 8.2 Verificar Clerk
```bash
# 1. npm run dev
# 2. Visitar /sign-in
# 3. Criar conta de teste
# 4. Verificar se usuário aparece no Clerk Dashboard
```

#### 8.3 Verificar Stripe
```bash
# Dashboard → Developers → Events
# Criar um checkout de teste:
# https://dashboard.stripe.com/test/payments
```

---

## 🔄 Fluxo de Dados

### 1. Novo Usuário
```
1. User faz sign-up no Clerk
2. Clerk webhook → /api/webhooks/clerk
3. Criar documento em Firestore users/
4. Adicionar 5 créditos grátis
5. Redirecionar para /welcome
```

### 2. Upload de Imagem
```
1. User seleciona imagem
2. Validar (tamanho, tipo)
3. Upload para Firebase Storage (projects/{userId}/{filename})
4. Salvar URL em Firestore (projects/{projectId})
```

### 3. Geração com IA
```
1. Verificar créditos (Firestore)
2. Deduzir 1 crédito
3. Gemini gera prompt otimizado
4. DALL-E gera imagem
5. Upload para Storage (versions/{userId}/{filename})
6. Salvar em Firestore (versions/{versionId})
7. Registrar transação (creditTransactions/)
```

### 4. Upgrade de Plano
```
1. User clica em "Upgrade"
2. Criar Checkout Session (Stripe)
3. Redirecionar para Stripe
4. Após pagamento → webhook
5. Atualizar Firestore (plan, stripeCustomerId, etc)
6. Adicionar créditos do plano
```

---

## 📁 Arquivos Criados

✅ **src/lib/firebase.ts** - Cliente Firebase (frontend)
✅ **src/lib/firebase-admin.ts** - Admin SDK (backend)
✅ **src/lib/gemini.ts** - Google Gemini AI
✅ **src/lib/firestore.ts** - Operações Firestore (CRUD)
✅ **src/lib/storage.ts** - Upload Firebase Storage
✅ **src/lib/stripe.ts** - Configuração Stripe
✅ **firestore.rules** - Regras de segurança Firestore
✅ **storage.rules** - Regras de segurança Storage
✅ **.env.local** - Variáveis de ambiente

---

## 🔐 Variáveis de Ambiente

Preencher em `.env.local`:

```bash
# CLERK
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# FIREBASE
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# FIREBASE ADMIN
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# GEMINI
GOOGLE_GEMINI_API_KEY=AIzaSy...

# DALL-E (se usar)
OPENAI_API_KEY=sk-proj-...

# STRIPE
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_...
STRIPE_PRICE_PROFESSIONAL_YEARLY=price_...
```

---

## 🚀 Próximos Passos

1. **Deploy Firestore Rules**: `firebase deploy --only firestore:rules,storage`
2. **Criar índices**: Seguir instruções do Firebase Console
3. **Testar autenticação**: Criar usuário no /sign-in
4. **Testar upload**: Upload de imagem de teste
5. **Testar Gemini**: Gerar prompt otimizado
6. **Testar Stripe**: Criar checkout de teste

---

## 📚 Recursos

- [Firebase Docs](https://firebase.google.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Gemini API](https://ai.google.dev/docs)
- [Stripe Docs](https://stripe.com/docs)
- [DALL-E API](https://platform.openai.com/docs/guides/images)

---

**Tempo total estimado: 45-60 minutos** ⏱️
