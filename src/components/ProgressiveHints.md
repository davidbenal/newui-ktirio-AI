# Progressive Hints System

Sistema de dicas contextuais que aparecem progressivamente conforme o usuário usa a aplicação, ajudando a descobrir features importantes sem ser invasivo.

## Filosofia

**Guardrails:**
- ✅ Não ser invasivo - pequeno, discreto, facilmente dismissível
- ✅ Aparecer uma vez por feature - não repetir
- ✅ Pode ser dismissed - usuário tem controle
- ✅ Salvar no localStorage - persistir estado entre sessões
- ✅ Contextual - aparece no momento certo

## Arquitetura

```
/hooks/useProgressiveHints.ts
  └── Custom hook para gerenciar estado (localStorage)

/components/ProgressiveHint.tsx
  └── Componente visual de hint (tooltip dark)

/components/CreditsWarningHint.tsx
  └── Componente especial para warning de créditos (Toast-based)

Gallery.tsx / Editor.tsx
  └── Integração e triggers dos hints
```

---

## Hook: useProgressiveHints

### Propósito

Gerenciar estado de quais hints o usuário já viu, com persistência em localStorage.

### API

```typescript
export type HintId = 
  | 'download-image'      // Hint sobre download
  | 'comparison-slider'   // Hint sobre comparação antes/depois
  | 'history-saved'       // Hint sobre histórico
  | 'credits-warning';    // Warning sobre créditos

const {
  hasSeenHint,      // (hintId) => boolean
  markHintAsSeen,   // (hintId) => void
  resetHints,       // () => void - Reseta todos
  resetHint         // (hintId) => void - Reseta um específico
} = useProgressiveHints();
```

### Implementação

```typescript
interface HintState {
  seen: Record<HintId, boolean>;
}

const STORAGE_KEY = 'ktirio-hints-seen';

// Load from localStorage on mount
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    setHintsState(JSON.parse(stored));
  }
}, []);

// Save to localStorage on change
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hintsState));
}, [hintsState]);
```

### LocalStorage Structure

```json
{
  "seen": {
    "download-image": true,
    "comparison-slider": false,
    "history-saved": true,
    "credits-warning": false
  }
}
```

### Uso

```typescript
import { useProgressiveHints } from '../hooks/useProgressiveHints';

function MyComponent() {
  const { hasSeenHint, markHintAsSeen } = useProgressiveHints();

  // Check if hint was seen
  if (!hasSeenHint('download-image')) {
    // Show hint
  }

  // Mark as seen when dismissed
  const handleDismiss = () => {
    markHintAsSeen('download-image');
  };
}
```

---

## Component: ProgressiveHint

### Propósito

Componente visual de hint - tooltip escuro com texto, botão X e posicionamento dinâmico.

### Props

```typescript
interface ProgressiveHintProps {
  isVisible: boolean;           // Controla visibilidade
  onDismiss: () => void;        // Callback ao dismissar
  text: string;                 // Texto do hint
  position?: HintPosition;      // 'top' | 'bottom' | 'left' | 'right'
  targetSelector?: string;      // CSS selector do elemento alvo
  showArrow?: boolean;          // Mostrar seta animada
  delay?: number;               // Delay antes de aparecer (ms)
  autoDismissDelay?: number;    // Auto-dismiss após N ms (opcional)
}
```

### Estrutura Visual

**Container:**
```css
position: fixed (quando targetSelector)
z-index: 200
background: #030213
color: white
border-radius: 8px
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3)
padding: 10px 12px
max-width: 280px
display: flex
align-items: center
gap: 10px
```

**Layout:**
```
[Text.....................] [Arrow?] [X]
```

**Text:**
```
Font-size: 13px
Line-height: 1.4
Color: white
Flex: 1
```

**Arrow (opcional):**
```
ArrowRight icon (Lucide)
Size: 16px
Color: white
Animate: pulse
```

**Close Button:**
```
Size: 20x20px
Hover: bg-white/10
Icon: X (14px)
```

**Pointer (visual indicator):**
```css
/* Para position="bottom" */
.pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #030213;
  rotate: 45deg;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}
```

Similar para `top`, `left`, `right`.

### Positioning Logic

