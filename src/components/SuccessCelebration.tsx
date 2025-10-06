import { useEffect, useState } from 'react';
import { Sparkles, Award, Wand2, Users, Palette } from 'lucide-react';
import { Button } from './ui/button';

interface SuccessCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  onViewImage: () => void;
  onCreateAnother: () => void;
  creditsRemaining?: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
  duration: number;
}

const CONFETTI_COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

export default function SuccessCelebration({
  isOpen,
  onClose,
  onViewImage,
  onCreateAnother,
  creditsRemaining = 4
}: SuccessCelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Generate confetti pieces
  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    // Generate 50 confetti pieces
    const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // % from left
      y: -10, // Start above viewport
      rotation: Math.random() * 360,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.5, // 0-500ms delay
      duration: 2 + Math.random() * 1 // 2-3s duration
    }));

    setConfetti(pieces);

    // Auto-dismiss after 15 seconds
    const autoDismissTimer = setTimeout(() => {
      handleClose();
    }, 15000);

    return () => {
      clearTimeout(autoDismissTimer);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] animate-fadeIn"
        onClick={handleClose}
      />

      {/* Confetti */}
      <div className="fixed inset-0 z-[3001] pointer-events-none overflow-hidden">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              animation: `confettiFall ${piece.duration}s ease-in forwards`,
              animationDelay: `${piece.delay}s`
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3002] w-full max-w-[520px] mx-4 ${
          isVisible ? 'animate-celebrationIn' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-white rounded-3xl p-10 text-center"
          style={{
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center animate-bounce"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                animationDuration: '800ms',
                animationIterationCount: '1',
                animationFillMode: 'forwards'
              }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2
            className="text-[#030213] mb-3"
            style={{ fontSize: '28px', fontWeight: 700 }}
          >
            Parabéns! 🎉
          </h2>

          {/* Description */}
          <p
            className="text-[#717182] mb-8"
            style={{ fontSize: '16px', lineHeight: 1.6 }}
          >
            Você criou sua primeira transformação com sucesso!
          </p>

          {/* Achievement Badge */}
          <div
            className="p-5 rounded-xl mb-8"
            style={{
              background: 'linear-gradient(135deg, #F3F3F5 0%, #E9EBEF 100%)'
            }}
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="flex flex-col items-center">
                <Award className="w-8 h-8 text-[#F59E0B] mb-2" />
                <p
                  className="text-[#252525]"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                >
                  Primeira criação
                </p>
              </div>
            </div>
            <p
              className="text-[#717182] mt-2"
              style={{ fontSize: '13px' }}
            >
              {creditsRemaining} créditos restantes
            </p>
          </div>

          {/* Next Steps */}
          <div className="text-left mb-8">
            <h3
              className="text-[#252525] mb-4"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Continue explorando
            </h3>

            <div className="space-y-3">
              {/* Suggestion 1 */}
              <button
                onClick={onCreateAnother}
                className="w-full p-3 px-4 bg-[#FAFAFA] border border-[#E9EBEF] rounded-lg flex items-center gap-3 hover:bg-white hover:border-[#CBCED4] transition-all text-left"
              >
                <Wand2 className="w-5 h-5 text-[#030213] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[#030213]"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    Gerar mais variações
                  </p>
                  <p
                    className="text-[#717182] truncate"
                    style={{ fontSize: '11px' }}
                  >
                    Crie até 3 versões diferentes
                  </p>
                </div>
              </button>

              {/* Suggestion 2 */}
              <button
                onClick={() => {
                  handleClose();
                  // TODO: Navigate to team invite
                }}
                className="w-full p-3 px-4 bg-[#FAFAFA] border border-[#E9EBEF] rounded-lg flex items-center gap-3 hover:bg-white hover:border-[#CBCED4] transition-all text-left"
              >
                <Users className="w-5 h-5 text-[#030213] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[#030213]"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    Convidar equipe
                  </p>
                  <p
                    className="text-[#717182] truncate"
                    style={{ fontSize: '11px' }}
                  >
                    Colabore com outros profissionais
                  </p>
                </div>
              </button>

              {/* Suggestion 3 */}
              <button
                onClick={() => {
                  handleClose();
                  // TODO: Navigate to styles gallery
                }}
                className="w-full p-3 px-4 bg-[#FAFAFA] border border-[#E9EBEF] rounded-lg flex items-center gap-3 hover:bg-white hover:border-[#CBCED4] transition-all text-left"
              >
                <Palette className="w-5 h-5 text-[#030213] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[#030213]"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    Explorar estilos
                  </p>
                  <p
                    className="text-[#717182] truncate"
                    style={{ fontSize: '11px' }}
                  >
                    Descubra todos os estilos disponíveis
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Button
              onClick={onViewImage}
              className="flex-[3] h-12"
              style={{ fontSize: '15px' }}
            >
              Ver minha imagem
            </Button>
            <Button
              onClick={onCreateAnother}
              variant="outline"
              className="flex-[2] h-12"
              style={{ fontSize: '15px' }}
            >
              Criar outra
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
