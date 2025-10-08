"use strict";
/**
 * Script para validar configuração do Stripe
 *
 * Execução:
 * cd functions && npx ts-node src/scripts/validate-config.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const plans_1 = require("../config/plans");
console.log('🔍 Validando Configuração do Stripe...\n');
// Validar Price IDs
const validation = (0, plans_1.validateStripeConfig)();
if (validation.valid) {
    console.log('✅ Todos os Price IDs estão configurados!\n');
}
else {
    console.log('⚠️  Configuração INCOMPLETA!\n');
    console.log('Price IDs faltando:');
    validation.missingPriceIds.forEach(id => {
        console.log(`  ❌ ${id}`);
    });
    console.log('\n📝 Ação necessária:');
    console.log('1. Criar produtos no Stripe Dashboard');
    console.log('2. Copiar os Price IDs');
    console.log('3. Atualizar functions/src/config/plans.ts');
    console.log('\nVer guia: ETAPA_2_CONFIGURACAO_STRIPE.md\n');
}
// Mostrar resumo dos planos
console.log('📊 PLANOS CONFIGURADOS:\n');
console.log('🎁 TRIAL (Gratuito)');
console.log(`   Créditos: ${plans_1.PLANS.trial.credits}`);
console.log(`   Preço: ${(0, plans_1.formatPrice)(plans_1.PLANS.trial.price)}`);
console.log(`   Price ID: ${plans_1.PLANS.trial.stripePriceId || 'N/A (gratuito)'}`);
console.log('');
console.log('⭐ BÁSICO');
console.log(`   Créditos: ${plans_1.PLANS.basic.credits}/mês`);
console.log(`   Preço: ${(0, plans_1.formatPrice)(plans_1.PLANS.basic.price)}/mês`);
console.log(`   Price ID: ${plans_1.PLANS.basic.stripePriceId}`);
console.log('');
console.log('💎 PRO');
console.log(`   Créditos: ${plans_1.PLANS.pro.credits}/mês`);
console.log(`   Preço: ${(0, plans_1.formatPrice)(plans_1.PLANS.pro.price)}/mês`);
console.log(`   Price ID: ${plans_1.PLANS.pro.stripePriceId}`);
console.log('');
// Mostrar resumo dos pacotes
console.log('📦 PACOTES CONFIGURADOS:\n');
console.log('📦 INICIAL');
console.log(`   Créditos: ${plans_1.CREDIT_PACKS.initial.credits}`);
console.log(`   Preço: ${(0, plans_1.formatPrice)(plans_1.CREDIT_PACKS.initial.price)}`);
console.log(`   Validade: ${plans_1.CREDIT_PACKS.initial.validityDays} dias`);
console.log(`   Price ID: ${plans_1.CREDIT_PACKS.initial.stripePriceId}`);
console.log('');
console.log('📦 PADRÃO');
console.log(`   Créditos: ${plans_1.CREDIT_PACKS.standard.credits}`);
console.log(`   Preço: ${(0, plans_1.formatPrice)(plans_1.CREDIT_PACKS.standard.price)}`);
console.log(`   Validade: ${plans_1.CREDIT_PACKS.standard.validityDays} dias`);
console.log(`   Desconto: ${plans_1.CREDIT_PACKS.standard.discount}%`);
console.log(`   Price ID: ${plans_1.CREDIT_PACKS.standard.stripePriceId}`);
console.log('');
console.log('📦 GRANDE');
console.log(`   Créditos: ${plans_1.CREDIT_PACKS.large.credits}`);
console.log(`   Preço: ${(0, plans_1.formatPrice)(plans_1.CREDIT_PACKS.large.price)}`);
console.log(`   Validade: Sem expiração`);
console.log(`   Desconto: ${plans_1.CREDIT_PACKS.large.discount}%`);
console.log(`   Price ID: ${plans_1.CREDIT_PACKS.large.stripePriceId}`);
console.log('');
// Status final
if (validation.valid) {
    console.log('✅ Configuração válida! Pronto para ETAPA 3.\n');
    process.exit(0);
}
else {
    console.log('⚠️  Complete a configuração antes de prosseguir.\n');
    process.exit(1);
}
//# sourceMappingURL=validate-config.js.map