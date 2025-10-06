# FeatureTour Component

Tour guiado interativo com 3 passos que ensina novos usuários a usar as principais funcionalidades da plataforma Ktírio AI.

## Propósito

1. **Onboarding efetivo** - Ensinar novos usuários rapidamente
2. **Highlight de features** - Destacar funcionalidades principais
3. **Reduzir abandono** - Guiar usuário até primeira conversão
4. **Baixo atrito** - Opção de pular a qualquer momento

## Props

```typescript
interface FeatureTourProps {
  isOpen: boolean;         // Controla visibilidade do tour
  onClose: () => void;     // Callback ao fechar/pular
  onComplete?: () => void; // Callback ao completar tour
}
```

## Estrutura Visual

### Overlay

```css
position: fixed
inset: 0
background: rgba(0, 0, 0, 0.8)
backdrop-filter: blur(4px)
z-index: 2000
```

**Comportamento:**
- Click no overlay fecha o tour (mesmo que "Pular")
- Blur de 4px para suavidade visual
- Cor escura mas não totalmente preta

### Spotlight Effect

```css
position: fixed
box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8)
border-radius: 12px (match do elemento)
transition: all 300ms ease-out
z-index: 2001
pointer-events: none
```

**Como funciona:**
- Usa box-shadow gigante para escurecer tudo ao redor
- Elemento original permanece visível "iluminado"
- Transição suave ao mudar de passo
- Border-radius match com o elemento destacado

### Tooltip Card

```css
width: 360px
background: #FFFFFF
border-radius: 16px
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2)
padding: 24px
position: fixed
z-index: 2002
```

**Posicionamento dinâmico:**
- Calcula posição baseada no elemento destacado
- 4 posições: top, bottom, left, right
- Fallback: center (se elemento não encontrado)
- Ajusta automaticamente para caber na viewport

## Passos do Tour

### Passo 1: Upload de Imagem

**Target:** `.tour-upload-area` (botão "Novo projeto")

