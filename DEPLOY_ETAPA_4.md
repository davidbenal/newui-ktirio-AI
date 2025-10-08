# 🚀 Deploy ETAPA 4 - Cron Jobs

## Guia Rápido de Deployment

---

## Pré-requisitos

- ✅ Firebase CLI instalado (`npm install -g firebase-tools`)
- ✅ Autenticado (`firebase login`)
- ✅ ETAPA 3 já deployada
- ✅ Google Cloud SDK instalado (`gcloud`)

---

## Passo a Passo

### 1️⃣ Build e Deploy das Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions:resetSubscriptionCredits,functions:expireCreditPacks
```

**Output esperado:**
```
✔  functions[resetSubscriptionCredits(southamerica-east1)] Successful create operation.
✔  functions[expireCreditPacks(southamerica-east1)] Successful create operation.

✔  Deploy complete!
```

---

### 2️⃣ Configurar Cloud Scheduler

```bash
cd scripts
chmod +x setup-cloud-scheduler.sh
./setup-cloud-scheduler.sh
```

**Ou manualmente:**

```bash
# Habilitar API
gcloud services enable cloudscheduler.googleapis.com --project=ktirio-ai

# Job 1: A cada hora
gcloud scheduler jobs create pubsub reset-subscription-credits \
  --location=southamerica-east1 \
  --schedule="0 * * * *" \
  --time-zone="America/Sao_Paulo" \
  --topic=firebase-schedule-resetSubscriptionCredits-southamerica-east1 \
  --message-body='{"scheduled":true}' \
  --project=ktirio-ai

# Job 2: Diariamente
gcloud scheduler jobs create pubsub expire-credit-packs \
  --location=southamerica-east1 \
  --schedule="0 0 * * *" \
  --time-zone="America/Sao_Paulo" \
  --topic=firebase-schedule-expireCreditPacks-southamerica-east1 \
  --message-body='{"scheduled":true}' \
  --project=ktirio-ai
```

---

### 3️⃣ Verificar Jobs Criados

```bash
gcloud scheduler jobs list --location=southamerica-east1 --project=ktirio-ai
```

**Output esperado:**
```
ID                          LOCATION              SCHEDULE (TZ)              TARGET_TYPE  STATE
reset-subscription-credits  southamerica-east1    0 * * * * (America/Sao_Paulo)  Pub/Sub      ENABLED
expire-credit-packs         southamerica-east1    0 0 * * * (America/Sao_Paulo)  Pub/Sub      ENABLED
```

---

### 4️⃣ Testar Execução Manual

```bash
# Testar reset de subscriptions
gcloud scheduler jobs run reset-subscription-credits \
  --location=southamerica-east1 \
  --project=ktirio-ai

# Testar expiração de packs
gcloud scheduler jobs run expire-credit-packs \
  --location=southamerica-east1 \
  --project=ktirio-ai
```

---

### 5️⃣ Verificar Logs

```bash
# Logs em tempo real
firebase functions:log --only resetSubscriptionCredits,expireCreditPacks

# Ou via gcloud (últimos logs)
gcloud alpha functions logs read resetSubscriptionCredits \
  --region=southamerica-east1 \
  --limit=50

gcloud alpha functions logs read expireCreditPacks \
  --region=southamerica-east1 \
  --limit=50
```

---

## ✅ Checklist de Validação

### Após Deploy:

- [ ] Funções aparecem no Firebase Console
  - https://console.firebase.google.com/project/ktirio-ai/functions

- [ ] Jobs aparecem no Cloud Scheduler
  - https://console.cloud.google.com/cloudscheduler?project=ktirio-ai

- [ ] Teste manual executou sem erros
  - Verificar logs para confirmar

- [ ] Subscriptions de teste foram resetadas
  - Verificar no Firestore

- [ ] Packs expirados foram marcados como inativos
  - Verificar no Firestore

---

## 🧪 Testes Recomendados

### Teste 1: Reset de Subscription

1. Criar subscription de teste no Firestore:
```javascript
{
  userId: "test-user-123",
  status: "active",
  monthlyCredits: 1000,
  creditsUsedCurrentPeriod: 500,
  creditsRemainingCurrentPeriod: 500,
  billingCycleStart: <agora - 31 dias>,
  billingCycleEnd: <agora - 1 dia>,
  nextResetDate: <agora - 1 dia>
}
```

2. Executar job manualmente
3. Verificar que:
   - `creditsUsedCurrentPeriod = 0`
   - `creditsRemainingCurrentPeriod = 1000`
   - `billingCycleStart` foi atualizado
   - `nextResetDate` é +30 dias
   - `creditTransaction` foi criado

### Teste 2: Expiração de Pack

1. Criar pack de teste no Firestore:
```javascript
{
  userId: "test-user-123",
  credits: 500,
  creditsRemaining: 200,
  isActive: true,
  expiresAt: <agora - 1 dia>,
  createdAt: <agora - 90 dias>
}
```

2. Executar job manualmente
3. Verificar que:
   - `isActive = false`
   - Campo `expiredAt` foi adicionado
   - `totalCredits` do usuário foi reduzido em 200
   - `creditTransaction` foi criado

---

## 📊 Monitoramento Contínuo

### Cloud Console
- **Functions:** https://console.firebase.google.com/project/ktirio-ai/functions
- **Scheduler:** https://console.cloud.google.com/cloudscheduler?project=ktirio-ai
- **Logs:** https://console.cloud.google.com/logs/query?project=ktirio-ai

### Métricas para Acompanhar
- Quantidade de subscriptions resetadas por hora
- Quantidade de packs expirados por dia
- Taxa de erro das execuções
- Tempo médio de execução

---

## ⚠️ Troubleshooting

### Erro: "Permission denied"
```bash
# Verificar permissões
gcloud projects get-iam-policy ktirio-ai
```

### Erro: "API not enabled"
```bash
# Habilitar APIs necessárias
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
```

### Job não está executando
```bash
# Verificar status
gcloud scheduler jobs describe reset-subscription-credits \
  --location=southamerica-east1

# Pausar e resumir
gcloud scheduler jobs pause reset-subscription-credits \
  --location=southamerica-east1

gcloud scheduler jobs resume reset-subscription-credits \
  --location=southamerica-east1
```

### Logs não aparecem
```bash
# Verificar se função foi invocada
gcloud alpha functions logs read resetSubscriptionCredits \
  --region=southamerica-east1 \
  --start-time="2025-01-08T00:00:00Z"
```

---

## 🔄 Rollback (Se Necessário)

```bash
# Deletar jobs do scheduler
gcloud scheduler jobs delete reset-subscription-credits \
  --location=southamerica-east1 \
  --quiet

gcloud scheduler jobs delete expire-credit-packs \
  --location=southamerica-east1 \
  --quiet

# Deletar functions
firebase functions:delete resetSubscriptionCredits
firebase functions:delete expireCreditPacks
```

---

## 📝 Notas Importantes

1. **Timezone:** Todos os jobs usam `America/Sao_Paulo`
2. **Região:** Todas as funções estão em `southamerica-east1`
3. **Batching:** `expireCreditPacks` processa até 500 packs por batch
4. **Transações:** `resetSubscriptionCredits` usa transactions para consistência

---

## ✨ Próximos Passos

Após deployment bem-sucedido:

1. ✅ Configurar alertas no Cloud Monitoring
2. ✅ Criar dashboard de métricas
3. ✅ Documentar runbook para equipe de ops
4. ✅ Configurar notificações de erro via email/Slack

---

**Deploy Date:** 2025-10-08
**Status:** Ready for Production
