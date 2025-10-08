# 🚀 GUIA DE DEPLOY COMPLETO - SISTEMA DE CRÉDITOS

## 📋 Pré-requisitos

- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Google Cloud SDK instalado
- [ ] Autenticado no Firebase (`firebase login`)
- [ ] Autenticado no gcloud (`gcloud auth login`)
- [ ] Conta Stripe configurada
- [ ] Produtos e prices criados no Stripe

---

## 1️⃣ PREPARAÇÃO

### 1.1 Verificar Projeto

```bash
# Ver projeto atual
firebase projects:list

# Selecionar projeto correto
firebase use ktirio-ai-4540c
```

### 1.2 Instalar Dependências

```bash
# Backend
cd functions
npm install

# Frontend
cd ..
npm install
```

---

## 2️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE

### 2.1 Firebase Functions

```bash
# Stripe Keys
firebase functions:config:set \
  stripe.secret_key="sk_live_..." \
  stripe.webhook_secret="TEMP_VALUE"

# App URL
firebase functions:config:set app.url="https://ktirio.ai"

# Verificar
firebase functions:config:get
```

> **Nota:** O `webhook_secret` será atualizado depois do deploy

### 2.2 Frontend (.env.local)

Criar arquivo `.env.local` na raiz:

```bash
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=ktirio-ai-4540c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ktirio-ai-4540c
VITE_FIREBASE_STORAGE_BUCKET=ktirio-ai-4540c.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=626628151805
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App
VITE_APP_URL=https://ktirio.ai
```

---

## 3️⃣ BUILD E TESTES LOCAIS

### 3.1 Build Functions

```bash
cd functions
npm run build
```

**Verificar:** Não deve ter erros de TypeScript

### 3.2 Build Frontend

```bash
cd ..
npm run build
```

**Verificar:** Build bem-sucedido em `dist/`

### 3.3 Testar Localmente (Opcional)

```bash
# Terminal 1: Emulators
firebase emulators:start

# Terminal 2: Frontend dev
npm run dev
```

---

## 4️⃣ DEPLOY SEQUENCIAL

### 4.1 Firestore Rules

```bash
firebase deploy --only firestore:rules
```

**Verificar:**
```
✔  firestore: released rules firestore.rules to cloud.firestore
```

### 4.2 Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

**Verificar:**
```
✔  firestore: deployed indexes in firestore.indexes.json successfully
```

> **Nota:** Indexes podem levar alguns minutos para serem construídos

### 4.3 Cloud Functions

```bash
firebase deploy --only functions
```

**Funções deployadas:**
- ✅ `createSubscriptionCheckout`
- ✅ `createPackCheckout`
- ✅ `stripeWebhook`
- ✅ `getUserCredits`
- ✅ `consumeCredits`
- ✅ `createGeneration`
- ✅ `createCustomerPortalSession`
- ✅ `resetSubscriptionCredits`
- ✅ `expireCreditPacks`
- ✅ `onUserCreated`

**Verificar:**
```
✔  functions[...] Successful update operation.
```

**Copiar URLs:**
```
Function URL (stripeWebhook):
https://southamerica-east1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook
```

### 4.4 Cloud Scheduler

```bash
cd functions/scripts
chmod +x setup-cloud-scheduler.sh
./setup-cloud-scheduler.sh
```

**Verificar:**
```bash
gcloud scheduler jobs list --location=us-central1 --project=ktirio-ai-4540c
```

Deve mostrar:
- `firebase-schedule-resetSubscriptionCredits-southamerica-east1`
- `firebase-schedule-expireCreditPacks-southamerica-east1`

### 4.5 Frontend (Hosting)

```bash
firebase deploy --only hosting
```

**Verificar:**
```
✔  hosting: version created
✔  hosting: release complete
```

**URL:** https://ktirio-ai-4540c.web.app

---

## 5️⃣ CONFIGURAR STRIPE

### 5.1 Webhook Endpoint

