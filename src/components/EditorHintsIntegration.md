# Editor - Progressive Hints Integration

Integração completa do sistema de hints progressivos no Editor do Ktírio AI.

## Overview

O Editor agora possui um sistema completo de hints progressivos que aparecem contextualmente conforme o usuário utiliza a plataforma. Os hints são:

1. **Download Hint** - Aparece ao passar o mouse no botão de download pela primeira vez
2. **Comparison Slider Hint** - Aparece quando a segunda imagem é gerada
3. **History Hint** - Aparece quando a terceira imagem é gerada
4. **Credits Warning** - Toast que aparece quando 50% dos créditos foram usados

## Arquitetura

### Imports

```typescript
import { useProgressiveHints } from '../hooks/useProgressiveHints';
import ProgressiveHint from './ProgressiveHint';
import CreditsWarningHint from './CreditsWarningHint';
```

### State Management

```typescript
// Progressive Hints System
const { hasSeenHint, markHintAsSeen, resetHints, resetHint } = useProgressiveHints();
const [imagesGenerated, setImagesGenerated] = useState(1); // Start at 1 (original image)
const [hasHoveredDownload, setHasHoveredDownload] = useState(false);
const [creditsUsed, setCreditsUsed] = useState(0);
const creditsTotal = 5; // Free tier
const [showDebugPanel, setShowDebugPanel] = useState(false);
```

**Estados:**
- `imagesGenerated`: Contador de imagens geradas (inicia em 1 pela imagem original)
- `hasHoveredDownload`: Flag para rastrear se usuário passou mouse no botão download
- `creditsUsed`: Créditos consumidos (incrementa a cada geração)
- `creditsTotal`: Total de créditos disponíveis (5 no free tier)
- `showDebugPanel`: Controla visibilidade do debug panel

### Hook useProgressiveHints

```typescript
const {
  hasSeenHint,      // (hintId) => boolean
  markHintAsSeen,   // (hintId) => void
  resetHints,       // () => void - Reseta todos
  resetHint         // (hintId) => void - Reseta específico
} = useProgressiveHints();
```

**Persistência:**
- Salvo em `localStorage` com key: `ktirio-hints-seen`
- Sobrevive reloads e sessões
- Cada hint é rastreado independentemente

---

## Hints Implementados

### 1. Download Hint

**Trigger:** Mouse hover no botão de download (primeira vez)

```tsx
<ProgressiveHint
  isVisible={hasHoveredDownload && !hasSeenHint('download-image')}
  onDismiss={() => markHintAsSeen('download-image')}
  text="Clique para baixar em alta resolução"
  position="bottom"
  targetSelector=".hint-download-button"
  delay={500}
/>
```

**Características:**
- Position: `bottom` (abaixo do botão)
- Target: `.hint-download-button` (className no botão Exportar)
- Delay: 500ms (para não aparecer instantaneamente)
- Persistência: Aparece apenas uma vez
- Dismissível: Usuário pode fechar com X

**HTML modificado:**
```tsx
<button
  onClick={() => {
    showSuccess('Projeto exportado', 'O arquivo foi salvo com sucesso.');
    setShowProjectMenu(false);
  }}
  onMouseEnter={() => setHasHoveredDownload(true)} // ← Tracking
  className="hint-download-button w-full px-4 py-2 ..." // ← Target className
>
  <Download className="w-4 h-4" />
  Exportar
</button>
```

**Fluxo:**
1. Usuário abre menu do projeto (dropdown)
2. Passa mouse no botão "Exportar"
3. `setHasHoveredDownload(true)`
4. Hint aparece após 500ms
5. Usuário lê e fecha (ou ignora)
6. `markHintAsSeen('download-image')`
7. Nunca mais aparece

---

### 2. Comparison Slider Hint

**Trigger:** Segunda imagem gerada

```tsx
<ProgressiveHint
  isVisible={imagesGenerated >= 2 && !hasSeenHint('comparison-slider')}
  onDismiss={() => markHintAsSeen('comparison-slider')}
  text="Arraste para comparar antes e depois"
  position="bottom"
  delay={1000}
  autoDismissDelay={8000}
/>
```

**Características:**
- Position: `bottom` (centro-baixo da tela)
- No target selector (aparece no centro)
- Delay: 1000ms (1 segundo após geração)
- Auto-dismiss: 8 segundos
- Trigger: `imagesGenerated >= 2`

