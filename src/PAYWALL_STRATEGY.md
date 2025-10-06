# Estratégia de Paywall - Ktírio AI

## Visão Geral

O Ktírio AI implementa uma estratégia híbrida de monetização com **3 tipos de paywalls** diferentes, cada um otimizado para contextos específicos. Esta abordagem maximiza conversão enquanto mantém uma experiência de usuário positiva.

---

## 1. HARD PAYWALL (Feature Lock Modal)

### Quando Usar
- Features que **não podem ser previewadas**
- Funcionalidades core do produto
- Recursos técnicos (API, webhooks, white label)
- Funcionalidades colaborativas

### Características
- ❌ **Bloqueio total** - Usuário não acessa nada
- 🔒 **Modal obrigatório** - Interrompe fluxo
- 📊 **Lista de benefícios** - Educacional
- 💰 **Preview de preços** - Transparência

### Componente
`FeatureLockModal.tsx`

### Features Bloqueadas
1. **API Access** - Plano Enterprise
2. **Batch Processing** - Plano Professional
3. **White Label** - Plano Enterprise
4. **Collaboration** - Plano Professional

### Conversão
- **Taxa:** Baixa-Média (15-25%)
- **Motivo:** Usuário não vê valor antes de pagar
- **Vantagem:** Protege features premium

### Exemplo
```typescript
// Usuário clica em "API Access" no Settings
<FeatureLockModal
  feature="api"
  isOpen={true}
  onClose={() => setIsOpen(false)}
  onUpgrade={() => navigateToPricing()}
/>
```

---

## 2. SOFT PAYWALL (Preview Limitado)

### Quando Usar
- Features que **podem ser previewadas**
- Upgrades de qualidade (resolução, formato)
- Recursos visuais
- Remoção de limitações

### Características
- ✅ **Preview visível** - Usuário vê resultado
- 🔍 **Limitação visual** - Blur, watermark, baixa qualidade
- 🎯 **CTA contextual** - Upgrade no momento certo
- 📈 **Comparação clara** - Antes vs depois

### Componente
`SoftPaywall.tsx`

### Variações

#### A. Alta Resolução (Blur)
```typescript
<SoftPaywall
  variant="high-resolution"
  previewImage={url}
  currentResolution="1024px"
  lockedResolution="4096px"
/>
```
- Preview com `blur(8px)` + `opacity: 0.7`
- Unlock card centralizado
- Comparação: 1024px (Free) vs 4096px (Pro)

#### B. Batch Processing
```typescript
<SoftPaywall
  variant="batch-processing"
  selectedCount={10}
  previewImages={[img1, img2, img3]}
/>
```
- Mostra primeiras 3 imagens
- Restante com "+7 mais" blur
- Lista de benefícios (economia de tempo, fila prioritária)

#### C. Watermark Removal
```typescript
<SoftPaywall
  variant="watermark-removal"
  previewImage={url}
>
  <img src={url} />
</SoftPaywall>
```
- Imagem completa + marca d'água "Ktírio AI"
- Hover: overlay com CTA
- Click: modal comparativo

### Conversão
- **Taxa:** Média-Alta (30-45%)
- **Motivo:** Usuário vê valor do resultado
- **Vantagem:** Menos frustração, mais conversão

### Features com Soft Paywall
1. **Export 4K** - Free: 1024px, Pro: 4096px
2. **Batch Processing** - Free: 1 por vez, Pro: até 50
3. **No Watermark** - Free: com marca, Paid: sem marca
4. **Premium Formats** - Free: PNG, Pro: PSD/AI/SVG

---

## 3. INFORMATIONAL BARRIERS (Banners & Modals)

### Quando Usar
- **Limites de créditos**
- **Trial expirado**
- **Pagamento falhou**
- **Avisos temporais**

### Características
- ℹ️ **Informativo** - Não bloqueia imediatamente
- 🔔 **Notificação persistente** - Banner sticky
- ⏰ **Dismissível** - Usuário pode adiar
- 🎯 **Acionável** - CTA direto para solução

### Componentes

#### Trial Ended Banner
```typescript
<TrialEndedBanner
  variant="trial-ended"
  onCtaClick={() => navigate('/pricing')}
  onDismiss={() => hideForToday()}
/>
```

**Variantes:**
- `trial-ended` - Período grátis acabou
- `credits-low` - Alerta de créditos baixos
- `plan-expired` - Assinatura expirou
- `payment-failed` - Problema com cartão

#### Credit Limit Modal
```typescript
<CreditLimitModal
  isOpen={credits === 0}
  remainingCredits={0}
  totalCredits={200}
  onUpgrade={() => navigate('/pricing')}
/>
```

### Conversão
- **Taxa:** Variável (20-60%)
- **Motivo:** Depende da urgência
- **Vantagem:** Não interrompe uso imediato

---

## Matriz de Decisão

