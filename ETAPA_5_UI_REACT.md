# ETAPA 5: COMPONENTES UI REACT

## 📋 Resumo da Implementação

Sistema completo de interface de usuário React para o sistema de créditos do Ktirio AI.

---

## 🎯 Componentes Implementados

### 1. **Hook: useCredits.ts**

**Localização:** [`src/hooks/useCredits.ts`](src/hooks/useCredits.ts)

#### Funcionalidades:
- ✅ Carregamento automático dos créditos do usuário
- ✅ Listener em tempo real do Firestore (onSnapshot)
- ✅ Integração com todas as Cloud Functions
- ✅ Atualização otimista para melhor UX
- ✅ Gerenciamento de estado de loading e erros

#### API do Hook:
```typescript
const {
  credits,                        // Número total de créditos
  subscription,                   // Dados da assinatura
  loading,                        // Estado de carregamento
  error,                          // Mensagem de erro
  refreshCredits,                 // Função para recarregar
  createSubscriptionCheckout,     // Criar checkout de assinatura
  createPackCheckout,             // Criar checkout de pacote
  consumeCredits,                 // Consumir créditos
  createCustomerPortalSession     // Abrir portal do cliente
} = useCredits(userId);
```

#### Features Principais:
- **Real-time Updates:** Usa Firestore `onSnapshot` para atualizações instantâneas
- **Automatic Cleanup:** Remove listeners ao desmontar
- **Error Handling:** Tratamento robusto de erros
- **Type Safe:** Totalmente tipado com TypeScript

---

### 2. **Componente: CreditsSidebar.tsx**

**Localização:** [`src/components/CreditsSidebar.tsx`](src/components/CreditsSidebar.tsx)

#### Props:
```typescript
interface CreditsSidebarProps {
  userId: string;
}
```

#### Estrutura Visual:

**Header:**
- Ícone de moeda (Coins)
- Título "CRÉDITOS"

**Badge do Plano** (se tiver assinatura):
- Ícone Sparkles
- Nome do plano (Starter/Pro/Business)

**Contador Principal:**
- Número grande destacado de créditos totais
- Texto "créditos disponíveis"

**Tooltip de Detalhamento** (ao hover):
- Breakdown dos créditos de assinatura
- Data de renovação
- Créditos de pacotes avulsos
- Datas de expiração

**Barra de Progresso** (se tiver assinatura):
- Percentual de uso do período
- Visual com gradiente

**Botões de Ação:**
- **Com assinatura:**
  - "Comprar mais créditos" → `/pricing`
  - "Gerenciar assinatura" → Portal do Stripe

- **Sem assinatura:**
  - "Fazer upgrade" → `/pricing`

**Alerta de Créditos Baixos:**
- Exibido quando créditos < 10
- Design em amber (amarelo/laranja)
- Mensagem sugerindo upgrade/compra

#### Features:
- ✅ Loading state com skeleton
- ✅ Error handling
- ✅ Tooltip interativo com breakdown
- ✅ Animações suaves (transitions)
- ✅ Design responsivo
- ✅ Gradiente visual moderno

---

### 3. **Página: PricingPage.tsx**

**Localização:** [`src/pages/PricingPage.tsx`](src/pages/PricingPage.tsx)

#### Seções:

**Header:**
- Título: "Escolha seu plano"
- Subtítulo explicativo

**Planos de Assinatura:**
- Grid de 2 colunas (Básico e Pro)
- Badge "POPULAR" no plano recomendado
- Features listadas com ícone de check
- Botão "Assinar" ou "Seu plano atual"
- Preço mensal destacado

**Pacotes Avulsos:**
- Grid de 3 colunas (Inicial, Padrão, Grande)
- Badge "MELHOR VALOR" no popular
- Indicador de economia percentual
- Validade de 90 dias
- Botão "Comprar"

**Garantia:**
- Ícone de Shield
- Texto de garantia de 7 dias

**CTA Final:**
- Link para contato
- Suporte para dúvidas

#### Fluxo de Compra:

**Assinatura:**
```typescript
const handleSubscribe = async (planId: string) => {
  const url = await createSubscriptionCheckout(planId);
  window.location.href = url; // Redireciona para Stripe
}
```

