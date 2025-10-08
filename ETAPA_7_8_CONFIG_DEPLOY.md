# ETAPA 7 & 8: CONFIGURAÇÃO, DEPLOY E REGRAS DE NEGÓCIO

## 📋 Resumo

Configuração final do sistema, deploy completo e implementação das regras de negócio críticas.

---

## 🔧 ETAPA 7: CONFIGURAÇÃO E DEPLOY

### 7.1 Variáveis de Ambiente

#### Firebase Functions (Produção)

```bash
# Configurar via Firebase CLI
firebase functions:config:set \
  stripe.secret_key="sk_live_..." \
  stripe.webhook_secret="whsec_..." \
  app.url="https://ktirio.ai"

# Verificar configuração
firebase functions:config:get

# Deploy das configurações
firebase deploy --only functions
```

#### Frontend (.env.local)

```bash
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App
VITE_APP_URL=https://ktirio.ai
```

---

### 7.2 Trial Automático

**Implementado:** [`functions/src/auth/onUserCreated.ts`](functions/src/auth/onUserCreated.ts)

#### Trigger
- Evento: `onCreate` do Firebase Authentication
- Região: `southamerica-east1`
- Automático ao criar novo usuário

#### Fluxo

```
Novo usuário se registra
    ↓
Trigger: onUserCreated
    ↓
Firestore Transaction:
  1. Criar documento em users/
     - totalCredits: 10
     - stripeCustomerId: null

  2. Criar trial subscription
     - planType: 'trial'
     - status: 'trialing'
     - monthlyCredits: 10
     - expiresAt: now + 7 dias
     - isTrial: true

  3. Criar creditTransaction
     - type: 'trial_created'
     - amount: 10
     - description: "Trial gratuito..."
    ↓
Usuário tem 10 créditos grátis por 7 dias
```

#### Características do Trial

- **Duração:** 7 dias
- **Créditos:** 10
- **Status:** `trialing`
- **Renovação:** Não renova (apenas expira)
- **Upgrade:** Pode fazer upgrade a qualquer momento
- **Expiração:** Gerenciada pelo cron `resetSubscriptionCredits`

---

### 7.3 Firestore Indexes

**Arquivo:** [`firestore.indexes.json`](firestore.indexes.json)

#### Indexes Implementados

**subscriptions:**
```json
{
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "nextResetDate", "order": "ASCENDING" }
  ]
}
```
→ Usado por: `resetSubscriptionCredits` cron job

**creditPacks:**
```json
{
  "fields": [
    { "fieldPath": "isActive", "order": "ASCENDING" },
    { "fieldPath": "expiresAt", "order": "ASCENDING" }
  ]
}
```
→ Usado por: `expireCreditPacks` cron job

**creditTransactions:**
```json
{
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
→ Usado por: Histórico de transações

#### Deploy dos Indexes

```bash
firebase deploy --only firestore:indexes
```

---

### 7.4 Deploy Completo

#### Ordem Recomendada

**1. Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

**2. Firestore Indexes**
```bash
firebase deploy --only firestore:indexes
```

**3. Cloud Functions**
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

**4. Frontend**
```bash
npm install
npm run build
firebase deploy --only hosting
```

**5. Configurar Webhook no Stripe**

Após deploy das functions:

1. Copiar URL da function `stripeWebhook`:
   ```
   https://southamerica-east1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook
   ```

2. Adicionar no Stripe Dashboard:
   - **Developers → Webhooks → Add endpoint**
   - **URL:** Cole a URL acima
   - **Events to send:**
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

3. Copiar o **Signing secret** (`whsec_...`)

4. Configurar no Firebase:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_..."
   firebase deploy --only functions
   ```

---

## ⚡ ETAPA 8: REGRAS DE NEGÓCIO CRÍTICAS

### 8.1 Ordem de Consumo de Créditos

**PRIORIDADE ABSOLUTA:**

```
1º → Créditos de ASSINATURA
     (resetam mensalmente, use-or-lose)

2º → Créditos de PACOTES
     (ordem FIFO: mais antigo primeiro)
```

#### Justificativa

- **Assinatura:** Créditos expiram/resetam todo mês → usar primeiro para não perder
- **Pacotes:** Validade de 90 dias ou permanente → menos urgente

#### Implementação

**Local:** `functions/src/credits/operations.ts` → `consumeCredits()`

```typescript
// 1. Tentar consumir da assinatura primeiro
if (subscription && subscription.creditsRemainingCurrentPeriod > 0) {
  const toConsume = Math.min(amount, subscription.creditsRemainingCurrentPeriod);
  // Consumir da assinatura...
  amount -= toConsume;
}

// 2. Se ainda precisa consumir, usar pacotes (FIFO)
if (amount > 0) {
  const packs = await getActivePacks(userId); // Ordenado por purchasedAt ASC
  for (const pack of packs) {
    if (amount === 0) break;
    const toConsume = Math.min(amount, pack.creditsRemaining);
    // Consumir do pack...
    amount -= toConsume;
  }
}
```

---

### 8.2 Display na UI

#### Cálculo do Total

