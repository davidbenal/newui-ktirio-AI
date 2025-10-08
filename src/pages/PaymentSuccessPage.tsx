import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useCredits } from '../hooks/useCredits';

interface PaymentSuccessPageProps {
  userId: string;
}

export default function PaymentSuccessPage({ userId }: PaymentSuccessPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { credits, refreshCredits } = useCredits(userId);
  const [isVerifying, setIsVerifying] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Aguardar alguns segundos para o webhook processar
    const timer = setTimeout(async () => {
      await refreshCredits();
      setIsVerifying(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [refreshCredits]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div
          className="bg-white rounded-3xl p-12 text-center"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center animate-bounce"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[#030213] mb-4" style={{ fontSize: '36px', fontWeight: 700 }}>
            Pagamento Confirmado!
          </h1>

          {/* Description */}
          <p className="text-[#717182] mb-8 text-lg">
            Seu pagamento foi processado com sucesso e seus créditos foram adicionados à sua conta.
          </p>

          {/* Credits Display */}
          {isVerifying ? (
            <div className="mb-8 flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
              <span className="text-[#717182]" style={{ fontSize: '16px' }}>
                Verificando créditos...
              </span>
            </div>
          ) : (
            <div
              className="mb-8 px-8 py-6 mx-auto max-w-fit rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-white" fill="white" />
                <span className="text-white" style={{ fontSize: '16px', fontWeight: 500 }}>
                  Saldo Atual
                </span>
              </div>
              <div className="text-white" style={{ fontSize: '48px', fontWeight: 700 }}>
                {credits}
              </div>
              <div className="text-white opacity-90" style={{ fontSize: '14px' }}>
                créditos disponíveis
              </div>
            </div>
          )}

          {/* Session ID (for debugging) */}
          {sessionId && (
            <div className="mb-8 text-xs text-gray-400">
              ID da sessão: {sessionId}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 h-14 bg-[#030213] text-white rounded-xl hover:bg-[#252525] transition-all flex items-center justify-center gap-2"
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              Ir para Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/create')}
              className="px-8 h-14 bg-white text-[#030213] rounded-xl hover:bg-gray-50 transition-all"
              style={{
                border: '2px solid #E9EBEF',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              Criar Modelo 3D
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-[#717182] text-sm">
              Você receberá um email de confirmação com os detalhes da sua compra.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Tem alguma dúvida?{' '}
            <a href="mailto:support@ktirio.ai" className="text-blue-600 hover:underline">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
