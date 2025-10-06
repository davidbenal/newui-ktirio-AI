# First Project Guided Experience

Sistema completo de onboarding para usuários de primeira vez, composto por 3 componentes integrados que guiam o usuário até completar sua primeira geração de imagem.

## Visão Geral

A First Project Experience (FPE) é ativada quando `isFirstTime={true}` e substitui o empty state padrão por uma experiência guiada que inclui:

1. **FirstProjectGuide** - Empty state animado e chamativo
2. **ProgressChecklist** - Checklist flutuante com progresso visual
3. **ContextualTooltips** - Dicas que aparecem automaticamente

## Arquitetura

```
App.tsx
  ├── State: isFirstTimeUser, hasCompletedFirstProject
  └── Gallery.tsx
        ├── Props: isFirstTime, onFirstProjectComplete
        ├── State: checklistProgress, activeTooltip, showFirstProjectGuide
        ├── Component: FirstProjectGuide (quando isEmpty && isFirstTime)
        ├── Component: ProgressChecklist (floating, sempre visível)
        └── Component: ContextualTooltip (condicional, baseado em tempo/ação)
```

## Componentes

---

### 1. FirstProjectGuide.tsx

**Propósito:** Substituir empty state padrão com design mais engajador e call-to-action claro.

#### Props

```typescript
interface FirstProjectGuideProps {
  onUpload: () => void;         // Callback ao clicar "Fazer upload"
  onViewExamples: () => void;   // Callback ao clicar "Ver exemplos"
}
```

#### Estrutura Visual

**Container Principal:**
```css
display: flex
align-items: center
justify-content: center
min-height: 600px
text-align: center
max-width: 600px
```

**Animated Illustration:**
- Size: 240x240px (w-60 h-60)
- Background: Gradient azul-roxo (`from-blue-50 to-purple-50`)
- Border-radius: 24px (rounded-3xl)
- Animation: `animate-breathing` (4s ease-in-out infinite)

**Breathing Animation:**
```css
@keyframes breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

**Background Pattern:**
- 4 quadrados decorativos coloridos
- Opacity: 10%
- Cores: blue-400, purple-400, pink-400, indigo-400
- Posicionados aleatoriamente

**Main Icon:**
- Upload icon (Lucide)
- Size: 48px (w-12 h-12)
- Cor: blue-500 (#3B82F6)
- Container: 96x96px white rounded-2xl com shadow

**Sparkle Effects:**
- 2 sparkles (Lucide)
- Sizes: 32px e 24px
- Cores: yellow-400, purple-400
- Animation: `animate-pulse` com delays diferentes
- Posicionados nos cantos

**Título:**
```
Text: "Crie sua primeira transformação"
Font-size: 28px
Font-weight: 600
Color: #030213
Margin-bottom: 12px
```

**Descrição:**
```
Text: "Faça upload de uma foto e veja a mágica acontecer em segundos"
Font-size: 16px
Line-height: 1.6
Color: #717182
Max-width: 480px
Margin: 0 auto 32px
```

**Primary CTA:**
```css
width: 280px
height: 56px
background: #030213
color: white
border-radius: 12px
font-size: 16px
font-weight: 500
box-shadow: 0 4px 12px rgba(3, 2, 19, 0.2)
display: flex
align-items: center
justify-content: center
gap: 12px

hover:
  transform: scale(1.05)
  
active:
  transform: scale(1.0)
```

Com:
- Upload icon à esquerda
- Gradient overlay no hover (from-blue-500 via-purple-500)

**Secondary CTA:**
```css
margin-top: 16px
font-size: 14px
font-weight: 500
color: #030213
hover: text-decoration underline
```

Text: "Ver exemplos antes"

#### Uso

```tsx
import FirstProjectGuide from './FirstProjectGuide';

<FirstProjectGuide
  onUpload={() => {
    // Handle upload - marcar checklist como completo
    setChecklistProgress(prev => ({ ...prev, uploadedPhoto: true }));
  }}
  onViewExamples={() => {
    // Mostrar galeria de exemplos
  }}
