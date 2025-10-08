/**
 * Tipos para o sistema de créditos
 */

export interface SubscriptionCredits {
  monthlyCredits: number;
  creditsUsedCurrentPeriod: number;
  creditsRemainingCurrentPeriod: number;
  planType: 'basic' | 'pro';
  planName: string;
  status: 'active' | 'canceled' | 'past_due';
  nextResetDate: Date;
  billingCycleEnd: Date;
}

export interface CreditPack {
  packId: string;
  credits: number;
  creditsRemaining: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface CreditsData {
  totalCredits: number;
  hasActiveSubscription: boolean;
  subscription: SubscriptionCredits | null;
  packs: CreditPack[];
}

export type PlanType = 'basic' | 'pro';
export type PackType = 'starter' | 'standard' | 'large';

export interface Plan {
  id: PlanType;
  name: string;
  monthlyCredits: number;
  price: number;
  priceId: string;
  features: string[];
  recommended?: boolean;
}

export interface Pack {
  id: PackType;
  name: string;
  credits: number;
  price: number;
  priceId: string;
  validityDays: number;
  popular?: boolean;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}
