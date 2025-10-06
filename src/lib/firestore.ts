import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ====================================
// TYPES
// ====================================

export interface User {
  id: string
  clerkId: string
  email: string
  name?: string
  avatar?: string
  plan: 'free' | 'starter' | 'professional'
  credits: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  stripeCurrentPeriodEnd?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  userId: string
  name: string
  thumbnail?: string
  isFavorite: boolean
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Version {
  id: string
  projectId: string
  name: string
  imageUrl: string
  prompt?: string
  style?: string
  createdAt: Date
}

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: 'purchase' | 'generation' | 'refund' | 'subscription'
  description?: string
  createdAt: Date
}

// ====================================
// USER OPERATIONS
// ====================================

export async function getUser(clerkId: string): Promise<User | null> {
  const q = query(collection(db, 'users'), where('clerkId', '==', clerkId), limit(1))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as User
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(collection(db, 'users'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updateUser(userId: string, data: Partial<User>) {
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// ====================================
// PROJECT OPERATIONS
// ====================================

export async function getUserProjects(userId: string, filters?: {
  search?: string
  isFavorite?: boolean
  isArchived?: boolean
}): Promise<Project[]> {
  let q = query(
    collection(db, 'projects'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )

  if (filters?.isFavorite !== undefined) {
    q = query(q, where('isFavorite', '==', filters.isFavorite))
  }

  if (filters?.isArchived !== undefined) {
    q = query(q, where('isArchived', '==', filters.isArchived))
  }

  const snapshot = await getDocs(q)
  let projects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[]

  // Client-side search (Firestore doesn't support text search)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    projects = projects.filter(p =>
      p.name.toLowerCase().includes(searchLower)
    )
  }

  return projects
}

export async function getProject(projectId: string): Promise<Project | null> {
  const docRef = doc(db, 'projects', projectId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) return null

  return { id: snapshot.id, ...snapshot.data() } as Project
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(collection(db, 'projects'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updateProject(projectId: string, data: Partial<Project>) {
  const docRef = doc(db, 'projects', projectId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProject(projectId: string) {
  const docRef = doc(db, 'projects', projectId)
  await deleteDoc(docRef)
}

// ====================================
// VERSION OPERATIONS
// ====================================

export async function getProjectVersions(projectId: string): Promise<Version[]> {
  const q = query(
    collection(db, 'versions'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Version[]
}

export async function createVersion(data: Omit<Version, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'versions'), {
    ...data,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

// ====================================
// CREDIT OPERATIONS
// ====================================

export async function deductCredits(userId: string, amount: number = 1, description?: string) {
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    throw new Error('User not found')
  }

  const userData = userDoc.data() as User
  if (userData.credits < amount) {
    throw new Error('Insufficient credits')
  }

  // Update user credits
  await updateDoc(userRef, {
    credits: userData.credits - amount,
    updatedAt: serverTimestamp(),
  })

  // Record transaction
  await addDoc(collection(db, 'creditTransactions'), {
    userId,
    amount: -amount,
    type: 'generation',
    description: description || 'Geração de imagem',
    createdAt: serverTimestamp(),
  })

  return userData.credits - amount
}

export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'subscription' | 'refund' = 'purchase',
  description?: string
) {
  const userRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    throw new Error('User not found')
  }

  const userData = userDoc.data() as User

  await updateDoc(userRef, {
    credits: userData.credits + amount,
    updatedAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'creditTransactions'), {
    userId,
    amount,
    type,
    description: description || `Adicionados ${amount} créditos`,
    createdAt: serverTimestamp(),
  })

  return userData.credits + amount
}

export async function getCreditHistory(userId: string, limitCount: number = 50): Promise<CreditTransaction[]> {
  const q = query(
    collection(db, 'creditTransactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as CreditTransaction[]
}
