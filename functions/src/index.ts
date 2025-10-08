// @ts-ignore
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin
admin.initializeApp()

// ====================================
// ETAPA 3: CLOUD FUNCTIONS - CRÉDITOS E STRIPE
// ====================================

// Import credit system functions
import { createSubscriptionCheckout, createPackCheckout } from './credits/index'
import { stripeWebhook } from './credits/webhook'
import {
  getUserCredits,
  consumeCredits,
  createGeneration,
  createCustomerPortalSession,
} from './credits/operations'

// ====================================
// ETAPA 4: CRON JOBS - CLOUD SCHEDULER
// ====================================

// Import scheduled functions
import { resetSubscriptionCredits } from './cron/resetSubscriptionCredits'
import { expireCreditPacks } from './cron/expireCreditPacks'

// ====================================
// ETAPA 7: AUTH TRIGGERS
// ====================================

// Import auth triggers
import { onUserCreated } from './auth/onUserCreated'

// Export credit system functions
export {
  createSubscriptionCheckout,
  createPackCheckout,
  stripeWebhook,
  getUserCredits,
  consumeCredits,
  createGeneration,
  createCustomerPortalSession,
}

// Export scheduled functions
export {
  resetSubscriptionCredits,
  expireCreditPacks,
}

// Export auth triggers
export {
  onUserCreated,
}
