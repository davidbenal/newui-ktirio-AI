# ✅ Configuração do Webhook do Stripe

## Status Atual

✅ **Cloud Function deployada e acessível publicamente**
- URL: `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook`
- Status: ACTIVE
- Permissões: Público (allUsers)
- Verificação de assinatura: Ativa

## Passo 1: Configurar Webhook no Stripe Dashboard

1. **Acesse o Stripe Dashboard:**
   - Vá para: https://dashboard.stripe.com/test/webhooks
   - (Use o modo **Test** para desenvolvimento)

2. **Criar novo webhook endpoint:**
   - Clique em "**Add endpoint**"
   - **Endpoint URL:** `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook`
   - **Description:** "Ktirio AI - Credit System Webhook"

3. **Selecionar eventos:**
   Marque os seguintes eventos:
   - ✅ `checkout.session.completed` - Quando pagamento é concluído
   - ✅ `customer.subscription.created` - Nova assinatura criada
   - ✅ `customer.subscription.updated` - Assinatura atualizada
   - ✅ `customer.subscription.deleted` - Assinatura cancelada
   - ✅ `invoice.payment_succeeded` - Pagamento de fatura bem-sucedido
   - ✅ `invoice.payment_failed` - Falha no pagamento

4. **Salvar e copiar Webhook Secret:**
   - Clique em "**Add endpoint**"
   - Após criar, clique no endpoint criado
   - Na seção "**Signing secret**", clique em "**Reveal**"
   - Copie o secret (formato: `whsec_...`)

## Passo 2: Atualizar Configuração do Firebase

Execute no terminal:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_SEU_SECRET_AQUI"
```

**Importante:** Substitua `whsec_SEU_SECRET_AQUI` pelo secret real que você copiou do Stripe!

## Passo 3: Redeploy da Função

```bash
firebase deploy --only functions:stripeWebhook
```

## Passo 4: Testar o Webhook

### Teste via Stripe Dashboard:
1. No Stripe Dashboard, vá para o webhook que você criou
2. Clique na aba "**Send test webhook**"
3. Selecione um evento (ex: `checkout.session.completed`)
4. Clique em "**Send test webhook**"

### Verificar Logs:
```bash
# Ver logs em tempo real
firebase functions:log --only stripeWebhook

# Ou via gcloud
gcloud functions logs read stripeWebhook --region=us-central1 --limit=50
```

**Logs esperados:**
```
🔔 Stripe webhook received
✅ Processing event: checkout.session.completed
✅ Credits added successfully
```

## Passo 5: Teste de Pagamento Real (Modo Test)

1. **Usar seu frontend para criar checkout:**
   - Execute o frontend localmente
   - Tente fazer uma compra de créditos ou assinatura

2. **Cartões de teste do Stripe:**
   - **Sucesso:** `4242 4242 4242 4242`
   - **Requer 3D Secure:** `4000 0027 6000 3184`
   - **Falha:** `4000 0000 0000 0002`
   - **Qualquer data futura** para expiração
   - **Qualquer CVV** de 3 dígitos

3. **Verificar resultado:**
   - Check nos logs da Cloud Function
   - Verificar no Firestore se os créditos foram adicionados:
     ```bash
     # Ver documento do usuário no Firestore
     # Console: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore
     ```

## Configuração Atual

### Webhook Secret Atual (PRECISA ATUALIZAR!)
```
whsec_SUBSTITUA_PELO_SECRET_DO_WEBHOOK
```

⚠️ **Atenção:** O secret atual é um placeholder. Você **DEVE** atualizá-lo com o secret real do Stripe!

### Eventos Processados pela Cloud Function

A função `stripeWebhook` atualmente processa:

1. **checkout.session.completed**
   - Adiciona créditos de pacote único
   - Ativa assinatura recorrente
   - Cria registro de transação

2. **customer.subscription.updated**
   - Atualiza status da assinatura
   - Renova créditos mensais

3. **customer.subscription.deleted**
   - Cancela assinatura
   - Remove créditos recorrentes

4. **invoice.payment_succeeded**
   - Renova créditos mensais para assinaturas

## Verificação de Segurança

✅ **Verificação de assinatura implementada** - Todas as requisições são validadas
✅ **HTTPS obrigatório** - Cloud Function usa HTTPS only
✅ **Idempotência** - Eventos duplicados são tratados corretamente
✅ **Logging completo** - Todos os eventos são registrados

## Troubleshooting

### Erro: "Webhook secret not configured"
```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase deploy --only functions:stripeWebhook
```

### Erro: "Invalid signature"
- Verifique se o webhook secret está correto
- Certifique-se de estar usando o secret do endpoint correto
- Modo Test e Live têm secrets diferentes!

### Erro: "No stripe-signature header"
- Normal em requisições diretas (não do Stripe)
- O webhook só aceita requisições autênticas do Stripe

### Créditos não sendo adicionados
1. Verificar logs da função
2. Verificar eventos no Stripe Dashboard
3. Verificar documento do usuário no Firestore
4. Verificar se o `userId` está sendo passado corretamente no `metadata` do checkout

## Links Úteis

- **Stripe Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Cloud Function Logs:** https://console.cloud.google.com/functions/details/us-central1/stripeWebhook?project=ktirio-ai-4540c&tab=logs
- **Firestore Console:** https://console.firebase.google.com/project/ktirio-ai-4540c/firestore
- **Stripe Events:** https://dashboard.stripe.com/test/events
- **Stripe API Logs:** https://dashboard.stripe.com/test/logs

---

**URL do Webhook:** `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook`

**Status:** ✅ Pronto para configuração
