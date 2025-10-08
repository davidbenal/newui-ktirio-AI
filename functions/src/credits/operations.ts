/**
 * ETAPA 3.5-3.8: OPERAÇÕES DE CRÉDITOS
 *
 * Funções para consulta, consumo e geração
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import { CHECKOUT_URLS, PLANS } from '../config/plans'

const db = admin.firestore()

const getStripe = () => {
  const secretKey = functions.config().stripe?.secret_key
  if (!secretKey) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  })
}

// ====================================
// 3.5: GET USER CREDITS
// ====================================

/**
 * Busca informações completas sobre créditos do usuário
 */
export const getUserCredits = functions.https.onCall(async (data, context) => {
  console.log('💰 getUserCredits called', { userId: context.auth?.uid })

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = context.auth.uid

  try {
    const now = admin.firestore.Timestamp.now()

    // 1. Buscar subscription ativa
    const subSnapshot = await db
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .where('nextResetDate', '>', now)
      .limit(1)
      .get()

    let subscriptionData: any = null
    let subscriptionCredits = 0

    if (!subSnapshot.empty) {
      const subDoc = subSnapshot.docs[0].data()
      subscriptionCredits = subDoc.creditsRemainingCurrentPeriod || 0

      const plan = PLANS[subDoc.planType as 'basic' | 'pro']
      const resetDate = subDoc.nextResetDate.toDate()
      const now = new Date()
      const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      subscriptionData = {
        credits: subscriptionCredits,
        planName: plan.name,
        displayName: plan.displayName,
        icon: plan.icon,
        resetsAt: resetDate,
        daysUntilReset,
        monthlyCredits: subDoc.monthlyCredits,
        used: subDoc.creditsUsedCurrentPeriod,
      }
    }

    // 2. Buscar creditPacks ativos
    const packsSnapshot = await db
      .collection('creditPacks')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .orderBy('purchasedAt', 'asc') // FIFO
      .get()

    let packCredits = 0
    const packItems: any[] = []

    for (const doc of packsSnapshot.docs) {
      const packData = doc.data()

      // Verificar se não expirou
      const expiresAt = packData.expiresAt?.toDate()
      if (expiresAt && expiresAt < new Date()) {
        // Marcar como inativo (expirado)
        await doc.ref.update({
          isActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        continue
      }

      packCredits += packData.creditsRemaining || 0
      packItems.push({
        id: doc.id,
        type: packData.packType,
        credits: packData.creditsRemaining,
        purchased: packData.creditsPurchased,
        used: packData.creditsUsed,
        expiresAt: expiresAt || null,
      })
    }

    // 3. Calcular totais
    const totalCredits = subscriptionCredits + packCredits
    const usedCredits = (subscriptionData?.used || 0) + packItems.reduce((sum, p) => sum + p.used, 0)
    const purchasedTotal = (subscriptionData?.monthlyCredits || 0) + packItems.reduce((sum, p) => sum + p.purchased, 0)
    const percentageUsed = purchasedTotal > 0 ? Math.round((usedCredits / purchasedTotal) * 100) : 0

    // 4. Montar resposta
    const response = {
      totalCredits,
      usedCredits,
      percentageUsed,
      currentPlan: subscriptionData,
      breakdown: {
        subscription: subscriptionData,
        packs: {
          totalCredits: packCredits,
          items: packItems,
        },
      },
      canUpgrade: !subscriptionData || subscriptionData.planName === 'basic',
      canBuyPacks: true,
    }

    console.log('✅ getUserCredits result:', { totalCredits, usedCredits })

    return response
  } catch (error: any) {
    console.error('❌ Error getting user credits:', error)
    throw new functions.https.HttpsError('internal', error.message || 'Failed to get user credits')
  }
})

// ====================================
// 3.6: CONSUME CREDITS
// ====================================

/**
 * Consome créditos do usuário (assinatura primeiro, depois pacotes FIFO)
 */
export const consumeCredits = functions.https.onCall(async (data, context) => {
  console.log('🔥 consumeCredits called', { userId: context.auth?.uid, data })

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = context.auth.uid
  const { creditsNeeded = 1 } = data as { creditsNeeded?: number }

  if (creditsNeeded < 1) {
    throw new functions.https.HttpsError('invalid-argument', 'Credits needed must be at least 1')
  }

  try {
    // Usar transação para atomicidade
    const result = await db.runTransaction(async (transaction) => {
      const now = admin.firestore.Timestamp.now()
      let creditsToConsume = creditsNeeded
      const sources: Array<{ source: string; sourceId: string; credits: number }> = []

      // PRIORIDADE 1: Tentar consumir da assinatura primeiro
      const subSnapshot = await transaction.get(
        db
          .collection('subscriptions')
          .where('userId', '==', userId)
          .where('status', '==', 'active')
          .where('nextResetDate', '>', now)
          .limit(1)
      )

      if (!subSnapshot.empty) {
        const subDoc = subSnapshot.docs[0]
        const subData = subDoc.data()
        const available = subData.creditsRemainingCurrentPeriod || 0

        if (available >= creditsToConsume) {
          // Consumir tudo da assinatura
          transaction.update(subDoc.ref, {
            creditsUsedCurrentPeriod: (subData.creditsUsedCurrentPeriod || 0) + creditsToConsume,
            creditsRemainingCurrentPeriod: available - creditsToConsume,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })

          sources.push({
            source: 'subscription',
            sourceId: subDoc.id,
            credits: creditsToConsume,
          })

          creditsToConsume = 0
        } else if (available > 0) {
          // Consumir parcialmente da assinatura
          transaction.update(subDoc.ref, {
            creditsUsedCurrentPeriod: subData.monthlyCredits,
            creditsRemainingCurrentPeriod: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })

          sources.push({
            source: 'subscription',
            sourceId: subDoc.id,
            credits: available,
          })

          creditsToConsume -= available
        }
      }

      // PRIORIDADE 2: Se ainda falta créditos, consumir dos pacotes (FIFO)
      if (creditsToConsume > 0) {
        const packsSnapshot = await transaction.get(
          db
            .collection('creditPacks')
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .orderBy('purchasedAt', 'asc')
        )

        for (const packDoc of packsSnapshot.docs) {
          if (creditsToConsume <= 0) break

          const packData = packDoc.data()
          const available = packData.creditsRemaining || 0

          if (available <= 0) continue

          // Verificar expiração
          if (packData.expiresAt && packData.expiresAt.toDate() < new Date()) {
            transaction.update(packDoc.ref, {
              isActive: false,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            continue
          }

          if (available >= creditsToConsume) {
            // Consumir tudo deste pacote
            const newRemaining = available - creditsToConsume
            transaction.update(packDoc.ref, {
              creditsUsed: (packData.creditsUsed || 0) + creditsToConsume,
              creditsRemaining: newRemaining,
              isActive: newRemaining > 0,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })

            sources.push({
              source: 'credit_pack',
              sourceId: packDoc.id,
              credits: creditsToConsume,
            })

            creditsToConsume = 0
            break
          } else {
            // Consumir tudo e continuar
            transaction.update(packDoc.ref, {
              creditsUsed: packData.creditsPurchased,
              creditsRemaining: 0,
              isActive: false,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })

            sources.push({
              source: 'credit_pack',
              sourceId: packDoc.id,
              credits: available,
            })

            creditsToConsume -= available
          }
        }
      }

      // Se ainda falta créditos, lançar erro
      if (creditsToConsume > 0) {
        throw new functions.https.HttpsError('resource-exhausted', 'Insufficient credits')
      }

      return {
        success: true,
        sources,
        creditsConsumed: creditsNeeded,
      }
    })

    console.log('✅ Credits consumed:', result)
    return result
  } catch (error: any) {
    console.error('❌ Error consuming credits:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', error.message || 'Failed to consume credits')
  }
})

// ====================================
// 3.7: CREATE GENERATION
// ====================================

/**
 * Cria uma nova geração de imagem (consome créditos)
 */
export const createGeneration = functions.https.onCall(async (data, context) => {
  console.log('🎨 createGeneration called', { userId: context.auth?.uid, data })

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = context.auth.uid
  const { prompt, style } = data as { prompt: string; style: string }

  if (!prompt || !style) {
    throw new functions.https.HttpsError('invalid-argument', 'Prompt and style are required')
  }

  try {
    // 1. Verificar saldo disponível
    const creditsInfo = await getUserCredits.run(data, context)
    if (creditsInfo.totalCredits < 1) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Insufficient credits. Please upgrade your plan or buy a credit pack.',
        {
          totalCredits: creditsInfo.totalCredits,
          canUpgrade: creditsInfo.canUpgrade,
          canBuyPacks: creditsInfo.canBuyPacks,
        }
      )
    }

    // 2. Criar documento em generations (status: pending)
    const generationRef = await db.collection('generations').add({
      userId,
      prompt,
      style,
      imageUrl: null,
      status: 'pending',
      creditsConsumed: 1,
      sourceType: 'subscription', // Será atualizado após consumir
      sourceId: '', // Será atualizado após consumir
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      failedAt: null,
      errorMessage: null,
    })

    let consumeResult

    try {
      // 3. Consumir créditos
      consumeResult = await consumeCredits.run({ creditsNeeded: 1 }, context)

      // 4. Atualizar generation com sourceType e sourceId
      const primarySource = consumeResult.sources[0]
      await generationRef.update({
        sourceType: primarySource.source,
        sourceId: primarySource.sourceId,
        status: 'processing',
      })

      // 5. Criar creditTransaction
      await db.collection('creditTransactions').add({
        userId,
        transactionType: 'generation',
        creditsChange: -1,
        balanceAfterTransaction: creditsInfo.totalCredits - 1, // Simplified
        sourceType: primarySource.source,
        sourceId: primarySource.sourceId,
        imageGenerationId: generationRef.id,
        description: 'Geração de imagem',
        metadata: {
          prompt,
          style,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    } catch (error: any) {
      // Se falhar ao consumir, deletar generation
      await generationRef.delete()
      throw error
    }

    // 6. Processar geração (async - não bloquear response)
    // NOTA: Em produção, usar uma Cloud Function separada ou background task
    processGeneration(generationRef.id, prompt, style).catch((error) => {
      console.error('❌ Error processing generation:', error)
    })

    // 7. Retornar resposta imediata
    return {
      generationId: generationRef.id,
      status: 'processing',
      creditsConsumed: 1,
      newBalance: creditsInfo.totalCredits - 1,
    }
  } catch (error: any) {
    console.error('❌ Error creating generation:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', error.message || 'Failed to create generation')
  }
})

/**
 * Processar geração de imagem (async)
 * Em produção, integrar com Google Vision API ou outro serviço
 */
async function processGeneration(generationId: string, prompt: string, style: string) {
  try {
    console.log('🎨 Processing generation:', generationId)

    // TODO: Integrar com Google Vision API ou serviço de geração
    // Por enquanto, simular sucesso
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const imageUrl = `https://placeholder.com/generated-image-${generationId}.png`

    await db.collection('generations').doc(generationId).update({
      imageUrl,
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log('✅ Generation completed:', generationId)
  } catch (error: any) {
    console.error('❌ Generation failed:', generationId, error)

    // Marcar como falha
    await db.collection('generations').doc(generationId).update({
      status: 'failed',
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      errorMessage: error.message || 'Unknown error',
    })

    // TODO: Fazer refund automático
    // await refundGeneration(generationId)
  }
}

// ====================================
// 3.8: CREATE CUSTOMER PORTAL SESSION
// ====================================

/**
 * Cria sessão do Stripe Customer Portal (gerenciar assinatura)
 */
export const createCustomerPortalSession = functions.https.onCall(async (data, context) => {
  console.log('🏛️ createCustomerPortalSession called', { userId: context.auth?.uid })

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = context.auth.uid

  try {
    // Buscar stripeCustomerId
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData?.stripeCustomerId) {
      throw new functions.https.HttpsError('failed-precondition', 'No Stripe customer found. Please make a purchase first.')
    }

    const stripe = getStripe()
    const appUrl = functions.config().app?.url || 'http://localhost:5173'

    // Criar Billing Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${appUrl}${CHECKOUT_URLS.portalReturnUrl}`,
    })

    console.log('✅ Portal session created:', session.id)

    return {
      portalUrl: session.url,
    }
  } catch (error: any) {
    console.error('❌ Error creating portal session:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', error.message || 'Failed to create portal session')
  }
})

export {
  getUserCredits as getUserCreditsExport,
  consumeCredits as consumeCreditsExport,
  createGeneration as createGenerationExport,
  createCustomerPortalSession as createCustomerPortalSessionExport,
}
