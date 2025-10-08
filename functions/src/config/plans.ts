/**
 * ETAPA 2.1: CONFIGURAÇÕES E CONSTANTES
 *
 * Centraliza todas as configurações de planos, pacotes e preços.
 *
 * IMPORTANTE:
 * - Valores sempre em centavos (nunca float para dinheiro)
 * - stripePriceId deve ser copiado do Stripe Dashboard após criar os produtos
 * - Usar const para imutabilidade
 */

// ====================================
// CONSTANTES GLOBAIS
// ====================================

/**
 * Custo de 1 geração de imagem em reais
 */
export const COST_PER_GENERATION = 0.21

/**
 * Custo de 1 geração em centavos (para cálculos)
 */
export const COST_PER_GENERATION_CENTS = 21

// ====================================
// TIPOS
// ====================================

export interface PlanConfig {
  id: 'trial' | 'basic' | 'pro'
  name: string
  displayName: string
  icon: string
  credits: number
  price: number // Em centavos
  stripePriceId: string | null // null para Trial (não tem cobrança)
  interval: 'month' | 'one_time'
  features: {
    generations: number
    maxProjects: number
    styles: string[]
    priority: boolean
    support: string
    exportFormats: string[]
  }
}

export interface CreditPackConfig {
  id: 'initial' | 'standard' | 'large'
  name: string
  displayName: string
  icon: string
  credits: number
  price: number // Em centavos
  stripePriceId: string // Obrigatório para pacotes
  validityDays: number | null // null = sem expiração
  discount?: number // Desconto em % (opcional)
}

// ====================================
// PLANOS DE ASSINATURA
// ====================================

/**
 * Configuração de todos os planos de assinatura
 *
 * ATENÇÃO: stripePriceId deve ser preenchido após criar os produtos no Stripe Dashboard
 */
export const PLANS: Record<'trial' | 'basic' | 'pro', PlanConfig> = {
  trial: {
    id: 'trial',
    name: 'trial',
    displayName: 'Trial Gratuito',
    icon: '🎁',
    credits: 5,
    price: 0,
    stripePriceId: null, // Trial não tem cobrança
    interval: 'one_time',
    features: {
      generations: 5,
      maxProjects: 3,
      styles: ['basic'],
      priority: false,
      support: 'Comunidade',
      exportFormats: ['PNG'],
    },
  },

  basic: {
    id: 'basic',
    name: 'basic',
    displayName: 'Ktírio Básico',
    icon: '⭐',
    credits: 100,
    price: 4990, // R$ 49,90
    stripePriceId: 'price_1SFpHkRubDJ4RApyCypVbIoK', // ✅ Configurado
    interval: 'month',
    features: {
      generations: 100,
      maxProjects: 15,
      styles: ['basic', 'modern', 'classic'],
      priority: false,
      support: 'Email',
      exportFormats: ['PNG', 'JPG'],
    },
  },

  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'Ktírio Pro',
    icon: '💎',
    credits: 500,
    price: 25990, // R$ 259,90
    stripePriceId: 'price_1SFpINRubDJ4RApyjucRqblu', // ✅ Configurado
    interval: 'month',
    features: {
      generations: 500,
      maxProjects: 999, // Ilimitado na prática
      styles: ['basic', 'modern', 'classic', 'luxury', 'minimal'],
      priority: true,
      support: 'Prioritário',
      exportFormats: ['PNG', 'JPG', 'WEBP', 'SVG'],
    },
  },
} as const

// ====================================
// PACOTES DE CRÉDITOS
// ====================================

/**
 * Configuração de pacotes de créditos avulsos (one-time purchase)
 *
 * ATENÇÃO: stripePriceId deve ser preenchido após criar os produtos no Stripe Dashboard
 */
