# Buy Credits Modal - Documentação

## Visão Geral

O **BuyCreditsModal** é um modal premium para compra de créditos avulsos no Ktírio AI. Apresenta 3 pacotes de créditos com diferentes valores, destacando o melhor custo-benefício e economias potenciais.

---

## Design System

### Layout
```
┌─────────────────────────────────────────┐
│  [X]                                    │ ← Close button
│                                         │
│          [🔥 Zap Icon]                 │ ← Icon gradient
│                                         │
│      Comprar Créditos                   │ ← Title
│  Escolha o pacote ideal...             │ ← Description
│                                         │
│  [⚡ Saldo atual: 2 créditos]          │ ← Balance info
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐            │
│  │ 50  │  │ 150 │  │ 300 │            │ ← Packages grid
│  │$39,90│ │$99,90│ │$179,90│          │
│  └─────┘  └─────┘  └─────┘            │
│                                         │
│  [💡 Dica: Créditos não expiram...]   │ ← Info section
│                                         │
├─────────────────────────────────────────┤
│  Total: R$ 99,90         [Comprar →]   │ ← Footer
│                                         │
│  🛡️ Pagamento  ⏱️ Instantâneo  🔄 Sem  │ ← Trust badges
└─────────────────────────────────────────┘
```

---

## Pacotes de Créditos

### 1. Starter (Básico)
```typescript
{
  credits: 50,
  price: 39.90,
  pricePerCredit: 0.80,
  features: [
    'Validade de 90 dias',
    'Todos os estilos',
    'Qualidade alta'
  ]
}
```

