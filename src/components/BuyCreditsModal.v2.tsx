import { useState } from 'react';
import { X, Zap, Check, Info, Shield, Clock, RefreshCw, ArrowRight, Sliders, ChevronRight } from 'lucide-react';
import { useCredits } from '../hooks/useCredits';

interface Package {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  badge?: {
    text: string;
    color: string;
  };
  savings?: number;
  features: string[];
}

const packages: Package[] = [
  {
    id: 'small',
    name: 'Small',
    credits: 100,
    price: 14.99,
    pricePerCredit: 0.15,
    features: [
      'Validade de 90 dias',
      'Todos os estilos',
      'Qualidade alta'
    ]
  },
  {
    id: 'medium',
    name: 'Medium',
    credits: 250,
    price: 34.99,
    pricePerCredit: 0.14,
    badge: {
      text: 'Melhor Valor',
      color: 'green'
    },
    savings: 7,
    features: [
      'Validade de 120 dias',
      'Todos os estilos',
      'Qualidade máxima',
      'Suporte prioritário'
    ]
  },
  {
    id: 'large',
    name: 'Large',
    credits: 500,
    price: 64.99,
    pricePerCredit: 0.13,
    savings: 13,
    features: [
      'Validade de 180 dias',
      'Todos os estilos',
      'Qualidade máxima',
      'Suporte VIP',
      'Acesso antecipado'
    ]
  }
];

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans?: () => void;
  userId: string;
}

export default function BuyCreditsModal({
  isOpen,
  onClose,
  onViewPlans,
  userId
}: BuyCreditsModalProps) {
  const { credits, createPackCheckout } = useCredits(userId);
  const [selectedPackage, setSelectedPackage] = useState<string>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selected = packages.find(p => p.id === selectedPackage);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Criar checkout no Stripe
      const checkoutUrl = await createPackCheckout(selectedPackage);

      // Redirecionar para o Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Erro ao criar checkout:', err);
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-[640px] max-h-[90vh] bg-white rounded-3xl overflow-hidden animate-slideUp"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Content */}
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="relative px-8 pt-8 pb-6 text-center">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F3F5] transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 text-[#717182]" />
            </button>

            {/* Icon Container */}
            <div
              className="w-[72px] h-[72px] mx-auto mb-5 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Zap className="w-9 h-9 text-white" fill="white" />
            </div>

            {/* Title */}
            <h2 className="text-[#030213] mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
              Comprar Créditos
            </h2>

            {/* Description */}
            <p className="text-[#717182]" style={{ fontSize: '16px', lineHeight: 1.5 }}>
              Escolha o pacote ideal para suas necessidades
            </p>

            {/* Current Balance */}
            <div
              className="mt-5 px-5 py-3 mx-auto max-w-fit rounded-xl flex items-center gap-2"
              style={{
                background: '#FAFAFA',
                border: '1px solid #E9EBEF'
              }}
            >
              <Zap className="w-4 h-4 text-[#030213]" />
              <span className="text-[#252525]" style={{ fontSize: '14px', fontWeight: 500 }}>
                Saldo atual: {credits} créditos
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 pb-8 pt-6">
            {/* Error Message */}
            {error && (
              <div
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </div>
            )}

            {/* Packages Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className="relative px-5 py-6 bg-white rounded-2xl cursor-pointer transition-all duration-200 text-left"
                  style={{
                    border: selectedPackage === pkg.id
                      ? '3px solid #030213'
                      : '2px solid #E9EBEF',
                    background: selectedPackage === pkg.id ? '#FAFAFA' : '#FFFFFF',
                    boxShadow: selectedPackage === pkg.id
                      ? '0 8px 20px rgba(0, 0, 0, 0.12)'
                      : 'none',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPackage !== pkg.id) {
                      e.currentTarget.style.borderColor = '#CBCED4';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPackage !== pkg.id) {
                      e.currentTarget.style.borderColor = '#E9EBEF';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <div
                      className="absolute -top-[10px] left-1/2 px-4 py-1.5 rounded-full text-white uppercase"
                      style={{
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      {pkg.badge.text}
                    </div>
                  )}

                  {/* Radio Button */}
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                    style={{
                      border: selectedPackage === pkg.id ? '2px solid #030213' : '2px solid #E9EBEF'
                    }}
                  >
                    {selectedPackage === pkg.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#030213]" />
                    )}
                  </div>

                  {/* Credits Amount */}
                  <div className="text-center mb-1">
                    <div className="text-[#030213]" style={{ fontSize: pkg.id === 'medium' ? '52px' : '48px', fontWeight: 700, lineHeight: 1 }}>
                      {pkg.credits}
                    </div>
                    <div className="text-[#717182]" style={{ fontSize: '14px' }}>
                      créditos
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="my-4 h-px bg-[#E9EBEF]" />

                  {/* Price */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-[#030213]" style={{ fontSize: '24px', fontWeight: 700 }}>
                        $ {Math.floor(pkg.price)}
                      </span>
                      <span className="text-[#030213]" style={{ fontSize: '18px', fontWeight: 700 }}>
                        .{(pkg.price % 1).toFixed(2).split('.')[1]}
                      </span>
                    </div>

                    {/* Price per Credit */}
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      <span
                        className={pkg.savings ? 'text-[#10B981]' : 'text-[#717182]'}
                        style={{ fontSize: '12px', fontWeight: 500 }}
                      >
                        ${pkg.pricePerCredit.toFixed(2)}/crédito
                      </span>
                      {pkg.savings && (
                        <span
                          className="px-2 py-0.5 rounded text-[#10B981]"
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            fontSize: '10px',
                            fontWeight: 600
                          }}
                        >
                          Economize {pkg.savings}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-4 space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#10B981] shrink-0" strokeWidth={3} />
                        <span className="text-[#252525]" style={{ fontSize: '12px' }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Info Section */}
            <div
              className="p-5 rounded-xl flex gap-3 mt-6"
              style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <Info className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#252525]" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                  💡 <strong>Dica:</strong> Para uso frequente, considere nossas assinaturas mensais com créditos recorrentes e economia adicional.{' '}
                  {onViewPlans && (
                    <button
                      onClick={onViewPlans}
                      className="text-[#3B82F6] hover:underline"
                      style={{ fontSize: '13px', fontWeight: 500 }}
                    >
                      Ver planos de assinatura
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-6 flex items-center justify-between"
            style={{
              borderTop: '1px solid #E9EBEF',
              background: '#FAFAFA'
            }}
          >
            {/* Left - Total */}
            <div className="flex items-baseline gap-2">
              <span className="text-[#717182]" style={{ fontSize: '14px' }}>
                Total:
              </span>
              <span className="text-[#030213]" style={{ fontSize: '22px', fontWeight: 700 }}>
                ${selected?.price.toFixed(2)}
              </span>
              <span className="text-[#717182]" style={{ fontSize: '12px' }}>
                {selected?.credits} créditos
              </span>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-6 h-12 text-[#030213] rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedPackage || isProcessing}
                className="px-8 h-12 bg-[#030213] text-white rounded-lg hover:bg-[#252525] disabled:bg-[#CBCED4] disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    Comprar agora
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="px-8 pb-6 pt-4 flex items-center justify-center gap-6 opacity-60">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[#252525]" style={{ fontSize: '11px' }}>
                Pagamento seguro
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="text-[#252525]" style={{ fontSize: '11px' }}>
                Créditos instantâneos
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[#252525]" style={{ fontSize: '11px' }}>
                Compra única
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
