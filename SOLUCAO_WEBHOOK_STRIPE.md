# Solução para Erro de Política IAM no Webhook do Stripe

## Problema
A organização Google Cloud tem uma política (`constraints/iam.allowedPolicyMemberDomains`) que impede funções públicas (`allUsers`).

**Erro:**
```
One or more users named in the policy do not belong to a permitted customer.
User allUsers is not in permitted organization.
```

## URL do Webhook
```
https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook
```

## Soluções Possíveis

### Opção 1: Modificar a Política da Organização (Recomendado)

1. **Acessar o Console do Google Cloud:**
   - Abra: https://console.cloud.google.com/iam-admin/orgpolicies?organizationId=391256297024

2. **Encontrar a política `Domain restricted sharing`:**
   - Procure por "Domain restricted sharing" ou `iam.allowedPolicyMemberDomains`

3. **Editar a política:**
   - Clique em "MANAGE POLICY"
   - Selecione "Customize"
   - Em "Policy values", adicione uma exceção:
     - Clique em "ADD RULE"
     - Selecione "Allow all"
     - Em "Condition", adicione:
       ```
       resource.matchTag("ktirio-ai-4540c/webhook", "true")
       ```

4. **Aplicar a política:**
   - Clique em "SAVE"

5. **Depois execute:**
   ```bash
   gcloud functions add-iam-policy-binding stripeWebhook \
     --region=us-central1 \
     --member="allUsers" \
     --role="roles/cloudfunctions.invoker"
   ```

### Opção 2: Usar API Gateway (Mais Complexo)

Criar um API Gateway que atua como proxy para a Cloud Function:
1. O API Gateway pode ter políticas de acesso mais flexíveis
2. Requer configuração adicional de OpenAPI

### Opção 3: Usar Cloud Run (Alternativa)

Migrar a função para Cloud Run, que tem políticas de IAM mais flexíveis:
```bash
# Permitir acesso público no Cloud Run
gcloud run services add-iam-policy-binding SERVICE_NAME \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

### Opção 4: Contatar Administrador da Organização

Se você não tem permissões suficientes, peça ao administrador da organização para:
1. Adicionar uma exceção para a função `stripeWebhook`
2. Permitir `allUsers` apenas para esta função específica

## Verificação

Após aplicar a solução, teste com:
```bash
curl -X POST https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook \
  -H "Content-Type: application/json" \
  -d '{"test": "true"}'
```

**Resposta esperada:** Não deve ser 403 Forbidden

## Próximos Passos

1. Resolver a política IAM usando uma das opções acima
2. Configurar o webhook no Stripe Dashboard:
   - URL: `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
3. Copiar o Webhook Secret do Stripe
4. Atualizar a configuração do Firebase:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_..."
   firebase deploy --only functions:stripeWebhook
   ```

## Status Atual

✅ Função `stripeWebhook` deployada com sucesso
✅ Código com verificação de assinatura implementada
❌ Acesso público bloqueado por política da organização
⏳ Aguardando modificação da política IAM

## Informações Adicionais

- **Projeto:** ktirio-ai-4540c
- **Organização:** 391256297024
- **Região:** us-central1
- **Administrador de Políticas:** david@ktirio3d.com
