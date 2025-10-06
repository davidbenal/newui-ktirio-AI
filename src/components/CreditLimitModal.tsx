import { Zap, Crown, Plus, ArrowRight } from 'lucide-react';

interface CreditLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onBuyCredits: () => void;
  creditsUsed?: number;
  creditsTotal?: number;
  daysUntilReset?: number;
}

export default function CreditLimitModal({
  isOpen,
  onClose,
  onUpgrade,
  onBuyCredits,
  creditsUsed = 5,
  creditsTotal = 5,
  daysUntilReset = 23,
}: CreditLimitModalProps) {
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-[520px] mx-4 p-10 text-center animate-slideUp"
        style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Container */}
        <div 
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Zap className="w-10 h-10 text-white animate-pulse" style={{ animationDuration: '2s' }} />
        </div>

        {/* Título */}
        <h2 className="text-[#030213] mb-3" style={{ fontSize: '26px', fontWeight: 700 }}>
          Ops! Seus créditos acabaram
        </h2>

        {/* Descrição */}
        <p className="text-[#717182] mb-8" style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Você usou todos os seus {creditsTotal} créditos gratuitos este mês.
        </p>

        {/* Credit Status Card */}
        <div className="p-5 bg-[#FAFAFA] border border-[#E9EBEF] rounded-xl mb-8">
          <div className="flex items-center justify-between">
            {/* Esquerda */}
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#717182]" />
              <div className="text-left">
                <p className="text-[#717182] text-xs">Créditos disponíveis</p>
                <p className="text-[#030213] mt-1" style={{ fontSize: '18px', fontWeight: 700 }}>
                  {creditsTotal - creditsUsed} de {creditsTotal}
                </p>
              </div>
            </div>

            {/* Direita */}
            <div className="text-right">
              <p className="text-[#717182]" style={{ fontSize: '14px', fontWeight: 500 }}>
                Resetam em
              </p>
              <p className="text-[#717182]" style={{ fontSize: '14px', fontWeight: 500 }}>
                {daysUntilReset} dias
              </p>
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="text-left mb-6">
          <h3 className="text-[#252525] mb-4" style={{ fontSize: '16px', fontWeight: 500 }}>
            Escolha uma opção:
          </h3>

          <div className="space-y-3">
            {/* Option 1: Upgrade (Recomendado) */}
            <button
              onClick={() => {
                onUpgrade();
                onClose();
              }}
              className="w-full p-5 rounded-xl cursor-pointer transition-all relative group"
              style={{ 
                background: 'linear-gradient(135deg, #030213 0%, #252525 100%)',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Badge Recomendado */}
              <div 
                className="absolute -top-2 right-4 bg-[#10B981] text-white px-3 py-1 rounded-full"
                style={{ fontSize: '11px', fontWeight: 700 }}
              >
                Recomendado
              </div>

              <div className="flex items-center justify-between">
                {/* Esquerda */}
                <div className="flex items-center gap-3">
                  <Crown className="w-7 h-7 text-white" />
                  <div className="text-left">
                    <p className="text-white mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                      Fazer upgrade
                    </p>
                    <p className="text-white/80" style={{ fontSize: '13px' }}>
                      200 créditos/mês • A partir de R$ 49
                    </p>
                  </div>
                </div>

                {/* Direita */}
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* Option 2: Comprar Créditos Avulsos */}
            <button
              onClick={() => {
                onBuyCredits();
                onClose();
              }}
              className="w-full p-5 bg-white border-2 border-[#E9EBEF] rounded-xl cursor-pointer transition-all hover:border-[#CBCED4]"
            >
              <div className="flex items-center justify-between">
                {/* Esquerda */}
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 text-[#030213]" />
                  <div className="text-left">
                    <p className="text-[#030213] mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Comprar créditos avulsos
                    </p>
                    <p className="text-[#717182]" style={{ fontSize: '12px' }}>
                      10 créditos por R$ 19,90
                    </p>
                  </div>
                </div>

                {/* Direita */}
                <ArrowRight className="w-[18px] h-[18px] text-[#717182]" />
              </div>
            </button>

            {/* Option 3: Aguardar Reset */}
            <button
              onClick={onClose}
              className="w-full text-center mt-5 pt-5 text-[#717182] hover:text-[#030213] hover:underline transition-colors"
              style={{ fontSize: '13px' }}
            >
              Aguardar reset mensal ({daysUntilReset} dias)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-[#E9EBEF]">
          <p className="text-[#717182]" style={{ fontSize: '12px' }}>
            Dúvidas sobre créditos?{' '}
            <button 
              className="hover:underline hover:text-[#030213] transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // Aqui poderia abrir uma página de ajuda ou modal explicativo
              }}
            >
              Ver como funcionam
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
