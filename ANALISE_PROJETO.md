# Análise do Projeto Ktirio AI - Componentes Reutilizáveis

## 📋 Sumário Executivo

Este relatório documenta todos os componentes, dependências e dados mockados do projeto Ktirio AI que podem ser reutilizados em uma implementação real.

---

## 1. COMPONENTES UI (shadcn/ui)

### 1.1 Componentes Disponíveis em [src/components/ui/](src/components/ui/)

**Total: 46 componentes shadcn/ui instalados**

#### Formulários e Inputs
- [accordion.tsx](src/components/ui/accordion.tsx) - Acordeão expansível
- [alert.tsx](src/components/ui/alert.tsx) - Alertas informativos
- [alert-dialog.tsx](src/components/ui/alert-dialog.tsx) - Diálogos modais de confirmação
- [button.tsx](src/components/ui/button.tsx) - Botões com variantes
- [checkbox.tsx](src/components/ui/checkbox.tsx) - Caixas de seleção
- [form.tsx](src/components/ui/form.tsx) - Sistema de formulários (react-hook-form)
- [input.tsx](src/components/ui/input.tsx) - Campos de texto
- [input-otp.tsx](src/components/ui/input-otp.tsx) - Input de código OTP
- [label.tsx](src/components/ui/label.tsx) - Labels para formulários
- [radio-group.tsx](src/components/ui/radio-group.tsx) - Grupo de radio buttons
- [select.tsx](src/components/ui/select.tsx) - Seletor dropdown
- [slider.tsx](src/components/ui/slider.tsx) - Controle deslizante
- [switch.tsx](src/components/ui/switch.tsx) - Toggle switch
- [textarea.tsx](src/components/ui/textarea.tsx) - Área de texto
- [toggle.tsx](src/components/ui/toggle.tsx) - Botão de alternância
- [toggle-group.tsx](src/components/ui/toggle-group.tsx) - Grupo de toggles

#### Navegação e Layout
- [breadcrumb.tsx](src/components/ui/breadcrumb.tsx) - Breadcrumb de navegação
- [navigation-menu.tsx](src/components/ui/navigation-menu.tsx) - Menu de navegação
- [menubar.tsx](src/components/ui/menubar.tsx) - Barra de menu
- [pagination.tsx](src/components/ui/pagination.tsx) - Paginação
- [sidebar.tsx](src/components/ui/sidebar.tsx) - Barra lateral
- [tabs.tsx](src/components/ui/tabs.tsx) - Abas de navegação
- [separator.tsx](src/components/ui/separator.tsx) - Separador visual

#### Overlays e Modais
- [dialog.tsx](src/components/ui/dialog.tsx) - Diálogos modais
- [drawer.tsx](src/components/ui/drawer.tsx) - Drawer lateral (vaul)
- [popover.tsx](src/components/ui/popover.tsx) - Popover flutuante
- [sheet.tsx](src/components/ui/sheet.tsx) - Sheet modal lateral
- [tooltip.tsx](src/components/ui/tooltip.tsx) - Tooltips informativos
- [hover-card.tsx](src/components/ui/hover-card.tsx) - Card ao passar o mouse
- [context-menu.tsx](src/components/ui/context-menu.tsx) - Menu de contexto
- [dropdown-menu.tsx](src/components/ui/dropdown-menu.tsx) - Menu dropdown

#### Data Display
- [avatar.tsx](src/components/ui/avatar.tsx) - Avatar de usuário
- [badge.tsx](src/components/ui/badge.tsx) - Badges e tags
- [card.tsx](src/components/ui/card.tsx) - Cards de conteúdo
- [table.tsx](src/components/ui/table.tsx) - Tabelas
- [chart.tsx](src/components/ui/chart.tsx) - Gráficos (recharts)
- [calendar.tsx](src/components/ui/calendar.tsx) - Calendário (react-day-picker)
- [carousel.tsx](src/components/ui/carousel.tsx) - Carrossel de imagens (embla)