1. Acessar: https://dashboard.stripe.com/webhooks
2. Click em **"Add endpoint"**
3. **Endpoint URL:**
   ```
   https://southamerica-east1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook
   ```
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click em **"Add endpoint"**

### 5.2 Copiar Signing Secret

1. No endpoint criado, click em **"Reveal"** no Signing secret
2. Copiar o valor (`whsec_...`)

### 5.3 Atualizar Firebase Config

```bash
firebase functions:config:set stripe.webhook_secret="whsec_SEU_SECRET_AQUI"

# Re-deploy functions
firebase deploy --only functions:stripeWebhook
```

### 5.4 Testar Webhook

No Stripe Dashboard, na página do webhook:

1. Click em **"Send test webhook"**
2. Selecionar `checkout.session.completed`
3. Click em **"Send test webhook"**

**Verificar logs:**
```bash
firebase functions:log --only stripeWebhook --lines 50
```

Deve mostrar que o webhook foi recebido com sucesso.

---

## 6️⃣ VALIDAÇÃO PÓS-DEPLOY

### 6.1 Testar Trial Automático

1. Criar novo usuário no Firebase Auth Console
   - ou registrar-se pelo app

2. Verificar no Firestore:
   - `users/{uid}` → `totalCredits: 10`
   - `subscriptions/{uid}_trial` → `status: 'trialing'`
   - `creditTransactions` → 1 transaction de `trial_created`

### 6.2 Testar Compra de Assinatura

1. Acessar `/pricing` no app
2. Click em **"Assinar"** em um plano
3. Usar card de teste: `4242 4242 4242 4242`
4. Completar checkout

**Verificar:**
- Redirect para `/checkout/success`
- Créditos atualizados
- Subscription criada no Firestore
- Email de confirmação do Stripe recebido

### 6.3 Testar Compra de Pacote

1. Acessar `/pricing`
2. Click em **"Comprar"** em um pacote
3. Completar checkout com card de teste

**Verificar:**
- Créditos adicionados
- CreditPack criado no Firestore
- Transaction registrada

### 6.4 Testar Consumo de Créditos

No código do app:

```typescript
import { useCredits } from './hooks/useCredits';

const { consumeCredits } = useCredits(userId);
await consumeCredits(1, 'Teste de consumo');
```

**Verificar:**
- Crédito decrementado
- Transaction criada
- Sidebar atualizado em tempo real

### 6.5 Testar Cron Jobs

#### Reset de Subscriptions

```bash
gcloud scheduler jobs run firebase-schedule-resetSubscriptionCredits-southamerica-east1 \
  --location=us-central1 \
  --project=ktirio-ai-4540c
```

**Ver logs:**
```bash
firebase functions:log --only resetSubscriptionCredits --lines 30
```

#### Expiração de Packs

```bash
gcloud scheduler jobs run firebase-schedule-expireCreditPacks-southamerica-east1 \
  --location=us-central1 \
  --project=ktirio-ai-4540c
```

**Ver logs:**
```bash
firebase functions:log --only expireCreditPacks --lines 30
```

---

## 7️⃣ MONITORAMENTO

### 7.1 Dashboards

**Firebase Console:**
- Functions: https://console.firebase.google.com/project/ktirio-ai-4540c/functions
- Firestore: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore
- Auth: https://console.firebase.google.com/project/ktirio-ai-4540c/authentication

**Google Cloud Console:**
- Scheduler: https://console.cloud.google.com/cloudscheduler?project=ktirio-ai-4540c
- Logs: https://console.cloud.google.com/logs/query?project=ktirio-ai-4540c

**Stripe Dashboard:**
- Payments: https://dashboard.stripe.com/payments
- Subscriptions: https://dashboard.stripe.com/subscriptions
- Webhooks: https://dashboard.stripe.com/webhooks

### 7.2 Logs em Tempo Real

```bash
# Todas as functions
firebase functions:log

# Function específica
firebase functions:log --only stripeWebhook

# Com filtro
firebase functions:log --only stripeWebhook | grep "ERROR"
```

### 7.3 Alertas Recomendados

Configurar no Google Cloud Monitoring:

