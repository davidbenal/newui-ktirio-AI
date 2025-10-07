# 🎨 Passos para Integrar useImageGeneration no Editor

## Mudanças Necessárias no src/components/Editor.tsx

### 1. Adicionar Imports

```typescript
// Adicionar após os imports existentes
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import type { ReferenceImage } from '@/types/editor';
```

### 2. Remover Estados Mockados e Usar o Hook

```typescript
// REMOVER esses estados mockados:
// const [prompt, setPrompt] = useState('');
// const [isGenerating, setIsGenerating] = useState(false);
// const mockVersions = [...];

// ADICIONAR o hook:
export default function Editor({ projectId, ... }: EditorProps) {
  const { user } = useFirebaseUser();

  // Hook de geração de imagens
  const imageGen = useImageGeneration(
    projectId || 'new-project',
    [] // Histórico inicial vazio, será carregado do Firestore
  );

  // Resto dos estados existentes...
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  // ...
}
```

### 3. Adicionar Refs para Canvas de Máscara

```typescript
// Adicionar após canvasRef
const maskCanvasRef = useRef<HTMLCanvasElement>(null);

// Função para extrair máscara
const getMaskData = (): string | null => {
  if (!maskCanvasRef.current) return null;
  return maskCanvasRef.current.toDataURL('image/png');
};
```

### 4. Atualizar Função de Upload

```typescript
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validar tipo
  if (!file.type.startsWith('image/')) {
    showError('Por favor, selecione uma imagem válida');
    return;
  }

  // Converter para base64 e salvar
  const reader = new FileReader();
  reader.onload = (e) => {
    const imageDataUrl = e.target?.result as string;
    imageGen.handleSetBaseImage(imageDataUrl);

    setShowUploadModal(false);
    if (onUploadComplete) onUploadComplete();

    // Atualizar checklist
    setChecklistProgress(prev => ({ ...prev, uploadedPhoto: true }));
    showSuccess('Imagem carregada com sucesso!');
  };
  reader.readAsDataURL(file);
};
```

### 5. Atualizar Função de Geração

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

  // Verificar se desenhou máscara
  const maskData = getMaskData();
  if (!maskData) {
    showError('Desenhe a área que deseja editar');
    return;
  }

  // Gerar com IA
  const result = await imageGen.handleGenerate(
    getMaskData,
    imageGen.prompt,
    imageGen.objectImages,
    true // Otimizar prompt
  );

  if (result.success) {
    // Atualizar checklist
    setChecklistProgress(prev => ({ ...prev, generatedImage: true }));
    setImagesGenerated(prev => prev + 1);
    setCreditsUsed(prev => prev + 1);

    if (isFirstTimeUser && onFirstProjectComplete) {
      onFirstProjectComplete();
    }
  }
};
```

### 6. Atualizar Seção de Prompt

```typescript
{/* Prompt Input */}
<div className="p-4 border-b border-gray-200">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Descreva as mudanças
  </label>
  <textarea
    value={imageGen.prompt}
    onChange={(e) => imageGen.setPrompt(e.target.value)}
    placeholder="Ex: Adicione plantas decorativas no canto direito..."
    className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-black focus:border-transparent"
    disabled={imageGen.isLoading}
  />

  {/* Progress */}
  {imageGen.generationProgress && (
    <p className="mt-2 text-sm text-gray-600">
      {imageGen.generationProgress}
    </p>
  )}
</div>

{/* Botão de Gerar */}
<button
  onClick={handleGenerate}
  disabled={!imageGen.canGenerate || imageGen.isLoading}
  className={`
    w-full py-3 rounded-lg font-medium transition-colors
    ${imageGen.canGenerate && !imageGen.isLoading
      ? 'bg-black text-white hover:bg-gray-800'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
  `}
>
  {imageGen.isLoading ? (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      Gerando...
    </span>
  ) : (
    'Gerar Imagem'
  )}
