import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Copy,
  Trash2,
  Upload,
  Plus,
  Pencil,
  Eraser,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  EllipsisVertical,
  X,
} from 'lucide-react';
import exampleImage from 'figma:asset/ac70aaa98fd35bb0ee11d9225a3a8c0883ab8066.png';
import { useToast } from './ToastProvider';
import EditorLoadingSkeleton from './EditorLoadingSkeleton';
import { useProgressiveHints } from '../hooks/useProgressiveHints';
import ProgressiveHint from './ProgressiveHint';
import CreditsWarningHint from './CreditsWarningHint';
import CreditLimitModal from './CreditLimitModal';
import ProgressChecklist, { ChecklistProgress } from './ProgressChecklist';

interface EditorProps {
  projectId: string | null;
  onBack: () => void;
  onOpenUpgradeModal?: (context: 'feature' | 'projects' | 'trial' | 'credits') => void;
  onUploadComplete?: () => void;
  shouldOpenUploadOnMount?: boolean;
  isFirstTimeUser?: boolean;
  onFirstProjectComplete?: () => void;
}

type Tool = 'select' | 'brush' | 'eraser' | 'move';

interface Version {
  id: string;
  name: string;
  timestamp: string;
  thumbnail: string;
}

const mockVersions: Version[] = [
  {
    id: '1',
    name: 'Imagem Original',
    timestamp: '18:36:31',
    thumbnail: exampleImage,
  },
];

