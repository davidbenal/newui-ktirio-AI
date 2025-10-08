# ETAPA 3: STATUS DO DEPLOYMENT

## ✅ FUNÇÕES IMPLANTADAS COM SUCESSO

Todas as 7 Cloud Functions foram deployadas e estão **ATIVAS** no Firebase:

| Função | Tipo | URL | Status |
|--------|------|-----|--------|
| **createSubscriptionCheckout** | callable | `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/createSubscriptionCheckout` | ✅ ATIVA |
| **createPackCheckout** | callable | `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/createPackCheckout` | ✅ ATIVA |
| **stripeWebhook** | https | `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook` | ✅ ATIVA |
| **getUserCredits** | callable | `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/getUserCredits` | ✅ ATIVA |
| **consumeCredits** | callable | `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/consumeCredits` | ✅ ATIVA |
| **createGeneration** | callable | `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/createGeneration` | ✅ ATIVA |
| **createCustomerPortalSession** | callable | `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/createCustomerPortalSession` | ✅ ATIVA |

---

## ⚠️ QUESTÃO DE IAM PERMISSIONS

### O que aconteceu?
Durante o deployment, houve erros ao tentar definir permissões IAM "allUsers":

```
Error: One or more users named in the policy do not belong to a permitted customer.
User allUsers is not in permitted organization.
```

### Por que aconteceu?
A organização Google Cloud do projeto tem uma **política de restrição** que impede conceder acesso público ("allUsers") a Cloud Functions.

### Isso é um problema?

**NÃO para funções callable (6 funções):**
- ✅ Funções callable funcionam com **Firebase Auth tokens**
- ✅ Frontend autenticado consegue chamar as funções normalmente
- ✅ Segurança mantida através do `context.auth`

**SIM para webhook (1 função):**
- ⚠️ `stripeWebhook` precisa ser acessível publicamente para o Stripe
- ⚠️ Atualmente pode estar bloqueada pela política da organização

---

## 🔧 SOLUÇÃO PARA O WEBHOOK

