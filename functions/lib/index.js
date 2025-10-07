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
exports.clerkWebhook = exports.createFirebaseToken = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const svix_1 = require("svix");
// Initialize Firebase Admin
admin.initializeApp();
/**
 * Cloud Function que gera Firebase Custom Tokens para usuários do Clerk
 *
 * Fluxo:
 * 1. Cliente envia userId do Clerk
 * 2. Esta função gera um Firebase Custom Token
 * 3. Cliente usa o token para autenticar no Firebase Auth
 *
 * Endpoint: https://us-central1-ktirio-ai-4540c.cloudfunctions.net/createFirebaseToken
 */
exports.createFirebaseToken = functions.https.onCall(async (data, context) => {
    var _a;
    try {
        // Extrair userId do data ou do auth context
        const userId = data.userId || ((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid);
        if (!userId) {
            throw new functions.https.HttpsError('unauthenticated', 'userId is required');
        }
        console.log(`🔐 Creating custom token for user: ${userId}`);
        // Criar custom token do Firebase
        const customToken = await admin.auth().createCustomToken(userId);
        console.log(`✅ Created custom token for user: ${userId}`);
        return { token: customToken };
    }
    catch (error) {
        console.error('❌ Error creating custom token:', error);
        throw new functions.https.HttpsError('internal', 'Error creating Firebase custom token');
    }
});
/**
 * Webhook handler para sincronizar usuários do Clerk com Firestore
 *
 * Eventos suportados:
 * - user.created: Cria novo documento de usuário
 * - user.updated: Atualiza dados do usuário
 * - user.deleted: Marca usuário como deletado (soft delete)
 */
exports.clerkWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    // Verificar que é um POST request
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    // Get webhook secret from environment
    const webhookSecret = (_a = functions.config().clerk) === null || _a === void 0 ? void 0 : _a.webhook_secret;
    if (!webhookSecret) {
        console.error('❌ Clerk webhook secret not configured');
        res.status(500).send('Webhook secret not configured');
        return;
    }
    try {
        // Verify webhook signature using Svix
        const wh = new svix_1.Webhook(webhookSecret);
        const payload = wh.verify(JSON.stringify(req.body), req.headers);
        const eventType = payload.type;
        const userData = payload.data;
        console.log(`📨 Received Clerk webhook: ${eventType}`, userData.id);
        switch (eventType) {
            case 'user.created':
                await handleUserCreated(userData);
                break;
            case 'user.updated':
                await handleUserUpdated(userData);
                break;
            case 'user.deleted':
                await handleUserDeleted(userData);
                break;
            default:
                console.log(`ℹ️ Unhandled event type: ${eventType}`);
        }
        res.status(200).send('Webhook processed');
    }
    catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(400).send('Invalid webhook signature');
    }
});
// Helper: Create user in Firestore
async function handleUserCreated(userData) {
    var _a;
    const userId = userData.id;
    const email = ((_a = userData.email_addresses[0]) === null || _a === void 0 ? void 0 : _a.email_address) || '';
    const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    await admin.firestore().collection('users').doc(userId).set({
        clerkId: userId,
        email,
        name,
        avatar: userData.profile_image_url,
        plan: 'free',
        credits: 5, // Initial free credits
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Created user in Firestore: ${userId}`);
}
// Helper: Update user in Firestore
async function handleUserUpdated(userData) {
    var _a;
    const userId = userData.id;
    const email = ((_a = userData.email_addresses[0]) === null || _a === void 0 ? void 0 : _a.email_address) || '';
    const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    await admin.firestore().collection('users').doc(userId).update({
        email,
        name,
        avatar: userData.profile_image_url,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Updated user in Firestore: ${userId}`);
}
// Helper: Soft delete user in Firestore
async function handleUserDeleted(userData) {
    const userId = userData.id;
    await admin.firestore().collection('users').doc(userId).update({
        deleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Soft deleted user in Firestore: ${userId}`);
}
//# sourceMappingURL=index.js.map