#### Feedback
- [progress.tsx](src/components/ui/progress.tsx) - Barra de progresso
- [skeleton.tsx](src/components/ui/skeleton.tsx) - Loading skeleton
- [sonner.tsx](src/components/ui/sonner.tsx) - Toast notifications (sonner)

#### Utilitários
- [aspect-ratio.tsx](src/components/ui/aspect-ratio.tsx) - Controle de aspect ratio
- [collapsible.tsx](src/components/ui/collapsible.tsx) - Conteúdo colapsável
- [command.tsx](src/components/ui/command.tsx) - Command palette (cmdk)
- [resizable.tsx](src/components/ui/resizable.tsx) - Painéis redimensionáveis
- [scroll-area.tsx](src/components/ui/scroll-area.tsx) - Área de scroll customizada
- [utils.ts](src/components/ui/utils.ts) - Utilitário `cn()` para merge de classes
- [use-mobile.ts](src/components/ui/use-mobile.ts) - Hook para detectar mobile

---

## 2. COMPONENTES FUNCIONAIS PRINCIPAIS

### 2.1 Componentes de Galeria e Visualização

#### [Gallery.tsx](src/components/Gallery.tsx) ⭐ **PRINCIPAL**
**Props:**
```typescript
interface GalleryProps {
  onOpenProject: (projectId: string) => void;
  onCreateNewProject?: () => void;
  onOpenSettings: () => void;
  onOpenPricing?: () => void;
  onNavigateToWelcome?: () => void;
  onStartTour?: () => void;
  shouldOpenUpgradeModal?: boolean;
  upgradeModalContext?: 'feature' | 'projects' | 'trial' | 'credits';
  onUpgradeModalChange?: (isOpen: boolean) => void;
  isFirstTime?: boolean;
  onFirstProjectComplete?: () => void;
  onResetFirstTime?: () => void;
  uploadCompleted?: boolean;
}
```
**Dados Mockados:**
- `mockProjects` (linha 39-56): Array de 3 projetos de exemplo
- Email do usuário: "usuario@email.com" (linha 295)
- Sistema de créditos: 150/500 (linhas 265-266)

**Funcionalidades:**
- Sistema de navegação (Galeria, Favoritos, Arquivados)
- Busca de projetos
- Sistema de créditos visual
- Menu de contexto para cada projeto (Download, Duplicar, Excluir)
- Integração com UpgradeModal
- First-time user experience com checklist
- Tooltips contextuais progressivos

#### [Editor.tsx](src/components/Editor.tsx) ⭐ **PRINCIPAL**
**Props:**
```typescript
interface EditorProps {
  projectId: string | null;
  onBack: () => void;
  onOpenUpgradeModal?: (context: 'feature' | 'projects' | 'trial' | 'credits') => void;
  onUploadComplete?: () => void;
  shouldOpenUploadOnMount?: boolean;
  isFirstTimeUser?: boolean;
  onFirstProjectComplete?: () => void;
}
```
**Dados Mockados:**
- `mockVersions` (linhas 49-56): Histórico de versões
- Nome do projeto: "Sala de Estar Clássica" ou "Novo Projeto"
- Créditos: 1/5 (free tier) - linhas 96-97

**Funcionalidades:**
- Editor de canvas com ferramentas (Mover, Pincel, Borracha)
- Sistema de painéis colapsáveis (esquerda e direita)
- Upload de imagens
- Geração de imagens com prompt
- Histórico de versões
- Sistema de hints progressivos
- Debug panel (Ctrl+Shift+H)
- Modal de limite de créditos
- Progress checklist para first-time users

### 2.2 Empty States

#### [EmptyState.tsx](src/components/EmptyState.tsx) - **Componente Base Reutilizável**
```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryButton: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryLink?: {
    label: string;
    onClick: () => void;
  };
  ariaLabel?: string;
}
```

