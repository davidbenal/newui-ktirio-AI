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
exports.resetSubscriptionCredits = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
/**
 * Scheduled function que reseta créditos de subscriptions ativas
 * Roda a cada hora (0 * * * *)
 */
exports.resetSubscriptionCredits = functions
    .region('southamerica-east1')
    .pubsub.schedule('0 * * * *')
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
    const db = admin.firestore();
    const now = firestore_1.Timestamp.now();
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
            errors: []
        };
        // Processar cada subscription
        for (const doc of subscriptionsSnapshot.docs) {
            const subscriptionId = doc.id;
            const subscription = doc.data();
            try {
                await resetSubscription(db, subscriptionId, subscription);
                resetResults.successful++;
                console.log('Successfully reset subscription', {
                    subscriptionId,
                    userId: subscription.userId,
                    monthlyCredits: subscription.monthlyCredits
                });
            }
            catch (error) {
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
    }
    catch (error) {
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
async function resetSubscription(db, subscriptionId, subscription) {
    const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
    const userRef = db.collection('users').doc(subscription.userId);
    const now = firestore_1.Timestamp.now();
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
        const currentData = subscriptionDoc.data();
        const monthlyCredits = currentData.monthlyCredits;
        // 2. Atualizar subscription
        transaction.update(subscriptionRef, {
            creditsUsedCurrentPeriod: 0,
            creditsRemainingCurrentPeriod: monthlyCredits,
            billingCycleStart: now,
            billingCycleEnd: firestore_1.Timestamp.fromDate(billingCycleEnd),
            nextResetDate: firestore_1.Timestamp.fromDate(nextResetDate),
            lastResetAt: now
        });
        // 3. Atualizar total de créditos do usuário
        const userData = userDoc.data();
        const currentTotalCredits = (userData === null || userData === void 0 ? void 0 : userData.totalCredits) || 0;
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
                billingCycleEnd: firestore_1.Timestamp.fromDate(billingCycleEnd),
                planMonthlyCredits: monthlyCredits
            },
            createdAt: now
        });
    });
}
//# sourceMappingURL=resetSubscriptionCredits.js.map