**Icon:** Upload (azul #3B82F6)

**Posição:** Bottom (abaixo do elemento)

**Conteúdo:**
```
Título: "Faça upload da sua foto"
Descrição: "Arraste ou clique para fazer upload de uma foto do 
            ambiente que você quer transformar. Funciona melhor 
            com fotos de interiores."
```

**Objetivo:**
- Mostrar onde fazer upload
- Explicar que funciona melhor com interiores
- Dar confiança para começar

### Passo 2: Escolha de Estilo

**Target:** `.tour-styles-gallery` (grid de projetos/estilos)

**Icon:** Palette (roxo #8B5CF6)

**Posição:** Right (à direita do elemento)

**Conteúdo:**
```
Título: "Escolha um estilo de staging"
Descrição: "Temos dezenas de estilos profissionais prontos. 
            Do minimalista ao clássico, escolha o que combina 
            com seu projeto."
```

**Objetivo:**
- Mostrar variedade de estilos
- Enfatizar qualidade profissional
- Reduzir overwhelm de escolhas

### Passo 3: Gerar Imagem

**Target:** `.tour-generate-button` (primeiro card de projeto)

**Icon:** Sparkles (verde #10B981)

**Posição:** Top (acima do elemento)

**Conteúdo:**
```
Título: "Gere sua primeira imagem"
Descrição: "Clique aqui e em segundos você terá uma versão 
            transformada. Pode gerar até 4 variações 
            diferentes gratuitamente."
```

**CTA Especial:**
- Botão "Gerar agora" dentro do tooltip
- Ao clicar: fecha tour + trigger geração
- Cor verde para ação positiva

**Objetivo:**
- Criar senso de urgência positiva
- Enfatizar benefício gratuito (4 variações)
- Velocidade como diferencial (segundos)

## Tooltip Structure

### Header

```tsx
<div className="flex items-center justify-between mb-4">
  {/* Step Counter */}
  <div className="px-[10px] py-1 bg-[#F3F3F5] rounded-full">
    <span style={{ fontSize: '12px', fontWeight: 500, color: '#717182' }}>
      {currentStep + 1} de {TOUR_STEPS.length}
    </span>
  </div>

  {/* Close Button */}
  <button className="w-6 h-6 rounded-md hover:bg-[#F3F3F5]">
    <X className="w-4 h-4 text-[#717182]" />
  </button>
</div>
```

### Content

```tsx
<div className="mt-4">
  {/* Icon */}
  <div className="mb-3">
    {step.icon} {/* 40x40px, colored */}
  </div>

  {/* Title */}
  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#030213' }}>
    {step.title}
  </h3>

  {/* Description */}
  <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#717182' }}>
    {step.description}
  </p>
</div>
```

### Footer

```tsx
<div className="mt-6 flex items-center justify-between">
  {/* Progress Dots */}
  <div className="flex items-center gap-[6px]">
    {TOUR_STEPS.map((_, index) => (
      <div
        key={index}
        className="w-2 h-2 rounded-full transition-all"
        style={{
          background: index === currentStep ? '#030213' : '#E9EBEF'
        }}
      />
    ))}
  </div>

  {/* Buttons */}
  <div className="flex items-center gap-2">
    {!isLastStep && (
      <Button variant="ghost" size="sm" onClick={handleSkip}>
        Pular
      </Button>
    )}

    {step.showSpecialCTA ? (
      <Button size="sm" onClick={handleGenerateNow}>
        Gerar agora
      </Button>
    ) : (
      <Button size="sm" onClick={handleNext}>
        {isLastStep ? 'Finalizar' : 'Próximo'}
      </Button>
    )}
  </div>
</div>
```

## Animações

### Overlay Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 200ms ease-out;
}
```

### Tooltip Slide Up

```css
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

.animate-slideUp {
  animation: slideUp 300ms ease-out;
}
```

### Spotlight Transition

```css
transition: all 300ms ease-out;
```

- Transição suave entre passos
- Posição, tamanho e border-radius animados
- 300ms de duração

## Posicionamento Dinâmico

### Algoritmo de Posicionamento

```typescript
const getTooltipStyle = (): React.CSSProperties => {
  if (!targetRect) {
    // Centro da tela se elemento não encontrado
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }

  const padding = 24;
  const tooltipWidth = 360;
  let top = 0;
  let left = 0;

  switch (step.tooltipPosition) {
    case 'bottom':
      top = targetRect.bottom + padding;
      left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
      break;
    case 'top':
      top = targetRect.top - padding;
      left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
      break;
    case 'right':
      top = targetRect.top + (targetRect.height / 2);
      left = targetRect.right + padding;
      break;
    case 'left':
      top = targetRect.top + (targetRect.height / 2);
      left = targetRect.left - tooltipWidth - padding;
      break;
  }

  // Ajuste para viewport
  const maxLeft = window.innerWidth - tooltipWidth - 20;
  const maxTop = window.innerHeight - 400;

  return {
    position: 'fixed',
    top: `${Math.min(Math.max(top, 20), maxTop)}px`,
    left: `${Math.min(Math.max(left, 20), maxLeft)}px`
  };
};
```

### Proteção de Viewport

- Margin mínima: 20px das bordas
- Tooltip nunca sai da tela
- Ajuste automático se não couber

## Target Selectors

Para o tour funcionar, os elementos da interface devem ter classes CSS específicas:

```tsx
// 1. Upload Area (botão "Novo projeto")
<button className="tour-upload-area ...">
  Novo projeto
</button>

// 2. Styles Gallery (grid de projetos/estilos)
<div className="tour-styles-gallery grid ...">
  {/* Cards de projetos */}
</div>

// 3. Generate Button (primeiro card)
<div className="tour-generate-button ...">
  {/* Primeiro projeto */}
</div>
```

## Fluxo do Usuário

```
Welcome Screen
      ↓
Clica "Começar tour guiado"
      ↓
App.handleStartTour()
  - setCurrentView('gallery')
  - setTimeout(() => setIsTourOpen(true), 300)
      ↓
Gallery renderiza
      ↓
300ms delay (para elementos renderizarem)
      ↓
FeatureTour abre
      ↓
PASSO 1: Upload
  - Spotlight no botão "Novo projeto"
  - Tooltip abaixo explicando
  - Opções: "Pular" ou "Próximo"
      ↓
Clica "Próximo"
      ↓
PASSO 2: Estilos
  - Spotlight na grid de projetos
  - Tooltip à direita explicando
  - Opções: "Pular" ou "Próximo"
      ↓
Clica "Próximo"
      ↓
PASSO 3: Gerar
  - Spotlight no primeiro card
  - Tooltip acima explicando
  - CTA especial: "Gerar agora"
      ↓
Clica "Gerar agora" ou "Finalizar"
      ↓
Tour fecha
      ↓
onComplete() callback
      ↓
(Opcional) Trigger geração de imagem
      ↓
Usuário está na Gallery, pronto para usar
```

## Integração no App.tsx

```tsx
import FeatureTour from './components/FeatureTour';

function App() {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const handleStartTour = () => {
    setCurrentView('gallery');
    // Delay para Gallery renderizar
    setTimeout(() => {
      setIsTourOpen(true);
    }, 300);
  };

  return (
    <>
      {/* Main content */}
      {currentView === 'gallery' && (
        <Gallery onStartTour={() => setIsTourOpen(true)} />
      )}

      {/* Tour overlay */}
      <FeatureTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => {
          setIsTourOpen(false);
          console.log('✅ Tour completed!');
          // Opcional: analytics tracking
        }}
      />
    </>
  );
}
```

## Exemplo de Uso

```tsx
<FeatureTour
  isOpen={true}
  onClose={() => {
    console.log('Tour closed/skipped');
    analytics.track('Tour Skipped', { step: currentStep });
  }}
  onComplete={() => {
    console.log('Tour completed!');
    analytics.track('Tour Completed');
    // Opcional: dar recompensa (créditos extras?)
  }}
/>
```

## Comportamento de Click

### Click no Overlay
- **Ação:** Fecha o tour (mesmo que "Pular")
- **Razão:** Dar controle ao usuário, evitar frustração

### Click no Tooltip
- **Ação:** Não faz nada (event.stopPropagation)
- **Razão:** Evitar fechar acidentalmente

### Click em "X" (Close)
- **Ação:** Fecha tour
- **Callback:** onClose()

### Click em "Pular"
- **Ação:** Fecha tour
- **Callback:** onClose()
- **Disponível:** Passos 1 e 2 (não no último)

### Click em "Próximo"
- **Ação:** Avança para próximo passo
- **Transição:** 300ms suave

### Click em "Finalizar"
- **Ação:** Fecha tour
- **Callback:** onComplete()
- **Disponível:** Último passo (passo 3)

### Click em "Gerar agora" (CTA especial)
- **Ação:** Fecha tour + trigger geração
- **Callback:** onComplete()
- **Disponível:** Apenas passo 3

## Estado Interno

```typescript
const [currentStep, setCurrentStep] = useState(0);
const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
```

**currentStep:**
- Index do passo atual (0, 1, 2)
- Controlado por "Próximo" e "Finalizar"
- Reset para 0 quando tour fecha

**targetRect:**
- DOMRect do elemento sendo destacado
- Atualizado via `element.getBoundingClientRect()`
- Recalculado no resize e scroll
- Null se elemento não encontrado

## Event Listeners

```typescript
useEffect(() => {
  if (!isOpen) return;

  const updateTargetPosition = () => {
    const element = document.querySelector(step.targetSelector);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    }
  };

  updateTargetPosition();
  window.addEventListener('resize', updateTargetPosition);
  window.addEventListener('scroll', updateTargetPosition);

  return () => {
    window.removeEventListener('resize', updateTargetPosition);
    window.removeEventListener('scroll', updateTargetPosition);
  };
}, [isOpen, currentStep]);
```

**Por que resize/scroll?**
- Mantém spotlight alinhado com elemento
- Tooltip reposiciona dinamicamente
- UX suave mesmo com window.resize

## Acessibilidade

### Keyboard Navigation

✅ **Tab:** Navega entre botões do tooltip
✅ **Escape:** Fecha tour (TODO: implementar)
✅ **Enter:** Confirma botão focado

### ARIA Labels

```tsx
<button
  onClick={handleSkip}
  aria-label="Fechar tour"
