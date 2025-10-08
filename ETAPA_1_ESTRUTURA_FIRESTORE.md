# ✅ ETAPA 1: ESTRUTURA FIRESTORE - CONCLUÍDA

## 📋 Resumo da Implementação

Esta etapa criou toda a estrutura de dados no Firestore para suportar o sistema de créditos e pagamentos com Stripe.

---

## 🗂️ Collections Implementadas

### 1.1 ✅ Collection: `users` (EXPANDIDA)

**Arquivo:** [src/lib/firestore.ts](src/lib/firestore.ts) (linhas 22-41)

**Campos adicionados:**
- `stripeCustomerId`: string | null - ID do customer no Stripe
- `displayName`: string (opcional)
- `photoURL`: string (opcional)
- `role`: 'owner' | 'admin' | 'user' (opcional)

**Status:** ✅ Expandida sem quebrar compatibilidade

---

### 1.2 ✅ Collection: `subscriptions` (NOVA)

**Arquivo:** [src/lib/firestore-credits.ts](src/lib/firestore-credits.ts) (linhas 17-48)

**Estrutura completa:**
```typescript
interface Subscription {
  id: string
  userId: string
  planType: 'trial' | 'basic' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'expired'

  // Créditos
  monthlyCredits: number
  creditsUsedCurrentPeriod: number
  creditsRemainingCurrentPeriod: number

  // Ciclo de faturamento
  billingCycleStart: Date
  billingCycleEnd: Date
  nextResetDate: Date
  nextBillingDate: Date | null

  // Stripe
  stripeSubscriptionId: string | null
  stripePriceId: string
  pricePaid: number

  // Timestamps
  createdAt: Date
  updatedAt: Date
  canceledAt: Date | null
}
```

**Funções implementadas:**
- ✅ `getActiveSubscription(userId)` - Busca assinatura ativa
- ✅ `createSubscription(data)` - Cria nova (cancela anterior automaticamente)
- ✅ `updateSubscription(id, data)` - Atualiza assinatura

**Regras de negócio:**
- ✅ Apenas 1 assinatura ativa por usuário
- ✅ Ao criar nova, cancela a anterior
- ✅ Créditos não usados são perdidos no reset mensal

**Indexes criados:**
- ✅ `userId + status`
- ✅ `status`
- ✅ `nextResetDate`

---

### 1.3 ✅ Collection: `creditPacks` (NOVA)

**Arquivo:** [src/lib/firestore-credits.ts](src/lib/firestore-credits.ts) (linhas 53-78)

**Estrutura completa:**
```typescript
interface CreditPack {
  id: string
  userId: string
  packType: 'initial' | 'standard' | 'large'

  // Créditos
  creditsPurchased: number
  creditsUsed: number
  creditsRemaining: number

  // Pagamento
  pricePaid: number
  stripePaymentIntentId: string | null

  // Validade
  purchasedAt: Date
  expiresAt: Date | null
  isActive: boolean

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Funções implementadas:**
- ✅ `getActiveCreditPacks(userId)` - Retorna em ordem FIFO
- ✅ `createCreditPack(data)` - Cria novo pacote
- ✅ `updateCreditPack(id, data)` - Atualiza (marca inativo se zerou)

**Regras de negócio:**
- ✅ Créditos NÃO resetam
- ✅ Podem ter validade ou serem permanentes (null)
- ✅ Múltiplos pacotes ativos simultâneos
- ✅ Consumo FIFO (mais antigo primeiro)
- ✅ Auto-desativa quando zerou ou expirou

**Indexes criados:**
- ✅ `userId + isActive + purchasedAt` (para FIFO)
- ✅ `userId + isActive + expiresAt`
- ✅ `expiresAt` (para cron de expiração)

---

### 1.4 ✅ Collection: `creditTransactions` (AJUSTADA)

**Arquivo:** [src/lib/firestore-credits.ts](src/lib/firestore-credits.ts) (linhas 83-104)

**Estrutura completa:**
```typescript
interface CreditTransaction {
  id: string
  userId: string
  transactionType: 'generation' | 'subscription_reset' | 'pack_purchase' | 'subscription_created' | 'refund'

  // Créditos
  creditsChange: number // Positivo = ganhou, Negativo = consumiu
  balanceAfterTransaction: number

  // Origem
  sourceType: 'subscription' | 'credit_pack'
  sourceId: string

  // Relacionamentos
  imageGenerationId: string | null

  // Metadados
  description: string
  metadata: Record<string, any> | null
  createdAt: Date
}
```

**Funções implementadas:**
- ✅ `createCreditTransaction(data)` - Cria transação
- ✅ `getCreditTransactionHistory(userId, limit)` - Histórico

**Regras de negócio:**
- ✅ Criar transação para TODA movimentação
- ✅ Calcular balanceAfterTransaction
- ✅ NUNCA deletar (histórico permanente)

**Indexes criados:**
- ✅ `userId + createdAt DESC`
- ✅ `imageGenerationId`

---

### 1.5 ✅ Collection: `generations` (NOVA)

**Arquivo:** [src/lib/firestore-credits.ts](src/lib/firestore-credits.ts) (linhas 109-139)

**Estrutura completa:**
```typescript
interface Generation {
  id: string
  userId: string

