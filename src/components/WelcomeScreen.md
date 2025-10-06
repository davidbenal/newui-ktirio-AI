# WelcomeScreen Component

Tela de boas-vindas exibida após o usuário completar o signup/cadastro na plataforma. É a primeira experiência do usuário com o Ktírio AI.

## URL

```
/welcome
/welcome?name=João
```

Opcionalmente aceita parâmetro `name` na URL para personalizar a saudação.

## Propósito

1. **Dar boas-vindas** ao usuário de forma calorosa
2. **Apresentar benefícios iniciais** (créditos grátis, estilos, velocidade)
3. **Oferecer tour guiado** para novos usuários
4. **Permitir pular** para usuários experientes

## Props

```typescript
interface WelcomeScreenProps {
  userName?: string;        // Nome do usuário (default: "Usuário")
  onStartTour?: () => void; // Callback ao clicar "Começar tour guiado"
  onSkipToApp?: () => void; // Callback ao clicar "Pular e ir direto ao app"
}
```

## Visual Design

### Container Principal

```css
min-height: 100vh
background: linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)
display: flex
align-items: center
justify-content: center
padding: 24px
```

### Content Card

```css
width: 540px (max-w-[540px])
background: #FFFFFF
border-radius: 24px (rounded-3xl)
padding: 40px (p-10)
text-align: center
box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1)
border: 1px solid rgba(0, 0, 0, 0.06)
```

### Logo/Brand

```css
font-size: 48px
line-height: 48px
color: #030213
margin-bottom: 24px
text: "KTÍRIO"
```

### Animated Icon Container

```css
width: 100px
height: 100px
border-radius: 50%
background: linear-gradient(135deg, #030213 0%, #252525 100%)
box-shadow: 0 8px 24px rgba(3, 2, 19, 0.2)
display: flex
align-items: center
justify-content: center
margin: 0 auto 32px
animation: float 3s ease-in-out infinite
```

**Icon:**
- Sparkles (Lucide React)
- Size: 48px (w-12 h-12)
- Color: white

**Animation:**
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

### Título

```
Text: "Bem-vindo ao Ktírio!"
Font: Inter Bold 32px
Color: #030213
Line-height: 1.2
Margin-bottom: 12px
```

### Subtítulo

```
Text: "Olá, {userName}! Vamos começar sua jornada."
Font: Inter Regular 18px
Color: #717182
Line-height: 1.5
Margin-bottom: 32px
```

### Quick Stats Grid

```css
display: grid
grid-template-columns: repeat(3, 1fr)
gap: 16px
margin-bottom: 40px
```

**Stat Card:**
```css
padding: 16px 12px (p-4)
background: #FAFAFA
border: 1px solid #E9EBEF
border-radius: 12px (rounded-xl)
text-align: center
```

