import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Trigger automático quando um novo usuário é criado
 * Cria trial de 7 dias com 10 créditos
 */
export const onUserCreated = functions
  .region('southamerica-east1')
  .auth.user()
  .onCreate(async (user) => {
    const db = admin.firestore();
    const now = Timestamp.now();

    console.log('New user created', {
      uid: user.uid,
      email: user.email,
      timestamp: now.toDate().toISOString()
    });

    try {
      // Usar transaction para garantir atomicidade
      await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(user.uid);
        const subscriptionRef = db.collection('subscriptions').doc(`${user.uid}_trial`);
        const transactionRef = db.collection('creditTransactions').doc();

        // Verificar se usuário já existe (pode acontecer em edge cases)
        const userDoc = await transaction.get(userRef);
        if (userDoc.exists) {
          console.log('User document already exists, skipping trial creation');
          return;
        }

        const trialCredits = 10;
        const trialDays = 7;
        const trialEndDate = new Date(now.toMillis() + trialDays * 24 * 60 * 60 * 1000);

        // 1. Criar documento do usuário
        transaction.set(userRef, {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          totalCredits: trialCredits,
          stripeCustomerId: null,
          createdAt: now,
          lastUpdated: now
        });

        // 2. Criar trial subscription
        transaction.set(subscriptionRef, {
          userId: user.uid,
          stripeSubscriptionId: null, // Trial não tem subscription do Stripe
          status: 'trialing',
          planType: 'trial',
          planName: 'Trial Gratuito',
          monthlyCredits: trialCredits,
          creditsUsedCurrentPeriod: 0,
          creditsRemainingCurrentPeriod: trialCredits,
          billingCycleStart: now,
          billingCycleEnd: Timestamp.fromDate(trialEndDate),
          nextResetDate: Timestamp.fromDate(trialEndDate), // Trial não renova, apenas expira
          isTrial: true,
          createdAt: now,
          lastUpdated: now
        });

        // 3. Criar credit transaction
        transaction.set(transactionRef, {
          userId: user.uid,
          type: 'trial_created',
          amount: trialCredits,
          description: `Trial gratuito de ${trialDays} dias - ${trialCredits} créditos`,
          subscriptionId: subscriptionRef.id,
          metadata: {
            trialDays,
            expiresAt: Timestamp.fromDate(trialEndDate)
          },
          createdAt: now
        });

        console.log('Trial subscription created successfully', {
          userId: user.uid,
          credits: trialCredits,
          expiresAt: trialEndDate.toISOString()
        });
      });

      return {
        success: true,
        message: 'Trial subscription created'
      };

    } catch (error) {
      console.error('Error creating trial subscription', {
        userId: user.uid,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Re-throw para que o Firebase registre o erro
      throw error;
    }
  });

/**
 * Função auxiliar para expirar trials automaticamente
 * Será chamada pelo cron job resetSubscriptionCredits
 */
export async function expireTrial(
  db: admin.firestore.Firestore,
  subscriptionId: string,
  userId: string
): Promise<void> {
  const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);

  await db.runTransaction(async (transaction) => {
    const subscriptionDoc = await transaction.get(subscriptionRef);

    if (!subscriptionDoc.exists) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    const subscription = subscriptionDoc.data();

    // Verificar se é trial
    if (!subscription?.isTrial) {
      throw new Error('Not a trial subscription');
    }

    // Atualizar status para expired
    transaction.update(subscriptionRef, {
      status: 'expired',
      creditsRemainingCurrentPeriod: 0,
      lastUpdated: Timestamp.now()
    });

    // Zerar créditos do usuário (apenas os do trial)
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);

    if (userDoc.exists) {
      const userData = userDoc.data();
      const currentCredits = userData?.totalCredits || 0;
      const trialCreditsRemaining = subscription.creditsRemainingCurrentPeriod || 0;

      transaction.update(userRef, {
        totalCredits: Math.max(0, currentCredits - trialCreditsRemaining),
        lastUpdated: Timestamp.now()
      });
    }

    // Criar transaction de expiração
    const transactionRef = db.collection('creditTransactions').doc();
    transaction.set(transactionRef, {
      userId,
      type: 'trial_expired',
      amount: -(subscription.creditsRemainingCurrentPeriod || 0),
      description: 'Trial expirado - créditos removidos',
      subscriptionId,
      createdAt: Timestamp.now()
    });

    console.log('Trial subscription expired', {
      subscriptionId,
      userId,
      creditsRemoved: subscription.creditsRemainingCurrentPeriod
    });
  });
}
