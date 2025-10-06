# 🚀 Instruções de Setup - Ktirio AI

## ✅ Arquivos Criados

1. **prisma/schema.prisma** - Schema do banco de dados
2. **.env.local** - Variáveis de ambiente (configure com suas chaves)
3. **.env.example** - Template de exemplo
4. **src/lib/db.ts** - Prisma Client
5. **src/lib/replicate.ts** - Cliente Replicate (IA)
6. **src/lib/stripe.ts** - Cliente Stripe
7. **src/lib/credits.ts** - Funções de créditos
8. **src/app/api/projects/route.ts** - API de projetos

---

## 📝 Próximos Passos

### 1. Configurar Banco de Dados

#### Opção A: Usar Supabase (Recomendado - Grátis)
```bash
# 1. Criar conta em https://supabase.com
# 2. Criar novo projeto
# 3. Copiar connection string de Settings > Database
# 4. Colar em .env.local como DATABASE_URL
```

#### Opção B: Usar PostgreSQL Local
```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar serviço
brew services start postgresql@15

# Criar banco
createdb ktirio

# Atualizar .env.local
DATABASE_URL="postgresql://localhost:5432/ktirio"
```

### 2. Rodar Migrações
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Configurar Clerk (Autenticação)

```bash
# 1. Criar conta em https://clerk.com
# 2. Criar nova aplicação
# 3. Copiar as chaves de API Keys
# 4. Colar em .env.local
```

**Configurar no Clerk Dashboard:**
- **Application Name**: Ktirio AI
- **Sign-in options**: Email + Google
- **Paths**:
  - Sign in: `/sign-in`
  - Sign up: `/sign-up`
  - After sign in: `/`

### 4. Configurar Stripe

```bash
# 1. Criar conta em https://stripe.com
# 2. Ir para Dashboard > Developers > API Keys (Test mode)
# 3. Copiar Secret key e Publishable key
# 4. Colar em .env.local
```

**Criar Produtos no Stripe:**

1. Dashboard > Products > Add Product
2. **Produto 1: Starter**
   - Name: Ktirio AI - Starter
   - Price 1: $49/month (recurring)
   - Price 2: $470/year (recurring)
   - Copiar os Price IDs para .env.local

3. **Produto 2: Professional**
   - Name: Ktirio AI - Professional
   - Price 1: $89/month (recurring)
   - Price 2: $854/year (recurring)
   - Copiar os Price IDs para .env.local

### 5. Configurar Replicate (IA)

```bash
# 1. Criar conta em https://replicate.com
# 2. Ir para Account > API tokens
# 3. Criar novo token
# 4. Copiar e colar em .env.local
```

### 6. Seed do Banco (Opcional)

Criar um usuário de teste:

```bash
# Criar arquivo prisma/seed.ts
npx ts-node prisma/seed.ts
```

### 7. Testar API

```bash
# Iniciar servidor
npm run dev

# Testar endpoints (use Thunder Client ou Postman)
GET http://localhost:3000/api/projects
POST http://localhost:3000/api/projects
```

---

## 🔧 Comandos Úteis

```bash
# Gerar Prisma Client
npx prisma generate

# Criar migração
npx prisma migrate dev --name nome_da_migracao

# Abrir Prisma Studio (visualizar banco)
npx prisma studio

# Reset do banco (CUIDADO!)
npx prisma migrate reset

# Ver status das migrações
npx prisma migrate status
```

---

## 🌐 Configurar Clerk no App

Você precisa adicionar o ClerkProvider ao seu app. Como está usando Vite (não Next.js), vou criar as configurações:

### src/main.tsx (ou index.tsx)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
```

### .env.local (atualizar)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## ⚠️ IMPORTANTE: Estrutura Vite vs Next.js

**Você está usando Vite, não Next.js!** Alguns ajustes necessários:

### 1. API Routes não funcionam com Vite

Você tem duas opções:

#### Opção A: Migrar para Next.js (Recomendado)
```bash
# Criar novo projeto Next.js
npx create-next-app@latest ktirio-ai-next --typescript --tailwind --app

# Copiar componentes
cp -r src/components ktirio-ai-next/src/
cp -r src/lib ktirio-ai-next/src/
```

#### Opção B: Criar Backend Separado (Express)
```bash
# Criar servidor Express
mkdir api
cd api
npm init -y
npm install express cors @clerk/clerk-sdk-node stripe prisma @prisma/client

# Copiar schema
cp ../prisma/schema.prisma ./prisma/
```

### 2. Variáveis de Ambiente

**Vite usa `VITE_` prefix:**
```bash
# .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Acessar no código:**
```typescript
const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
```

---

## 🎯 Recomendação

**Migrar para Next.js é a melhor opção** porque:
- ✅ API Routes integradas
- ✅ Server Components
- ✅ Melhor integração com Clerk
- ✅ Suporte a Server Actions
- ✅ Otimizações automáticas
- ✅ Todo o código do guia funcionará sem mudanças

### Como migrar:
```bash
# 1. Criar projeto Next.js
npx create-next-app@latest ktirio-ai-next --typescript --tailwind --app

# 2. Copiar seus componentes
cp -r src/components ktirio-ai-next/src/
cp -r src/lib ktirio-ai-next/src/

# 3. Copiar configurações
cp prisma ktirio-ai-next/
cp .env.local ktirio-ai-next/
cp BACKEND_INTEGRATION_GUIDE.md ktirio-ai-next/

# 4. Instalar dependências
cd ktirio-ai-next
npm install @clerk/nextjs stripe replicate @prisma/client
```

---

## 📚 Recursos

- [Clerk Docs](https://clerk.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Replicate Docs](https://replicate.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

Quer que eu ajude a migrar para Next.js ou prefere continuar com Vite + backend separado?
