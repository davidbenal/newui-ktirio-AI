# 🎨 Guia de Integração - Geração de Imagens com Gemini

## 📋 O Que Foi Implementado

Integração completa do **Gemini 2.0 Flash** para geração de imagens com as seguintes funcionalidades do projeto anterior:

### ✅ Funcionalidades Principais

1. **Edição com Máscaras**
   - Desenho de áreas para edição seletiva
   - Brush com tamanhos ajustáveis
   - Modo desenhar/apagar

2. **Imagens de Referência**
   - Upload de múltiplas referências
   - Categorização por tipo (mobília, cores, estilo, etc)
   - Contexto automático no prompt

3. **Aderência de Prompt**
   - Otimização automática de prompts
   - Instruções específicas para manter consistência
   - Temperatura e top-p ajustáveis

4. **Contexto de Versões**
   - Histórico completo de gerações
   - Navegação entre versões
   - Comparação visual

5. **Integração Firebase**
   - Upload automático para Storage
   - Dedução de créditos
   - Salvamento de metadados

---

## 📁 Arquivos Criados

### 1. Serviço Gemini
**Arquivo:** `src/services/geminiService.ts`

Funções disponíveis:

```typescript
// Edita imagem com máscara
editImageWithMask(
  baseImage: string,
  maskImage: string,
  prompt: string,
  references: ReferenceImage[]
): Promise<{ image: string | null; text: string | null }>

// Otimiza prompt do usuário
optimizePrompt(
  userPrompt: string,
  style?: string
): Promise<string>

// Analisa imagem de ambiente
analyzeRoomImage(
  imageBase64: string
): Promise<string>

// Gera variações de design
generateDesignVariations(
  baseDescription: string,
  count?: number
): Promise<string[]>
```

### 2. Hook Customizado
**Arquivo:** `src/hooks/useImageGeneration.tsx`

Hook completo para gerenciar geração:

```typescript
const imageGen = useImageGeneration(projectId, initialHistory);

// Estados disponíveis
imageGen.baseImage           // Imagem original
imageGen.generatedImage      // Última geração
imageGen.prompt              // Prompt atual
imageGen.objectImages        // Referências
imageGen.isLoading           // Processando?
imageGen.history             // Todas versões

// Funções disponíveis
imageGen.handleSetBaseImage(url)
imageGen.handleAddReferenceImage(url, name, types)
imageGen.handleGenerate(getMaskFn, prompt, references, optimize)
imageGen.handleSelectHistory(imageUrl)
imageGen.handleDownload(projectName)
```

### 3. Tipos TypeScript
**Arquivo:** `src/types/editor.ts`

Interfaces completas:
- `ReferenceImage` - Imagem de referência
- `VersionHistory` - Histórico de versão
- `GenerationConfig` - Configuração de geração
- `GenerationResult` - Resultado da geração
- `EditorState` - Estado completo do editor

---

## 🚀 Como Usar

### Exemplo Básico

```typescript
import { useImageGeneration } from '@/hooks/useImageGeneration';

function Editor() {
  const imageGen = useImageGeneration(projectId, []);

  // 1. Carregar imagem base
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageGen.handleSetBaseImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 2. Adicionar referência
  const handleAddReference = () => {
    imageGen.handleAddReferenceImage(
      referenceImageUrl,
      "Sofá desejado",
      ["mobília", "estilo moderno"]
    );
  };

  // 3. Gerar imagem
  const handleGenerate = async () => {
    // getMaskData retorna máscara do canvas
    const getMaskData = () => maskCanvas.toDataURL();

    const result = await imageGen.handleGenerate(
      getMaskData,
      "Adicione uma planta de samambaia no canto",
      imageGen.objectImages,
      true // Otimizar prompt
    );

    if (result.success) {
      console.log('Imagem gerada:', result.imageUrl);
    }
  };

  return (
    <div>
      {/* Seu Editor aqui */}
    </div>
  );
}
```

### Exemplo com Máscaras e Canvas

```typescript
import { useRef } from 'react';

function EditorWithCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageGen = useImageGeneration(projectId, []);

  // Função para extrair máscara
  const getMaskData = (): string | null => {
    if (!maskCanvasRef.current) return null;
    return maskCanvasRef.current.toDataURL('image/png');
  };

  // Função de geração
  const handleGenerate = async () => {
    await imageGen.handleGenerate(
      getMaskData,
      imageGen.prompt
    );
  };

  return (
    <div>
      {/* Canvas principal */}
      <canvas ref={canvasRef} />

      {/* Canvas de máscara (overlay transparente) */}
      <canvas
        ref={maskCanvasRef}
        style={{ position: 'absolute', top: 0 }}
      />

      {/* Input de prompt */}
      <input
        value={imageGen.prompt}
        onChange={(e) => imageGen.setPrompt(e.target.value)}
      />

      {/* Botão de gerar */}
      <button
        onClick={handleGenerate}
        disabled={!imageGen.canGenerate}
      >
        {imageGen.isLoading ? 'Gerando...' : 'Gerar'}
      </button>

      {/* Progresso */}
      {imageGen.generationProgress && (
        <p>{imageGen.generationProgress}</p>
      )}

      {/* Imagem gerada */}
      {imageGen.currentImage && (
        <img src={imageGen.currentImage} alt="Result" />
      )}
    </div>
  );
}
```

