import { useState } from 'react'
import { uploadImage, validateImageFile } from '@/lib/storage'
import { useToast } from '@/components/ToastProvider'

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { showError, showSuccess } = useToast()

  const upload = async (
    file: File,
    userId: string,
    folder: 'projects' | 'versions' = 'projects'
  ): Promise<string | null> => {
    // Validar arquivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      showError('Arquivo inválido', validation.error || 'Erro desconhecido')
      return null
    }

    try {
      setUploading(true)
      setProgress(30)

      const imageUrl = await uploadImage(file, userId, folder)

      setProgress(100)
      showSuccess('Upload concluído!', 'Imagem enviada com sucesso')

      return imageUrl
    } catch (error) {
      console.error('Upload error:', error)
      showError('Erro no upload', 'Não foi possível enviar a imagem')
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  return {
    upload,
    uploading,
    progress,
  }
}
