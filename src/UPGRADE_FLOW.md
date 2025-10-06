# Fluxo Completo de Upgrade - Ktírio AI

Este documento descreve o fluxo completo de upgrade do Ktírio AI, desde o modal até o checkout do Stripe.

## 📊 Visão Geral do Fluxo

```
1. Usuário atinge limite → UpgradeModal aparece
2. Usuário seleciona plano → Clica em "Continuar para pagamento"
3. Modal cria checkout session → POST /api/create-checkout-session
4. API retorna checkout_url → Usuário é redirecionado para Stripe
5. Usuário completa pagamento → Stripe redireciona de volta
6. Success/Canceled page → Usuário volta para a plataforma
```

## 🎯 Componentes Envolvidos

### 1. UpgradeModal (`/components/UpgradeModal.tsx`)

Modal que aparece quando o usuário atinge um limite ou tenta acessar uma feature bloqueada.

**4 Contextos:**
- `credits` - Créditos acabaram
- `feature` - Feature bloqueada
- `projects` - Limite de projetos
- `trial` - Trial finalizado

**Props:**
```typescript
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: UpgradeModalContext;
  onContinue?: (planId: string, billingPeriod: 'monthly' | 'yearly') => void;
  onError?: (message: string) => void;
}
```

**Exemplo de uso:**
```tsx
<UpgradeModal
  isOpen={upgradeModalOpen}
  onClose={() => setUpgradeModalOpen(false)}
  context="credits"
  onContinue={(planId, billingPeriod) => {
    console.log('Plan selected:', planId, billingPeriod);
  }}
  onError={(message) => {
    showError('Erro no checkout', message);
  }}
/>
```

### 2. API Endpoints

#### a) Create Checkout Session (`/api/create-checkout-session.ts`)

Endpoint que cria a sessão de checkout no Stripe.

**Request:**
```json
{
  "planId": "starter" | "professional",
  "billingPeriod": "monthly" | "yearly",
  "successUrl": "https://app.ktirio.ai/upgrade/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://app.ktirio.ai/upgrade/canceled"
}
```

**Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_..."
}
```

#### b) Verify Checkout Session (`/api/verify-checkout-session.ts`)

Endpoint que verifica o status de uma sessão após o retorno do Stripe.

**Request:**
```json
{
  "sessionId": "cs_test_..."
}
```

**Response Success:**
```json
{
  "status": "success",
  "planId": "professional",
  "planName": "Professional",
  "billingPeriod": "monthly",
  "amount": 89.00,
  "currency": "BRL",
  "credits": 200,
  "customerEmail": "usuario@example.com",
  "timestamp": "2025-10-05T12:34:56.789Z"
}
```

**Response Pending:**
```json
{
  "status": "pending",
  "message": "Payment is still processing"
}
```

**Response Failed:**
```json
{
  "status": "failed",
  "error": "Invalid session ID"
}
```

### 3. UpgradeSuccess (`/components/UpgradeSuccess.tsx`)

Página completa exibida após o usuário completar o pagamento com sucesso.

**Features:**
- ✅ Verifica `session_id` da URL automaticamente
- ✅ Faz verificação da sessão via API do Stripe
- ✅ 3 estados: Loading, Success, Error
- ✅ Loading state com animação de verificação
- ✅ Success state com resumo do plano e benefícios
- ✅ Error state com instruções de recuperação
- ✅ Mostra valor pago, tipo de cobrança e créditos
- ✅ Email de confirmação exibido
- ✅ CTA para voltar à plataforma

**Estados:**

**Loading:**
- Ícone de loader animado
- Lista de etapas de verificação
- Mensagem de aguardo

**Success:**
- Ícone de sucesso verde
- Resumo do plano ativado
- Card com valor pago e detalhes
- Lista de benefícios desbloqueados
- Botão "Começar a usar"

**Error:**
- Ícone de erro vermelho
- Mensagem de erro específica
- Instruções do que fazer
- Botão "Tentar novamente"
- Botão "Voltar para a plataforma"

### 4. UpgradeCanceled (`/components/UpgradeCanceled.tsx`)

Página completa exibida quando o usuário cancela o checkout no Stripe.

**Features:**
- ✅ Ícone XCircle vermelho (64px)
- ✅ Mensagem neutra de cancelamento
- ✅ Info card explicando que nada foi cobrado
- ✅ Botão "Tentar novamente" (abre Upgrade Modal novamente)
- ✅ Botão "Voltar ao app" (retorna para Gallery)
- ✅ Footer com contato de suporte
- ✅ Mesmo design system da Success page

**Fluxo "Tentar novamente":**
1. Usuário clica em "Tentar novamente"
2. `onTryAgain()` callback é chamado
3. App redireciona para Gallery
4. Flag `shouldOpenUpgradeModal` ativa
5. Gallery detecta flag e abre Upgrade Modal
6. Usuário pode tentar o checkout novamente

## 🔍 Verificação da Sessão (Success Page)

Após o Stripe redirecionar o usuário de volta para `/upgrade/success?session_id=xyz`, a página automaticamente:

1. **Extrai o session_id** da URL
2. **Chama a API** `/api/verify-checkout-session`
3. **Valida a sessão** com o Stripe
4. **Exibe o resultado** baseado no status

### Fluxo de Verificação

```
User lands on /upgrade/success?session_id=xyz
        ↓
