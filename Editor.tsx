import React, { useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { PaintBrushIcon, EraserIcon, DownloadIcon, HistoryIcon, SelectToolIcon } from './icons';
import Canvas, { CanvasHandles } from './Canvas';
import { BrushMode, Project, Folder } from '../types';
import EditPromptModal from './EditPromptModal';
import RightSidebar from './RightSidebar';
import LoadingModal from './LoadingModal';
import WelcomeView from './WelcomeView';

// Custom hooks - separam lógica complexa do componente visual
import { useCanvasControls } from '../hooks/useCanvasControls';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useEditorState } from '../hooks/useEditorState';

interface EditorProps {
    project: Project;
    folders: Folder[];
    onUpdateProject: (project: Project) => void;
    onBackToGallery: () => void;
    onDuplicateProject: () => void;
    onNewProjectFromVersion: (image?: string) => void;
    onToggleFavorite: () => void;
    onToggleArchive: () => void;
    onMoveProject: (folderId: string) => void;
}

/**
 * Editor Principal - Centro de controle de edição de imagens
 *
 * Responsabilidades:
 * - Orquestra todos os componentes de edição
 * - Gerencia estado através de custom hooks
 * - Sincroniza mudanças com o projeto pai
 * - Coordena interação entre canvas, IA e ferramentas
 */
