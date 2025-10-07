import { useState, useEffect } from 'react';
import { Search, Grid3x3, Star, Archive, FolderOpen, Plus, EllipsisVertical, Download, Copy, Trash2, Sparkles, User, Settings } from 'lucide-react';
import exampleImage from 'figma:asset/634d69ec8ea4cfc0901be0b298e71a0eee07ff3d.png';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useToast } from './ToastProvider';
import EmptyStateGallery from './EmptyStateGallery';
import EmptyStateSearch from './EmptyStateSearch';
import EmptyStateFolder from './EmptyStateFolder';
import GalleryGridSkeleton from './GalleryGridSkeleton';
import UpgradeModal, { UpgradeModalContext } from './UpgradeModal';
import FirstProjectGuide from './FirstProjectGuide';
import ProgressChecklist, { ChecklistProgress } from './ProgressChecklist';
import ContextualTooltip, { TooltipType } from './ContextualTooltip';
import SuccessCelebration from './SuccessCelebration';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Project {
  id: string;
  name: string;
  date: string;
  thumbnail?: string;
}

interface GalleryProps {
  onOpenProject: (projectId: string) => void;
  onCreateNewProject?: () => void;
  onOpenSettings: () => void;
  onOpenPricing?: () => void;
  onNavigateToWelcome?: () => void;
  onStartTour?: () => void;
  shouldOpenUpgradeModal?: boolean;
  upgradeModalContext?: 'feature' | 'projects' | 'trial' | 'credits';
  onUpgradeModalChange?: (isOpen: boolean) => void;
  isFirstTime?: boolean;
  onFirstProjectComplete?: () => void;
  onResetFirstTime?: () => void;
  uploadCompleted?: boolean;
  mockProjects?: Project[];
  userCredits?: { current: number; max: number };
}

const defaultMockProjects: Project[] = [
  {
    id: '1',
    name: 'Sala de Estar Clássica',
    date: '03/10/2025',
    thumbnail: exampleImage,
  },
  {
    id: '2',
    name: 'Cozinha Moderna',
    date: '02/10/2025',
  },
  {
    id: '3',
    name: 'Quarto Aconchegante',
    date: '01/10/2025',
  },
];

