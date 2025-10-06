import { useState } from 'react';
import { ChevronLeft, User, CreditCard, Bell, Shield, Lock, Receipt, Settings as SettingsIcon } from 'lucide-react';
import SettingsProfile from './SettingsProfile';
import SettingsPlanUsage from './SettingsPlanUsage';
import SettingsNotifications from './SettingsNotifications';
import SettingsSecurity from './SettingsSecurity';
import SettingsPrivacy from './SettingsPrivacy';
import SettingsBilling from './SettingsBilling';
import SettingsDeveloper from './SettingsDeveloper';
import FeatureLockModal, { FeatureType } from './FeatureLockModal';
import { BannerVariant } from './TrialEndedBanner';
import { SoftPaywallVariant } from './SoftPaywall';

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
}

type SettingsTab = 'perfil' | 'plano' | 'notificacoes' | 'seguranca' | 'privacidade' | 'faturamento' | 'developer';

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
  onOpenBuyCredits
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('perfil');
  const [featureLockModal, setFeatureLockModal] = useState<{ isOpen: boolean; feature: FeatureType | null }>({
    isOpen: false,
    feature: null,
  });

  const handleFeatureLock = (feature: FeatureType) => {
    setFeatureLockModal({ isOpen: true, feature });
  };

  const navItems = [
    { id: 'perfil' as SettingsTab, icon: User, label: 'Perfil' },
    { id: 'plano' as SettingsTab, icon: CreditCard, label: 'Plano e Uso' },
    { id: 'notificacoes' as SettingsTab, icon: Bell, label: 'Notificações' },
    { id: 'seguranca' as SettingsTab, icon: Shield, label: 'Segurança' },
    { id: 'privacidade' as SettingsTab, icon: Lock, label: 'Privacidade' },
    { id: 'faturamento' as SettingsTab, icon: Receipt, label: 'Faturamento' },
    { id: 'developer' as SettingsTab, icon: SettingsIcon, label: 'Developer', isDev: true },
  ];

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      {/* HEADER - Card Flutuante */}
      <header 
        className="bg-white rounded-2xl border border-black/[0.06] flex items-center px-6 py-4 gap-4 mb-6"
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
      <div className="flex flex-1 gap-6">
        {/* SIDEBAR - Card Flutuante */}
        <aside 
          className="w-60 bg-[#FAFAFA] rounded-2xl border border-black/[0.06] flex flex-col gap-1 p-4 sticky top-6 self-start"
          style={{ 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            minHeight: 'calc(100vh - 140px)'
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

        {/* CONTENT AREA */}
        <main className="flex-1">
          <div className="max-w-[800px]">
            {activeTab === 'perfil' && <SettingsProfile />}

            {activeTab === 'plano' && <SettingsPlanUsage onOpenPricing={onOpenPricing} />}

            {activeTab === 'notificacoes' && <SettingsNotifications />}

            {activeTab === 'seguranca' && <SettingsSecurity />}

            {activeTab === 'privacidade' && <SettingsPrivacy />}

            {activeTab === 'faturamento' && <SettingsBilling />}

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
