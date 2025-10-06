import { Lock, Unlock, Check, Layers, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export type SoftPaywallVariant = 'high-resolution' | 'batch-processing' | 'watermark-removal';

interface SoftPaywallProps {
  variant: SoftPaywallVariant;
  onUpgrade: () => void;
  onViewPlans?: () => void;
  // High Resolution props
  previewImage?: string;
  currentResolution?: string;
  lockedResolution?: string;
  // Batch Processing props
  selectedCount?: number;
  previewImages?: string[];
  // Watermark props
  children?: React.ReactNode;
}

export default function SoftPaywall({
  variant,
  onUpgrade,
  onViewPlans,
  previewImage,
  currentResolution = '1024px',
  lockedResolution = '4096px',
  selectedCount = 10,
  previewImages = [],
  children,
}: SoftPaywallProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // VARIAÇÃO 1: ALTA RESOLUÇÃO COM BLUR
  if (variant === 'high-resolution') {
    return (
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        {/* Blurred Image */}
        <div className="absolute inset-0">
          <img
            src={previewImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop'}
            alt="Preview"
            className="w-full h-full object-cover pointer-events-none"
            style={{ filter: 'blur(8px)', opacity: 0.7 }}
          />
        </div>

        {/* Overlay Gradient */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)',
          }}
        >
          {/* Unlock Card */}
          <div
            className="w-80 bg-white rounded-2xl p-6 text-center"
            style={{
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Icon */}
            <div className="w-14 h-14 bg-[#F3F3F5] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#030213]" />
            </div>

            {/* Título */}
            <h3 className="text-[#030213] mb-2" style={{ fontSize: '18px', fontWeight: 700 }}>
              Alta resolução bloqueada
            </h3>

            {/* Descrição */}
            <p className="text-[#717182] mb-5" style={{ fontSize: '13px' }}>
              Faça upgrade para exportar em 4K
            </p>

            {/* Resolution Comparison */}
            <div className="flex justify-center gap-3 mb-5">
              {/* Current (Free) */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-[#717182]" style={{ fontSize: '12px', fontWeight: 500 }}>
                    {currentResolution}
                  </span>
                </div>
                <div
                  className="px-2 py-0.5 bg-gray-100 rounded text-[#717182] inline-block"
                  style={{ fontSize: '10px', fontWeight: 500 }}
                >
                  Atual
                </div>
              </div>

              {/* Locked (Pro) */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Lock className="w-3.5 h-3.5 text-[#030213]" />
                  <span className="text-[#030213]" style={{ fontSize: '13px', fontWeight: 700 }}>
                    {lockedResolution}
                  </span>
                </div>
                <div
                  className="px-2 py-0.5 bg-[#030213] rounded text-white inline-block"
                  style={{ fontSize: '10px', fontWeight: 600 }}
                >
                  Pro
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onUpgrade}
              className="w-full h-11 bg-[#030213] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#030213]/90 transition-colors mb-3"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <Unlock className="w-4 h-4" />
              Desbloquear agora
            </button>

            {/* Link */}
            {onViewPlans && (
              <button
                onClick={onViewPlans}
                className="text-[#717182] hover:text-[#030213] transition-colors"
                style={{ fontSize: '11px' }}
              >
                Ver comparação de planos
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VARIAÇÃO 2: BATCH PROCESSING PREVIEW
  if (variant === 'batch-processing') {
    const visibleImages = previewImages.slice(0, 3);
    const remainingCount = selectedCount - 3;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fadeIn">
        <div className="w-full max-w-[480px] bg-white rounded-2xl p-8 mx-4">
          {/* Preview List */}
          <div className="mb-6 flex gap-2">
            {visibleImages.map((img, idx) => (
              <div
                key={idx}
                className="flex-1 aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {remainingCount > 0 && (
              <div
                className="flex-1 aspect-square bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                <div className="relative z-10 text-white text-center">
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>+{remainingCount}</div>
                  <div style={{ fontSize: '11px' }}>mais</div>
                </div>
              </div>
            )}
          </div>

          {/* Icon */}
          <div className="w-14 h-14 bg-[#F3F3F5] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-[#030213]" />
          </div>

          {/* Título */}
          <h3 className="text-[#030213] text-center mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>
            Processamento em lote
          </h3>

          {/* Descrição */}
          <p className="text-[#717182] text-center mb-6" style={{ fontSize: '14px' }}>
            Processe até 50 imagens simultaneamente
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-[#030213]" style={{ fontSize: '14px' }}>
                Economize 80% do tempo
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-[#030213]" style={{ fontSize: '14px' }}>
                Fila de prioridade
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-[#030213]" style={{ fontSize: '14px' }}>
                Notificações automáticas
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#F3F3F5] rounded-xl p-4 mb-6 text-center">
            <div className="text-[#717182] mb-1" style={{ fontSize: '13px' }}>
              Disponível no plano
            </div>
            <div className="text-[#030213]" style={{ fontSize: '18px', fontWeight: 700 }}>
              Professional
            </div>
            <div className="text-[#717182] mt-1" style={{ fontSize: '14px' }}>
              R$ 89/mês
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onUpgrade}
            className="w-full h-12 bg-[#030213] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#030213]/90 transition-colors"
            style={{ fontSize: '15px', fontWeight: 600 }}
          >
            Fazer upgrade
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // VARIAÇÃO 3: WATERMARK REMOVAL PREVIEW
  if (variant === 'watermark-removal') {
    return (
      <>
        <div
          className="relative w-full group cursor-pointer"
          onClick={() => setShowModal(true)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Image Content */}
          <div className="relative">
            {children}

            {/* Watermark */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#030213]" />
                <span className="text-[#030213]" style={{ fontSize: '11px', fontWeight: 600 }}>
                  Ktírio AI
                </span>
              </div>
            </div>

            {/* Hover Overlay */}
            <div
              className={`absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity duration-200 ${
                showTooltip ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backdropFilter: 'blur(4px)' }}
            >
              {/* Floating Tooltip */}
              <div className="bg-white rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-[#030213]" />
                <span className="text-[#030213]" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Remova a marca d'água
                </span>
                <button
                  className="text-[#030213] hover:text-[#030213]/70 flex items-center gap-1 transition-colors"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                >
                  Upgrade
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full Modal on Click */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fadeIn"
            onClick={() => setShowModal(false)}
          >
            <div
              className="w-full max-w-[600px] bg-white rounded-2xl p-8 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-[#F3F3F5] rounded-xl flex items-center justify-center mx-auto mb-4">
                <EyeOff className="w-8 h-8 text-[#030213]" />
              </div>

              {/* Título */}
              <h3 className="text-[#030213] text-center mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>
                Remova a marca d'água
              </h3>

              {/* Descrição */}
              <p className="text-[#717182] text-center mb-6" style={{ fontSize: '14px' }}>
                Exporte suas imagens sem marca d'água em qualquer plano pago
              </p>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* With Watermark */}
                <div>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-2 relative overflow-hidden">
                    <img
                      src={previewImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop'}
                      alt="Com marca d'água"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-semibold text-[#030213]">
                      Ktírio AI
                    </div>
                  </div>
                  <div className="text-center text-[#717182]" style={{ fontSize: '12px' }}>
                    Plano Free
                  </div>
                </div>

                {/* Without Watermark */}
                <div>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden ring-2 ring-green-500 ring-offset-2">
                    <img
                      src={previewImage || 'https://images.unsplash.com/photo-600585154340-be6161a56a0c?w=400&h=300&fit=crop'}
                      alt="Sem marca d'água"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-[#030213] flex items-center justify-center gap-1" style={{ fontSize: '12px', fontWeight: 600 }}>
                      <Check className="w-3 h-3 text-green-600" />
                      Planos Pagos
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={onUpgrade}
                className="w-full h-12 bg-[#030213] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#030213]/90 transition-colors mb-3"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                Fazer upgrade agora
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full text-[#717182] hover:text-[#030213] transition-colors"
                style={{ fontSize: '13px' }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