#### Variantes Implementadas:
1. [EmptyStateGallery.tsx](src/components/EmptyStateGallery.tsx) - Galeria vazia
2. [EmptyStateFolder.tsx](src/components/EmptyStateFolder.tsx) - Pasta vazia
3. [EmptyStateSearch.tsx](src/components/EmptyStateSearch.tsx) - Busca sem resultados

### 2.3 Skeletons de Loading

#### [SkeletonBox.tsx](src/components/SkeletonBox.tsx) - **Componente Base Reutilizável**
```typescript
interface SkeletonBoxProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}
```

#### Skeletons Específicos:
1. [GalleryGridSkeleton.tsx](src/components/GalleryGridSkeleton.tsx) - Grid de projetos
2. [ProjectCardSkeleton.tsx](src/components/ProjectCardSkeleton.tsx) - Card de projeto individual
3. [EditorLoadingSkeleton.tsx](src/components/EditorLoadingSkeleton.tsx) - Editor completo

### 2.4 Sistema de Notificações

#### [ToastProvider.tsx](src/components/ToastProvider.tsx) ⭐ **SISTEMA COMPLETO**
**Contexto React com funções:**
```typescript
interface ToastContextValue {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, description?: string, action?: ToastData['action']) => void;
  showError: (title: string, description?: string, action?: ToastData['action']) => void;
  showWarning: (title: string, description?: string, action?: ToastData['action']) => void;
  showInfo: (title: string, description?: string, action?: ToastData['action']) => void;
}
```
**Configurações:**
- MAX_TOASTS: 3
- Auto-dismiss: success/info (5s), warning (7s), error (manual)
- Usa `motion/react` para animações

### 2.5 Modais de Upgrade e Monetização

#### [UpgradeModal.tsx](src/components/UpgradeModal.tsx) ⭐ **MODAL PRINCIPAL DE CONVERSÃO**
**Props:**
```typescript
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'credits' | 'feature' | 'projects' | 'trial';
  onContinue?: (planId: string, billingPeriod: 'monthly' | 'yearly') => void;
  onError?: (message: string) => void;
}
```
**Dados Mockados (linhas 25-50):**
```typescript
const plans = [
  {
    id: 'starter',
    priceMonthly: 49,
    priceYearly: 470,
    features: ['100 créditos/mês', 'Qualidade alta', 'Sem marca d\'água']
  },
  {
    id: 'professional',
    priceMonthly: 89,
    priceYearly: 854,
    features: ['200 créditos/mês', 'Qualidade máxima', 'API + Integrações', 'Suporte prioritário']
  }
];
```
**Integração Stripe:**
- Mock de checkout session (desenvolvimento)
- API real em produção (linhas 106-189)

#### [BuyCreditsModal.tsx](src/components/BuyCreditsModal.tsx)
Modal para compra avulsa de créditos com pacotes pré-definidos

#### [CreditLimitModal.tsx](src/components/CreditLimitModal.tsx)
Modal exibido quando o usuário atinge o limite de créditos

#### [FeatureLockModal.tsx](src/components/FeatureLockModal.tsx)
Modal genérico para features bloqueadas (exportação, batch processing, etc)

### 2.6 Telas de Confirmação

#### [UpgradeSuccess.tsx](src/components/UpgradeSuccess.tsx)
Tela de confirmação após upgrade bem-sucedido

#### [UpgradeCanceled.tsx](src/components/UpgradeCanceled.tsx)
Tela quando o usuário cancela o upgrade

#### [PurchaseSuccessModal.tsx](src/components/PurchaseSuccessModal.tsx)
Modal de confirmação de compra de créditos

### 2.7 Onboarding e First-Time Experience

#### [WelcomeScreen.tsx](src/components/WelcomeScreen.tsx)
Tela de boas-vindas para novos usuários

#### [FeatureTour.tsx](src/components/FeatureTour.tsx)
Tour guiado das funcionalidades principais

#### [FirstProjectGuide.tsx](src/components/FirstProjectGuide.tsx)
Guia para criação do primeiro projeto

