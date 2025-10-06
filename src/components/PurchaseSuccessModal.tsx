import { useState, useEffect } from 'react';
import { CheckCircle, Plus, Zap, Wand2, Receipt, HelpCircle, Sparkles, Download, X } from 'lucide-react';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCreating: () => void;
  onViewReceipt?: () => void;
  onDownloadReceipt?: () => void;
  onHelp?: () => void;
  creditsPurchased: number;
  previousBalance: number;
  receiptNumber?: string;
  purchaseDate?: string;
  userEmail?: string;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  delay: number;
}

export default function PurchaseSuccessModal({
  isOpen,
  onClose,
  onStartCreating,
  onViewReceipt,
  onDownloadReceipt,
  onHelp,
  creditsPurchased,
  previousBalance,
  receiptNumber = '#12345',
  purchaseDate,
  userEmail = 'usuario@exemplo.com'
}: PurchaseSuccessModalProps) {
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);
  const [showContent, setShowContent] = useState(false);

  const currentBalance = previousBalance + creditsPurchased;

  // Format purchase date
  const formattedDate = purchaseDate || new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const particles: ConfettiParticle[] = [];
      const colors = ['#F59E0B', '#10B981', '#3B82F6'];
      
      for (let i = 0; i < 50; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5
        });
      }
      
      setConfettiParticles(particles);

      // Show content with delay
      setTimeout(() => setShowContent(true), 100);

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setConfettiParticles([]);
      }, 3000);

      return () => {
        clearTimeout(timer);
        setShowContent(false);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      {/* Confetti Particles */}
      {confettiParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-sm animate-confettiFall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '3s'
          }}
        />
      ))}

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-[500px] bg-white rounded-3xl p-12 text-center transition-all duration-300 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F3F5] transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-[#717182]" />
        </button>

        {/* Success Icon */}
        <div
          className="w-[88px] h-[88px] mx-auto mb-6 rounded-full flex items-center justify-center animate-scaleInBounce"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)'
          }}
        >
          <CheckCircle className="w-11 h-11 text-white" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h2 className="text-[#030213] mb-3" style={{ fontSize: '28px', fontWeight: 700 }}>
          Créditos adicionados! 🎉
        </h2>

        {/* Description */}
        <p className="text-[#717182] mb-8" style={{ fontSize: '15px', lineHeight: 1.6 }}>
          Seus créditos já estão disponíveis e prontos para uso.
        </p>

        {/* Purchase Summary Card */}
        <div
          className="p-6 rounded-2xl mb-8"
          style={{
            background: 'linear-gradient(135deg, #FAFAFA 0%, #F3F3F5 100%)',
            border: '1px solid #E9EBEF'
          }}
        >
          {/* Credits Purchased */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E9EBEF]">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#10B981]" />
              <span className="text-[#717182]" style={{ fontSize: '14px' }}>
                Créditos comprados
              </span>
            </div>
            <div className="text-[#10B981]" style={{ fontSize: '24px', fontWeight: 700 }}>
              +{creditsPurchased}
            </div>
          </div>

          {/* Current Balance */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#030213]" />
              <span className="text-[#717182]" style={{ fontSize: '14px' }}>
                Saldo atual
              </span>
            </div>
            <div className="text-[#030213]" style={{ fontSize: '24px', fontWeight: 700 }}>
              {currentBalance}
            </div>
          </div>

          {/* Receipt Info */}
          <div
            className="mt-4 pt-4 flex items-center justify-between"
            style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              fontSize: '11px',
              color: '#717182'
            }}
          >
            <span>Recibo {receiptNumber}</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8 text-left">
          <div className="text-[#252525] mb-4" style={{ fontSize: '14px', fontWeight: 500 }}>
            O que fazer agora?
          </div>

          {/* Action Cards */}
          <div className="space-y-3">
            {/* Create New Image */}
            <button
              onClick={() => {
                onClose();
                onStartCreating();
              }}
              className="w-full px-4 py-3.5 bg-white rounded-xl border border-[#E9EBEF] flex items-center gap-3 transition-all hover:border-[#CBCED4] hover:bg-[#FAFAFA]"
            >
              <Wand2 className="w-5 h-5 text-[#030213]" />
              <div className="flex-1 text-left">
                <div className="text-[#030213]" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Criar nova imagem
                </div>
                <div className="text-[#717182]" style={{ fontSize: '11px' }}>
                  Use seus créditos agora
                </div>
              </div>
            </button>

            {/* View Receipt */}
            {onViewReceipt && (
              <button
                onClick={onViewReceipt}
                className="w-full px-4 py-3.5 bg-white rounded-xl border border-[#E9EBEF] flex items-center gap-3 transition-all hover:border-[#CBCED4] hover:bg-[#FAFAFA]"
              >
                <Receipt className="w-5 h-5 text-[#030213]" />
                <div className="flex-1 text-left">
                  <div className="text-[#030213]" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Ver recibo completo
                  </div>
                  <div className="text-[#717182]" style={{ fontSize: '11px' }}>
                    Detalhes da transação
                  </div>
                </div>
              </button>
            )}

            {/* Help */}
            {onHelp && (
              <button
                onClick={onHelp}
                className="w-full px-4 py-3.5 bg-white rounded-xl border border-[#E9EBEF] flex items-center gap-3 transition-all hover:border-[#CBCED4] hover:bg-[#FAFAFA]"
              >
                <HelpCircle className="w-5 h-5 text-[#030213]" />
                <div className="flex-1 text-left">
                  <div className="text-[#030213]" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Dúvidas sobre créditos
                  </div>
                  <div className="text-[#717182]" style={{ fontSize: '11px' }}>
                    Central de ajuda
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-6">
          {/* Primary CTA */}
          <button
            onClick={() => {
              onClose();
              onStartCreating();
            }}
            className="w-full h-12 bg-[#030213] text-white rounded-xl hover:bg-[#252525] transition-colors flex items-center justify-center gap-2"
            style={{ fontSize: '15px', fontWeight: 500 }}
          >
            <Sparkles className="w-4 h-4" />
            Começar a criar
          </button>

          {/* Secondary CTA */}
          {onDownloadReceipt && (
            <button
              onClick={onDownloadReceipt}
              className="w-full h-11 bg-white text-[#030213] rounded-xl border border-[#E9EBEF] hover:bg-[#FAFAFA] transition-colors flex items-center justify-center gap-2"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              <Download className="w-4 h-4" />
              Baixar recibo PDF
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[#E9EBEF]">
          <p className="text-[#717182]" style={{ fontSize: '12px' }}>
            Enviamos os detalhes para{' '}
            <span className="text-[#030213]" style={{ fontWeight: 500 }}>
              {userEmail}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
