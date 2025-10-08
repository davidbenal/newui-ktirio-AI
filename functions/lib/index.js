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
exports.onUserCreated = exports.expireCreditPacks = exports.resetSubscriptionCredits = exports.createCustomerPortalSession = exports.createGeneration = exports.consumeCredits = exports.getUserCredits = exports.stripeWebhook = exports.createPackCheckout = exports.createSubscriptionCheckout = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
// ====================================
// ETAPA 3: CLOUD FUNCTIONS - CRÉDITOS E STRIPE
// ====================================
// Import credit system functions
const index_1 = require("./credits/index");
Object.defineProperty(exports, "createSubscriptionCheckout", { enumerable: true, get: function () { return index_1.createSubscriptionCheckout; } });
Object.defineProperty(exports, "createPackCheckout", { enumerable: true, get: function () { return index_1.createPackCheckout; } });
const webhook_1 = require("./credits/webhook");
Object.defineProperty(exports, "stripeWebhook", { enumerable: true, get: function () { return webhook_1.stripeWebhook; } });
const operations_1 = require("./credits/operations");
Object.defineProperty(exports, "getUserCredits", { enumerable: true, get: function () { return operations_1.getUserCredits; } });
Object.defineProperty(exports, "consumeCredits", { enumerable: true, get: function () { return operations_1.consumeCredits; } });
Object.defineProperty(exports, "createGeneration", { enumerable: true, get: function () { return operations_1.createGeneration; } });
Object.defineProperty(exports, "createCustomerPortalSession", { enumerable: true, get: function () { return operations_1.createCustomerPortalSession; } });
// ====================================
// ETAPA 4: CRON JOBS - CLOUD SCHEDULER
// ====================================
// Import scheduled functions
const resetSubscriptionCredits_1 = require("./cron/resetSubscriptionCredits");
Object.defineProperty(exports, "resetSubscriptionCredits", { enumerable: true, get: function () { return resetSubscriptionCredits_1.resetSubscriptionCredits; } });
const expireCreditPacks_1 = require("./cron/expireCreditPacks");
Object.defineProperty(exports, "expireCreditPacks", { enumerable: true, get: function () { return expireCreditPacks_1.expireCreditPacks; } });
// ====================================
// ETAPA 7: AUTH TRIGGERS
// ====================================
// Import auth triggers
const onUserCreated_1 = require("./auth/onUserCreated");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return onUserCreated_1.onUserCreated; } });
//# sourceMappingURL=index.js.map