Extract session_id from URL
        ↓
Call /api/verify-checkout-session
        ↓
    [Loading State]
        ↓
Stripe API returns status
        ↓
    ┌─────────┬─────────┬─────────┐
    ↓         ↓         ↓         ↓
 Success   Pending   Failed    Error
    ↓         ↓         ↓         ↓
Show plan  Keep      Show     Show error
details    polling   error    + retry
```

### Estados da Página

**1. Loading (Inicial):**
- Duração: 1-3 segundos
- Mostra: Spinner + "Verificando pagamento..."
- API está processando

**2. Success:**
- Pagamento confirmado
- Plano ativado
- Créditos adicionados
- Mostra: Resumo completo + CTA

**3. Pending:**
- Pagamento ainda processando
- Pode acontecer com alguns métodos de pagamento
- Mostra: Mensagem de aguardo

**4. Error:**
- Session ID inválido ou expirado
- Erro na API
- Mostra: Mensagem de erro + botão "Tentar novamente"

## 🔧 Modo Desenvolvimento vs Produção

### Desenvolvimento (localhost / Figma)

O modal detecta automaticamente se está em modo desenvolvimento e usa uma API mock:

```typescript
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('figma.com');
```

No modo desenvolvimento:
- ✅ Usa função mock `createCheckoutSession()`
- ✅ Simula delay de 1.5s
- ✅ Mostra alert com dados do checkout
- ✅ NÃO redireciona para o Stripe
- ✅ Logs detalhados no console

### Produção

No modo produção:
- ✅ Faz requisição real para `/api/create-checkout-session`
- ✅ Redireciona para checkout real do Stripe
- ✅ Usuário completa pagamento
- ✅ Stripe redireciona de volta

## 💳 Configuração do Stripe

### 1. Criar Produtos no Stripe Dashboard

1. Acesse https://dashboard.stripe.com/products
2. Crie dois produtos:
   - **Starter**
   - **Professional**

### 2. Criar Preços (Prices)

Para cada produto, crie dois preços:
- Mensal (recurring monthly)
- Anual (recurring yearly)

**Exemplo:**
```
Starter Monthly: R$ 49,00/mês
Starter Yearly: R$ 470,00/ano (R$ 39,17/mês - 20% off)
Professional Monthly: R$ 89,00/mês
Professional Yearly: R$ 854,00/ano (R$ 71,17/mês - 20% off)
```

### 3. Mapear Price IDs

No arquivo `/api/create-checkout-session.ts`, atualize:

```typescript
export const STRIPE_PRICE_IDS = {
  starter_monthly: 'price_1234567890abcdef',      // Seu Price ID real
  starter_yearly: 'price_1234567890ghijkl',       // Seu Price ID real
  professional_monthly: 'price_1234567890mnopqr', // Seu Price ID real
  professional_yearly: 'price_1234567890stuvwx',  // Seu Price ID real
} as const;
```

### 4. Implementar Endpoint Real

Substitua o mock em `/api/create-checkout-session.ts` por uma implementação real com Stripe SDK:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planId, billingPeriod, successUrl, cancelUrl } = req.body;

  // Get user from session/auth
  const userId = req.user?.id; // Depende do seu sistema de auth
  const userEmail = req.user?.email;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get correct price ID
    const priceId = getPriceIdForPlan(planId, billingPeriod);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
        billingPeriod,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return res.status(200).json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session' 
    });
  }
}
```

