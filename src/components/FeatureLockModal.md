# Feature Lock Modal

## Visão Geral

Modal que aparece quando um usuário tenta acessar uma funcionalidade disponível apenas em planos superiores (Professional ou Business). Apresenta os benefícios da feature de forma clara e incentiva o upgrade.

## Quando Aparece

- Usuário clica em feature bloqueada (API, Batch Processing, White Label, Colaboração)
- Usuário no plano Free tenta acessar recurso premium
- Sistema detecta ausência de permissão para feature específica

## Componente

**Arquivo:** `/components/FeatureLockModal.tsx`

### Props

```typescript
interface FeatureLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureType; // 'api' | 'batch' | 'whitelabel' | 'collaboration'
  onUpgrade: () => void;
  onViewAllPlans: () => void;
}
```

### Feature Types

```typescript
type FeatureType = 'api' | 'batch' | 'whitelabel' | 'collaboration';
```

## Design System

### Modal Container

- **Width:** 480px
- **Background:** #FFFFFF
- **Border-radius:** 24px
- **Shadow:** 0 20px 40px rgba(0,0,0,0.15)
- **Padding:** 0 (interno por seção)

### Header Section

**Container:**
- Padding: 32px 32px 24px 32px
- Background: linear-gradient(135deg, #FAFAFA → #FFFFFF)
- Border-bottom: 1px solid #E9EBEF

**Close Button:**
- Position: absolute top-right (16px, 16px)
- Hover: bg-gray-100

**Icon Container:**
- Size: 64x64px
- Background: #FFFFFF
- Border: 2px solid #E9EBEF
- Border-radius: 16px
- Shadow: 0 4px 12px rgba(0,0,0,0.06)

**Badge:**
- Background: #030213
- Text: "PROFESSIONAL" ou "BUSINESS"
- Font: Inter Bold 11px
- Border-radius: 9999px (pill)

**Typography:**
- Título: 22px Bold, #030213
- Descrição: 14px Regular, #717182

### Body Section

**Container:**
- Padding: 24px 32px

**Benefits List:**
- Título: "O que você ganha:"
- Items: Check icon (#10B981) + Text (14px, #252525)
- Gap: 12px entre itens

**Price Preview Card:**
- Padding: 16px
- Background: #FAFAFA
- Border-radius: 10px
- Layout: flex horizontal, justify-between

### Footer Section

**Container:**
- Padding: 24px 32px
- Border-top: 1px solid #E9EBEF

**CTAs:**
- Layout: flex horizontal, gap 12px
- Primary: 60% width, dark background
- Secondary: 40% width, outline style
- Height: 48px

## Configuração por Feature

### API de Integração

**Icon:** Code  
**Plano:** Professional (R$ 89/mês)  
**Benefícios:**
- Acesso completo à REST API
- 10.000 requisições/mês
- Webhooks inclusos
- Documentação técnica completa

### Processamento em Lote (Batch)

**Icon:** Layers  
**Plano:** Professional (R$ 89/mês)  
**Benefícios:**
- Processar até 50 imagens simultaneamente
- Fila de prioridade
- Notificações de conclusão
- Economia de tempo significativa

### White Label

**Icon:** Palette  
**Plano:** Business (R$ 189/mês)  
**Benefícios:**
- Remover marca Ktírio
- Logo personalizado
- Domínio customizado
- Branding completo da empresa

### Colaboração em Equipe

**Icon:** Users  
**Plano:** Professional (R$ 89/mês)  
**Benefícios:**
- Até 10 membros na equipe
- Compartilhamento de projetos
- Comentários e feedback
- Permissões granulares

## Integração

### Em Settings (Developer)

```typescript
const [featureLockModal, setFeatureLockModal] = useState({
  isOpen: false,
  feature: null as FeatureType | null
});

const handleFeatureLock = (feature: FeatureType) => {
  setFeatureLockModal({ isOpen: true, feature });
};

// Render
<FeatureLockModal
  isOpen={featureLockModal.isOpen}
  onClose={() => setFeatureLockModal({ isOpen: false, feature: null })}
  feature={featureLockModal.feature!}
  onUpgrade={() => onOpenUpgradeModal('feature')}
  onViewAllPlans={() => onOpenPricing()}
/>
```

### Em Outros Componentes

Qualquer componente que tenha features bloqueadas pode usar:

```typescript
import FeatureLockModal, { FeatureType } from './FeatureLockModal';

// Ao tentar acessar feature
const handleAccessFeature = (feature: FeatureType) => {
  const userPlan = getCurrentUserPlan(); // 'free' | 'professional' | 'business'
  
  if (!hasAccess(userPlan, feature)) {
    setFeatureLockModal({ isOpen: true, feature });
  } else {
    // Proceder com a feature
  }
};
```

## Fluxos de Ação

### 1. Fazer Upgrade Agora
- Fecha modal
- Chama `onUpgrade()`
- Abre UpgradeModal com contexto 'feature'
- Usuário procede com checkout

### 2. Ver Todos os Planos
- Fecha modal
- Chama `onViewAllPlans()`
- Navega para Pricing page
- Usuário compara planos

### 3. Fechar (X ou overlay)
- Fecha modal
- Volta ao estado anterior
- Feature permanece bloqueada

### 4. Fale com Vendas
- Abre chat de suporte (futuro)
- Ou redireciona para página de contato
- Para esclarecer dúvidas sobre planos

## Lógica de Permissões

### Matriz de Features por Plano

| Feature       | Free | Professional | Business | Enterprise |
|--------------|------|--------------|----------|------------|
| API          | ❌   | ✅           | ✅       | ✅         |
| Batch        | ❌   | ✅           | ✅       | ✅         |
| White Label  | ❌   | ❌           | ✅       | ✅         |
| Colaboração  | ❌   | ✅ (10)      | ✅ (50)  | ✅ (Ilimitado) |

### Exemplo de Verificação

```typescript
const hasFeatureAccess = (userPlan: string, feature: FeatureType): boolean => {
  const access = {
    api: ['professional', 'business', 'enterprise'],
    batch: ['professional', 'business', 'enterprise'],
    whitelabel: ['business', 'enterprise'],
    collaboration: ['professional', 'business', 'enterprise']
  };
  
  return access[feature].includes(userPlan);
};
```

## Testes (Developer Tools)

No painel Developer em Settings, há botões para testar cada tipo de Feature Lock:

1. **💻 API de Integração** - Testa bloqueio de API
2. **⚡ Batch Processing** - Testa bloqueio de processamento em lote
3. **🎨 White Label** - Testa bloqueio de white label
4. **👥 Colaboração** - Testa bloqueio de colaboração

## Variações Futuras

### Features Adicionais

Podem ser adicionadas facilmente ao `featureConfig`:

```typescript
{
  advanced_analytics: {
    icon: BarChart,
    title: 'Analytics Avançado',
    plan: 'BUSINESS',
    planPrice: 'R$ 189/mês',
    benefits: [
      'Dashboards personalizados',
      'Relatórios exportáveis',
      'Métricas em tempo real',
      'Integração com BI tools'
    ]
  }
}
```

### Customização de Preços

Para mostrar preços diferentes (ex: promocional):

```typescript
<FeatureLockModal
  feature="api"
  customPrice="R$ 79/mês"
  discount="Promoção limitada!"
/>
```

## Acessibilidade

- Modal fecha com ESC
- Focus trap dentro do modal
- Todas as ações acessíveis via teclado
- Labels descritivos para screen readers
- Contraste adequado (WCAG AA)

## Animações

- **Overlay:** fadeIn (200ms)
- **Container:** slideUp (300ms)
- **Hover:** Smooth transitions em botões
- **Close:** Reverso das animações de entrada

## Z-index

- Modal: 1000
- Garante que fica acima de todo conteúdo
- Abaixo apenas de tooltips críticos ou notificações

## Mobile Responsiveness

- Max-width: 480px
- Margin lateral: 16px (mx-4)
- Scrollable em telas pequenas
- Botões podem empilhar verticalmente se necessário

## Observações

- **Conversão:** Modal focado em conversão, não em bloqueio
- **Clareza:** Benefícios claros e concisos
- **Urgência:** Badge "Economize 20%" cria senso de oportunidade
- **Opções:** Múltiplos caminhos (upgrade, comparar, contato)
- **Não invasivo:** Fácil de fechar, mas persuasivo