```typescript
const updatePosition = () => {
  const target = document.querySelector(targetSelector);
  const hint = hintRef.current;
  
  const targetRect = target.getBoundingClientRect();
  const hintRect = hint.getBoundingClientRect();
  const padding = 12;

  let top, left;

  switch (position) {
    case 'bottom':
      top = targetRect.bottom + padding;
      left = targetRect.left + (targetRect.width / 2) - (hintRect.width / 2);
      break;
    case 'top':
      top = targetRect.top - hintRect.height - padding;
      left = targetRect.left + (targetRect.width / 2) - (hintRect.width / 2);
      break;
    case 'right':
      top = targetRect.top + (targetRect.height / 2) - (hintRect.height / 2);
      left = targetRect.right + padding;
      break;
    case 'left':
      top = targetRect.top + (targetRect.height / 2) - (hintRect.height / 2);
      left = targetRect.left - hintRect.width - padding;
      break;
  }

  // Keep within viewport
  setCoords({
    top: Math.min(Math.max(top, 16), window.innerHeight - hintRect.height - 16),
    left: Math.min(Math.max(left, 16), window.innerWidth - hintRect.width - 16)
  });
};
```

**Event Listeners:**
- Window resize → update position
- Window scroll → update position
- Cleanup on unmount

### Animations

**Fade in:**
```css
opacity: 0 → 1
transform: translateY(-8px) → translateY(0)
transition: 200ms ease-out
```

**Auto-dismiss:**
```typescript
useEffect(() => {
  if (!isShowing || !autoDismissDelay) return;

  const timer = setTimeout(() => {
    handleDismiss(); // Fade out + callback
  }, autoDismissDelay);

  return () => clearTimeout(timer);
}, [isShowing, autoDismissDelay]);
```

### Uso

```typescript
import ProgressiveHint from './ProgressiveHint';

<ProgressiveHint
  isVisible={showHint && !hasSeenHint('download-image')}
  onDismiss={() => {
    setShowHint(false);
    markHintAsSeen('download-image');
  }}
  text="Clique para baixar em alta resolução"
  position="bottom"
  targetSelector=".download-button"
  delay={500}
  autoDismissDelay={8000}
/>
```

---

## Component: CreditsWarningHint

### Propósito

Hint especial para avisar sobre créditos, usando Toast ao invés de tooltip.

### Props

```typescript
interface CreditsWarningHintProps {
  creditsUsed: number;
  creditsTotal: number;
  hasSeenHint: (hintId: HintId) => boolean;
  markHintAsSeen: (hintId: HintId) => void;
  onViewPlans?: () => void;
}
```

### Lógica

```typescript
useEffect(() => {
  const percentageUsed = (creditsUsed / creditsTotal) * 100;
  
  // Trigger at 50% usage
  if (percentageUsed >= 50 && !hasSeenHint('credits-warning')) {
    showWarning(
      'Atenção aos créditos',
      `Você usou ${creditsUsed} de ${creditsTotal} créditos gratuitos`,
      {
        label: 'Ver planos',
        onClick: onViewPlans
      }
    );

    markHintAsSeen('credits-warning');
  }
}, [creditsUsed, creditsTotal]);
```

**Características:**
- Renderiza `null` (não tem UI própria)
- Usa Toast system para notificação
- Trigger: 50% dos créditos usados
- CTA: "Ver planos" (opcional)
- Marca automaticamente como visto após mostrar

### Uso

```typescript
import CreditsWarningHint from './CreditsWarningHint';

<CreditsWarningHint
  creditsUsed={3}
  creditsTotal={5}
  hasSeenHint={hasSeenHint}
  markHintAsSeen={markHintAsSeen}
  onViewPlans={() => setCurrentView('pricing')}
/>
```

---

## Hints Implementados

### Hint 1: Download de Imagem

**Trigger:** Mouse hover no resultado pela primeira vez  
**Position:** Próximo ao botão download  
**Text:** "Clique para baixar em alta resolução"

```typescript
// Em Editor.tsx
const [showDownloadHint, setShowDownloadHint] = useState(false);

<div 
  className="result-image-container hint-download-button"
  onMouseEnter={() => {
    if (!hasSeenHint('download-image')) {
      setShowDownloadHint(true);
    }
  }}
>
  {/* Image result */}
</div>

<ProgressiveHint
  isVisible={showDownloadHint}
  onDismiss={() => {
    setShowDownloadHint(false);
    markHintAsSeen('download-image');
  }}
  text="Clique para baixar em alta resolução"
  position="bottom"
  targetSelector=".hint-download-button"
  delay={300}
  autoDismissDelay={8000}
/>
```

