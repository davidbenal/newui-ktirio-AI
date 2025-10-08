"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireCreditPacks = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
/**
 * Scheduled function que expira pacotes de créditos
 * Roda diariamente às 00:00 (0 0 * * *)
 */
exports.expireCreditPacks = functions
    .region('southamerica-east1')
    .pubsub.schedule('0 0 * * *')
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
    const db = admin.firestore();
    const now = firestore_1.Timestamp.now();
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
            errors: []
        };
        // Usar batch para eficiência (até 500 operações por batch)
        const batchSize = 500;
        const batches = [db.batch()];
        let currentBatchIndex = 0;
        let operationCount = 0;
        // Processar cada pacote
        for (const doc of packsSnapshot.docs) {
            const packId = doc.id;
            const pack = doc.data();
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
            }
            catch (error) {
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
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Credit packs expiration job failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: now.toDate().toISOString()
        });
        throw error; // Re-throw para que o Cloud Scheduler registre a falha
    }
});
//# sourceMappingURL=expireCreditPacks.js.map