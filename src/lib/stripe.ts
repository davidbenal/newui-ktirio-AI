import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const plans = {
  starter: {
    monthly: {
      priceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
      amount: 4900, // $49.00
    },
    yearly: {
      priceId: process.env.STRIPE_PRICE_STARTER_YEARLY!,
      amount: 47000, // $470.00 (20% off)
    },
    credits: 100,
    features: [
      '100 créditos/mês',
      'Qualidade alta',
      'Sem marca d\'água',
      'Até 5 projetos',
      'Exportação HD',
      'Suporte por email',
    ],
  },
  professional: {
    monthly: {
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY!,
      amount: 8900, // $89.00
    },
    yearly: {
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY!,
      amount: 85400, // $854.00 (20% off)
    },
    credits: 300,
    features: [
      '300 créditos/mês',
      'Qualidade máxima',
      'Sem marca d\'água',
      'Projetos ilimitados',
      'Exportação 4K',
      'API + Integrações',
      'Suporte prioritário',
      'Histórico ilimitado',
    ],
  },
} as const

export type PlanId = keyof typeof plans
export type BillingPeriod = 'monthly' | 'yearly'
