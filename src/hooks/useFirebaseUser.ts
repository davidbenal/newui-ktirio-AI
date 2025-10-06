import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User } from '@/lib/firestore'

/**
 * Hook que sincroniza usuário do Clerk com Firestore
 * Cria automaticamente o documento do usuário no primeiro login
 */
export function useFirebaseUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded) return

      if (!isSignedIn || !clerkUser) {
        setFirebaseUser(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userRef = doc(db, 'users', clerkUser.id)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          // Criar novo usuário no Firestore
          const newUser = {
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            name: clerkUser.fullName || clerkUser.firstName || '',
            avatar: clerkUser.imageUrl,
            plan: 'free',
            credits: 5, // Créditos iniciais grátis
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          await setDoc(userRef, newUser)

          setFirebaseUser({
            id: clerkUser.id,
            ...newUser,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as User)
        } else {
          // Usuário já existe, apenas retornar dados
          const userData = userSnap.data()
          setFirebaseUser({
            id: userSnap.id,
            ...userData,
            createdAt: userData.createdAt?.toDate() || new Date(),
            updatedAt: userData.updatedAt?.toDate() || new Date(),
          } as User)
        }

        setError(null)
      } catch (err) {
        console.error('Error syncing user:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [clerkUser, isLoaded, isSignedIn])

  return {
    user: firebaseUser,
    loading,
    error,
    clerkUser,
    isSignedIn,
  }
}