**Pacote:**
```typescript
const handleBuyPack = async (packId: string) => {
  const url = await createPackCheckout(packId);
  window.location.href = url; // Redireciona para Stripe
}
```

#### Features:
- ✅ Identificação do plano atual
- ✅ Loading states nos botões
- ✅ Error handling com mensagens
- ✅ Redirect para login se não autenticado
- ✅ Design moderno com gradientes
- ✅ Responsivo para mobile

---

### 4. **Página: CheckoutSuccessPage.tsx**

**Localização:** [`src/pages/CheckoutSuccessPage.tsx`](src/pages/CheckoutSuccessPage.tsx)

#### Query Params:
- `session_id`: ID da sessão do Stripe
- `type`: 'subscription' ou 'pack'

#### Fluxo:

1. **Verificação:**
   - Valida query params
   - Redireciona para `/pricing` se inválidos

2. **Loading State:**
   - Mostra spinner durante 2 segundos
   - Aguarda webhook processar

3. **Refresh de Dados:**
   - Chama `refreshCredits()` para pegar novos valores
   - Atualiza informações da compra

4. **Exibição de Sucesso:**
   - Ícone de check animado
   - Informações da compra
   - Total de créditos disponíveis
   - Próximos passos

#### Estrutura Visual:

**Ícone de Sucesso:**
- CheckCircle verde com animação bounce
- Título "Pagamento confirmado!"

**Card de Informações:**
- Tipo de compra (assinatura ou pacote)
- Créditos adicionados
- Informação de renovação/validade
- Total de créditos disponíveis

**Próximos Passos:**
- Card com gradiente
- Lista de ações sugeridas

**Botões:**
- "Começar a criar" → Home/Editor
- "Ver planos" → `/pricing`

**Link de Suporte:**
- Footer com link para suporte

#### Features:
- ✅ Loading state elegante
- ✅ Mensagens contextuais (subscription vs pack)
- ✅ Refresh automático de créditos
- ✅ Design celebratório
- ✅ CTAs claros

---

## 📁 Estrutura de Arquivos Criada

```
src/
├── components/
│   └── CreditsSidebar.tsx              ✅ Sidebar de créditos
├── pages/
│   ├── PricingPage.tsx                 ✅ Página de preços
│   └── CheckoutSuccessPage.tsx         ✅ Página de sucesso
├── hooks/
│   └── useCredits.ts                   ✅ Hook customizado (já existia)
├── types/
│   └── credits.ts                      ✅ Tipos TypeScript
└── config/
    └── pricing.ts                      ✅ Constantes de configuração
```

---

## 🔧 Configuração e Uso

### 1. Adicionar CreditsSidebar ao Layout

```tsx
import { CreditsSidebar } from '../components/CreditsSidebar';
import { useAuth } from '../hooks/useAuth';

function Layout() {
  const { user } = useAuth();

  return (
    <div className="flex">
      <aside className="w-64 p-4">
        {user && <CreditsSidebar userId={user.uid} />}
      </aside>
      <main className="flex-1">
        {/* Conteúdo principal */}
      </main>
    </div>
  );
}
```

### 2. Adicionar Rotas

```tsx
import { PricingPage } from './pages/PricingPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';

// Em App.tsx ou routes.tsx
<Route path="/pricing" element={<PricingPage />} />
<Route path="/checkout/success" element={<CheckoutSuccessPage />} />
```

### 3. Usar o Hook em Qualquer Componente

```tsx
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';

function MyComponent() {
  const { user } = useAuth();
  const {
    credits,
    subscription,
    loading,
    consumeCredits
  } = useCredits(user?.uid || null);

  const handleGenerate = async () => {
    if (credits < 1) {
      alert('Créditos insuficientes!');
      return;
    }

    await consumeCredits(1, 'Geração de imagem');
    // Continuar com a geração...
  };

  return (
    <div>
      <p>Créditos: {credits}</p>
      <button onClick={handleGenerate}>Gerar</button>
    </div>
  );
}
```

---

## 🎨 Design System

### Cores Principais:
- **Primary:** Indigo (600-700)
- **Success:** Green (500-600)
- **Warning:** Amber (500-600)
- **Error:** Red (500-600)

