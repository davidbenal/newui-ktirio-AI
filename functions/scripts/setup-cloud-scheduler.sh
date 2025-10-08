#!/bin/bash

# Script para configurar Cloud Scheduler Jobs
# Execute este script após fazer deploy das Cloud Functions

PROJECT_ID="ktirio-ai"
REGION="southamerica-east1"
TIMEZONE="America/Sao_Paulo"

echo "====================================="
echo "Setting up Cloud Scheduler for Ktirio AI"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "====================================="

# Verificar se o projeto está correto
echo ""
read -p "Confirmar projeto '$PROJECT_ID'? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Abortado pelo usuário."
    exit 1
fi

# 1. Ativar Cloud Scheduler API (se ainda não estiver ativa)
echo ""
echo "1. Habilitando Cloud Scheduler API..."
gcloud services enable cloudscheduler.googleapis.com --project=$PROJECT_ID

# 2. Criar job para resetSubscriptionCredits
echo ""
echo "2. Criando job 'reset-subscription-credits'..."
echo "   Frequência: A cada hora (0 * * * *)"

gcloud scheduler jobs create pubsub reset-subscription-credits \
  --location=$REGION \
  --schedule="0 * * * *" \
  --time-zone=$TIMEZONE \
  --topic=firebase-schedule-resetSubscriptionCredits-$REGION \
  --message-body='{"scheduled":true}' \
  --project=$PROJECT_ID \
  --description="Reset subscription credits for active subscriptions" \
  || echo "Job 'reset-subscription-credits' já existe ou erro ao criar"

# 3. Criar job para expireCreditPacks
echo ""
echo "3. Criando job 'expire-credit-packs'..."
echo "   Frequência: Diariamente às 00:00 (0 0 * * *)"

gcloud scheduler jobs create pubsub expire-credit-packs \
  --location=$REGION \
  --schedule="0 0 * * *" \
  --time-zone=$TIMEZONE \
  --topic=firebase-schedule-expireCreditPacks-$REGION \
  --message-body='{"scheduled":true}' \
  --project=$PROJECT_ID \
  --description="Expire inactive credit packs" \
  || echo "Job 'expire-credit-packs' já existe ou erro ao criar"

# 4. Listar todos os jobs criados
echo ""
echo "4. Jobs criados:"
echo "====================================="
gcloud scheduler jobs list --location=$REGION --project=$PROJECT_ID

echo ""
echo "====================================="
echo "Cloud Scheduler configurado com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Verificar os jobs no Console: https://console.cloud.google.com/cloudscheduler"
echo "2. Testar execução manual: gcloud scheduler jobs run JOB_NAME --location=$REGION"
echo "3. Monitorar logs: firebase functions:log"
echo "====================================="
