# Soft Paywall

## Visão Geral

Sistema de paywall "suave" que permite ao usuário VER o resultado, mas em qualidade limitada ou com restrições visuais. Diferente de hard paywalls que bloqueiam completamente, o soft paywall mostra um preview e incentiva o upgrade de forma mais amigável.

## Quando Usar

**Ideal para:**
- Features de export em alta resolução
- Processamento em lote (batch)
- Remoção de marca d'água
- Qualquer feature onde o preview tem valor

**Evitar para:**
- Features core do produto
- Funcionalidades que não podem ser "previewadas"
- Quando o bloqueio total é necessário (use FeatureLockModal)

## Componente

**Arquivo:** `/components/SoftPaywall.tsx`

### Props

```typescript
interface SoftPaywallProps {
  variant: SoftPaywallVariant;
  onUpgrade: () => void;
  onViewPlans?: () => void;
  
  // High Resolution props
  previewImage?: string;
  currentResolution?: string;  // Default: '1024px'
  lockedResolution?: string;   // Default: '4096px'
  
  // Batch Processing props
  selectedCount?: number;       // Default: 10
  previewImages?: string[];
  
  // Watermark props
  children?: React.ReactNode;   // Para watermark variant
}
```

### Variants

```typescript
type SoftPaywallVariant = 
  | 'high-resolution'      // Preview com blur + unlock card
  | 'batch-processing'     // Modal com preview limitado
  | 'watermark-removal';   // Hover overlay + comparação
```

## Variações

---

## VARIAÇÃO 1: Alta Resolução com Blur

### Descrição

Mostra o resultado gerado, mas com `blur(8px)` e `opacity: 0.7`. Card centralizado oferece unlock para resolução 4K.

### Design System

**Preview Container:**
- Position: relative
- Width: 100%
- Aspect-ratio: preservar original

**Blurred Image:**
```css
filter: blur(8px);
opacity: 0.7;
pointer-events: none;
```

**Overlay Gradient:**
```css
background: linear-gradient(
  to bottom,
  transparent 0%,
  rgba(0,0,0,0.3) 50%,
  rgba(0,0,0,0.6) 100%
);
```

**Unlock Card:**
- Width: 320px (80 / 20rem)
- Background: #FFFFFF
- Border-radius: 16px (rounded-2xl)
- Box-shadow: 0 12px 32px rgba(0,0,0,0.2)
- Padding: 24px (p-6)
- Text-align: center
- Backdrop-filter: blur(12px)

**Icon Container:**
- Size: 56x56px (14rem)
- Background: #F3F3F5
- Border-radius: 12px
- Padding: 12px
- Icon: Lock, 32px, #030213

**Título:**
- Text: "Alta resolução bloqueada"
- Font: Inter Bold 18px
- Color: #030213
- Margin-bottom: 8px

**Descrição:**
- Text: "Faça upgrade para exportar em 4K"
- Font: Inter Regular 13px
- Color: #717182
- Margin-bottom: 20px

**Resolution Comparison:**

Layout: flex horizontal, justify-center, gap 12px

*Current (Free):*
- Icon: Check (verde, 14px)
- Text: "1024px"
- Font: Inter Medium 12px
- Color: #717182
- Badge: "Atual" (bg-gray-100)

