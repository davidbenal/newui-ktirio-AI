# 🔧 ETAPA 2: CONFIGURAÇÃO STRIPE - GUIA PASSO A PASSO

## 📋 Visão Geral

Esta etapa configura:
1. ✅ Arquivo `plans.ts` com todas as constantes
2. ⚠️ Produtos e preços no Stripe Dashboard (você precisa fazer)
3. ⚠️ Webhook endpoint e secrets (você precisa fazer)

---

## ✅ PARTE 1: Arquivo de Configuração (CONCLUÍDO)

**Arquivo criado:** `functions/src/config/plans.ts`

### O que foi implementado:

- ✅ Constante `COST_PER_GENERATION` = R$ 0,21
- ✅ Objeto `PLANS` com Trial, Básico e Pro
- ✅ Objeto `CREDIT_PACKS` com Inicial, Padrão e Grande
- ✅ URLs de checkout (success, cancel, portal)
- ✅ Helper functions (formatPrice, validateStripeConfig, etc)

### Valores configurados:

**Planos:**
- Trial: 5 créditos, R$ 0 (grátis)
- Básico: 100 créditos/mês, R$ 49,90/mês
- Pro: 500 créditos/mês, R$ 259,90/mês

**Pacotes:**
- Inicial: 50 créditos, R$ 39,90 (expira em 90 dias)
- Padrão: 150 créditos, R$ 99,90 (expira em 120 dias)
- Grande: 300 créditos, R$ 179,90 (sem expiração)

---

## ⚠️ PARTE 2: Configurar Stripe Dashboard

### 📍 Passo 1: Acessar Stripe Dashboard

1. Vá para: https://dashboard.stripe.com
2. Faça login na sua conta
3. **IMPORTANTE:** Certifique-se que está em **modo TEST** primeiro (toggle no canto superior direito)

---

### 📦 Passo 2: Criar Produtos Recorrentes (Assinaturas)

#### 2A. Criar Produto "Ktírio Básico"

1. No dashboard, vá em **Products** → **Add product**
2. Preencha:
   ```
   Name: Ktírio Básico
   Description: Plano mensal com 100 gerações de imagem
   ```
3. Em **Pricing**:
   ```
   Pricing model: Standard pricing
   Price: 49.90
   Billing period: Monthly
   Currency: BRL (Brazilian Real)
   ```
4. Clique em **Add product**
5. **COPIE O PRICE ID** (formato: `price_xxxxxxxxxxxxx`)
6. Anote em algum lugar:
   ```
   PLANS.basic.stripePriceId = "price_xxxxxxxxxxxxx"
   ```

#### 2B. Criar Produto "Ktírio Pro"

1. Repita o processo acima com:
   ```
   Name: Ktírio Pro
   Description: Plano profissional com 500 gerações de imagem
   Price: 259.90
   Billing period: Monthly
   Currency: BRL
   ```
2. **COPIE O PRICE ID**
3. Anote:
   ```
   PLANS.pro.stripePriceId = "price_xxxxxxxxxxxxx"
   ```

---

### 📦 Passo 3: Criar Produtos One-Time (Pacotes)

#### 3A. Criar Produto "Pacote Inicial"

1. **Products** → **Add product**
2. Preencha:
   ```
   Name: Pacote Inicial
   Description: 50 créditos com validade de 90 dias
   ```
3. Em **Pricing**:
   ```
   Pricing model: Standard pricing
   Price: 39.90
   Billing period: One time (marque esta opção!)
   Currency: BRL
   ```
4. **COPIE O PRICE ID**
5. Anote:
   ```
   CREDIT_PACKS.initial.stripePriceId = "price_xxxxxxxxxxxxx"
   ```

#### 3B. Criar Produto "Pacote Padrão"

1. Repita com:
   ```
   Name: Pacote Padrão
   Description: 150 créditos com validade de 120 dias
   Price: 99.90
   Billing period: One time
   Currency: BRL
   ```
2. **COPIE O PRICE ID**
3. Anote:
   ```
   CREDIT_PACKS.standard.stripePriceId = "price_xxxxxxxxxxxxx"
   ```

#### 3C. Criar Produto "Pacote Grande"

1. Repita com:
   ```
   Name: Pacote Grande
   Description: 300 créditos sem expiração
   Price: 179.90
   Billing period: One time
   Currency: BRL
   ```
2. **COPIE O PRICE ID**
3. Anote:
   ```
   CREDIT_PACKS.large.stripePriceId = "price_xxxxxxxxxxxxx"
   ```

---

### 🔔 Passo 4: Configurar Webhook

⚠️ **IMPORTANTE:** Este passo só pode ser feito DEPOIS de deployar as Cloud Functions (ETAPA 3)

Por enquanto, anote que precisará:

1. Ir em **Developers** → **Webhooks** → **Add endpoint**
2. URL será:
   ```
   https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook
   ```
3. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Após criar, **COPIAR O SIGNING SECRET** (formato: `whsec_xxxxxxxxxxxxx`)