| Feature | Tipo de Paywall | Motivo |
|---------|-----------------|--------|
| **API Access** | Hard (Feature Lock) | Não pode ser previewado |
| **White Label** | Hard (Feature Lock) | Recurso técnico |
| **Collaboration** | Hard (Feature Lock) | Requer infraestrutura |
| **Export 4K** | Soft (High-Res Blur) | Preview tem valor |
| **Batch Processing** | Soft (Batch Preview) | Mostra economiade tempo |
| **No Watermark** | Soft (Watermark) | Comparação lado a lado |
| **Premium Formats** | Soft (Format Preview) | Mostra diferença |
| **0 Créditos** | Informational (Credit Modal) | Limite de uso |
| **Trial Ended** | Informational (Banner) | Alerta temporal |
| **Payment Failed** | Informational (Banner) | Problema técnico |

---

## Estratégia por Plano

### FREE PLAN
**Limites:**
- 5 créditos/mês
- Export até 1024px
- Com watermark "Ktírio AI"
- Sem batch processing
- Sem API

**Paywalls Encontrados:**
- ✅ Soft: Alta Resolução (ao exportar >1024px)
- ✅ Soft: Watermark (em todos os resultados)
- ✅ Hard: Batch Processing
- ✅ Hard: API Access
- ⚠️ Credit Limit Modal (ao atingir 0)

**Conversão Esperada:** 8-12% → Starter

---

### STARTER PLAN (R$ 39/mês)
**Limites:**
- 100 créditos/mês
- Export até 2048px
- Sem watermark ✓
- Sem batch processing
- Sem API

**Paywalls Encontrados:**
- ✅ Soft: Alta Resolução 4K (ao exportar >2048px)
- ✅ Hard: Batch Processing
- ✅ Hard: API Access
- ⚠️ Credit Limit Modal (ao atingir 0)

**Conversão Esperada:** 15-20% → Professional

---

### PROFESSIONAL PLAN (R$ 89/mês)
**Limites:**
- 500 créditos/mês
- Export 4K (4096px) ✓
- Sem watermark ✓
- Batch processing (até 50) ✓
- Sem API

**Paywalls Encontrados:**
- ✅ Hard: API Access
- ✅ Hard: White Label
- ⚠️ Credit Limit Modal (ao atingir 0)

**Conversão Esperada:** 5-8% → Enterprise

---

### ENTERPRISE PLAN (Custom)
**Sem Limites:**
- Créditos ilimitados
- Tudo do Professional ✓
- API Access ✓
- White Label ✓
- Suporte dedicado ✓

**Paywalls:** Nenhum

---

## Funil de Conversão

```
FREE (10.000 usuários)
↓ (10% conversão)
STARTER (1.000 usuários) - R$ 39/mês = R$ 39.000 MRR
↓ (18% conversão)
PROFESSIONAL (180 usuários) - R$ 89/mês = R$ 16.020 MRR
↓ (6% conversão)
ENTERPRISE (11 usuários) - R$ 500/mês = R$ 5.500 MRR
─────────────────────────────
TOTAL MRR: R$ 60.520
```

---

## Jornada do Usuário

### Semana 1 (Free)
1. **Cadastro** → Welcome Screen + Feature Tour
2. **Primeiro projeto** → First Project Guide
3. **Gera 3 imagens** → Vê watermark (Soft Paywall)
4. **Tenta exportar 4K** → Vê blur (Soft Paywall)
5. **5 créditos usados** → Credit Limit Modal

### Semana 2 (Conversão)
6. **Trial Ended Banner** → Aparece no topo
7. **Clica "Ver planos"** → Pricing Page
8. **Upgrade para Starter** → R$ 39/mês
9. **Sucesso!** → UpgradeSuccess + confetti

### Mês 2 (Upsell)
10. **100 créditos usados** → Tenta batch processing
11. **Hard Paywall** → Feature Lock Modal
12. **Vê benefícios** → "Economize 80% do tempo"
13. **Upgrade para Professional** → R$ 89/mês

### Mês 6 (Enterprise)
14. **500 créditos/mês** → Volume alto consistente
15. **Tenta API** → Hard Paywall (API Access)
16. **Fala com vendas** → Custom pricing
17. **Upgrade para Enterprise** → R$ 500+/mês

---

## Métricas de Sucesso

### Por Paywall

**Hard Paywall (Feature Lock):**
- Impressions: quantas vezes mostrado
- Click-through rate: % que clica "Ver planos"
- Conversion rate: % que completa upgrade
- Time to dismiss: tempo médio até fechar

**Soft Paywall:**
- Preview engagement: interação com preview
- CTA click rate: % que clica CTA
- Conversion rate: % que faz upgrade
- Variant performance: qual variação converte melhor

**Informational (Banners):**
- Banner impressions: visualizações
- Dismiss rate: % que fecha sem ação
- CTA click rate: % que clica
- Conversion rate: % que completa ação
- Recovery rate: % que resolve problema (payment failed)

### Globais

