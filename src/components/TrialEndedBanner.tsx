import { AlertTriangle, AlertCircle, XCircle, CreditCard, Zap, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

export type BannerVariant = 'trial-ended' | 'credits-low' | 'plan-expired' | 'payment-failed';

interface TrialEndedBannerProps {
  variant?: BannerVariant;
  onCtaClick: () => void;
  onDismiss?: () => void;
  remainingCredits?: number;
  totalCredits?: number;
}

const variantConfig = {
  'trial-ended': {
    gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    icon: AlertTriangle,
    title: 'Seu período de teste terminou',
    description: 'Faça upgrade para continuar gerando imagens incríveis',
    ctaText: 'Ver planos',
    ctaIcon: ArrowRight,
    credits: '0 créditos',
    showCredits: true,
  },
  'credits-low': {
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    icon: AlertCircle,
    title: 'Seus créditos estão acabando',
    description: (remaining: number, total: number) => `${remaining} de ${total} créditos restantes`,
    ctaText: 'Comprar créditos',
    ctaIcon: ArrowRight,
    credits: null,
    showCredits: false,
  },
  'plan-expired': {
    gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    icon: XCircle,
    title: 'Sua assinatura expirou',
    description: 'Renove para continuar acessando',
    ctaText: 'Renovar agora',
    ctaIcon: ArrowRight,
    credits: '0 créditos',
    showCredits: true,
  },
  'payment-failed': {
    gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    icon: CreditCard,
    title: 'Problema com pagamento',
    description: 'Atualize seus dados de pagamento',
    ctaText: 'Atualizar cartão',
    ctaIcon: ArrowRight,
    credits: null,
    showCredits: false,
  },
};

export default function TrialEndedBanner({
  variant = 'trial-ended',
  onCtaClick,
  onDismiss,
  remainingCredits = 1,
  totalCredits = 5,
}: TrialEndedBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const getDescription = () => {
    if (typeof config.description === 'function') {
      return config.description(remainingCredits, totalCredits);
    }
    return config.description;
  };

  return (
    <div
      className="sticky top-0 w-full z-[999] animate-slideDown"
      style={{
        background: config.gradient,
        boxShadow:
          variant === 'credits-low'
            ? '0 4px 12px rgba(245, 158, 11, 0.2)'
            : '0 4px 12px rgba(220, 38, 38, 0.2)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Icon className="w-6 h-6 text-white shrink-0 animate-pulse" style={{ animationDuration: '2s' }} />

          <div className="flex-1 min-w-0">
            <h3
              className="text-white mb-1"
              style={{ fontSize: '16px', fontWeight: 700 }}
            >
              {config.title}
            </h3>
            <p
              className="text-white/90 hidden sm:block"
              style={{ fontSize: '13px' }}
            >
              {getDescription()}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          {/* Credits Info (se aplicável) */}
          {config.showCredits && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20">
              <Zap className="w-4 h-4 text-white/80" />
              <span
                className="text-white/90"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                {config.credits}
              </span>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={onCtaClick}
            className="group px-6 py-2.5 bg-white rounded-lg flex items-center gap-2 transition-all hover:scale-105 hover:shadow-lg"
            style={{
              color: variant === 'credits-low' ? '#F59E0B' : '#DC2626',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {config.ctaText}
            {config.ctaIcon && <config.ctaIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
          </button>

          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
              title="Ocultar por hoje"
            >
              <X className="w-4.5 h-4.5 text-white/80" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
