import { useState, useEffect } from 'react'
import { getUserProjects, createProject, updateProject, deleteProject } from '@/lib/firestore'
import type { Project } from '@/lib/firestore'
import { useToast } from '@/components/ToastProvider'

interface UseProjectsOptions {
  userId: string | null
  search?: string
  isFavorite?: boolean
  isArchived?: boolean
}

export function useProjects({ userId, search, isFavorite, isArchived }: UseProjectsOptions) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { showError, showSuccess } = useToast()

  // Buscar projetos
  useEffect(() => {
    async function fetchProjects() {
      if (!userId) {
        setProjects([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getUserProjects(userId, {
          search,
          isFavorite,
          isArchived,
        })
        setProjects(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(err as Error)
        showError('Erro ao carregar projetos', 'Tente novamente mais tarde')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [userId, search, isFavorite, isArchived, showError])

  // Criar projeto
  const handleCreateProject = async (name: string = 'Novo Projeto') => {
    if (!userId) {
      showError('Erro', 'Usuário não autenticado')
      return null
    }

    try {
      const projectId = await createProject({
        userId,
        name,
        isFavorite: false,
        isArchived: false,
      })

      // Atualizar lista local
      const newProject: Project = {
        id: projectId,
        userId,
        name,
        isFavorite: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setProjects([newProject, ...projects])

      showSuccess('Projeto criado!', `"${name}" foi criado com sucesso`)
      return projectId
    } catch (err) {
      console.error('Error creating project:', err)
      showError('Erro ao criar projeto', (err as Error).message)
      return null
    }
  }

  // Atualizar projeto
  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      await updateProject(projectId, updates)

      // Atualizar lista local
      setProjects(projects.map(p =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
      ))

      showSuccess('Projeto atualizado!', 'As alterações foram salvas')
    } catch (err) {
      console.error('Error updating project:', err)
      showError('Erro ao atualizar projeto', (err as Error).message)
    }
  }

  // Deletar projeto
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)

      // Remover da lista local
      setProjects(projects.filter(p => p.id !== projectId))

      showSuccess('Projeto excluído!', 'O projeto foi removido permanentemente')
    } catch (err) {
      console.error('Error deleting project:', err)
      showError('Erro ao excluir projeto', (err as Error).message)
    }
  }

  // Toggle favorito
  const handleToggleFavorite = async (projectId: string, currentState: boolean) => {
    await handleUpdateProject(projectId, { isFavorite: !currentState })
  }

  // Toggle arquivado
  const handleToggleArchived = async (projectId: string, currentState: boolean) => {
    await handleUpdateProject(projectId, { isArchived: !currentState })
  }

  return {
    projects,
    loading,
    error,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    toggleFavorite: handleToggleFavorite,
    toggleArchived: handleToggleArchived,
  }
}