>
  <X />
</button>

<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="tour-title"
  aria-describedby="tour-description"
>
  <h3 id="tour-title">{step.title}</h3>
  <p id="tour-description">{step.description}</p>
</div>
```

### Screen Readers

- Anunciar passo atual: "Passo 1 de 3"
- Ler título e descrição
- Anunciar transição de passo

## Performance

### Otimizações

✅ **Conditional Rendering**
- Retorna `null` se `!isOpen`
- Não renderiza DOM desnecessário

✅ **Event Listeners**
- Adicionados apenas quando aberto
- Cleanup automático no useEffect

✅ **Recalcular apenas quando necessário**
- useEffect dependency: `[isOpen, currentStep]`
- Evita recálculos desnecessários

### Bundle Size

Componente adiciona ~3KB ao bundle:
- Component logic: ~2KB
- CSS/animations: ~0.5KB
- Icons (Lucide): ~0.5KB

## Métricas & Analytics

### Eventos para Rastrear

```typescript
// Tour iniciado
analytics.track('Tour Started', {
  source: 'welcome_screen' | 'gallery_button',
  timestamp: new Date().toISOString()
});

// Progresso por passo
analytics.track('Tour Step Viewed', {
  step: 1 | 2 | 3,
  step_name: 'upload' | 'styles' | 'generate',
  timestamp: new Date().toISOString()
});