---

### Hint 2: Comparação Antes/Depois

**Trigger:** Segunda imagem gerada  
**Position:** Próximo ao toggle  
**Text:** "Arraste para comparar antes e depois"

```typescript
// Em Editor.tsx
const [imagesGenerated, setImagesGenerated] = useState(0);
const [showComparisonHint, setShowComparisonHint] = useState(false);

useEffect(() => {
  if (imagesGenerated === 2 && !hasSeenHint('comparison-slider')) {
    setShowComparisonHint(true);
  }
}, [imagesGenerated, hasSeenHint]);

<ProgressiveHint
  isVisible={showComparisonHint}
  onDismiss={() => {
    setShowComparisonHint(false);
    markHintAsSeen('comparison-slider');
  }}
  text="Arraste para comparar antes e depois"
  position="top"
  targetSelector=".hint-comparison-toggle"
  showArrow={true}
  delay={1000}
  autoDismissDelay={10000}
/>
```

---

### Hint 3: Histórico

**Trigger:** Terceira imagem gerada  
**Position:** Sidebar ou menu  
**Text:** "Todas as suas criações ficam salvas aqui"

```typescript
// Em Gallery.tsx
const [imagesGenerated, setImagesGenerated] = useState(0);
const [showHistoryHint, setShowHistoryHint] = useState(false);

useEffect(() => {
  if (imagesGenerated === 3 && !hasSeenHint('history-saved')) {
    setShowHistoryHint(true);
  }
}, [imagesGenerated, hasSeenHint]);

// Nav item com classe
<button className="nav-item hint-history-nav">
  Galeria
</button>

<ProgressiveHint
  isVisible={showHistoryHint}
  onDismiss={() => {
    setShowHistoryHint(false);
    markHintAsSeen('history-saved');
  }}
  text="Todas as suas criações ficam salvas aqui"
  position="right"
  targetSelector=".hint-history-nav"
  delay={1000}
  autoDismissDelay={8000}
/>
```

---

### Hint 4: Créditos

**Trigger:** 50% dos créditos usados  
**Type:** Toast (não tooltip)  
**Text:** "Você usou 3 de 5 créditos gratuitos"  
**CTA:** "Ver planos"

```typescript
// Em Gallery.tsx
const [creditsUsed, setCreditsUsed] = useState(0);

const handleGenerateImage = () => {
  setCreditsUsed(prev => prev + 1);
  // ...
};

<CreditsWarningHint
  creditsUsed={creditsUsed}
  creditsTotal={5}
  hasSeenHint={hasSeenHint}
  markHintAsSeen={markHintAsSeen}
  onViewPlans={() => setCurrentView('pricing')}
/>
```

---

## Fluxo Completo

### Primeira Sessão

```
User abre app (localStorage vazio)
  ↓
hintsState = { seen: {} }
  ↓
Usuário gera primeira imagem
  ↓
Hover no resultado
  ↓
hasSeenHint('download-image') = false
  ↓
Hint 1 aparece: "Clique para baixar..."
  ↓
Usuário dismisss (clica X)
  ↓
markHintAsSeen('download-image')
  ↓
localStorage: { seen: { "download-image": true } }
  ↓
Usuário gera segunda imagem
  ↓
imagesGenerated = 2
  ↓
hasSeenHint('comparison-slider') = false
  ↓
Hint 2 aparece: "Arraste para comparar..."
  ↓
Auto-dismiss após 10s
  ↓
markHintAsSeen('comparison-slider')
  ↓
localStorage: { seen: { "download-image": true, "comparison-slider": true } }
  ↓
Usuário gera terceira imagem
  ↓
imagesGenerated = 3, creditsUsed = 3
  ↓
hasSeenHint('history-saved') = false
  ↓
Hint 3 aparece: "Todas suas criações..."
  ↓
hasSeenHint('credits-warning') = false
creditsUsed/creditsTotal = 60% (>50%)
  ↓
Toast warning aparece: "Você usou 3 de 5..."
  ↓
markHintAsSeen ambos
  ↓
localStorage completo
```

### Sessão Subsequente

```
User abre app
  ↓
localStorage carregado
hintsState = { seen: { all true } }
  ↓
hasSeenHint('download-image') = true
  ↓
Hint NÃO aparece
  ↓
Continua usando app normalmente
  ↓
Nenhum hint reaparece
```