*Locked (Pro):*
- Icon: Lock (14px)
- Text: "4096px"
- Font: Inter Bold 13px
- Color: #030213
- Badge: "Pro" (bg-#030213, text-white)

**CTA Button:**
- Text: "Desbloquear agora"
- Width: 100%
- Height: 44px
- Background: #030213
- Color: white
- Border-radius: 8px
- Icon: Unlock (esquerda)
- Font: Inter Bold 14px

**Link (opcional):**
- Text: "Ver comparação de planos"
- Font: Inter Regular 11px
- Color: #717182
- Margin-top: 12px

### Uso

```typescript
<SoftPaywall
  variant="high-resolution"
  onUpgrade={() => setCurrentView('pricing')}
  onViewPlans={() => openPricingComparison()}
  previewImage={generatedImageUrl}
  currentResolution="1024px"
  lockedResolution="4096px"
/>
```

### Casos de Uso

1. **Export em Alta Resolução**
   - Usuário gera imagem no Editor
   - Clica em "Exportar 4K"
   - Soft paywall aparece sobre o preview

2. **Download Premium**
   - Gallery > Projeto > Download
   - Opção "Alta qualidade" bloqueada
   - Preview mostra resultado blur

---

## VARIAÇÃO 2: Batch Processing Preview

### Descrição

Modal que aparece quando usuário tenta processar múltiplas imagens em lote. Mostra preview das primeiras 3 imagens, restante com overlay "+7 mais" blur.

### Design System

**Modal Container:**
- Width: 480px
- Max-width: 90vw
- Background: white
- Border-radius: 16px (rounded-2xl)
- Padding: 32px (p-8)
- Position: fixed center
- Z-index: 1000

**Preview List:**
- Display: flex
- Gap: 8px (gap-2)
- Margin-bottom: 24px

*Preview Item:*
- Flex: 1
- Aspect-ratio: 1/1
- Border-radius: 8px
- Background: gray-100

*Remaining Count Overlay:*
- Background: gray-900
- Gradient: from-gray-800 to-gray-900
- Text: "+{count} mais"
- Font: 24px bold / 11px regular
- Color: white
- Text-align: center

**Icon Container:**
- Size: 56x56px
- Background: #F3F3F5
- Border-radius: 12px
- Icon: Layers, 32px, #030213
- Margin: 0 auto 16px

**Título:**
- Text: "Processamento em lote"
- Font: Inter Bold 20px
- Color: #030213
- Text-align: center

**Descrição:**
- Text: "Processe até 50 imagens simultaneamente"
- Font: Inter Regular 14px
- Color: #717182
- Text-align: center

**Benefits List:**

Layout: vertical stack, gap 12px

*Benefit Item:*
- Display: flex
- Align-items: center
- Gap: 12px

Icon (checkmark):
- Size: 20x20px
- Background: green-100
- Border-radius: 50%
- Check icon: 12px, green-600

Text:
- Font: Inter Regular 14px
- Color: #030213

**Benefits:**
1. ✓ Economize 80% do tempo
2. ✓ Fila de prioridade
3. ✓ Notificações automáticas

**Pricing Box:**
- Background: #F3F3F5
- Border-radius: 12px
- Padding: 16px
- Text-align: center
- Margin-bottom: 24px

*Content:*
- Label: "Disponível no plano" (13px, #717182)
- Plan: "Professional" (18px bold, #030213)
- Price: "R$ 89/mês" (14px, #717182)

**CTA Button:**
- Text: "Fazer upgrade"
- Width: 100%
- Height: 48px
- Background: #030213
- Color: white
- Border-radius: 8px
- Icon: ArrowRight (direita)
- Font: Inter Bold 15px

### Uso

```typescript
<SoftPaywall
  variant="batch-processing"
  onUpgrade={() => setCurrentView('pricing')}
  selectedCount={10}
  previewImages={[img1, img2, img3]}
/>
```

### Casos de Uso

1. **Batch Staging Virtual**
   - Gallery > Seleciona 10 projetos
   - Clica "Aplicar staging em todos"
   - Modal aparece com preview

2. **Bulk Export**
   - Seleciona múltiplas imagens
   - Tenta exportar todas
   - Paywall mostra limitação

---

## VARIAÇÃO 3: Watermark Removal Preview

### Descrição

Imagem completa visível, mas com marca d'água "Ktírio AI". Hover mostra overlay convidando para upgrade. Click abre modal com comparação lado a lado.

### Design System

**Container:**
- Position: relative
- Width: 100%
- Cursor: pointer
- Group (para hover states)

**Watermark Badge:**
- Position: absolute
- Bottom: 16px
- Right: 16px
- Background: white/90
- Backdrop-filter: blur(sm)
- Padding: 6px 12px
- Border-radius: 8px
- Box-shadow: lg

*Content:*
- Icon: Sparkles (14px, #030213)
- Text: "Ktírio AI"
- Font: Inter Bold 11px
- Color: #030213

**Hover Overlay:**
```css
position: absolute;
inset: 0;
background: rgba(0,0,0,0.7);
backdrop-filter: blur(4px);
opacity: 0 → 1 (transition 200ms);
```

**Floating Tooltip (on hover):**
- Background: white
- Border-radius: 12px
- Padding: 12px 16px
- Box-shadow: 2xl
- Display: flex
- Align-items: center
- Gap: 12px

*Content:*
- Icon: EyeOff (20px, #030213)
- Text: "Remova a marca d'água"
- Font: Inter Medium 13px
- CTA inline: "Upgrade →" (bold, #030213)

**Comparison Modal (on click):**

Container:
- Width: 600px
- Max-width: 90vw
- Background: white
- Border-radius: 16px
- Padding: 32px

Icon:
- Size: 56x56px
- Background: #F3F3F5
- Icon: EyeOff, 32px

Título: "Remova a marca d'água"
Descrição: "Exporte suas imagens sem marca d'água em qualquer plano pago"

**Comparison Grid:**
- Grid: 2 columns
- Gap: 16px
- Margin-bottom: 24px

*With Watermark (Free):*
- Aspect-ratio: 16/9
- Image com watermark no canto
- Label: "Plano Free" (12px, #717182)

*Without Watermark (Paid):*
- Aspect-ratio: 16/9
- Image limpa
- Ring: 2px green-500 com offset
- Icon: Check (green)
- Label: "Planos Pagos" (12px bold, #030213)

**CTAs:**
- Primary: "Fazer upgrade agora" (full width)
- Secondary: "Fechar" (text button)

### Uso

```typescript
<SoftPaywall
  variant="watermark-removal"
  onUpgrade={() => setCurrentView('pricing')}
  previewImage={imageUrl}
>
  <img src={imageUrl} alt="Preview" className="w-full" />
</SoftPaywall>
```

### Casos de Uso

1. **Free Plan Results**
   - Usuário free gera imagem
   - Resultado aparece com watermark
   - Hover sugere upgrade

2. **Download com Watermark**
   - Ao baixar, versão tem marca
   - Tooltip explica como remover

---

## Integração

### No Editor

```typescript
const handleExportHighRes = () => {
  if (userPlan === 'free' || userPlan === 'starter') {
    setShowSoftPaywall('high-resolution');
  } else {
    // Exportar em 4K
    exportImage(4096);
  }
};

// Render
{showSoftPaywall === 'high-resolution' && (
  <SoftPaywall
    variant="high-resolution"
    onUpgrade={() => {
      setCurrentView('pricing');
    }}
    onViewPlans={() => {
      openPricingComparison();
    }}
    previewImage={currentImage}
  />
)}
```

### Na Gallery

```typescript
const handleBatchProcess = () => {
  if (selectedProjects.length > 3 && userPlan !== 'professional') {
    setShowSoftPaywall('batch-processing');
  } else {
    processBatch(selectedProjects);
  }
};

// Render
{showSoftPaywall === 'batch-processing' && (
  <SoftPaywall
    variant="batch-processing"
    onUpgrade={() => {
      setCurrentView('pricing');
    }}
    selectedCount={selectedProjects.length}
    previewImages={selectedProjects.slice(0, 3).map(p => p.thumbnail)}
  />
)}
```

### Plano Free (Watermark Global)

```typescript
// Em todo resultado gerado
const ResultImage = ({ url }: { url: string }) => {
  if (userPlan === 'free') {
    return (
      <SoftPaywall
        variant="watermark-removal"
        onUpgrade={() => setCurrentView('pricing')}
        previewImage={url}
      >
        <img src={url} alt="Result" className="w-full rounded-lg" />
      </SoftPaywall>
    );
  }
  
  return <img src={url} alt="Result" className="w-full rounded-lg" />;
};
```

## Comparação: Soft vs Hard Paywall

| Aspecto | Soft Paywall | Hard Paywall (FeatureLockModal) |
|---------|--------------|----------------------------------|
| **Preview** | ✓ Visível (limitado) | ✗ Bloqueado completamente |
| **UX** | Menos frustante | Mais frustante |
| **Conversão** | Médio-alto (vê valor) | Baixo-médio (não vê valor) |
| **Ideal para** | Export, quality, watermark | API, collaboration, features core |
| **Quando usar** | Feature tem preview útil | Feature não pode ser previewada |

## Estratégia de Pricing

### Free Plan
- ✓ Gera imagens (com watermark)
- ✓ Exporta até 1024px
- ✓ 5 créditos/mês
- ✗ Batch processing
- ✗ Alta resolução
- ✗ Sem watermark

### Starter Plan
- ✓ Sem watermark
- ✓ Exporta até 2048px
- ✓ 100 créditos/mês
- ✗ Batch processing
- ✗ 4K export

### Professional Plan
- ✓ Tudo do Starter
- ✓ Batch processing (até 50)
- ✓ 4K export (4096px)
- ✓ 500 créditos/mês
- ✓ Fila prioritária

## Animações

### Fade In (Modals)

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 200ms ease-out;
}
```

### Hover Transitions

```css
/* Watermark overlay */
transition: opacity 200ms ease-out;

/* CTA buttons */
transition: all 150ms ease-out;
hover:bg-[#030213]/90
```

## Métricas Sugeridas

Trackear:
- **Impression rate:** % de usuários que veem paywall
- **Click-through rate:** % que clicam no CTA
- **Conversion rate:** % que completam upgrade
- **Dismiss rate:** % que fecham sem ação
- **Variant performance:** Qual variação converte melhor

### Eventos

```typescript
// Analytics
trackEvent('soft_paywall_shown', {
  variant: 'high-resolution',
  user_plan: 'free',
  feature: 'export_4k',
});

trackEvent('soft_paywall_cta_clicked', {
  variant: 'high-resolution',
  destination: 'pricing',
});

trackEvent('soft_paywall_dismissed', {
  variant: 'high-resolution',
  time_shown: 5.2, // segundos
});
```

## A/B Testing

### Teste 1: Blur Intensity
- **Variante A:** blur(8px) - atual
- **Variante B:** blur(4px) - menos intenso
- **Métrica:** Conversion rate

### Teste 2: CTA Copy
- **Variante A:** "Desbloquear agora"
- **Variante B:** "Ver planos"
- **Variante C:** "Upgrade para 4K"
- **Métrica:** Click-through rate

### Teste 3: Resolution Numbers
- **Variante A:** "1024px → 4096px"
- **Variante B:** "HD → 4K"
- **Variante C:** "Básico → Ultra HD"
- **Métrica:** Engagement + conversion

## Responsividade

### Mobile (<768px)

**High Resolution:**
- Card width: 90vw (max 320px mantido)
- Padding: 16px
- Font-sizes: mantidos

**Batch Processing:**
- Modal width: 90vw
- Preview grid: 3 colunas mantido
- Padding: 20px

**Watermark:**
- Tooltip: stack vertical
- Modal: 90vw
- Comparison: stack vertical (grid-cols-1)

## Acessibilidade

- Alto contraste em todos os textos
- Focus visible em CTAs
- Keyboard navigation
- Screen reader friendly
- Alt texts em imagens

## Próximos Passos

Possíveis expansões:
1. **Video Export Paywall** - Preview em baixa qualidade
2. **AI Credits Paywall** - Preview de 1 resultado, restante bloqueado
3. **Download Formats** - PNG free, PSD/AI pagos
4. **History/Versions** - Últimas 3 visíveis, restante blur

## Observações

- **Menos agressivo** que hard paywall
- **Mais efetivo** para features visuais
- **Mostra valor** antes de pedir pagamento
- **Educacional** - compara planos lado a lado
- **Não-obstrutivo** - usuário ainda pode usar app
