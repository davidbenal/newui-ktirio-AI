import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar desenho em canvas com sistema de 3 camadas
 *
 * Camadas:
 * 1. Base Layer (Imagem): Exibe a imagem de referência
 * 2. Instruction Layer (Vermelha): Desenhos de instrução para IA (Pincel)
 * 3. Mask Layer (Branca translúcida): Seleção de área (Seleção)
 *
 * Modos:
 * - 'brush': Desenha instruções em vermelho na instruction layer
 * - 'select': Desenha máscara branca translúcida na mask layer
 * - 'eraser': Apaga da camada ativa (contextual)
 * - 'move': Pan/navegação (sem desenho)
 */

export type CanvasTool = 'brush' | 'select' | 'eraser' | 'move';

interface Point {
  x: number;
  y: number;
}

interface UseCanvasDrawingProps {
  tool: CanvasTool;
  brushSize: number;
  baseImage: string | null;
}

export function useCanvasDrawing({ tool, brushSize, baseImage }: UseCanvasDrawingProps) {
  // Refs para os 3 canvas
  const instructionCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // Estado de desenho
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  // Zoom e Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);

  /**
   * Inicializa os canvas quando a imagem muda
   */
  useEffect(() => {
    if (!baseImage) return;

    const img = new Image();
    img.onload = () => {
      // Configurar instruction canvas
      if (instructionCanvasRef.current) {
        const ctx = instructionCanvasRef.current;
        ctx.width = img.width;
        ctx.height = img.height;
        clearInstructionLayer();
      }

      // Configurar mask canvas
      if (maskCanvasRef.current) {
        const ctx = maskCanvasRef.current;
        ctx.width = img.width;
        ctx.height = img.height;
        clearMaskLayer();
      }
    };
    img.src = baseImage;
  }, [baseImage]);

  /**
   * Converte coordenadas do mouse para coordenadas do canvas
   */
  const getCanvasCoordinates = useCallback((e: MouseEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  /**
   * Desenha uma linha no canvas
   */
  const drawLine = useCallback((
    ctx: CanvasRenderingContext2D,
    from: Point,
    to: Point,
    color: string,
    lineWidth: number,
    composite: GlobalCompositeOperation = 'source-over'
  ) => {
    ctx.globalCompositeOperation = composite;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, []);

  /**
   * Inicia o desenho
   */
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (tool === 'move') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const canvas = tool === 'brush' || tool === 'eraser'
      ? instructionCanvasRef.current
      : maskCanvasRef.current;

    if (!canvas) return;

    setIsDrawing(true);
    const point = getCanvasCoordinates(e, canvas);
    setLastPoint(point);
  }, [tool, pan, getCanvasCoordinates]);

  /**
   * Desenha durante o movimento
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Pan mode
    if (isPanning && panStart) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Drawing mode
    if (!isDrawing || !lastPoint) return;

    const canvas = tool === 'brush' || tool === 'eraser'
      ? instructionCanvasRef.current
      : maskCanvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPoint = getCanvasCoordinates(e, canvas);

    // Configuração baseada na ferramenta
    if (tool === 'brush') {
      // Desenho de instrução em vermelho opaco
      drawLine(ctx, lastPoint, currentPoint, '#FF0000', brushSize, 'source-over');
    } else if (tool === 'select') {
      // Máscara branca semi-transparente
      drawLine(ctx, lastPoint, currentPoint, 'rgba(255, 255, 255, 0.6)', brushSize, 'source-over');
    } else if (tool === 'eraser') {
      // Apaga da camada ativa (destination-out = transparente)
      drawLine(ctx, lastPoint, currentPoint, 'rgba(0, 0, 0, 1)', brushSize, 'destination-out');
    }

    setLastPoint(currentPoint);
  }, [isDrawing, lastPoint, tool, brushSize, isPanning, panStart, getCanvasCoordinates, drawLine]);

  /**
   * Finaliza o desenho
   */
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setLastPoint(null);
    setIsPanning(false);
    setPanStart(null);
  }, []);

  /**
   * Limpa a camada de instrução (vermelha)
   */
  const clearInstructionLayer = useCallback(() => {
    if (!instructionCanvasRef.current) return;
    const ctx = instructionCanvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, instructionCanvasRef.current.width, instructionCanvasRef.current.height);
  }, []);

  /**
   * Limpa a camada de máscara (branca)
   */
  const clearMaskLayer = useCallback(() => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
  }, []);

  /**
   * Obtém a imagem da camada de instrução (para enviar à IA)
   */
  const getInstructionData = useCallback((): string | null => {
    if (!instructionCanvasRef.current) return null;

    // Verifica se há algo desenhado
    const ctx = instructionCanvasRef.current.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, instructionCanvasRef.current.width, instructionCanvasRef.current.height);
    const hasDrawing = imageData.data.some((value, index) => index % 4 === 3 && value > 0);

    if (!hasDrawing) return null;

    return instructionCanvasRef.current.toDataURL('image/png');
  }, []);

  /**
   * Obtém a imagem da camada de máscara (para enviar à IA)
   */
  const getMaskData = useCallback((): string | null => {
    if (!maskCanvasRef.current) return null;

    // Verifica se há algo desenhado
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    const hasDrawing = imageData.data.some((value, index) => index % 4 === 3 && value > 0);

    if (!hasDrawing) return null;

    return maskCanvasRef.current.toDataURL('image/png');
  }, []);

  /**
   * Combina a imagem base com a camada de instrução
   * (Para enviar à IA quando usando o modo Pincel)
   */
  const getCompositeImage = useCallback((): string | null => {
    if (!baseImage || !instructionCanvasRef.current) return null;

    const instructionData = getInstructionData();
    if (!instructionData) return baseImage; // Sem desenho, retorna base

    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(baseImage);
        return;
      }

      const baseImg = new Image();
      baseImg.onload = () => {
        canvas.width = baseImg.width;
        canvas.height = baseImg.height;

        // Desenha base
        ctx.drawImage(baseImg, 0, 0);

        // Sobrepõe instrução
        const instructionImg = new Image();
        instructionImg.onload = () => {
          ctx.drawImage(instructionImg, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        instructionImg.src = instructionData;
      };
      baseImg.src = baseImage;
    }) as any;
  }, [baseImage, getInstructionData]);

  /**
   * Zoom in/out
   */
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  /**
   * Reset zoom e pan
   */
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    // Refs
    instructionCanvasRef,
    maskCanvasRef,

    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,

    // Data extraction
    getInstructionData,
    getMaskData,
    getCompositeImage,

    // Clear functions
    clearInstructionLayer,
    clearMaskLayer,

    // Zoom & Pan
    zoom,
    pan,
    handleZoom,
    resetView,
    isPanning,
  };
}