---

## Z-Index Hierarchy

```
0-99    - Content (Gallery, Editor)
100     - ProgressChecklist
140-150 - ContextualTooltip
200     - ProgressiveHint ← AQUI
3000+   - SuccessCelebration
```

**Razão:**
- Acima de tooltips contextuais (first-time)
- Abaixo de modals de celebração
- Sempre visível mas não bloqueia

---

## Target Selectors

**Classes sugeridas para elementos alvo:**

```css
/* Gallery.tsx */
.hint-history-nav         /* Nav item Galeria */

/* Editor.tsx */
.hint-download-button     /* Botão download */
.hint-comparison-toggle   /* Toggle de comparação */
.hint-style-picker        /* Seletor de estilos */
.hint-generate-button     /* Botão gerar */
```

**Adicionadas como:**
```tsx
<button className="... hint-download-button">
  <Download />
  Baixar
</button>
```

---

## Testing

### Manual Testing

```
1. Reset hints:
   - Click "💡 Reset Hints" button
   - OU abrir DevTools → Application → LocalStorage → Delete "ktirio-hints-seen"

2. Test Hint 1 (Download):
   - Gerar imagem (✨ Gerar)
   - TODO: Add hover trigger in Editor
   - Hint aparece: "Clique para baixar..."
   - Dismissar (X)
   - localStorage updated

3. Test Hint 2 (Comparison):
   - Gerar segunda imagem
   - TODO: Add in Editor
   - Hint aparece: "Arraste para comparar..."
   - Esperar 10s (auto-dismiss)

4. Test Hint 3 (History):
   - Gerar terceira imagem
   - Hint aparece próximo a "Galeria" nav
   - "Todas suas criações..."
   - Dismissar

5. Test Hint 4 (Credits):
   - Gerar terceira imagem (3/5 = 60%)
   - Toast warning aparece
   - "Você usou 3 de 5 créditos"
   - CTA "Ver planos"

6. Reload page:
   - Nenhum hint reaparece
   - localStorage persistido
```

### Automated Testing (Future)

```typescript
describe('ProgressiveHints', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows download hint on first hover', () => {
    // ...
  });

  it('marks hint as seen when dismissed', () => {
    // ...
  });

  it('does not show hint twice', () => {
    // ...
  });

  it('persists state in localStorage', () => {
    // ...
  });
});
```

---

## Customização

### Adicionar Novo Hint

**1. Adicionar HintId:**
```typescript
// hooks/useProgressiveHints.ts
export type HintId = 
  | 'download-image'
  | 'comparison-slider'
  | 'history-saved'
  | 'credits-warning'
  | 'new-feature-hint';  // ← NEW
```

**2. Adicionar Trigger:**
```typescript
// No componente relevante
const [showNewHint, setShowNewHint] = useState(false);

useEffect(() => {
  if (someCondition && !hasSeenHint('new-feature-hint')) {
    setShowNewHint(true);
  }
}, [someCondition, hasSeenHint]);
```

**3. Renderizar Hint:**
```tsx
<ProgressiveHint
  isVisible={showNewHint}
  onDismiss={() => {
    setShowNewHint(false);
    markHintAsSeen('new-feature-hint');
  }}
  text="Nova feature disponível!"
  position="bottom"
  targetSelector=".hint-new-feature"
  delay={500}
  autoDismissDelay={8000}
/>
```

**4. Adicionar Target Class:**
```tsx
<button className="... hint-new-feature">
  Nova Feature
</button>
```

---

## A/B Testing Sugestões

### Teste 1: Hint Timing

**A (atual):** Delay 300-1000ms  
**B:** Delay 0ms (imediato)  
**C:** Delay 2000ms (mais tarde)

**Métrica:** Engagement rate

---

### Teste 2: Auto-Dismiss

**A (atual):** 8-10s  
**B:** Sem auto-dismiss (só manual)  
**C:** 5s (mais rápido)

**Métrica:** Completion rate

---

### Teste 3: Visual Style

