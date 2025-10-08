"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHECKOUT_URLS = exports.CREDIT_PACKS = exports.PLANS = exports.COST_PER_GENERATION_CENTS = exports.COST_PER_GENERATION = void 0;
exports.getPlanById = getPlanById;
exports.getCreditPackById = getCreditPackById;
exports.calculateCreditsValue = calculateCreditsValue;
exports.calculateCreditsValueCents = calculateCreditsValueCents;
exports.validateStripeConfig = validateStripeConfig;
exports.formatPrice = formatPrice;
exports.calculatePackExpiryDate = calculatePackExpiryDate;
// ====================================
// CONSTANTES GLOBAIS
// ====================================
/**
 * Custo de 1 geração de imagem em reais
 */
exports.COST_PER_GENERATION = 0.21;
/**
 * Custo de 1 geração em centavos (para cálculos)
 */
exports.COST_PER_GENERATION_CENTS = 21;
// ====================================
// PLANOS DE ASSINATURA
// ====================================
/**
 * Configuração de todos os planos de assinatura
 *
 * ATENÇÃO: stripePriceId deve ser preenchido após criar os produtos no Stripe Dashboard
 */
exports.PLANS = {
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
};
// ====================================
// PACOTES DE CRÉDITOS
// ====================================
/**
 * Configuração de pacotes de créditos avulsos (one-time purchase)
 *
 * ATENÇÃO: stripePriceId deve ser preenchido após criar os produtos no Stripe Dashboard
 */
exports.CREDIT_PACKS = {
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
};
// ====================================
// URLs DE CHECKOUT
// ====================================
/**
 * URLs de retorno após pagamento no Stripe Checkout
 */
exports.CHECKOUT_URLS = {
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
};
// ====================================
// HELPER FUNCTIONS
// ====================================
/**
 * Buscar configuração de plano por ID
 */
function getPlanById(planId) {
    return exports.PLANS[planId];
}
/**
 * Buscar configuração de pacote por ID
 */
function getCreditPackById(packId) {
    return exports.CREDIT_PACKS[packId];
}
/**
 * Calcular valor total de créditos em reais
 */
function calculateCreditsValue(credits) {
    return credits * exports.COST_PER_GENERATION;
}
/**
 * Calcular valor total de créditos em centavos
 */
function calculateCreditsValueCents(credits) {
    return credits * exports.COST_PER_GENERATION_CENTS;
}
/**
 * Validar se stripePriceId está configurado
 * Útil para detectar configuração incompleta
 */
function validateStripeConfig() {
    var _a, _b;
    const missing = [];
    // Validar planos
    if ((_a = exports.PLANS.basic.stripePriceId) === null || _a === void 0 ? void 0 : _a.includes('SUBSTITUA')) {
        missing.push('PLANS.basic.stripePriceId');
    }
    if ((_b = exports.PLANS.pro.stripePriceId) === null || _b === void 0 ? void 0 : _b.includes('SUBSTITUA')) {
        missing.push('PLANS.pro.stripePriceId');
    }
    // Validar pacotes
    if (exports.CREDIT_PACKS.initial.stripePriceId.includes('SUBSTITUA')) {
        missing.push('CREDIT_PACKS.initial.stripePriceId');
    }
    if (exports.CREDIT_PACKS.standard.stripePriceId.includes('SUBSTITUA')) {
        missing.push('CREDIT_PACKS.standard.stripePriceId');
    }
    if (exports.CREDIT_PACKS.large.stripePriceId.includes('SUBSTITUA')) {
        missing.push('CREDIT_PACKS.large.stripePriceId');
    }
    return {
        valid: missing.length === 0,
        missingPriceIds: missing,
    };
}
/**
 * Formatar preço em centavos para exibição (R$ XX,XX)
 */
function formatPrice(cents) {
    const reais = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(reais);
}
/**
 * Calcular data de expiração de pacote
 */
function calculatePackExpiryDate(validityDays) {
    if (validityDays === null)
        return null;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityDays);
    return expiryDate;
}
// ====================================
// EXPORTS
// ====================================
exports.default = {
    COST_PER_GENERATION: exports.COST_PER_GENERATION,
    COST_PER_GENERATION_CENTS: exports.COST_PER_GENERATION_CENTS,
    PLANS: exports.PLANS,
    CREDIT_PACKS: exports.CREDIT_PACKS,
    CHECKOUT_URLS: exports.CHECKOUT_URLS,
    getPlanById,
    getCreditPackById,
    calculateCreditsValue,
    calculateCreditsValueCents,
    validateStripeConfig,
    formatPrice,
    calculatePackExpiryDate,
};
//# sourceMappingURL=plans.js.map