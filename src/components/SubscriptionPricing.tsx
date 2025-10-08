import { useState } from 'react';
import { Check, Zap, ArrowRight, Crown, Rocket, Star } from 'lucide-react';
import { useCredits } from '../hooks/useCredits';

interface Plan {
  id: 'starter' | 'pro' | 'business';
  name: string;
  icon: typeof Zap;
  iconColor: string;
  price: number;
  credits: number;
  pricePerCredit: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    iconColor: '#F59E0B',
    price: 9.99,
    credits: 100,
    pricePerCredit: 0.10,
    description: 'Perfeito para começar',
    features: [
      '100 créditos por mês',
      'Todos os estilos disponíveis',
      'Qualidade alta',
      'Exportação em múltiplos formatos',
      'Suporte por email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Star,
    iconColor: '#3B82F6',
    price: 24.99,
    credits: 300,
    pricePerCredit: 0.08,
    description: 'Para profissionais',
    popular: true,
    features: [
      '300 créditos por mês',
      'Todos os estilos disponíveis',
      'Qualidade máxima',
      'Exportação em múltiplos formatos',
      'Suporte prioritário',
      'Acesso antecipado a novos recursos',
      'Renderização mais rápida'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    icon: Crown,
    iconColor: '#8B5CF6',
    price: 79.99,
    credits: 1000,
    pricePerCredit: 0.08,
    description: 'Para equipes e empresas',
    features: [
      '1000 créditos por mês',
      'Todos os estilos disponíveis',
      'Qualidade máxima',
      'Exportação em múltiplos formatos',
      'Suporte VIP 24/7',
      'Acesso antecipado a novos recursos',
      'Renderização prioritária',
      'API dedicada',
      'Gerenciamento de equipe'
    ]
  }
];

interface SubscriptionPricingProps {
  userId: string;
  onClose?: () => void;
}

export default function SubscriptionPricing({ userId, onClose }: SubscriptionPricingProps) {
  const { subscription, createSubscriptionCheckout } = useCredits(userId);
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const checkoutUrl = await createSubscriptionCheckout(planId);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Erro ao criar checkout:', err);
      setError(err.message || 'Erro ao processar assinatura. Tente novamente.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-[#030213] mb-4" style={{ fontSize: '48px', fontWeight: 700 }}>
          Escolha seu plano
        </h1>
        <p className="text-[#717182] text-xl max-w-2xl mx-auto">
          Créditos mensais recorrentes com economia garantida
        </p>

        {/* Current Subscription */}
        {subscription && (
          <div
            className="mt-6 px-6 py-4 mx-auto max-w-fit rounded-xl flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white'
            }}
          >
            <Check className="w-5 h-5" />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              Plano atual: {plans.find(p => p.id === subscription.planId)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = subscription?.planId === plan.id;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className="relative bg-white rounded-3xl p-8 transition-all duration-300"
              style={{
                border: plan.popular
                  ? '3px solid #030213'
                  : isSelected
                  ? '2px solid #CBCED4'
                  : '2px solid #E9EBEF',
                boxShadow: plan.popular
                  ? '0 20px 40px rgba(0, 0, 0, 0.15)'
                  : isSelected
                  ? '0 12px 24px rgba(0, 0, 0, 0.1)'
                  : '0 4px 12px rgba(0, 0, 0, 0.05)',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!plan.popular) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!plan.popular) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 px-6 py-2 rounded-full text-white uppercase"
                  style={{
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  Mais Popular
                </div>
              )}

              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: `${plan.iconColor}15`
                }}
              >
                <Icon className="w-8 h-8" style={{ color: plan.iconColor }} />
              </div>

              {/* Plan Name */}
              <h3 className="text-[#030213] mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-[#717182] mb-6" style={{ fontSize: '15px' }}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[#030213]" style={{ fontSize: '48px', fontWeight: 700 }}>
                    ${Math.floor(plan.price)}
                  </span>
                  <span className="text-[#030213]" style={{ fontSize: '24px', fontWeight: 700 }}>
                    .{(plan.price % 1).toFixed(2).split('.')[1]}
                  </span>
                  <span className="text-[#717182]" style={{ fontSize: '16px' }}>
                    /mês
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: plan.iconColor }} />
                  <span className="text-[#252525]" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {plan.credits} créditos/mês
                  </span>
                  <span className="text-[#10B981] text-sm">
                    (${plan.pricePerCredit}/crédito)
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${plan.iconColor}20` }}
                    >
                      <Check className="w-3 h-3" style={{ color: plan.iconColor }} strokeWidth={3} />
                    </div>
                    <span className="text-[#252525]" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrentPlan || isProcessing}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isCurrentPlan
                    ? '#E9EBEF'
                    : plan.popular
                    ? 'linear-gradient(135deg, #030213 0%, #252525 100%)'
                    : '#FAFAFA',
                  color: isCurrentPlan
                    ? '#717182'
                    : plan.popular
                    ? 'white'
                    : '#030213',
                  border: plan.popular ? 'none' : '2px solid #E9EBEF',
                  fontSize: '16px',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentPlan && !isProcessing) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isCurrentPlan ? (
                  'Plano Atual'
                ) : isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Assinar Agora
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ or additional info */}
      <div
        className="max-w-3xl mx-auto p-8 rounded-2xl"
        style={{
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Rocket className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-[#030213] mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
              Sobre as assinaturas
            </h4>
            <ul className="text-[#252525] space-y-2" style={{ fontSize: '14px', lineHeight: 1.6 }}>
              <li>✓ Créditos renovados automaticamente todo mês</li>
              <li>✓ Cancele a qualquer momento, sem taxa de cancelamento</li>
              <li>✓ Créditos não expiram durante assinatura ativa</li>
              <li>✓ Upgrade ou downgrade a qualquer momento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