**Contador de imagens:**
```typescript
const handleGenerate = () => {
  // ...validação
  
  setIsGenerating(true);
  setTimeout(() => {
    setIsGenerating(false);
    setImagesGenerated(prev => prev + 1); // ← Incrementa
    setCreditsUsed(prev => prev + 1);
    showSuccess('Imagem gerada com sucesso!', '...');
  }, 3000);
};
```

**Fluxo:**
1. Usuário gera primeira imagem (`imagesGenerated = 1 → 2`)
2. Modal de loading fecha
3. Toast de sucesso aparece
4. Após 1 segundo, hint de comparação aparece
5. Auto-dismiss após 8 segundos (ou usuário fecha)
6. `markHintAsSeen('comparison-slider')`

**Nota:** Como ainda não há comparison slider implementado, o hint aparece no centro da tela (sem target). Quando implementado, adicione:
```tsx
targetSelector=".comparison-slider-handle"
```

---

### 3. History Hint

**Trigger:** Terceira imagem gerada

```tsx
<ProgressiveHint
  isVisible={imagesGenerated >= 3 && !hasSeenHint('history-saved') && rightPanelOpen}
  onDismiss={() => markHintAsSeen('history-saved')}
  text="Todas as suas criações ficam salvas aqui"
  position="left"
  targetSelector=".hint-history-sidebar"
  showArrow={true}
  delay={1500}
/>
```

**Características:**
- Position: `left` (à esquerda do sidebar)
- Target: `.hint-history-sidebar` (sidebar direita)
- Arrow: `true` (seta indicadora animada)
- Delay: 1500ms
- Conditional: Só aparece se `rightPanelOpen === true`

**HTML modificado:**
```tsx
<aside className="hint-history-sidebar w-80 bg-white rounded-2xl ...">
  <div className="flex items-center justify-between">
    <h3 className="text-gray-900">Histórico da Sessão</h3>
  </div>
  {/* ... */}
</aside>
```

**Fluxo:**
1. Usuário gera terceira imagem (`imagesGenerated = 2 → 3`)
2. Após 1.5 segundos, hint aparece
3. Aponta para o histórico na sidebar direita
4. Seta animada com pulse
5. Usuário lê e fecha
6. `markHintAsSeen('history-saved')`

**Edge case:** Se sidebar direita estiver fechada (`rightPanelOpen === false`), hint não aparece. Ao abrir sidebar, hint não aparecerá pois condição requer `imagesGenerated >= 3` no momento.

---

### 4. Credits Warning Hint

**Trigger:** 50% dos créditos usados (toast automático)

```tsx
<CreditsWarningHint
  creditsUsed={creditsUsed}
  creditsTotal={creditsTotal}
  hasSeenHint={hasSeenHint}
  markHintAsSeen={markHintAsSeen}
  onViewPlans={() => {
    showInfo('Planos', 'Navegando para página de planos...');
  }}
/>
```

**Características:**
- Tipo: Toast (não hint visual)
- Trigger: `creditsUsed / creditsTotal >= 50%`
- CTA: "Ver planos" (opcional)
- Auto-triggered (componente gerencia lógica)

**Componente CreditsWarningHint:**
```typescript
useEffect(() => {
  const percentageUsed = (creditsUsed / creditsTotal) * 100;
  
  if (percentageUsed >= 50 && !hasSeenHint('credits-warning')) {
    showWarning(
      'Atenção aos créditos',
      `Você usou ${creditsUsed} de ${creditsTotal} créditos gratuitos`,
      onViewPlans ? {
        label: 'Ver planos',
        onClick: onViewPlans
      } : undefined
    );
    markHintAsSeen('credits-warning');
  }
}, [creditsUsed, creditsTotal, hasSeenHint, markHintAsSeen]);
```

**Fluxo:**
1. Usuário gera imagens (cada uma consome 1 crédito)
2. Ao atingir 50% (3 de 5 créditos):
   - Toast warning aparece
   - "Atenção aos créditos"
   - "Você usou 3 de 5 créditos gratuitos"
   - Botão "Ver planos"
3. `markHintAsSeen('credits-warning')`
4. Nunca mais aparece

