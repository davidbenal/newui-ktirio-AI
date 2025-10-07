import { GoogleGenAI, Modality } from "@google/genai";
import type { ReferenceImage } from "@/types/editor";

/**
 * Gemini Service - Integração com Gemini 2.5 Flash para geração de imagens
 *
 * Features:
 * - Edição de imagens com máscaras
 * - Suporte a imagens de referência
 * - Geração de texto + imagem simultânea
 * - Integração com Firebase Storage
 */

// Suporte tanto Vite quanto Node.js
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
  }
  return process.env.VITE_GOOGLE_GEMINI_API_KEY;
};

const apiKey = getApiKey();

if (!apiKey) {
  throw new Error(
    "VITE_GOOGLE_GEMINI_API_KEY não encontrada. " +
    "Adicione a chave no arquivo .env.local"
  );
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Converte Data URL (base64) para objeto separado
 * Extrai MIME type e dados puros
 */
const dataUrlToBlob = (dataUrl: string): { data: string; mimeType: string } => {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  return { data, mimeType };
};

/**
 * Edita imagem usando máscara e prompt
 *
 * @param baseImage - Imagem base em Data URL (base64)
 * @param maskImage - Máscara de edição em Data URL (áreas brancas serão editadas)
 * @param prompt - Descrição do que gerar/editar
 * @param objectImages - Imagens de referência (opcional)
 * @returns Objeto com imagem gerada (base64) e texto de resposta
 *
 * Exemplo:
 * ```ts
 * const result = await editImageWithMask(
 *   baseImageUrl,
 *   maskUrl,
 *   "Adicione uma planta de samambaia no canto",
 *   []
 * );
 *
 * if (result.image) {
 *   const fullImageUrl = `data:image/png;base64,${result.image}`;
 *   // Usar imagem gerada
 * }
 * ```
 */
export async function editImageWithMask(
  baseImage: string,
  maskImage: string,
  prompt: string,
  objectImages: ReferenceImage[] = []
): Promise<{ image: string | null; text: string | null }> {
  try {
    // Converte imagens para formato aceito pela API
    const baseImageBlob = dataUrlToBlob(baseImage);
    const maskImageBlob = dataUrlToBlob(maskImage);

    // Prepara imagens de referência
    const objectImageParts = objectImages.map((img) => {
      const blob = dataUrlToBlob(img.url);
      return {
        inlineData: {
          data: blob.data,
          mimeType: blob.mimeType,
        },
      };
    });

    // Monta prompt completo com contexto
    const enhancedPrompt = buildEnhancedPrompt(prompt, objectImages);

    // Estrutura da requisição para Gemini
    const parts = [
      { text: enhancedPrompt },
      {
        inlineData: {
          data: baseImageBlob.data,
          mimeType: baseImageBlob.mimeType,
        },
      },
      ...objectImageParts,
      {
        inlineData: {
          data: maskImageBlob.data,
          mimeType: maskImageBlob.mimeType,
        },
      },
    ];

    // Chamada para Gemini 2.5 Flash com Image Preview
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        temperature: 0.7, // Criatividade moderada
        topP: 0.9,
      },
    });

    // Extrai imagem e texto da resposta
    let newImage: string | null = null;
    let newText: string | null = null;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        newImage = part.inlineData.data;
      }
      if (part.text) {
        newText = part.text;
      }
    }

    if (!newImage) {
      throw new Error("API não retornou uma imagem. Tente novamente.");
    }

    return { image: newImage, text: newText };

  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);

    if (error instanceof Error) {
      // Erros mais amigáveis para o usuário
      if (error.message.includes('quota')) {
        throw new Error("Limite de uso da API atingido. Tente novamente mais tarde.");
      }
      if (error.message.includes('API key')) {
        throw new Error("Chave de API inválida. Verifique suas configurações.");
      }
      throw new Error(`Falha ao gerar imagem: ${error.message}`);
    }

    throw new Error("Erro desconhecido ao gerar imagem.");
  }
}