  // Input
  prompt: string
  style: string

  // Output
  imageUrl: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'

  // Créditos
  creditsConsumed: number
  sourceType: 'subscription' | 'credit_pack'
  sourceId: string

  // Timestamps
  createdAt: Date
  completedAt: Date | null
  failedAt: Date | null

  // Error handling
  errorMessage: string | null
}
```

**Funções implementadas:**
- ✅ `createGeneration(data)` - Cria geração (status: pending)
- ✅ `updateGeneration(id, data)` - Atualiza geração
- ✅ `getUserGenerations(userId, limit)` - Histórico

**Regras de negócio:**
- ✅ Status inicial: 'pending'
- ✅ Consumir créditos ANTES de processar
- ✅ Se falha, fazer refund automaticamente
- ✅ Registrar fonte que forneceu o crédito

**Indexes criados:**
- ✅ `userId + createdAt DESC`
- ✅ `status`

---

### 1.6 ✅ Collection: `checkoutSessions` (NOVA)

**Arquivo:** [src/lib/firestore-credits.ts](src/lib/firestore-credits.ts) (linhas 144-167)

**Estrutura completa:**
```typescript
interface CheckoutSession {
  id: string
  stripeSessionId: string
  userId: string
  type: 'subscription' | 'credit_pack'

  // Dados
  planType?: 'trial' | 'basic' | 'pro'
  packType?: 'initial' | 'standard' | 'large'
  amount: number

  // Status
  status: 'pending' | 'completed' | 'expired' | 'canceled'

  // Timestamps
  createdAt: Date
  completedAt: Date | null
  expiresAt: Date
}
```

**Funções implementadas:**
- ✅ `createCheckoutSession(data)` - Cria sessão
- ✅ `getCheckoutSessionByStripeId(stripeSessionId)` - Busca por Stripe ID
- ✅ `updateCheckoutSession(id, data)` - Atualiza sessão

**Regras de negócio:**
- ✅ Criar ao gerar checkout
- ✅ Atualizar quando webhook confirmar
- ✅ Evitar processar pagamento duplicado
- ✅ Sessões expiram após 24h

**Indexes criados:**
- ✅ `stripeSessionId` (unique lookup)
- ✅ `userId + status`

---

## 📁 Arquivos Criados/Modificados

### ✅ Arquivos Criados
1. **[src/lib/firestore-credits.ts](src/lib/firestore-credits.ts)** - 556 linhas
   - Todos os tipos TypeScript
   - Todas as funções CRUD
   - Lógica de negócio integrada

2. **[ETAPA_1_ESTRUTURA_FIRESTORE.md](ETAPA_1_ESTRUTURA_FIRESTORE.md)** (este arquivo)
   - Documentação completa da estrutura

### ✅ Arquivos Modificados
1. **[src/lib/firestore.ts](src/lib/firestore.ts)**
   - Interface `User` expandida com campos Stripe
   - Manteve compatibilidade total

2. **[firestore.indexes.json](firestore.indexes.json)**
   - Adicionados 10 novos indexes compostos
   - Total: 17 indexes

---

## 🎯 Validação da Implementação

### ✅ Checklist de Qualidade

- [x] **Tipos TypeScript completos** para todas as collections
- [x] **Funções CRUD** implementadas para todas as collections
- [x] **Transações atômicas** (createSubscription cancela anterior)
- [x] **Cálculos automáticos** (creditsRemaining, balanceAfterTransaction)
- [x] **Timestamps automáticos** (serverTimestamp)
- [x] **Indexes otimizados** para todas as queries
- [x] **Regras de negócio** implementadas nas funções
- [x] **Documentação inline** em todos os tipos
- [x] **Compatibilidade** com código existente mantida

---

## 🚀 Próximos Passos

A estrutura Firestore está completa e pronta para:

1. **ETAPA 2:** Configurações e constantes (plans.ts)
2. **ETAPA 3:** Cloud Functions (consumo de créditos, webhooks)
3. **ETAPA 6:** Firestore Security Rules (proteção de dados)
4. **ETAPA 7:** Deploy dos indexes no Firebase

---

## 📊 Estatísticas

- **Collections criadas:** 5 novas
- **Collections expandidas:** 1 (users)
- **Tipos TypeScript:** 6 interfaces completas
- **Funções implementadas:** 16 funções
- **Indexes criados:** 10 novos (17 total)
- **Linhas de código:** ~556 linhas (firestore-credits.ts)

---

## ⚠️ Notas Importantes

1. **Indexes precisam ser deployados:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. **Security Rules serão implementadas na ETAPA 6**
   - Por enquanto, use regras básicas de desenvolvimento
   - Em produção, aplicar regras estritas

3. **Função helper disponível:**
   ```typescript
   import { updateUserStripeCustomerId } from '@/lib/firestore-credits'

   // Usar na primeira compra/assinatura
   await updateUserStripeCustomerId(userId, stripeCustomerId)
   ```

4. **Transações são atômicas:**
   - `createSubscription` usa `runTransaction` para garantir atomicidade
   - Previne race conditions ao cancelar assinatura anterior

---

## ✅ ETAPA 1 - CONCLUÍDA COM SUCESSO! 🎉

A estrutura de dados está 100% implementada e pronta para as próximas etapas.
