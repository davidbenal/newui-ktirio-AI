import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Upload de imagem para Firebase Storage
 */
export async function uploadImage(
  file: File,
  userId: string,
  folder: 'projects' | 'versions' = 'projects'
): Promise<string> {
  try {
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
    const storageRef = ref(storage, `${folder}/${userId}/${filename}`)

    // Upload
    const snapshot = await uploadBytes(storageRef, file)

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error('Failed to upload image')
  }
}

/**
 * Upload de base64 image
 */
export async function uploadBase64Image(
  base64Data: string,
  userId: string,
  folder: 'projects' | 'versions' = 'versions'
): Promise<string> {
  try {
    // Convert base64 to blob
    const response = await fetch(base64Data)
    const blob = await response.blob()

    const timestamp = Date.now()
    const filename = `generated-${timestamp}.jpg`
    const storageRef = ref(storage, `${folder}/${userId}/${filename}`)

    const snapshot = await uploadBytes(storageRef, blob)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error('Base64 upload error:', error)
    throw new Error('Failed to upload generated image')
  }
}

/**
 * Deletar imagem
 */
export async function deleteImage(imageUrl: string) {
  try {
    const storageRef = ref(storage, imageUrl)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Delete error:', error)
    throw new Error('Failed to delete image')
  }
}

/**
 * Validar arquivo de imagem
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.',
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 10MB.',
    }
  }

  return { valid: true }
}
