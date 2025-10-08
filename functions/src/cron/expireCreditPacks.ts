import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

interface CreditPack {
  userId: string;
  credits: number;
  creditsRemaining: number;
  isActive: boolean;
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
}

/**
 * Scheduled function que expira pacotes de créditos
 * Roda diariamente às 00:00 (0 0 * * *)
 */
export const expireCreditPacks = functions
  .region('southamerica-east1')
  .pubsub.schedule('0 0 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = Timestamp.now();

    console.log('Starting credit packs expiration job', {
      executionTime: now.toDate().toISOString()
    });

    try {
      // Buscar pacotes que precisam expirar
      const packsSnapshot = await db
        .collection('creditPacks')
        .where('isActive', '==', true)
        .where('expiresAt', '<=', now)
        .get();

      if (packsSnapshot.empty) {
        console.log('No credit packs to expire');
        return {
          success: true,
          expired: 0,
          message: 'No credit packs require expiration at this time'
        };
      }

      const expirationResults = {
        successful: 0,
        failed: 0,
        totalCreditsExpired: 0,
        errors: [] as Array<{ packId: string; error: string }>
      };

      // Usar batch para eficiência (até 500 operações por batch)
      const batchSize = 500;
      const batches: admin.firestore.WriteBatch[] = [db.batch()];
      let currentBatchIndex = 0;
      let operationCount = 0;

      // Processar cada pacote
      for (const doc of packsSnapshot.docs) {
        const packId = doc.id;
        const pack = doc.data() as CreditPack;

        try {
          // Criar novo batch se o atual estiver cheio
          if (operationCount >= batchSize) {
            batches.push(db.batch());
            currentBatchIndex++;
            operationCount = 0;
          }

          const currentBatch = batches[currentBatchIndex];

          // Atualizar o pack
          currentBatch.update(doc.ref, {
            isActive: false,
            expiredAt: now,
            lastUpdated: now
          });

          operationCount++;

          // Atualizar créditos do usuário (subtrair créditos restantes)
          const userRef = db.collection('users').doc(pack.userId);
          const creditsToRemove = pack.creditsRemaining || 0;

          currentBatch.update(userRef, {
            totalCredits: admin.firestore.FieldValue.increment(-creditsToRemove),
            lastUpdated: now
          });

          operationCount++;

          // Criar registro de transação
          const transactionRef = db.collection('creditTransactions').doc();
          currentBatch.set(transactionRef, {
            userId: pack.userId,
            type: 'pack_expired',
            amount: -creditsToRemove,
            description: `Credit pack expired - ${creditsToRemove} credits removed`,
            packId: packId,
            metadata: {
              originalCredits: pack.credits,
              creditsRemaining: creditsToRemove,
              expiresAt: pack.expiresAt
            },
            createdAt: now
          });

          operationCount++;

          expirationResults.totalCreditsExpired += creditsToRemove;

          console.log('Prepared expiration for credit pack', {
            packId,
            userId: pack.userId,
            creditsRemaining: creditsToRemove
          });

        } catch (error) {
          expirationResults.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          expirationResults.errors.push({
            packId,
            error: errorMessage
          });

          console.error('Failed to prepare expiration for pack', {
            packId,
            userId: pack.userId,
            error: errorMessage
          });
        }
      }

      // Commit todos os batches
      console.log(`Committing ${batches.length} batch(es)`);

      for (let i = 0; i < batches.length; i++) {
        try {
          await batches[i].commit();
          console.log(`Batch ${i + 1}/${batches.length} committed successfully`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to commit batch ${i + 1}`, { error: errorMessage });
          throw error; // Re-throw para marcar o job como falho
        }
      }

      expirationResults.successful = packsSnapshot.size - expirationResults.failed;

      console.log('Credit packs expiration job completed', {
        total: packsSnapshot.size,
        successful: expirationResults.successful,
        failed: expirationResults.failed,
        totalCreditsExpired: expirationResults.totalCreditsExpired,
        executionTime: now.toDate().toISOString()
      });

      return {
        success: true,
        expired: expirationResults.successful,
        totalCreditsExpired: expirationResults.totalCreditsExpired,
        results: expirationResults
      };

    } catch (error) {
      console.error('Credit packs expiration job failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: now.toDate().toISOString()
      });

      throw error; // Re-throw para que o Cloud Scheduler registre a falha
    }
  });
