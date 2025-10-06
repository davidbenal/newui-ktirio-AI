# UpgradeModal Component

## Descrição
Modal de upgrade que aparece quando o usuário atinge limites do plano. Possui 4 contextos diferentes com ícones, títulos e mensagens customizadas.

## Uso Básico

```tsx
import UpgradeModal from './components/UpgradeModal';

function MyComponent() {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalContext, setUpgradeModalContext] = useState('credits');

  return (
    <>
      <button onClick={() => {
        setUpgradeModalContext('credits');
        setUpgradeModalOpen(true);
      }}>
        Abrir Modal
      </button>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        context={upgradeModalContext}
        onContinue={(planId, billingPeriod) => {
          console.log('Plano selecionado:', planId, billingPeriod);
          // Redirecionar para pagamento
        }}
      />
    </>
  );
}
```

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `isOpen` | boolean | Controla se o modal está aberto |
| `onClose` | () => void | Callback chamado ao fechar o modal |
| `context` | 'credits' \| 'feature' \| 'projects' \| 'trial' | Contexto do modal (opcional, padrão: 'credits') |
| `onContinue` | (planId: string, billingPeriod: 'monthly' \| 'yearly') => void | Callback ao confirmar (opcional) |
| `onError` | (message: string) => void | Callback para tratar erros (opcional) |

## Contextos Disponíveis

### 1. Credits (Créditos Acabaram)
```tsx
context="credits"
```
- **Ícone:** Zap (raio)
- **Título:** "Faça upgrade para continuar"
- **Descrição:** "Você atingiu o limite do plano Free"
- **Alert:** "0 de 5 créditos restantes"

### 2. Feature (Feature Bloqueada)
```tsx
context="feature"
```
- **Ícone:** Lock (cadeado)
- **Título:** "Esta feature é exclusiva"
- **Descrição:** "Disponível nos planos Starter e Professional"
- **Alert:** "Recurso bloqueado"

### 3. Projects (Limite de Projetos)
```tsx
context="projects"
```
- **Ícone:** FolderX
- **Título:** "Limite de projetos atingido"
- **Descrição:** "Faça upgrade para criar mais projetos"
- **Alert:** "1 de 1 projetos ativos"

### 4. Trial (Trial Finalizado)
```tsx
context="trial"
```
- **Ícone:** Clock (relógio)
- **Título:** "Seu período de teste acabou"
- **Descrição:** "Continue aproveitando com um plano pago"
- **Alert:** "Trial finalizado"

## Funcionalidades

- ✅ 4 contextos diferentes com ícones e mensagens customizadas
- ✅ Toggle entre billing mensal e anual (com badge de -20%)
- ✅ Seleção de plano com radio buttons
- ✅ Badge "Recomendado" no plano Professional
- ✅ Cálculo automático de economia no plano anual
- ✅ Integração com Stripe Checkout
- ✅ Loading state durante criação da sessão de checkout
- ✅ Modo desenvolvimento com mock API
- ✅ Tratamento de erros com callback
- ✅ Animações de entrada (fadeIn + slideUp)
- ✅ Backdrop blur
- ✅ Totalmente responsivo
- ✅ Fechar ao clicar fora (overlay)
- ✅ Botão de fechar (X) no canto superior direito

## Planos Disponíveis

### Starter
- R$ 49/mês (R$ 470/ano)
- 100 créditos/mês
- Qualidade alta
- Sem marca d'água

### Professional (Recomendado)
- R$ 89/mês (R$ 854/ano)
- 200 créditos/mês
- Qualidade máxima
- API + Integrações
- Suporte prioritário

## Customização

Para adicionar novos contextos, edite o objeto `contextConfig` em `/components/UpgradeModal.tsx`:

```tsx
const contextConfig = {
  seu_contexto: {
    icon: SeuIcone,
    title: 'Seu Título',
    description: 'Sua descrição',
    alertTitle: 'Título do alert',
    alertDescription: 'Descrição do alert'
  }
};
```

## Design System

- **Overlay:** rgba(0,0,0,0.6) com backdrop-filter blur(4px)
- **Container:** 560px width, rounded-3xl, box-shadow elevado
- **Ícone Principal:** Gradiente de #030213 a #252525
- **Alert Box:** Background amarelo rgba(245, 158, 11, 0.1)
- **Planos:** Cards com border de 2px, hover states
- **Footer:** Background #FAFAFA, border-top #E9EBEF

## Animações

As animações estão definidas em `/styles/globals.css`:

- **fadeIn:** 200ms - Fade do overlay
- **slideUp:** 300ms - Slide up do modal (20px)

## Integração com Stripe

### Desenvolvimento

No modo desenvolvimento (localhost ou Figma), o modal usa uma API mock que simula a criação de uma sessão de checkout. Isso permite testar a funcionalidade sem precisar de credenciais do Stripe.

### Produção

Em produção, o modal faz uma requisição POST para `/api/create-checkout-session` com os seguintes parâmetros:

```typescript
{
  planId: 'starter' | 'professional',
  billingPeriod: 'monthly' | 'yearly',
  successUrl: 'https://app.ktirio.ai/upgrade/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: 'https://app.ktirio.ai/upgrade/canceled'
}
```

A API deve retornar:

```typescript
{
  checkout_url: string,  // URL do Stripe Checkout
  session_id: string     // ID da sessão criada
}
```

O usuário será então redirecionado para a página de checkout do Stripe.

### Configuração da API

Veja o arquivo `/api/create-checkout-session.ts` para um exemplo de implementação da API com Stripe.

### URLs de Sucesso e Cancelamento

- **Success URL:** `https://app.ktirio.ai/upgrade/success?session_id={CHECKOUT_SESSION_ID}`
  - O Stripe substitui `{CHECKOUT_SESSION_ID}` pelo ID real da sessão
  - Use este ID para validar o pagamento via webhook
  
- **Cancel URL:** `https://app.ktirio.ai/upgrade/canceled`
  - Usuário é redirecionado aqui se cancelar o checkout

## Exemplo Completo

Veja o arquivo `/components/Gallery.tsx` para um exemplo de implementação completa com todos os 4 contextos funcionando.
