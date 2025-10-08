import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '../hooks/useCredits';
import { Coins, Sparkles, Clock, Calendar, TrendingUp } from 'lucide-react';

interface CreditsSidebarProps {
  userId: string;
}

export function CreditsSidebar({ userId }: CreditsSidebarProps) {
  const { credits, subscription, loading, error } = useCredits(userId);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">Erro ao carregar créditos</p>
      </div>
    );
  }

  const hasSubscription = subscription && subscription.status === 'active';
  const percentageUsed = hasSubscription && subscription ?
    ((credits || 0) / (credits || 1)) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-md p-6 border border-indigo-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Coins className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Créditos
        </h3>
      </div>

      {/* Badge do Plano */}
      {hasSubscription && subscription && (
        <div className="mb-4 flex items-center gap-2 bg-indigo-100 rounded-lg px-3 py-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">
            Plano {subscription.planId === 'pro' ? 'Pro' : subscription.planId === 'business' ? 'Business' : 'Starter'}
          </span>
        </div>
      )}

      {/* Contador Principal */}
      <div
        className="relative"
        onMouseEnter={() => setShowBreakdown(true)}
        onMouseLeave={() => setShowBreakdown(false)}
      >
        <div className="text-center mb-4 cursor-help">
          <div className="text-5xl font-bold text-indigo-600 mb-1">
            {credits || 0}
          </div>
          <p className="text-sm text-gray-600">créditos disponíveis</p>
        </div>

        {/* Tooltip/Breakdown */}
        {showBreakdown && (
          <div className="absolute z-10 w-full mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase">
              Detalhamento
            </h4>

            {hasSubscription && subscription && (
              <div className="mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Assinatura
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {credits} créditos
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Renova em{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            )}

            {!hasSubscription && (
              <div className="text-xs text-gray-500 text-center py-2">
                Compre uma assinatura ou pacote avulso
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barra de Progresso (se tiver assinatura) */}
      {hasSubscription && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Uso do período</span>
            <span>{Math.round(100 - percentageUsed)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${100 - percentageUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="space-y-2">
        {hasSubscription ? (
          <>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" />
              Comprar mais créditos
            </button>
            <button
              onClick={async () => {
                try {
                  const { createCustomerPortalSession } = useCredits(userId);
                  const url = await createCustomerPortalSession();
                  window.location.href = url;
                } catch (error) {
                  console.error('Error opening portal:', error);
                }
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm border border-gray-300"
            >
              Gerenciar assinatura
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium py-3 px-4 rounded-lg transition-all text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Fazer upgrade
          </button>
        )}
      </div>

      {/* Informação de Créditos Baixos */}
      {credits !== null && credits < 10 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Seus créditos estão acabando. Considere fazer upgrade ou comprar um pacote.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
