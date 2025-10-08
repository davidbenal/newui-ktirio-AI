# 🚀 QUICK REFERENCE - Sistema de Créditos Ktírio

## 📍 URLs DAS FUNÇÕES

```
BASE_URL: https://us-central1-ktirio-ai-4540c.cloudfunctions.net
```

| Função | URL Completa |
|--------|-------------|
| createSubscriptionCheckout | `{BASE_URL}/createSubscriptionCheckout` |
| createPackCheckout | `{BASE_URL}/createPackCheckout` |
| stripeWebhook | `{BASE_URL}/stripeWebhook` |
| getUserCredits | `{BASE_URL}/getUserCredits` |
| consumeCredits | `{BASE_URL}/consumeCredits` |
| createGeneration | `{BASE_URL}/createGeneration` |
| createCustomerPortalSession | `{BASE_URL}/createCustomerPortalSession` |

---

## 💳 PRICE IDs DO STRIPE

### Planos Mensais (Subscriptions)
```typescript
BASIC: 'price_1SFpHkRubDJ4RApyCypVbIoK'  // R$ 49,90 - 100 créditos/mês
PRO:   'price_1SFpINRubDJ4RApyjucRqblu'  // R$ 259,90 - 500 créditos/mês
```

### Pacotes Avulsos (One-time)
```typescript
INITIAL:  'price_1SDIOkRubDJ4RApyfVWUIE1O'  // R$ 39,90 - 50 créditos
STANDARD: 'price_1SDIOCRubDJ4RApy47OSAiWV'  // R$ 99,90 - 150 créditos (10% desc)
LARGE:    'price_1SDINURubDJ4RApyOW8A61K7'  // R$ 179,90 - 300 créditos (20% desc)
```

---

## 🔑 FIREBASE CONFIG

```bash
# Ver configuração atual
firebase functions:config:get

# Configurar Stripe keys
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.webhook_secret="whsec_..." \
  app.url="https://seu-dominio.com"

# Deploy após mudanças
firebase deploy --only functions
```

---

## 💻 USO NO FRONTEND

### Setup
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions'
const functions = getFunctions()
```

### Criar Checkout (Assinatura)
```typescript
const checkout = httpsCallable(functions, 'createSubscriptionCheckout')
const { data } = await checkout({ planType: 'basic' })
window.location.href = data.checkoutUrl
```

### Criar Checkout (Pacote)
```typescript
const checkout = httpsCallable(functions, 'createPackCheckout')
const { data } = await checkout({ packType: 'standard' })
window.location.href = data.checkoutUrl
```

### Ver Créditos
```typescript
const getCredits = httpsCallable(functions, 'getUserCredits')
const { data } = await getCredits()
console.log(data.totalCredits) // Total disponível
```

### Criar Geração
```typescript
const generate = httpsCallable(functions, 'createGeneration')
const { data } = await generate({
  projectId: 'project123',
  prompt: 'Casa moderna',
  imageUrl: 'https://storage.../image.png',
  creditsConsumed: 1
})
```

### Portal do Cliente
```typescript
const portal = httpsCallable(functions, 'createCustomerPortalSession')
const { data } = await portal({ returnUrl: window.location.href })
window.location.href = data.portalUrl
```

---

## 🐛 DEBUGGING

### Ver Logs
```bash
# Todos os logs
firebase functions:log

# Função específica
firebase functions:log --only stripeWebhook

# Tempo real
firebase functions:log --follow
```

### Listar Funções
```bash
firebase functions:list
```

### Build Local
```bash
npm run build --prefix functions
```

---

## ⚠️ TRATAMENTO DE ERROS

```typescript
try {
  // ... chamada à função
} catch (error: any) {
  switch (error.code) {
    case 'unauthenticated':
      // Redirecionar para login
      break
    case 'resource-exhausted':
      // Sem créditos - mostrar página de planos
      break
    case 'already-exists':
      // Já tem assinatura ativa
      break
    default:
      console.error(error)
  }
}
```

---

## 📊 ESTRUTURA FIRESTORE

### Collections
```
users/{userId}
├── email: string
├── name: string
├── plan: 'free' | 'basic' | 'pro'
├── credits: number
├── stripeCustomerId: string
└── role: 'owner' | 'admin' | 'user'

subscriptions/{subscriptionId}
├── userId: string
├── stripeSubscriptionId: string
├── planType: 'basic' | 'pro'
├── status: 'active' | 'canceled' | 'expired'
├── monthlyCredits: number
├── creditsUsedCurrentPeriod: number
└── creditsRemainingCurrentPeriod: number

creditPacks/{packId}
├── userId: string
├── credits: number
├── creditsRemaining: number
├── creditsUsed: number
├── expiresAt: timestamp | null
├── isActive: boolean
└── purchasedAt: timestamp

creditTransactions/{transactionId}
├── userId: string
├── transactionType: string
├── creditsChange: number
├── balanceAfter: number
└── createdAt: timestamp

generations/{generationId}
├── userId: string
├── projectId: string
├── imageUrl: string
├── prompt: string
├── creditsConsumed: number
└── createdAt: timestamp

checkoutSessions/{sessionId}
├── userId: string
├── sessionId: string (Stripe)
├── type: 'subscription' | 'pack'
├── status: 'pending' | 'completed' | 'expired'
└── createdAt: timestamp
```

---

## 🔐 WEBHOOK STRIPE

### URL para configurar
```
https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook
```

### Eventos necessários
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `payment_intent.succeeded`

---

## 📝 COMANDOS RÁPIDOS

```bash
# Login Firebase
firebase login --reauth

# Deploy completo
npm run build --prefix functions && firebase deploy --only functions

# Deletar função
firebase functions:delete NOME_FUNCAO --region us-central1 --force

# Ver projeto atual
firebase projects:list
firebase use ktirio-ai-4540c

# Emulators local
firebase emulators:start --only functions
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **[ETAPA_2_CONFIGURACAO_STRIPE.md](ETAPA_2_CONFIGURACAO_STRIPE.md)** - Setup Stripe Dashboard
- **[ETAPA_3_STATUS.md](ETAPA_3_STATUS.md)** - Status deployment e troubleshooting
- **[ETAPA_3_COMPLETA.md](ETAPA_3_COMPLETA.md)** - Resumo de conclusão
- **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - Guia completo React

---

## ✅ CHECKLIST DEPLOY

- [ ] Build functions: `npm run build --prefix functions`
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Verificar status: `firebase functions:list`
- [ ] Configurar webhook Stripe
- [ ] Testar checkout subscription
- [ ] Testar checkout pack
- [ ] Testar getUserCredits
- [ ] Testar createGeneration
- [ ] Verificar logs: `firebase functions:log`

---

**🚀 Deployment Status:** ✅ TODAS AS 7 FUNÇÕES ATIVAS

**⚠️ Pendente:** Resolver IAM permissions do webhook
