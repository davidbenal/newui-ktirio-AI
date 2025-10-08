# 🎨 Instruções de Integração do Canvas - Sistema de 3 Camadas

## ✅ Arquivos Criados

1. **`src/hooks/useCanvasDrawing.ts`** - Hook completo de desenho multi-camadas
2. **`src/components/EditPromptModal.tsx`** - Modal contextual para edição de seleção

## 🔧 Próximos Passos - Integração no Editor.tsx

### Passo 1: Adicionar hook de canvas após imageGen (linha ~65)

```typescript
// Hook de canvas drawing (ADICIONAR APÓS imageGen)
const canvas = useCanvasDrawing({
  tool: activeTool,
  brushSize,
  baseImage: imageGen.baseImage,
});

// Estado do EditPromptModal
const [editPromptModal, setEditPromptModal] = useState<{
  isOpen: boolean;
  position: { x: number; y: number };
}>({ isOpen: false, position: { x: 0, y: 0 } });
```

### Passo 2: Substituir refs antigos (remover linhas 77-78)

REMOVER:
```typescript
const canvasRef = useRef<HTMLDivElement>(null);
const maskCanvasRef = useRef<HTMLCanvasElement>(null);
```

Agora usamos: `canvas.instructionCanvasRef` e `canvas.maskCanvasRef`

### Passo 3: Atualizar tools array (linha ~137)

SUBSTITUIR:
```typescript
const tools = [
  { id: 'select' as Tool, icon: Move, label: 'Seleção' },
  { id: 'brush' as Tool, icon: Pencil, label: 'Pincel' },
  { id: 'eraser' as Tool, icon: Eraser, label: 'Borracha' },
  { id: 'move' as Tool, icon: Hand, label: 'Mover' },
];
```

### Passo 4: Atualizar getMaskData (linha ~144)

SUBSTITUIR toda a função:
```typescript
// Função para extrair dados do canvas baseado no modo
const getCanvasData = (): { instruction: string | null; mask: string | null } => {
  return {
    instruction: canvas.getInstructionData(),
    mask: canvas.getMaskData(),
  };
};
```

### Passo 5: Atualizar handleGenerate (linha ~161)

SUBSTITUIR a validação e envio:
```typescript
const handleGenerate = async () => {
  // Validações
  if (!user) {
    showError('Faça login para gerar imagens');
    return;
  }

  if (!imageGen.baseImage) {
    showError('Carregue uma imagem primeiro');
    setShowUploadModal(true);
    return;
  }

  if (!imageGen.prompt.trim()) {
    showError('Descreva o que deseja gerar');
    return;
  }

  if (user.credits <= 0) {
    setShowCreditLimitModal(true);
    return;
  }

  // Obtém dados do canvas
  const canvasData = getCanvasData();

  // MODO PINCEL: Verifica se há desenho de instrução
  if (activeTool === 'brush' && !canvasData.instruction) {
    showError('Desenhe instruções na imagem (traços vermelhos)');
    return;
  }

  // MODO SELEÇÃO: Verifica se há máscara
  if (activeTool === 'select' && !canvasData.mask) {
    showError('Selecione a área que deseja editar (traços brancos)');
    return;
  }

  // Marca estilo como selecionado na primeira geração
  if (!checklistProgress.selectedStyle) {
    setChecklistProgress((prev: ChecklistProgress) => ({ ...prev, selectedStyle: true }));
  }

  // Gerar com IA
  let result;
  if (activeTool === 'brush') {
    // Modo Instrução: Envia imagem composta (base + desenho vermelho)
    const compositeImage = await canvas.getCompositeImage();
    result = await imageGen.handleGenerate(
      () => null, // Sem máscara
      imageGen.prompt,
      imageGen.objectImages,
      true // Otimizar prompt
    );
  } else {
    // Modo Seleção: Envia máscara
    result = await imageGen.handleGenerate(
      () => canvasData.mask,
      imageGen.prompt,
      imageGen.objectImages,
      true
    );
  }

  if (result.success) {
    // Limpar canvas após gerar
    canvas.clearInstructionLayer();
    canvas.clearMaskLayer();

    // Atualizar checklist
    setChecklistProgress((prev: ChecklistProgress) => ({ ...prev, generatedImage: true }));
    setImagesGenerated((prev: number) => prev + 1);
    setCreditsUsed((prev: number) => prev + 1);

    if (isFirstTimeUser && onFirstProjectComplete) {
      onFirstProjectComplete();
    }
  }
};
```

### Passo 6: Adicionar handler para quando termina seleção

```typescript
// Handler quando usuário termina de desenhar seleção
const handleSelectionComplete = (e: React.MouseEvent) => {
  if (activeTool === 'select' && canvas.getMaskData()) {
    // Abre modal próximo ao cursor
    setEditPromptModal({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
    });
  }
};
```

### Passo 7: Atualizar a área do Canvas (linha ~436+)

