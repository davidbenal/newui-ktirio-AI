import { useEffect, useState } from 'react'
import { doc, setDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import type { User } from '@/lib/firestore'

/**
 * Hook que sincroniza usuário do Firebase Auth com Firestore
 *
 * Fluxo:
 * 1. Firebase Auth autentica o usuário (Google, Email/Password, etc)
 * 2. Sincroniza dados do usuário com Firestore
 * 3. Retorna dados do usuário para uso na aplicação
 */
export function useFirebaseUser() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let firestoreUnsubscribe: (() => void) | null = null

    const unsubscribe = onAuthStateChanged(auth, async (firebaseAuthUser) => {
      console.log('🔐 Firebase Auth State Changed:', firebaseAuthUser?.uid)

      // Cleanup previous Firestore listener
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe()
      }

      if (!firebaseAuthUser) {
        setFirebaseUser(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Sync user data with Firestore
        const userRef = doc(db, 'users', firebaseAuthUser.uid)

        // Listen to realtime updates
        firestoreUnsubscribe = onSnapshot(userRef, async (userSnap) => {
          if (!userSnap.exists()) {
            // Create new user in Firestore
            const newUser = {
              email: firebaseAuthUser.email || '',
              name: firebaseAuthUser.displayName || '',
              displayName: firebaseAuthUser.displayName || '',
              avatar: firebaseAuthUser.photoURL,
              photoURL: firebaseAuthUser.photoURL,
              plan: 'free',
              credits: 5, // Initial free credits
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }

            await setDoc(userRef, newUser)

            setFirebaseUser({
              id: firebaseAuthUser.uid,
              ...newUser,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as User)
          } else {
            // User exists, return data
            const userData = userSnap.data()
            console.log('🔄 Firestore data updated:', userData)
            console.log('🔄 name:', userData.name)
            console.log('🔄 displayName:', userData.displayName)
            console.log('🔄 avatar:', userData.avatar)
            console.log('🔄 photoURL:', userData.photoURL)
            console.log('🔄 role:', userData.role)

            // AUTO-SET OWNER ROLE - Set first user as owner if no role is defined
            if (!userData.role) {
              console.log('🔧 No role defined, setting as owner...')
              await updateDoc(userRef, { role: 'owner' })
              console.log('✅ Role set to owner!')
            }

            setFirebaseUser({
              id: userSnap.id,
              ...userData,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            } as User)
          }

          setError(null)
          setLoading(false)
        }, (err) => {
          console.error('Error listening to user changes:', err)
          setError(err as Error)
          setLoading(false)
        })

      } catch (err) {
        console.error('Error syncing user:', err)
        setError(err as Error)
        setLoading(false)
      }
    })

    return () => {
      unsubscribe()
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe()
      }
    }
  }, [])

  return {
    user: firebaseUser,
    loading,
    error,
    isSignedIn: !!firebaseUser,
  }
}
