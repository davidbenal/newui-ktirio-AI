import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

interface Subscription {
  userId: string;
  status: string;
  monthlyCredits: number;
  creditsUsedCurrentPeriod: number;
  creditsRemainingCurrentPeriod: number;
  billingCycleStart: Timestamp;
  billingCycleEnd: Timestamp;
  nextResetDate: Timestamp;
}

/**
 * Scheduled function que reseta créditos de subscriptions ativas
 * Roda a cada hora (0 * * * *)
 */
export const resetSubscriptionCredits = functions
  .region('southamerica-east1')
  .pubsub.schedule('0 * * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = Timestamp.now();

    console.log('Starting subscription credits reset job', {
      executionTime: now.toDate().toISOString()
    });

    try {
      // Buscar subscriptions que precisam de reset
      const subscriptionsSnapshot = await db
        .collection('subscriptions')
        .where('status', '==', 'active')
        .where('nextResetDate', '<=', now)
        .get();

      if (subscriptionsSnapshot.empty) {
        console.log('No subscriptions to reset');
        return {
          success: true,
          processed: 0,
          message: 'No subscriptions require reset at this time'
        };
      }

      const resetResults = {
        successful: 0,
        failed: 0,
        errors: [] as Array<{ userId: string; error: string }>
      };

      // Processar cada subscription
      for (const doc of subscriptionsSnapshot.docs) {
        const subscriptionId = doc.id;
        const subscription = doc.data() as Subscription;

        try {
          await resetSubscription(db, subscriptionId, subscription);
          resetResults.successful++;

          console.log('Successfully reset subscription', {
            subscriptionId,
            userId: subscription.userId,
            monthlyCredits: subscription.monthlyCredits
          });
        } catch (error) {
          resetResults.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          resetResults.errors.push({
            userId: subscription.userId,
            error: errorMessage
          });

          console.error('Failed to reset subscription', {
            subscriptionId,
            userId: subscription.userId,
            error: errorMessage
          });
        }
      }

      console.log('Subscription reset job completed', {
        total: subscriptionsSnapshot.size,
        successful: resetResults.successful,
        failed: resetResults.failed,
        executionTime: now.toDate().toISOString()
      });

      return {
        success: true,
        processed: subscriptionsSnapshot.size,
        results: resetResults
      };

    } catch (error) {
      console.error('Subscription reset job failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: now.toDate().toISOString()
      });

      throw error; // Re-throw para que o Cloud Scheduler registre a falha
    }
  });

/**
 * Reseta uma subscription individual usando Firestore Transaction
 */
async function resetSubscription(
  db: admin.firestore.Firestore,
  subscriptionId: string,
  subscription: Subscription
): Promise<void> {
  const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
  const userRef = db.collection('users').doc(subscription.userId);

  const now = Timestamp.now();
  const billingCycleEnd = new Date(now.toMillis() + 30 * 24 * 60 * 60 * 1000); // +30 dias
  const nextResetDate = new Date(now.toMillis() + 30 * 24 * 60 * 60 * 1000); // +30 dias

  await db.runTransaction(async (transaction) => {
    // 1. Ler o estado atual
    const subscriptionDoc = await transaction.get(subscriptionRef);
    const userDoc = await transaction.get(userRef);

    if (!subscriptionDoc.exists) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    if (!userDoc.exists) {
      throw new Error(`User ${subscription.userId} not found`);
    }

    const currentData = subscriptionDoc.data() as Subscription;
    const monthlyCredits = currentData.monthlyCredits;

    // 2. Atualizar subscription
    transaction.update(subscriptionRef, {
      creditsUsedCurrentPeriod: 0,
      creditsRemainingCurrentPeriod: monthlyCredits,
      billingCycleStart: now,
      billingCycleEnd: Timestamp.fromDate(billingCycleEnd),
      nextResetDate: Timestamp.fromDate(nextResetDate),
      lastResetAt: now
    });

    // 3. Atualizar total de créditos do usuário
    const userData = userDoc.data();
    const currentTotalCredits = userData?.totalCredits || 0;
    const newTotalCredits = currentTotalCredits + monthlyCredits;

    transaction.update(userRef, {
      totalCredits: newTotalCredits,
      lastUpdated: now
    });

    // 4. Criar registro na coleção creditTransactions
    const transactionRef = db.collection('creditTransactions').doc();
    transaction.set(transactionRef, {
      userId: subscription.userId,
      type: 'subscription_reset',
      amount: monthlyCredits,
      description: `Monthly credits reset for subscription ${subscriptionId}`,
      subscriptionId: subscriptionId,
      metadata: {
        billingCycleStart: now,
        billingCycleEnd: Timestamp.fromDate(billingCycleEnd),
        planMonthlyCredits: monthlyCredits
      },
      createdAt: now
    });
  });
}