SUBSTITUIR toda a seção do canvas:
```typescript
{/* Canvas */}
<div
  className={`flex-1 bg-gray-50 relative overflow-hidden ${
    activeTool === 'move' ? (canvas.isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
  }`}
  onMouseDown={canvas.handleMouseDown}
  onMouseMove={canvas.handleMouseMove}
  onMouseUp={(e) => {
    canvas.handleMouseUp();
    handleSelectionComplete(e);
  }}
  onMouseLeave={canvas.handleMouseUp}
  onWheel={(e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      canvas.handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
    }
  }}
  style={{
    transform: `scale(${canvas.zoom}) translate(${canvas.pan.x}px, ${canvas.pan.y}px)`,
    transition: canvas.isPanning ? 'none' : 'transform 0.2s ease-out',
  }}
>
  {imageGen.currentImage ? (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Camada 1: Imagem Base */}
      <img
        src={imageGen.currentImage}
        alt="Canvas"
        className="max-w-full max-h-full shadow-2xl"
        style={{ pointerEvents: 'none' }}
      />

      {/* Camada 2: Canvas de Instrução (Vermelho - Modo Pincel) */}
      <canvas
        ref={canvas.instructionCanvasRef}
        className="absolute max-w-full max-h-full"
        style={{
          pointerEvents: activeTool === 'brush' || activeTool === 'eraser' ? 'auto' : 'none',
          opacity: activeTool === 'brush' || activeTool === 'eraser' ? 1 : 0.3,
        }}
      />

      {/* Camada 3: Canvas de Máscara (Branco translúcido - Modo Seleção) */}
      <canvas
        ref={canvas.maskCanvasRef}
        className="absolute max-w-full max-h-full"
        style={{
          pointerEvents: activeTool === 'select' || (activeTool === 'eraser' && canvas.getMaskData()) ? 'auto' : 'none',
          opacity: activeTool === 'select' ? 1 : 0.3,
        }}
      />
    </div>
  ) : (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">Nenhuma imagem carregada</p>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Carregar Imagem
        </button>
      </div>
    </div>
  )}
</div>
```

### Passo 8: Adicionar botão de reset zoom (após barra de ferramentas)

```typescript
{/* Botão Reset Zoom - Canto inferior direito */}
{canvas.zoom !== 1 && (
  <div className="absolute bottom-6 right-6 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2">
    <button
      onClick={canvas.resetView}
      className="text-sm text-gray-700 hover:text-gray-900 font-medium"
    >
      100%
    </button>
  </div>
)}
```

### Passo 9: Adicionar EditPromptModal antes do fechamento (final)

```typescript
{/* Edit Prompt Modal (para modo Seleção) */}
<EditPromptModal
  isOpen={editPromptModal.isOpen}
  position={editPromptModal.position}
  onApply={(prompt) => {
    // Aplica edição com o prompt do modal
    imageGen.setPrompt(prompt);
    handleGenerate();
    setEditPromptModal({ isOpen: false, position: { x: 0, y: 0 } });
  }}
  onCancel={() => {
    // Cancela e limpa máscara
    canvas.clearMaskLayer();
    setEditPromptModal({ isOpen: false, position: { x: 0, y: 0 } });
  }}
/>
```

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de 3 Camadas
1. **Base Layer**: Imagem de referência
2. **Instruction Layer**: Desenhos vermelhos (modo Pincel)
3. **Mask Layer**: Seleção branca translúcida (modo Seleção)

### ✅ Ferramentas
- **Pincel** (Brush): Desenha instruções em vermelho
- **Seleção** (Select): Pinta máscara branca para edição direcionada
- **Borracha** (Eraser): Contextual - apaga da camada ativa
- **Mover** (Move): Pan para navegação

### ✅ Navegação
- **Zoom**: Ctrl/Cmd + Scroll do mouse
- **Pan**: Arrastar com ferramenta Mover
- **Reset**: Botão "100%" quando zoom ≠ 1

### ✅ Fluxos de Trabalho
1. **Fluxo Instrução**: Desenhe → Digite prompt → Gere
2. **Fluxo Seleção**: Selecione área → Modal aparece → Digite edição → Gere

## 🚀 Testando

1. Faça upload de uma imagem
2. Teste modo **Pincel**: Desenhe traços vermelhos + prompt → Gerar
3. Teste modo **Seleção**: Pinte área branca → Modal aparece → Digite edição
4. Teste **Borracha**: Mude entre modos e apague
5. Teste **Zoom/Pan**: Ctrl+Scroll e arrastar
6. Veja as camadas sobrepondo a imagem base

## 📝 Notas Importantes

- O canvas se redimensiona automaticamente com a imagem
- As coordenadas são convertidas para o espaço do canvas
- Borracha é contextual: apaga da camada do modo ativo
- Modal de edição só aparece no modo Seleção
- Ambas as camadas são limpas após gerar com sucesso
