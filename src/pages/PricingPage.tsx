import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { Check, Sparkles, Zap, Rocket, Clock, Shield } from 'lucide-react';

// Configuração dos planos (usar os Price IDs reais do Stripe)
const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Básico',
    monthlyCredits: 1000,
    price: 29.90,
    priceId: 'price_1QiIi6P03hDFf6riFHkC7S0c', // Price ID real do Stripe
    icon: Zap,
    features: [
      '1.000 créditos por mês',
      'Geração de imagens ilimitadas',
      'Suporte por email',
      'Histórico de 30 dias',
      'Exportação básica'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyCredits: 5000,
    price: 99.90,
    priceId: 'price_1QiIi6P03hDFf6riImGr2jke', // Price ID real do Stripe
    icon: Rocket,
    features: [
      '5.000 créditos por mês',
      'Geração prioritária',
      'Suporte prioritário 24/7',
      'Histórico ilimitado',
      'Exportação avançada (PNG, SVG)',
      'API access',
      'Marca d\'água removida'
    ],
    popular: true
  }
];

const CREDIT_PACKS = [
  {
    id: 'starter',
    name: 'Inicial',
    credits: 500,
    price: 19.90,
    priceId: 'price_1QiIi6P03hDFf6ri78wPfQ9J',
    validityDays: 90,
    icon: Zap,
    popular: false
  },
  {
    id: 'standard',
    name: 'Padrão',
    credits: 2000,
    price: 69.90,
    priceId: 'price_1QiIi6P03hDFf6riRATq9Z5D',
    validityDays: 90,
    icon: Sparkles,
    popular: true,
    savingsPercent: 12
  },
  {
    id: 'large',
    name: 'Grande',
    credits: 5000,
    price: 149.90,
    priceId: 'price_1QiIi6P03hDFf6riTb9VC6F8',
    validityDays: 90,
    icon: Rocket,
    popular: false,
    savingsPercent: 25
  }
];

export function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, createSubscriptionCheckout, createPackCheckout } = useCredits(user?.uid || null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, priceId: string) => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }

    try {
      setLoading(planId);
      setError(null);
      const checkoutUrl = await createSubscriptionCheckout(planId);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Error creating subscription checkout:', err);
      setError('Erro ao criar checkout. Tente novamente.');
      setLoading(null);
    }
  };

  const handleBuyPack = async (packId: string) => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }

    try {
      setLoading(packId);
      setError(null);
      const checkoutUrl = await createPackCheckout(packId);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Error creating pack checkout:', err);
      setError('Erro ao criar checkout. Tente novamente.');
      setLoading(null);
    }
  };

  const currentPlanId = subscription?.planId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece gratuitamente ou escolha um plano que se adeque às suas necessidades
          </p>
        </div>

        {error && (
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Planos de Assinatura */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Planos Mensais
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                    plan.popular ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          R$ {plan.price.toFixed(2)}
                        </span>
                        <span className="text-gray-600">/mês</span>
                      </div>
                      <p className="text-sm text-indigo-600 font-medium mt-2">
                        {plan.monthlyCredits.toLocaleString()} créditos mensais
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
                        <p className="text-sm font-medium text-green-700">
                          Seu plano atual
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.id, plan.priceId)}
                        disabled={loading === plan.id}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          plan.popular
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loading === plan.id ? 'Processando...' : 'Assinar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pacotes Avulsos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Pacotes Avulsos
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Compre créditos sem compromisso mensal
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {CREDIT_PACKS.map((pack) => {
              const Icon = pack.icon;

              return (
                <div
                  key={pack.id}
                  className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 ${
                    pack.popular ? 'ring-2 ring-indigo-400' : ''
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MELHOR VALOR
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {pack.name}
                      </h3>
                    </div>

                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        R$ {pack.price.toFixed(2)}
                      </div>
                      <p className="text-indigo-600 font-medium">
                        {pack.credits.toLocaleString()} créditos
                      </p>
                      {pack.savingsPercent && (
                        <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded mt-2">
                          Economize {pack.savingsPercent}%
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                      <Clock className="w-4 h-4" />
                      <span>Válido por {pack.validityDays} dias</span>
                    </div>

                    <button
                      onClick={() => handleBuyPack(pack.id)}
                      disabled={loading === pack.id}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading === pack.id ? 'Processando...' : 'Comprar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Garantia */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-green-500" />
              <h3 className="text-xl font-bold text-gray-900">
                Garantia de 7 dias
              </h3>
            </div>
            <p className="text-gray-600">
              Não está satisfeito? Oferecemos reembolso total em até 7 dias após a compra,
              sem perguntas. Seu investimento está protegido.
            </p>
          </div>
        </div>

        {/* FAQ ou CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Tem dúvidas sobre qual plano escolher?
          </p>
          <button
            onClick={() => navigate('/contato')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Fale com nossa equipe →
          </button>
        </div>
      </div>
    </div>
  );
}