</button>
```

### 7. Adicionar Seção de Referências

```typescript
{/* Imagens de Referência */}
<div className="p-4 border-b border-gray-200">
  <div className="flex items-center justify-between mb-3">
    <label className="text-sm font-medium text-gray-700">
      Imagens de Referência
    </label>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            imageGen.handleAddReferenceImage(
              ev.target?.result as string,
              file.name,
              []
            );
          };
          reader.readAsDataURL(file);
        }
      }}
      className="hidden"
      id="reference-upload"
    />
    <label
      htmlFor="reference-upload"
      className="text-sm text-black hover:underline cursor-pointer"
    >
      + Adicionar
    </label>
  </div>

  {/* Lista de Referências */}
  <div className="space-y-2">
    {imageGen.objectImages.map((ref) => (
      <div
        key={ref.id}
        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
      >
        <img
          src={ref.url}
          alt={ref.name}
          className="w-12 h-12 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {ref.name}
          </p>
          {ref.types.length > 0 && (
            <p className="text-xs text-gray-500">
              {ref.types.join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={() => imageGen.handleDeleteReferenceImage(ref.id)}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
</div>
```

### 8. Atualizar Histórico de Versões

```typescript
{/* Histórico - Painel Direito */}
<div className="flex-1 overflow-y-auto p-4">
  <div className="space-y-2">
    {imageGen.history.map((imageUrl, index) => (
      <div
        key={index}
        onClick={() => imageGen.handleSelectHistory(imageUrl)}
        className={`
          relative group cursor-pointer rounded-lg overflow-hidden
          border-2 transition-all
          ${imageGen.currentImage === imageUrl
            ? 'border-black shadow-md'
            : 'border-transparent hover:border-gray-300'
          }
        `}
      >
        <img
          src={imageUrl}
          alt={`Versão ${index + 1}`}
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-white text-xs font-medium">
            {index === 0 ? 'Original' : `Versão ${index}`}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
```

### 9. Adicionar Canvas de Máscara

```typescript
{/* Canvas Principal */}
<div className="relative flex-1 bg-gray-100 flex items-center justify-center">
  {imageGen.currentImage ? (
    <>
      {/* Canvas Base */}
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain"
      />

      {/* Canvas de Máscara (Overlay) */}
      <canvas
        ref={maskCanvasRef}
        className="absolute inset-0 max-w-full max-h-full object-contain"
        style={{
          pointerEvents: activeTool === 'brush' || activeTool === 'eraser' ? 'auto' : 'none',
          cursor: activeTool === 'brush' ? 'crosshair' : activeTool === 'eraser' ? 'cell' : 'default'
        }}
      />

      {/* Imagem Atual */}
      <img
        src={imageGen.currentImage}
        alt="Preview"
        className="max-w-full max-h-full object-contain"
      />
    </>
  ) : (
    <div className="text-center p-8">
      <p className="text-gray-500 mb-4">Nenhuma imagem carregada</p>
      <button
        onClick={() => setShowUploadModal(true)}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Carregar Imagem
      </button>
    </div>
  )}
</div>
```

---

## Resumo das Mudanças

✅ **Hook integrado** - useImageGeneration substituindo estados mockados
✅ **Upload funcionando** - Salva imagem no estado do hook
✅ **Geração com IA** - Conectado ao Gemini via handleGenerate
✅ **Referências** - UI para adicionar/remover imagens de referência
✅ **Histórico** - Versões reais do Firebase
✅ **Canvas de máscara** - Preparado para desenho
✅ **Validações** - Créditos, login, imagem base

---

## Próximos Passos

1. **Implementar desenho no canvas de máscara**
   - Brush controls (tamanho, cor)
   - Modo draw/erase
   - Clear mask

2. **Adicionar lógica de dedução de créditos**
   - Após geração bem-sucedida
   - Atualizar Firestore

3. **Melhorar UX**
   - Preview da máscara
   - Comparação de versões
   - Undo/Redo

Quer que eu implemente essas mudanças no Editor atual?