#### [ProgressChecklist.tsx](src/components/ProgressChecklist.tsx)
Checklist de progresso do primeiro projeto
```typescript
interface ChecklistProgress {
  createdProject: boolean;
  uploadedPhoto: boolean;
  selectedStyle: boolean;
  generatedImage: boolean;
}
```

#### [SuccessCelebration.tsx](src/components/SuccessCelebration.tsx)
Modal de celebração ao completar primeira geração

### 2.8 Sistema de Hints Progressivos

#### [ProgressiveHint.tsx](src/components/ProgressiveHint.tsx)
Componente base para hints contextuais

#### [ContextualTooltip.tsx](src/components/ContextualTooltip.tsx)
Tooltip contextual com múltiplos tipos

#### [CreditsWarningHint.tsx](src/components/CreditsWarningHint.tsx)
Aviso quando créditos estão acabando

#### [useProgressiveHints.ts](src/hooks/useProgressiveHints.ts)
Hook customizado para gerenciar estado dos hints (localStorage)

### 2.9 Banners e Paywalls

#### [TrialEndedBanner.tsx](src/components/TrialEndedBanner.tsx)
Banner persistente com múltiplas variantes:
- `trial-ended` - Trial expirado
- `credits-low` - Créditos baixos
- `plan-expired` - Plano expirado
- `payment-failed` - Falha no pagamento

#### [SoftPaywall.tsx](src/components/SoftPaywall.tsx)
Paywall soft com blur e variantes:
- `download` - Download de alta resolução
- `export-bulk` - Exportação em lote
- `advanced-tools` - Ferramentas avançadas
- `remove-watermark` - Remover marca d'água

### 2.10 Configurações

#### [Settings.tsx](src/components/Settings.tsx)
Tela principal de configurações com abas

**Sub-componentes:**
- [SettingsProfile.tsx](src/components/SettingsProfile.tsx)
- [SettingsPlanUsage.tsx](src/components/SettingsPlanUsage.tsx)
- [SettingsNotifications.tsx](src/components/SettingsNotifications.tsx)
- [SettingsSecurity.tsx](src/components/SettingsSecurity.tsx)
- [SettingsPrivacy.tsx](src/components/SettingsPrivacy.tsx)
- [SettingsBilling.tsx](src/components/SettingsBilling.tsx)
- [SettingsDeveloper.tsx](src/components/SettingsDeveloper.tsx) - Ferramentas de desenvolvimento

### 2.11 Página de Preços

#### [Pricing.tsx](src/components/Pricing.tsx) ⭐ **PÁGINA COMPLETA**
**Dados Mockados (linhas 75-154):**
```typescript
const plans = [
  {
    id: 'free',
    priceMonthly: 0,
    priceYearly: 0,
    credits: '10 créditos/mês',
    features: [/* 5 features */]
  },
  {
    id: 'starter',
    priceMonthly: 49,
    priceYearly: 470,
    credits: '100 créditos/mês',
    features: [/* 6 features */]
  },
  {
    id: 'professional',
    priceMonthly: 89,
    priceYearly: 854,
    credits: '300 créditos/mês',
    features: [/* 8 features */],
    isPopular: true
  },
  {
    id: 'enterprise',
    priceMonthly: 299,
    priceYearly: 2870,
    credits: 'Créditos ilimitados',
    features: [/* 10 features */]
  }
];
```

**Funcionalidades:**
- Toggle mensal/anual com desconto de 20%
- Tabela de comparação completa de features
- FAQ com accordion (10 perguntas)
- CTA final com gradiente

### 2.12 Utilitários de Imagem

#### [ImageWithFallback.tsx](src/components/figma/ImageWithFallback.tsx)
Componente de imagem com fallback automático

---

## 3. DEPENDÊNCIAS DO PROJETO

### 3.1 Dependências shadcn/ui (@radix-ui)

