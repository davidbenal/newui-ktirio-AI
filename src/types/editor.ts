/**
 * Tipos TypeScript para o Editor
 */

/**
 * Imagem de referência usada para guiar a geração
 * Ex: foto de um sofá específico, paleta de cores, estilo
 */
export interface ReferenceImage {
  id: string;           // Identificador único
  url: string;          // Data URL (base64) da imagem
  name: string;         // Nome descritivo ("Sofá desejado", "Paleta de cores")
  types: string[];      // Categorias: ["mobília", "cores", "estilo", etc]
}

/**
 * Modos de desenho no canvas
 */
export type BrushMode = 'draw' | 'erase';

/**
 * Ferramentas disponíveis no editor
 */
export type EditorTool = 'draw' | 'select' | 'pan' | null;

/**
 * Histórico de uma versão gerada
 */
export interface VersionHistory {
  id: string;
  imageUrl: string;     // URL da imagem gerada
  prompt: string;       // Prompt usado
  timestamp: Date;      // Quando foi gerada
  references: ReferenceImage[];  // Referências usadas
}

/**
 * Estado do canvas de desenho
 */
export interface CanvasState {
  zoom: number;         // Nível de zoom (1 = 100%)
  panOffset: {          // Posição do pan
    x: number;
    y: number;
  };
  isDrawing: boolean;   // Está desenhando?
  brushSize: number;    // Tamanho do pincel
  brushMode: BrushMode; // Modo: desenhar ou apagar
}

/**
 * Dados de uma área selecionada para edição
 */
export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

/**
 * Configurações de geração de imagem
 */
export interface GenerationConfig {
  prompt: string;
  references: ReferenceImage[];
  style?: string;
  temperature?: number;  // Criatividade (0-1)
  adherence?: number;    // Aderência ao prompt (0-1)
}

/**
 * Resultado da geração
 */
export interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  text?: string;
  error?: string;
  metadata?: {
    promptUsed: string;
    referencesCount: number;
    generationTime: number;
  };
}

/**
 * Estado completo do editor
 */
export interface EditorState {
  projectId: string;
  projectName: string;
  baseImage: string | null;
  currentImage: string | null;
  history: VersionHistory[];
  references: ReferenceImage[];
  canvas: CanvasState;
  activeTool: EditorTool;
  isLoading: boolean;
  error: string | null;
}