---

### 🔑 Passo 5: Obter Chaves da API

1. Vá em **Developers** → **API keys**
2. **COPIE:**
   - **Secret key** (sk_test_xxxxxxxxxxxxx) - para modo TEST
   - **Publishable key** (pk_test_xxxxxxxxxxxxx) - para frontend

⚠️ **NUNCA COMMITE ESSAS CHAVES NO GIT!**

---

### 💾 Passo 6: Salvar Configurações no Firebase

Depois de ter todos os IDs, execute:

```bash
# Ir para o diretório do projeto
cd "/Users/davidbenalcazarchang/Downloads/Ktirio AI __ App design (1)"

# Configurar chaves do Stripe (MODO TEST)
firebase functions:config:set \
  stripe.secret_key="sk_test_SUBSTITUA_AQUI" \
  stripe.publishable_key="pk_test_SUBSTITUA_AQUI" \
  stripe.webhook_secret="whsec_SUBSTITUA_AQUI" \
  app.url="http://localhost:5173"

# Ver configurações atuais
firebase functions:config:get
```

⚠️ **Para produção, repetir com chaves live (sk_live_, pk_live_, etc)**

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

### ✅ Arquivo plans.ts
- [x] Arquivo criado em `functions/src/config/plans.ts`
- [x] Constantes definidas (COST_PER_GENERATION, PLANS, CREDIT_PACKS)
- [x] Helper functions implementadas
- [ ] **Substituir stripePriceId** após criar produtos no Stripe

### ⚠️ Stripe Dashboard - Produtos
- [ ] Criar produto "Ktírio Básico" (R$ 49,90/mês)
- [ ] Criar produto "Ktírio Pro" (R$ 259,90/mês)
- [ ] Criar produto "Pacote Inicial" (R$ 39,90)
- [ ] Criar produto "Pacote Padrão" (R$ 99,90)
- [ ] Criar produto "Pacote Grande" (R$ 179,90)
- [ ] Copiar todos os Price IDs

### ⚠️ Stripe Dashboard - Webhook
- [ ] Deployar Cloud Functions (ETAPA 3 primeiro)
- [ ] Criar webhook endpoint
- [ ] Configurar eventos listados acima
- [ ] Copiar Signing Secret

### ⚠️ Firebase Config
- [ ] Executar `firebase functions:config:set` com todas as chaves
- [ ] Verificar com `firebase functions:config:get`
- [ ] Adicionar chaves ao `.env` do frontend (pk_test_xxx)

---

## 🔒 SEGURANÇA - VARIÁVEIS DE AMBIENTE

### Frontend (.env.local - NÃO COMMITAR)

```bash
# Criar arquivo .env.local na raiz do projeto
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### Firebase Functions

```bash
# Já configurado com firebase functions:config:set
# Acessível via: functions.config().stripe.secret_key
```

---

## 📊 RESUMO DOS PRICE IDs

Após criar todos os produtos, você terá algo assim:

```typescript
// Anotar aqui para facilitar depois:

PLANS.basic.stripePriceId = "price_________________"
PLANS.pro.stripePriceId = "price_________________"

CREDIT_PACKS.initial.stripePriceId = "price_________________"
CREDIT_PACKS.standard.stripePriceId = "price_________________"
CREDIT_PACKS.large.stripePriceId = "price_________________"

WEBHOOK_SECRET = "whsec_________________"
SECRET_KEY = "sk_test_________________"
PUBLISHABLE_KEY = "pk_test_________________"
```

---

## 🚀 PRÓXIMOS PASSOS

Depois de completar esta etapa:

1. ✅ Arquivo `plans.ts` está criado
2. ⚠️ **VOCÊ PRECISA:** Criar produtos no Stripe Dashboard
3. ⚠️ **VOCÊ PRECISA:** Atualizar `plans.ts` com os Price IDs reais
4. ⏭️ **DEPOIS:** Partir para ETAPA 3 (Cloud Functions)

---

## ❓ DÚVIDAS FREQUENTES

**Q: Preciso criar produtos em TEST e LIVE separadamente?**
A: Sim, os Price IDs são diferentes em cada modo.

**Q: Posso mudar os preços depois?**
A: No Stripe, você não edita um Price. Você cria um novo Price e atualiza o Price ID no `plans.ts`.

**Q: Como testar sem cartão real?**
A: Use cartões de teste do Stripe: `4242 4242 4242 4242`

**Q: Webhook pode esperar para depois?**
A: Sim, mas SEM webhook o sistema NÃO FUNCIONA. Configure na ETAPA 3.

---

## ✅ STATUS DA ETAPA 2

- ✅ **2.1 Arquivo plans.ts:** CONCLUÍDO
- ⚠️ **2.2 Configuração Stripe:** AGUARDANDO SUA AÇÃO

**Quando terminar de configurar o Stripe, me avise para prosseguir com a ETAPA 3!**
