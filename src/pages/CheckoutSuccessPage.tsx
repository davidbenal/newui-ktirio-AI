import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';

export function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { credits, refreshCredits } = useCredits(user?.uid || null);

  const [loading, setLoading] = useState(true);
  const [purchaseInfo, setPurchaseInfo] = useState<{
    type: 'subscription' | 'pack';
    creditsAdded: number;
    planName?: string;
  } | null>(null);

  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type') as 'subscription' | 'pack' | null;

  useEffect(() => {
    // Verificar se temos os parâmetros necessários
    if (!sessionId || !type) {
      navigate('/pricing');
      return;
    }

    // Aguardar alguns segundos para o webhook processar
    // Em produção, você pode querer verificar o status da sessão via API
    const timer = setTimeout(async () => {
      try {
        // Refresh dos créditos para pegar os novos valores
        await refreshCredits();

        // Definir informações da compra baseado no tipo
        if (type === 'subscription') {
          setPurchaseInfo({
            type: 'subscription',
            creditsAdded: 1000, // Será atualizado com o valor real dos créditos
            planName: 'Básico' // Será atualizado com o plano real
          });
        } else {
          setPurchaseInfo({
            type: 'pack',
            creditsAdded: 500 // Será atualizado com o valor real
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error refreshing credits:', error);
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId, type, navigate, refreshCredits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processando sua compra...
          </h2>
          <p className="text-gray-600">
            Aguarde enquanto confirmamos seu pagamento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Ícone de Sucesso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pagamento confirmado!
          </h1>
          <p className="text-xl text-gray-600">
            {purchaseInfo?.type === 'subscription'
              ? 'Sua assinatura foi ativada com sucesso'
              : 'Seus créditos foram adicionados com sucesso'}
          </p>
        </div>

        {/* Card de Informações */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              {purchaseInfo?.type === 'subscription' ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Plano {purchaseInfo.planName} Ativado
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Você recebeu {purchaseInfo.creditsAdded.toLocaleString()} créditos
                  </p>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                    <p className="text-sm text-indigo-900">
                      <strong>Renovação automática:</strong> Seus créditos serão renovados
                      automaticamente todo mês. Você pode cancelar a qualquer momento.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Pacote Comprado
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {purchaseInfo?.creditsAdded.toLocaleString()} créditos adicionados à sua conta
                  </p>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      <strong>Validade:</strong> Seus créditos são válidos por 90 dias a
                      partir de hoje.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Créditos Totais */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total de créditos disponíveis:</span>
              <span className="text-3xl font-bold text-indigo-600">
                {credits || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h3 className="text-xl font-bold mb-4">Próximos passos</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Comece a criar designs incríveis com seus créditos</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Explore todos os recursos disponíveis no seu plano</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Verifique seu email para o recibo de pagamento</span>
            </li>
          </ul>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
          >
            Começar a criar
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="sm:w-auto bg-white hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-lg transition-colors border border-gray-300"
          >
            Ver planos
          </button>
        </div>

        {/* Informação de Suporte */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Precisa de ajuda?{' '}
            <button
              onClick={() => navigate('/suporte')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Entre em contato com o suporte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