**A (atual):** Dark tooltip (#030213)  
**B:** Light tooltip (white + shadow)  
**C:** Gradient tooltip

**Métrica:** Attention rate

---

### Teste 4: Arrow Animation

**A (atual):** Pulse  
**B:** Bounce  
**C:** Sem arrow

**Métrica:** Click-through rate

---

## Analytics

### Eventos Sugeridos

```typescript
// Hint shown
analytics.track('Progressive Hint Shown', {
  hint_id: 'download-image',
  position: 'bottom',
  has_auto_dismiss: true,
  timestamp: new Date().toISOString()
});

// Hint dismissed manually
analytics.track('Progressive Hint Dismissed', {
  hint_id: 'download-image',
  method: 'manual',
  time_shown: 3500, // ms
});

// Hint auto-dismissed
analytics.track('Progressive Hint Dismissed', {
  hint_id: 'download-image',
  method: 'auto',
  time_shown: 8000,
});

// Hint CTA clicked (e.g., credits warning)
analytics.track('Progressive Hint CTA Clicked', {
  hint_id: 'credits-warning',
  cta_label: 'Ver planos',
});
```

### KPIs

**Show Rate:**
- % de usuários que veem cada hint
- Meta: >70% veem pelo menos 1 hint

**Dismiss Rate:**
- % de dismisses manuais vs auto
- Meta: <30% dismiss manual (indica não é irritante)

**Engagement Rate:**
- % que clicam CTA quando aplicável
- Meta: >40% para credits warning

**Completion Rate:**
- % que veem hint até auto-dismiss
- Meta: >60%

---

## Accessibility

### Keyboard Support

```typescript
// TODO: Add keyboard navigation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      onDismiss();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isVisible, onDismiss]);
```

### ARIA

```tsx
<div
  role="tooltip"
  aria-live="polite"
  aria-label={text}
>
  {text}
</div>
```

### Screen Reader

**Anúncio:**
```
"Dica: Clique para baixar em alta resolução. Pressione Escape para fechar."
```

---

## Performance

### Otimizações

**LocalStorage:**
- Read: 1x on mount
- Write: Only on change
- JSON parse/stringify: Negligible

**Positioning:**
- Calculated only when visible
- Event listeners added/removed efficiently
- Debounced on scroll/resize (TODO)

**Re-renders:**
- Conditional rendering (`if (!isVisible) return null`)
- No unnecessary state updates

---

## Troubleshooting

### Problema: Hint não aparece

**Causa 1:** Já foi visto  
**Solução:** Reset hints (localStorage clear)

**Causa 2:** Target selector não encontrado  
**Solução:** Verificar classe no elemento

**Causa 3:** Trigger não acionado  
**Solução:** Debug trigger logic (console.log)

---

### Problema: Posição errada

**Causa:** Target element ainda não renderizado  
**Solução:** Adicionar delay

```tsx
<ProgressiveHint
  delay={500}  // ← Espera elemento renderizar
  ...
/>
```

---

### Problema: Hint persiste após dismiss

**Causa:** markHintAsSeen não chamado  
**Solução:** Garantir callback no onDismiss

```tsx
onDismiss={() => {
  setShowHint(false);
  markHintAsSeen('hint-id');  // ← Importante!
}}
```

---

## Melhorias Futuras

### Short-term

1. **Debounce positioning**
   - Evitar cálculos excessivos
   - Performance em scroll

2. **Hint queue**
   - Múltiplos hints em sequência
   - Evitar overlap

3. **Analytics integration**
   - Track show/dismiss events

### Medium-term

4. **Smart timing**
   - ML-based timing optimization
   - Adaptar ao comportamento do usuário

5. **A/B testing built-in**
   - Variantes configuráveis
   - Metrics dashboard

6. **Hint priority**
   - Mostrar hints mais importantes primeiro
   - Skip hints menos relevantes

### Long-term

7. **Personalization**
   - Hints baseados em persona
   - Diferentes hints para fotógrafos vs designers

8. **Interactive hints**
   - Click to reveal more info
   - Mini-tutorial embedded

9. **Gamification**
   - "Descobriu 4/10 features"
   - Badge system

---

## Conclusão

O **Progressive Hints System** é uma ferramenta poderosa para:

✅ Educação contextual do usuário  
✅ Feature discovery  
✅ Redução de churn  
✅ Melhoria de UX  
✅ Não intrusivo  
✅ Persistente (localStorage)  
✅ Facilmente extensível  
✅ Testável  

**Próximos passos:**
1. Integrar Hint 1 e 2 no Editor.tsx
2. Adicionar analytics tracking
3. A/B test timing e styling
4. Coletar feedback dos usuários
5. Iterar e melhorar
