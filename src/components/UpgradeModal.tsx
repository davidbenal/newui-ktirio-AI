import { useState } from 'react';
import { X, Zap, Lock, FolderX, Clock, Check, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { createCheckoutSession } from '../api/create-checkout-session';

export type UpgradeModalContext = 'credits' | 'feature' | 'projects' | 'trial';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: UpgradeModalContext;
  onContinue?: (planId: string, billingPeriod: 'monthly' | 'yearly') => void;
  onError?: (message: string) => void;
}

interface PlanOption {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isRecommended?: boolean;
}

const plans: PlanOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 49,
    priceYearly: 470, // 20% discount
    features: [
      '100 créditos/mês',
      'Qualidade alta',
      'Sem marca d\'água'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 89,
    priceYearly: 854, // 20% discount
    features: [
      '200 créditos/mês',
      'Qualidade máxima',
      'API + Integrações',
      'Suporte prioritário'
    ],
    isRecommended: true
  }
];

const contextConfig = {
  credits: {
    icon: Zap,
    title: 'Faça upgrade para continuar',
    description: 'Você atingiu o limite do plano Free',
    alertTitle: '0 de 5 créditos restantes',
    alertDescription: 'Seus créditos gratuitos acabaram. Faça upgrade para continuar criando.'
  },
  feature: {
    icon: Lock,
    title: 'Esta feature é exclusiva',
    description: 'Disponível nos planos Starter e Professional',
    alertTitle: 'Recurso bloqueado',
    alertDescription: 'Esta funcionalidade está disponível apenas em planos pagos.'
  },
  projects: {
    icon: FolderX,
    title: 'Limite de projetos atingido',
    description: 'Faça upgrade para criar mais projetos',
    alertTitle: '1 de 1 projetos ativos',
    alertDescription: 'Você atingiu o limite de projetos. Faça upgrade para criar mais.'
  },
  trial: {
    icon: Clock,
    title: 'Seu período de teste acabou',
    description: 'Continue aproveitando com um plano pago',
    alertTitle: 'Trial finalizado',
    alertDescription: 'Continue aproveitando todos os recursos com um plano pago.'
  }
};

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  context = 'credits',
  onContinue,
  onError
}: UpgradeModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const config = contextConfig[context];
  const IconComponent = config.icon;

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const totalPrice = billingPeriod === 'monthly' 
    ? selectedPlanData?.priceMonthly 
    : selectedPlanData?.priceYearly;

  const savings = selectedPlanData 
    ? (selectedPlanData.priceMonthly * 12) - selectedPlanData.priceYearly
    : 0;

  const handleContinueToCheckout = async () => {
    if (!selectedPlan) return;

    // Call the optional onContinue callback if provided
    if (onContinue) {
      onContinue(selectedPlan, billingPeriod);
    }

    setIsCreatingCheckout(true);

    try {
      // DEVELOPMENT MODE: Use mock API
      // In production, this will make a real API call to your backend
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('figma.com');

      let checkoutUrl: string;
      let sessionId: string;

      if (isDevelopment) {
        // Use mock for development
        const result = await createCheckoutSession({
          planId: selectedPlan as 'starter' | 'professional',
          billingPeriod: billingPeriod,
          successUrl: `https://app.ktirio.ai/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `https://app.ktirio.ai/upgrade/canceled`
        });
        checkoutUrl = result.checkout_url;
        sessionId = result.session_id;

        console.log('🔧 DEV MODE - Mock Stripe Checkout Session Created:', {
          sessionId,
          checkoutUrl,
          planId: selectedPlan,
          billingPeriod
        });

        // In dev, don't actually redirect - just log
        console.log('✅ In production, user would be redirected to:', checkoutUrl);
        alert(`🔧 DEV MODE\n\nStripe checkout criado!\n\nPlan: ${selectedPlan}\nBilling: ${billingPeriod}\n\nEm produção, você seria redirecionado para:\n${checkoutUrl}`);
        setIsCreatingCheckout(false);
        onClose();
      } else {
        // Production: Make real API call
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: selectedPlan,
            billingPeriod: billingPeriod,
            successUrl: `https://app.ktirio.ai/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `https://app.ktirio.ai/upgrade/canceled`
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const data = await response.json();
        
        // Redirect to Stripe Checkout
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          throw new Error('No checkout URL received');
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsCreatingCheckout(false);
      
      const errorMessage = 'Erro ao criar sessão de checkout. Por favor, tente novamente.';
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center animate-fadeIn"
      style={{ 
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        className="w-[560px] max-h-[90vh] bg-white rounded-3xl overflow-hidden animate-slideUp"
        style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="relative py-8 px-8 pb-6 text-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] transition-colors"
          >
            <X className="w-5 h-5 text-[#717182]" />
          </button>

          {/* Icon Principal */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #030213 0%, #252525 100%)',
              boxShadow: '0 4px 12px rgba(3, 2, 19, 0.2)'
            }}
          >
            <IconComponent className="w-8 h-8 text-white" />
          </div>

          {/* Título */}
          <h2 className="text-[24px] text-[#030213] mb-2">
            {config.title}
          </h2>

          {/* Descrição */}
          <p className="text-base text-[#717182] leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* MODAL BODY */}
        <div className="px-8 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Alert Box */}
          <div 
            className="p-4 rounded-xl mb-6"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-[#252525] mb-1">
                  {config.alertTitle}
                </p>
                <p className="text-xs text-[#717182]">
                  {config.alertDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Escolha seu plano */}
          <h3 className="text-base text-[#252525] mb-4">
            Escolha seu plano
          </h3>

          {/* Toggle Billing */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                billingPeriod === 'monthly' 
                  ? 'bg-[#F3F3F5] text-[#030213]' 
                  : 'bg-transparent text-[#717182] hover:bg-[#FAFAFA]'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-3 py-1.5 rounded-lg text-[13px] transition-colors flex items-center gap-1.5 ${
                billingPeriod === 'yearly' 
                  ? 'bg-[#F3F3F5] text-[#030213]' 
                  : 'bg-transparent text-[#717182] hover:bg-[#FAFAFA]'
              }`}
            >
              Anual
              <span className="px-1.5 py-0.5 bg-[#10B981] text-white text-[10px] rounded">
                -20%
              </span>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="space-y-4">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
              const displayPrice = billingPeriod === 'yearly' ? Math.round(price / 12) : price;

              return (
                <div key={plan.id} className="relative">
                  {/* Badge Recomendado */}
                  {plan.isRecommended && (
                    <div 
                      className="absolute -top-2 right-5 px-3 py-1 rounded-full text-white text-[11px] z-10"
                      style={{ background: '#030213' }}
                    >
                      Recomendado
                    </div>
                  )}

                  {/* Card */}
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full p-5 rounded-xl transition-all text-left ${
                      isSelected 
                        ? 'bg-white border-2 border-[#030213]'
                        : plan.isRecommended
                        ? 'bg-white border-2 border-[#030213]'
                        : 'bg-[#FAFAFA] border-2 border-transparent hover:border-[#E9EBEF]'
                    }`}
                    style={{
                      boxShadow: isSelected || plan.isRecommended ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      {/* Esquerda - Info */}
                      <div className="flex-1">
                        {/* Nome do Plano */}
                        <p className="text-sm text-[#717182] uppercase mb-1">
                          {plan.name}
                        </p>

                        {/* Preço */}
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-[28px] text-[#030213]">
                            R$ {displayPrice}
                          </span>
                          <span className="text-sm text-[#717182]">
                            /mês
                          </span>
                        </div>

                        {/* Features */}
                        <div className="space-y-1.5">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                              <span className="text-[13px] text-[#252525]">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Economia Badge (se anual) */}
                        {billingPeriod === 'yearly' && plan.isRecommended && (
                          <div 
                            className="inline-block mt-2 px-2 py-1 rounded-md text-[11px]"
                            style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#10B981'
                            }}
                          >
                            Economize R$ {savings}/ano
                          </div>
                        )}
                      </div>

                      {/* Direita - Radio */}
                      <div className="ml-4 flex-shrink-0">
                        <div 
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'border-[#030213]' 
                              : 'border-[#E9EBEF]'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#030213]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div 
          className="px-8 py-6 border-t border-[#E9EBEF] bg-[#FAFAFA]"
        >
          <div className="flex items-center justify-between">
            {/* Total */}
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-[#717182]">Total:</span>
              <span className="text-lg text-[#030213]">
                R$ {totalPrice?.toFixed(2)}{billingPeriod === 'monthly' ? '/mês' : '/ano'}
              </span>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="h-11"
                onClick={onClose}
                disabled={isCreatingCheckout}
              >
                Voltar
              </Button>
              <Button 
                className="h-11"
                disabled={!selectedPlan || isCreatingCheckout}
                onClick={handleContinueToCheckout}
              >
                {isCreatingCheckout ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparando checkout...
                  </>
                ) : (
                  <>
                    Continuar para pagamento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
