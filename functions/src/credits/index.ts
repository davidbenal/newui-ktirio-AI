/**
 * ETAPA 3: CLOUD FUNCTIONS - SISTEMA DE CRÉDITOS
 *
 * Funções para gerenciamento de créditos, assinaturas e pagamentos
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import {
  
  
  CHECKOUT_URLS,
  getPlanById,
  getCreditPackById,
  
} from '../config/plans'

// Inicializar Stripe com secret key do Firebase Config
const getStripe = () => {
  const secretKey = functions.config().stripe?.secret_key
  if (!secretKey) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  })
}

const db = admin.firestore()

// ====================================
// 3.2: CREATE SUBSCRIPTION CHECKOUT
// ====================================

/**
 * Cria sessão de checkout para assinatura
 */
export const createSubscriptionCheckout = functions.https.onCall(async (data, context) => {
  console.log('🛒 createSubscriptionCheckout called', { userId: context.auth?.uid, data })

  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = context.auth.uid
  const { planType } = data as { planType: 'basic' | 'pro' }

  // Validar tipo de plano
  if (!planType || !['basic', 'pro'].includes(planType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid plan type')
  }

  try {
    const stripe = getStripe()
    const plan = getPlanById(planType)

    if (!plan.stripePriceId) {
      throw new functions.https.HttpsError('failed-precondition', 'Plan price ID not configured')
    }

    // Verificar se já tem assinatura ativa do mesmo tipo
    const existingSubSnapshot = await db
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .where('planType', '==', planType)
      .limit(1)
      .get()

    if (!existingSubSnapshot.empty) {
      throw new functions.https.HttpsError('already-exists', 'You already have an active subscription of this type')
    }

    // Buscar ou criar Stripe Customer
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    let stripeCustomerId = userData?.stripeCustomerId

    if (!stripeCustomerId) {
      // Criar novo customer no Stripe
      const customer = await stripe.customers.create({
        email: userData?.email,
        name: userData?.displayName || userData?.name,
        metadata: {
          firebaseUserId: userId,
        },
      })

      stripeCustomerId = customer.id

      // Salvar no Firestore
      await db.collection('users').doc(userId).update({
        stripeCustomerId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log('✅ Created Stripe customer:', stripeCustomerId)
    }

    // Obter URL base da aplicação
    const appUrl = functions.config().app?.url || 'http://localhost:5173'

    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}${CHECKOUT_URLS.successUrl}`,
      cancel_url: `${appUrl}${CHECKOUT_URLS.cancelUrl}`,
      locale: 'pt-BR',
      metadata: {
        userId,
        planType,
        type: 'subscription',
      },
      subscription_data: {
        metadata: {
          userId,
          planType,
        },
      },
    })

    // Salvar registro em checkoutSessions
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Sessão expira em 24h

    await db.collection('checkoutSessions').add({
      stripeSessionId: session.id,
      userId,
      type: 'subscription',
      planType,
      amount: plan.price,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    })

    console.log('✅ Checkout session created:', session.id)

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    }
  } catch (error: any) {
    console.error('❌ Error creating subscription checkout:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', error.message || 'Failed to create checkout session')
  }
})

// ====================================
// 3.3: CREATE PACK CHECKOUT
// ====================================

/**
 * Cria sessão de checkout para pacote de créditos
 */
export const createPackCheckout = functions.https.onCall(async (data, context) => {
  console.log('🛒 createPackCheckout called', { userId: context.auth?.uid, data })

  // Verificar autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = context.auth.uid
  const { packType } = data as { packType: 'initial' | 'standard' | 'large' }

  // Validar tipo de pacote
  if (!packType || !['initial', 'standard', 'large'].includes(packType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid pack type')
  }

  try {
    const stripe = getStripe()
    const pack = getCreditPackById(packType)

    // Buscar ou criar Stripe Customer
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    let stripeCustomerId = userData?.stripeCustomerId

    if (!stripeCustomerId) {
      // Criar novo customer no Stripe
      const customer = await stripe.customers.create({
        email: userData?.email,
        name: userData?.displayName || userData?.name,
        metadata: {
          firebaseUserId: userId,
        },
      })

      stripeCustomerId = customer.id

      // Salvar no Firestore
      await db.collection('users').doc(userId).update({
        stripeCustomerId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log('✅ Created Stripe customer:', stripeCustomerId)
    }

    // Obter URL base da aplicação
    const appUrl = functions.config().app?.url || 'http://localhost:5173'

    // Criar Checkout Session (mode: payment para one-time)
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      line_items: [
        {
          price: pack.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}${CHECKOUT_URLS.successUrl}`,
      cancel_url: `${appUrl}${CHECKOUT_URLS.cancelUrl}`,
      locale: 'pt-BR',
      metadata: {
        userId,
        packType,
        type: 'credit_pack',
        credits: pack.credits.toString(),
        validityDays: pack.validityDays?.toString() || 'null',
      },
      payment_intent_data: {
        metadata: {
          userId,
          packType,
          credits: pack.credits.toString(),
          validityDays: pack.validityDays?.toString() || 'null',
        },
      },
    })

    // Salvar registro em checkoutSessions
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await db.collection('checkoutSessions').add({
      stripeSessionId: session.id,
      userId,
      type: 'credit_pack',
      packType,
      amount: pack.price,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    })

    console.log('✅ Pack checkout session created:', session.id)

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    }
  } catch (error: any) {
    console.error('❌ Error creating pack checkout:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', error.message || 'Failed to create checkout session')
  }
})

// Exportar functions
export { createSubscriptionCheckout as createSubscriptionCheckoutExport }
export { createPackCheckout as createPackCheckoutExport }
