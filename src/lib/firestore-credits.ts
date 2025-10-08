import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore'
import { db } from './firebase'

// ====================================
// TYPES - ETAPA 1: ESTRUTURA FIRESTORE
// ====================================

/**
 * 1.2 Collection: subscriptions
 * Armazena assinaturas recorrentes (Trial, Básico, Pro)
 */
export interface Subscription {
  id: string
  userId: string
  planType: 'trial' | 'basic' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'expired'

  // Créditos (núcleo do sistema)
  monthlyCredits: number
  creditsUsedCurrentPeriod: number
  creditsRemainingCurrentPeriod: number // Calculado: monthlyCredits - creditsUsed

  // Ciclo de faturamento
  billingCycleStart: Date
  billingCycleEnd: Date
  nextResetDate: Date
  nextBillingDate: Date | null

  // Stripe
  stripeSubscriptionId: string | null
  stripePriceId: string
  pricePaid: number // Em centavos (ex: 4990 = R$ 49,90)

  // Timestamps
  createdAt: Date
  updatedAt: Date
  canceledAt: Date | null
}

/**
 * 1.3 Collection: creditPacks
 * Pacotes de créditos avulsos (compras one-time)
 */
export interface CreditPack {
  id: string
  userId: string
  packType: 'initial' | 'standard' | 'large'

  // Créditos
  creditsPurchased: number
  creditsUsed: number
  creditsRemaining: number // Calculado: purchased - used

  // Pagamento
  pricePaid: number // Em centavos
  stripePaymentIntentId: string | null

  // Validade
  purchasedAt: Date
  expiresAt: Date | null // null = sem expiração
  isActive: boolean // False se expirou ou zerou créditos

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * 1.4 Collection: creditTransactions (AJUSTADO)
 * Log de TODAS as movimentações de créditos
 */
export interface CreditTransaction {
  id: string
  userId: string
  transactionType: 'generation' | 'subscription_reset' | 'pack_purchase' | 'subscription_created' | 'refund'

  // Créditos
  creditsChange: number // Positivo = ganhou, Negativo = consumiu
  balanceAfterTransaction: number // Saldo total após esta transação

  // Origem
  sourceType: 'subscription' | 'credit_pack'
  sourceId: string // Document ID da subscription ou creditPack

  // Relacionamentos
  imageGenerationId: string | null // Se for consumo, ID da geração relacionada

  // Metadados
  description: string
  metadata: Record<string, any> | null
  createdAt: Date
}

/**
 * 1.5 Collection: generations
 * Todas as gerações de imagem do usuário
 */
export interface Generation {
  id: string
  userId: string

  // Input
  prompt: string
  style: string

  // Output
  imageUrl: string | null // null enquanto processa
  status: 'pending' | 'processing' | 'completed' | 'failed'

  // Créditos
  creditsConsumed: number // Geralmente 1
  sourceType: 'subscription' | 'credit_pack'
  sourceId: string // ID da fonte que forneceu o crédito

  // Timestamps
  createdAt: Date
  completedAt: Date | null
  failedAt: Date | null

  // Error handling
  errorMessage: string | null
}

/**
 * 1.6 Collection: checkoutSessions
 * Rastrear sessões de checkout do Stripe
 */
export interface CheckoutSession {
  id: string
  stripeSessionId: string // Session ID do Stripe (único)
  userId: string
  type: 'subscription' | 'credit_pack'

  // Dados do checkout
  planType?: 'trial' | 'basic' | 'pro' // Se for subscription
  packType?: 'initial' | 'standard' | 'large' // Se for credit_pack
  amount: number // Valor em centavos

  // Status
  status: 'pending' | 'completed' | 'expired' | 'canceled'

