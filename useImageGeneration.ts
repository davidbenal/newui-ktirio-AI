import { useState, useCallback } from 'react';
import { ReferenceImage } from '../types';
import { editImageWithMask } from '../services/geminiService';

/**
 * useImageGeneration - Gerenciamento de imagens e IA
 *
 * Este hook centraliza toda lógica relacionada a:
 * - Geração de imagens com IA (Gemini)
 * - Gerenciamento de histórico
 * - Imagens de referência
 * - Estados de loading/erro
 * - Download de imagens
 *
 * Uso: const imageGen = useImageGeneration(project.history);
 */
export const useImageGeneration = (initialHistory: string[] = []) => {
  // ========== ESTADOS DE IMAGENS ==========
  const [baseImage, setBaseImage] = useState<string | null>(null);           // Imagem original carregada
  const [generatedImage, setGeneratedImage] = useState<string | null>(       // Última imagem gerada pela IA
    initialHistory.length > 0 ? initialHistory[initialHistory.length - 1] : null
  );

  // ========== ESTADOS DE PROMPT E REFERÊNCIAS ==========
  const [prompt, setPrompt] = useState<string>('');                         // Texto do prompt para IA
  const [objectImages, setObjectImages] = useState<ReferenceImage[]>([]);   // Imagens de referência

  // ========== ESTADOS DE CONTROLE ==========
  const [isLoading, setIsLoading] = useState<boolean>(false);               // Flag de processamento IA
  const [error, setError] = useState<string | null>(null);                  // Mensagem de erro

  // ========== HISTÓRICO ==========
  const [history, setHistory] = useState<string[]>(initialHistory);         // Todas versões geradas

  // ========== HANDLERS DE IMAGENS ==========

  /**
   * Define nova imagem base e reseta projeto
   * Limpa histórico, referências e imagem gerada
   * Usado quando usuário carrega nova foto
   */
  const handleSetBaseImage = useCallback((img: string) => {
    setBaseImage(img);
    const newHistory = img ? [img] : [];  // Histórico começa com imagem base
    setHistory(newHistory);
    setGeneratedImage(null);              // Limpa gerações anteriores
    setObjectImages([]);                  // Remove referências antigas
  }, []);

  /**
   * Adiciona nova imagem de referência
   * Cria ID único e nome incremental
   */
  const handleAddReferenceImage = useCallback((imageDataUrl: string) => {
    const newRef: ReferenceImage = {
      id: `ref-${Date.now()}`,
      url: imageDataUrl,
      name: `Referência ${objectImages.length + 1}`,
      types: [],  // Tipos serão definidos pelo usuário depois
    };
    setObjectImages(prev => [...prev, newRef]);
  }, [objectImages.length]);

  /**
   * Atualiza dados de referência (nome, tipos)
   */
  const handleUpdateReferenceImage = useCallback((updatedRef: ReferenceImage) => {
    setObjectImages(prev => prev.map(ref =>
      ref.id === updatedRef.id ? updatedRef : ref
    ));
  }, []);

  /**
   * Remove referência da lista
   */
  const handleDeleteReferenceImage = useCallback((refId: string) => {
    setObjectImages(prev => prev.filter(ref => ref.id !== refId));
  }, []);

  // ========== GERAÇÃO COM IA ==========

  /**
   * Função principal - Envia para IA processar
   *
   * Fluxo:
   * 1. Valida se tem imagem e prompt
   * 2. Obtém máscara desenhada
   * 3. Envia para Gemini API
   * 4. Adiciona resultado ao histórico
   *
   * @param getMaskData - Função que extrai máscara do canvas
   * @param promptToUse - Texto descritivo do que gerar
   * @param objectsToUse - Imagens de referência opcionais
   */
  const handleGenerate = useCallback(async (
    getMaskData: () => string | null,
    promptToUse: string = prompt,
    objectsToUse: ReferenceImage[] = objectImages
  ) => {
    const imageToEdit = generatedImage || baseImage;  // Usa última geração ou original

    // ========== VALIDAÇÕES ==========
    if (!imageToEdit) {
      setError("Por favor, carregue uma imagem primeiro.");
      return;
    }
    if (!promptToUse) {
      setError("Por favor, descreva o que deseja gerar.");
      return;
    }

    const maskData = getMaskData();
    if (!maskData) {
      setError("Não foi possível obter a área selecionada.");
      return;
    }

    // ========== CHAMADA IA ==========
    setIsLoading(true);
    setError(null);

    try {
      // Chama serviço Gemini com imagem + máscara + prompt
      const result = await editImageWithMask(imageToEdit, maskData, promptToUse, objectsToUse);

      if(result.image) {
        const newImage = `data:image/png;base64,${result.image}`;
        setGeneratedImage(newImage);              // Atualiza imagem atual
        setHistory(prev => [...prev, newImage]);  // Adiciona ao histórico
      }

      if(result.text) {
        console.log("Resposta da IA:", result.text);
      }

    } catch (err) {
      console.error("Erro na geração:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido ao gerar imagem.");
    } finally {
      setIsLoading(false);
    }
  }, [baseImage, generatedImage, prompt, objectImages]);

  // ========== FUNÇÕES AUXILIARES ==========

  /**
   * Navega no histórico de versões
   * Permite voltar para imagem original ou versões anteriores
   */
  const handleSelectHistory = useCallback((image: string) => {
    const index = history.findIndex(h => h === image);
    if (index === 0 && baseImage === image) {
      setGeneratedImage(null); // Volta para original
    } else if (index > -1) {
      setGeneratedImage(history[index]); // Seleciona versão do histórico
    }
  }, [history, baseImage]);

  /**
   * Baixa imagem atual como PNG
   * Usa nome do projeto como nome do arquivo
   */
  const handleDownload = useCallback((projectName: string) => {
    const imageToDownload = generatedImage || baseImage;
    if (imageToDownload) {
      const link = document.createElement('a');
      link.href = imageToDownload;
      link.download = `${projectName.replace(/ /g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [generatedImage, baseImage]);

  /**
   * Limpa mensagem de erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // ========== ESTADOS ==========
    baseImage,              // Imagem original
    generatedImage,         // Última geração IA
    prompt,                 // Texto do prompt
    setPrompt,              // Atualiza prompt
    objectImages,           // Lista de referências
    isLoading,              // Processando IA?
    error,                  // Mensagem de erro
    history,                // Todas versões

    // ========== HANDLERS ==========
    handleSetBaseImage,              // Nova imagem base
    handleAddReferenceImage,         // Add referência
    handleUpdateReferenceImage,      // Edita referência
    handleDeleteReferenceImage,      // Remove referência
    handleGenerate,                  // Chama IA
    handleSelectHistory,             // Navega histórico
    handleDownload,                  // Baixa imagem
    clearError,                      // Limpa erro

    // ========== VALORES COMPUTADOS ==========
    currentImage: generatedImage || baseImage,  // Imagem ativa atual
    hasImages: Boolean(baseImage),              // Tem imagem carregada?
    hasHistory: history.length > 0              // Tem histórico?
  };
};