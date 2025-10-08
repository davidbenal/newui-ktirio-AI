# 🎨 GUIA DE INTEGRAÇÃO - FRONTEND

Este guia mostra como usar as Cloud Functions no frontend React.

---

## 📦 SETUP INICIAL

### 1. Importações necessárias

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase' // ou crie conforme abaixo
```

### 2. Configurar Functions no firebase.ts

Adicione ao seu arquivo `src/lib/firebase.ts`:

```typescript
import { getFunctions } from 'firebase/functions'

export const functions = getFunctions(app, 'us-central1')
```

---

## 🛒 1. CHECKOUT DE ASSINATURA

### Criar sessão de checkout para plano mensal

```typescript
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

async function handleSubscriptionCheckout(planType: 'basic' | 'pro') {
  try {
    const createCheckout = httpsCallable(functions, 'createSubscriptionCheckout')

    const result = await createCheckout({ planType })
    const data = result.data as { checkoutUrl: string; sessionId: string }

    // Redirecionar para Stripe Checkout
    window.location.href = data.checkoutUrl
  } catch (error: any) {
    if (error.code === 'already-exists') {
      alert('Você já possui uma assinatura ativa deste plano')
    } else if (error.code === 'invalid-argument') {
      alert('Plano inválido')
    } else {
      console.error('Erro ao criar checkout:', error)
      alert('Erro ao processar pagamento')
    }
  }
}

// Usar no componente
<Button onClick={() => handleSubscriptionCheckout('basic')}>
  Assinar Plano Básico
</Button>
```

---

## 💰 2. CHECKOUT DE PACOTE DE CRÉDITOS

### Comprar pacote avulso de créditos

```typescript
async function handlePackCheckout(packType: 'initial' | 'standard' | 'large') {
  try {
    const createCheckout = httpsCallable(functions, 'createPackCheckout')

    const result = await createCheckout({ packType })
    const data = result.data as { checkoutUrl: string; sessionId: string }

    window.location.href = data.checkoutUrl
  } catch (error: any) {
    if (error.code === 'invalid-argument') {
      alert('Pacote inválido')
    } else {
      console.error('Erro ao criar checkout:', error)
      alert('Erro ao processar pagamento')
    }
  }
}

// Usar no componente
<Button onClick={() => handlePackCheckout('standard')}>
  Comprar 150 Créditos
</Button>
```

---

## 📊 3. CONSULTAR SALDO DE CRÉDITOS

### Obter saldo completo do usuário

```typescript
interface CreditBalance {
  totalCredits: number
  subscription: {
    active: boolean
    planType: string | null
    creditsRemaining: number
    creditsUsed: number
    monthlyCredits: number
    periodEnd: Date | null
  }
  packs: Array<{
    id: string
    credits: number
    creditsRemaining: number
    creditsUsed: number
    expiresAt: Date | null
    isActive: boolean
  }>
}

async function getUserCreditBalance(): Promise<CreditBalance> {
  const getCredits = httpsCallable(functions, 'getUserCredits')
  const result = await getCredits()
  return result.data as CreditBalance
}

// Hook customizado
function useCreditBalance() {
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBalance() {
      try {
        const data = await getUserCreditBalance()
        setBalance(data)
      } catch (error) {
        console.error('Erro ao carregar saldo:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBalance()
  }, [])

  return { balance, loading, refresh: () => loadBalance() }
}

// Usar no componente
function CreditDisplay() {
  const { balance, loading } = useCreditBalance()

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <h3>Créditos Disponíveis: {balance?.totalCredits || 0}</h3>

      {balance?.subscription.active && (
        <div>
          <p>Assinatura: {balance.subscription.planType}</p>
          <p>Créditos mensais restantes: {balance.subscription.creditsRemaining}</p>
        </div>
      )}

      {balance?.packs.map(pack => (
        <div key={pack.id}>
          <p>Pacote: {pack.creditsRemaining} créditos restantes</p>
          {pack.expiresAt && <p>Expira em: {new Date(pack.expiresAt).toLocaleDateString()}</p>}
        </div>
      ))}
    </div>
  )
}
```

---

## 🎨 4. CRIAR GERAÇÃO (COM CONSUMO DE CRÉDITOS)

### Gerar imagem e consumir créditos automaticamente

```typescript
interface GenerationData {
  projectId: string
  prompt: string
  imageUrl: string // URL da imagem gerada (upload manual ou via storage)
  creditsConsumed?: number // Opcional, padrão = 1
}