/>
```

---

### 2. ProgressChecklist.tsx

**Propósito:** Card flutuante que mostra progresso do usuário nos 3 primeiros passos.

#### Props

```typescript
export interface ChecklistProgress {
  uploadedPhoto: boolean;
  selectedStyle: boolean;
  generatedImage: boolean;
}

interface ProgressChecklistProps {
  progress: ChecklistProgress;
  onDismiss?: () => void;  // Chamado quando todos os 3 completados
}
```

#### Estrutura Visual

**Container (expanded):**
```css
position: fixed
bottom: 24px
right: 24px
width: 280px
background: #FFFFFF
border-radius: 16px
padding: 20px
z-index: 100
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12)
animation: slideUp 300ms ease-out
```

**Container (minimized):**
```css
width: 56px
height: 56px
border-radius: 16px
display: flex
align-items: center
justify-content: center
```

Com progress ring SVG circular mostrando N/3 no centro.

**Header:**
```
Title: "Primeiros passos"
Font-size: 14px
Font-weight: 500
Color: #252525

+ Minimize button (ChevronDown icon)
  Size: 24x24px
  Hover: bg-gray-100
```

**Progress Bar:**
```css
height: 6px
background: #E9EBEF
border-radius: 9999px
margin-bottom: 16px

fill:
  width: 0% → 33% → 66% → 100%
  background: linear-gradient(to right, #3B82F6, #8B5CF6)
  transition: all 500ms ease-out
```

**Steps (3 items):**

Cada step tem:

```tsx
<div className="flex items-center gap-[10px]">
  {/* Checkbox */}
  <div className={`
    w-[18px] h-[18px]
    rounded
    border-2
    flex items-center justify-center
    transition-all
    ${completed 
      ? 'bg-[#10B981] border-[#10B981]' 
      : 'bg-white border-[#E9EBEF]'
    }
  `}>
    {completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
  </div>

  {/* Text */}
  <span className={`
    transition-all
    ${completed 
      ? 'text-[#252525] line-through' 
      : 'text-[#717182]'
    }
  `} style={{ fontSize: '13px' }}>
    {label}
  </span>
</div>
```

**Lista de Steps:**
1. ☐ Fazer upload de foto
2. ☐ Escolher estilo
3. ☐ Gerar primeira imagem

**Completion Message (quando 3/3):**
```tsx
<div className="mt-4 pt-4 border-t border-gray-100">
  <div className="flex items-center gap-2 text-[#10B981]">
    <Check className="w-4 h-4" />
    <span style={{ fontSize: '13px', fontWeight: 500 }}>
      Tudo pronto! Continue criando.
    </span>
  </div>
</div>
```

Após 2 segundos com 3/3, chama `onDismiss()` automaticamente.

#### Estados do Checklist

```typescript
// Initial state (nada feito)
{
  uploadedPhoto: false,
  selectedStyle: false,
  generatedImage: false
}

// After upload
{
  uploadedPhoto: true,   // ✓
  selectedStyle: false,
  generatedImage: false
}

// After style selection
{
  uploadedPhoto: true,   // ✓
  selectedStyle: true,   // ✓
  generatedImage: false
}

// Complete
{
  uploadedPhoto: true,   // ✓
  selectedStyle: true,   // ✓
  generatedImage: true   // ✓
}
// → Auto-dismiss após 2s
// → Chama onDismiss()
// → isFirstTime = false
```

#### Minimized State

**Progress Ring:**
```tsx
<svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
  {/* Background circle */}
  <circle
    cx="20" cy="20" r="16"
    fill="none"
    stroke="#E9EBEF"
    strokeWidth="3"
  />
  
  {/* Progress circle */}
  <circle
    cx="20" cy="20" r="16"
    fill="none"
    stroke="#10B981"
    strokeWidth="3"
    strokeDasharray={`${progressPercentage * 1.005} 100.5`}
    strokeLinecap="round"
  />
</svg>

{/* Center text */}
<div className="absolute inset-0 flex items-center justify-center">
  <span style={{ fontSize: '10px', fontWeight: 600 }}>
    {completedCount}/3
  </span>
</div>
```

**Cálculo do Progress:**
```typescript
const completedCount = steps.filter(s => s.completed).length;
const progressPercentage = (completedCount / steps.length) * 100;
// 0/3 = 0%
// 1/3 = 33%
// 2/3 = 66%
// 3/3 = 100%
```

#### Uso

```tsx
import ProgressChecklist from './ProgressChecklist';

const [progress, setProgress] = useState<ChecklistProgress>({
  uploadedPhoto: false,
  selectedStyle: false,
  generatedImage: false
});

<ProgressChecklist
  progress={progress}
  onDismiss={() => {
    // User completed all steps
    setIsFirstTime(false);
    console.log('✅ First project completed!');
  }}
/>
```

---

### 3. ContextualTooltip.tsx

**Propósito:** Tooltips contextuais que aparecem automaticamente para guiar o usuário.

#### Props

```typescript
export type TooltipType = 
  | 'upload-hint'        // Após 10s sem upload
  | 'choose-style'       // Após upload
  | 'ready-to-generate'; // Após escolher estilo

interface ContextualTooltipProps {
  type: TooltipType;
  onDismiss: () => void;
  targetSelector?: string; // CSS selector do elemento alvo
}
```

#### Configuração dos Tooltips

```typescript
const TOOLTIP_CONFIG: Record<TooltipType, {
  text: string;
  icon?: React.ReactNode;
  autoDismissDelay?: number;
  showArrow?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = {
  'upload-hint': {
    text: 'Dica: Funciona melhor com fotos de quartos, salas e cozinhas vazios',
    autoDismissDelay: 8000,
    position: 'bottom'
  },
  'choose-style': {
    text: 'Ótimo! Agora escolha um estilo',
    icon: <ArrowRight className="w-4 h-4" />,
    autoDismissDelay: 6000,
    showArrow: true,
    position: 'right'
  },
  'ready-to-generate': {
    text: 'Tudo pronto! Clique para ver a mágica ✨',
    autoDismissDelay: 10000,
    position: 'top'
  }
};
```

#### Estrutura Visual

**Container:**
```css
position: fixed (se targetSelector fornecido)
position: relative (fallback)
max-width: 320px
background: #FFFFFF
border-radius: 12px
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15)
border: 1px solid #E5E7EB
padding: 12px 16px
z-index: 150
display: flex
align-items: center
gap: 12px

/* Fade in animation */
opacity: 0 → 1
transform: translateY(-10px) → translateY(0)
transition: 200ms ease-out
```

**Layout:**
```
[Icon] [Text........................] [X]
```

**Icon (opcional):**
- Size: 16px
- Color: #030213
- Flex-shrink: 0

**Text:**
```css
flex: 1
font-size: 13px
line-height: 1.5
color: #252525
```

**Close Button:**
```css
width: 20px
height: 20px
flex-shrink: 0
border-radius: 4px
hover: background #F3F3F5
```

Com X icon (14px).

**Arrow Indicator (opcional):**

Quando `showArrow: true` e `position: 'right'`:

```tsx
<div className="absolute left-full ml-2 animate-pulse">
  <ArrowRight className="w-5 h-5 text-[#030213]" />
</div>
```

Aponta para o elemento alvo.

#### Posicionamento Dinâmico

```typescript
const updatePosition = () => {
  const element = document.querySelector(targetSelector);
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const tooltipWidth = 320;
  const tooltipHeight = 60;
  const padding = 16;

  let top = 0;
  let left = 0;

  switch (position) {
    case 'bottom':
      top = rect.bottom + padding;
      left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      break;
    case 'top':
      top = rect.top - tooltipHeight - padding;
      left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      break;
    case 'right':
      top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      left = rect.right + padding;
      break;
    case 'left':
      top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      left = rect.left - tooltipWidth - padding;
      break;
  }

  // Ensure stays in viewport
  const maxLeft = window.innerWidth - tooltipWidth - 20;
  const maxTop = window.innerHeight - tooltipHeight - 20;

  setPosition({
    top: Math.min(Math.max(top, 20), maxTop),
    left: Math.min(Math.max(left, 20), maxLeft)
  });
};
```

**Listeners:**
- Atualiza no resize
- Atualiza no scroll
- Cleanup automático

#### Auto-Dismiss

```typescript
useEffect(() => {
  if (config.autoDismissDelay) {
    const timer = setTimeout(() => {
      handleDismiss();
    }, config.autoDismissDelay);

    return () => clearTimeout(timer);
  }
}, []);

const handleDismiss = () => {
  setIsVisible(false); // Fade out
  setTimeout(onDismiss, 200); // Wait for animation
};
```

#### Uso

```tsx
import ContextualTooltip from './ContextualTooltip';

const [activeTooltip, setActiveTooltip] = useState<TooltipType | null>(null);

// Trigger tooltip programmatically
useEffect(() => {
  if (!uploadedPhoto) {
    const timer = setTimeout(() => {
      setActiveTooltip('upload-hint');
    }, 10000);
    return () => clearTimeout(timer);
  }
}, [uploadedPhoto]);

{activeTooltip && (
  <ContextualTooltip
    type={activeTooltip}
    onDismiss={() => setActiveTooltip(null)}
    targetSelector=".tour-upload-area"
  />
)}
```

---

## Fluxo Completo da Experiência

### 1. Usuário entra na app pela primeira vez

```
App.tsx:
  isFirstTimeUser = true
  hasCompletedFirstProject = false

→ Gallery recebe:
  isFirstTime = true
  
→ Gallery state:
  showFirstProjectGuide = true
  checklistProgress = { all false }
  activeTooltip = null
```

### 2. Tela inicial (Empty State)

```
Gallery renderiza:
  ✓ FirstProjectGuide (centralizado)
  ✓ ProgressChecklist (bottom-right, 0/3)
  ✗ ContextualTooltip (ainda não)

Usuário vê:
  - Ilustração animada breathing
  - "Crie sua primeira transformação"
  - Botão grande "Fazer upload de foto"
  - Link "Ver exemplos antes"
  - Card "Primeiros passos" flutuante
```

### 3. Após 10 segundos sem ação

```
useEffect triggers:
  setActiveTooltip('upload-hint')

ContextualTooltip aparece:
  Position: próximo ao botão upload
  Text: "Dica: Funciona melhor com fotos de quartos..."
  Auto-dismiss: 8 segundos
```

### 4. Usuário clica "Fazer upload"

```
handleUploadPhoto() executado:
  ✓ setChecklistProgress({ uploadedPhoto: true })
  ✓ setShowFirstProjectGuide(false)
  ✓ showInfo('Upload', '...')

FirstProjectGuide desaparece (não é mais empty)
ProgressChecklist atualiza: 1/3 ✓

Após 1 segundo:
  setActiveTooltip('choose-style')
  
ContextualTooltip aparece:
  Position: próximo à galeria de estilos
  Text: "Ótimo! Agora escolha um estilo →"
  Icon: ArrowRight
  Arrow: apontando para galeria
  Auto-dismiss: 6 segundos
```

### 5. Usuário escolhe estilo

```
handleSelectStyle() executado:
  ✓ setChecklistProgress({ 
      uploadedPhoto: true, 
      selectedStyle: true 
    })

ProgressChecklist atualiza: 2/3 ✓✓

Após 1 segundo:
  setActiveTooltip('ready-to-generate')
  
ContextualTooltip aparece:
  Position: acima do botão gerar
  Text: "Tudo pronto! Clique para ver a mágica ✨"
  Auto-dismiss: 10 segundos
```

### 6. Usuário gera primeira imagem

```
handleGenerateImage() executado:
  ✓ setChecklistProgress({ 
      uploadedPhoto: true,
      selectedStyle: true,
      generatedImage: true
    })
  ✓ onFirstProjectComplete() chamado
  ✓ showSuccess('Primeira imagem gerada!', '...')

ProgressChecklist atualiza: 3/3 ✓✓✓
  → Mostra mensagem "Tudo pronto! Continue criando."
  → Após 2 segundos: onDismiss()

App.tsx recebe onFirstProjectComplete():
  setHasCompletedFirstProject(true)
  setIsFirstTimeUser(false)

Na próxima renderização:
  isFirstTime = false
  → ProgressChecklist não renderiza
  → Tooltips não aparecem
  → FirstProjectGuide não aparece (usa EmptyStateGallery padrão)

✅ Experiência completa!
```

---

## Integração na Gallery

### State Management

```typescript
// First-time user experience state
const [showFirstProjectGuide, setShowFirstProjectGuide] = useState(isFirstTime);

const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({
  uploadedPhoto: false,
  selectedStyle: false,
  generatedImage: false
});

const [activeTooltip, setActiveTooltip] = useState<TooltipType | null>(null);

const [tooltipDismissed, setTooltipDismissed] = useState<Record<TooltipType, boolean>>({
  'upload-hint': false,
  'choose-style': false,
  'ready-to-generate': false
});
```

### Tooltips Logic (useEffect)

```typescript
useEffect(() => {
  if (!isFirstTime || !showFirstProjectGuide) return;

  // Tooltip 1: Show upload hint after 10s if no upload
  if (!checklistProgress.uploadedPhoto && !tooltipDismissed['upload-hint']) {
    const timer = setTimeout(() => {
      setActiveTooltip('upload-hint');
    }, 10000);
    return () => clearTimeout(timer);
  }

  // Tooltip 2: Show style hint after upload
  if (checklistProgress.uploadedPhoto && !checklistProgress.selectedStyle && !tooltipDismissed['choose-style']) {
    const timer = setTimeout(() => {
      setActiveTooltip('choose-style');
    }, 1000);
    return () => clearTimeout(timer);
  }

  // Tooltip 3: Show generate hint after style selected
  if (checklistProgress.selectedStyle && !checklistProgress.generatedImage && !tooltipDismissed['ready-to-generate']) {
    const timer = setTimeout(() => {
      setActiveTooltip('ready-to-generate');
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [isFirstTime, showFirstProjectGuide, checklistProgress, tooltipDismissed]);
```

### Handlers

```typescript
const handleUploadPhoto = () => {
  setChecklistProgress(prev => ({ ...prev, uploadedPhoto: true }));
  setShowFirstProjectGuide(false);
  showInfo('Upload', 'Funcionalidade de upload em desenvolvimento.');
};

const handleSelectStyle = () => {
  setChecklistProgress(prev => ({ ...prev, selectedStyle: true }));
};

const handleGenerateImage = () => {
  setChecklistProgress(prev => ({ ...prev, generatedImage: true }));
  if (onFirstProjectComplete) {
    onFirstProjectComplete();
  }
  showSuccess('Primeira imagem gerada!', 'Continue criando transformações incríveis.');
};

const handleDismissTooltip = (type: TooltipType) => {
  setActiveTooltip(null);
  setTooltipDismissed(prev => ({ ...prev, [type]: true }));
};
```

### Renderização Condicional

```tsx
{/* Empty State */}
{isEmpty ? (
  // ... outros empty states ...
  showFirstProjectGuide && isFirstTime ? (
    <FirstProjectGuide
      onUpload={handleUploadPhoto}
      onViewExamples={() => showInfo('Exemplos', '...')}
    />
  ) : (
    <EmptyStateGallery
      onNewProject={() => showInfo('Novo projeto', '...')}
      onViewExamples={() => showInfo('Exemplos', '...')}
    />
  )
) : (
  // ... grade de projetos ...
)}

{/* First-Time User Experience */}
{isFirstTime && !checklistProgress.generatedImage && (
  <>
    {/* Progress Checklist */}
    <ProgressChecklist
      progress={checklistProgress}
      onDismiss={() => {
        if (onFirstProjectComplete) {
          onFirstProjectComplete();
        }
      }}
    />

    {/* Contextual Tooltips */}
    {activeTooltip && (
      <div className="fixed inset-0 pointer-events-none z-[140] flex items-center justify-center p-4">
        <div className="pointer-events-auto">
          <ContextualTooltip
            type={activeTooltip}
            onDismiss={() => handleDismissTooltip(activeTooltip)}
            targetSelector={
              activeTooltip === 'upload-hint' ? '.tour-upload-area' :
              activeTooltip === 'choose-style' ? '.tour-styles-gallery' :
              activeTooltip === 'ready-to-generate' ? '.tour-generate-button' :
              undefined
            }
          />
        </div>
      </div>
    )}
  </>
)}
```

---

## Botões de Teste

Para facilitar o desenvolvimento, foram adicionados botões de teste na Gallery:

```tsx
{/* Test buttons for first-time experience */}
{isFirstTime && (
  <>
    <button
      onClick={handleUploadPhoto}
      className="bg-green-500 text-white px-3 py-2 rounded-lg"
      title="Simular Upload"
    >
      📸 Upload
    </button>
    <button
      onClick={handleSelectStyle}
      className="bg-yellow-500 text-white px-3 py-2 rounded-lg"
      title="Simular Escolha de Estilo"
    >
      🎨 Estilo
    </button>
    <button
      onClick={handleGenerateImage}
      className="bg-red-500 text-white px-3 py-2 rounded-lg"
      title="Simular Geração"
    >
      ✨ Gerar
    </button>
  </>
)}

{/* Reset First-Time Experience */}
{!isFirstTime && onResetFirstTime && (
  <button
    onClick={() => {
      onResetFirstTime();
      setShowFirstProjectGuide(true);
      setChecklistProgress({ all false });
      setTooltipDismissed({ all false });
    }}
    className="bg-orange-500 text-white px-3 py-2 rounded-lg"
    title="Resetar experiência de primeira vez"
  >
    🔄 Reset
  </button>
)}
```

**Workflow de Teste:**

1. **Inicial:** Veja FirstProjectGuide + Checklist 0/3
2. **Clique 📸 Upload:** FirstProjectGuide desaparece, Checklist → 1/3, Tooltip "escolha estilo" aparece
3. **Clique 🎨 Estilo:** Checklist → 2/3, Tooltip "pronto para gerar" aparece
4. **Clique ✨ Gerar:** Checklist → 3/3, mensagem de sucesso, auto-dismiss após 2s
5. **Clique 🔄 Reset:** Volta ao estado inicial para testar novamente

---

## CSS Customizado

### Breathing Animation

Adicionado em `/styles/globals.css`:

```css
@keyframes breathing {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-breathing {
  animation: breathing 4s ease-in-out infinite;
}
```

**Uso:**
```tsx
<div className="animate-breathing">
  {/* Ilustração do FirstProjectGuide */}
</div>
```

**Efeito:**
- Escala de 1.0 → 1.05 → 1.0
- Duração: 4 segundos
- Timing: ease-in-out
- Loop: infinito
- Cria sensação de "respiração" suave

---

## Z-Index Hierarchy

```
Layer 1: Content (z-index: auto)
  ├── Gallery
  └── EmptyState

Layer 2: ProgressChecklist (z-index: 100)
  └── Floating card

Layer 3: ContextualTooltip wrapper (z-index: 140)
  └── Pointer-events-none overlay

Layer 4: ContextualTooltip content (z-index: 150)
  └── Pointer-events-auto tooltip

Layer 5: Modals/Tour (z-index: 2000+)
  ├── FeatureTour overlay (2000)
  ├── Spotlight (2001)
  └── Tooltip (2002)
```

**Razão:**
- ProgressChecklist deve estar acima do conteúdo mas abaixo de modals
- ContextualTooltip deve estar acima de ProgressChecklist mas abaixo de modals
- FeatureTour deve estar acima de tudo

---

## Performance Considerations

### FirstProjectGuide
- ✅ Renderizado apenas quando `isEmpty && isFirstTime`
- ✅ Breathing animation usa CSS puro (GPU accelerated)
- ✅ Sem re-renders desnecessários

### ProgressChecklist
- ✅ Renderizado apenas quando `isFirstTime && !generatedImage`
- ✅ Auto-dismiss remove componente após completar
- ✅ Minimized state reduz DOM complexity

### ContextualTooltip
- ✅ Renderizado apenas quando `activeTooltip !== null`
- ✅ Auto-dismiss remove componente
- ✅ Event listeners cleanup automático
- ✅ Posicionamento calculado apenas quando necessário

---

## Acessibilidade

### FirstProjectGuide

```tsx
<button
  onClick={onUpload}
  className="..."
  aria-label="Fazer upload de foto"
>
  {/* ... */}
</button>
```

- Botões com labels descritivos
- Alto contraste (WCAG AA)
- Tamanho de click target: 56px+ (WCAG AAA)

### ProgressChecklist

```tsx
<button
  onClick={() => setIsMinimized(!isMinimized)}
  aria-label={isMinimized ? "Expandir checklist" : "Minimizar checklist"}
>
  {/* ... */}
</button>
```

- ARIA labels dinâmicos
- Estado visual claro (✓ verde, line-through)
- Progress bar com boa acessibilidade de cor

### ContextualTooltip

```tsx
<button
  onClick={handleDismiss}
  aria-label="Fechar dica"
>
  <X />
</button>
```

- Dismiss button com label
- Auto-dismiss para não bloquear workflow
- Contraste adequado

---

## Analytics & Tracking

### Eventos Sugeridos

```typescript
// First Project Guide mostrado
analytics.track('First Project Guide Shown', {
  timestamp: new Date().toISOString()
});

// Usuário clicou "Fazer upload"
analytics.track('First Upload Clicked', {
  source: 'first_project_guide',
  timestamp: new Date().toISOString()
});

// Progresso do checklist
analytics.track('Checklist Progress', {
  step: 'upload' | 'style' | 'generate',
  progress: '1/3' | '2/3' | '3/3',
  timestamp: new Date().toISOString()
});

// Tooltip mostrado
analytics.track('Contextual Tooltip Shown', {
  type: 'upload-hint' | 'choose-style' | 'ready-to-generate',
  timestamp: new Date().toISOString()
});

// Tooltip dismissed (manual)
analytics.track('Contextual Tooltip Dismissed', {
  type: string,
  method: 'click' | 'auto',
  time_shown: number // ms
});

// First project completed
analytics.track('First Project Completed', {
  time_to_complete: number, // ms desde que viu FirstProjectGuide
  tooltips_shown: string[],
  tooltips_dismissed: string[],
  timestamp: new Date().toISOString()
});
```

### KPIs

**Completion Rate:**
- % de usuários que completam todos os 3 passos
- Meta: >70%

**Time to First Upload:**
- Tempo médio até clicar "Fazer upload"
- Meta: <60 segundos

**Time to Complete:**
- Tempo médio para completar 3/3 passos
- Meta: <5 minutos

**Tooltip Engagement:**
- % de usuários que veem cada tooltip
- % de usuários que dismiss manualmente vs auto

**Checklist Minimize Rate:**
- % de usuários que minimizam o checklist
- Identifica se está sendo intrusivo

---

## A/B Testing Sugestões

### Teste 1: FirstProjectGuide CTA

**A (atual):**
- "Fazer upload de foto" (primary)
- "Ver exemplos antes" (secondary)

**B:**
- "Começar agora" (primary)
- "Como funciona?" (secondary link para tour)

**C:**
- "Upload grátis" (emphasize free)
- "Ver galeria de exemplos" (secondary)

**Métrica:** Click-through rate no primary CTA

---

### Teste 2: Tooltip Timing

**A (atual):**
- Upload hint: 10s
- Style hint: 1s
- Generate hint: 1s

**B (mais agressivo):**
- Upload hint: 5s
- Style hint: 0.5s
- Generate hint: 0.5s

**C (mais passivo):**
- Upload hint: 20s
- Style hint: 3s
- Generate hint: 3s

**Métrica:** Completion rate + irritação (dismiss rate)

---

### Teste 3: Checklist Position

**A (atual):**
- Bottom-right

**B:**
- Bottom-left

**C:**
- Top-right

**Métrica:** Minimize rate + obstruction feedback

---

### Teste 4: Breathing Animation

**A (atual):**
- Breathing effect (scale 1.0 → 1.05)

**B:**
- Floating effect (translateY 0 → -10px)

**C:**
- Sem animação

**Métrica:** Engagement rate com FirstProjectGuide

---

## Troubleshooting

### Problema: Tooltip não aparece

**Causa 1:** Target selector não encontrado
```typescript
// Verificar se classe existe
const element = document.querySelector('.tour-upload-area');
console.log('Element found:', element);
```

**Solução:** Garantir que classes tour-* estão nos elementos corretos

**Causa 2:** Tooltip foi dismissed
```typescript
// Verificar estado
console.log('tooltipDismissed:', tooltipDismissed);
```

**Solução:** Reset estado com botão 🔄 Reset

---

### Problema: Checklist não atualiza

**Causa:** Estado não sendo propagado

**Debug:**
```typescript
console.log('checklistProgress:', checklistProgress);
```

**Solução:** Verificar se handlers estão sendo chamados corretamente

---

### Problema: FirstProjectGuide não aparece

**Causa:** Condição `isEmpty && isFirstTime` não satisfeita

**Debug:**
```typescript
console.log('isEmpty:', isEmpty);
console.log('isFirstTime:', isFirstTime);
console.log('showFirstProjectGuide:', showFirstProjectGuide);
```

**Solução:** Verificar props no App.tsx

---

## Melhorias Futuras

### Short-term

1. **Persistent state**
   - Salvar progresso no localStorage
   - Retomar de onde parou

2. **Skip option**
   - Botão "Pular tour" no FirstProjectGuide
   - Tracking de skip rate

3. **Customização por persona**
   - Fotógrafo: foco em qualidade
   - Corretor: foco em velocidade
   - Designer: foco em estilos

### Medium-term

4. **Interactive tutorial**
   - Overlay com highlight nos elementos
   - Usuário clica de verdade (não simulado)
   - Validação de ações

5. **Achievement system**
   - Badge "Primeira imagem criada"
   - Unlock de features especiais
   - Gamificação leve

6. **Video tutorial**
   - Alternativa ao FirstProjectGuide
   - 30s explicando o processo
   - Autoplay muted no empty state

### Long-term

7. **AI-powered hints**
   - Detectar confusão do usuário
   - Oferecer ajuda contextual
   - Adaptar velocidade do tour

8. **Progressive disclosure**
   - Revelar features gradualmente
   - Tours secundários para features avançadas
   - Onboarding em camadas

9. **Multi-device sync**
   - Progresso sincronizado entre devices
   - "Continue no desktop" prompt

---

## Arquivos Criados

```
/components/FirstProjectGuide.tsx       - Empty state guiado
/components/ProgressChecklist.tsx       - Checklist flutuante
/components/ContextualTooltip.tsx       - Tooltips contextuais
/components/FirstProjectExperience.md   - Documentação completa
/styles/globals.css                     - Breathing animation
```

## Arquivos Modificados

```
/components/Gallery.tsx   - Integração completa
/App.tsx                  - State management
```

---

## Conclusão

A **First Project Guided Experience** é um sistema completo de onboarding que:

✅ Reduz fricção inicial  
✅ Aumenta conversão (primeiro projeto)  
✅ Educação contextual (tooltips)  
✅ Feedback visual (checklist)  
✅ Design polido (animations, shadows)  
✅ Não intrusivo (dismissible, auto-hide)  
✅ Testável (botões de simulação)  
✅ Performático (renderização condicional)  
✅ Acessível (ARIA, contraste, sizes)  

**Next steps:**
1. Testar fluxo completo com usuários reais
2. Coletar métricas de completion rate
3. Iterar baseado em feedback
4. Expandir para outras features (Editor tour, etc)
