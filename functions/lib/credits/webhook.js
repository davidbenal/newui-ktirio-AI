"use strict";
/**
 * ETAPA 3.4: STRIPE WEBHOOK (CRÍTICA!)
 *
 * Processa eventos do Stripe de forma idempotente e segura
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookExport = exports.stripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const plans_1 = require("../config/plans");
const db = admin.firestore();
const getStripe = () => {
    var _a;
    const secretKey = (_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key;
    if (!secretKey) {
        throw new Error('Stripe secret key not configured');
    }
    return new stripe_1.default(secretKey, {
        apiVersion: '2025-09-30.clover',
    });
};
/**
 * Webhook handler do Stripe
 * SEMPRE verificar signature para segurança
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    console.log('🔔 Stripe webhook received');
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const stripe = getStripe();
    const webhookSecret = (_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.webhook_secret;
    if (!webhookSecret) {
        console.error('❌ Webhook secret not configured');
        res.status(500).send('Webhook secret not configured');
        return;
    }
    let event;
    try {
        // Verificar signature do Stripe (CRÍTICO PARA SEGURANÇA!)
        const signature = req.headers['stripe-signature'];
        event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
        console.log(`✅ Webhook signature verified: ${event.type}`);
    }
    catch (error) {
        console.error('❌ Webhook signature verification failed:', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }
    try {
        // Processar evento baseado no tipo
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error(`❌ Error processing webhook ${event.type}:`, error);
        res.status(500).send(`Webhook processing error: ${error.message}`);
    }
});
exports.stripeWebhookExport = exports.stripeWebhook;
/**
 * checkout.session.completed
 * Atualizar checkoutSession e processar pacote se necessário
 */
async function handleCheckoutSessionCompleted(session) {
    console.log('🛒 Processing checkout.session.completed:', session.id);
    const metadata = session.metadata;
    if (!(metadata === null || metadata === void 0 ? void 0 : metadata.userId)) {
        console.error('❌ No userId in session metadata');
        return;
    }
    const { userId, type } = metadata;
    // Atualizar checkoutSession no Firestore
    const checkoutSnapshot = await db
        .collection('checkoutSessions')
        .where('stripeSessionId', '==', session.id)
        .limit(1)
        .get();
    if (!checkoutSnapshot.empty) {
        await checkoutSnapshot.docs[0].ref.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('✅ CheckoutSession updated to completed');
    }
    // Se for credit_pack, processar imediatamente
    if (type === 'credit_pack') {
        const packType = metadata.packType;
        const credits = parseInt(metadata.credits || '0', 10);
        const validityDays = metadata.validityDays === 'null' ? null : parseInt(metadata.validityDays || '0', 10);
        // Verificar se já foi processado (idempotência)
        const existingPackSnapshot = await db
            .collection('creditPacks')
            .where('userId', '==', userId)
            .where('stripePaymentIntentId', '==', session.payment_intent)
            .limit(1)
            .get();
        if (!existingPackSnapshot.empty) {
            console.log('ℹ️ Pack already processed, skipping');
            return;
        }
        await processCreditPackPurchase(userId, packType, credits, validityDays, session.payment_intent, session.amount_total || 0);
    }
    // Se for subscription, deixar para customer.subscription.created processar
}
/**
 * customer.subscription.created
 * Criar subscription no Firestore
 */
