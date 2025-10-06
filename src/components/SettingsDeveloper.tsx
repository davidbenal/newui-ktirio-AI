import { Settings, Sparkles, FolderOpen, Clock, PlayCircle, RefreshCw, HelpCircle, Lock, Flag, Eye } from 'lucide-react';
import { FeatureType } from './FeatureLockModal';
import { BannerVariant } from './TrialEndedBanner';
import { SoftPaywallVariant } from './SoftPaywall';

interface SettingsDeveloperProps {
  onOpenUpgradeModal?: (context: 'feature' | 'projects' | 'trial' | 'credits') => void;
  onNavigateToWelcome?: () => void;
  onStartTour?: () => void;
  onResetFirstTime?: () => void;
  isFirstTimeUser?: boolean;
  onFeatureLock?: (feature: FeatureType) => void;
  onShowBanner?: (variant: BannerVariant) => void;
  onShowSoftPaywall?: (variant: SoftPaywallVariant) => void;
  onOpenBuyCredits?: () => void;
}

export default function SettingsDeveloper({
  onOpenUpgradeModal,
  onNavigateToWelcome,
  onStartTour,
  onResetFirstTime,
  isFirstTimeUser = false,
  onFeatureLock,
  onShowBanner,
  onShowSoftPaywall,
  onOpenBuyCredits
}: SettingsDeveloperProps) {
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-900">
              Ferramentas de desenvolvimento e teste. Use apenas para fins de depuração e teste.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal Tests */}
      <section className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">Upgrade Modal</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Teste os diferentes contextos do modal de upgrade.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onOpenUpgradeModal?.('feature')}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
          >
            🔒 Feature Bloqueada
          </button>
          <button
            onClick={() => onOpenUpgradeModal?.('projects')}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
          >
            📁 Limite de Projetos
          </button>
          <button
            onClick={() => onOpenUpgradeModal?.('trial')}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
          >
            ⏰ Trial Finalizado
          </button>
          <button
            onClick={() => onOpenUpgradeModal?.('credits')}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
          >
            💎 Sem Créditos
          </button>
        </div>
      </section>

      {/* Buy Credits Modal Test */}
      <section className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-gray-900">Buy Credits Modal</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Teste o modal de compra de créditos avulsos.
        </p>
        <button
          onClick={() => onOpenBuyCredits?.()}
          className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
        >
          💳 Abrir Buy Credits Modal
        </button>
      </section>

      {/* Feature Lock Tests */}
      <section className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">Feature Lock Modal</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Teste os modais de bloqueio de features específicas.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onFeatureLock?.('api')}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
          >
            💻 API de Integração
          </button>
          <button
            onClick={() => onFeatureLock?.('batch')}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
          >
            ⚡ Batch Processing
          </button>
          <button
            onClick={() => onFeatureLock?.('whitelabel')}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
          >
            🎨 White Label
          </button>
          <button
            onClick={() => onFeatureLock?.('collaboration')}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
          >
            👥 Colaboração
          </button>
        </div>
      </section>

      {/* Trial Ended Banner Tests */}
      <section className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Flag className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">Trial Ended Banner</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Teste os banners de notificação no topo do app.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onShowBanner?.('trial-ended')}
            className="px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm text-red-700 transition-colors flex items-center gap-2"
          >
            ⏰ Trial Ended
          </button>
          <button
            onClick={() => onShowBanner?.('credits-low')}
            className="px-4 py-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-yellow-700 transition-colors flex items-center gap-2"
          >
            ⚠️ Créditos Baixos
          </button>
          <button
            onClick={() => onShowBanner?.('plan-expired')}
            className="px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm text-red-700 transition-colors flex items-center gap-2"
          >
            ❌ Plano Expirado
          </button>
          <button
            onClick={() => onShowBanner?.('payment-failed')}
            className="px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm text-red-700 transition-colors flex items-center gap-2"
          >
            💳 Payment Failed
          </button>
        </div>
      </section>

      {/* Soft Paywall Tests */}
      <section className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">Soft Paywall</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Preview limitado que incentiva upgrade sem bloquear completamente.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onShowSoftPaywall?.('high-resolution')}
            className="px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm text-blue-700 transition-colors flex items-center gap-2"
          >
            🖼️ Alta Resolução (Blur)
          </button>
          <button
            onClick={() => onShowSoftPaywall?.('batch-processing')}
            className="px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm text-purple-700 transition-colors flex items-center gap-2"
          >
            📦 Batch Processing
          </button>
          <button
            onClick={() => onShowSoftPaywall?.('watermark-removal')}
            className="px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm text-green-700 transition-colors flex items-center gap-2"
          >
            ✨ Watermark Removal
          </button>
        </div>
      </section>

      {/* Onboarding & Tour */}
      <section className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <PlayCircle className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">Onboarding & Tour</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Reveja as telas de boas-vindas e tours guiados.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => onNavigateToWelcome?.()}
            className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm text-blue-700 transition-colors flex items-center gap-2"
          >
            👋 Ver Welcome Screen
          </button>
          <button
            onClick={() => onStartTour?.()}
            className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm text-purple-700 transition-colors flex items-center gap-2"
          >
            🎯 Iniciar Tour Guiado
          </button>
        </div>
      </section>

      {/* First-Time Experience */}
      <section className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">Experiência de Primeira Vez</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Status: {isFirstTimeUser ? '✅ Ativo' : '❌ Desativado'}
        </p>
        <button
          onClick={() => onResetFirstTime?.()}
          disabled={isFirstTimeUser}
          className={`w-full px-4 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
            isFirstTimeUser
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700'
          }`}
        >
          🔄 Resetar Experiência
        </button>
        {isFirstTimeUser && (
          <p className="text-xs text-gray-500 text-center">
            A experiência de primeira vez já está ativa.
          </p>
        )}
      </section>

      {/* Purchase Success Modal Test */}
      <section className="bg-white rounded-xl border border-black/[0.06] p-6 space-y-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <PlayCircle className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-900">Purchase Success Modal</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Simular retorno do Stripe Checkout após compra de créditos.
        </p>
        <button
          onClick={() => {
            // Simulate Stripe redirect with session_id
            window.location.href = '/credits/success?session_id=cs_test_' + Math.random().toString(36).substring(7);
          }}
          className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm text-green-700 transition-colors flex items-center justify-center gap-2"
        >
          ✅ Simular Compra Bem-sucedida
        </button>
      </section>

      {/* Info */}
      <section className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-gray-500 mt-0.5" />
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Atalhos úteis:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">Ctrl+Shift+H</code> - Debug Panel (Editor)</li>
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">Ctrl+Shift+D</code> - Developer Tools (futuro)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