### Opção 1: Configurar IAM via Console (RECOMENDADO)
1. Acesse [Google Cloud Console - Cloud Functions](https://console.cloud.google.com/functions/list?project=ktirio-ai-4540c)
2. Clique na função `stripeWebhook`
3. Vá para aba **PERMISSIONS**
4. Clique **ADD PRINCIPAL**
5. Principal: `allUsers`
6. Role: `Cloud Functions Invoker`
7. Salvar

### Opção 2: Usar gcloud CLI
```bash
gcloud functions add-iam-policy-binding stripeWebhook \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=ktirio-ai-4540c
```

### Opção 3: Contatar Administrador da Organização
Se as opções acima falharem devido à política da organização, entre em contato com o administrador para:
- Criar exceção para a função `stripeWebhook`
- Ou ajustar a política de restrições do projeto

---

## 📋 PRÓXIMOS PASSOS

### 1. Testar Funções Callable (Frontend)
As funções callable já podem ser testadas do frontend com usuário autenticado:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions'

const functions = getFunctions()

// Exemplo: Get user credits
const getUserCredits = httpsCallable(functions, 'getUserCredits')
const result = await getUserCredits()
console.log(result.data)

// Exemplo: Create subscription checkout
const createCheckout = httpsCallable(functions, 'createSubscriptionCheckout')
const { data } = await createCheckout({ planType: 'basic' })
window.location.href = data.checkoutUrl
```

### 2. Configurar Webhook no Stripe Dashboard

⚠️ **IMPORTANTE:** Só configure o webhook DEPOIS de resolver as permissões IAM da função `stripeWebhook`

**Passos:**
1. Acesse [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Clique **Add endpoint**
3. **Endpoint URL:**
   ```
   https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook
   ```
4. **Events to send:** Selecione os 5 eventos:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `payment_intent.succeeded`
5. Clique **Add endpoint**
6. **COPIE O SIGNING SECRET** (começa com `whsec_...`)

### 3. Atualizar Webhook Secret no Firebase

Após copiar o Signing Secret do Stripe:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_SEU_SECRET_AQUI"
firebase deploy --only functions
```

### 4. Testar Webhook

Teste o webhook enviando eventos de teste do Stripe Dashboard:
1. Stripe Dashboard → Developers → Webhooks
2. Clique no endpoint criado
3. Aba **Send test webhook**
4. Escolha um evento (ex: `checkout.session.completed`)
5. Clique **Send test event**
6. Verifique logs: `firebase functions:log`

---

## 🔍 DEBUGGING

### Ver logs das funções
```bash
# Todos os logs
firebase functions:log

# Logs específicos de uma função
firebase functions:log --only stripeWebhook

# Logs em tempo real
firebase functions:log --follow
```

### Verificar configuração
```bash
firebase functions:config:get
```

### Listar funções deployadas
```bash
firebase functions:list
```

---

## ✅ RESUMO DO QUE FOI FEITO

### ETAPA 2 ✅
- ✅ Arquivo `functions/src/config/plans.ts` criado com todas as constantes
- ✅ 5 Price IDs do Stripe mapeados corretamente
- ✅ Script de validação criado e executado com sucesso
- ✅ Guia `ETAPA_2_CONFIGURACAO_STRIPE.md` criado

### ETAPA 3 ✅
- ✅ Dependências Stripe instaladas
- ✅ 7 Cloud Functions implementadas:
  - ✅ `functions/src/credits/index.ts` (createSubscriptionCheckout, createPackCheckout)
  - ✅ `functions/src/credits/webhook.ts` (stripeWebhook com 5 eventos)
  - ✅ `functions/src/credits/operations.ts` (getUserCredits, consumeCredits, createGeneration, createCustomerPortalSession)
- ✅ `functions/src/index.ts` atualizado com exports
- ✅ Build TypeScript passou sem erros
- ✅ Firebase Functions config definido com Stripe keys
- ✅ Deploy realizado com sucesso
- ✅ Todas as 7 funções estão ATIVAS no Firebase

### PENDENTE ⚠️
- ⚠️ Resolver permissões IAM da função `stripeWebhook` (organização bloqueando "allUsers")
- ⚠️ Configurar webhook no Stripe Dashboard (aguardando resolver IAM)
- ⚠️ Atualizar `stripe.webhook_secret` com o valor real do Stripe
- ⚠️ Testar funções callable do frontend
- ⚠️ Testar fluxo completo de pagamento

---

## 📊 ARQUITETURA IMPLEMENTADA

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│                                                              │
│  • Firebase Auth (Google, Email/Password)                   │
│  • Chamadas às Callable Functions                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLOUD FUNCTIONS (Node.js 18)              │
│                                                              │
│  CALLABLE (Auth Required):                                  │
│  • createSubscriptionCheckout → Stripe Checkout             │
│  • createPackCheckout → Stripe Checkout                     │
│  • getUserCredits → Firestore Query                         │
│  • consumeCredits → Firestore Transaction (FIFO)            │
│  • createGeneration → Consume + Create                      │
│  • createCustomerPortalSession → Stripe Portal              │
│                                                              │
│  HTTPS (Public):                                            │
│  • stripeWebhook → Processar eventos do Stripe              │
└──────────────┬────────────────────────────┬─────────────────┘
               │                            │
               ▼                            ▼
┌──────────────────────────┐   ┌─────────────────────────────┐
│   FIRESTORE DATABASE     │   │      STRIPE API             │
│                          │   │                             │
│  Collections:            │   │  • Checkout Sessions        │
│  • users                 │   │  • Subscriptions            │
│  • subscriptions         │   │  • Customer Portal          │
│  • creditPacks           │   │  • Webhooks                 │
│  • creditTransactions    │   │                             │
│  • checkoutSessions      │   │                             │
│  • generations           │   │                             │
└──────────────────────────┘   └─────────────────────────────┘
```

---

## 🚀 PRÓXIMA ETAPA: ETAPA 4

Após resolver as pendências acima, a próxima etapa será:

**ETAPA 4: Cron Jobs (Cloud Scheduler)**
- Verificação diária de pacotes de crédito expirados
- Renovação mensal de créditos de assinatura
- Limpeza de dados antigos