async function createImageGeneration(data: GenerationData) {
  try {
    const createGen = httpsCallable(functions, 'createGeneration')

    const result = await createGen(data)
    const response = result.data as {
      generationId: string
      creditsConsumed: number
      remainingCredits: number
      sources: Array<{ type: string; creditsUsed: number }>
    }

    console.log('Geração criada:', response.generationId)
    console.log('Créditos restantes:', response.remainingCredits)

    return response
  } catch (error: any) {
    if (error.code === 'resource-exhausted') {
      alert('Créditos insuficientes! Compre mais créditos para continuar.')
      // Redirecionar para página de planos/pacotes
    } else {
      console.error('Erro ao criar geração:', error)
      throw error
    }
  }
}

// Exemplo de uso no fluxo de geração de imagem
async function handleGenerateImage(projectId: string, prompt: string) {
  try {
    // 1. Gerar imagem via API de IA (seu fluxo atual)
    const imageBlob = await generateImageWithAI(prompt)

    // 2. Upload para Firebase Storage
    const storageRef = ref(storage, `generations/${Date.now()}.png`)
    await uploadBytes(storageRef, imageBlob)
    const imageUrl = await getDownloadURL(storageRef)

    // 3. Criar geração e consumir créditos
    const result = await createImageGeneration({
      projectId,
      prompt,
      imageUrl,
      creditsConsumed: 1 // Ou mais, dependendo do tipo de geração
    })

    console.log('Imagem gerada com sucesso!')
    return result
  } catch (error) {
    console.error('Erro:', error)
  }
}
```

---

## 💳 5. PORTAL DO CLIENTE STRIPE

### Abrir portal para gerenciar assinatura/pagamentos

```typescript
async function handleOpenCustomerPortal() {
  try {
    const createPortal = httpsCallable(functions, 'createCustomerPortalSession')

    const result = await createPortal({
      returnUrl: window.location.href // URL de retorno após gerenciar
    })

    const data = result.data as { portalUrl: string }
    window.location.href = data.portalUrl
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      alert('Você precisa ter uma assinatura ou compra ativa')
    } else {
      console.error('Erro ao abrir portal:', error)
    }
  }
}

// Usar no componente
<Button onClick={handleOpenCustomerPortal}>
  Gerenciar Assinatura
</Button>
```

---

## 🔄 6. CONSUMIR CRÉDITOS MANUALMENTE (Avançado)

**Nota:** Normalmente você usaria `createGeneration` que já consome créditos automaticamente. Use esta função apenas se precisar consumir créditos sem criar uma geração.

```typescript
async function consumeUserCredits(creditsNeeded: number = 1) {
  try {
    const consume = httpsCallable(functions, 'consumeCredits')

    const result = await consume({ creditsNeeded })
    const data = result.data as {
      success: boolean
      creditsConsumed: number
      remainingCredits: number
      sources: Array<{
        type: 'subscription' | 'pack'
        id?: string
        creditsUsed: number
      }>
    }

    console.log('Créditos consumidos:', data.creditsConsumed)
    console.log('Fontes:', data.sources)
    console.log('Restantes:', data.remainingCredits)

    return data
  } catch (error: any) {
    if (error.code === 'resource-exhausted') {
      alert('Créditos insuficientes!')
    }
    throw error
  }
}
```

---

## 🎯 COMPONENTE COMPLETO DE EXEMPLO

### Página de planos e pacotes

```typescript
import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

