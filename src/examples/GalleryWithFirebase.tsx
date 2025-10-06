/**
 * EXEMPLO: Gallery integrado com Firebase
 *
 * Este é um exemplo de como usar o Gallery.tsx com Firebase.
 * Copie este código para o seu componente principal.
 */

import { useState } from 'react'
import Gallery from '@/components/Gallery'
import { useFirebaseUser } from '@/hooks/useFirebaseUser'
import { useProjects } from '@/hooks/useProjects'

export default function GalleryWithFirebase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'archived'>('all')

  // Hook de sincronização com Clerk + Firebase
  const { user, loading: userLoading } = useFirebaseUser()

  // Hook de projetos com filtros
  const {
    projects,
    loading: projectsLoading,
    createProject,
    deleteProject,
    toggleFavorite,
  } = useProjects({
    userId: user?.id || null,
    search: searchQuery,
    isFavorite: activeTab === 'favorites' ? true : undefined,
    isArchived: activeTab === 'archived' ? true : undefined,
  })

  // Handlers
  const handleCreateProject = async () => {
    const projectId = await createProject('Novo Projeto')
    if (projectId) {
      // Navegar para o editor
      console.log('Abrir editor:', projectId)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      await deleteProject(projectId)
    }
  }

  const handleToggleFavorite = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      await toggleFavorite(projectId, project.isFavorite)
    }
  }

  // Loading state
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Você precisa estar logado</p>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <Gallery
      // Props de navegação
      onOpenProject={(projectId) => console.log('Abrir projeto:', projectId)}
      onCreateNewProject={handleCreateProject}
      onOpenSettings={() => console.log('Abrir settings')}
      onOpenPricing={() => console.log('Abrir pricing')}

      // Props de dados (substituir mock)
      mockProjects={projects.map(p => ({
        id: p.id,
        name: p.name,
        date: p.updatedAt.toLocaleDateString('pt-BR'),
        thumbnail: p.thumbnail,
      }))}

      // Props de busca
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}

      // Props de ações
      onDeleteProject={handleDeleteProject}
      onToggleFavorite={handleToggleFavorite}

      // Loading state
      isLoading={projectsLoading}

      // Dados do usuário
      userEmail={user.email}
      userCredits={{
        current: user.credits,
        max: user.plan === 'free' ? 5 : user.plan === 'starter' ? 100 : 300,
      }}
      userPlan={user.plan}
    />
  )
}