```json
{
  "@radix-ui/react-accordion": "^1.2.3",
  "@radix-ui/react-alert-dialog": "^1.1.6",
  "@radix-ui/react-aspect-ratio": "^1.1.2",
  "@radix-ui/react-avatar": "^1.1.3",
  "@radix-ui/react-checkbox": "^1.1.4",
  "@radix-ui/react-collapsible": "^1.1.3",
  "@radix-ui/react-context-menu": "^2.2.6",
  "@radix-ui/react-dialog": "^1.1.6",
  "@radix-ui/react-dropdown-menu": "^2.1.6",
  "@radix-ui/react-hover-card": "^1.1.6",
  "@radix-ui/react-label": "^2.1.2",
  "@radix-ui/react-menubar": "^1.1.6",
  "@radix-ui/react-navigation-menu": "^1.2.5",
  "@radix-ui/react-popover": "^1.1.6",
  "@radix-ui/react-progress": "^1.1.2",
  "@radix-ui/react-radio-group": "^1.2.3",
  "@radix-ui/react-scroll-area": "^1.2.3",
  "@radix-ui/react-select": "^2.1.6",
  "@radix-ui/react-separator": "^1.1.2",
  "@radix-ui/react-slider": "^1.2.3",
  "@radix-ui/react-slot": "^1.1.2",
  "@radix-ui/react-switch": "^1.1.3",
  "@radix-ui/react-tabs": "^1.1.3",
  "@radix-ui/react-toggle": "^1.1.2",
  "@radix-ui/react-toggle-group": "^1.1.2",
  "@radix-ui/react-tooltip": "^1.1.8"
}
```

### 3.2 Tailwind CSS e Utilitários

```json
{
  "class-variance-authority": "^0.7.1",
  "clsx": "*",
  "tailwind-merge": "*"
}
```

**Utilitário principal ([src/components/ui/utils.ts](src/components/ui/utils.ts)):**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3.3 Bibliotecas Complementares

```json
{
  "cmdk": "^1.1.1",                    // Command palette
  "embla-carousel-react": "^8.6.0",   // Carousel
  "input-otp": "^1.4.2",              // OTP input
  "lucide-react": "^0.487.0",         // Ícones
  "motion": "*",                       // Animações (Framer Motion)
  "next-themes": "^0.4.6",            // Dark mode
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-day-picker": "^8.10.1",      // Calendário
  "react-hook-form": "^7.55.0",       // Formulários
  "react-resizable-panels": "^2.1.7", // Painéis redimensionáveis
  "recharts": "^2.15.2",              // Gráficos
  "sonner": "^2.0.3",                 // Toast notifications
  "stripe": "*",                       // Pagamentos
  "vaul": "^1.1.2"                    // Drawer component
}
```

### 3.4 DevDependencies

```json
{
  "@types/node": "^20.10.0",
  "@vitejs/plugin-react-swc": "^3.10.2",
  "vite": "6.3.5"
}
```

---

## 4. DADOS MOCKADOS - ONDE SUBSTITUIR

### 4.1 Gallery.tsx
**Localização:** [src/components/Gallery.tsx](src/components/Gallery.tsx)

```typescript
// LINHA 39-56: Array de projetos
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Sala de Estar Clássica',
    date: '03/10/2025',
    thumbnail: exampleImage,
  },
  // ... mais 2 projetos
];

// LINHA 265-266: Sistema de créditos
<span className="text-gray-900">150</span>
<span className="text-xs text-gray-500">/ 500</span>

// LINHA 295: Email do usuário
<p className="text-xs text-gray-500">usuario@email.com</p>
```

**Substituir por:**
- API call: `GET /api/projects`
- API call: `GET /api/user/credits`
- API call: `GET /api/user/profile`

### 4.2 Editor.tsx
**Localização:** [src/components/Editor.tsx](src/components/Editor.tsx)

