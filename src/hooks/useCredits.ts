import { useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface Subscription {
  planId: 'starter' | 'pro' | 'business'
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string
  stripeCustomerId: string
}

interface UserCreditsData {
  credits: number
  subscription?: Subscription
}

interface Transaction {
  id: string
  type: 'purchase' | 'subscription' | 'generation' | 'refund'
  amount: number
  description: string
  stripePaymentId?: string
  createdAt: Date
}

interface UseCreditsReturn {
  credits: number
  subscription?: Subscription
  loading: boolean
  error: string | null
  refreshCredits: () => Promise<void>
  createSubscriptionCheckout: (planId: string) => Promise<string>
  createPackCheckout: (packId: string) => Promise<string>
  consumeCredits: (amount: number, description: string) => Promise<void>
  createCustomerPortalSession: () => Promise<string>
}

export function useCredits(userId: string | null): UseCreditsReturn {
  const [credits, setCredits] = useState<number>(0)
  const [subscription, setSubscription] = useState<Subscription | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar créditos do usuário
  const refreshCredits = useCallback(async () => {
    if (!userId) {
      setCredits(0)
      setSubscription(undefined)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const getUserCredits = httpsCallable(functions, 'getUserCredits')
      const result = await getUserCredits()
      const data = result.data as UserCreditsData

      setCredits(data.credits)
      setSubscription(data.subscription)
    } catch (err: any) {
      console.error('Erro ao buscar créditos:', err)
      setError(err.message || 'Erro ao buscar créditos')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Listener em tempo real para o documento do usuário
  useEffect(() => {
    if (!userId) {
      setCredits(0)
      setSubscription(undefined)
      setLoading(false)
      return
    }

    const userDocRef = doc(db, 'users', userId)

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setCredits(data.credits || 0)
          setSubscription(data.subscription)
        }
        setLoading(false)
      },
      (err) => {
        console.error('Erro no listener de créditos:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Criar checkout de assinatura
  const createSubscriptionCheckout = useCallback(async (planId: string): Promise<string> => {
    if (!userId) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const createCheckout = httpsCallable(functions, 'createSubscriptionCheckout')
      const result = await createCheckout({ planId, userId })
      const data = result.data as { url: string }
      return data.url
    } catch (err: any) {
      console.error('Erro ao criar checkout de assinatura:', err)
      throw new Error(err.message || 'Erro ao criar checkout')
    }
  }, [userId])

  // Criar checkout de pacote
  const createPackCheckout = useCallback(async (packId: string): Promise<string> => {
    if (!userId) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const createCheckout = httpsCallable(functions, 'createPackCheckout')
      const result = await createCheckout({ packId, userId })
      const data = result.data as { url: string }
      return data.url
    } catch (err: any) {
      console.error('Erro ao criar checkout de pacote:', err)
      throw new Error(err.message || 'Erro ao criar checkout')
    }
  }, [userId])

  // Consumir créditos
  const consumeCredits = useCallback(async (amount: number, description: string): Promise<void> => {
    if (!userId) {
      throw new Error('Usuário não autenticado')
    }

    if (amount <= 0) {
      throw new Error('Quantidade inválida de créditos')
    }

    if (credits < amount) {
      throw new Error('Créditos insuficientes')
    }

    try {
      const consume = httpsCallable(functions, 'consumeCredits')
      await consume({ amount, description })

      // Atualizar localmente (o listener atualizará em tempo real também)
      setCredits(prev => prev - amount)
    } catch (err: any) {
      console.error('Erro ao consumir créditos:', err)
      throw new Error(err.message || 'Erro ao consumir créditos')
    }
  }, [userId, credits])

  // Criar sessão do portal do cliente
  const createCustomerPortalSession = useCallback(async (): Promise<string> => {
    if (!userId) {
      throw new Error('Usuário não autenticado')
    }

    if (!subscription) {
      throw new Error('Você não possui uma assinatura ativa')
    }

    try {
      const createPortal = httpsCallable(functions, 'createCustomerPortalSession')
      const result = await createPortal()
      const data = result.data as { url: string }
      return data.url
    } catch (err: any) {
      console.error('Erro ao criar portal do cliente:', err)
      throw new Error(err.message || 'Erro ao abrir portal do cliente')
    }
  }, [userId, subscription])

  return {
    credits,
    subscription,
    loading,
    error,
    refreshCredits,
    createSubscriptionCheckout,
    createPackCheckout,
    consumeCredits,
    createCustomerPortalSession,
  }
}
