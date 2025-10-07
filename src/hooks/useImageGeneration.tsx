import { useState, useCallback } from 'react';
import type { ReferenceImage, GenerationResult } from '@/types/editor';
import { editImageWithMask, optimizePrompt } from '@/services/geminiService';
import { uploadImage } from '@/lib/storage';
import { useFirebaseUser } from './useFirebaseUser';
import { useToast } from '@/components/ToastProvider';

/**
 * Hook para gerenciamento de geração de imagens com IA
 *
 * Funcionalidades:
 * - Geração de imagens com Gemini
 * - Histórico de versões
 * - Imagens de referência
 * - Upload para Firebase Storage
 * - Dedução de créditos
 * - Estados de loading/erro
 *
 * @param projectId - ID do projeto atual
 * @param initialHistory - Histórico inicial de imagens
 *
 * @example
 * ```tsx
 * const imageGen = useImageGeneration(projectId, project.history);
 *
 * // Carregar imagem base
 * imageGen.handleSetBaseImage(imageDataUrl);
 *
 * // Adicionar referência
 * imageGen.handleAddReference(sofaImageUrl, "Sofá desejado", ["mobília"]);
 *
 * // Gerar com máscara
 * await imageGen.handleGenerate(getMaskData, "Adicione plantas decorativas");
 * ```
 */