```typescript
// LINHA 49-56: Histórico de versões
const mockVersions: Version[] = [
  {
    id: '1',
    name: 'Imagem Original',
    timestamp: '18:36:31',
    thumbnail: exampleImage,
  },
];

// LINHA 73: Nome do projeto
const [projectName, setProjectName] = useState(
  projectId ? 'Sala de Estar Clássica' : 'Novo Projeto'
);

// LINHA 96-97: Sistema de créditos
const creditsUsed = 0;
const creditsTotal = 5; // Free tier
```

**Substituir por:**
- API call: `GET /api/projects/:id/versions`
- API call: `GET /api/projects/:id`
- API call: `GET /api/user/credits`

### 4.3 UpgradeModal.tsx
**Localização:** [src/components/UpgradeModal.tsx](src/components/UpgradeModal.tsx)

```typescript
// LINHA 25-50: Planos de assinatura
const plans: PlanOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 49,
    priceYearly: 470,
    features: ['100 créditos/mês', 'Qualidade alta', 'Sem marca d\'água']
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 89,
    priceYearly: 854,
    features: ['200 créditos/mês', 'Qualidade máxima', 'API + Integrações', 'Suporte prioritário'],
    isRecommended: true
  }
];

// LINHA 117-148: Mock de checkout Stripe
if (isDevelopment) {
  const result = await createCheckoutSession({...});
  console.log('🔧 DEV MODE - Mock Stripe Checkout Session Created');
}
```

**Substituir por:**
- API call: `GET /api/plans` (buscar planos do backend/Stripe)
- API call: `POST /api/create-checkout-session` (integração real Stripe)

### 4.4 Pricing.tsx
**Localização:** [src/components/Pricing.tsx](src/components/Pricing.tsx)

```typescript
// LINHA 75-154: Planos completos com features
const plans: Plan[] = [
  {
    id: 'free',
    priceMonthly: 0,
    priceYearly: 0,
    credits: '10 créditos/mês',
    features: [/* 5 features */]
  },
  {
    id: 'starter',
    priceMonthly: 49,
    priceYearly: 470,
    credits: '100 créditos/mês',
    features: [/* 6 features */]
  },
  // ... mais 2 planos
];
```

**Substituir por:**
- API call: `GET /api/plans` (com features completas)
- Considerar usar mesma fonte de dados do UpgradeModal

### 4.5 App.tsx
**Localização:** [src/App.tsx](src/App.tsx)

```typescript
// LINHA 23: Nome do usuário
const [userName, setUserName] = useState<string>('Usuário');

// LINHA 25: First-time user flag
const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

// LINHA 33: Créditos atuais
const [currentCredits, setCurrentCredits] = useState(2);

// LINHA 131: Nome de teste
setUserName('João Silva');
```

**Substituir por:**
- API call: `GET /api/user/profile` (obter dados reais do usuário)
- API call: `GET /api/user/onboarding-status`
- API call: `GET /api/user/credits`

### 4.6 SettingsBilling.tsx
**Localização:** [src/components/SettingsBilling.tsx](src/components/SettingsBilling.tsx)

```typescript
// Dados mockados de faturamento, histórico de pagamentos, método de pagamento
```

**Substituir por:**
- API call: `GET /api/billing/invoices`
- API call: `GET /api/billing/payment-methods`
- API call: `GET /api/billing/current-plan`

### 4.7 SettingsSecurity.tsx
**Localização:** [src/components/SettingsSecurity.tsx](src/components/SettingsSecurity.tsx)

```typescript
// Dados mockados de sessões ativas, logs de atividade
```

**Substituir por:**
- API call: `GET /api/security/sessions`
- API call: `GET /api/security/activity-log`

### 4.8 Imagens de Exemplo

**Localização:** Importadas via Figma assets
```typescript
// Gallery.tsx linha 3
import exampleImage from 'figma:asset/634d69ec8ea4cfc0901be0b298e71a0eee07ff3d.png';

// Editor.tsx linha 21
import exampleImage from 'figma:asset/ac70aaa98fd35bb0ee11d9225a3a8c0883ab8066.png';
```

**Substituir por:**
- URLs reais de CDN
- Sistema de upload de imagens do usuário

