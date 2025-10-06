import { useState, useEffect } from 'react';
import TrialEndedBanner, { BannerVariant } from './TrialEndedBanner';

/**
 * Exemplo de integração do Trial Ended Banner
 * Demonstra como usar o banner em um cenário real
 */

interface User {
  trialEnded: boolean;
  isPaying: boolean;
  paymentFailed: boolean;
  subscriptionExpired: boolean;
  credits: number;
  totalCredits: number;
}

export default function TrialEndedBannerExample() {
  const [bannerVariant, setBannerVariant] = useState<BannerVariant | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [currentView, setCurrentView] = useState<'app' | 'pricing' | 'settings'>('app');

  // Simula diferentes estados de usuário
  const [userState, setUserState] = useState<'trial-ended' | 'credits-low' | 'plan-expired' | 'payment-failed' | 'normal'>('trial-ended');

  const mockUsers: Record<string, User> = {
    'trial-ended': {
      trialEnded: true,
      isPaying: false,
      paymentFailed: false,
      subscriptionExpired: false,
      credits: 0,
      totalCredits: 200,
    },
    'credits-low': {
      trialEnded: false,
      isPaying: true,
      paymentFailed: false,
      subscriptionExpired: false,
      credits: 1,
      totalCredits: 5,
    },
    'plan-expired': {
      trialEnded: false,
      isPaying: false,
      paymentFailed: false,
      subscriptionExpired: true,
      credits: 0,
      totalCredits: 200,
    },
    'payment-failed': {
      trialEnded: false,
      isPaying: true,
      paymentFailed: true,
      subscriptionExpired: false,
      credits: 50,
      totalCredits: 200,
    },
    'normal': {
      trialEnded: false,
      isPaying: true,
      paymentFailed: false,
      subscriptionExpired: false,
      credits: 150,
      totalCredits: 200,
    },
  };

  const currentUser = mockUsers[userState];

  // Lógica para determinar qual banner mostrar
  const checkBannerState = (user: User): BannerVariant | null => {
    // 1. Payment failed (prioridade mais alta)
    if (user.isPaying && user.paymentFailed) {
      return 'payment-failed';
    }

    // 2. Plan expired
    if (user.subscriptionExpired) {
      return 'plan-expired';
    }

    // 3. Trial ended
    if (user.trialEnded && !user.isPaying) {
      return 'trial-ended';
    }

    // 4. Credits low (20% ou menos)
    const percentage = user.credits / user.totalCredits;
    if (percentage <= 0.2 && percentage > 0) {
      return 'credits-low';
    }

    return null;
  };

  // Verificar banner ao montar e quando user state mudar
  useEffect(() => {
    // Verifica se foi dismissado hoje
    const dismissedDate = localStorage.getItem('bannerDismissedDate');
    const today = new Date().toDateString();

    if (dismissedDate === today) {
      setBannerDismissed(true);
    } else {
      setBannerDismissed(false);
    }

    // Determina qual banner mostrar
    const variant = checkBannerState(currentUser);
    setBannerVariant(variant);
  }, [userState]);

  const handleBannerDismiss = () => {
    setBannerDismissed(true);
    const today = new Date().toDateString();
    localStorage.setItem('bannerDismissedDate', today);
    console.log('✅ Banner dismissado até amanhã');
  };

  const handleBannerCta = () => {
    console.log(`🔘 CTA clicado para: ${bannerVariant}`);

    if (bannerVariant === 'trial-ended' || bannerVariant === 'plan-expired') {
      setCurrentView('pricing');
    } else if (bannerVariant === 'credits-low') {
      console.log('Abrindo modal de compra de créditos...');
    } else if (bannerVariant === 'payment-failed') {
      setCurrentView('settings');
    }
  };

  const handleResetDismiss = () => {
    localStorage.removeItem('bannerDismissedDate');
    setBannerDismissed(false);
    console.log('🔄 Dismiss resetado');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      {bannerVariant && !bannerDismissed && (
        <TrialEndedBanner
          variant={bannerVariant}
          onCtaClick={handleBannerCta}
          onDismiss={handleBannerDismiss}
          remainingCredits={currentUser.credits}
          totalCredits={currentUser.totalCredits}
        />
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <h1 className="text-2xl text-gray-900 mb-2">Trial Ended Banner - Exemplo</h1>
          <p className="text-gray-600 mb-6">
            Demonstração de como o banner funciona em diferentes cenários
          </p>

          {/* User State Selector */}
          <div className="mb-8">
            <h3 className="text-lg text-gray-900 mb-3">Estado do Usuário</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => setUserState('trial-ended')}
                className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                  userState === 'trial-ended'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Trial Ended
              </button>
              <button
                onClick={() => setUserState('credits-low')}
                className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                  userState === 'credits-low'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Credits Low
              </button>
              <button
                onClick={() => setUserState('plan-expired')}
                className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                  userState === 'plan-expired'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Plan Expired
              </button>
              <button
                onClick={() => setUserState('payment-failed')}
                className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                  userState === 'payment-failed'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Payment Failed
              </button>
              <button
                onClick={() => setUserState('normal')}
                className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                  userState === 'normal'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Normal (Sem Banner)
              </button>
              <button
                onClick={handleResetDismiss}
                className="px-4 py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm transition-colors"
              >
                Reset Dismiss
              </button>
            </div>
          </div>

          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Informações do Usuário Atual</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Trial Ended:</span>{' '}
                <span className={currentUser.trialEnded ? 'text-red-600' : 'text-green-600'}>
                  {currentUser.trialEnded ? 'Sim' : 'Não'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Paying:</span>{' '}
                <span className={currentUser.isPaying ? 'text-green-600' : 'text-red-600'}>
                  {currentUser.isPaying ? 'Sim' : 'Não'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Payment Failed:</span>{' '}
                <span className={currentUser.paymentFailed ? 'text-red-600' : 'text-green-600'}>
                  {currentUser.paymentFailed ? 'Sim' : 'Não'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Subscription Expired:</span>{' '}
                <span className={currentUser.subscriptionExpired ? 'text-red-600' : 'text-green-600'}>
                  {currentUser.subscriptionExpired ? 'Sim' : 'Não'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Créditos:</span>{' '}
                <span className="text-gray-900">
                  {currentUser.credits} / {currentUser.totalCredits}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Banner Dismissed:</span>{' '}
                <span className={bannerDismissed ? 'text-yellow-600' : 'text-green-600'}>
                  {bannerDismissed ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>

          {/* Current View */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-sm text-blue-900">
                View atual: <strong>{currentView}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Simulated Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl text-gray-900 mb-4">Conteúdo da Aplicação</h2>
          <p className="text-gray-600 mb-4">
            O banner aparece acima de todo o conteúdo, fixo no topo da página.
          </p>
          <p className="text-gray-600 mb-4">
            Experimente trocar o estado do usuário acima para ver diferentes variações do banner.
          </p>
          <p className="text-gray-600">
            Clique no X para dismissar o banner - ele não aparecerá novamente até amanhã
            (ou até você clicar em "Reset Dismiss").
          </p>
        </div>
      </div>
    </div>
  );
}
