# ETAPA 4: CRON JOBS (CLOUD SCHEDULER)

## 📋 Resumo da Implementação

Sistema de jobs agendados para manutenção automática do sistema de créditos do Ktirio AI.

---

## 🔧 Funções Implementadas

### 1. `resetSubscriptionCredits`

**Tipo:** Scheduled Function (Cloud Scheduler)
**Trigger:** A cada hora (`0 * * * *`)
**Região:** `southamerica-east1`
**Timezone:** `America/Sao_Paulo`

#### Funcionalidade
Reseta automaticamente os créditos de subscriptions ativas quando o período de billing expira.

#### Fluxo de Execução
1. Busca subscriptions com:
   - `status = 'active'`
   - `nextResetDate <= now`

2. Para cada subscription (via Transaction):
   - Reseta `creditsUsedCurrentPeriod` para `0`
   - Recalcula `creditsRemainingCurrentPeriod = monthlyCredits`
   - Atualiza `billingCycleStart = now`
   - Atualiza `billingCycleEnd = now + 30 dias`
   - Atualiza `nextResetDate = now + 30 dias`
   - Adiciona créditos ao `totalCredits` do usuário
   - Cria `creditTransaction` com `type: 'subscription_reset'`

3. Logging detalhado:
   - Total de subscriptions processadas
   - Sucessos e falhas
   - Erros individuais

#### Tratamento de Erros
- Continua processando outras subscriptions se uma falhar
- Re-throw de erros críticos para registro no Cloud Scheduler
- Logging completo de cada operação

**Arquivo:** `functions/src/cron/resetSubscriptionCredits.ts`

---

### 2. `expireCreditPacks`

**Tipo:** Scheduled Function (Cloud Scheduler)
**Trigger:** Diariamente às 00:00 (`0 0 * * *`)
**Região:** `southamerica-east1`
**Timezone:** `America/Sao_Paulo`

#### Funcionalidade
Expira automaticamente pacotes de créditos que atingiram a data de expiração.

#### Fluxo de Execução
1. Busca creditPacks com:
   - `isActive = true`
   - `expiresAt <= now`
   - `expiresAt != null`

2. Para cada pack (via Batch):
   - Marca `isActive = false`
   - Adiciona campo `expiredAt = now`
   - Subtrai `creditsRemaining` do `totalCredits` do usuário
   - Cria `creditTransaction` com `type: 'pack_expired'`

3. Usa Firestore Batches para eficiência:
   - Máximo de 500 operações por batch
   - Cria múltiplos batches se necessário
   - Commit sequencial de todos os batches

4. Logging detalhado:
   - Total de packs expirados
   - Total de créditos removidos
   - Sucessos e falhas

#### Tratamento de Erros
- Continua processando outros packs se um falhar
- Re-throw de erros de commit para registro no Cloud Scheduler
- Logging completo de cada batch

**Arquivo:** `functions/src/cron/expireCreditPacks.ts`

---

## 📁 Estrutura de Arquivos

```
functions/
├── src/
│   ├── cron/
│   │   ├── resetSubscriptionCredits.ts   # Reset de subscriptions
│   │   ├── expireCreditPacks.ts          # Expiração de packs
│   │   └── __tests__/
│   │       ├── resetSubscriptionCredits.test.ts
│   │       └── expireCreditPacks.test.ts
│   └── index.ts                           # Export das funções
└── scripts/
    └── setup-cloud-scheduler.sh           # Script de configuração
```

---

## 🚀 Deploy e Configuração

### 1. Deploy das Cloud Functions

```bash
cd functions
npm run build
firebase deploy --only functions:resetSubscriptionCredits,functions:expireCreditPacks
```

### 2. Configurar Cloud Scheduler

#### Opção A: Script Automatizado (Recomendado)

```bash
cd functions/scripts
./setup-cloud-scheduler.sh
```

#### Opção B: Comandos Manuais

```bash
# Habilitar API
gcloud services enable cloudscheduler.googleapis.com --project=ktirio-ai

# Job 1: Reset de Subscriptions (a cada hora)
gcloud scheduler jobs create pubsub reset-subscription-credits \
  --location=southamerica-east1 \
  --schedule="0 * * * *" \
  --time-zone="America/Sao_Paulo" \
  --topic=firebase-schedule-resetSubscriptionCredits-southamerica-east1 \
  --message-body='{"scheduled":true}' \
  --project=ktirio-ai \
  --description="Reset subscription credits for active subscriptions"

# Job 2: Expiração de Packs (diariamente às 00:00)
gcloud scheduler jobs create pubsub expire-credit-packs \
  --location=southamerica-east1 \
  --schedule="0 0 * * *" \
  --time-zone="America/Sao_Paulo" \
  --topic=firebase-schedule-expireCreditPacks-southamerica-east1 \
  --message-body='{"scheduled":true}' \
  --project=ktirio-ai \
  --description="Expire inactive credit packs"
```

