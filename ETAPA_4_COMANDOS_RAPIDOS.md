# ⚡ ETAPA 4 - Comandos Rápidos

Referência rápida para gerenciar os Cron Jobs.

---

## 🚀 Deploy Inicial

```bash
# 1. Build e deploy
cd functions
npm install
npm run build
firebase deploy --only functions:resetSubscriptionCredits,functions:expireCreditPacks

# 2. Configurar scheduler
cd scripts
chmod +x setup-cloud-scheduler.sh
./setup-cloud-scheduler.sh
```

---

## 👀 Monitoramento

```bash
# Ver logs em tempo real
firebase functions:log --only resetSubscriptionCredits,expireCreditPacks

# Ver logs específicos (últimos 50)
gcloud alpha functions logs read resetSubscriptionCredits --region=southamerica-east1 --limit=50
gcloud alpha functions logs read expireCreditPacks --region=southamerica-east1 --limit=50

# Ver logs com filtro de data
gcloud alpha functions logs read resetSubscriptionCredits \
  --region=southamerica-east1 \
  --start-time="2025-01-08T00:00:00Z"

# Listar jobs do scheduler
gcloud scheduler jobs list --location=southamerica-east1 --project=ktirio-ai

# Ver detalhes de um job
gcloud scheduler jobs describe reset-subscription-credits \
  --location=southamerica-east1 \
  --project=ktirio-ai
```

---

## 🧪 Testes

```bash
# Executar teste manual dos jobs
gcloud scheduler jobs run reset-subscription-credits \
  --location=southamerica-east1 \
  --project=ktirio-ai

gcloud scheduler jobs run expire-credit-packs \
  --location=southamerica-east1 \
  --project=ktirio-ai

# Rodar testes unitários
cd functions
npm test -- resetSubscriptionCredits
npm test -- expireCreditPacks
npm test  # Todos os testes
```

---

## ⚙️ Gerenciamento

```bash
# Pausar job (desabilitar temporariamente)
gcloud scheduler jobs pause reset-subscription-credits \
  --location=southamerica-east1 \
  --project=ktirio-ai

# Resumir job (reabilitar)
gcloud scheduler jobs resume reset-subscription-credits \
  --location=southamerica-east1 \
  --project=ktirio-ai

# Atualizar schedule de um job
gcloud scheduler jobs update pubsub reset-subscription-credits \
  --location=southamerica-east1 \
  --schedule="0 */2 * * *" \
  --project=ktirio-ai
  # (Este exemplo muda para a cada 2 horas)

# Deletar job
gcloud scheduler jobs delete reset-subscription-credits \
  --location=southamerica-east1 \
  --project=ktirio-ai \
  --quiet
```

---

## 🔄 Atualização de Código

```bash
# Após modificar o código:
cd functions
npm run build
firebase deploy --only functions:resetSubscriptionCredits,functions:expireCreditPacks

# Não precisa reconfigurar o Cloud Scheduler,
# os jobs continuam apontando para as novas versões
```

---

## 🗑️ Rollback Completo

```bash
# Deletar jobs do scheduler
gcloud scheduler jobs delete reset-subscription-credits \
  --location=southamerica-east1 \
  --project=ktirio-ai \
  --quiet

gcloud scheduler jobs delete expire-credit-packs \
  --location=southamerica-east1 \
  --project=ktirio-ai \
  --quiet

# Deletar functions
firebase functions:delete resetSubscriptionCredits
firebase functions:delete expireCreditPacks
```

---

## 🔍 Debugging

```bash
# Ver status de execução
gcloud scheduler jobs describe reset-subscription-credits \
  --location=southamerica-east1 \
  --format=json

# Ver logs com erro específico
gcloud alpha functions logs read resetSubscriptionCredits \
  --region=southamerica-east1 \
  --filter="severity=ERROR"

# Ver métricas de execução
gcloud monitoring time-series list \
  --filter='metric.type="cloudfunctions.googleapis.com/function/execution_count"'

# Verificar permissões
gcloud projects get-iam-policy ktirio-ai

# Verificar APIs habilitadas
gcloud services list --enabled --project=ktirio-ai | grep -i scheduler
gcloud services list --enabled --project=ktirio-ai | grep -i functions
```

---

## 📊 Queries no Firestore (Console)

```javascript
// Ver subscriptions que serão resetadas
db.collection('subscriptions')
  .where('status', '==', 'active')
  .where('nextResetDate', '<=', new Date())
  .get()

// Ver packs que serão expirados
db.collection('creditPacks')
  .where('isActive', '==', true)
  .where('expiresAt', '<=', new Date())
  .get()

// Ver últimas transactions
db.collection('creditTransactions')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get()
```

---

## 🌐 URLs Úteis

```
Firebase Console (Functions):
https://console.firebase.google.com/project/ktirio-ai/functions

Cloud Scheduler Console:
https://console.cloud.google.com/cloudscheduler?project=ktirio-ai

Cloud Logging:
https://console.cloud.google.com/logs/query?project=ktirio-ai

Firestore Console:
https://console.firebase.google.com/project/ktirio-ai/firestore
```

---

## 🔔 Alertas (Opcional)

```bash
# Criar política de alerta para falhas
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cron Jobs Failed" \
  --condition-display-name="Function execution failed" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=60s \
  --aggregation-alignment-period=60s

# Listar canais de notificação disponíveis
gcloud alpha monitoring channels list
```

---

## 📝 Configurações Atuais

| Configuração | Valor |
|--------------|-------|
| **Projeto** | ktirio-ai |
| **Região** | southamerica-east1 |
| **Timezone** | America/Sao_Paulo |
| **Runtime** | Node.js 18 |
| **Reset Schedule** | 0 * * * * (a cada hora) |
| **Expire Schedule** | 0 0 * * * (diariamente 00:00) |

---

## ⚡ One-Liners Úteis

```bash
# Ver próxima execução dos jobs
gcloud scheduler jobs list --location=southamerica-east1 --format="table(name,schedule,state,lastAttemptTime,nextScheduleTime)"

# Ver logs das últimas 24h com timestamps
gcloud alpha functions logs read resetSubscriptionCredits \
  --region=southamerica-east1 \
  --start-time=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S)Z

# Contar execuções bem-sucedidas hoje
gcloud alpha functions logs read resetSubscriptionCredits \
  --region=southamerica-east1 \
  --start-time=$(date -u +%Y-%m-%d)T00:00:00Z \
  | grep "completed" | wc -l

# Export de configuração de job para backup
gcloud scheduler jobs describe reset-subscription-credits \
  --location=southamerica-east1 \
  --format=json > backup-reset-job.json
```

---

**Última atualização:** 2025-10-08
**Versão:** 1.0.0