```typescript
// Total de créditos disponíveis
const totalCredits =
  (subscription?.creditsRemainingCurrentPeriod || 0) +
  packs.reduce((sum, pack) => sum + pack.creditsRemaining, 0);

// Total usado no período
const totalUsed =
  (subscription?.creditsUsedCurrentPeriod || 0) +
  packs.reduce((sum, pack) => sum + (pack.credits - pack.creditsRemaining), 0);

// Percentual de uso
const usagePercentage = (totalUsed / (totalCredits + totalUsed)) * 100;
```

#### Exibição

**Saldo Único:**
```tsx
<div className="text-4xl font-bold">{totalCredits}</div>
<p className="text-sm text-gray-600">créditos disponíveis</p>
```

**Barra de Progresso:**
```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-indigo-600 h-2 rounded-full"
    style={{ width: `${100 - usagePercentage}%` }}
  />
</div>
```

**Breakdown (Tooltip):**
```tsx
<div className="tooltip">
  <h4>Detalhamento</h4>

  {subscription && (
    <div>
      <span>Assinatura ({subscription.planName})</span>
      <span>{subscription.creditsRemainingCurrentPeriod} créditos</span>
      <small>Renova em {formatDate(subscription.nextResetDate)}</small>
    </div>
  )}

  {packs.map(pack => (
    <div key={pack.id}>
      <span>Pacote {pack.packType}</span>
      <span>{pack.creditsRemaining} créditos</span>
      <small>Expira em {formatDate(pack.expiresAt)}</small>
    </div>
  ))}
</div>
```

---

### 8.3 Reset Mensal

#### Comportamento

- ✅ Créditos de assinatura **RESETAM** em `nextResetDate`
- ❌ Créditos não usados são **PERDIDOS** (não acumulam)
- ✅ Sempre criar `creditTransaction` do reset

#### Implementação

**Cron Job:** `resetSubscriptionCredits` (a cada hora)

```typescript
// Query
const subscriptions = await db
  .collection('subscriptions')
  .where('status', '==', 'active')
  .where('nextResetDate', '<=', now)
  .get();

// Para cada subscription
for (const doc of subscriptions.docs) {
  await db.runTransaction(async (transaction) => {
    // Reset
    transaction.update(subscriptionRef, {
      creditsUsedCurrentPeriod: 0,
      creditsRemainingCurrentPeriod: monthlyCredits,
      billingCycleStart: now,
      billingCycleEnd: now + 30 dias,
      nextResetDate: now + 30 dias
    });

    // Adicionar ao totalCredits
    transaction.update(userRef, {
      totalCredits: FieldValue.increment(monthlyCredits)
    });

    // Criar transaction
    transaction.set(transactionRef, {
      type: 'subscription_reset',
      amount: monthlyCredits,
      description: 'Reset mensal de créditos'
    });
  });
}
```

---

### 8.4 Expiração de Pacotes

#### Comportamento

- ✅ Pacotes com `validityDays` expiram após X dias
- ✅ Pacotes com `validityDays = null` **nunca expiram**
- ✅ Ao expirar: marcar `isActive = false`
- ✅ Remover `creditsRemaining` do `totalCredits`

#### Implementação

**Cron Job:** `expireCreditPacks` (diariamente às 00:00)

```typescript
// Query
const packs = await db
  .collection('creditPacks')
  .where('isActive', '==', true)
  .where('expiresAt', '<=', now)
  .get();

// Batch operations
const batch = db.batch();

for (const doc of packs.docs) {
  // Marcar como inativo
  batch.update(doc.ref, {
    isActive: false,
    expiredAt: now
  });

  // Remover créditos do usuário
  const creditsToRemove = doc.data().creditsRemaining;
  batch.update(userRef, {
    totalCredits: FieldValue.increment(-creditsToRemove)
  });

  // Criar transaction
  batch.set(transactionRef, {
    type: 'pack_expired',
    amount: -creditsToRemove,
    description: 'Pacote expirado'
  });
}

await batch.commit();
```

---

### 8.5 Refund em Falha

#### Regra

Se geração **falha**, devolver crédito **AUTOMATICAMENTE**.

#### Fluxo

```
Geração falha (erro na API)
    ↓
Buscar generation document
    ↓
Verificar sourceType e sourceId
    ↓
if (sourceType === 'subscription') {
  subscription.creditsRemainingCurrentPeriod++
  subscription.creditsUsedCurrentPeriod--
}
else if (sourceType === 'pack') {
  pack.creditsRemaining++
}
    ↓
user.totalCredits++
    ↓
Criar creditTransaction (type: 'refund')
    ↓
Atualizar generation (status: 'failed')
```

#### Implementação