// Tour pulado
analytics.track('Tour Skipped', {
  step: 1 | 2 | 3,
  reason: 'close_button' | 'skip_button' | 'overlay_click'
});

// Tour completado
analytics.track('Tour Completed', {
  duration: 45000, // ms
  clicked_generate: true | false
});

// CTA especial clicado
analytics.track('Tour CTA Clicked', {
  cta: 'generate_now',
  step: 3
});
```

### KPIs Importantes

**Completion Rate:**
- % que completa todos os 3 passos
- Meta: >60%

**Skip Rate por Passo:**
- % que pula em cada passo
- Identifica passos problemáticos

**Average Time per Step:**
- Tempo médio em cada passo
- Identifica confusão

**Generate Button Click:**
- % que clica "Gerar agora"
- Meta: >40%

**Conversion Rate:**
- % que gera primeira imagem após tour
- Meta: >50%

## A/B Testing Sugestões

### Variantes para Testar

**1. Número de passos:**
- A: 3 passos (atual)
- B: 5 passos (mais detalhado)
- C: 1 passo (overview rápido)

**2. CTA do último passo:**
- A: "Gerar agora" (atual)
- B: "Finalizar"
- C: "Criar meu primeiro projeto"

**3. Posição do tooltip:**
- A: Dinâmica (atual)
- B: Sempre centralizada
- C: Sempre à direita

**4. Spotlight effect:**
- A: Box-shadow escuro (atual)
- B: Border colorida + blur leve
- C: Sem spotlight (apenas tooltip)

**5. Ordem dos passos:**
- A: Upload → Estilos → Gerar (atual)
- B: Estilos → Upload → Gerar (mostrar valor primeiro)
- C: Gerar → Upload → Estilos (resultado primeiro)

## Melhorias Futuras

### Short-term

1. **Keyboard support completo**
   - Escape para fechar
   - Setas para navegar passos
   - Focus trap no tooltip

2. **Arrow pointer no tooltip**
   - Indicador visual apontando para elemento
   - Melhora conexão visual

3. **Progress bar**
   - Alternativa aos dots
   - Mostra % de progresso

### Medium-term

4. **Tour personalizado por persona**
   - Fotógrafo: foco em upload e edição
   - Designer: foco em estilos
   - Corretor: foco em velocidade

5. **Replay tour**
   - Opção nas Settings
   - Link "Ver tour novamente"

6. **Tour contextual**
   - Diferentes tours para diferentes features
   - Tour do Editor separado

### Long-term

7. **Tours interativos**
   - Usuário realmente clica nos elementos
   - Validação de ações
   - Feedback em tempo real

8. **Gamificação**
   - Badges por completar tour
   - Créditos extras de recompensa
   - Unlock de features

9. **Multi-idioma**
   - i18n completo
   - Tours adaptados por região

## Testing

### Manual Testing

```
1. Abrir Gallery
2. Clicar botão "🎯 Tour"
3. Verificar:
   ✓ Overlay escuro com blur
   ✓ Spotlight no botão "Novo projeto"
   ✓ Tooltip abaixo com conteúdo
   ✓ Progress dots (1/3 ativo)
   ✓ Botões "Pular" e "Próximo"