**Calculo:**
```typescript
creditsTotal = 5
creditsUsed = 0 → 0%   (não trigger)
creditsUsed = 1 → 20%  (não trigger)
creditsUsed = 2 → 40%  (não trigger)
creditsUsed = 3 → 60%  (✅ TRIGGER - primeira vez acima de 50%)
creditsUsed = 4 → 80%  (já visto, não aparece)
creditsUsed = 5 → 100% (já visto, não aparece)
```

---

## Debug Panel

### Ativação

**Keyboard Shortcut:** `Ctrl + Shift + H`

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      setShowDebugPanel(prev => !prev);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Interface

```
┌─────────────────────────────────────┐
│ Hints Debug Panel              [X]  │
├─────────────────────────────────────┤
│ Imagens geradas:               3    │
│ Download hover:                Sim  │
│ Créditos usados:               3/5  │
├─────────────────────────────────────┤
│ Status dos Hints:                   │
│ ● Download                    Reset │
│ ○ Comparação                        │
│ ● Histórico                   Reset │
│ ● Créditos                    Reset │
├─────────────────────────────────────┤
│ [Simular Geração]                   │
│ [Ativar Download Hover]             │
│ [Reset Todos Hints]                 │
│ [Reset Estado]                      │
│                                     │
│ Ctrl+Shift+H para fechar            │
└─────────────────────────────────────┘
```

**Features:**
1. **State Info:** Mostra valores atuais dos contadores
2. **Hints Status:** Estado de cada hint (visto/não visto)
3. **Reset Individual:** Resetar hint específico
4. **Simular Geração:** Incrementa `imagesGenerated` e `creditsUsed`
5. **Ativar Download Hover:** Force trigger do download hint
6. **Reset Todos Hints:** Limpa localStorage
7. **Reset Estado:** Volta contadores ao início

### Ações do Debug Panel

**Simular Geração:**
```typescript
onClick={() => {
  setImagesGenerated(prev => prev + 1);
  setCreditsUsed(prev => prev + 1);
  showSuccess('Debug', 'Imagem gerada simulada');
}}
```

**Ativar Download Hover:**
```typescript
onClick={() => {
  setHasHoveredDownload(true);
  showInfo('Debug', 'Download hover ativado');
}}
```

**Reset Todos Hints:**
```typescript
onClick={() => {
  resetHints(); // Limpa localStorage
  showInfo('Debug', 'Hints resetados');
}}
```

**Reset Estado:**
```typescript
onClick={() => {
  setImagesGenerated(1);
  setHasHoveredDownload(false);
  setCreditsUsed(0);
  showInfo('Debug', 'Estado resetado');
}}
```

---

## Testing Guide

### Teste Manual Completo

**Setup:**
1. Abrir Editor
2. Pressionar `Ctrl+Shift+H` para abrir Debug Panel
3. Clicar "Reset Estado" e "Reset Todos Hints"

**Teste 1: Download Hint**
```
1. Clicar no dropdown do projeto (nome do projeto)
2. Passar mouse no botão "Exportar"
3. ✓ Hint aparece: "Clique para baixar em alta resolução"
4. ✓ Posição: Abaixo do botão
5. Fechar hint com X
6. ✓ Debug panel mostra "Download: Visto"
7. Repetir passos 1-2
8. ✓ Hint NÃO aparece novamente
```

**Teste 2: Comparison Slider Hint**
```
1. Abrir Debug Panel
2. Verificar: "Imagens geradas: 1"
3. Clicar "Simular Geração"
4. ✓ Contador: "Imagens geradas: 2"
5. Aguardar 1 segundo
6. ✓ Hint aparece: "Arraste para comparar antes e depois"
7. Aguardar 8 segundos OU fechar manualmente
8. ✓ Hint desaparece
9. ✓ Debug panel mostra "Comparação: Visto"
```

**Teste 3: History Hint**
```
1. Garantir que sidebar direita está aberta
2. Verificar: "Imagens geradas: 2"
3. Clicar "Simular Geração"
4. ✓ Contador: "Imagens geradas: 3"
5. Aguardar 1.5 segundos
6. ✓ Hint aparece: "Todas as suas criações ficam salvas aqui"
7. ✓ Posição: À esquerda da sidebar
8. ✓ Seta animada apontando para sidebar
9. Fechar hint
10. ✓ Debug panel mostra "Histórico: Visto"

Edge case - Sidebar fechada:
11. Reset estado (imagens = 1)
12. Fechar sidebar direita
13. Simular 2 gerações (total = 3)
14. ✓ Hint NÃO aparece (sidebar fechada)
```