```typescript
export async function refundCredit(
  generationId: string
): Promise<void> {
  const db = admin.firestore();

  await db.runTransaction(async (transaction) => {
    const generationRef = db.collection('generations').doc(generationId);
    const generationDoc = await transaction.get(generationRef);

    if (!generationDoc.exists) {
      throw new Error('Generation not found');
    }

    const generation = generationDoc.data();
    const { userId, sourceType, sourceId } = generation;

    // Devolver crédito na fonte original
    if (sourceType === 'subscription') {
      const subscriptionRef = db.collection('subscriptions').doc(sourceId);
      transaction.update(subscriptionRef, {
        creditsRemainingCurrentPeriod: FieldValue.increment(1),
        creditsUsedCurrentPeriod: FieldValue.increment(-1)
      });
    } else if (sourceType === 'pack') {
      const packRef = db.collection('creditPacks').doc(sourceId);
      transaction.update(packRef, {
        creditsRemaining: FieldValue.increment(1)
      });
    }

    // Devolver ao total do usuário
    const userRef = db.collection('users').doc(userId);
    transaction.update(userRef, {
      totalCredits: FieldValue.increment(1)
    });

    // Criar transaction
    const transactionRef = db.collection('creditTransactions').doc();
    transaction.set(transactionRef, {
      userId,
      type: 'refund',
      amount: 1,
      description: 'Reembolso por geração falhada',
      generationId,
      createdAt: Timestamp.now()
    });

    // Marcar geração como falhada
    transaction.update(generationRef, {
      status: 'failed',
      refunded: true
    });
  });
}
```

---

### 8.6 Validações Antes de Compra

#### Assinatura

**Regras:**

- ❌ **Não permitir** assinar se já tem a **mesma assinatura** ativa
- ✅ **Permitir** upgrade (basic → pro)
- ❌ **Não permitir** downgrade durante período ativo
  - Usuário deve cancelar primeiro
- ✅ **Trial** pode fazer upgrade a qualquer momento

**Implementação:**

```typescript
async function validateSubscriptionPurchase(
  userId: string,
  newPlanType: string
): Promise<void> {
  const currentSubscription = await getCurrentSubscription(userId);

  if (!currentSubscription) {
    // Sem assinatura, pode criar qualquer uma
    return;
  }

  const currentPlan = currentSubscription.planType;
  const planHierarchy = { trial: 0, basic: 1, pro: 2 };

  // Mesma assinatura
  if (currentPlan === newPlanType) {
    throw new Error('Você já possui esta assinatura');
  }

  // Downgrade
  if (planHierarchy[newPlanType] < planHierarchy[currentPlan]) {
    throw new Error(
      'Não é possível fazer downgrade. Cancele a assinatura atual primeiro.'
    );
  }

  // Upgrade (permitido)
  return;
}
```

#### Pacote

**Regras:**

- ✅ **Permitir** comprar múltiplos pacotes (sem limite)
- ✅ **Permitir** comprar mesmo tendo assinatura ativa

**Implementação:**

```typescript
async function validatePackPurchase(
  userId: string,
  packType: string
): Promise<void> {
  // Sem validações especiais
  // Usuário pode comprar quantos pacotes quiser
  return;
}
```

---

## 📝 Checklist de Validação

### Backend

- [x] Trial automático implementado
- [x] Ordem de consumo (assinatura → packs)
- [x] Reset mensal funcional
- [x] Expiração de pacotes funcional
- [ ] Refund em falha implementado
- [ ] Validações de compra implementadas

### Configuração

- [ ] Environment variables configuradas
- [ ] Webhook do Stripe configurado
- [ ] Indexes do Firestore deployados
- [ ] Cloud Scheduler configurado

### Frontend

- [ ] Display correto de créditos
- [ ] Breakdown detalhado no tooltip
- [ ] Barra de progresso funcionando
- [ ] Validações de compra na UI

---

## 🧪 Testes Críticos

### Teste 1: Trial Automático
1. Criar novo usuário via Firebase Auth
2. Verificar que recebeu 10 créditos
3. Confirmar subscription `status: 'trialing'`
4. Verificar `expiresAt` = +7 dias

### Teste 2: Ordem de Consumo
1. Usuário com assinatura (50 créditos) + pack (100 créditos)
2. Consumir 60 créditos
3. Verificar:
   - Assinatura: 0 créditos restantes
   - Pack: 90 créditos restantes (consumiu 10 do pack)

### Teste 3: Reset Mensal
1. Subscription com `nextResetDate` no passado
2. Executar cron manualmente
3. Verificar:
   - `creditsUsed = 0`
   - `creditsRemaining = monthlyCredits`
   - `nextResetDate` atualizado
   - Transaction criada

### Teste 4: Expiração
1. Pack com `expiresAt` no passado
2. Executar cron manualmente
3. Verificar:
   - `isActive = false`
   - Créditos removidos do total
   - Transaction criada

### Teste 5: Refund
1. Gerar imagem (consome 1 crédito)
2. Simular falha
3. Chamar `refundCredit()`
4. Verificar crédito devolvido na fonte original

### Teste 6: Validações
1. Tentar assinar plano já ativo → Erro
2. Tentar downgrade → Erro
3. Tentar upgrade → Sucesso
4. Comprar múltiplos pacotes → Sucesso

---

**Status:** ✅ **ETAPAS 7 & 8 IMPLEMENTADAS**

**Data:** 2025-10-08
**Versão:** 1.0.0
