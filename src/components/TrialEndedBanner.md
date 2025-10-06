# Trial Ended Banner

## Visão Geral

Banner fixo que aparece no topo do aplicativo quando o período de teste termina, créditos estão acabando, assinatura expirou ou há problemas com pagamento. Mantém o usuário informado sem bloquear a navegação.

## Quando Aparece

- **Trial Ended:** Período de teste gratuito terminou
- **Credits Low:** Créditos restantes abaixo do limite (ex: 1 de 5)
- **Plan Expired:** Assinatura expirou e precisa renovação
- **Payment Failed:** Problema com o método de pagamento cadastrado

## Componente

**Arquivo:** `/components/TrialEndedBanner.tsx`

### Props

```typescript
interface TrialEndedBannerProps {
  variant?: BannerVariant; // 'trial-ended' | 'credits-low' | 'plan-expired' | 'payment-failed'
  onCtaClick: () => void;
  onDismiss?: () => void;
  remainingCredits?: number; // Para variant 'credits-low'
  totalCredits?: number; // Para variant 'credits-low'
}
```

### Variants

```typescript
type BannerVariant = 'trial-ended' | 'credits-low' | 'plan-expired' | 'payment-failed';
```

## Design System

### Container

- **Position:** sticky
- **Top:** 0px
- **Width:** 100%
- **Z-index:** 999
- **Animation:** slideDown 300ms ease-out

### Variação 1: Trial Ended (Vermelho)