### 3. Verificar Jobs Criados

```bash
gcloud scheduler jobs list --location=southamerica-east1 --project=ktirio-ai
```

---

## 🧪 Testes

### Executar Testes Unitários

```bash
cd functions
npm test -- resetSubscriptionCredits
npm test -- expireCreditPacks
```

### Testar Execução Manual

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

### Monitorar Logs

```bash
# Logs em tempo real
firebase functions:log --only resetSubscriptionCredits,expireCreditPacks

# Ou via gcloud
gcloud alpha functions logs read resetSubscriptionCredits --region=southamerica-east1
gcloud alpha functions logs read expireCreditPacks --region=southamerica-east1
```

---

## 📊 Monitoramento

### Console do Firebase
1. Acesse: https://console.firebase.google.com/project/ktirio-ai/functions
2. Verifique execuções e erros
3. Analise métricas de performance

### Console do Cloud Scheduler
1. Acesse: https://console.cloud.google.com/cloudscheduler?project=ktirio-ai
2. Visualize histórico de execuções
3. Habilite/desabilite jobs

### Métricas Importantes
- **resetSubscriptionCredits:**
  - Quantidade de subscriptions resetadas por hora
  - Taxa de sucesso/falha
  - Tempo médio de execução

- **expireCreditPacks:**
  - Quantidade de packs expirados por dia
  - Total de créditos removidos
  - Taxa de sucesso/falha

---

## ⚠️ Tratamento de Erros

### resetSubscriptionCredits
- ✅ Continua processando se uma subscription falhar
- ✅ Log detalhado de erros individuais
- ✅ Transaction garante consistência dos dados
- ✅ Re-throw de erros críticos

### expireCreditPacks
- ✅ Continua processando se um pack falhar
- ✅ Batches de até 500 operações para eficiência
- ✅ Commit sequencial com tratamento de erros
- ✅ Re-throw de erros de batch

---

## 🔐 Permissões Necessárias

As Cloud Functions scheduladas precisam das seguintes permissões:

```
- cloudscheduler.googleapis.com (API habilitada)
- pubsub.publisher (para Cloud Scheduler)
- firestore.databases.documents.read
- firestore.databases.documents.write
```

Essas permissões já estão configuradas automaticamente para Cloud Functions.

---

## 📈 Próximos Passos

### Após Deploy:
1. ✅ Testar execução manual dos jobs
2. ✅ Configurar alertas no Cloud Monitoring
3. ✅ Verificar logs da primeira execução automática
4. ✅ Documentar métricas baseline

### Melhorias Futuras:
- [ ] Alertas automáticos via email/Slack
- [ ] Dashboard de métricas em tempo real
- [ ] Retry automático com backoff exponencial
- [ ] Dead letter queue para falhas persistentes

---

## 🆘 Troubleshooting

### Job não está executando
```bash
# Verificar status do job
gcloud scheduler jobs describe NOME_DO_JOB --location=southamerica-east1

# Verificar se a função foi deployada
firebase functions:list

# Verificar logs de erro
firebase functions:log --only NOME_FUNCAO
```

### Erros de permissão
```bash
# Verificar service account
gcloud projects get-iam-policy ktirio-ai

# Verificar se API está habilitada
gcloud services list --enabled --project=ktirio-ai
```

### Jobs executando mas não processando dados
1. Verificar logs da função para erros
2. Verificar queries do Firestore
3. Testar manualmente as queries no console
4. Verificar timezone e horários

---

## ✅ Checklist de Configuração

- [x] Cloud Functions deployadas
- [ ] Cloud Scheduler API habilitada
- [ ] Jobs criados no Cloud Scheduler
- [ ] Testes manuais executados com sucesso
- [ ] Logs verificados
- [ ] Alertas configurados (opcional)
- [ ] Documentação revisada
- [ ] Equipe treinada

---

**Status:** ✅ Implementação Completa
**Data:** 2025-10-08
**Versão:** 1.0.0