async function handleSubscriptionCreated(subscription) {
    console.log('📋 Processing customer.subscription.created:', subscription.id);
    const metadata = subscription.metadata;
    if (!(metadata === null || metadata === void 0 ? void 0 : metadata.userId) || !(metadata === null || metadata === void 0 ? void 0 : metadata.planType)) {
        console.error('❌ Missing metadata in subscription');
        return;
    }
    const { userId, planType } = metadata;
    const plan = plans_1.PLANS[planType];
    if (!plan) {
        console.error('❌ Invalid plan type:', planType);
        return;
    }
    // Verificar se já foi processado (idempotência)
    const existingSubSnapshot = await db
        .collection('subscriptions')
        .where('stripeSubscriptionId', '==', subscription.id)
        .limit(1)
        .get();
    if (!existingSubSnapshot.empty) {
        console.log('ℹ️ Subscription already processed, skipping');
        return;
    }
    // Transaction atômica: cancelar anterior e criar nova
    await db.runTransaction(async (transaction) => {
        // 1. Buscar e cancelar assinatura ativa anterior
        const activeSubSnapshot = await transaction.get(db.collection('subscriptions').where('userId', '==', userId).where('status', '==', 'active'));
        for (const doc of activeSubSnapshot.docs) {
            transaction.update(doc.ref, {
                status: 'canceled',
                canceledAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        // 2. Criar nova subscription
        const billingCycleStart = new Date(subscription.items.data[0].plan.interval_count * 2592000 * 1000);
        const billingCycleEnd = new Date((subscription.items.data[0].plan.interval_count + 1) * 2592000 * 1000);
        const nextResetDate = new Date(billingCycleEnd);
        const nextBillingDate = new Date((subscription.items.data[0].plan.interval_count + 1) * 2592000 * 1000);
        const newSubRef = db.collection('subscriptions').doc();
        transaction.set(newSubRef, {
            userId,
            planType,
            status: 'active',
            monthlyCredits: plan.credits,
            creditsUsedCurrentPeriod: 0,
            creditsRemainingCurrentPeriod: plan.credits,
            billingCycleStart: admin.firestore.Timestamp.fromDate(billingCycleStart),
            billingCycleEnd: admin.firestore.Timestamp.fromDate(billingCycleEnd),
            nextResetDate: admin.firestore.Timestamp.fromDate(nextResetDate),
            nextBillingDate: admin.firestore.Timestamp.fromDate(nextBillingDate),
            stripeSubscriptionId: subscription.id,
            stripePriceId: plan.stripePriceId || '',
            pricePaid: plan.price,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            canceledAt: null,
        });
        // 3. Criar creditTransaction
        const transactionRef = db.collection('creditTransactions').doc();
        transaction.set(transactionRef, {
            userId,
            transactionType: 'subscription_created',
            creditsChange: plan.credits,
            balanceAfterTransaction: plan.credits, // Simplified, real impl would calculate total
            sourceType: 'subscription',
            sourceId: newSubRef.id,
            imageGenerationId: null,
            description: `Assinatura ${plan.displayName} criada`,
            metadata: {
                planType,
                stripeSubscriptionId: subscription.id,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    console.log('✅ Subscription created in Firestore');
}
/**
 * customer.subscription.deleted
 * Marcar subscription como expirada
 */
async function handleSubscriptionDeleted(subscription) {
    console.log('🗑️ Processing customer.subscription.deleted:', subscription.id);
    const subSnapshot = await db
        .collection('subscriptions')
        .where('stripeSubscriptionId', '==', subscription.id)
        .limit(1)
        .get();
    if (subSnapshot.empty) {
        console.log('ℹ️ Subscription not found in Firestore');
        return;
    }
    await subSnapshot.docs[0].ref.update({
        status: 'expired',
        canceledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Subscription marked as expired');
}
/**
 * invoice.payment_succeeded
 * Reset mensal de créditos
 */
async function handleInvoicePaymentSucceeded(invoice) {
    console.log('💳 Processing invoice.payment_succeeded:', invoice.id);
    // Ignorar se for primeira cobrança (já processado em subscription.created)
    if (invoice.billing_reason === 'subscription_create') {
        console.log('ℹ️ Skipping subscription_create invoice');
        return;
    }
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) {
        console.log('ℹ️ No subscription in invoice');
        return;
    }
    // Buscar subscription no Firestore
    const subSnapshot = await db
        .collection('subscriptions')
        .where('stripeSubscriptionId', '==', subscriptionId)
        .limit(1)
        .get();
    if (subSnapshot.empty) {
        console.log('⚠️ Subscription not found for invoice');
        return;
    }
    const subDoc = subSnapshot.docs[0];
    const subData = subDoc.data();
    // RESET MENSAL
    const now = new Date();
    const nextResetDate = new Date(now);
    nextResetDate.setDate(nextResetDate.getDate() + 30);
    await db.runTransaction(async (transaction) => {
        // 1. Resetar créditos da subscription
        transaction.update(subDoc.ref, {
            creditsUsedCurrentPeriod: 0,
            creditsRemainingCurrentPeriod: subData.monthlyCredits,
            nextResetDate: admin.firestore.Timestamp.fromDate(nextResetDate),
            billingCycleStart: admin.firestore.FieldValue.serverTimestamp(),
            billingCycleEnd: admin.firestore.Timestamp.fromDate(nextResetDate),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 2. Criar creditTransaction
        const transactionRef = db.collection('creditTransactions').doc();
        transaction.set(transactionRef, {
            userId: subData.userId,
            transactionType: 'subscription_reset',
            creditsChange: subData.monthlyCredits,
            balanceAfterTransaction: subData.monthlyCredits, // Simplified
            sourceType: 'subscription',
            sourceId: subDoc.id,
            imageGenerationId: null,
            description: 'Reset mensal de créditos',
            metadata: {
                invoiceId: invoice.id,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    console.log('✅ Monthly credits reset completed');
}
/**
 * payment_intent.succeeded
 * Processar compra de pacote (fallback se checkout.session.completed falhar)
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
    console.log('💰 Processing payment_intent.succeeded:', paymentIntent.id);
    const metadata = paymentIntent.metadata;
    if (!(metadata === null || metadata === void 0 ? void 0 : metadata.userId) || metadata.type !== 'credit_pack') {
        console.log('ℹ️ Not a credit pack purchase');
        return;
    }
    // Verificar se já foi processado
    const existingPackSnapshot = await db
        .collection('creditPacks')
        .where('userId', '==', metadata.userId)
        .where('stripePaymentIntentId', '==', paymentIntent.id)
        .limit(1)
        .get();
    if (!existingPackSnapshot.empty) {
        console.log('ℹ️ Pack already processed, skipping');
        return;
    }
    const packType = metadata.packType;
    const credits = parseInt(metadata.credits || '0', 10);
    const validityDays = metadata.validityDays === 'null' ? null : parseInt(metadata.validityDays || '0', 10);
    await processCreditPackPurchase(metadata.userId, packType, credits, validityDays, paymentIntent.id, paymentIntent.amount);
}
/**
 * Helper: Processar compra de pacote de créditos
 */
async function processCreditPackPurchase(userId, packType, credits, validityDays, paymentIntentId, amount) {
    console.log('📦 Processing credit pack purchase:', { userId, packType, credits });
    const pack = plans_1.CREDIT_PACKS[packType];
    const expiresAt = (0, plans_1.calculatePackExpiryDate)(validityDays);
    await db.runTransaction(async (transaction) => {
        // 1. Criar creditPack
        const packRef = db.collection('creditPacks').doc();
        transaction.set(packRef, {
            userId,
            packType,
            creditsPurchased: credits,
            creditsUsed: 0,
            creditsRemaining: credits,
            pricePaid: amount,
            stripePaymentIntentId: paymentIntentId,
            purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(expiresAt) : null,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 2. Criar creditTransaction
        const transactionRef = db.collection('creditTransactions').doc();
        transaction.set(transactionRef, {
            userId,
            transactionType: 'pack_purchase',
            creditsChange: credits,
            balanceAfterTransaction: credits, // Simplified
            sourceType: 'credit_pack',
            sourceId: packRef.id,
            imageGenerationId: null,
            description: `Pacote ${pack.displayName} comprado`,
            metadata: {
                packType,
                paymentIntentId,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    console.log('✅ Credit pack processed successfully');
}
//# sourceMappingURL=webhook.js.map