**Teste 4: Credits Warning**
```
1. Reset estado (créditos = 0)
2. Verificar: "Créditos usados: 0/5"
3. Simular geração (1/5 = 20%)
4. ✓ Sem toast
5. Simular geração (2/5 = 40%)
6. ✓ Sem toast
7. Simular geração (3/5 = 60%)
8. ✓ Toast WARNING aparece
9. ✓ Título: "Atenção aos créditos"
10. ✓ Mensagem: "Você usou 3 de 5 créditos gratuitos"
11. ✓ Botão: "Ver planos"
12. Clicar "Ver planos"
13. ✓ Toast info: "Navegando para página de planos..."
14. Simular mais gerações (4/5, 5/5)
15. ✓ Toast NÃO aparece novamente
```

**Teste 5: Reset Individual**
```
1. Após ver todos os hints
2. Debug panel mostra todos como "Visto"
3. Clicar "Reset" no hint de Download
4. ✓ Status muda para "Não visto"
5. Passar mouse no botão Exportar
6. ✓ Hint aparece novamente
7. Outros hints permanecem marcados como "Visto"
```

**Teste 6: Persistência (localStorage)**
```
1. Ver todos os hints
2. Recarregar página (F5)
3. Abrir Debug Panel
4. ✓ Todos os hints ainda mostram "Visto"
5. ✓ Hints não aparecem novamente
6. Clicar "Reset Todos Hints"
7. Recarregar página
8. ✓ Todos os hints mostram "Não visto"
9. ✓ Hints aparecem normalmente
```

---

## LocalStorage Structure

```json
{
  "ktirio-hints-seen": {
    "seen": {
      "download-image": true,
      "comparison-slider": true,
      "history-saved": false,
      "credits-warning": true
    }
  }
}
```

**Acesso:**
```javascript
// Ver no console
localStorage.getItem('ktirio-hints-seen')

// Limpar manualmente
localStorage.removeItem('ktirio-hints-seen')
```

---

## Customização

### Modificar Timing

```typescript
// Delay antes de aparecer
<ProgressiveHint delay={1000} /> // 1 segundo

// Auto-dismiss
<ProgressiveHint autoDismissDelay={5000} /> // 5 segundos
```

### Modificar Textos

```typescript
<ProgressiveHint
  text="Seu texto customizado aqui"
/>
```

### Modificar Posições

```typescript
<ProgressiveHint
  position="top"    // top, bottom, left, right
  targetSelector=".seu-elemento"
/>
```

### Adicionar Novo Hint

**1. Adicionar HintId no hook:**
```typescript
// hooks/useProgressiveHints.ts
export type HintId = 
  | 'download-image'
  | 'comparison-slider'
  | 'history-saved'
  | 'credits-warning'
  | 'seu-novo-hint'; // ← Adicionar aqui
```

**2. Adicionar state/trigger:**
```typescript
const [seuTrigger, setSeuTrigger] = useState(false);
```

**3. Adicionar componente:**
```tsx
<ProgressiveHint
  isVisible={seuTrigger && !hasSeenHint('seu-novo-hint')}
  onDismiss={() => markHintAsSeen('seu-novo-hint')}
  text="Texto do seu hint"
  position="bottom"
/>
```

**4. Adicionar no Debug Panel:**
```typescript
const labels = {
  // ...existing
  'seu-novo-hint': 'Seu Label'
};
```

---

## Troubleshooting

### Problema: Hint não aparece

**Checklist:**
1. ✓ Trigger está ativado? (verificar no Debug Panel)
2. ✓ Hint não foi marcado como visto? (verificar localStorage)
3. ✓ Selector está correto? (`.classe-correta`)
4. ✓ Elemento target existe no DOM?
5. ✓ Z-index não está bloqueado por outro elemento?

**Solução:**
```javascript
// Console
console.log(hasSeenHint('download-image')); // false esperado
document.querySelector('.hint-download-button'); // deve retornar elemento
```

---

### Problema: Hint aparece em posição errada

**Causa:** Target selector não encontrado ou elemento não visível

**Solução:**
- Verificar className no elemento
- Garantir que elemento está renderizado (não `display: none`)
- Testar sem `targetSelector` (aparecerá no centro)

---

### Problema: Hint aparece múltiplas vezes

**Causa:** `markHintAsSeen()` não está sendo chamado

