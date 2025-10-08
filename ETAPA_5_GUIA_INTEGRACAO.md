# ⚡ ETAPA 5 - Guia Rápido de Integração

## 📋 Passo a Passo para Integrar os Componentes UI

---

## 1️⃣ Adicionar Rotas (App.tsx ou routes.tsx)

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PricingPage } from './pages/PricingPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas existentes... */}

        {/* Novas rotas de créditos */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 2️⃣ Integrar CreditsSidebar no Layout

### Opção A: Sidebar Fixa (Recomendado)

```tsx
// src/components/Layout.tsx
import { CreditsSidebar } from './CreditsSidebar';
import { useAuth } from '../hooks/useAuth';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Esquerda (Navegação) */}
      <aside className="w-64 bg-white border-r border-gray-200">
        {/* Seu menu de navegação aqui */}
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6">
        {children}
      </main>

      {/* Sidebar Direita (Créditos) */}
      {user && (
        <aside className="w-80 p-6">
          <div className="sticky top-6">
            <CreditsSidebar userId={user.uid} />
          </div>
        </aside>
      )}
    </div>
  );
}
```

### Opção B: Header Badge

```tsx
// src/components/Header.tsx
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user } = useAuth();
  const { credits } = useCredits(user?.uid || null);
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>{/* Logo e navegação */}</div>

        {user && (
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Coins className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-indigo-900">
              {credits || 0} créditos
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
```

---

## 3️⃣ Proteger Ações que Consomem Créditos

### Exemplo: Geração de Imagem

```tsx
// src/components/ImageGenerator.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { useNavigate } from 'react-router-dom';

export function ImageGenerator() {
  const { user } = useAuth();
  const { credits, consumeCredits } = useCredits(user?.uid || null);
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    // Verificar autenticação
    if (!user) {
      navigate('/login?redirect=/generate');
      return;
    }

    // Verificar créditos suficientes
    if (!credits || credits < 1) {
      navigate('/pricing');
      return;
    }

    try {
      setGenerating(true);

      // Consumir crédito
      await consumeCredits(1, 'Geração de imagem AI');

      // Fazer a geração
      const result = await generateImage(/* params */);

      // Sucesso!
      showSuccessMessage(result);
    } catch (error) {
      console.error('Error:', error);
      showErrorMessage('Erro ao gerar imagem');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={!credits || credits < 1 || generating}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
      >
        {generating ? 'Gerando...' : 'Gerar Imagem (1 crédito)'}
      </button>

      {credits !== null && credits < 5 && (
        <p className="text-sm text-amber-600 mt-2">
          Você tem apenas {credits} créditos restantes.{' '}
          <button
            onClick={() => navigate('/pricing')}
            className="underline font-medium"
          >
            Comprar mais
          </button>
        </p>
      )}
    </div>
  );
}
```

---

## 4️⃣ Configurar URLs no Stripe Dashboard

### Success URL:
```
https://seu-dominio.com/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=subscription
```

### Cancel URL:
```
https://seu-dominio.com/pricing
```

### Como Configurar:
1. Acesse Stripe Dashboard
2. Vá em **Products** → Selecione um produto
3. Em **Pricing**, clique no Price criado
4. Edite e adicione as URLs acima

---

## 5️⃣ Atualizar Price IDs

Se você mudou os Price IDs no Stripe, atualize em:

```tsx
// src/config/pricing.ts
export const SUBSCRIPTION_PLANS = {
  basic: {
    priceId: 'SEU_PRICE_ID_AQUI', // ← Atualizar
    // ...
  },
  // ...
}
```

---

## 6️⃣ Adicionar Link para Pricing no Menu

```tsx
// src/components/Navigation.tsx
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';

export function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/projects">Projetos</Link>
      <Link to="/pricing" className="flex items-center gap-2">
        <Coins className="w-4 h-4" />
        Créditos
      </Link>
    </nav>
  );
}
```

---

## 7️⃣ Exemplo Completo: Página com Geração

```tsx
// src/pages/GeneratePage.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { CreditsSidebar } from '../components/CreditsSidebar';

export function GeneratePage() {
  const { user } = useAuth();
  const { credits, consumeCredits } = useCredits(user?.uid || null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credits || credits < 1) {
      alert('Créditos insuficientes!');
      return;
    }

    try {
      // Consumir crédito
      await consumeCredits(1, `Geração: ${prompt}`);

      // Gerar imagem (exemplo)
      const imageUrl = await generateAIImage(prompt);
      setResult(imageUrl);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Área Principal */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Gerar Imagem AI</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva a imagem..."
            className="w-full px-4 py-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={!credits || credits < 1}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
          >
            Gerar (1 crédito)
          </button>
        </form>

        {result && (
          <div className="mt-6">
            <img src={result} alt="Generated" className="rounded-lg" />
          </div>
        )}
      </div>

      {/* Sidebar de Créditos */}
      {user && (
        <aside className="w-80">
          <div className="sticky top-6">
            <CreditsSidebar userId={user.uid} />
          </div>
        </aside>
      )}
    </div>
  );
}
```

---

## 8️⃣ Configurar Firebase Functions URL

Se estiver usando emulator local:

```tsx
// src/lib/firebase.ts (ou onde configura o Firebase)
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

export const functions = getFunctions(app);

// Apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

---

## 9️⃣ Adicionar Loading Global (Opcional)

```tsx
// src/components/CreditsLoader.tsx
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { Loader2 } from 'lucide-react';

export function CreditsLoader({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { loading: creditsLoading } = useCredits(user?.uid || null);

  if (authLoading || (user && creditsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return <>{children}</>;
}

// Uso em App.tsx
<CreditsLoader>
  <Routes>
    {/* suas rotas */}
  </Routes>
</CreditsLoader>
```

---

## 🔟 Testar Localmente

### 1. Testar com Emulator:
```bash
# Terminal 1: Emulators
firebase emulators:start

# Terminal 2: React App
npm run dev
```

### 2. Criar Dados de Teste no Firestore:

```javascript
// Via console do emulator ou código
const testUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  credits: 100,
  subscription: {
    planId: 'pro',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
};
```

### 3. Cards de Teste do Stripe:

**Sucesso:**
- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura
- CVV: Qualquer 3 dígitos

**Falha:**
- Número: `4000 0000 0000 0002`

---

## ✅ Checklist Final

- [ ] Rotas adicionadas no App.tsx
- [ ] CreditsSidebar integrado no layout
- [ ] Price IDs atualizados em `pricing.ts`
- [ ] URLs de retorno configuradas no Stripe
- [ ] Firebase Functions configurado
- [ ] Testado fluxo de compra local
- [ ] Testado consumo de créditos
- [ ] Links de navegação para `/pricing`
- [ ] Loading states funcionando
- [ ] Error handling testado

---

## 🆘 Troubleshooting

### Erro: "Functions not configured"
```tsx
// Verificar se Firebase está inicializado
import { functions } from '../lib/firebase';
console.log(functions); // Deve retornar objeto
```

### Erro: "Credits not updating"
```tsx
// Verificar se listener está ativo
const { credits, error } = useCredits(userId);
console.log({ credits, error });
```

### Erro: "Stripe checkout fails"
```tsx
// Verificar Price IDs
console.log(SUBSCRIPTION_PLANS.basic.priceId);
// Deve começar com "price_"
```

---

**Pronto! Seu sistema de créditos está integrado!** 🎉

Para dúvidas, consulte:
- [ETAPA_5_UI_REACT.md](ETAPA_5_UI_REACT.md) - Documentação completa
- [ETAPA_3_RESUMO_FINAL.md](ETAPA_3_RESUMO_FINAL.md) - Cloud Functions
- [ETAPA_4_RESUMO_FINAL.md](ETAPA_4_RESUMO_FINAL.md) - Cron Jobs
