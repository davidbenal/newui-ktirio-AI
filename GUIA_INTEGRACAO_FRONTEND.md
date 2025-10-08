# 🚀 Guia de Integração Frontend - Sistema de Créditos

## 📋 Índice
1. [Componentes Criados](#componentes-criados)
2. [Configuração Inicial](#configuração-inicial)
3. [Como Usar](#como-usar)
4. [Exemplos de Integração](#exemplos-de-integração)
5. [Fluxo Completo](#fluxo-completo)
6. [Troubleshooting](#troubleshooting)

---

## 📦 Componentes Criados

### 1. **useCredits Hook** (`src/hooks/useCredits.ts`)
Hook React para gerenciar créditos e integrações com Cloud Functions.

**Funcionalidades:**
- ✅ Monitoramento em tempo real do saldo de créditos
- ✅ Criar checkout de assinatura
- ✅ Criar checkout de pacote
- ✅ Consumir créditos
- ✅ Abrir portal do cliente Stripe

### 2. **CreditsBadge** (`src/components/CreditsBadge.tsx`)
Componente visual para exibir saldo de créditos.

**Features:**
- Mostra saldo atual
- Indicador visual de créditos baixos (amarelo < 10, vermelho = 0)
- Botão para comprar mais créditos
- Loading state

### 3. **BuyCreditsModal.v2** (`src/components/BuyCreditsModal.v2.tsx`)
Modal para compra de pacotes de créditos únicos.

**Features:**
- 3 pacotes pré-definidos (Small, Medium, Large)
- Integração com Cloud Function `createPackCheckout`
- Redirecionamento automático para Stripe Checkout
- Visual moderno e responsivo

### 4. **SubscriptionPricing** (`src/components/SubscriptionPricing.tsx`)
Página de pricing para assinaturas mensais.

**Features:**
- 3 planos (Starter, Pro, Business)
- Destaque do plano mais popular
- Integração com Cloud Function `createSubscriptionCheckout`
- Mostra plano atual se já tiver assinatura

### 5. **PaymentSuccessPage** (`src/pages/PaymentSuccessPage.tsx`)
Página de confirmação após pagamento bem-sucedido.

**Features:**
- Verificação automática de créditos
- Animação de sucesso
- Redirecionamento para dashboard ou criação

---

## ⚙️ Configuração Inicial

### 1. Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contém:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=ktirio-ai-4540c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ktirio-ai-4540c
VITE_FIREBASE_STORAGE_BUCKET=ktirio-ai-4540c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase já está configurado

O Firebase SDK já está configurado em `src/lib/firebase.ts`:
```typescript
import { functions } from '../lib/firebase'
```

### 3. Rotas de Pagamento

Adicione rotas no seu router para páginas de sucesso/cancelamento:

```typescript
// src/App.tsx ou router config
import PaymentSuccessPage from './pages/PaymentSuccessPage'

// Adicionar rotas
<Route path="/payment/success" element={<PaymentSuccessPage userId={user.id} />} />
<Route path="/payment/canceled" element={<PaymentCanceledPage />} />
```

---

## 🎯 Como Usar

### Exemplo 1: Exibir Saldo de Créditos

```tsx
import CreditsBadge from './components/CreditsBadge'
import { useState } from 'react'
import BuyCreditsModal from './components/BuyCreditsModal.v2'

function Header({ userId }: { userId: string }) {
  const [showBuyModal, setShowBuyModal] = useState(false)

  return (
    <header>
      <CreditsBadge
        userId={userId}
        onClick={() => setShowBuyModal(true)}
        showPlusButton={true}
      />

      <BuyCreditsModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        userId={userId}
      />
    </header>
  )
}
```

### Exemplo 2: Hook useCredits

```tsx
import { useCredits } from './hooks/useCredits'

function MyComponent({ userId }: { userId: string }) {
  const {
    credits,
    subscription,
    loading,
    consumeCredits,
    createPackCheckout
  } = useCredits(userId)

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <p>Créditos: {credits}</p>
      {subscription && <p>Plano: {subscription.planId}</p>}

      <button onClick={() => consumeCredits(1, 'Geração de modelo 3D')}>
        Gerar Modelo (1 crédito)
      </button>
    </div>
  )
}
```

### Exemplo 3: Integrar na Geração de Modelos

```tsx
import { useCredits } from './hooks/useCredits'

function ModelGenerator({ userId }: { userId: string }) {
  const { credits, consumeCredits } = useCredits(userId)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    // Verificar se tem créditos
    if (credits < 1) {
      alert('Você não tem créditos suficientes!')
      return
    }

    try {
      setIsGenerating(true)

      // Consumir crédito ANTES de gerar
      await consumeCredits(1, 'Geração de modelo 3D')

      // Chamar API de geração
      const result = await generateModel(...)

      // Sucesso!
      console.log('Modelo gerado:', result)
    } catch (error) {
      console.error('Erro:', error)
      // Se falhar, pode tentar devolver o crédito ou registrar erro
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={credits < 1 || isGenerating}
    >
      {credits < 1 ? 'Sem créditos' : 'Gerar Modelo'}
    </button>
  )
}
```

### Exemplo 4: Página de Assinaturas

```tsx
import SubscriptionPricing from './components/SubscriptionPricing'

function PricingPage({ userId }: { userId: string }) {
  return (
    <div className="container">
      <SubscriptionPricing userId={userId} />
    </div>
  )
}
```

### Exemplo 5: Portal do Cliente (Gerenciar Assinatura)

```tsx
import { useCredits } from './hooks/useCredits'

function SettingsBilling({ userId }: { userId: string }) {
  const { subscription, createCustomerPortalSession } = useCredits(userId)

  const handleManageSubscription = async () => {
    try {
      const portalUrl = await createCustomerPortalSession()
      window.location.href = portalUrl
    } catch (error) {
      console.error('Erro ao abrir portal:', error)
    }
  }

  if (!subscription) {
    return <p>Você não tem uma assinatura ativa</p>
  }

  return (
    <div>
      <h2>Sua Assinatura</h2>
      <p>Plano: {subscription.planId}</p>
      <p>Status: {subscription.status}</p>

      <button onClick={handleManageSubscription}>
        Gerenciar Assinatura
      </button>
    </div>
  )
}
```

---

## 🔄 Fluxo Completo de Pagamento

### 1. Compra de Pacote de Créditos

```
Usuário clica em "Comprar Créditos"
  ↓
Modal BuyCreditsModal abre
  ↓
Usuário seleciona pacote (Small/Medium/Large)
  ↓
Clica em "Comprar Agora"
  ↓
createPackCheckout() é chamado
  ↓
Cloud Function cria Stripe Checkout Session
  ↓
Usuário é redirecionado para Stripe
  ↓
Usuário completa pagamento
  ↓
Stripe envia webhook para Cloud Function
  ↓
Cloud Function adiciona créditos ao Firestore
  ↓
Usuário é redirecionado para /payment/success
  ↓
PaymentSuccessPage verifica e exibe créditos
```

### 2. Assinatura Mensal

```
Usuário acessa página de pricing
  ↓
Seleciona plano (Starter/Pro/Business)
  ↓
Clica em "Assinar Agora"
  ↓
createSubscriptionCheckout() é chamado
  ↓
Cloud Function cria Stripe Checkout Session
  ↓
Usuário é redirecionado para Stripe
  ↓
Usuário completa pagamento
  ↓
Stripe envia webhook checkout.session.completed
  ↓
Cloud Function:
  - Cria/atualiza customer no Stripe
  - Adiciona créditos iniciais
  - Salva subscription no Firestore
  ↓
Usuário é redirecionado para /payment/success
  ↓
A cada mês, Stripe cobra automaticamente
  ↓
Webhook invoice.payment_succeeded
  ↓
Cloud Function renova créditos mensais
```

### 3. Consumo de Créditos

```
Usuário clica em "Gerar Modelo"
  ↓
Frontend verifica se tem créditos suficientes
  ↓
Chama consumeCredits(1, "Geração de modelo 3D")
  ↓
Cloud Function:
  - Verifica saldo
  - Deduz créditos
  - Registra transação
  - Atualiza Firestore
  ↓
Listener em tempo real atualiza UI
  ↓
Geração do modelo prossegue
```

---

## 🔧 Configuração de URLs de Retorno

No Stripe Checkout, as URLs de retorno são configuradas automaticamente pelas Cloud Functions:

```typescript
// Cloud Function createPackCheckout ou createSubscriptionCheckout
successUrl: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`
cancelUrl: `${appUrl}/payment/canceled`
```

Certifique-se de que `appUrl` está configurado corretamente no Firebase Functions Config:

```bash
# Para desenvolvimento
firebase functions:config:set app.url="http://localhost:5173"

# Para produção
firebase functions:config:set app.url="https://seu-dominio.com"
```

---

## 🎨 Personalização

### Alterar Cores do CreditsBadge

```tsx
// Em CreditsBadge.tsx, modificar os gradientes:
style={{
  background: isOutOfCredits
    ? 'linear-gradient(135deg, #SUA_COR 0%, #SUA_COR_ESCURA 100%)'
    : // ...
}}
```

### Alterar Valores dos Pacotes

```tsx
// Em BuyCreditsModal.v2.tsx
const packages: Package[] = [
  {
    id: 'small',
    credits: 100,  // Altere aqui
    price: 14.99,  // Altere aqui
    // ...
  }
]
```

**IMPORTANTE:** Se alterar os valores, também precisa atualizar os Price IDs no código das Cloud Functions!

---

## 🐛 Troubleshooting

### 1. Créditos não aparecem após pagamento

**Possíveis causas:**
- Webhook do Stripe não foi processado
- Erro na Cloud Function stripeWebhook

**Solução:**
```bash
# Verificar logs da Cloud Function
gcloud functions logs read stripeWebhook --region=us-central1 --limit=50

# Ou no Firebase
firebase functions:log --only stripeWebhook
```

### 2. Erro ao criar checkout

**Erro:** `Usuário não autenticado`

**Solução:** Certifique-se de passar o `userId` correto para os componentes.

### 3. Créditos não atualizam em tempo real

**Causa:** Listener do Firestore não está conectado

**Solução:** Verifique se o `userId` está sendo passado corretamente para o hook `useCredits`.

### 4. Redirect após pagamento não funciona

**Causa:** URL de retorno mal configurada

**Solução:**
```bash
# Atualizar URL no Firebase Functions Config
firebase functions:config:set app.url="http://localhost:5173"
firebase deploy --only functions
```

### 5. Erro de CORS

**Solução:** As Cloud Functions já têm CORS configurado. Verifique se está usando o domínio correto.

---

## 📝 Checklist de Integração

- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Firebase Functions deployadas e ativas
- [ ] Webhook do Stripe configurado
- [ ] URL de retorno configurada (`app.url`)
- [ ] Componentes importados no projeto
- [ ] Rotas de sucesso/cancelamento criadas
- [ ] CreditsBadge adicionado ao header
- [ ] Modal de compra integrado
- [ ] Consumo de créditos na geração de modelos
- [ ] Testado fluxo completo de compra
- [ ] Testado fluxo de assinatura
- [ ] Testado portal do cliente

---

## 🎯 Próximos Passos

1. **Testar em ambiente de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Fazer uma compra de teste:**
   - Use cartão de teste do Stripe: `4242 4242 4242 4242`
   - Qualquer data futura
   - Qualquer CVV de 3 dígitos

3. **Verificar créditos no Firestore:**
   - Acesse: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore
   - Navegue para `users/{userId}`
   - Verifique o campo `credits`

4. **Testar webhook localmente (opcional):**
   ```bash
   # Instalar Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login
   stripe login

   # Forward webhooks para localhost
   stripe listen --forward-to http://localhost:5173/api/webhook
   ```

---

## 📚 Recursos Adicionais

- **Documentação Stripe:** https://stripe.com/docs
- **Firebase Functions:** https://firebase.google.com/docs/functions
- **React Hooks:** https://react.dev/reference/react

---

**Última atualização:** 08/10/2025
**Versão:** 1.0.0