const Editor: React.FC<EditorProps> = ({
    project,
    folders,
    onUpdateProject,
    onBackToGallery,
    onDuplicateProject,
    onNewProjectFromVersion,
    onToggleFavorite,
    onToggleArchive,
    onMoveProject,
}) => {
    // ========== REFS ==========
    // Referências diretas para elementos do DOM e componentes
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasComponentRef = useRef<CanvasHandles>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    // ========== CUSTOM HOOKS ==========
    // Separa lógica complexa em módulos reutilizáveis
    const canvasControls = useCanvasControls();        // Zoom, pan, navegação
    const imageGeneration = useImageGeneration(project.history);  // IA e imagens
    const editorState = useEditorState(project.name);  // UI e ferramentas

    // ========== EFFECTS ==========

    // Carrega imagem base inicial do projeto
    useEffect(() => {
        if (project.baseImage && !imageGeneration.baseImage) {
            imageGeneration.handleSetBaseImage(project.baseImage);
        }
    }, [project.baseImage]);

    // Sincroniza mudanças locais com o componente pai (auto-save)
    useEffect(() => {
        onUpdateProject({
            ...project,
            name: editorState.projectName,
            baseImage: imageGeneration.baseImage,
            history: imageGeneration.history,
        });
    }, [editorState.projectName, imageGeneration.baseImage, imageGeneration.history]);

    // ========== HANDLERS ==========

    /**
     * Extrai dados da máscara de desenho para enviar à IA
     * Converte canvas de máscara em base64
     */
    const getMaskData = (): string | null => {
        if (!maskCanvasRef.current) return null;
        return maskCanvasRef.current.toDataURL('image/png');
    };

    /**
     * Processa nova imagem base carregada pelo usuário
     * Reseta zoom e posição ao carregar nova imagem
     */
    const handleSetBaseImage = (img: string) => {
        imageGeneration.handleSetBaseImage(img);
        canvasControls.resetOnNewImage();
    };


    return (
        <div className="flex w-full h-screen p-4 gap-4 box-border">
            {/* Sidebar esquerda */}
            <Sidebar
                project={project}
                folders={folders}
                onImageUpload={handleSetBaseImage}
                prompt={imageGeneration.prompt}
                onPromptChange={imageGeneration.setPrompt}
                onGenerate={() => imageGeneration.handleGenerate(getMaskData)}
                isLoading={imageGeneration.isLoading}
                baseImage={imageGeneration.baseImage}
                objectImages={imageGeneration.objectImages}
                onAddReferenceImage={imageGeneration.handleAddReferenceImage}
                onUpdateReferenceImage={imageGeneration.handleUpdateReferenceImage}
                onDeleteReferenceImage={imageGeneration.handleDeleteReferenceImage}
                projectName={editorState.projectName}
                onProjectNameChange={editorState.setProjectName}
                onShowHistory={editorState.toggleRightSidebar}
                onExport={() => imageGeneration.handleDownload(editorState.projectName)}
                isCollapsed={!editorState.isLeftSidebarVisible}
                onToggleCollapse={editorState.toggleLeftSidebar}
                onBackToGallery={onBackToGallery}
                onDuplicateProject={onDuplicateProject}
                onNewProjectFromVersion={() => onNewProjectFromVersion()}
                onToggleFavorite={onToggleFavorite}
                onToggleArchive={onToggleArchive}
                onMoveProject={onMoveProject}
            />

            {/* Canvas principal */}
            <main
                className={`flex-1 flex flex-col relative bg-white rounded-2xl shadow-lg overflow-hidden ${canvasControls.getCursor(editorState.activeTool, imageGeneration.baseImage)}`}
                ref={canvasContainerRef}
                onWheel={canvasControls.handleWheel}
                onMouseDown={(e) => canvasControls.handleMouseDown(e, editorState.activeTool, imageGeneration.baseImage)}
                onMouseMove={canvasControls.handleMouseMove}
                onMouseUp={canvasControls.handleMouseUp}
                onMouseLeave={canvasControls.handleMouseUp}
            >
                {/* Conteúdo principal - Canvas ou Welcome */}
                {imageGeneration.hasImages ? (
                    <>
                        {/* Botões do topo */}
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <button
                                onClick={() => imageGeneration.handleDownload(editorState.projectName)}
                                className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                <span>Download</span>
                            </button>
                            <button
                                onClick={editorState.toggleRightSidebar}
                                className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <HistoryIcon className="w-4 h-4" />
                                <span>Histórico</span>
                            </button>
                        </div>

                        {/* Canvas container com transform */}
                        <div
                            className="w-full h-full flex items-center justify-center relative transition-transform duration-100"
                            style={{
                                transform: `translate(${canvasControls.panOffset.x}px, ${canvasControls.panOffset.y}px) scale(${canvasControls.zoom})`
                            }}
                        >
                            <Canvas
                                ref={canvasComponentRef}
                                baseImage={imageGeneration.baseImage}
                                generatedImage={imageGeneration.generatedImage}
                                brushSize={editorState.brushSize}
                                brushMode={editorState.brushMode}
                                canvasRef={canvasRef}
                                maskCanvasRef={maskCanvasRef}
                                onDrawingStop={(event) => editorState.handleDrawingStop(event, maskCanvasRef)}
                                zoom={canvasControls.zoom}
                                activeTool={editorState.activeTool}
                            />
                        </div>

                        {/* Botão de reset zoom */}
                        {canvasControls.zoom !== 1 && (
                            <button
                                onClick={canvasControls.resetView}
                                className="absolute bottom-4 right-4 z-20 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors text-sm font-medium"
                            >
                                100%
                            </button>
                        )}

                        {/* Controles do brush */}
                        {editorState.isAnyToolActive && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
                                <div className="bg-white p-2 rounded-xl shadow-lg flex items-center gap-2 border border-gray-100">
                                    <span className="text-gray-600 text-xs px-2">Pequeno</span>
                                    <input
                                        type="range"
                                        min="5"
                                        max="100"
                                        value={editorState.brushSize}
                                        onChange={(e) => editorState.setBrushSize(parseInt(e.target.value, 10))}
                                        className="w-32"
                                    />
                                    <span className="text-gray-600 text-xs px-2">Grande</span>
                                    <span className="w-10 text-center text-sm font-medium text-gray-800 bg-gray-100 rounded-md py-1">
                                        {editorState.brushSize}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Seletor de ferramentas */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white backdrop-blur-sm p-2 rounded-full shadow-lg flex items-center gap-1 border border-gray-100 z-20">
                            <button
                                onClick={() => editorState.handleToolSelect('draw')}
                                className={`p-3 rounded-full ${editorState.isDrawToolActive ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <PaintBrushIcon className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => editorState.handleToolSelect('select')}
                                className={`p-3 rounded-full ${editorState.isSelectToolActive ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <SelectToolIcon className="w-5 h-5"/>
                            </button>
                            <div className="h-6 w-px bg-gray-200 mx-1"></div>
                            <button
                                onClick={editorState.toggleBrushMode}
                                className={`p-3 rounded-full ${editorState.isEraseMode ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <EraserIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </>
                ) : (
                    <WelcomeView onImageUpload={handleSetBaseImage} />
                )}

                {/* Estados de loading e error */}
                {imageGeneration.isLoading && <LoadingModal />}
                {imageGeneration.error && (
                    <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 p-3 rounded-lg z-30 shadow-lg border border-red-200">
                        {imageGeneration.error}
                    </div>
                )}
            </main>

            {/* Sidebar direita */}
            <RightSidebar
                history={imageGeneration.history}
                isCollapsed={!editorState.isRightSidebarVisible}
                onToggleCollapse={editorState.toggleRightSidebar}
                onSelect={imageGeneration.handleSelectHistory}
                currentImage={imageGeneration.currentImage}
                onNewProjectFromVersion={onNewProjectFromVersion}
            />

            {/* Modal de edição */}
            {editorState.isEditModalOpen && editorState.editModalPosition && (
                <EditPromptModal
                    isOpen={editorState.isEditModalOpen}
                    position={editorState.editModalPosition}
                    onApply={(modalPrompt, modalObjectImages) =>
                        editorState.handleApplyEdit(
                            modalPrompt,
                            modalObjectImages,
                            (prompt, objects) => imageGeneration.handleGenerate(getMaskData, prompt, objects)
                        )
                    }
                    onCancel={() => editorState.handleCancelEdit(canvasComponentRef)}
                />
            )}
        </div>
    );
};

export default Editor;