/**
 * Constrói prompt otimizado com contexto de referências
 * Adiciona instruções específicas baseadas nos tipos de referência
 */
function buildEnhancedPrompt(basePrompt: string, references: ReferenceImage[]): string {
  let enhancedPrompt = basePrompt;

  if (references.length > 0) {
    enhancedPrompt += "\n\nImagens de referência fornecidas:";

    references.forEach((ref, index) => {
      enhancedPrompt += `\n${index + 1}. ${ref.name}`;
      if (ref.types && ref.types.length > 0) {
        enhancedPrompt += ` (${ref.types.join(', ')})`;
      }
    });

    enhancedPrompt += "\n\nUse estas referências para guiar o estilo, cores e elementos visuais.";
  }

  // Instruções adicionais para melhor qualidade
  enhancedPrompt += "\n\nGere uma imagem realista e de alta qualidade, mantendo consistência com a imagem base.";

  return enhancedPrompt;
}

/**
 * Otimiza prompt do usuário para melhor geração
 * Usa Gemini em modo texto para enriquecer descrição
 */
export async function optimizePrompt(userPrompt: string, style: string = 'modern'): Promise<string> {
  try {
    const model = ai.models.get('gemini-2.0-flash-exp');

    const systemPrompt = `
Você é um especialista em design de interiores. Otimize este prompt para geração de imagens:

Estilo desejado: ${style}
Prompt do usuário: "${userPrompt}"

Crie uma descrição detalhada (máx. 150 palavras) incluindo:
- Tipo de ambiente e layout
- Paleta de cores específica
- Mobiliário e decoração
- Atmosfera de iluminação
- Materiais e texturas
- Elementos característicos do estilo ${style}

Retorne APENAS o prompt otimizado, sem explicações.
`;

    const result = await model.generateContent(systemPrompt);
    return result.response.text();

  } catch (error) {
    console.error("Erro ao otimizar prompt:", error);
    // Fallback: retorna prompt original se otimização falhar
    return userPrompt;
  }
}

/**
 * Analisa imagem de ambiente para extrair informações
 * Útil para entender contexto antes de gerar modificações
 */
export async function analyzeRoomImage(imageBase64: string): Promise<string> {
  try {
    const model = ai.models.get('gemini-2.0-flash-exp');
    const imageBlob = dataUrlToBlob(imageBase64);

    const parts = [
      {
        text: `Analise esta imagem de ambiente. Descreva:
1. Tipo de ambiente (quarto, sala, cozinha, etc)
2. Estilo arquitetônico/decoração atual
3. Cores predominantes
4. Móveis e elementos presentes
5. Condições de iluminação

Seja específico e conciso.`,
      },
      {
        inlineData: {
          data: imageBlob.data,
          mimeType: imageBlob.mimeType,
        },
      },
    ];

    const result = await model.generateContent({ parts });
    return result.response.text();

  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    throw new Error("Não foi possível analisar a imagem.");
  }
}

/**
 * Gera variações de um prompt base
 * Útil para oferecer opções diferentes ao usuário
 */
export async function generateDesignVariations(
  baseDescription: string,
  count: number = 3
): Promise<string[]> {
  try {
    const model = ai.models.get('gemini-2.0-flash-exp');

    const systemPrompt = `
Com base nesta descrição de design:
"${baseDescription}"

Gere ${count} variações criativas diferentes, mantendo o conceito base mas explorando:
- Diferentes combinações de cores
- Estilos de móveis variados
- Atmosferas distintas

Retorne cada variação em uma linha separada, numerada.
`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    // Divide em linhas e remove numeração
    const variations = text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, ''));

    return variations.slice(0, count);

  } catch (error) {
    console.error("Erro ao gerar variações:", error);
    return [baseDescription]; // Retorna original se falhar
  }
}