---

## 5. ESTRUTURA DE APIs SUGERIDA

### 5.1 Autenticação e Usuário
```
GET    /api/user/profile
GET    /api/user/credits
GET    /api/user/onboarding-status
PATCH  /api/user/profile
POST   /api/auth/logout
```

### 5.2 Projetos
```
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/versions
POST   /api/projects/:id/duplicate
```

### 5.3 Geração de Imagens
```
POST   /api/generate
GET    /api/generate/:id/status
POST   /api/projects/:id/upload
```

### 5.4 Planos e Pagamentos
```
GET    /api/plans
POST   /api/create-checkout-session
POST   /api/verify-checkout-session
GET    /api/billing/invoices
GET    /api/billing/payment-methods
POST   /api/billing/update-payment-method
POST   /api/credits/purchase
```

### 5.5 Segurança
```
GET    /api/security/sessions
DELETE /api/security/sessions/:id
GET    /api/security/activity-log
POST   /api/security/2fa/enable
POST   /api/security/2fa/verify
```

---

## 6. COMPONENTES TOTALMENTE REUTILIZÁVEIS

### ✅ Prontos para Uso Imediato (apenas trocar dados)

1. **Sistema de UI completo** - [src/components/ui/](src/components/ui/) (46 componentes)
2. **ToastProvider** - Sistema de notificações completo
3. **Empty States** - EmptyState.tsx + variantes
4. **Skeletons** - SkeletonBox.tsx + variantes específicas
5. **UpgradeModal** - Modal de conversão (trocar planos hardcoded)
6. **Pricing** - Página completa (trocar planos hardcoded)
7. **Settings** - Estrutura completa de configurações
8. **Sistema de Hints** - Progressive hints + hook customizado
9. **Onboarding Flow** - Welcome + Tour + FirstProject + Checklist
10. **Banners** - TrialEndedBanner + SoftPaywall

### ⚠️ Requerem Integração Moderada

1. **Gallery** - Substituir mockProjects por API real
2. **Editor** - Substituir mockVersions e integrar geração real
3. **BuyCreditsModal** - Integrar com Stripe real
4. **FeatureLockModal** - Conectar com lógica de permissões
5. **SettingsBilling** - Conectar com Stripe API

### 🔧 Requerem Desenvolvimento Backend

1. Sistema de geração de imagens (IA)
2. Upload e armazenamento de imagens (S3/CDN)
3. Webhooks do Stripe
4. Sistema de créditos
5. Autenticação e autorização
6. Sistema de pastas/tags

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Setup Básico
- [ ] Copiar pasta [src/components/ui/](src/components/ui/) completa
- [ ] Instalar todas as dependências do package.json
- [ ] Configurar Tailwind CSS
- [ ] Configurar Vite/build tool
- [ ] Setup de variáveis de ambiente

### Fase 2: Sistema de Autenticação
- [ ] Implementar backend de auth
- [ ] Criar API endpoints de usuário
- [ ] Conectar WelcomeScreen com dados reais
- [ ] Implementar logout e sessões

### Fase 3: Galeria e Projetos
- [ ] Criar backend de projetos (CRUD)
- [ ] Implementar upload de imagens
- [ ] Conectar Gallery com API real
- [ ] Implementar busca e filtros
- [ ] Sistema de pastas/tags

### Fase 4: Editor e Geração
- [ ] Integrar serviço de geração de IA
- [ ] Implementar API de geração
- [ ] Conectar Editor com backend
- [ ] Sistema de histórico de versões
- [ ] Download de imagens

### Fase 5: Monetização
- [ ] Setup Stripe account
- [ ] Criar produtos/preços no Stripe
- [ ] Implementar webhooks
- [ ] Conectar UpgradeModal com Stripe real
- [ ] Sistema de créditos no backend
- [ ] Implementar BuyCreditsModal

### Fase 6: Configurações
- [ ] Implementar APIs de settings
- [ ] Sistema de billing (invoices, payment methods)
- [ ] Sistema de segurança (2FA, sessions)
- [ ] Notificações e preferências