1. **Webhook failures** (> 5% erro em 1h)
2. **Function timeouts** (> 10% timeout em 1h)
3. **Cron job failures** (qualquer falha)
4. **Low credits** (usuários com < 5 créditos)

---

## 8️⃣ ROLLBACK (SE NECESSÁRIO)

### 8.1 Functions

```bash
# Listar versões anteriores
firebase functions:list

# Rollback para versão anterior
firebase functions:delete FUNCTION_NAME
# Re-deploy versão anterior
```

### 8.2 Hosting

```bash
# Listar releases
firebase hosting:channel:list

# Rollback
firebase hosting:rollback
```

### 8.3 Firestore Rules

```bash
# Re-deploy versão anterior do arquivo
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules
```

---

## 9️⃣ TROUBLESHOOTING

### Problema: Function timeout

**Solução:**
```typescript
// No código da function, aumentar timeout
export const myFunction = functions
  .runWith({ timeoutSeconds: 300 }) // 5 minutos
  .https.onCall(...)
```

### Problema: Webhook não recebe eventos

**Checklist:**
- [ ] URL está correta
- [ ] Webhook está ativo no Stripe
- [ ] Events corretos selecionados
- [ ] Signing secret configurado
- [ ] Function deployada e funcionando

### Problema: Indexes não funcionam

```bash
# Ver status dos indexes
firebase firestore:indexes

# Re-deploy
firebase deploy --only firestore:indexes
```

### Problema: Cron não executa

```bash
# Ver status do job
gcloud scheduler jobs describe JOB_NAME --location=us-central1

# Pausar e resumir
gcloud scheduler jobs pause JOB_NAME --location=us-central1
gcloud scheduler jobs resume JOB_NAME --location=us-central1
```

---

## 🔟 CHECKLIST FINAL

### Pré-Deploy
- [ ] Código revisado e testado
- [ ] Environment variables configuradas
- [ ] Price IDs corretos em `pricing.ts`
- [ ] Build local sem erros

### Deploy
- [x] Firestore rules deployadas
- [x] Firestore indexes deployados
- [x] Cloud Functions deployadas
- [x] Cloud Scheduler configurado
- [x] Frontend deployado

### Stripe
- [ ] Webhook endpoint configurado
- [ ] Events corretos selecionados
- [ ] Signing secret configurado
- [ ] Webhook testado e funcionando

### Validação
- [ ] Trial automático funcionando
- [ ] Compra de assinatura funcionando
- [ ] Compra de pacote funcionando
- [ ] Consumo de créditos funcionando
- [ ] Cron jobs executando
- [ ] Logs sem erros críticos

### Monitoramento
- [ ] Dashboards acessíveis
- [ ] Alertas configurados
- [ ] Documentação atualizada
- [ ] Equipe treinada

---

## 📚 Referências

- **Documentação Completa:** [SISTEMA_CREDITOS_COMPLETO.md](SISTEMA_CREDITOS_COMPLETO.md)
- **ETAPA 3:** [ETAPA_3_RESUMO_FINAL.md](ETAPA_3_RESUMO_FINAL.md)
- **ETAPA 4:** [ETAPA_4_RESUMO_FINAL.md](ETAPA_4_RESUMO_FINAL.md)
- **ETAPA 5:** [ETAPA_5_RESUMO_FINAL.md](ETAPA_5_RESUMO_FINAL.md)
- **ETAPA 7 & 8:** [ETAPA_7_8_CONFIG_DEPLOY.md](ETAPA_7_8_CONFIG_DEPLOY.md)

---

**Status:** ✅ **GUIA COMPLETO DE DEPLOY**
**Última atualização:** 2025-10-08

---

## 🎉 Parabéns!

Se você chegou até aqui e completou todos os checkpoints, seu sistema de créditos está **100% deployado e funcional**!

**Próximos passos:**
1. Monitorar primeiros dias de uso
2. Coletar feedback dos usuários
3. Otimizar baseado em métricas reais
4. Implementar melhorias sugeridas

**Boa sorte! 🚀**