export default function Editor({ 
  projectId, 
  onBack, 
  onOpenUpgradeModal, 
  onUploadComplete, 
  shouldOpenUploadOnMount = false,
  isFirstTimeUser = false,
  onFirstProjectComplete
}: EditorProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [brushSize, setBrushSize] = useState(50);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectName, setProjectName] = useState(projectId ? 'Sala de Estar Clássica' : 'Novo Projeto');
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [activeVersion, setActiveVersion] = useState('1');
  const [isPanning, setIsPanning] = useState(false);
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreditLimitModal, setShowCreditLimitModal] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError, showInfo } = useToast();

  // Progress Checklist State
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({
    createdProject: false,
    uploadedPhoto: false,
    selectedStyle: false,
    generatedImage: false,
  });

  // Progressive Hints System
  const { hasSeenHint, markHintAsSeen, resetHints, resetHint } = useProgressiveHints();
  const [imagesGenerated, setImagesGenerated] = useState(1); // Start at 1 (original image)
  const [hasHoveredDownload, setHasHoveredDownload] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const creditsTotal = 5; // Free tier
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Simular carregamento inicial do editor
  useEffect(() => {
    setIsLoadingEditor(true);
    const timer = setTimeout(() => {
      setIsLoadingEditor(false);
      
      // Se for first-time user, abrir upload modal e mostrar checklist
      if (shouldOpenUploadOnMount && isFirstTimeUser) {
        setTimeout(() => {
          setShowUploadModal(true);
          setShowChecklist(true);
          // Marca que o projeto foi criado
          setChecklistProgress(prev => ({ ...prev, createdProject: true }));
        }, 300);
      } else if (!projectId) {
        // Mostrar mensagem informativa para novo projeto
        setTimeout(() => {
          showInfo(
            'Novo projeto criado!',
            'Faça upload de uma imagem ou comece a desenhar no canvas.'
          );
        }, 300);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [projectId, showInfo, shouldOpenUploadOnMount, isFirstTimeUser]);

  // Keyboard shortcut for debug panel (Ctrl+Shift+H)
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

  const tools = [
    { id: 'select' as Tool, icon: Move, label: 'Mover' },
    { id: 'brush' as Tool, icon: Pencil, label: 'Pincel' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'Borracha' },
  ];

  const handleGenerate = () => {
    // Verificar se há créditos disponíveis
    if (creditsUsed >= creditsTotal) {
      setShowCreditLimitModal(true);
      return;
    }

    if (!prompt.trim()) {
      showError(
        'Prompt vazio',
        'Por favor, descreva a cena que deseja gerar.',
      );
      return;
    }

    setIsGenerating(true);
    
    // Marca estilo como selecionado na primeira geração
    if (!checklistProgress.selectedStyle) {
      setChecklistProgress(prev => ({ ...prev, selectedStyle: true }));
    }
    
    // Simular processamento
    setTimeout(() => {
      setIsGenerating(false);
      setImagesGenerated(prev => prev + 1);
      setCreditsUsed(prev => prev + 1);
      
      // Marca imagem como gerada
      setChecklistProgress(prev => ({ ...prev, generatedImage: true }));
      
      showSuccess(
        'Imagem gerada com sucesso!',
        'Sua nova variação está disponível no histórico.'
      );
      
      // Se completou todas as etapas, marca first project como completo
      if (isFirstTimeUser && checklistProgress.uploadedPhoto) {
        setTimeout(() => {
          if (onFirstProjectComplete) {
            onFirstProjectComplete();
          }
        }, 2000);
      }
    }, 3000);
  };

  // Mostrar skeleton durante carregamento
  if (isLoadingEditor) {
    return <EditorLoadingSkeleton />;
  }

  return (
    <div className="size-full flex gap-4 p-4 relative">
      {/* Barra Lateral Esquerda - Controles */}
      <div className={`transition-all duration-300 ${leftPanelOpen ? 'w-80' : 'w-0'} shrink-0 relative`}>
        {leftPanelOpen && (
          <aside className="w-80 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4 h-full">
            {/* Botão Voltar e Dropdown do Projeto */}
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1 relative">
                <button
                  onClick={() => setShowProjectMenu(!showProjectMenu)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm text-gray-900">{projectName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {showProjectMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => {
                        showSuccess('Projeto exportado', 'O arquivo foi salvo com sucesso.');
                        setShowProjectMenu(false);
                      }}
                      onMouseEnter={() => setHasHoveredDownload(true)}
                      className="hint-download-button w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
                    <button
                      onClick={() => {
                        showSuccess('Projeto duplicado', 'Uma cópia foi criada na galeria.');
                        setShowProjectMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar projeto
                    </button>
                    <button
                      onClick={() => {
                        showError('Projeto excluído', 'O projeto foi removido permanentemente.');
                        setShowProjectMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir projeto
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Imagem do Projeto */}
            <div className="bg-gray-100/70 border border-gray-200/80 rounded-xl p-3">
              <label className="text-xs text-gray-600 mb-2 block">IMAGEM DO PROJETO</label>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2">
                {projectId ? (
                  <img src={exampleImage} alt="Projeto" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Nenhuma imagem</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(true);
                }}
                className={`w-full rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors ${
                  projectId
                    ? 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                {projectId ? 'Alterar imagem' : 'Fazer upload'}
              </button>
            </div>

            {/* Referências do Projeto */}
            <div className="bg-gray-100/70 border border-gray-200/80 rounded-xl p-3">
              <label className="text-xs text-gray-600 mb-2 block">REFERÊNCIAS DO PROJETO</label>
              <button className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg px-3 py-6 text-sm text-gray-500 flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt da Cena */}
            <div className="bg-gray-100/70 border border-gray-200/80 rounded-xl p-3 flex-1 flex flex-col">
              <label className="text-xs text-gray-600 mb-2 block">PROMPT DA CENA</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva o prompt da cena aqui... Use '/' para adicionar uma referência."
                className="flex-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
              />
            </div>

            {/* Botão Gerar Imagem */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar imagem'
              )}
            </button>
          </aside>
        )}
        {/* Botão para Recolher/Expandir */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-1 hover:bg-gray-50 transition-colors z-10"
        >
          {leftPanelOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Área Central - Canvas */}
      <main className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600">Download</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-600">
              Histórico
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`flex-1 bg-gray-50 relative overflow-hidden ${
            activeTool === 'move' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          onMouseDown={() => activeTool === 'move' && setIsPanning(true)}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={exampleImage}
              alt="Canvas"
              className="max-w-full max-h-full shadow-2xl"
              style={{ pointerEvents: 'none' }}
            />
          </div>

          {/* Mensagem de Ajuda */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-600 shadow-lg">
            Clique em uma usando uma vizinha ferramenta no canvas para pintar!
          </div>
        </div>

        {/* Barra de Ferramentas Flutuante */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 flex items-center gap-1 p-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`p-3 rounded-full transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={tool.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button className="p-3 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="p-3 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button className="p-3 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Controle de Pincel - Aparece contextualmente */}
        {(activeTool === 'brush' || activeTool === 'eraser') && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 px-6 py-3 flex items-center gap-4">
            <span className="text-sm text-gray-600">Tamanho:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-900 w-8">{brushSize}</span>
          </div>
        )}
      </main>

      {/* Barra Lateral Direita - Histórico */}
      <div className={`transition-all duration-300 ${rightPanelOpen ? 'w-80' : 'w-0'} shrink-0 relative`}>
        {rightPanelOpen && (
          <aside className="hint-history-sidebar w-80 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900">Histórico da Sessão</h3>
            </div>
            <p className="text-xs text-gray-500">1 versões salvas nessa sessão</p>

            {/* Lista de Versões */}
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-2">
                {mockVersions.map((version) => (
                  <div
                    key={version.id}
                    className={`group border rounded-xl overflow-hidden cursor-pointer transition-all ${
                      activeVersion === version.id
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setActiveVersion(version.id)}
                  >
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={version.thumbnail}
                        alt={version.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex items-start justify-between">
                      <div>
                        <h4 className="text-sm text-gray-900">{version.name}</h4>
                        <p className="text-xs text-gray-500">{version.timestamp}</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
                        <EllipsisVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
        {/* Botão para Recolher/Expandir */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-1 hover:bg-gray-50 transition-colors z-10"
        >
          {rightPanelOpen ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Modal de Carregamento */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm">
            <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
            <h3 className="text-gray-900">Gerando imagem...</h3>
            <p className="text-sm text-gray-600 text-center">
              Aguarde enquanto processamos sua solicitação com IA.
            </p>
          </div>
        </div>
      )}

      {/* Progressive Hints System */}
      
      {/* Hint 1: Download de imagem - Trigger: Mouse hover no resultado pela primeira vez */}
      <ProgressiveHint
        isVisible={hasHoveredDownload && !hasSeenHint('download-image')}
        onDismiss={() => markHintAsSeen('download-image')}
        text="Clique para baixar em alta resolução"
        position="bottom"
        targetSelector=".hint-download-button"
        delay={500}
      />

      {/* Hint 2: Comparação antes/depois - Trigger: Segunda imagem gerada */}
      <ProgressiveHint
        isVisible={imagesGenerated >= 2 && !hasSeenHint('comparison-slider')}
        onDismiss={() => markHintAsSeen('comparison-slider')}
        text="Arraste para comparar antes e depois"
        position="bottom"
        delay={1000}
        autoDismissDelay={8000}
      />

      {/* Hint 3: Histórico - Trigger: Terceira imagem gerada */}
      <ProgressiveHint
        isVisible={imagesGenerated >= 3 && !hasSeenHint('history-saved') && rightPanelOpen}
        onDismiss={() => markHintAsSeen('history-saved')}
        text="Todas as suas criações ficam salvas aqui"
        position="left"
        targetSelector=".hint-history-sidebar"
        showArrow={true}
        delay={1500}
      />

      {/* Hint 4: Créditos - Trigger: 50% dos créditos usados (Toast automático) */}
      <CreditsWarningHint
        creditsUsed={creditsUsed}
        creditsTotal={creditsTotal}
        hasSeenHint={hasSeenHint}
        markHintAsSeen={markHintAsSeen}
        onViewPlans={() => {
          showInfo('Planos', 'Navegando para página de planos...');
        }}
      />

      {/* Debug Panel (toggle with Ctrl+Shift+H) */}
      {showDebugPanel && (
        <div className="fixed bottom-4 right-4 z-[250] w-96">
          <div className="bg-white border-2 border-[#030213] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#030213]" style={{ fontSize: '16px', fontWeight: 600 }}>
                Hints Debug Panel
              </h3>
              <button
                onClick={() => setShowDebugPanel(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* State Info */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-[#717182]">Imagens geradas:</span>
                <span className="text-[#030213] font-medium">{imagesGenerated}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#717182]">Download hover:</span>
                <span className="text-[#030213] font-medium">{hasHoveredDownload ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#717182]">Créditos usados:</span>
                <span className="text-[#030213] font-medium">{creditsUsed}/{creditsTotal}</span>
              </div>
            </div>

            {/* Hints Status */}
            <div className="space-y-2 mb-4">
              <p className="text-sm text-[#717182] mb-2">Status dos Hints:</p>
              {(['download-image', 'comparison-slider', 'history-saved', 'credits-warning'] as const).map((hintId) => {
                const labels = {
                  'download-image': 'Download',
                  'comparison-slider': 'Comparação',
                  'history-saved': 'Histórico',
                  'credits-warning': 'Créditos'
                };
                const seen = hasSeenHint(hintId);
                return (
                  <div key={hintId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${seen ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-[#030213]">{labels[hintId]}</span>
                    </div>
                    {seen && (
                      <button
                        onClick={() => resetHint(hintId)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setImagesGenerated(prev => prev + 1);
                  setCreditsUsed(prev => prev + 1);
                  showSuccess('Debug', 'Imagem gerada simulada');
                }}
                className="w-full px-3 py-2 bg-[#030213] text-white rounded-lg text-sm hover:bg-[#030213]/90 transition-colors"
              >
                Simular Geração
              </button>
              <button
                onClick={() => {
                  setHasHoveredDownload(true);
                  showInfo('Debug', 'Download hover ativado');
                }}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Ativar Download Hover
              </button>
              <button
                onClick={() => {
                  resetHints();
                  showInfo('Debug', 'Hints resetados');
                }}
                className="w-full px-3 py-2 border border-gray-300 text-[#030213] rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Reset Todos Hints
              </button>
              <button
                onClick={() => {
                  setImagesGenerated(1);
                  setHasHoveredDownload(false);
                  setCreditsUsed(0);
                  showInfo('Debug', 'Estado resetado');
                }}
                className="w-full px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                Reset Estado
              </button>
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="text-xs text-[#717182] mb-2">Checklist</p>
                <button
                  onClick={() => {
                    setShowChecklist(!showChecklist);
                    showInfo('Debug', showChecklist ? 'Checklist ocultado' : 'Checklist exibido');
                  }}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  {showChecklist ? 'Ocultar' : 'Mostrar'} Checklist
                </button>
                <button
                  onClick={() => {
                    setChecklistProgress({
                      createdProject: false,
                      uploadedPhoto: false,
                      selectedStyle: false,
                      generatedImage: false,
                    });
                    showInfo('Debug', 'Checklist resetado');
                  }}
                  className="w-full px-3 py-2 mt-2 border border-purple-300 text-purple-600 rounded-lg text-sm hover:bg-purple-50 transition-colors"
                >
                  Reset Checklist
                </button>
              </div>
            </div>

            <p className="text-xs text-[#717182] mt-4 text-center">
              Ctrl+Shift+H para fechar
            </p>
          </div>
        </div>
      )}

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
            <h2 className="text-gray-900 mb-4">Upload de Imagem</h2>
            <p className="text-gray-600 mb-6">
              Selecione uma imagem para começar a editar
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 mb-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">Clique para fazer upload</p>
              <p className="text-sm text-gray-400">ou arraste e solte aqui</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Simular upload completo
                  if (onUploadComplete) {
                    onUploadComplete();
                  }
                  
                  // Atualizar checklist progress
                  setChecklistProgress(prev => ({ ...prev, uploadedPhoto: true }));
                  
                  setShowUploadModal(false);
                  showSuccess('Upload concluído!', 'Sua imagem foi carregada com sucesso.');
                }}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Simular Upload
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Limit Modal */}
      <CreditLimitModal
        isOpen={showCreditLimitModal}
        onClose={() => setShowCreditLimitModal(false)}
        onUpgrade={() => {
          if (onOpenUpgradeModal) {
            onOpenUpgradeModal('credits');
          }
        }}
        onBuyCredits={() => {
          showInfo('Comprar créditos', 'Funcionalidade em desenvolvimento.');
        }}
        creditsUsed={creditsUsed}
        creditsTotal={creditsTotal}
        daysUntilReset={23}
      />

      {/* Progress Checklist - Para first-time users */}
      {showChecklist && (
        <ProgressChecklist
          progress={checklistProgress}
          onDismiss={() => setShowChecklist(false)}
        />
      )}
    </div>
  );
}