export default function Gallery({
  onOpenProject,
  onCreateNewProject,
  onOpenSettings,
  onOpenPricing,
  onNavigateToWelcome,
  onStartTour,
  shouldOpenUpgradeModal = false,
  upgradeModalContext: externalUpgradeModalContext = 'credits',
  onUpgradeModalChange,
  isFirstTime = false,
  onFirstProjectComplete,
  onResetFirstTime,
  uploadCompleted = false,
  mockProjects = defaultMockProjects,
  userCredits = { current: 5, max: 5 }
}: GalleryProps) {
  const { user } = useFirebaseUser();
  const [activeNav, setActiveNav] = useState('galeria');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalContext, setUpgradeModalContext] = useState<UpgradeModalContext>('credits');
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Helper para obter iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // First-time user experience state
  const [showFirstProjectGuide, setShowFirstProjectGuide] = useState(isFirstTime);
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({
    createdProject: false,
    uploadedPhoto: false,
    selectedStyle: false,
    generatedImage: false
  });
  const [activeTooltip, setActiveTooltip] = useState<TooltipType | null>(null);
  const [tooltipDismissed, setTooltipDismissed] = useState<Record<TooltipType, boolean>>({
    'upload-hint': false,
    'choose-style': false,
    'ready-to-generate': false
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // Handle external trigger to open upgrade modal
  useEffect(() => {
    if (shouldOpenUpgradeModal) {
      setUpgradeModalContext(externalUpgradeModalContext);
      setUpgradeModalOpen(true);
    }
  }, [shouldOpenUpgradeModal, externalUpgradeModalContext]);

  // Contextual tooltips logic for first-time users
  useEffect(() => {
    if (!isFirstTime || !showFirstProjectGuide) return;

    // Tooltip 1: Show upload hint after 10s if no upload
    if (!checklistProgress.uploadedPhoto && !tooltipDismissed['upload-hint']) {
      const timer = setTimeout(() => {
        setActiveTooltip('upload-hint');
      }, 10000);
      return () => clearTimeout(timer);
    }

    // Tooltip 2: Show style hint after upload
    if (checklistProgress.uploadedPhoto && !checklistProgress.selectedStyle && !tooltipDismissed['choose-style']) {
      const timer = setTimeout(() => {
        setActiveTooltip('choose-style');
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Tooltip 3: Show generate hint after style selected
    if (checklistProgress.selectedStyle && !checklistProgress.generatedImage && !tooltipDismissed['ready-to-generate']) {
      const timer = setTimeout(() => {
        setActiveTooltip('ready-to-generate');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstTime, showFirstProjectGuide, checklistProgress, tooltipDismissed]);

  // React to upload completion from Editor
  useEffect(() => {
    if (uploadCompleted && !checklistProgress.uploadedPhoto) {
      setChecklistProgress(prev => ({ ...prev, uploadedPhoto: true }));
    }
  }, [uploadCompleted, checklistProgress.uploadedPhoto]);

  // Handlers for first-time guide
  const handleUploadPhoto = () => {
    console.log('🔵 handleUploadPhoto called');
    console.log('🔵 onCreateNewProject:', onCreateNewProject);

    // Marca que criou o projeto (primeiro passo)
    setChecklistProgress(prev => ({ ...prev, createdProject: true }));
    setShowFirstProjectGuide(false);

    // Cria o projeto e vai para o editor COM modal de upload aberto
    if (onCreateNewProject) {
      console.log('🔵 Calling onCreateNewProject(true)');
      onCreateNewProject(true); // Pass true to open upload modal
    } else {
      console.error('❌ onCreateNewProject is not defined!');
    }
  };

  const handleSelectStyle = () => {
    setChecklistProgress(prev => ({ ...prev, selectedStyle: true }));
  };

  const handleGenerateImage = () => {
    setChecklistProgress(prev => ({ ...prev, generatedImage: true }));
    
    // Show celebration modal for first-time users
    if (isFirstTime) {
      setShowCelebration(true);
    } else {
      showSuccess('Imagem gerada!', 'Sua transformação está pronta.');
    }
  };

  const handleDismissTooltip = (type: TooltipType) => {
    setActiveTooltip(null);
    setTooltipDismissed(prev => ({ ...prev, [type]: true }));
  };

  const navItems = [
    { id: 'galeria', label: 'Galeria', icon: Grid3x3 },
    { id: 'favoritos', label: 'Favoritos', icon: Star },
    { id: 'arquivados', label: 'Arquivados', icon: Archive },
  ];

  // Filtrar projetos baseado na navegação ativa e busca
  // Mostrar projetos se existirem, independente de isFirstTime
  const projectsToShow = mockProjects;
  
  const filteredProjects = projectsToShow.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const isEmpty = filteredProjects.length === 0;
  const isSearching = searchQuery.trim().length > 0;

  // Simular carregamento ao mudar navegação
  const handleNavChange = (navId: string) => {
    setIsLoading(true);
    setActiveNav(navId);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-full gap-4 p-4 bg-[#F7F7F8]">
      {/* Barra Lateral Esquerda */}
      <aside className="w-64 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4 shrink-0 h-full">
        {/* Logo */}
        <div className="px-2 py-1">
          <h2 className="text-gray-900">KTÍRIO</h2>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100/70 border border-gray-200/80 rounded-lg pl-10 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Links de Navegação */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavChange(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Seção de Pastas */}
        <div className="pt-4 border-t border-gray-200/50">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Pastas</span>
            <button className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 w-full transition-colors">
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm">Projeto Recentes</span>
          </button>
        </div>

        {/* Spacer - empurra elementos abaixo para o bottom */}
        <div className="flex-1"></div>

        {/* Sistema de Créditos */}
        <div className="bg-gray-100/70 border border-gray-200/80 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 uppercase tracking-wider">Créditos</span>
            <Sparkles className="w-4 h-4 text-gray-500" />
          </div>
          <div className="mb-3">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-gray-900">150</span>
              <span className="text-xs text-gray-500">/ 500</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gray-900 h-1.5 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          <button
            onClick={() => {
              setUpgradeModalContext('credits');
              setUpgradeModalOpen(true);
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-3 py-2 text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Fazer upgrade
          </button>
        </div>

        {/* Perfil e Configurações */}
        <div className="border-t border-gray-200/50 pt-3">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar || user?.photoURL || ''} />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                {getInitials(user?.name || user?.displayName || user?.email || 'Usuário')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm text-gray-900">{user?.name || user?.displayName || 'Minha Conta'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'usuario@email.com'}</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 h-full overflow-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-gray-900">Galeria</h1>
          {!isEmpty && (
            <button
              onClick={() => {
                // Marcar primeiro passo como completo para usuários novos
                if (isFirstTime && !checklistProgress.createdProject) {
                  setChecklistProgress(prev => ({ ...prev, createdProject: true }));
                }
                
                if (onCreateNewProject) {
                  onCreateNewProject();
                }
              }}
              className="tour-upload-area bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo projeto
            </button>
          )}
        </div>



        {/* Loading, Empty States ou Grade de Projetos */}
        {isLoading ? (
          <GalleryGridSkeleton count={6} />
        ) : isEmpty ? (
          isSearching ? (
            <EmptyStateSearch
              searchTerm={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              onViewAll={() => {
                setSearchQuery('');
                handleNavChange('galeria');
              }}
            />
          ) : activeNav === 'favoritos' ? (
            <EmptyStateFolder
              onAddProject={() => showInfo('Adicionar projeto', 'Marque projetos como favoritos.')}
              onBackToGallery={() => handleNavChange('galeria')}
            />
          ) : activeNav === 'arquivados' ? (
            <EmptyStateFolder
              onAddProject={() => showInfo('Adicionar projeto', 'Arquive projetos da galeria.')}
              onBackToGallery={() => handleNavChange('galeria')}
            />
          ) : showFirstProjectGuide && isFirstTime ? (
            <FirstProjectGuide
              onUpload={handleUploadPhoto}
              onViewExamples={() => showInfo('Exemplos', 'Galeria de exemplos em breve.')}
            />
          ) : (
            <EmptyStateGallery
              onNewProject={() => {
                // Marcar primeiro passo como completo para usuários novos
                if (isFirstTime && !checklistProgress.createdProject) {
                  setChecklistProgress(prev => ({ ...prev, createdProject: true }));
                }
                
                if (onCreateNewProject) {
                  onCreateNewProject();
                }
              }}
              onViewExamples={() => showInfo('Exemplos', 'Galeria de exemplos em breve.')}
            />
          )
        ) : (
          <div className="tour-styles-gallery grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className={`group border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-800/50 transition-all cursor-pointer ${index === 0 ? 'tour-generate-button' : ''}`}
              onClick={() => onOpenProject(project.id)}
            >
              {/* Miniatura */}
              <div className="relative aspect-video bg-gray-100">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2 text-gray-300">
                      <div className="w-8 h-8 rounded bg-gray-200"></div>
                      <div className="w-8 h-8 rounded bg-gray-200"></div>
                      <div className="w-8 h-8 rounded bg-gray-200"></div>
                      <div className="w-8 h-8 rounded bg-gray-200"></div>
                    </div>
                  </div>
                )}
                {/* Menu de Opções - Aparece no hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === project.id ? null : project.id);
                      }}
                      className="w-8 h-8 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                    >
                      <EllipsisVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === project.id && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showSuccess('Download iniciado', 'Seu projeto está sendo baixado.');
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Baixar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showSuccess('Projeto duplicado', 'Uma cópia do projeto foi criada.');
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showError('Projeto excluído', 'O projeto foi removido permanentemente.');
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Informações do Projeto */}
              <div className="p-4">
                <h3 className="text-gray-900 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.date}</p>
              </div>
            </div>
          ))}
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          if (onUpgradeModalChange) {
            onUpgradeModalChange(false);
          }
        }}
        context={upgradeModalContext}
        onContinue={(planId, billingPeriod) => {
          console.log('Plan selected:', planId, billingPeriod);
          showSuccess('Redirecionando...', 'Você será direcionado para o pagamento.');
        }}
        onError={(message) => {
          showError('Erro no checkout', message);
        }}
      />

      {/* First-Time User Experience */}
      {isFirstTime && !checklistProgress.generatedImage && (
        <>
          {/* Progress Checklist */}
          <ProgressChecklist
            progress={checklistProgress}
            onDismiss={() => {
              if (onFirstProjectComplete) {
                onFirstProjectComplete();
              }
            }}
          />

          {/* Contextual Tooltips */}
          {activeTooltip && (
            <div className="fixed inset-0 pointer-events-none z-[140] flex items-center justify-center p-4">
              <div className="pointer-events-auto">
                <ContextualTooltip
                  type={activeTooltip}
                  onDismiss={() => handleDismissTooltip(activeTooltip)}
                  targetSelector={
                    activeTooltip === 'upload-hint' ? '.tour-upload-area' :
                    activeTooltip === 'choose-style' ? '.tour-styles-gallery' :
                    activeTooltip === 'ready-to-generate' ? '.tour-generate-button' :
                    undefined
                  }
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Success Celebration Modal */}
      <SuccessCelebration
        isOpen={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          if (onFirstProjectComplete) {
            onFirstProjectComplete();
          }
        }}
        onViewImage={() => {
          setShowCelebration(false);
          showInfo('Ver imagem', 'Navegação para imagem gerada.');
          if (onFirstProjectComplete) {
            onFirstProjectComplete();
          }
        }}
        onCreateAnother={() => {
          setShowCelebration(false);
          setShowFirstProjectGuide(true);
          setChecklistProgress({
            uploadedPhoto: false,
            selectedStyle: false,
            generatedImage: false
          });
          showInfo('Criar outra', 'Vamos criar mais uma transformação!');
        }}
        creditsRemaining={4}
      />
    </div>
  );
}