4. Clicar "Próximo"
5. Verificar:
   ✓ Transição suave (300ms)
   ✓ Spotlight na grid
   ✓ Tooltip à direita
   ✓ Progress dots (2/3 ativo)

6. Clicar "Próximo"
7. Verificar:
   ✓ Spotlight no primeiro card
   ✓ Tooltip acima
   ✓ Progress dots (3/3 ativo)
   ✓ Botão "Gerar agora"
   ✓ Sem botão "Pular"

8. Clicar "Gerar agora"
9. Verificar:
   ✓ Tour fecha
   ✓ Console: "✅ Tour completed!"
   ✓ Volta para Gallery normal

10. Repetir teste clicando "Pular" no passo 1
11. Verificar:
    ✓ Tour fecha imediatamente

12. Repetir teste clicando no overlay
13. Verificar:
    ✓ Tour fecha

14. Resize window durante tour
15. Verificar:
    ✓ Spotlight reposiciona
    ✓ Tooltip reposiciona
```

### Automated Testing

```typescript
describe('FeatureTour', () => {
  it('renders when isOpen is true', () => {
    render(<FeatureTour isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<FeatureTour isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByText('1 de 3')).not.toBeInTheDocument();
  });

  it('advances to next step on "Próximo" click', () => {
    render(<FeatureTour isOpen={true} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText('Próximo'));
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
  });

  it('calls onClose when clicking "Pular"', () => {
    const onClose = jest.fn();
    render(<FeatureTour isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Pular'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onComplete on last step "Finalizar"', () => {
    const onComplete = jest.fn();
    render(<FeatureTour isOpen={true} onClose={jest.fn()} onComplete={onComplete} />);
    
    // Advance to last step
    fireEvent.click(screen.getByText('Próximo')); // Step 2
    fireEvent.click(screen.getByText('Próximo')); // Step 3
    fireEvent.click(screen.getByText('Gerar agora'));
    
    expect(onComplete).toHaveBeenCalled();
  });

  it('closes tour when clicking overlay', () => {
    const onClose = jest.fn();
    const { container } = render(<FeatureTour isOpen={true} onClose={onClose} />);
    
    const overlay = container.firstChild;
    fireEvent.click(overlay);
    
    expect(onClose).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Problema: Spotlight não aparece

**Causa:** Elemento target não encontrado

**Solução:**
```typescript
// Verificar se classe existe
const element = document.querySelector('.tour-upload-area');
console.log('Element found:', element);

// Adicionar delay se necessário
setTimeout(() => setIsTourOpen(true), 500);
```

### Problema: Tooltip fora da tela

**Causa:** Elemento target muito perto da borda

**Solução:**
```typescript
// Ajustar padding ou usar posição alternativa
const maxLeft = window.innerWidth - tooltipWidth - 40; // Mais margin
```

### Problema: Transição brusca

**Causa:** Elementos não encontrados entre passos

**Solução:**
```typescript
// Adicionar fallback para todos os targets
if (!element) {
  console.warn(`Target not found: ${step.targetSelector}`);
  setTargetRect(null); // Centraliza tooltip
}
```

## Arquivos Relacionados

- `/components/FeatureTour.tsx` - Componente
- `/App.tsx` - Integração e controle de estado
- `/components/WelcomeScreen.tsx` - Inicia tour
- `/components/Gallery.tsx` - Target elements
- `/styles/globals.css` - Animações fadeIn/slideUp
