# UpgradeCanceled Component

Página completa exibida quando o usuário cancela o processo de checkout no Stripe e é redirecionado de volta para a aplicação.

## URL

```
/upgrade/canceled
```

O Stripe redireciona para esta URL quando o usuário:
- Clica no botão "Voltar" no checkout
- Fecha a janela do checkout
- Clica em "Cancelar" durante o pagamento

## Comportamento

1. **Mostra mensagem de cancelamento**
2. **Informa que nada foi cobrado**
3. **Oferece duas opções:**
   - Tentar novamente (abre o Upgrade Modal)
   - Voltar ao app (retorna para Gallery)

## Props

```typescript
interface UpgradeCanceledProps {
  onBack?: () => void;      // Callback ao clicar em "Voltar ao app"
  onTryAgain?: () => void;  // Callback ao clicar em "Tentar novamente"
}
```

## Visual Design

### Container
```css
min-height: 100vh
background: #FFFFFF
padding: 48px 24px (py-12 px-6)
display: flex
align-items: center
justify-content: center
```

### Content
```css
max-width: 600px
width: 100%
margin: 0 auto
```

### Ícone
- **XCircle** (lucide-react)
- **Tamanho:** 64px (w-16 h-16)
- **Cor:** #D4183D (vermelho)
- **Container:**
  - Background: rgba(212, 24, 61, 0.1)
  - Border: 2px solid rgba(212, 24, 61, 0.2)
  - Border-radius: 100% (rounded-full)
  - Size: 64px

### Título
```
"Pagamento cancelado"
font-size: 32px (text-[32px])
color: #030213
margin-bottom: 12px
```

### Descrição
```
"Você cancelou o processo de upgrade. Seus dados não foram alterados."
font-size: 16px (text-base)
color: #717182
margin-bottom: 32px
line-height: 1.5 (leading-relaxed)
```

### Info Card
```css
background: #FAFAFA
border-radius: 24px (rounded-2xl)
padding: 24px (p-6)
margin-bottom: 32px (mb-8)
text-align: left
```

**Conteúdo:**
- Ícone: Info (lucide-react), 20px, #717182
- Título: "Nenhuma cobrança foi realizada"
- Descrição: Créditos gratuitos continuam disponíveis

### Botões

**1. Tentar novamente (Primary)**
```css
width: 100% (w-full)
height: 48px (h-12)
background: #030213
color: white
border-radius: 12px
```
- Ícone: RefreshCw (esquerda)
- Texto: "Tentar novamente"

**2. Voltar ao app (Secondary)**
```css
width: 100% (w-full)
height: 48px (h-12)
background: transparent
color: #030213
border: 1px solid #E9EBEF
border-radius: 12px
```
- Ícone: ArrowLeft (esquerda)
- Texto: "Voltar ao app"

### Footer
```css
margin-top: 24px (mt-6)
padding-top: 24px (pt-6)
border-top: 1px solid #E9EBEF
```
- Texto: "Precisa de ajuda? Entre em contato: contato@ktirio.ai"
- font-size: 12px (text-xs)
- color: #717182

## Estrutura HTML

```tsx
<div className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
  <div className="w-full max-w-[600px] mx-auto">
    <div className="text-center">
      
      {/* Icon */}
      <div className="w-16 h-16 rounded-full ... mx-auto mb-6">
        <XCircle />
      </div>

      {/* Title */}
      <h1>Pagamento cancelado</h1>

      {/* Description */}
      <p>Você cancelou o processo de upgrade...</p>

      {/* Info Card */}
      <div className="bg-[#FAFAFA] rounded-2xl p-6 mb-8">
        <Info />
        <div>
          <p>Nenhuma cobrança foi realizada</p>
          <p>Você pode fazer upgrade a qualquer momento...</p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <Button onClick={onTryAgain}>
          <RefreshCw /> Tentar novamente
        </Button>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft /> Voltar ao app
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t">
        <p>Precisa de ajuda? contato@ktirio.ai</p>
      </div>

    </div>
  </div>
</div>
```

## Fluxo Completo

```
1. User is on Stripe Checkout page
        ↓
2. User clicks "Cancel" or "Back"
        ↓
3. Stripe redirects to:
   /upgrade/canceled
        ↓
4. UpgradeCanceled component loads
        ↓
5. User has 2 options:
   
   A) Clicks "Tentar novamente"
      → onTryAgain() callback
      → Redirects to Gallery
      → Opens UpgradeModal automatically
      → User can try checkout again
   
   B) Clicks "Voltar ao app"
      → onBack() callback
      → Redirects to Gallery
      → Normal flow continues
```

## Integração no App.tsx

```tsx
import UpgradeCanceled from './components/UpgradeCanceled';

function App() {
  const [currentView, setCurrentView] = useState('gallery');
  const [shouldOpenUpgradeModal, setShouldOpenUpgradeModal] = useState(false);

  // Check URL for canceled route
  useEffect(() => {
    if (window.location.pathname.includes('/upgrade/canceled')) {
      setCurrentView('upgrade-canceled');
    }
  }, []);

  const handleTryAgainFromCanceled = () => {
    // Volta para Gallery e abre o modal
    setCurrentView('gallery');
    setShouldOpenUpgradeModal(true);
  };

  const handleBackToGallery = () => {
    setCurrentView('gallery');
  };

  return (
    <div>
      {currentView === 'upgrade-canceled' ? (
        <UpgradeCanceled 
          onBack={handleBackToGallery}
          onTryAgain={handleTryAgainFromCanceled}
        />
      ) : currentView === 'gallery' ? (
        <Gallery 
          shouldOpenUpgradeModal={shouldOpenUpgradeModal}
          onUpgradeModalChange={(isOpen) => {
            if (!isOpen) setShouldOpenUpgradeModal(false);
          }}
        />
      ) : null}
    </div>
  );
}
```