### Ícones Utilizados (lucide-react):
- `Coins` - Créditos gerais
- `Sparkles` - Planos premium
- `Zap` - Planos básicos
- `Rocket` - Planos avançados
- `Clock` - Validade/Tempo
- `Calendar` - Datas
- `TrendingUp` - Assinaturas
- `CheckCircle` - Sucesso
- `Shield` - Garantia
- `Loader2` - Loading

### Componentes Tailwind:
- Cards com `rounded-xl` ou `rounded-2xl`
- Shadows: `shadow-md`, `shadow-lg`, `shadow-xl`
- Gradientes: `from-indigo-600 to-indigo-700`
- Transitions: `transition-all duration-300`

---

## 📊 Integrações

### Cloud Functions Utilizadas:
1. **getUserCredits** - Pegar dados de créditos
2. **createSubscriptionCheckout** - Criar checkout de assinatura
3. **createPackCheckout** - Criar checkout de pacote
4. **consumeCredits** - Consumir créditos
5. **createCustomerPortalSession** - Portal do cliente

### Firestore Real-time:
- Listener no documento `users/{userId}`
- Atualização automática quando créditos mudam
- Cleanup automático de listeners

---

## ✅ Checklist de Integração

- [x] Hook useCredits implementado
- [x] CreditsSidebar component criado
- [x] PricingPage criada
- [x] CheckoutSuccessPage criada
- [x] Tipos TypeScript definidos
- [x] Constantes de configuração
- [ ] Adicionar rotas no App.tsx
- [ ] Integrar CreditsSidebar no layout principal
- [ ] Testar fluxo completo de compra
- [ ] Testar consumo de créditos
- [ ] Configurar URLs de retorno no Stripe
- [ ] Ajustar Price IDs se necessário

---

## 🧪 Testes Recomendados

### Teste 1: Compra de Assinatura
1. Acesse `/pricing`
2. Clique em "Assinar" no plano Básico
3. Complete o checkout no Stripe (usar card de teste)
4. Verifique redirect para `/checkout/success`
5. Confirme que créditos foram adicionados
6. Verifique CreditsSidebar mostrando plano

### Teste 2: Compra de Pacote
1. Acesse `/pricing`
2. Clique em "Comprar" no pacote Padrão
3. Complete o checkout
4. Verifique créditos adicionados
5. Confirme validade de 90 dias

### Teste 3: Consumo de Créditos
1. Use `consumeCredits(1, 'Teste')`
2. Verifique atualização em tempo real no sidebar
3. Confirme transaction criada no Firestore

### Teste 4: Portal do Cliente
1. Com assinatura ativa, clique "Gerenciar assinatura"
2. Verifique redirect para portal do Stripe
3. Teste cancelamento de assinatura
4. Verifique status atualizado

---

## 🔒 Segurança

✅ **Validações Implementadas:**
- UserId sempre requerido
- Verificação de autenticação antes de checkout
- Error boundaries para falhas de API
- Sanitização de inputs

✅ **Best Practices:**
- Nunca expor Secret Keys no frontend
- Usar Cloud Functions para operações sensíveis
- Validar todos os webhooks no backend
- HTTPS obrigatório em produção

---

## 📝 Notas Importantes

1. **Price IDs:**
   - Os Price IDs em `pricing.ts` devem corresponder aos criados no Stripe
   - Atualizar se mudar no Stripe Dashboard

2. **URLs de Retorno:**
   - Configurar no Stripe: `/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`
   - URL de cancelamento: `/pricing`

3. **Real-time Updates:**
   - O hook usa `onSnapshot` para updates instantâneos
   - Não precisa de polling manual

4. **Loading States:**
   - Todos os componentes têm estados de loading
   - Skeletons para melhor UX

5. **Error Handling:**
   - Mensagens de erro user-friendly
   - Logs detalhados no console para debug

---

## 🚀 Próximos Passos

### Melhorias Sugeridas:
1. **Analytics:**
   - Rastrear conversões de checkout
   - Monitorar taxa de cancelamento

2. **A/B Testing:**
   - Testar diferentes preços
   - Otimizar CTAs

3. **Notificações:**
   - Email quando créditos < 10
   - Lembrete de renovação

4. **Relatórios:**
   - Dashboard de uso de créditos
   - Histórico de transações

---

**Status:** ✅ **ETAPA 5 COMPLETA**
**Data:** 2025-10-08
**Versão:** 1.0.0
