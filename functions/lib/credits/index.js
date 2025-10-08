"use strict";
/**
 * ETAPA 3: CLOUD FUNCTIONS - SISTEMA DE CRÉDITOS
 *
 * Funções para gerenciamento de créditos, assinaturas e pagamentos
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
exports.createPackCheckoutExport = exports.createSubscriptionCheckoutExport = exports.createPackCheckout = exports.createSubscriptionCheckout = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const plans_1 = require("../config/plans");
// Inicializar Stripe com secret key do Firebase Config
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
const db = admin.firestore();
// ====================================
// 3.2: CREATE SUBSCRIPTION CHECKOUT
// ====================================
/**
 * Cria sessão de checkout para assinatura
 */
exports.createSubscriptionCheckout = functions.https.onCall(async (data, context) => {
    var _a, _b;
    console.log('🛒 createSubscriptionCheckout called', { userId: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid, data });
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { planType } = data;
    // Validar tipo de plano
    if (!planType || !['basic', 'pro'].includes(planType)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid plan type');
    }
    try {
        const stripe = getStripe();
        const plan = (0, plans_1.getPlanById)(planType);
        if (!plan.stripePriceId) {
            throw new functions.https.HttpsError('failed-precondition', 'Plan price ID not configured');
        }
        // Verificar se já tem assinatura ativa do mesmo tipo
        const existingSubSnapshot = await db
            .collection('subscriptions')
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .where('planType', '==', planType)
            .limit(1)
            .get();
        if (!existingSubSnapshot.empty) {
            throw new functions.https.HttpsError('already-exists', 'You already have an active subscription of this type');
        }
        // Buscar ou criar Stripe Customer
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        let stripeCustomerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
        if (!stripeCustomerId) {
            // Criar novo customer no Stripe
            const customer = await stripe.customers.create({
                email: userData === null || userData === void 0 ? void 0 : userData.email,
                name: (userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name),
                metadata: {
                    firebaseUserId: userId,
                },
            });
            stripeCustomerId = customer.id;
            // Salvar no Firestore
            await db.collection('users').doc(userId).update({
                stripeCustomerId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log('✅ Created Stripe customer:', stripeCustomerId);
        }
        // Obter URL base da aplicação
        const appUrl = ((_b = functions.config().app) === null || _b === void 0 ? void 0 : _b.url) || 'http://localhost:5173';
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
            success_url: `${appUrl}${plans_1.CHECKOUT_URLS.successUrl}`,
            cancel_url: `${appUrl}${plans_1.CHECKOUT_URLS.cancelUrl}`,
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
        });
        // Salvar registro em checkoutSessions
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Sessão expira em 24h
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
        });
        console.log('✅ Checkout session created:', session.id);
        return {
            checkoutUrl: session.url,
            sessionId: session.id,
        };
    }
    catch (error) {
        console.error('❌ Error creating subscription checkout:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create checkout session');
    }
});
exports.createSubscriptionCheckoutExport = exports.createSubscriptionCheckout;
// ====================================
// 3.3: CREATE PACK CHECKOUT
// ====================================
/**
 * Cria sessão de checkout para pacote de créditos
 */
exports.createPackCheckout = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    console.log('🛒 createPackCheckout called', { userId: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid, data });
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { packType } = data;
    // Validar tipo de pacote
    if (!packType || !['initial', 'standard', 'large'].includes(packType)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid pack type');
    }
    try {
        const stripe = getStripe();
        const pack = (0, plans_1.getCreditPackById)(packType);
        // Buscar ou criar Stripe Customer
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        let stripeCustomerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
        if (!stripeCustomerId) {
            // Criar novo customer no Stripe
            const customer = await stripe.customers.create({
                email: userData === null || userData === void 0 ? void 0 : userData.email,
                name: (userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name),
                metadata: {
                    firebaseUserId: userId,
                },
            });
            stripeCustomerId = customer.id;
            // Salvar no Firestore
            await db.collection('users').doc(userId).update({
                stripeCustomerId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log('✅ Created Stripe customer:', stripeCustomerId);
        }
        // Obter URL base da aplicação
        const appUrl = ((_b = functions.config().app) === null || _b === void 0 ? void 0 : _b.url) || 'http://localhost:5173';
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
            success_url: `${appUrl}${plans_1.CHECKOUT_URLS.successUrl}`,
            cancel_url: `${appUrl}${plans_1.CHECKOUT_URLS.cancelUrl}`,
            locale: 'pt-BR',
            metadata: {
                userId,
                packType,
                type: 'credit_pack',
                credits: pack.credits.toString(),
                validityDays: ((_c = pack.validityDays) === null || _c === void 0 ? void 0 : _c.toString()) || 'null',
            },
            payment_intent_data: {
                metadata: {
                    userId,
                    packType,
                    credits: pack.credits.toString(),
                    validityDays: ((_d = pack.validityDays) === null || _d === void 0 ? void 0 : _d.toString()) || 'null',
                },
            },
        });
        // Salvar registro em checkoutSessions
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
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
        });
        console.log('✅ Pack checkout session created:', session.id);
        return {
            checkoutUrl: session.url,
            sessionId: session.id,
        };
    }
    catch (error) {
        console.error('❌ Error creating pack checkout:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create checkout session');
    }
});
exports.createPackCheckoutExport = exports.createPackCheckout;
//# sourceMappingURL=index.js.map