**Solução:**
```typescript
<ProgressiveHint
  onDismiss={() => markHintAsSeen('hint-id')} // ← Garantir que está presente
/>
```

---

### Problema: Debug Panel não abre

**Causa:** Shortcut incorreto ou conflito

**Solução:**
- Tentar `Ctrl+Shift+H` (Windows/Linux)
- Tentar `Cmd+Shift+H` (Mac)
- Verificar console por erros
- Adicionar botão manual:
```tsx
<button onClick={() => setShowDebugPanel(true)}>
  Debug
</button>
```

---

## Best Practices

### 1. Não seja invasivo

❌ **Ruim:**
```typescript
<ProgressiveHint
  delay={0}              // Aparece instantaneamente
  autoDismissDelay={30000} // Fica 30 segundos
/>
```

✅ **Bom:**
```typescript
<ProgressiveHint
  delay={500}            // Delay suave
  autoDismissDelay={8000} // Auto-dismiss razoável
/>
```

### 2. Target elementos estáveis

❌ **Ruim:**
```typescript
targetSelector=".button" // Muito genérico
```

✅ **Bom:**
```typescript
targetSelector=".hint-download-button" // Específico
```

### 3. Timing adequado

```typescript
// Hint rápido (informativo)
autoDismissDelay={5000}

// Hint mais complexo (tutorial)
autoDismissDelay={10000}

// Sem auto-dismiss (importante)
// Não passar autoDismissDelay
```

### 4. Guardrails

- ✅ Aparecer apenas uma vez
- ✅ Poder ser dismissed
- ✅ Salvar no localStorage
- ✅ Não bloquear interação
- ✅ Posição contextual (próximo ao elemento)

---

## Future Enhancements

### 1. Comparison Slider Hint com Target

Quando implementar comparison slider:

```tsx
<ProgressiveHint
  isVisible={imagesGenerated >= 2 && !hasSeenHint('comparison-slider')}
  onDismiss={() => markHintAsSeen('comparison-slider')}
  text="Arraste para comparar antes e depois"
  position="top"
  targetSelector=".comparison-slider-handle" // ← Adicionar quando implementado
  delay={1000}
/>
```

### 2. Hint de Estilos

Após usuário fazer primeira geração:

```tsx
<ProgressiveHint
  isVisible={imagesGenerated >= 1 && !hasSeenHint('explore-styles')}
  onDismiss={() => markHintAsSeen('explore-styles')}
  text="Experimente diferentes estilos de decoração"
  position="right"
  targetSelector=".styles-selector"
  delay={2000}
/>
```

### 3. Hint de Pincel/Máscara

Quando usuário seleciona ferramenta pela primeira vez:

```tsx
<ProgressiveHint
  isVisible={activeTool === 'brush' && !hasSeenHint('brush-tutorial')}
  onDismiss={() => markHintAsSeen('brush-tutorial')}
  text="Pinte as áreas que deseja modificar"
  position="top"
  targetSelector=".floating-toolbar"
  showArrow={true}
/>
```

### 4. Analytics

Adicionar tracking:

```typescript
const markHintAsSeenWithAnalytics = (hintId: HintId) => {
  markHintAsSeen(hintId);
  
  // Track analytics
  analytics.track('Hint Seen', {
    hintId,
    timestamp: new Date().toISOString()
  });
};
```

### 5. A/B Testing

Testar diferentes textos:

```typescript
const hintTexts = {
  'download-image': [
    'Clique para baixar em alta resolução',
    'Baixe sua imagem em HD',
    'Download disponível aqui'
  ]
};

const getHintText = (hintId: HintId) => {
  const variant = Math.floor(Math.random() * 3);
  return hintTexts[hintId][variant];
};
```

---

## Conclusão

O sistema de Progressive Hints está totalmente integrado ao Editor:

✅ 4 hints implementados  
✅ localStorage persistência  
✅ Debug panel completo  
✅ Keyboard shortcut (Ctrl+Shift+H)  
✅ Não invasivo (aparecem uma vez)  
✅ Dismissível (usuário controla)  
✅ Contextual (aparecem no momento certo)  
✅ Testável (debug panel + manual testing)  

**Próximos passos:**
1. Testar com usuários reais
2. Ajustar timings baseado em feedback
3. Adicionar mais hints conforme necessário
4. Implementar analytics para medir efetividade