**Visual:**
- Sem badge
- Border cinza (#E9EBEF)
- Fonte: 48px

---

### 2. Popular (Recomendado) ⭐
```typescript
{
  credits: 150,
  price: 99.90,
  pricePerCredit: 0.67,
  badge: 'Melhor Valor',
  savings: 16,
  features: [
    'Validade de 120 dias',
    'Todos os estilos',
    'Qualidade máxima',
    'Suporte prioritário'
  ]
}
```

**Visual:**
- Badge verde "MELHOR VALOR" no topo
- Destaque maior (52px)
- Economia: "Economize 16%"
- Pre-selecionado por default

---

### 3. Pro (Maior volume)
```typescript
{
  credits: 300,
  price: 179.90,
  pricePerCredit: 0.60,
  savings: 25,
  features: [
    'Sem expiração',
    'Todos os estilos',
    'Qualidade máxima',
    'Suporte VIP',
    'Acesso antecipado'
  ]
}
```

**Visual:**
- Sem badge
- Economia: "Economize 25%"
- Mais features (5 itens)

---

## Estados Interativos

### Card States

**1. Default (Não selecionado)**
```css
border: 2px solid #E9EBEF;
background: #FFFFFF;
transform: translateY(0);
box-shadow: none;
```

**2. Hover**
```css
border-color: #CBCED4;
transform: translateY(-4px);
box-shadow: 0 8px 20px rgba(0,0,0,0.08);
transition: 200ms ease;
```

**3. Selected (Ativo)**
```css
border: 3px solid #030213;
background: #FAFAFA;
box-shadow: 0 8px 20px rgba(0,0,0,0.12);
```

**Radio Button:**
- Não selecionado: Círculo vazio (#E9EBEF)
- Selecionado: Círculo com dot interno (#030213)

---

## Componentes Visuais

### Header

**Zap Icon Container:**
```css
width: 72px;
height: 72px;
background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
border-radius: 50%;
box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
```

**Title:**
```
Font: Inter Bold 28px
Color: #030213
```

**Current Balance Bar:**
```css
background: #FAFAFA;
border: 1px solid #E9EBEF;
border-radius: 12px;
padding: 12px 20px;
```

### Badge "Melhor Valor"

**Posicionamento:**
```css
position: absolute;
top: -10px;
left: 50%;
transform: translateX(-50%);
```

**Estilo:**
```css
background: linear-gradient(135deg, #10B981 0%, #059669 100%);
color: white;
padding: 6px 16px;
border-radius: 9999px;
font-size: 11px;
font-weight: 700;
text-transform: uppercase;
box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
```

### Economia Badge

```css
background: rgba(16, 185, 129, 0.1);
color: #10B981;
padding: 2px 8px;
border-radius: 4px;
font-size: 10px;
font-weight: 600;
```

---

## Info Section

**Container:**
```css
background: rgba(59, 130, 246, 0.05);
border: 1px solid rgba(59, 130, 246, 0.2);
border-radius: 12px;
padding: 20px;
```

**Conteúdo:**
```
💡 Dica: Créditos comprados não expiram no plano Professional. 
Considere fazer upgrade se usar mais de 200 créditos/mês.
```

**Link "Ver planos":**
```css
color: #3B82F6;
hover: underline;
```

---

## Footer

### Layout
```css
display: flex;
justify-content: space-between;
align-items: center;
padding: 24px 32px;
border-top: 1px solid #E9EBEF;
background: #FAFAFA;
```

### Total Display

**Esquerda:**
```html
<div>
  <span class="label">Total:</span>
  <span class="value">R$ 99,90</span>
  <span class="credits">150 créditos</span>
</div>
```

**Direita:**
```html
<button>Cancelar</button>
<button>Comprar agora →</button>
```

**Botão Primário:**
```css
background: #030213;
color: white;
height: 48px;
padding: 0 32px;
border-radius: 8px;
```

Estados:
- Default
- Hover: `bg-[#252525]`
- Loading: "Processando..." com spinner
- Disabled: `bg-[#CBCED4]` + cursor-not-allowed

---

## Trust Badges

**Container:**
```css
opacity: 0.6;
display: flex;
gap: 24px;
justify-content: center;
padding: 16px 32px;
```

**3 Badges:**

1. **Pagamento Seguro**
   - Icon: Shield (14px, #10B981)
   - Text: "Pagamento seguro"

2. **Créditos Instantâneos**
   - Icon: Clock (14px, #3B82F6)
   - Text: "Créditos instantâneos"

3. **Sem Renovação**
   - Icon: RefreshCw (14px, #F59E0B)
   - Text: "Sem renovação automática"

---

## Props Interface

```typescript
interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (packageId: string) => void;
  onViewPlans?: () => void;
  currentBalance?: number;
}
```

### Prop Details

**`isOpen`**
- Type: `boolean`
- Required: ✅
- Controla visibilidade do modal

**`onClose`**
- Type: `() => void`
- Required: ✅
- Callback ao fechar (X ou backdrop)

**`onPurchase`**
- Type: `(packageId: string) => void`
- Required: ✅
- Callback ao confirmar compra
- packageId: 'starter' | 'popular' | 'pro'

**`onViewPlans`**
- Type: `() => void`
- Optional
- Callback para "Ver planos" na info section

**`currentBalance`**
- Type: `number`
- Default: `2`
- Saldo atual de créditos do usuário

---

## Uso Básico

```tsx
import BuyCreditsModal from './components/BuyCreditsModal';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [credits, setCredits] = useState(2);

  const handlePurchase = (packageId: string) => {
    const packages = {
      starter: 50,
      popular: 150,
      pro: 300
    };
    
    // Processar pagamento (Stripe, etc)
    const creditsAdded = packages[packageId];
    setCredits(prev => prev + creditsAdded);
    setShowModal(false);
    
    // Mostrar success toast
    toast.success(`+${creditsAdded} créditos adicionados!`);
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Comprar Créditos
      </button>

      <BuyCreditsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPurchase={handlePurchase}
        onViewPlans={() => router.push('/pricing')}
        currentBalance={credits}
      />
    </>
  );
}
```

---

## Triggers (Quando Abrir)

### 1. Settings → Billing
```tsx
<button onClick={() => setShowBuyCreditsModal(true)}>
  💳 Comprar créditos avulsos
</button>
```

### 2. Banner "Créditos Baixos"
```tsx
<TrialEndedBanner
  variant="credits-low"
  onCtaClick={() => setShowBuyCreditsModal(true)}
/>
```

### 3. Credit Limit Modal
```tsx
<CreditLimitModal
  onBuyCredits={() => {
    setCreditLimitModal(false);
    setShowBuyCreditsModal(true);
  }}
/>
```

### 4. Editor - Créditos Insuficientes
```tsx
if (credits < 1) {
  setShowBuyCreditsModal(true);
}
```

---

## Fluxo de Compra

### 1. Abertura do Modal
```
User click → Modal abre com animação fadeIn + slideUp
Default: pacote "Popular" pre-selecionado
```

### 2. Seleção de Pacote
```
User click em card → 
- Border muda para preto (3px)
- Background muda para #FAFAFA
- Radio button preenche
- Footer atualiza com total
```

### 3. Confirmação
```
User click "Comprar agora" →
- Botão muda para "Processando..." com spinner
- onPurchase(packageId) é chamado
- Simula delay (1.5s)
```

### 4. Sucesso
```
onPurchase completa →
- Modal fecha
- Credits atualizam no App
- Toast success: "+150 créditos adicionados!"
- (Opcional) Confetti animation
```

---

## Integrações

### Com Stripe

```typescript
const handlePurchase = async (packageId: string) => {
  setIsProcessing(true);
  
  try {
    const response = await fetch('/api/create-credits-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId,
        userId: user.id
      })
    });
    
    const { sessionId } = await response.json();
    
    // Redirect para Stripe Checkout
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId });
    
  } catch (error) {
    console.error('Erro:', error);
    toast.error('Erro ao processar pagamento');
  } finally {
    setIsProcessing(false);
  }
};
```

### Com Backend

```typescript
// POST /api/credits/purchase
{
  "userId": "user_123",
  "packageId": "popular",
  "credits": 150,
  "price": 99.90,
  "paymentMethod": "stripe"
}

// Response
{
  "success": true,
  "newBalance": 152,
  "transactionId": "txn_456"
}
```

---

## Responsividade

### Desktop (1920px)
```
Modal: 640px width
Grid: 3 columns
Padding: generoso
```

### Tablet (768px)
```
Modal: 90% width
Grid: 3 columns (compacto)
Padding: reduzido
```

### Mobile (375px)
```
Modal: 95% width
Grid: 1 column (vertical)
Cards: full width
Footer: vertical stack
Trust badges: 2 linhas
```

**Breakpoints:**
```css
@media (max-width: 768px) {
  .packages-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 16px;
  }
}
```

---

## Acessibilidade

### Keyboard Navigation

**Tab Order:**
1. Close button (X)
2. Package 1 card
3. Package 2 card
4. Package 3 card
5. "Ver planos" link
6. Cancelar button
7. Comprar button

**Enter/Space:**
- Ativa seleção de pacote
- Confirma compra

**Escape:**
- Fecha modal

### Screen Reader

```html
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Comprar Créditos</h2>
  
  <div role="radiogroup" aria-label="Pacotes de créditos">
    <button role="radio" aria-checked="false">
      50 créditos por R$ 39,90
    </button>
  </div>
</div>
```

### ARIA Labels

```tsx
<button aria-label="Fechar modal">
  <X />
</button>

<div aria-live="polite">
  Total: R$ 99,90
</div>
```

---

## Animações

### Modal Entrance

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Duração:**
- Backdrop: 200ms fadeIn
- Container: 300ms slideUp

### Card Hover

```css
transition: all 200ms ease;

hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}
```

### Badge Pulse (Opcional)

```css
@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.05); }
}

.badge {
  animation: pulse 2s infinite;
}
```

---

## Variações

### Black Friday / Promoção

```tsx
const blackFridayPackages = [
  {
    id: 'starter',
    credits: 50,
    price: 29.90, // 25% off
    originalPrice: 39.90,
    badge: { text: '25% OFF', color: 'red' }
  }
];
```

### Bundle com Plano

```tsx
<div className="promo-section">
  <p>💡 Economize mais assinando o plano Professional</p>
  <button>Ver planos com créditos inclusos</button>
</div>
```

---

## Testing Checklist

### Visual
- [ ] Modal centralizado
- [ ] Backdrop blur visível
- [ ] Ícone gradient correto
- [ ] Badge "Melhor Valor" posicionado
- [ ] Radio buttons funcionam
- [ ] Hover states corretos
- [ ] Footer alinhado

### Funcional
- [ ] Fechar com X
- [ ] Fechar com backdrop
- [ ] Fechar com ESC
- [ ] Selecionar pacotes
- [ ] Total atualiza
- [ ] Botão disabled quando nada selecionado
- [ ] Loading state
- [ ] onPurchase callback funciona

### Responsivo
- [ ] Desktop OK
- [ ] Tablet OK
- [ ] Mobile OK
- [ ] Grid adapta
- [ ] Footer empilha

### A11y
- [ ] Tab navigation
- [ ] Screen reader
- [ ] ARIA labels
- [ ] Focus visible

---

## Status

✅ **IMPLEMENTADO**  
📝 **DOCUMENTADO**  
🧪 **READY FOR TESTING**

---

## Próximas Melhorias

### Fase 2: Promoções
- [ ] Sistema de cupons de desconto
- [ ] Timer countdown para ofertas
- [ ] Badge "Última chance"

### Fase 3: Personalização
- [ ] Quantidade customizada
- [ ] Slider de créditos
- [ ] Calculadora de economia

### Fase 4: Gamificação
- [ ] Primeiro comprador badge
- [ ] Loyalty rewards
- [ ] Referral credits

---

## Referências

- Design inspirado em: Stripe, Linear, Notion
- Pacotes baseados em: análise de mercado SaaS
- Pricing psychology: decoy pricing (pacote do meio mais atrativo)