export function PricingPage() {
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCredits()
  }, [])

  async function loadCredits() {
    try {
      const getCredits = httpsCallable(functions, 'getUserCredits')
      const result = await getCredits()
      const data = result.data as any
      setCredits(data.totalCredits)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function subscribe(planType: 'basic' | 'pro') {
    const createCheckout = httpsCallable(functions, 'createSubscriptionCheckout')
    const result = await createCheckout({ planType })
    const data = result.data as { checkoutUrl: string }
    window.location.href = data.checkoutUrl
  }

  async function buyPack(packType: 'initial' | 'standard' | 'large') {
    const createCheckout = httpsCallable(functions, 'createPackCheckout')
    const result = await createCheckout({ packType })
    const data = result.data as { checkoutUrl: string }
    window.location.href = data.checkoutUrl
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Créditos Disponíveis: {credits}</h2>
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Planos Mensais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border p-6 rounded">
            <h4 className="font-bold">Ktírio Básico</h4>
            <p>100 créditos/mês</p>
            <p className="text-2xl">R$ 49,90/mês</p>
            <button
              onClick={() => subscribe('basic')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
            >
              Assinar
            </button>
          </div>

          <div className="border p-6 rounded">
            <h4 className="font-bold">Ktírio Pro</h4>
            <p>500 créditos/mês</p>
            <p className="text-2xl">R$ 259,90/mês</p>
            <button
              onClick={() => subscribe('pro')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
            >
              Assinar
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Pacotes Avulsos</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border p-6 rounded">
            <h4 className="font-bold">Inicial</h4>
            <p>50 créditos</p>
            <p className="text-2xl">R$ 39,90</p>
            <button
              onClick={() => buyPack('initial')}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded"
            >
              Comprar
            </button>
          </div>

          <div className="border p-6 rounded">
            <h4 className="font-bold">Padrão</h4>
            <p>150 créditos</p>
            <p className="text-2xl">R$ 99,90</p>
            <p className="text-sm text-green-600">10% desconto</p>
            <button
              onClick={() => buyPack('standard')}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded"
            >
              Comprar
            </button>
          </div>

          <div className="border p-6 rounded">
            <h4 className="font-bold">Grande</h4>
            <p>300 créditos</p>
            <p className="text-2xl">R$ 179,90</p>
            <p className="text-sm text-green-600">20% desconto</p>
            <button
              onClick={() => buyPack('large')}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded"
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔐 TRATAMENTO DE ERROS

### Códigos de erro comuns

```typescript
try {
  // Chamar função
} catch (error: any) {
  switch (error.code) {
    case 'unauthenticated':
      // Usuário não autenticado
      alert('Faça login para continuar')
      break

    case 'permission-denied':
      // Sem permissão
      alert('Você não tem permissão para esta ação')
      break

    case 'resource-exhausted':
      // Sem créditos
      alert('Créditos insuficientes! Compre mais créditos.')
      break

    case 'already-exists':
      // Já existe (ex: assinatura ativa)
      alert('Você já possui uma assinatura ativa')
      break

    case 'invalid-argument':
      // Argumento inválido
      alert('Dados inválidos')
      break

    case 'failed-precondition':
      // Pré-condição falhou (ex: sem stripeCustomerId)
      alert('Configure sua conta antes de continuar')
      break

    default:
      console.error('Erro desconhecido:', error)
      alert('Erro ao processar solicitação')
  }
}
```

---

## 🧪 TESTING

### Testar no console do navegador

```javascript
// 1. Obter referência às functions
const { getFunctions, httpsCallable } = await import('firebase/functions')
const functions = getFunctions()

// 2. Testar getUserCredits
const getCredits = httpsCallable(functions, 'getUserCredits')
const result = await getCredits()
console.log(result.data)

// 3. Testar createSubscriptionCheckout
const createCheckout = httpsCallable(functions, 'createSubscriptionCheckout')
const checkout = await createCheckout({ planType: 'basic' })
console.log(checkout.data.checkoutUrl)
```

---

## 📱 URLs DE RETORNO (Success/Cancel)

As URLs de retorno após checkout são configuradas em `functions/src/config/plans.ts`:

```typescript
export const CHECKOUT_URLS = {
  success: process.env.APP_URL ? `${process.env.APP_URL}/checkout/success` : 'http://localhost:5173/checkout/success',
  cancel: process.env.APP_URL ? `${process.env.APP_URL}/checkout/cancel` : 'http://localhost:5173/checkout/cancel',
}
```

### Criar páginas de retorno

**src/pages/checkout/success.tsx:**
```typescript
export function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Atualizar créditos após sucesso
    // Mostrar mensagem de sucesso
  }, [])

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600">
        ✅ Pagamento Confirmado!
      </h1>
      <p className="mt-4">Seus créditos foram adicionados à sua conta.</p>
      <Link to="/projects" className="mt-8 inline-block bg-blue-500 text-white px-6 py-3 rounded">
        Começar a Criar
      </Link>
    </div>
  )
}
```

**src/pages/checkout/cancel.tsx:**
```typescript
export function CheckoutCancel() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-red-600">
        ❌ Pagamento Cancelado
      </h1>
      <p className="mt-4">O pagamento foi cancelado. Tente novamente quando estiver pronto.</p>
      <Link to="/pricing" className="mt-8 inline-block bg-blue-500 text-white px-6 py-3 rounded">
        Ver Planos
      </Link>
    </div>
  )
}
```

---

## ⚡ OTIMIZAÇÕES

### 1. Caching de créditos (React Query)

```typescript
import { useQuery } from '@tanstack/react-query'

function useCreditBalance() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const getCredits = httpsCallable(functions, 'getUserCredits')
      const result = await getCredits()
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 10, // Refetch a cada 10 min
  })
}
```

### 2. Loading states

```typescript
function useCheckout() {
  const [loading, setLoading] = useState(false)

  async function checkout(planType: string) {
    setLoading(true)
    try {
      // ... criar checkout
    } finally {
      setLoading(false)
    }
  }

  return { checkout, loading }
}
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Implementar componentes de UI conforme este guia
2. ✅ Testar fluxo completo de checkout
3. ✅ Configurar páginas de success/cancel
4. ✅ Adicionar tratamento de erros robusto
5. ✅ Implementar cache de créditos
6. ✅ Integrar com fluxo de geração de imagens existente