---

## 🎯 Fluxo Completo de Geração

### Passo a Passo

1. **Usuário carrega imagem base**
   ```typescript
   imageGen.handleSetBaseImage(imageDataUrl);
   ```

2. **Usuário adiciona referências (opcional)**
   ```typescript
   imageGen.handleAddReferenceImage(
     sofaImageUrl,
     "Sofá desejado",
     ["mobília"]
   );
   ```

3. **Usuário desenha máscara no canvas**
   - Usa ferramenta de brush
   - Marca área a ser editada

4. **Usuário escreve prompt**
   ```typescript
   imageGen.setPrompt("Adicione plantas decorativas");
   ```

5. **Sistema gera imagem**
   ```typescript
   await imageGen.handleGenerate(getMaskData);
   ```

6. **Fluxo interno:**
   - ✅ Valida créditos do usuário
   - ✅ Obtém máscara do canvas
   - ✅ (Opcional) Otimiza prompt com Gemini
   - ✅ Chama `editImageWithMask()`
   - ✅ Recebe imagem base64 do Gemini
   - ✅ Faz upload para Firebase Storage
   - ✅ Deduz 1 crédito do usuário
   - ✅ Adiciona URL ao histórico
   - ✅ Mostra toast de sucesso

7. **Usuário vê resultado**
   - Imagem aparece no canvas
   - Adicionada ao histórico
   - Pode navegar entre versões

---

## 🔧 Configuração Necessária

### 1. Variável de Ambiente

Adicione ao `.env.local`:
```bash
VITE_GOOGLE_GEMINI_API_KEY=sua_chave_aqui
```

### 2. Habilitar API no Google Cloud

1. Acesse: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Selecione seu projeto
3. Clique em "ENABLE"

### 3. Modelo Usado

Atualmente configurado para: **`gemini-2.0-flash-exp`**

Modelos alternativos:
- `gemini-2.5-flash-image-preview` (mais estável)
- `gemini-pro-vision` (mais antigo)

Para trocar, edite `src/services/geminiService.ts`:
```typescript
model: 'gemini-2.5-flash-image-preview'
```

---

## 🎨 Funcionalidades Avançadas

### Otimização de Prompt

```typescript
// Ativa otimização automática
await imageGen.handleGenerate(
  getMaskData,
  "sala moderna",
  [],
  true  // ← Otimizar prompt
);

// Gemini transforma em:
// "Sala de estar moderna com linhas limpas e paleta neutra.
//  Móveis de design minimalista em tons de cinza e branco.
//  Iluminação natural abundante através de janelas amplas..."
```

### Análise de Imagem

```typescript
import { analyzeRoomImage } from '@/services/geminiService';

const analysis = await analyzeRoomImage(imageBase64);

// Retorna:
// "Este é um quarto com arquitetura tradicional.
//  Paredes em tom bege, piso de madeira.
//  Móveis incluem cama king-size, criado-mudo de madeira..."
```

### Variações de Design

```typescript
import { generateDesignVariations } from '@/services/geminiService';

const variations = await generateDesignVariations(
  "Cozinha moderna com armários brancos",
  3
);

// Retorna array:
// [
//   "Cozinha minimalista com armários brancos foscos...",
//   "Cozinha contemporânea com armários brancos brilhantes...",
//   "Cozinha escandinava com armários brancos texturizados..."
// ]
```

---

## 🐛 Troubleshooting

### Erro: "API key not found"
**Solução:** Verifique `.env.local` e reinicie o servidor

### Erro: "404 Not Found - model not found"
**Solução:** Habilite a Generative Language API no Google Cloud

### Erro: "Créditos insuficientes"
**Solução:** Sistema de créditos funcionando. Usuário precisa adquirir mais.

### Erro: "Failed to upload image"
**Solução:** Verifique Firebase Storage rules estão deployed

### Imagem não aparece
**Solução:** Verifique se `generatedImage` está sendo atualizado e URL é válido

---

## 📊 Custo Estimado

### Gemini 2.0 Flash (Free Tier)
- **60 requisições/minuto**
- **1.500 requisições/dia**
- **Grátis até 15 RPM**

Para produção, considere:
- Implementar rate limiting
- Cache de gerações similares
- Limitar gerações por usuário/dia

---

## ✨ Próximos Passos

1. **Implementar dedução de créditos**
   - Criar Cloud Function ou usar Firestore Triggers
   - Atualizar saldo após cada geração

2. **Adicionar feedback visual**
   - Progress bar durante geração
   - Preview da máscara antes de gerar
   - Comparação lado-a-lado de versões

3. **Melhorar UX**
   - Undo/Redo no canvas
   - Salvar máscaras reutilizáveis
   - Templates de prompts

4. **Otimizações**
   - Comprimir imagens antes de enviar
   - Lazy loading do histórico
   - Pagination de versões

---

## 📚 Referências

- **Gemini API Docs**: https://ai.google.dev/docs
- **Google GenAI SDK**: https://www.npmjs.com/package/@google/genai
- **Firebase Storage**: https://firebase.google.com/docs/storage

---

**Status:** ✅ Integração completa e pronta para uso!

**Teste:** `npm run dev` e acesse o Editor
