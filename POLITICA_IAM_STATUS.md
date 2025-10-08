# Status da Política IAM para Webhook do Stripe

## ✅ Ações Completadas

1. **Política da organização atualizada no nível do projeto:**
   ```yaml
   name: projects/ktirio-ai-4540c/policies/iam.allowedPolicyMemberDomains
   spec:
     inheritFromParent: false
     rules:
     - allowAll: true
   ```

2. **Política efetiva confirmada:**
   ```
   allowAll: true
   ```

3. **Função webhook deployada:**
   - URL: `https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook`
   - Status: ACTIVE
   - Região: us-central1

## ⏳ Problema Atual

Apesar da política estar configurada corretamente, o comando para adicionar permissão pública ainda falha:

```bash
gcloud functions add-iam-policy-binding stripeWebhook \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"
```

**Erro:**
```
One or more users named in the policy do not belong to a permitted customer.
User allUsers is not in permitted organization.
```

## 🔍 Causa Provável

**Propagação de política:** As políticas de organização do Google Cloud podem levar de 5 a 15 minutos para propagar completamente através do sistema.

## 💡 Soluções Alternativas

### Opção 1: Aguardar propagação (Recomendado)
Aguarde 10-15 minutos e tente novamente:
```bash
gcloud functions add-iam-policy-binding stripeWebhook \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"
```

### Opção 2: Usar Console do Google Cloud
1. Acesse: https://console.cloud.google.com/functions/details/us-central1/stripeWebhook?project=ktirio-ai-4540c
2. Clique na aba "PERMISSIONS"
3. Clique em "ADD PRINCIPAL"
4. Em "New principals", digite: `allUsers`
5. Em "Select a role", escolha: "Cloud Functions Invoker"
6. Clique em "SAVE"

### Opção 3: Usar API REST diretamente
```bash
ACCESS_TOKEN=$(gcloud auth print-access-token)

curl -X POST \
  "https://cloudfunctions.googleapis.com/v1/projects/ktirio-ai-4540c/locations/us-central1/functions/stripeWebhook:setIamPolicy" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "policy": {
      "bindings": [
        {
          "role": "roles/cloudfunctions.invoker",
          "members": ["allUsers"]
        }
      ]
    }
  }'
```

### Opção 4: Remover completamente a política da organização
```bash
gcloud org-policies delete iam.allowedPolicyMemberDomains --project=ktirio-ai-4540c
```

## 🧪 Teste de Verificação

Após resolver as permissões, teste com:
```bash
curl -X POST https://us-central1-ktirio-ai-4540c.cloudfunctions.net/stripeWebhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Resultado esperado:** Não deve retornar `403 Forbidden`

## 📋 Próximos Passos

1. ⏳ Aguardar 10-15 minutos para propagação da política
2. 🔄 Tentar adicionar permissão `allUsers` novamente
3. ✅ Testar acesso público ao webhook
4. 🔗 Configurar webhook no Stripe Dashboard
5. 🔑 Atualizar webhook secret nas configurações do Firebase

## 🔗 Links Úteis

- [Função no Console](https://console.cloud.google.com/functions/details/us-central1/stripeWebhook?project=ktirio-ai-4540c)
- [Políticas da Organização](https://console.cloud.google.com/iam-admin/orgpolicies?project=ktirio-ai-4540c)
- [IAM Permissions](https://console.cloud.google.com/iam-admin/iam?project=ktirio-ai-4540c)

---

**Última atualização:** 2025-10-08 05:46 UTC
**Status:** Aguardando propagação de política (10-15 minutos)