### Fase 7: Refinamento
- [ ] Sistema de hints (localStorage ou backend)
- [ ] Analytics e tracking
- [ ] Error handling e retry logic
- [ ] Testes automatizados
- [ ] Otimização de performance

---

## 8. OBSERVAÇÕES IMPORTANTES

### 8.1 Boas Práticas Identificadas

1. **Componentização Excelente** - Componentes pequenos e reutilizáveis
2. **TypeScript Rigoroso** - Todas as interfaces bem definidas
3. **Acessibilidade** - Uso de aria-labels e roles
4. **Responsive Design** - Classes Tailwind para mobile/tablet/desktop
5. **Loading States** - Skeletons bem implementados
6. **Error Handling** - Toast notifications para feedback
7. **Progressive Enhancement** - First-time user experience bem pensada

### 8.2 Pontos de Atenção

1. **Dados Hardcoded** - Muitos valores fixos que precisam vir de API
2. **Stripe Integration** - Atualmente em modo mock/dev
3. **Autenticação** - Não implementada (assumido que usuário está logado)
4. **Persistência** - localStorage usado para hints, considerar backend
5. **Validações** - Algumas validações podem estar faltando
6. **Internacionalização** - Todos os textos em PT-BR hardcoded

### 8.3 Segurança

1. Nunca expor chaves de API no frontend
2. Validar todas as inputs no backend
3. Implementar rate limiting nas APIs
4. Usar HTTPS em produção
5. Validar webhooks do Stripe com assinatura
6. Sanitizar uploads de imagens

---

## 9. RECURSOS ADICIONAIS

### Documentação Relacionada
- [shadcn/ui docs](https://ui.shadcn.com/)
- [Radix UI primitives](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [React Hook Form](https://react-hook-form.com/)
- [Framer Motion](https://www.framer.com/motion/)

### Arquivos de Documentação no Projeto
- [FirstProjectExperience.md](src/components/FirstProjectExperience.md)
- [ProgressiveHints.md](src/components/ProgressiveHints.md)
- [FeatureTour.md](src/components/FeatureTour.md)
- [SoftPaywall.md](src/components/SoftPaywall.md)
- [TrialEndedBanner.md](src/components/TrialEndedBanner.md)
- Diversos arquivos .md em [src/components/](src/components/)

---

## 10. RESUMO EXECUTIVO

### ✅ O que está PRONTO para reutilizar

- **46 componentes shadcn/ui** completamente funcionais
- **Sistema de notificações** (ToastProvider) 100% pronto
- **3 Empty States** + componente base
- **3 Skeletons** + componente base
- **Modal de Upgrade** com Stripe (precisa trocar IDs de produtos)
- **Página de Pricing** completa (precisa trocar planos)
- **Sistema de Settings** com 6 abas
- **Onboarding completo** (Welcome, Tour, FirstProject, Checklist)
- **Sistema de Hints progressivos** com hook customizado
- **Banners e Paywalls** totalmente funcionais

### ⚠️ O que precisa de INTEGRAÇÃO

- **Gallery**: Trocar mockProjects por API
- **Editor**: Trocar mockVersions e integrar IA real
- **Stripe**: Conectar com conta real e webhooks
- **Autenticação**: Implementar sistema de login/logout
- **Upload de imagens**: Integrar com S3/CDN
- **Sistema de créditos**: Backend para gerenciar saldo

### 📊 Estatísticas

- **Total de componentes UI**: 46
- **Total de componentes funcionais**: ~50
- **Dependências @radix-ui**: 26
- **Linhas de código analisadas**: ~15.000+
- **Dados mockados identificados**: 8 arquivos principais
- **APIs a implementar**: ~25 endpoints

---

**Relatório gerado em:** 2025-10-06
**Versão do projeto:** 0.1.0
**Framework:** React 18.3.1 + Vite 6.3.5 + TypeScript
