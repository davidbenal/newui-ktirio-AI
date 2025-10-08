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