export const CREDIT_PACKS: Record<'initial' | 'standard' | 'large', CreditPackConfig> = {
  initial: {
    id: 'initial',
    name: 'initial',
    displayName: 'Pacote Inicial',
    icon: '📦',
    credits: 50,
    price: 3990, // R$ 39,90
    stripePriceId: 'price_1SDIOkRubDJ4RApyfVWUIE1O', // ✅ Configurado
    validityDays: 90, // Expira em 90 dias
    discount: 0,
  },

  standard: {
    id: 'standard',
    name: 'standard',
    displayName: 'Pacote Padrão',
    icon: '📦',
    credits: 150,
    price: 9990, // R$ 99,90
    stripePriceId: 'price_1SDIOCRubDJ4RApy47OSAiWV', // ✅ Configurado
    validityDays: 120, // Expira em 120 dias
    discount: 10, // 10% de desconto vs comprar individual
  },

  large: {
    id: 'large',
    name: 'large',
    displayName: 'Pacote Grande',
    icon: '📦',
    credits: 300,
    price: 17990, // R$ 179,90
    stripePriceId: 'price_1SDINURubDJ4RApyOW8A61K7', // ✅ Configurado
    validityDays: null, // Sem expiração
    discount: 20, // 20% de desconto vs comprar individual
  },
} as const

// ====================================
// URLs DE CHECKOUT
// ====================================

/**
 * URLs de retorno após pagamento no Stripe Checkout
 */
export const CHECKOUT_URLS = {
  /**
   * URL de sucesso após pagamento
   * {CHECKOUT_SESSION_ID} será substituído pelo Stripe
   */
  successUrl: '/checkout/success?session_id={CHECKOUT_SESSION_ID}',

  /**
   * URL de cancelamento (usuário clicou em voltar)
   */
  cancelUrl: '/pricing',

  /**
   * URL de retorno do Customer Portal (gerenciar assinatura)
   */
  portalReturnUrl: '/settings/billing',
} as const

// ====================================
// HELPER FUNCTIONS
// ====================================

/**
 * Buscar configuração de plano por ID
 */
export function getPlanById(planId: 'trial' | 'basic' | 'pro'): PlanConfig {
  return PLANS[planId]
}

/**
 * Buscar configuração de pacote por ID
 */
export function getCreditPackById(packId: 'initial' | 'standard' | 'large'): CreditPackConfig {
  return CREDIT_PACKS[packId]
}

/**
 * Calcular valor total de créditos em reais
 */
export function calculateCreditsValue(credits: number): number {
  return credits * COST_PER_GENERATION
}

/**
 * Calcular valor total de créditos em centavos
 */
export function calculateCreditsValueCents(credits: number): number {
  return credits * COST_PER_GENERATION_CENTS
}

/**
 * Validar se stripePriceId está configurado
 * Útil para detectar configuração incompleta
 */
export function validateStripeConfig(): {
  valid: boolean
  missingPriceIds: string[]
} {
  const missing: string[] = []

  // Validar planos
  if (PLANS.basic.stripePriceId?.includes('SUBSTITUA')) {
    missing.push('PLANS.basic.stripePriceId')
  }
  if (PLANS.pro.stripePriceId?.includes('SUBSTITUA')) {
    missing.push('PLANS.pro.stripePriceId')
  }

  // Validar pacotes
  if (CREDIT_PACKS.initial.stripePriceId.includes('SUBSTITUA')) {
    missing.push('CREDIT_PACKS.initial.stripePriceId')
  }
  if (CREDIT_PACKS.standard.stripePriceId.includes('SUBSTITUA')) {
    missing.push('CREDIT_PACKS.standard.stripePriceId')
  }
  if (CREDIT_PACKS.large.stripePriceId.includes('SUBSTITUA')) {
    missing.push('CREDIT_PACKS.large.stripePriceId')
  }

  return {
    valid: missing.length === 0,
    missingPriceIds: missing,
  }
}

/**
 * Formatar preço em centavos para exibição (R$ XX,XX)
 */
export function formatPrice(cents: number): string {
  const reais = cents / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais)
}

/**
 * Calcular data de expiração de pacote
 */
export function calculatePackExpiryDate(validityDays: number | null): Date | null {
  if (validityDays === null) return null

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + validityDays)
  return expiryDate
}

// ====================================
// EXPORTS
// ====================================

export default {
  COST_PER_GENERATION,
  COST_PER_GENERATION_CENTS,
  PLANS,
  CREDIT_PACKS,
  CHECKOUT_URLS,
  getPlanById,
  getCreditPackById,
  calculateCreditsValue,
  calculateCreditsValueCents,
  validateStripeConfig,
  formatPrice,
  calculatePackExpiryDate,
}