**Gradiente:** linear-gradient(135deg, #DC2626 → #B91C1C)  
**Shadow:** 0 4px 12px rgba(220, 38, 38, 0.2)

```typescript
{
  icon: AlertTriangle,
  title: 'Seu período de teste terminou',
  description: 'Faça upgrade para continuar gerando imagens incríveis',
  ctaText: 'Ver planos',
  credits: '0 créditos',
  showCredits: true
}
```

### Variação 2: Credits Low (Amarelo)

**Gradiente:** linear-gradient(135deg, #F59E0B → #D97706)  
**Shadow:** 0 4px 12px rgba(245, 158, 11, 0.2)

```typescript
{
  icon: AlertCircle,
  title: 'Seus créditos estão acabando',
  description: '1 de 5 créditos restantes', // Dinâmico
  ctaText: 'Comprar créditos',
  showCredits: false
}
```

### Variação 3: Plan Expired (Vermelho)

**Gradiente:** linear-gradient(135deg, #DC2626 → #B91C1C)  
**Shadow:** 0 4px 12px rgba(220, 38, 38, 0.2)

```typescript
{
  icon: XCircle,
  title: 'Sua assinatura expirou',
  description: 'Renove para continuar acessando',
  ctaText: 'Renovar agora',
  credits: '0 créditos',
  showCredits: true
}
```

### Variação 4: Payment Failed (Vermelho)

**Gradiente:** linear-gradient(135deg, #DC2626 → #B91C1C)  
**Shadow:** 0 4px 12px rgba(220, 38, 38, 0.2)

```typescript
{
  icon: CreditCard,
  title: 'Problema com pagamento',
  description: 'Atualize seus dados de pagamento',
  ctaText: 'Atualizar cartão',
  showCredits: false
}
```

## Layout Interno

### Inner Container

- **Max-width:** 1200px
- **Margin:** 0 auto
- **Padding:** 16px 24px
- **Display:** flex
- **Justify-content:** space-between
- **Align-items:** center
- **Gap:** 24px

### Left Section

**Layout:** flex horizontal, gap 16px, align-center

**Icon:**
- Size: 24px
- Color: white
- Animation: pulse 2s infinite

**Text Container:**
- Título: Inter Bold 16px, white
- Descrição: Inter Regular 13px, white/90
- Margin-bottom: 4px (título)

### Right Section

**Layout:** flex horizontal, gap 12px, align-center

**Credits Info (mini):**
- Background: rgba(0,0,0,0.2)
- Border-radius: 8px
- Padding: 6px 12px
- Icon: Zap (16px, white/80)
- Text: Inter Medium 13px, white/90
- Display: hidden em mobile, flex em md+

**CTA Button:**
- Background: white
- Color: #DC2626 (vermelho) ou #F59E0B (amarelo)
- Padding: 10px 24px
- Border-radius: 8px
- Font: Inter Bold 14px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Hover: scale(1.05), shadow aumenta
- Icon: ArrowRight (direita)

**Dismiss Button (X):**
- Size: 32x32px
- Border-radius: 6px
- Background: transparent
- Hover: rgba(255,255,255,0.1)
- Icon: X (18px, white/80)
- Tooltip: "Ocultar por hoje"

## Responsividade

### Mobile (<768px)

```css
flex-direction: column → Empilha elementos
text-align: center
gap: 12px
padding: 16px
description: hidden (sm:block)
credits-info: hidden
CTA: full width (w-full sm:w-auto)
```

### Tablet (768-1023px)

```css
flex-direction: horizontal mantido
padding: 12px 20px
font-sizes: mantidos
```

### Desktop (1024px+)

Layout completo conforme especificado

## Integração

### No App.tsx

```typescript
const [bannerVariant, setBannerVariant] = useState<BannerVariant | null>(null);
const [bannerDismissed, setBannerDismissed] = useState(false);

const handleBannerDismiss = () => {
  setBannerDismissed(true);
  const today = new Date().toDateString();
  localStorage.setItem('bannerDismissedDate', today);
};

const handleBannerCta = () => {
  if (bannerVariant === 'trial-ended' || bannerVariant === 'plan-expired') {
    setCurrentView('pricing');
  } else if (bannerVariant === 'credits-low') {
    setUpgradeModalContext('credits');
    setShouldOpenUpgradeModal(true);
  } else if (bannerVariant === 'payment-failed') {
    setCurrentView('settings');
  }
};

// Verificar se foi dismissado hoje
useEffect(() => {
  const dismissedDate = localStorage.getItem('bannerDismissedDate');
  const today = new Date().toDateString();
  
  if (dismissedDate === today) {
    setBannerDismissed(true);
  }
  
  // Verificar estado do usuário (API)
  // setBannerVariant('trial-ended');
}, []);

// Render
{bannerVariant && !bannerDismissed && currentView !== 'welcome' && (
  <TrialEndedBanner
    variant={bannerVariant}
    onCtaClick={handleBannerCta}
    onDismiss={handleBannerDismiss}
    remainingCredits={1}
    totalCredits={5}
  />
)}
```

### Lógica de Exibição

**Baseada em Estado do Usuário:**

```typescript
const checkBannerState = (user: User) => {
  // 1. Trial ended (prioridade alta)
  if (user.trialEnded && !user.isPaying) {
    return 'trial-ended';
  }
  
  // 2. Payment failed (prioridade alta)
  if (user.isPaying && user.paymentFailed) {
    return 'payment-failed';
  }
  
  // 3. Plan expired (prioridade alta)
  if (user.subscriptionExpired) {
    return 'plan-expired';
  }
  
  // 4. Credits low (prioridade média)
  const percentage = user.credits / user.totalCredits;
  if (percentage <= 0.2) { // 20% ou menos
    return 'credits-low';
  }
  
  return null; // Sem banner
};
```

## Comportamento

### Dismiss (Ocultar)

1. Usuário clica no botão X
2. Banner desaparece
3. Data de hoje salva em localStorage
4. Banner não reaparece no mesmo dia
5. Reaparece no próximo dia se condição persistir

### CTA Click

**Trial Ended / Plan Expired:**
- Redireciona para Pricing page
- Usuário escolhe plano

**Credits Low:**
- Abre UpgradeModal com context 'credits'
- Opções: comprar créditos avulsos ou upgrade

**Payment Failed:**
- Redireciona para Settings > Billing
- Usuário atualiza método de pagamento

## Animações

### Entrada (slideDown)

```css
@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 300ms ease-out;
}
```

### Icon Pulse

```typescript
animate-pulse // Tailwind built-in
animationDuration: '2s'
```

### Button Hover

```css
hover:scale-105
hover:shadow-lg
transition-all
```

## Testes (Developer Tools)

No painel Developer em Settings, há botões para testar cada variação:

1. **⏰ Trial Ended** - Banner vermelho de trial encerrado
2. **⚠️ Créditos Baixos** - Banner amarelo de warning
3. **❌ Plano Expirado** - Banner vermelho de assinatura expirada
4. **💳 Payment Failed** - Banner vermelho de pagamento

## Acessibilidade

- Alto contraste (texto branco em fundo vermelho/amarelo)
- Icon + text para redundância
- Focus visible em todos os botões
- Tooltip no botão dismiss
- Responsivo para todos os tamanhos de tela

## Z-index Hierarchy

```
999 - Trial Ended Banner (top sticky)
1000 - Feature Lock Modal
1001 - Upgrade Modal
1002 - Toast Notifications (mais alto)
```

## Estados Múltiplos

**Prioridade de Exibição:**

Se múltiplas condições são verdadeiras, mostrar nesta ordem:

1. Payment Failed (mais crítico)
2. Plan Expired
3. Trial Ended
4. Credits Low (menos crítico)

Apenas UM banner é exibido por vez.

## Variações Futuras

### Possíveis Novos Variants

**Maintenance Mode:**
```typescript
{
  gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  icon: Wrench,
  title: 'Manutenção programada',
  description: 'Sistema ficará indisponível das 02h às 04h',
  ctaText: 'Ver detalhes',
  showCredits: false
}
```

**New Features Available:**
```typescript
{
  gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  icon: Sparkles,
  title: 'Novas funcionalidades disponíveis',
  description: 'Confira as novidades do Ktírio AI',
  ctaText: 'Ver novidades',
  showCredits: false
}
```

## Observações

- **Não invasivo:** Não bloqueia conteúdo, sticky no topo
- **Informativo:** Clareza sobre o problema e solução
- **Acionável:** CTA direto para resolução
- **Dismissível:** Usuário pode ocultar temporariamente
- **Persistente:** Reaparece até problema ser resolvido
- **Performance:** CSS animations hardware-accelerated
- **Mobile-first:** Design responsivo desde o início

## Métricas Sugeridas

Trackear:
- Taxa de click no CTA por variant
- Taxa de dismiss por variant
- Tempo médio até resolução
- Conversão de trial-ended → paid user
- Recuperação de payment-failed
