import { X, Lock, Code, Layers, Palette, Users, Check, ArrowRight } from 'lucide-react';

export type FeatureType = 'api' | 'batch' | 'whitelabel' | 'collaboration';

interface FeatureLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureType;
  onUpgrade: () => void;
  onViewAllPlans: () => void;
}

const featureConfig = {
  api: {
    icon: Code,
    title: 'API de Integração',
    plan: 'PROFESSIONAL',
    planPrice: 'R$ 89/mês',
    benefits: [
      'Acesso completo à REST API',
      '10.000 requisições/mês',
      'Webhooks inclusos',
      'Documentação técnica completa',
    ],
  },
  batch: {
    icon: Layers,
    title: 'Processamento em Lote',
    plan: 'PROFESSIONAL',
    planPrice: 'R$ 89/mês',
    benefits: [
      'Processar até 50 imagens simultaneamente',
      'Fila de prioridade',
      'Notificações de conclusão',
      'Economia de tempo significativa',
    ],
  },
  whitelabel: {
    icon: Palette,
    title: 'White Label',
    plan: 'BUSINESS',
    planPrice: 'R$ 189/mês',
    benefits: [
      'Remover marca Ktírio',
      'Logo personalizado',
      'Domínio customizado',
      'Branding completo da empresa',
    ],
  },
  collaboration: {
    icon: Users,
    title: 'Colaboração em Equipe',
    plan: 'PROFESSIONAL',
    planPrice: 'R$ 89/mês',
    benefits: [
      'Até 10 membros na equipe',
      'Compartilhamento de projetos',
      'Comentários e feedback',
      'Permissões granulares',
    ],
  },
};

export default function FeatureLockModal({
  isOpen,
  onClose,
  feature,
  onUpgrade,
  onViewAllPlans,
}: FeatureLockModalProps) {
  if (!isOpen) return null;

  const config = featureConfig[feature];
  const FeatureIcon = config.icon;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[480px] mx-4 overflow-hidden animate-slideUp"
        style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER SECTION */}
        <div
          className="relative px-8 pt-8 pb-6 text-center border-b border-[#E9EBEF]"
          style={{
            background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#717182]" />
          </button>

          {/* Icon Container */}
          <div
            className="w-16 h-16 mx-auto mb-4 bg-white border-2 border-[#E9EBEF] rounded-2xl flex items-center justify-center"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
          >
            <FeatureIcon className="w-8 h-8 text-[#717182]" />
          </div>

          {/* Badge de Plano */}
          <div
            className="inline-block bg-[#030213] text-white px-3 py-1.5 rounded-full mb-4"
            style={{ fontSize: '11px', fontWeight: 700 }}
          >
            {config.plan}
          </div>

          {/* Título */}
          <h2
            className="text-[#030213] mb-2"
            style={{ fontSize: '22px', fontWeight: 700 }}
          >
            {config.title}
          </h2>

          {/* Descrição */}
          <p className="text-[#717182]" style={{ fontSize: '14px' }}>
            Esta funcionalidade está disponível no plano {config.plan === 'PROFESSIONAL' ? 'Professional' : 'Business'}
          </p>
        </div>

        {/* BODY SECTION */}
        <div className="px-8 py-6">
          {/* Feature Benefits */}
          <div className="mb-6">
            <h3
              className="text-[#252525] mb-4"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              O que você ganha:
            </h3>

            <div className="space-y-3">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span
                    className="text-[#252525]"
                    style={{ fontSize: '14px' }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-[#E9EBEF] my-6" />

          {/* Price Preview */}
          <div className="p-4 bg-[#FAFAFA] rounded-xl">
            <div className="flex items-center justify-between">
              {/* Esquerda */}
              <div>
                <p
                  className="text-[#252525]"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  {config.plan === 'PROFESSIONAL' ? 'Professional' : 'Business'}
                </p>
                <p
                  className="text-[#030213] mt-1"
                  style={{ fontSize: '18px', fontWeight: 700 }}
                >
                  {config.planPrice}
                </p>
              </div>

              {/* Direita */}
              <div className="text-right">
                <div
                  className="inline-block px-2.5 py-1 rounded-md mb-1"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#10B981',
                  }}
                >
                  Economize 20%
                </div>
                <p
                  className="text-[#717182]"
                  style={{ fontSize: '11px' }}
                >
                  no plano anual
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER SECTION */}
        <div className="px-8 py-6 border-t border-[#E9EBEF] bg-white">
          {/* CTAs */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => {
                onUpgrade();
                onClose();
              }}
              className="flex-[6] h-12 bg-[#030213] hover:bg-[#252525] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Fazer upgrade agora
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onViewAllPlans();
                onClose();
              }}
              className="flex-[4] h-12 bg-white border-2 border-[#E9EBEF] hover:border-[#CBCED4] text-[#030213] rounded-lg flex items-center justify-center transition-colors"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Ver todos os planos
            </button>
          </div>

          {/* Help Link */}
          <div className="text-center">
            <button
              className="text-[#717182] hover:text-[#030213] hover:underline transition-colors"
              style={{ fontSize: '12px' }}
              onClick={(e) => {
                e.preventDefault();
                // Aqui poderia abrir chat ou página de contato
              }}
            >
              Dúvidas? Fale com vendas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