export const useImageGeneration = (
  projectId: string,
  initialHistory: string[] = []
) => {
  const { user } = useFirebaseUser();
  const { showSuccess, showError, showWarning } = useToast();

  // ========== ESTADOS DE IMAGENS ==========
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    initialHistory.length > 0 ? initialHistory[initialHistory.length - 1] : null
  );

  // ========== PROMPT E REFERÊNCIAS ==========
  const [prompt, setPrompt] = useState<string>('');
  const [objectImages, setObjectImages] = useState<ReferenceImage[]>([]);

  // ========== CONTROLE DE ESTADO ==========
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  // ========== HISTÓRICO ==========
  const [history, setHistory] = useState<string[]>(initialHistory);

  // ========== HANDLERS DE IMAGENS ==========

  /**
   * Define nova imagem base
   * Reseta histórico e versões geradas
   */
  const handleSetBaseImage = useCallback((img: string) => {
    setBaseImage(img);
    const newHistory = img ? [img] : [];
    setHistory(newHistory);
    setGeneratedImage(null);
    setObjectImages([]);
    setError(null);

    showSuccess('Imagem carregada com sucesso!');
  }, [showSuccess]);

  /**
   * Adiciona imagem de referência
   */
  const handleAddReferenceImage = useCallback(
    (imageDataUrl: string, name?: string, types?: string[]) => {
      const newRef: ReferenceImage = {
        id: `ref-${Date.now()}`,
        url: imageDataUrl,
        name: name || `Referência ${objectImages.length + 1}`,
        types: types || [],
      };
      setObjectImages((prev) => [...prev, newRef]);
      showSuccess(`Referência "${newRef.name}" adicionada!`);
    },
    [objectImages.length, showSuccess]
  );

  /**
   * Atualiza dados de uma referência existente
   */
  const handleUpdateReferenceImage = useCallback(
    (updatedRef: ReferenceImage) => {
      setObjectImages((prev) =>
        prev.map((ref) => (ref.id === updatedRef.id ? updatedRef : ref))
      );
    },
    []
  );

  /**
   * Remove referência
   */
  const handleDeleteReferenceImage = useCallback(
    (refId: string) => {
      setObjectImages((prev) => {
        const ref = prev.find((r) => r.id === refId);
        if (ref) {
          showSuccess(`Referência "${ref.name}" removida`);
        }
        return prev.filter((r) => r.id !== refId);
      });
    },
    [showSuccess]
  );

  // ========== GERAÇÃO COM IA ==========

  /**
   * Função principal de geração
   *
   * Fluxo completo:
   * 1. Valida créditos do usuário
   * 2. Obtém máscara de desenho
   * 3. Otimiza prompt (opcional)
   * 4. Chama Gemini API
   * 5. Upload para Firebase Storage
   * 6. Deduz créditos
   * 7. Atualiza histórico
   *
   * @param getMaskData - Função que retorna máscara do canvas
   * @param promptToUse - Prompt customizado (opcional)
   * @param objectsToUse - Referências customizadas (opcional)
   * @param optimizePromptFirst - Otimizar prompt antes? (default: false)
   */
  const handleGenerate = useCallback(
    async (
      getMaskData: () => string | null,
      promptToUse: string = prompt,
      objectsToUse: ReferenceImage[] = objectImages,
      optimizePromptFirst: boolean = false
    ): Promise<GenerationResult> => {
      const imageToEdit = generatedImage || baseImage;

      // ========== VALIDAÇÕES ==========
      if (!user) {
        const errorMsg = "Você precisa estar logado para gerar imagens";
        setError(errorMsg);
        showError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!imageToEdit) {
        const errorMsg = "Carregue uma imagem primeiro";
        setError(errorMsg);
        showError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!promptToUse.trim()) {
        const errorMsg = "Descreva o que deseja gerar";
        setError(errorMsg);
        showError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Verifica créditos
      if (user.credits <= 0) {
        const errorMsg = "Créditos insuficientes. Adquira mais créditos para continuar.";
        setError(errorMsg);
        showWarning(errorMsg);
        return { success: false, error: errorMsg };
      }

      const maskData = getMaskData();
      if (!maskData) {
        const errorMsg = "Desenhe a área que deseja editar";
        setError(errorMsg);
        showWarning(errorMsg);
        return { success: false, error: errorMsg };
      }

      // ========== GERAÇÃO ==========
      setIsLoading(true);
      setError(null);
      const startTime = Date.now();

      try {
        // Passo 1: Otimizar prompt (opcional)
        setGenerationProgress('Otimizando prompt...');
        let finalPrompt = promptToUse;

        if (optimizePromptFirst) {
          try {
            finalPrompt = await optimizePrompt(promptToUse);
            console.log('Prompt otimizado:', finalPrompt);
          } catch (err) {
            console.warn('Falha ao otimizar prompt, usando original', err);
          }
        }

        // Passo 2: Gerar imagem com Gemini
        setGenerationProgress('Gerando imagem com IA...');
        const result = await editImageWithMask(
          imageToEdit,
          maskData,
          finalPrompt,
          objectsToUse
        );

        if (!result.image) {
          throw new Error('Nenhuma imagem foi gerada');
        }

        // Passo 3: Upload para Firebase Storage
        setGenerationProgress('Salvando imagem...');
        const newImageDataUrl = `data:image/png;base64,${result.image}`;

        // Converte base64 para File para upload
        const blob = await fetch(newImageDataUrl).then((r) => r.blob());
        const file = new File([blob], `generated-${Date.now()}.png`, {
          type: 'image/png',
        });

        const uploadedUrl = await uploadImage(file, user.id, 'versions');

        // Passo 4: Atualiza estado local
        setGeneratedImage(uploadedUrl);
        setHistory((prev) => [...prev, uploadedUrl]);

        // Passo 5: Deduz créditos (será feito via Firestore trigger ou aqui)
        // TODO: Implementar dedução de créditos

        const generationTime = Date.now() - startTime;

        showSuccess(
          `Imagem gerada com sucesso! ${result.text ? `\n${result.text}` : ''}`
        );

        return {
          success: true,
          imageUrl: uploadedUrl,
          text: result.text || undefined,
          metadata: {
            promptUsed: finalPrompt,
            referencesCount: objectsToUse.length,
            generationTime,
          },
        };

      } catch (err) {
        console.error('Erro na geração:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao gerar imagem';
        setError(errorMessage);
        showError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
        setGenerationProgress('');
      }
    },
    [
      baseImage,
      generatedImage,
      prompt,
      objectImages,
      user,
      showSuccess,
      showError,
      showWarning,
    ]
  );

  // ========== NAVEGAÇÃO NO HISTÓRICO ==========

  /**
   * Seleciona versão específica do histórico
   */
  const handleSelectHistory = useCallback(
    (image: string) => {
      const index = history.findIndex((h) => h === image);
      if (index === 0 && baseImage === image) {
        setGeneratedImage(null); // Volta para original
        showSuccess('Voltou para imagem original');
      } else if (index > -1) {
        setGeneratedImage(history[index]);
        showSuccess(`Selecionou versão ${index + 1}`);
      }
    },
    [history, baseImage, showSuccess]
  );

  /**
   * Limpa histórico e volta ao início
   */
  const handleResetHistory = useCallback(() => {
    if (baseImage) {
      setHistory([baseImage]);
      setGeneratedImage(null);
      showSuccess('Histórico limpo!');
    }
  }, [baseImage, showSuccess]);

  // ========== DOWNLOAD ==========

  /**
   * Baixa imagem atual
   */
  const handleDownload = useCallback(
    (projectName: string) => {
      const imageToDownload = generatedImage || baseImage;
      if (imageToDownload) {
        const link = document.createElement('a');
        link.href = imageToDownload;
        link.download = `${projectName.replace(/ /g, '_')}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showSuccess('Download iniciado!');
      }
    },
    [generatedImage, baseImage, showSuccess]
  );

  // ========== UTILITÁRIOS ==========

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // ========== ESTADOS ==========
    baseImage,
    generatedImage,
    prompt,
    setPrompt,
    objectImages,
    isLoading,
    error,
    history,
    generationProgress,

    // ========== HANDLERS ==========
    handleSetBaseImage,
    handleAddReferenceImage,
    handleUpdateReferenceImage,
    handleDeleteReferenceImage,
    handleGenerate,
    handleSelectHistory,
    handleResetHistory,
    handleDownload,
    clearError,

    // ========== COMPUTED ==========
    currentImage: generatedImage || baseImage,
    hasImages: Boolean(baseImage),
    hasHistory: history.length > 0,
    canGenerate: Boolean(baseImage && prompt.trim() && user && user.credits > 0),
  };
};
