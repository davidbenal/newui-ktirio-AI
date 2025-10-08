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
exports.onUserCreated = void 0;
exports.expireTrial = expireTrial;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
/**
 * Trigger automático quando um novo usuário é criado
 * Cria trial de 7 dias com 10 créditos
 */
exports.onUserCreated = functions
    .region('southamerica-east1')
    .auth.user()
    .onCreate(async (user) => {
    const db = admin.firestore();
    const now = firestore_1.Timestamp.now();
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
                billingCycleEnd: firestore_1.Timestamp.fromDate(trialEndDate),
                nextResetDate: firestore_1.Timestamp.fromDate(trialEndDate), // Trial não renova, apenas expira
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
                    expiresAt: firestore_1.Timestamp.fromDate(trialEndDate)
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
    }
    catch (error) {
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
async function expireTrial(db, subscriptionId, userId) {
    const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
    await db.runTransaction(async (transaction) => {
        const subscriptionDoc = await transaction.get(subscriptionRef);
        if (!subscriptionDoc.exists) {
            throw new Error(`Subscription ${subscriptionId} not found`);
        }
        const subscription = subscriptionDoc.data();
        // Verificar se é trial
        if (!(subscription === null || subscription === void 0 ? void 0 : subscription.isTrial)) {
            throw new Error('Not a trial subscription');
        }
        // Atualizar status para expired
        transaction.update(subscriptionRef, {
            status: 'expired',
            creditsRemainingCurrentPeriod: 0,
            lastUpdated: firestore_1.Timestamp.now()
        });
        // Zerar créditos do usuário (apenas os do trial)
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        if (userDoc.exists) {
            const userData = userDoc.data();
            const currentCredits = (userData === null || userData === void 0 ? void 0 : userData.totalCredits) || 0;
            const trialCreditsRemaining = subscription.creditsRemainingCurrentPeriod || 0;
            transaction.update(userRef, {
                totalCredits: Math.max(0, currentCredits - trialCreditsRemaining),
                lastUpdated: firestore_1.Timestamp.now()
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
            createdAt: firestore_1.Timestamp.now()
        });
        console.log('Trial subscription expired', {
            subscriptionId,
            userId,
            creditsRemoved: subscription.creditsRemainingCurrentPeriod
        });
    });
}
//# sourceMappingURL=onUserCreated.js.map