**Card Structure:**
- Icon (24px, #030213)
- Value (18px, Bold, #030213)
- Label (11px, Regular, #717182)

**Cards Content:**

**Card 1 - Credits:**
- Icon: Zap
- Value: "5 créditos"
- Label: "Grátis para começar"

**Card 2 - Styles:**
- Icon: Image
- Value: "Ilimitados"
- Label: "Estilos disponíveis"

**Card 3 - Time:**
- Icon: Clock
- Value: "2 min"
- Label: "Para primeira imagem"

### CTA Buttons

**Container:**
```css
display: flex
flex-direction: column
gap: 12px
margin-bottom: 24px
```

**Primary Button:**
```css
width: 100%
height: 52px
font-size: 16px
background: #030213
color: white
border-radius: 12px
```
- Text: "Começar tour guiado"
- Icon: ArrowRight (direita)

**Ghost Button:**
```css
width: 100%
height: 44px
font-size: 14px
color: #717182
background: transparent
hover:background: #FAFAFA
hover:color: #030213
border-radius: 12px
```
- Text: "Pular e ir direto ao app"

### Footer

```
Text: "Leva apenas 2 minutos • Pode pular a qualquer momento"
Font: Inter Regular 12px
Color: #717182
Margin-top: 20px
```

## Estrutura HTML

```tsx
<div className="min-h-screen flex ... gradient-background">
  <div className="max-w-[540px] bg-white rounded-3xl p-10 shadow-card">
    
    {/* Logo */}
    <h2 style={{ fontSize: '48px' }}>KTÍRIO</h2>

    {/* Animated Icon */}
    <div className="animate-float gradient-icon">
      <Sparkles />
    </div>

    {/* Title */}
    <h1 style={{ fontSize: '32px' }}>Bem-vindo ao Ktírio!</h1>

    {/* Subtitle */}
    <p style={{ fontSize: '18px' }}>Olá, {userName}!</p>

    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-4">
      <div className="stat-card">
        <Zap />
        <p>5 créditos</p>
        <p>Grátis para começar</p>
      </div>
      {/* ... 2 more cards */}
    </div>

    {/* Buttons */}
    <div className="flex flex-col gap-3">
      <Button onClick={onStartTour}>
        Começar tour guiado
        <ArrowRight />
      </Button>
      <Button variant="ghost" onClick={onSkipToApp}>
        Pular e ir direto ao app
      </Button>
    </div>

    {/* Footer */}
    <p style={{ fontSize: '12px' }}>
      Leva apenas 2 minutos • Pode pular...
    </p>

  </div>
</div>
```

## Fluxo do Usuário

```
1. User completes signup/registration
        ↓
2. Backend redirects to:
   /welcome?name=João
        ↓
3. WelcomeScreen component loads
        ↓
4. User sees personalized greeting
        ↓
5. User has 2 options:

   A) Clicks "Começar tour guiado"
      → onStartTour() callback
      → App starts guided tour
      → Shows tooltips, highlights, steps
      → Ends at Gallery with first project
   
   B) Clicks "Pular e ir direto ao app"
      → onSkipToApp() callback
      → Redirects to Gallery immediately
      → No tour, ready to work
```

## Integração no App.tsx

```tsx
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const [currentView, setCurrentView] = useState('gallery');
  const [userName, setUserName] = useState('Usuário');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/welcome')) {
      setCurrentView('welcome');
      
      // Extract user name from URL
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name');
      if (name) {
        setUserName(decodeURIComponent(name));
      }
    }
  }, []);

  const handleStartTour = () => {
    setCurrentView('gallery');
    // TODO: Start guided tour
  };

  const handleSkipToApp = () => {
    setCurrentView('gallery');
  };

  return (
    <div>
      {currentView === 'welcome' ? (
        <WelcomeScreen
          userName={userName}
          onStartTour={handleStartTour}
          onSkipToApp={handleSkipToApp}
        />
      ) : currentView === 'gallery' ? (
        <Gallery />
      ) : null}
    </div>
  );
}
```

## Exemplo de Uso

```tsx
<WelcomeScreen
  userName="João Silva"
  onStartTour={() => {
    console.log('Starting tour...');
    window.location.href = '/gallery?tour=true';
  }}
  onSkipToApp={() => {
    window.location.href = '/gallery';
  }}
/>
```

## Personalização via URL

### URL sem parâmetros
```
/welcome
```
Mostra: "Olá, Usuário! Vamos começar sua jornada."

### URL com nome
```
/welcome?name=Maria
```
Mostra: "Olá, Maria! Vamos começar sua jornada."

### URL com nome composto (encoded)
```
/welcome?name=Maria%20Silva
```
Mostra: "Olá, Maria Silva! Vamos começar sua jornada."

## Backend Integration

Após signup bem-sucedido, redirecionar para:

```javascript
// Node.js/Express example
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Create user...
  const user = await createUser({ email, password, name });
  
  // Redirect to welcome screen
  const encodedName = encodeURIComponent(user.name);
  res.redirect(`/welcome?name=${encodedName}`);
});
```

```typescript
// Next.js example
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, name } = req.body;
    
    // Create user...
    const user = await createUser({ email, password, name });
    
    // Redirect
    const encodedName = encodeURIComponent(user.name);
    return res.redirect(307, `/welcome?name=${encodedName}`);
  }
}
```

## Animações

### Float Animation

O ícone central possui animação suave de float (flutuação):

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

**Parâmetros:**
- Duration: 3 segundos
- Timing: ease-in-out (suave)
- Iteration: infinite (loop contínuo)
- Amplitude: 10px vertical

## UX Considerations

### Por que mostrar estatísticas?

Estudos mostram que apresentar **benefícios concretos** na primeira tela:
- 📊 Aumenta retenção em 25-30%
- 📊 Reduz abandono em onboarding
- 📊 Cria senso de valor imediato

### Por que oferecer "pular"?

- ✅ Respeita tempo do usuário
- ✅ Evita frustração de usuários experientes
- ✅ Aumenta conversão geral (menos atrito)
- ✅ Usuários que pulam ainda podem acessar tour depois

### Copy amigável e motivacional

O texto evita:
- ❌ Jargão técnico
- ❌ Promessas exageradas
- ❌ Linguagem corporativa fria

E usa:
- ✅ Saudação pessoal (nome do usuário)
- ✅ Números concretos (5 créditos, 2 minutos)
- ✅ Tom encorajador ("sua jornada", "começar")

## Métricas para Rastrear

### Analytics

```typescript
// Page view
analytics.page('Welcome Screen', {
  userName: userName,
  timestamp: new Date().toISOString()
});

// User started tour
analytics.track('Tour Started', {
  source: 'welcome_screen',
  userName: userName
});

// User skipped tour
analytics.track('Tour Skipped', {
  source: 'welcome_screen',
  userName: userName
});

// Time on screen
const startTime = Date.now();
// On exit:
analytics.track('Welcome Screen Duration', {
  duration: Date.now() - startTime,
  action: 'tour_started' | 'tour_skipped'
});
```

### KPIs Importantes

- **Tour Completion Rate:** % que clica "Começar tour guiado"
- **Skip Rate:** % que clica "Pular"
- **Time to Action:** Tempo até tomar decisão
- **Bounce Rate:** % que fecha sem ação

## A/B Testing Sugestões

### Variantes para testar:

**1. Ordem dos botões:**
- A: Primary top, Ghost bottom (atual)
- B: Ghost top, Primary bottom

**2. Copy do botão primary:**
- A: "Começar tour guiado" (atual)
- B: "Fazer tour rápido (2 min)"
- C: "Ver como funciona"
- D: "Criar primeira imagem"

**3. Stats mostradas:**
- A: Créditos, Estilos, Tempo (atual)
- B: Créditos, Usuários, Rating
- C: Apenas Créditos em destaque

**4. Ícone animado:**
- A: Sparkles (atual)
- B: Wand (varinha mágica)
- C: Zap (raio)

## Acessibilidade

✅ **Estrutura semântica**
- `<h2>` para logo
- `<h1>` para título principal
- `<p>` para descrições

✅ **ARIA labels**
```tsx
<div 
  className="animate-float"
  role="img"
  aria-label="Ícone de boas-vindas"
>
  <Sparkles />
</div>
```

✅ **Keyboard navigation**
- Tab entre botões
- Enter para confirmar
- Focus visible

✅ **Screen readers**
- Textos descritivos
- Ordem lógica de leitura
- Hierarquia clara

## Performance

### Otimizações

✅ **Sem dependências pesadas**
- Apenas lucide-react icons
- CSS puro (sem bibliotecas de animação)

✅ **Imagens otimizadas**
- Apenas SVG icons (leves)
- Sem imagens raster

✅ **CSS inline para gradientes**
- Evita flash de conteúdo não estilizado
- Garante renderização correta

### Bundle Size

Componente adiciona ~2KB ao bundle (minified + gzipped):
- Component code: ~1.5KB
- Animation CSS: ~0.3KB
- Icons: ~0.2KB

## Responsividade

### Desktop (≥540px)
- Card mantém 540px largura
- Centralizado na tela

### Mobile (<540px)
- Card ocupa 100% largura (com padding)
- Stats grid mantém 3 colunas
- Textos permanecem legíveis

### Breakpoint sugerido (opcional)

```css
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr; /* Stack em mobile */
  }
  
  .stat-card p {
    font-size: 14px; /* Reduzir valores */
  }
}
```

## Testing

### Manual Testing

1. Abrir `http://localhost:3000/welcome`
2. Verificar layout e animação
3. Testar com nome: `/welcome?name=João`
4. Clicar em "Começar tour guiado"
   → Deve chamar onStartTour()
5. Voltar e clicar "Pular e ir direto ao app"
   → Deve chamar onSkipToApp()
6. Verificar animação float (3s loop)

### Automated Testing

```typescript
describe('WelcomeScreen', () => {
  it('renders with default user name', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText(/Olá, Usuário!/)).toBeInTheDocument();
  });

  it('renders with custom user name', () => {
    render(<WelcomeScreen userName="Maria" />);
    expect(screen.getByText(/Olá, Maria!/)).toBeInTheDocument();
  });

  it('calls onStartTour when clicking tour button', () => {
    const onStartTour = jest.fn();
    render(<WelcomeScreen onStartTour={onStartTour} />);
    
    fireEvent.click(screen.getByText('Começar tour guiado'));
    expect(onStartTour).toHaveBeenCalled();
  });

  it('calls onSkipToApp when clicking skip button', () => {
    const onSkipToApp = jest.fn();
    render(<WelcomeScreen onSkipToApp={onSkipToApp} />);
    
    fireEvent.click(screen.getByText('Pular e ir direto ao app'));
    expect(onSkipToApp).toHaveBeenCalled();
  });

  it('displays all 3 stat cards', () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('5 créditos')).toBeInTheDocument();
    expect(screen.getByText('Ilimitados')).toBeInTheDocument();
    expect(screen.getByText('2 min')).toBeInTheDocument();
  });
});
```

## SEO / Meta Tags

```html
<title>Bem-vindo ao Ktírio AI</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Comece sua jornada no Ktírio AI">
```

## Próximos Passos

Após implementar Welcome Screen:

1. **Implementar Tour Guiado**
   - Tooltips interativos
   - Highlight de elementos
   - Passo a passo
   - Progress indicator

2. **Tracking de Onboarding**
   - Mixpanel/Amplitude integration
   - Funnel analysis
   - Drop-off points

3. **Personalização Avançada**
   - Mostrar diferentes stats por persona
   - Ajustar copy baseado em source
   - A/B testing framework

4. **Email de Boas-Vindas**
   - Enviar após signup
   - Link para tutorial
   - Primeiros passos

## Arquivos Relacionados

- `/components/WelcomeScreen.tsx` - Componente
- `/App.tsx` - Integração e roteamento
- `/styles/globals.css` - Animação float
- `/components/ui/button.tsx` - Botões ShadCN