## Integração na Gallery

A Gallery aceita props para controlar a abertura externa do modal:

```tsx
interface GalleryProps {
  shouldOpenUpgradeModal?: boolean;
  onUpgradeModalChange?: (isOpen: boolean) => void;
}

function Gallery({ 
  shouldOpenUpgradeModal, 
  onUpgradeModalChange 
}: GalleryProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Abre modal quando recebe trigger externo
  useEffect(() => {
    if (shouldOpenUpgradeModal) {
      setUpgradeModalOpen(true);
    }
  }, [shouldOpenUpgradeModal]);

  return (
    <>
      {/* Gallery content */}
      
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          if (onUpgradeModalChange) {
            onUpgradeModalChange(false);
          }
        }}
      />
    </>
  );
}
```

## Exemplo de Uso

```tsx
<UpgradeCanceled
  onBack={() => {
    // Volta para a tela principal
    window.location.href = '/gallery';
  }}
  onTryAgain={() => {
    // Volta e abre o modal
    window.location.href = '/gallery?upgrade=true';
  }}
/>
```

## Diferenças vs UpgradeSuccess

| Feature | UpgradeSuccess | UpgradeCanceled |
|---------|----------------|-----------------|
| **Ícone** | CheckCircle2 (verde) | XCircle (vermelho) |
| **Tom** | Positivo, celebratório | Neutro, informativo |
| **Estados** | Loading, Success, Error | Apenas 1 estado |
| **API Call** | Sim, verifica session | Não |
| **Botão Primário** | "Começar a usar" | "Tentar novamente" |
| **Mostra dados** | Plano, valor, créditos | Apenas mensagem |

## UX Considerações

### Por que não mostrar API error?

Diferente da Success page, a Canceled page **não faz chamada de API** porque:
- ✅ Cancelamento é uma ação do usuário, não um erro
- ✅ Não há sessão para verificar
- ✅ Nenhum estado precisa ser sincronizado
- ✅ Experiência deve ser rápida e direta

### Por que oferecer "Tentar novamente"?

Estudos mostram que:
- 📊 ~30% dos usuários que cancelam voltam imediatamente
- 📊 Facilitar o retorno aumenta conversão em 15-20%
- 📊 Usuários podem ter cancelado por acidente

### Mensagem não-culposa

O texto evita:
- ❌ "Você perdeu..."
- ❌ "Infelizmente..."
- ❌ Linguagem negativa

E usa:
- ✅ "Você cancelou" (factual, neutro)
- ✅ "Seus dados não foram alterados" (reassuring)
- ✅ "Você pode fazer upgrade a qualquer momento" (incentivo)

## Analytics

Eventos importantes para rastrear:

```typescript
// Page view
analytics.page('Upgrade Canceled');

// User tried again
analytics.track('Upgrade Retry Clicked', {
  source: 'canceled_page'
});

// User went back
analytics.track('Upgrade Abandoned', {
  source: 'canceled_page'
});
```

## A/B Testing Sugestões

Testar variações de:

1. **Copy do botão primário:**
   - "Tentar novamente"
   - "Ver planos novamente"
   - "Continuar upgrade"

2. **Ordem dos botões:**
   - Primary primeiro vs Secondary primeiro

3. **Adicionar incentivo:**
   - "Tentar novamente (ganhe X% off)"
   - Mostrar timer de desconto

4. **Card de benefícios:**
   - Adicionar preview dos benefícios
   - Mostrar comparação de planos

## Acessibilidade

✅ **ARIA labels**
- Ícone: `aria-label="Cancelado"`
- Região: `role="main"`

✅ **Keyboard navigation**
- Tab entre botões
- Enter para confirmar

✅ **Screen readers**
- Mensagens descritivas
- Estrutura semântica clara

## SEO / Meta Tags

```html
<title>Checkout Cancelado - Ktírio AI</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Você cancelou o checkout. Nenhuma cobrança foi realizada.">
```

## Performance

- ✅ Sem API calls = Loading instantâneo
- ✅ Minimal bundle size
- ✅ Imagens otimizadas (apenas SVG icons)

## Testing

### Manual Testing
```
1. Abrir http://localhost:3000/upgrade/canceled
2. Verificar layout e design
3. Clicar em "Tentar novamente"
   → Deve redirecionar para Gallery
   → Upgrade Modal deve abrir
4. Voltar para /upgrade/canceled
5. Clicar em "Voltar ao app"
   → Deve redirecionar para Gallery
   → Modal não deve abrir
```

### Automated Testing
```typescript
describe('UpgradeCanceled', () => {
  it('renders correctly', () => {
    render(<UpgradeCanceled />);
    expect(screen.getByText('Pagamento cancelado')).toBeInTheDocument();
  });

  it('calls onTryAgain when clicking retry button', () => {
    const onTryAgain = jest.fn();
    render(<UpgradeCanceled onTryAgain={onTryAgain} />);
    fireEvent.click(screen.getByText('Tentar novamente'));
    expect(onTryAgain).toHaveBeenCalled();
  });

  it('calls onBack when clicking back button', () => {
    const onBack = jest.fn();
    render(<UpgradeCanceled onBack={onBack} />);
    fireEvent.click(screen.getByText('Voltar ao app'));
    expect(onBack).toHaveBeenCalled();
  });
});
```

## Arquivos Relacionados

- `/components/UpgradeCanceled.tsx` - Componente
- `/components/UpgradeModal.tsx` - Modal de upgrade
- `/components/Gallery.tsx` - Tela principal
- `/App.tsx` - Roteamento
- `/UPGRADE_FLOW.md` - Documentação completa do fluxo
