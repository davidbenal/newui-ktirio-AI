# Credit Limit Modal

## Visão Geral

Modal que aparece quando o usuário tenta gerar uma imagem mas não possui créditos disponíveis. Oferece opções claras para upgrade, compra de créditos avulsos ou aguardar o reset mensal.

## Trigger

- Usuário clica em "Gerar" no Editor
- Sistema verifica: `creditsUsed >= creditsTotal`
- Se verdadeiro, abre o modal ao invés de processar

## Componente

**Arquivo:** `/components/CreditLimitModal.tsx`

### Props

```typescript
interface CreditLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onBuyCredits: () => void;
  creditsUsed?: number;      // Padrão: 5
  creditsTotal?: number;     // Padrão: 5
  daysUntilReset?: number;   // Padrão: 23
}
```

## Design System

### Modal Structure

- **Overlay:** rgba(0,0,0,0.6) + backdrop-filter blur(4px)
- **Container:** 520px, branco, rounded-3xl, shadow-2xl
- **Padding:** 40px interno
- **Animações:** fadeIn (overlay) + slideUp (container)

### Icon Container

- **Size:** 80x80px
- **Background:** Gradiente laranja (#F59E0B → #D97706)
- **Icon:** Zap com pulse animation (2s infinite)
- **Shadow:** 0 8px 24px rgba(245, 158, 11, 0.3)

### Typography

- **Título:** 26px, Bold, #030213
- **Descrição:** 16px, Regular, #717182, line-height 1.6
- **Section titles:** 16px, Medium, #252525

### Credit Status Card

Display dos créditos restantes e data de reset:
- Background: #FAFAFA
- Border: 1px solid #E9EBEF
- Layout: flex horizontal com informações à esquerda e direita

### Options Cards

**1. Upgrade (Recomendado)**
- Background: Gradiente preto (#030213 → #252525)
- Badge verde "Recomendado" (#10B981)
- Ícone: Crown
- Hover: translateY(-2px)

**2. Comprar Créditos Avulsos**
- Background: Branco
- Border: 2px solid #E9EBEF
- Ícone: Plus
- Hover: border-color #CBCED4

**3. Aguardar Reset**
- Link simples, menor destaque
- Hover: underline + darkening

## Integração no Editor

### Verificação de Créditos

```typescript
const handleGenerate = () => {
  // Primeiro: Verificar créditos
  if (creditsUsed >= creditsTotal) {
    setShowCreditLimitModal(true);
    return;
  }
  
  // Depois: Validação de prompt
  if (!prompt.trim()) {
    showError('Prompt vazio', '...');
    return;
  }
  
  // Finalmente: Processar
  setIsGenerating(true);
  // ...
};
```

### Estado

```typescript
const [showCreditLimitModal, setShowCreditLimitModal] = useState(false);
const [creditsUsed, setCreditsUsed] = useState(0);
const creditsTotal = 5; // Free tier
```

## Fluxos de Ação

### 1. Upgrade
- Fecha modal
- Chama `onUpgrade()`
- Redireciona para Gallery com UpgradeModal aberto (context: 'credits')

### 2. Comprar Créditos
- Fecha modal
- Chama `onBuyCredits()`
- Atualmente: Toast "Funcionalidade em desenvolvimento"
- Futuro: Abrir modal de compra de créditos avulsos

### 3. Aguardar Reset
- Simplesmente fecha o modal
- Usuário volta ao Editor

### 4. Fechar (overlay ou ESC)
- Fecha modal
- Usuário volta ao Editor

## Estados e Contextos

### Free Tier (Padrão)
- Total: 5 créditos/mês
- Reset: Mensal
- Quando esgota: Mostra este modal

### Planos Pagos
- Pro: 200 créditos/mês
- Business: 1000 créditos/mês
- Enterprise: Ilimitado (não mostra modal)

## Acessibilidade

- Modal fecha com ESC ou clique fora
- Focus trap dentro do modal
- Todas as opções acessíveis via teclado
- Labels descritivos para screen readers

## Observações

- **Z-index:** 1000 (acima de tudo no Editor)
- **Backdrop blur:** Cria foco visual no modal
- **Animações:** Smooth, não abrupto
- **Responsivo:** Max-width 520px com margem lateral
- **Call-to-action:** Upgrade é a opção mais destacada visualmente