  // Timestamps
  createdAt: Date
  completedAt: Date | null
  expiresAt: Date // Sessão Stripe expira após 24h
}

// ====================================
// SUBSCRIPTION OPERATIONS
// ====================================

/**
 * Buscar assinatura ativa do usuário
 * Regra: Um usuário pode ter APENAS 1 assinatura com status='active'
 */
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const q = query(
    collection(db, 'subscriptions'),
    where('userId', '==', userId),
    where('status', '==', 'active'),
    limit(1)
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const docData = snapshot.docs[0]
  return {
    id: docData.id,
    ...docData.data(),
    billingCycleStart: docData.data().billingCycleStart?.toDate(),
    billingCycleEnd: docData.data().billingCycleEnd?.toDate(),
    nextResetDate: docData.data().nextResetDate?.toDate(),
    nextBillingDate: docData.data().nextBillingDate?.toDate(),
    createdAt: docData.data().createdAt?.toDate(),
    updatedAt: docData.data().updatedAt?.toDate(),
    canceledAt: docData.data().canceledAt?.toDate(),
  } as Subscription
}

/**
 * Criar nova assinatura
 * Regra: Ao criar nova, cancelar automaticamente a anterior
 */
export async function createSubscription(
  data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'canceledAt' | 'creditsRemainingCurrentPeriod'>
): Promise<string> {
  return await runTransaction(db, async (transaction) => {
    // 1. Buscar assinatura ativa anterior
    const activeSubQuery = query(
      collection(db, 'subscriptions'),
      where('userId', '==', data.userId),
      where('status', '==', 'active')
    )
    const activeSubSnapshot = await getDocs(activeSubQuery)

    // 2. Cancelar assinatura anterior se existir
    if (!activeSubSnapshot.empty) {
      const oldSubRef = doc(db, 'subscriptions', activeSubSnapshot.docs[0].id)
      transaction.update(oldSubRef, {
        status: 'canceled',
        canceledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    // 3. Criar nova assinatura
    const newSubRef = doc(collection(db, 'subscriptions'))
    transaction.set(newSubRef, {
      ...data,
      creditsRemainingCurrentPeriod: data.monthlyCredits - data.creditsUsedCurrentPeriod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      canceledAt: null,
    })

    return newSubRef.id
  })
}

/**
 * Atualizar assinatura
 */
export async function updateSubscription(subscriptionId: string, data: Partial<Subscription>): Promise<void> {
  const docRef = doc(db, 'subscriptions', subscriptionId)

  // Recalcular creditsRemaining se necessário
  const updates: any = { ...data, updatedAt: serverTimestamp() }
  if (data.monthlyCredits !== undefined || data.creditsUsedCurrentPeriod !== undefined) {
    const currentDoc = await getDoc(docRef)
    if (currentDoc.exists()) {
      const current = currentDoc.data() as Subscription
      const monthlyCredits = data.monthlyCredits ?? current.monthlyCredits
      const creditsUsed = data.creditsUsedCurrentPeriod ?? current.creditsUsedCurrentPeriod
      updates.creditsRemainingCurrentPeriod = monthlyCredits - creditsUsed
    }
  }

  await updateDoc(docRef, updates)
}

// ====================================
// CREDIT PACK OPERATIONS
// ====================================

/**
 * Buscar pacotes ativos do usuário
 * Regra: Retorna em ordem FIFO (mais antigo primeiro)
 */
export async function getActiveCreditPacks(userId: string): Promise<CreditPack[]> {
  const q = query(
    collection(db, 'creditPacks'),
    where('userId', '==', userId),
    where('isActive', '==', true),
    orderBy('purchasedAt', 'asc') // FIFO - First In First Out
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(docData => ({
    id: docData.id,
    ...docData.data(),
    purchasedAt: docData.data().purchasedAt?.toDate(),
    expiresAt: docData.data().expiresAt?.toDate(),
    createdAt: docData.data().createdAt?.toDate(),
    updatedAt: docData.data().updatedAt?.toDate(),
  })) as CreditPack[]
}

/**
 * Criar novo pacote de créditos
 */
export async function createCreditPack(
  data: Omit<CreditPack, 'id' | 'createdAt' | 'updatedAt' | 'creditsUsed' | 'creditsRemaining'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'creditPacks'), {
    ...data,
    creditsUsed: 0,
    creditsRemaining: data.creditsPurchased,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

/**
 * Atualizar pacote de créditos
 * Regra: Quando creditsRemaining chega a 0, marcar isActive = false
 */
export async function updateCreditPack(packId: string, data: Partial<CreditPack>): Promise<void> {
  const docRef = doc(db, 'creditPacks', packId)

  const updates: any = { ...data, updatedAt: serverTimestamp() }

  // Recalcular creditsRemaining se necessário
  if (data.creditsPurchased !== undefined || data.creditsUsed !== undefined) {
    const currentDoc = await getDoc(docRef)
    if (currentDoc.exists()) {
      const current = currentDoc.data() as CreditPack
      const purchased = data.creditsPurchased ?? current.creditsPurchased
      const used = data.creditsUsed ?? current.creditsUsed
      updates.creditsRemaining = purchased - used

      // Marcar como inativo se zerou créditos
      if (updates.creditsRemaining <= 0) {
        updates.isActive = false
      }
    }
  }

  await updateDoc(docRef, updates)
}

// ====================================
// CREDIT TRANSACTION OPERATIONS
// ====================================

/**
 * Criar transação de crédito
 * Regra: Criar transação para CADA movimentação de créditos (sem exceção)
 */
export async function createCreditTransaction(
  data: Omit<CreditTransaction, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'creditTransactions'), {
    ...data,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

/**
 * Buscar histórico de transações do usuário
 */
export async function getCreditTransactionHistory(
  userId: string,
  limitCount: number = 50
): Promise<CreditTransaction[]> {
  const q = query(
    collection(db, 'creditTransactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(docData => ({
    id: docData.id,
    ...docData.data(),
    createdAt: docData.data().createdAt?.toDate(),
  })) as CreditTransaction[]
}

// ====================================
// GENERATION OPERATIONS
// ====================================

/**
 * Criar nova geração
 * Regra: Status inicial = 'pending'
 */
export async function createGeneration(
  data: Omit<Generation, 'id' | 'createdAt' | 'completedAt' | 'failedAt' | 'imageUrl' | 'errorMessage'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'generations'), {
    ...data,
    imageUrl: null,
    status: 'pending',
    createdAt: serverTimestamp(),
    completedAt: null,
    failedAt: null,
    errorMessage: null,
  })

  return docRef.id
}

/**
 * Atualizar geração
 */
export async function updateGeneration(generationId: string, data: Partial<Generation>): Promise<void> {
  const docRef = doc(db, 'generations', generationId)
  await updateDoc(docRef, data)
}

/**
 * Buscar gerações do usuário
 */
export async function getUserGenerations(userId: string, limitCount: number = 50): Promise<Generation[]> {
  const q = query(
    collection(db, 'generations'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(docData => ({
    id: docData.id,
    ...docData.data(),
    createdAt: docData.data().createdAt?.toDate(),
    completedAt: docData.data().completedAt?.toDate(),
    failedAt: docData.data().failedAt?.toDate(),
  })) as Generation[]
}

// ====================================
// CHECKOUT SESSION OPERATIONS
// ====================================

/**
 * Criar sessão de checkout
 */
export async function createCheckoutSession(
  data: Omit<CheckoutSession, 'id' | 'createdAt' | 'completedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'checkoutSessions'), {
    ...data,
    createdAt: serverTimestamp(),
    completedAt: null,
  })

  return docRef.id
}

/**
 * Buscar sessão de checkout pelo Stripe Session ID
 */
export async function getCheckoutSessionByStripeId(stripeSessionId: string): Promise<CheckoutSession | null> {
  const q = query(
    collection(db, 'checkoutSessions'),
    where('stripeSessionId', '==', stripeSessionId),
    limit(1)
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const docData = snapshot.docs[0]
  return {
    id: docData.id,
    ...docData.data(),
    createdAt: docData.data().createdAt?.toDate(),
    completedAt: docData.data().completedAt?.toDate(),
    expiresAt: docData.data().expiresAt?.toDate(),
  } as CheckoutSession
}

/**
 * Atualizar sessão de checkout
 */
export async function updateCheckoutSession(sessionId: string, data: Partial<CheckoutSession>): Promise<void> {
  const docRef = doc(db, 'checkoutSessions', sessionId)
  await updateDoc(docRef, data)
}

// ====================================
// HELPER: UPDATE USER WITH STRIPE CUSTOMER ID
// ====================================

/**
 * 1.1 - Adicionar stripeCustomerId ao usuário
 * O campo será preenchido na primeira compra/assinatura
 */
export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    stripeCustomerId,
    updatedAt: serverTimestamp(),
  })
}
