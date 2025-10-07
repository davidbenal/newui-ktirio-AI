import { useState } from 'react';
import { ChevronLeft, User, CreditCard, Bell, Shield, Lock, Receipt, Settings as SettingsIcon, UserCog } from 'lucide-react';
import SettingsProfile from './SettingsProfile';
import SettingsPlanUsage from './SettingsPlanUsage';
import SettingsNotifications from './SettingsNotifications';
import SettingsSecurity from './SettingsSecurity';
import SettingsPrivacy from './SettingsPrivacy';
import SettingsBilling from './SettingsBilling';
import SettingsDeveloper from './SettingsDeveloper';
import SettingsAdmin from './SettingsAdmin';
import FeatureLockModal, { FeatureType } from './FeatureLockModal';
import { BannerVariant } from './TrialEndedBanner';
import { SoftPaywallVariant } from './SoftPaywall';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

interface SettingsProps {
  onBack: () => void;
  onOpenPricing?: () => void;
  onOpenUpgradeModal?: (context: 'feature' | 'projects' | 'trial' | 'credits') => void;
  onNavigateToWelcome?: () => void;
  onStartTour?: () => void;
  onResetFirstTime?: () => void;
  isFirstTimeUser?: boolean;
  onShowBanner?: (variant: BannerVariant) => void;
  onShowSoftPaywall?: (variant: SoftPaywallVariant) => void;
  onOpenBuyCredits?: () => void;
  onSignOut?: () => void;
}

type SettingsTab = 'perfil' | 'plano' | 'notificacoes' | 'seguranca' | 'privacidade' | 'faturamento' | 'developer' | 'admin';

export default function Settings({
  onBack,
  onOpenPricing,
  onOpenUpgradeModal,
  onNavigateToWelcome,
  onStartTour,
  onResetFirstTime,
  isFirstTimeUser = false,
  onShowBanner,
  onShowSoftPaywall,
  onOpenBuyCredits,
  onSignOut
}: SettingsProps) {
  const { user } = useFirebaseUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('perfil');
  const [featureLockModal, setFeatureLockModal] = useState<{ isOpen: boolean; feature: FeatureType | null }>({
    isOpen: false,
    feature: null,
  });

  const handleFeatureLock = (feature: FeatureType) => {
    setFeatureLockModal({ isOpen: true, feature });
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const navItems = [
    { id: 'perfil' as SettingsTab, icon: User, label: 'Perfil' },
    { id: 'plano' as SettingsTab, icon: CreditCard, label: 'Plano e Uso' },
    { id: 'notificacoes' as SettingsTab, icon: Bell, label: 'Notificações' },
    { id: 'seguranca' as SettingsTab, icon: Shield, label: 'Segurança' },
    { id: 'privacidade' as SettingsTab, icon: Lock, label: 'Privacidade' },
    { id: 'faturamento' as SettingsTab, icon: Receipt, label: 'Faturamento' },
    ...(isAdmin ? [{ id: 'admin' as SettingsTab, icon: UserCog, label: 'Admin', isAdmin: true }] : []),
    { id: 'developer' as SettingsTab, icon: SettingsIcon, label: 'Developer', isDev: true },
  ];

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* HEADER - Card Flutuante */}
      <header
        className="bg-white rounded-2xl border border-black/[0.06] flex items-center px-6 py-4 gap-4 m-6 mb-0 shrink-0"
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
      >
        {/* Botão Voltar */}
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Título */}
        <h1 className="text-foreground">Configurações</h1>
      </header>

      {/* BODY */}
      <div className="flex gap-6 p-6 flex-1 min-h-0">
        {/* SIDEBAR - Card Flutuante */}
        <aside
          className="w-60 bg-[#FAFAFA] rounded-2xl border border-black/[0.06] flex flex-col gap-1 p-4 shrink-0 h-full"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <nav className="flex flex-col gap-1" role="navigation" aria-label="Navegação de configurações">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDev = 'isDev' in item && item.isDev;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full h-10 px-3 rounded-lg flex items-center gap-3 transition-all
                    ${
                      isActive
                        ? 'bg-accent text-primary'
                        : 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }
                    ${isDev ? 'mt-4 border-t border-gray-200 pt-4' : ''}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                  {isDev && <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">DEV</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* CONTENT AREA - Com scroll */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-[800px] pb-6">
            {activeTab === 'perfil' && <SettingsProfile onSignOut={onSignOut} />}

            {activeTab === 'plano' && <SettingsPlanUsage onOpenPricing={onOpenPricing} />}

            {activeTab === 'notificacoes' && <SettingsNotifications />}

            {activeTab === 'seguranca' && <SettingsSecurity />}

            {activeTab === 'privacidade' && <SettingsPrivacy />}

            {activeTab === 'faturamento' && <SettingsBilling />}

            {activeTab === 'admin' && <SettingsAdmin />}

            {activeTab === 'developer' && (
              <SettingsDeveloper
                onOpenUpgradeModal={onOpenUpgradeModal}
                onNavigateToWelcome={onNavigateToWelcome}
                onStartTour={onStartTour}
                onResetFirstTime={onResetFirstTime}
                isFirstTimeUser={isFirstTimeUser}
                onFeatureLock={handleFeatureLock}
                onShowBanner={onShowBanner}
                onShowSoftPaywall={onShowSoftPaywall}
                onOpenBuyCredits={onOpenBuyCredits}
              />
            )}
          </div>
        </main>
      </div>

      {/* Feature Lock Modal */}
      {featureLockModal.feature && (
        <FeatureLockModal
          isOpen={featureLockModal.isOpen}
          onClose={() => setFeatureLockModal({ isOpen: false, feature: null })}
          feature={featureLockModal.feature}
          onUpgrade={() => {
            if (onOpenUpgradeModal) {
              onOpenUpgradeModal('feature');
            }
          }}
          onViewAllPlans={() => {
            if (onOpenPricing) {
              onOpenPricing();
            }
          }}
        />
      )}
    </div>
  );
}