```
Conversion Rate Total:
- Free → Paid: 10-15%
- Starter → Professional: 15-20%
- Professional → Enterprise: 5-8%

Average Time to Convert:
- Free → Starter: 14 dias
- Starter → Professional: 60 dias
- Professional → Enterprise: 180 dias

Churn Rate por Plano:
- Starter: 8-12% mensal
- Professional: 4-6% mensal
- Enterprise: <2% mensal
```

---

## A/B Testing Roadmap

### Q1 2025

**Test 1: Soft Paywall Blur Intensity**
- Control: blur(8px)
- Variant A: blur(4px)
- Variant B: blur(12px)
- Metric: Conversion rate

**Test 2: CTA Copy (High-Res)**
- Control: "Desbloquear agora"
- Variant A: "Ver planos"
- Variant B: "Upgrade para 4K"
- Metric: Click-through rate

**Test 3: Banner Timing**
- Control: Aparece no dia 8 do trial
- Variant A: Aparece no dia 6
- Variant B: Aparece no dia 10
- Metric: Conversion rate

### Q2 2025

**Test 4: Watermark Position**
- Control: Canto inferior direito
- Variant A: Centro inferior
- Variant B: Diagonal
- Metric: Upgrade rate

**Test 5: Feature Lock Benefits**
- Control: 3 benefícios
- Variant A: 5 benefícios
- Variant B: 3 benefícios + social proof
- Metric: Conversion rate

**Test 6: Pricing Display**
- Control: Preço mensal
- Variant A: Preço anual com desconto
- Variant B: Economia estimada
- Metric: Upgrade completion

---

## Prevenção de Churn

### Trigger Points

**Credit Usage:**
```typescript
if (credits <= 0) {
  // Mostrar Credit Limit Modal
  showPaywall('credit-limit');
}

if (credits / totalCredits <= 0.2) {
  // Mostrar Credits Low Banner
  showBanner('credits-low');
}
```

**Plan Expiration:**
```typescript
const daysUntilExpiry = getDaysUntilExpiry();

if (daysUntilExpiry === 7) {
  sendEmail('plan-expiring-soon');
}

if (daysUntilExpiry === 0) {
  showBanner('plan-expired');
}
```

**Payment Failed:**
```typescript
if (paymentFailed) {
  showBanner('payment-failed');
  sendEmail('payment-failed-urgent');
  // Retry em 3 dias
  scheduleRetry(3);
}
```

---

## Implementação Técnica

### State Management

```typescript
// App.tsx
const [paywallState, setPaywallState] = useState({
  hard: null,  // FeatureType | null
  soft: null,  // SoftPaywallVariant | null
  banner: null, // BannerVariant | null
});

const showHardPaywall = (feature: FeatureType) => {
  setPaywallState(prev => ({ ...prev, hard: feature }));
};

const showSoftPaywall = (variant: SoftPaywallVariant) => {
  setPaywallState(prev => ({ ...prev, soft: variant }));
};

const showBanner = (variant: BannerVariant) => {
  setPaywallState(prev => ({ ...prev, banner: variant }));
};
```

### Priority System

Se múltiplos paywalls precisam aparecer:

1. **Hard Paywall** (z-index: 1000) - Mais alto
2. **Soft Paywall** (z-index: 1000) - Mesmo nível, exclusivo
3. **Banner** (z-index: 999) - Pode coexistir com outros

Lógica:
```typescript
// Apenas 1 modal por vez
if (paywallState.hard) return <FeatureLockModal />;
if (paywallState.soft) return <SoftPaywall />;

// Banner pode aparecer junto com modais (mas não deve)
if (paywallState.banner) return <TrialEndedBanner />;
```

---

## Roadmap de Features Pagas

### 2025 Q1
- [x] Hard Paywall (Feature Lock)
- [x] Soft Paywall (3 variações)
- [x] Trial Ended Banner
- [x] Credit Limit Modal
- [ ] Usage Analytics Dashboard

### 2025 Q2
- [ ] Team Collaboration (Hard Paywall)
- [ ] Custom Branding (Hard Paywall)
- [ ] Video Export (Soft Paywall)
- [ ] Advanced AI Models (Soft Paywall)

### 2025 Q3
- [ ] White Label (Hard Paywall)
- [ ] API v2 (Hard Paywall)
- [ ] Bulk Operations (Soft Paywall)
- [ ] Priority Queue (Informational)

### 2025 Q4
- [ ] Enterprise SSO (Hard Paywall)
- [ ] Custom Integrations (Hard Paywall)
- [ ] Advanced Analytics (Soft Paywall)

---

## Conclusão

A estratégia híbrida de paywalls do Ktírio AI balanceia:

✅ **Conversão** - Soft paywalls maximizam upgrade rate  
✅ **Proteção** - Hard paywalls garantem features premium  
✅ **Retenção** - Informational barriers previnem churn  
✅ **UX** - Usuário vê valor antes de decidir  

**Resultado esperado:**
- 10-15% conversion Free → Paid
- R$ 60k+ MRR com 10k usuários
- <6% churn rate médio
- 4.2 CLTV/CAC ratio