## 🎣 Webhooks do Stripe

Para processar o pagamento e ativar o plano do usuário, configure webhooks:

### Eventos Importantes

1. **checkout.session.completed**
   - Disparado quando o checkout é concluído
   - Use para ativar o plano do usuário
   - Adicionar créditos
   - Enviar email de boas-vindas

2. **customer.subscription.updated**
   - Disparado quando a assinatura é atualizada
   - Use para mudanças de plano

3. **customer.subscription.deleted**
   - Disparado quando a assinatura é cancelada
   - Use para downgrade ou bloqueio de features

### Exemplo de Webhook Handler

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Ativar plano do usuário
      await activateUserPlan({
        userId: session.client_reference_id,
        planId: session.metadata.planId,
        billingPeriod: session.metadata.billingPeriod,
        subscriptionId: session.subscription,
        customerId: session.customer,
      });
      
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      
      // Desativar plano do usuário
      await deactivateUserPlan({
        subscriptionId: subscription.id,
      });
      
      break;
  }

  res.json({ received: true });
}
```

## 🧪 Testes

### Testar no Ambiente de Desenvolvimento

1. Execute a aplicação localmente
2. Abra o modal de upgrade
3. Selecione um plano
4. Clique em "Continuar para pagamento"
5. Verifique o alert com dados do mock
6. Verifique logs no console

### Testar com Stripe Test Mode

1. Use credenciais de teste do Stripe
2. Configure webhook endpoint de teste
3. Use cartões de teste:
   - Sucesso: `4242 4242 4242 4242`
   - Falha: `4000 0000 0000 0002`
4. Complete o checkout
5. Verifique se webhook foi recebido

## 📝 Checklist de Implementação

### Frontend (Completo)
- [x] UpgradeModal criado com 4 contextos
- [x] Loading states no modal
- [x] Mock API para create-checkout-session
- [x] Mock API para verify-checkout-session
- [x] UpgradeSuccess page com 3 estados (loading, success, error)
- [x] Verificação automática da sessão
- [x] UpgradeCanceled page
- [x] Integração completa no App.tsx
- [x] Animações e transições
- [x] Tratamento de erros
- [x] Modo desenvolvimento com mocks

### Backend (Pendente)
- [ ] Implementar endpoint real `/api/create-checkout-session`
- [ ] Implementar endpoint real `/api/verify-checkout-session`
- [ ] Configurar produtos e preços no Stripe Dashboard
- [ ] Mapear Price IDs no código
- [ ] Implementar webhook handler (`checkout.session.completed`)
- [ ] Implementar webhook handler (`customer.subscription.*`)
- [ ] Sistema de ativação de plano no banco de dados
- [ ] Sistema de adição de créditos
- [ ] Email de confirmação
- [ ] Email de boas-vindas

### Testes
- [ ] Testar modal em desenvolvimento
- [ ] Testar todos os 4 contextos do modal
- [ ] Testar fluxo completo em Stripe test mode
- [ ] Testar cartões de sucesso e falha
- [ ] Testar página de sucesso
- [ ] Testar página de cancelamento
- [ ] Testar verificação de sessão inválida
- [ ] Testar webhooks no Stripe Dashboard

### Produção
- [ ] Configurar URLs de produção
- [ ] Configurar variáveis de ambiente
- [ ] Testar em staging
- [ ] Deploy em produção
- [ ] Monitorar webhooks
- [ ] Monitorar erros
- [ ] Configurar alertas

## 🔒 Segurança

### Validações Importantes

1. ✅ Validar usuário autenticado antes de criar checkout
2. ✅ Usar `client_reference_id` para associar session ao usuário
3. ✅ Validar webhook signature
4. ✅ Armazenar `customer_id` e `subscription_id` no banco
5. ✅ Implementar rate limiting no endpoint
6. ✅ Usar HTTPS em produção
7. ✅ Não expor Secret Key no frontend

## 📧 Comunicação com Usuário

Após o checkout bem-sucedido (via webhook):

1. ✅ Enviar email de confirmação
2. ✅ Atualizar status do plano no banco
3. ✅ Adicionar créditos à conta
4. ✅ Desbloquear features premium
5. ✅ Notificar usuário na plataforma

## 🎨 Design System

Todos os componentes seguem o design system do Ktírio AI:

- **Cores:** #030213 (primary), #FAFAFA (backgrounds)
- **Bordas:** rounded-2xl, rounded-xl
- **Sombras:** Suaves e elevadas
- **Animações:** fadeIn 200ms, slideUp 300ms
- **Tipografia:** Inter font family

## 🧪 Guia Rápido de Testes (Desenvolvimento)

### Testar o Modal de Upgrade

1. Abra a aplicação em modo desenvolvimento
2. Clique em um dos botões de teste na Gallery:
   - 🔒 Feature - Testa contexto de feature bloqueada
   - 📁 Projetos - Testa limite de projetos
   - ⏰ Trial - Testa trial finalizado
3. Ou clique no botão "Fazer upgrade" na sidebar (contexto de créditos)
4. Selecione um plano e clique em "Continuar para pagamento"
5. Verifique o alert com os dados mockados
6. Verifique os logs no console

### Testar a Página de Sucesso

**Opção 1: Via URL direta**
```
http://localhost:3000/upgrade/success?session_id=test_session_123
```

**Opção 2: Simular fluxo completo**
1. Abra o UpgradeModal
2. Clique em "Continuar para pagamento"
3. No alert, copie o checkout_url mockado
4. Manualmente navegue para `/upgrade/success?session_id=mock_123`

**Estados para testar:**
- ✅ **Loading:** A página mostra automaticamente por 2 segundos
- ✅ **Success:** Com session_id válido (qualquer valor exceto "invalid")
- ✅ **Error:** Use `?session_id=invalid` ou sem session_id

### Testar a Página de Cancelamento

**Via URL direta:**
```
http://localhost:3000/upgrade/canceled
```

**Testar fluxo "Tentar novamente":**
1. Navegue para `/upgrade/canceled`
2. Clique em "Tentar novamente"
3. Verifique que voltou para Gallery
4. Verifique que Upgrade Modal abriu automaticamente
5. Selecione um plano e teste o checkout

**Testar fluxo "Voltar ao app":**
1. Navegue para `/upgrade/canceled`
2. Clique em "Voltar ao app"
3. Verifique que voltou para Gallery
4. Verifique que Upgrade Modal NÃO abriu

### Console Logs Úteis

Em desenvolvimento, você verá logs como:
```
🔧 DEV MODE - Mock Stripe Checkout Session Created:
  sessionId: "cs_test_mock_1696531234567"
  checkoutUrl: "https://checkout.stripe.com/..."
  planId: "professional"
  billingPeriod: "monthly"

🔧 DEV MODE - Session verified:
  status: "success"
  planId: "professional"
  amount: 89
  credits: 200
```

## 🚀 Próximos Passos

1. **Implementar Backend Real**
   - Configure Stripe API keys
   - Crie os endpoints de produção
   - Implemente webhooks

2. **Banco de Dados**
   - Criar tabela de `subscriptions`
   - Criar tabela de `transactions`
   - Relacionar com `users`

3. **Sistema de Créditos**
   - Adicionar créditos ao completar checkout
   - Renovar créditos mensalmente via webhook
   - Decrementar créditos ao usar features

4. **Emails**
   - Template de confirmação de pagamento
   - Template de boas-vindas
   - Template de renovação
   - Template de cancelamento

5. **Monitoramento**
   - Sentry para erros
   - Analytics de conversão
   - Dashboard de métricas de upgrade
