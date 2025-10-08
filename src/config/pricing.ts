/**
 * Configuração de Planos e Preços
 *
 * IMPORTANTE: Os Price IDs devem corresponder aos IDs criados no Stripe Dashboard
 */

export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Básico',
    monthlyCredits: 1000,
    price: 29.90,
    priceId: 'price_1QiIi6P03hDFf6riFHkC7S0c', // Price ID real do Stripe
    features: [
      '1.000 créditos por mês',
      'Geração de imagens ilimitadas',
      'Suporte por email',
      'Histórico de 30 dias',
      'Exportação básica'
    ],
    popular: false
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyCredits: 5000,
    price: 99.90,
    priceId: 'price_1QiIi6P03hDFf6riImGr2jke', // Price ID real do Stripe
    features: [
      '5.000 créditos por mês',
      'Geração prioritária',
      'Suporte prioritário 24/7',
      'Histórico ilimitado',
      'Exportação avançada (PNG, SVG)',
      'API access',
      'Marca d\'água removida'
    ],
    popular: true
  }
} as const;

export const CREDIT_PACKS = {
  starter: {
    id: 'starter',
    name: 'Inicial',
    credits: 500,
    price: 19.90,
    priceId: 'price_1QiIi6P03hDFf6ri78wPfQ9J',
    validityDays: 90,
    popular: false
  },
  standard: {
    id: 'standard',
    name: 'Padrão',
    credits: 2000,
    price: 69.90,
    priceId: 'price_1QiIi6P03hDFf6riRATq9Z5D',
    validityDays: 90,
    popular: true,
    savingsPercent: 12
  },
  large: {
    id: 'large',
    name: 'Grande',
    credits: 5000,
    price: 149.90,
    priceId: 'price_1QiIi6P03hDFf6riTb9VC6F8',
    validityDays: 90,
    popular: false,
    savingsPercent: 25
  }
} as const;

// Tipos derivados
export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;
export type CreditPackId = keyof typeof CREDIT_PACKS;

// Helper para obter informações do plano
export function getSubscriptionPlan(planId: SubscriptionPlanId) {
  return SUBSCRIPTION_PLANS[planId];
}

export function getCreditPack(packId: CreditPackId) {
  return CREDIT_PACKS[packId];
}

// URLs de retorno do Stripe
export const STRIPE_RETURN_URLS = {
  success: `${window.location.origin}/checkout/success`,
  cancel: `${window.location.origin}/pricing`
} as const;
